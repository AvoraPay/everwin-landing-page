/**
 * Generates the prop account pool: identifier-based accounts to be pre-created
 * on the broker, stocked with balance, and assigned to buyers at purchase time.
 *
 * Usage:
 *   node scripts/generate-prop-pool.mjs                 # 20 accounts per plan
 *   node scripts/generate-prop-pool.mjs --per-plan=10
 *   node scripts/generate-prop-pool.mjs --only=brl      # brl | usd | all
 *   node scripts/generate-prop-pool.mjs --start=21      # continue an existing pool
 *
 * Writes two files to scripts/out/:
 *   prop-pool-import.csv       → upload to the broker admin (import by CSV)
 *   prop-pool-credentials.csv  → email + password + plan; load into our DB, never share
 *
 * The broker CSV importer has no password column, so passwords are set in a
 * second pass via POST /api/admin/users/:id/reset-password using a fresh token.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "out");
const DOMAIN = process.env.PROP_ACCOUNT_DOMAIN ?? "everwin.capital";

/**
 * Mirrors the `plans` table in production.
 * `code` is the account identifier prefix — plan readable straight from the
 * e-mail address. USD plans carry a `u` so they never collide with BRL.
 */
const PLANS = [
  { id: "plan_brl_25k", code: "ewp25k", accountSize: 25000, currency: "BRL" },
  { id: "plan_brl_50k", code: "ewp50k", accountSize: 50000, currency: "BRL" },
  { id: "plan_brl_100k", code: "ewp100k", accountSize: 100000, currency: "BRL" },
  { id: "plan_brl_150k", code: "ewp150k", accountSize: 150000, currency: "BRL" },
  { id: "plan_usd_12k", code: "ewpu12k", accountSize: 12500, currency: "USD" },
  { id: "plan_usd_25k", code: "ewpu25k", accountSize: 25000, currency: "USD" },
  { id: "plan_usd_50k", code: "ewpu50k", accountSize: 50000, currency: "USD" },
  { id: "plan_usd_75k", code: "ewpu75k", accountSize: 75000, currency: "USD" },
];

function arg(name, fallback) {
  const hit = process.argv.find((item) => item.startsWith(`--${name}=`));
  return hit ? hit.split("=")[1] : fallback;
}

const perPlan = Number(arg("per-plan", "20"));
const start = Number(arg("start", "1"));
const only = String(arg("only", "all")).toLowerCase();

if (!Number.isInteger(perPlan) || perPlan < 1) throw new Error("--per-plan must be a positive integer");
if (!Number.isInteger(start) || start < 1) throw new Error("--start must be a positive integer");

/**
 * Password with mixed classes and no ambiguous characters, so it survives being
 * read off a screen or pasted from an email.
 */
function generatePassword(length = 16) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const symbols = "!@#$%&*";
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length - 2; i += 1) out += alphabet[bytes[i] % alphabet.length];
  out += symbols[bytes[length - 2] % symbols.length];
  out += String(bytes[length - 1] % 10);
  return out;
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(headers, rows) {
  return [headers.join(","), ...rows.map((row) => headers.map((h) => csvEscape(row[h])).join(","))].join("\n") + "\n";
}

const selected = PLANS.filter((plan) =>
  only === "all" ? true : only === "brl" ? plan.currency === "BRL" : plan.currency === "USD",
);


if (selected.length === 0) throw new Error(`--only=${only} matched no plans (use brl, usd or all)`);

const importRows = [];
const credentialRows = [];

for (const plan of selected) {
  for (let i = 0; i < perPlan; i += 1) {
    const seq = String(start + i).padStart(3, "0");
    const username = `${plan.code}${seq}`;
    const identifier = username.toUpperCase();
    const email = `${username}@${DOMAIN}`;
    const password = generatePassword();

    // Columns accepted by the broker importer. `name` is required, so the
    // identifier doubles as the account name — no personal data in the pool.
    importRows.push({
      email,
      name: identifier,
      active: "true",
      banned: "false",
      influencer: "true",
      totalDepositAmount: plan.accountSize,
    });

    credentialRows.push({
      identifier,
      username,
      email,
      password,
      planId: plan.id,
      accountSize: plan.accountSize,
      currency: plan.currency,
    });
  }
}

mkdirSync(OUT_DIR, { recursive: true });

writeFileSync(
  path.join(OUT_DIR, "prop-pool-import.csv"),
  toCsv(["email", "name", "active", "banned", "influencer", "totalDepositAmount"], importRows),
);

writeFileSync(
  path.join(OUT_DIR, "prop-pool-credentials.csv"),
  toCsv(["identifier", "username", "email", "password", "planId", "accountSize", "currency"], credentialRows),
);

const byCurrency = selected.reduce((acc, plan) => {
  acc[plan.currency] = (acc[plan.currency] ?? 0) + plan.accountSize * perPlan;
  return acc;
}, {});

console.log(`Contas geradas: ${importRows.length} (${perPlan} por plano × ${selected.length} planos)`);
console.log(`Sequência: ${String(start).padStart(3, "0")} a ${String(start + perPlan - 1).padStart(3, "0")}`);
for (const [currency, total] of Object.entries(byCurrency)) {
  console.log(`Saldo total estocado em ${currency}: ${total.toLocaleString("pt-BR")}`);
}
console.log(`\nArquivos em ${OUT_DIR}:`);
console.log("  prop-pool-import.csv       → subir no admin da corretora");
console.log("  prop-pool-credentials.csv  → senhas, NÃO compartilhar");
