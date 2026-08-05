/**
 * Reconciles the broker balance of every pool account with its plan.
 *
 * The broker operates in USD only, but the CSV import credited BRL plans with
 * their face value in dollars (BRL 25.000 became USD 25.000). This converts the
 * BRL plans at a fixed rate and adds/removes the difference so every account
 * ends up holding exactly what its plan is worth.
 *
 * Reads the live balance per account first — it never assumes what was credited.
 *
 * Usage:
 *   node scripts/fix-pool-balances.mjs --token="eyJ..." --rate=5.37 --dry-run
 *   node scripts/fix-pool-balances.mjs --token="eyJ..." --rate=5.37 --limit=2
 *   node scripts/fix-pool-balances.mjs --token="eyJ..." --rate=5.37
 *
 * Writes scripts/out/pool-balance-report.csv with the before/after of each account.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "out");
const CREDENTIALS_FILE = path.join(OUT_DIR, "prop-pool-credentials.csv");
const REPORT_FILE = path.join(OUT_DIR, "pool-balance-report.csv");

const API_BASE = process.env.EVERWIN_API_BASE ?? "https://api.everwin.capital";
const DELAY_MS = Number(process.env.PROP_POOL_DELAY_MS ?? 350);
/** Shown to the trader in their statement — must read as prop capital, not a deposit. */
const REASON_CREDIT = "Saldo da conta de avaliacao Everwin Prop Trading. Capital de teste - saque nao permitido.";
const REASON_ADJUST = "Ajuste do saldo da conta de avaliacao Everwin Prop Trading.";
/** Ignore rounding dust so we never fire a call for a few cents. */
const TOLERANCE = 0.01;

function arg(name, fallback) {
  const hit = process.argv.find((item) => item.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : fallback;
}

const token = arg("token", process.env.EVERWIN_ADMIN_BEARER ?? "");
const rate = Number(arg("rate", "5.37"));
const dryRun = process.argv.includes("--dry-run");
const limit = Number(arg("limit", "0"));

if (!token) {
  console.error('Faltou o token. Use --token="eyJ..."');
  process.exit(1);
}
if (!Number.isFinite(rate) || rate <= 0) {
  console.error("--rate precisa ser um numero positivo (ex: 5.37)");
  process.exit(1);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function api(method, endpoint, body) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data?.message ?? `HTTP ${res.status}`);
    error.status = res.status;
    error.payload = data;
    throw error;
  }
  return data;
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    return Object.fromEntries(headers.map((h, i) => [h, cells[i]]));
  });
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

if (!existsSync(CREDENTIALS_FILE)) {
  console.error(`Não achei ${CREDENTIALS_FILE}`);
  process.exit(1);
}

const pool = parseCsv(readFileSync(CREDENTIALS_FILE, "utf8"));

console.log(`Lendo usuários da corretora (${API_BASE})...`);
const usersResponse = await api("GET", "/api/admin/users?page=1&limit=2000");
const users = usersResponse.users ?? usersResponse.data ?? [];
const byEmail = new Map(users.map((user) => [String(user.email).toLowerCase(), user]));
console.log(`Usuários lidos: ${users.length}`);

/** Real (non-demo) USD balance currently held by the account. */
function realUsdBalance(user) {
  return (user.accounts ?? [])
    .filter((account) => !account.isDemo && account.currency === "USD")
    .reduce((sum, account) => sum + Number(account.balance ?? 0), 0);
}

const plan = [];
for (const row of pool) {
  const user = byEmail.get(row.email.toLowerCase());
  if (!user) {
    plan.push({ ...row, status: "SEM_USUARIO", current: 0, target: 0, delta: 0 });
    continue;
  }

  const size = Number(row.accountSize);
  // USD plans are already denominated in dollars; BRL plans convert at --rate.
  const target = row.currency === "USD" ? size : Math.round((size / rate) * 100) / 100;
  const current = realUsdBalance(user);
  const delta = Math.round((target - current) * 100) / 100;

  plan.push({
    ...row,
    userId: user.id,
    current,
    target,
    delta,
    status: Math.abs(delta) < TOLERANCE ? "OK" : delta > 0 ? "ADICIONAR" : "REMOVER",
  });
}

const actionable = plan.filter((item) => item.status === "ADICIONAR" || item.status === "REMOVER");
const work = limit > 0 ? actionable.slice(0, limit) : actionable;

console.log(`\nCâmbio: ${rate} | Tolerância: ${TOLERANCE}`);
console.log(`Já corretas : ${plan.filter((p) => p.status === "OK").length}`);
console.log(`A ajustar   : ${actionable.length}`);
console.log(`Sem usuário : ${plan.filter((p) => p.status === "SEM_USUARIO").length}`);

const byPlan = new Map();
for (const item of actionable) {
  const entry = byPlan.get(item.planId) ?? { count: 0, current: 0, target: 0 };
  entry.count += 1;
  entry.current = item.current;
  entry.target = item.target;
  byPlan.set(item.planId, entry);
}
console.log("\nPor plano:");
for (const [planId, entry] of byPlan) {
  console.log(`  ${planId.padEnd(14)} ${entry.count} contas | USD ${entry.current} -> USD ${entry.target}`);
}

if (dryRun) {
  console.log("\nDRY RUN — nada foi alterado.");
  process.exit(0);
}

console.log(`\nExecutando ${work.length} ajustes...\n`);

const results = [];
for (const [index, item] of work.entries()) {
  const label = `[${index + 1}/${work.length}] ${item.identifier}`;
  const amount = Math.abs(item.delta);
  const endpoint = item.delta > 0 ? "balance/add" : "balance/remove";
  const reason = item.delta > 0 && item.current === 0 ? REASON_CREDIT : REASON_ADJUST;

  try {
    await api("POST", `/api/admin/users/${item.userId}/${endpoint}`, {
      currency: "USD",
      amount,
      reason,
    });
    results.push({ ...item, applied: item.delta, error: "" });
    console.log(`${label} ${item.status} USD ${amount} → saldo ${item.target}`);
  } catch (error) {
    results.push({ ...item, applied: 0, error: error.message });
    console.error(`${label} FALHOU: ${error.message}`);
    if (error.status === 401) {
      console.error("\nToken expirado. Pegue outro e rode de novo — o script recalcula pelo saldo real.");
      break;
    }
  }

  await sleep(DELAY_MS);
}

const headers = ["identifier", "email", "planId", "accountSize", "currency", "current", "target", "applied", "error"];
writeFileSync(
  REPORT_FILE,
  [headers.join(","), ...results.map((r) => headers.map((h) => csvEscape(r[h])).join(","))].join("\n") + "\n",
);

const failed = results.filter((r) => r.error).length;
console.log(`\nAjustadas: ${results.length - failed} | falhas: ${failed}`);
console.log(`Relatório: ${REPORT_FILE}`);
