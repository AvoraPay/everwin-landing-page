/**
 * Creates the prop account pool on the broker, with the password set at creation.
 *
 * The broker CSV importer has no password column, so importing by CSV always
 * leaves accounts without a usable password. POST /api/auth/register does take
 * one — so the pool is created through the API instead, in a single batch run.
 *
 * Per account:
 *   1. POST /api/auth/register                   → creates user with the password
 *   2. POST /api/admin/users/:id/verify-email    → skips e-mail confirmation
 *   3. POST /api/admin/users/:id/marketing       → marks as program account
 *   4. POST /api/admin/users/:id/balance/add     → credits the plan capital
 *
 * The admin token lives ~24h, so run this with a token you just copied from the
 * broker admin panel (DevTools → any request → Authorization header).
 *
 * Usage:
 *   node scripts/provision-prop-pool.mjs --token="eyJ..." --dry-run
 *   node scripts/provision-prop-pool.mjs --token="eyJ..."
 *   node scripts/provision-prop-pool.mjs --token="eyJ..." --only=ewp25k
 *
 * Reads  scripts/out/prop-pool-credentials.csv
 * Writes scripts/out/prop-pool-provisioned.csv  (adds platformUserId)
 *        scripts/out/prop-pool-failed.csv
 *
 * Safe to re-run: accounts already present in prop-pool-provisioned.csv are skipped.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "out");
const CREDENTIALS_FILE = path.join(OUT_DIR, "prop-pool-credentials.csv");
const PROVISIONED_FILE = path.join(OUT_DIR, "prop-pool-provisioned.csv");
const FAILED_FILE = path.join(OUT_DIR, "prop-pool-failed.csv");

const API_BASE = process.env.EVERWIN_API_BASE ?? "https://api.everwin.capital";
const COUNTRY = process.env.PROP_POOL_COUNTRY ?? "Brazil";
/** Pause between accounts so the batch never trips the broker rate limiter. */
const DELAY_MS = Number(process.env.PROP_POOL_DELAY_MS ?? 400);

function arg(name, fallback) {
  const hit = process.argv.find((item) => item.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : fallback;
}

const token = arg("token", process.env.EVERWIN_ADMIN_BEARER ?? "");
const dryRun = process.argv.includes("--dry-run");
const only = arg("only", "");
const limit = Number(arg("limit", "0"));

if (!token && !dryRun) {
  console.error("Faltou o token. Use --token=\"eyJ...\" (copie do painel da corretora, vale ~24h).");
  process.exit(1);
}

function parseCsv(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    // Fields here never contain commas (codes, e-mails, generated passwords).
    const cells = line.split(",");
    return Object.fromEntries(headers.map((h, i) => [h, cells[i]]));
  });
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(headers, rows) {
  return [headers.join(","), ...rows.map((row) => headers.map((h) => csvEscape(row[h])).join(","))].join("\n") + "\n";
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function api(method, endpoint, body) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const reason = data?.message ?? data?.error ?? `HTTP ${res.status}`;
    const error = new Error(`${method} ${endpoint} → ${reason}`);
    error.status = res.status;
    throw error;
  }
  return data;
}

if (!existsSync(CREDENTIALS_FILE)) {
  console.error(`Não achei ${CREDENTIALS_FILE}. Rode antes: node scripts/generate-prop-pool.mjs`);
  process.exit(1);
}

const accounts = parseCsv(readFileSync(CREDENTIALS_FILE, "utf8"));

const done = existsSync(PROVISIONED_FILE) ? parseCsv(readFileSync(PROVISIONED_FILE, "utf8")) : [];
const doneEmails = new Set(done.map((row) => row.email));

let pending = accounts.filter((row) => !doneEmails.has(row.email));
if (only) pending = pending.filter((row) => row.username.startsWith(only));
if (limit > 0) pending = pending.slice(0, limit);

console.log(`Total no pool: ${accounts.length} | já provisionadas: ${doneEmails.size} | nesta execução: ${pending.length}`);
if (dryRun) {
  console.log(`\nDRY RUN — nada será criado. API alvo: ${API_BASE}\n`);
  for (const row of pending.slice(0, 5)) {
    console.log(`  ${row.identifier}  ${row.email}  saldo ${row.accountSize} ${row.currency}`);
  }
  if (pending.length > 5) console.log(`  ... e mais ${pending.length - 5}`);
  process.exit(0);
}

const provisioned = [...done];
const failed = [];

for (const [index, row] of pending.entries()) {
  const label = `[${index + 1}/${pending.length}] ${row.identifier}`;
  try {
    const created = await api("POST", "/api/auth/register", {
      email: row.email,
      username: row.username,
      password: row.password,
      firstName: row.identifier,
      lastName: "PROP",
      country: COUNTRY,
    });

    const platformUserId = created.user?.id ?? created.id;
    if (!platformUserId) throw new Error("register não retornou o id do usuário");

    // Non-fatal: the account already works for trading without these flags.
    for (const [step, call] of [
      ["verify-email", () => api("POST", `/api/admin/users/${platformUserId}/verify-email`, { reason: "Conta de pool prop" })],
      ["marketing", () => api("POST", `/api/admin/users/${platformUserId}/marketing`, {})],
    ]) {
      try {
        await call();
      } catch (stepErr) {
        console.warn(`${label} aviso em ${step}: ${stepErr.message}`);
      }
    }

    await api("POST", `/api/admin/users/${platformUserId}/balance/add`, {
      currency: row.currency,
      amount: Number(row.accountSize),
      reason: "Conta de prop trading - SAQUE NAO PERMITIDO",
    });

    provisioned.push({ ...row, platformUserId });
    console.log(`${label} ok → ${platformUserId}`);
  } catch (err) {
    failed.push({ ...row, error: err.message });
    console.error(`${label} FALHOU: ${err.message}`);

    if (err.status === 401) {
      console.error("\nToken inválido ou expirado. Pegue um novo no painel e rode de novo — o que já foi criado é pulado.");
      break;
    }
  }

  // Persist after every account so an interrupted run never loses work.
  writeFileSync(
    PROVISIONED_FILE,
    toCsv(["identifier", "username", "email", "password", "planId", "accountSize", "currency", "platformUserId"], provisioned),
  );
  await sleep(DELAY_MS);
}

if (failed.length > 0) {
  writeFileSync(
    FAILED_FILE,
    toCsv(["identifier", "username", "email", "password", "planId", "accountSize", "currency", "error"], failed),
  );
}

console.log(`\nProvisionadas: ${provisioned.length} | falhas nesta execução: ${failed.length}`);
console.log(`  ${PROVISIONED_FILE}`);
if (failed.length > 0) console.log(`  ${FAILED_FILE}`);
