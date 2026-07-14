import { Pool } from "pg";
import { config } from "./config.js";
import { decryptSecret, encryptSecret, hashPassword } from "./security.js";
import { addDays, addHours, buildPortalEmail, createShortCode, normalizeEmail, nowISO, uid } from "./utils.js";

let pool;

const ACCOUNT_STATUSES = [
  "pending_payment",
  "awaiting_account_creation",
  "active",
  "paused",
  "passed",
  "failed_drawdown",
  "failed_timeout",
  "cooldown",
  "approved_for_funded",
  "rejected",
];

async function exec(sql) {
  await pool.query(sql);
}

async function createSchema() {
  await exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL CHECK (role IN ('admin','client')),
      status TEXT NOT NULL CHECK (status IN ('active','blocked','invited')),
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      primary_email TEXT,
      primary_email_normalized TEXT,
      password_hash TEXT NOT NULL,
      source_application_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_login_at TEXT
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_primary_email
      ON users (primary_email_normalized)
      WHERE primary_email_normalized IS NOT NULL;

    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      account_size INTEGER NOT NULL,
      fee INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'BRL',
      profit_target_phase1_pct REAL NOT NULL,
      profit_target_phase2_pct REAL NOT NULL,
      max_drawdown_pct REAL NOT NULL,
      daily_loss_limit_pct REAL NOT NULL,
      min_trading_days INTEGER NOT NULL,
      duration_days INTEGER NOT NULL,
      is_public BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      submission_code TEXT NOT NULL UNIQUE,
      plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
      portal_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      full_name TEXT NOT NULL,
      normalized_name TEXT NOT NULL,
      email TEXT NOT NULL,
      normalized_email TEXT NOT NULL,
      document_type TEXT,
      cpf TEXT,
      cpf_hash TEXT,
      phone TEXT NOT NULL,
      country TEXT NOT NULL,
      city TEXT NOT NULL,
      occupation TEXT NOT NULL,
      experience TEXT NOT NULL,
      session TEXT NOT NULL,
      risk_per_day TEXT NOT NULL,
      motivation TEXT NOT NULL,
      consistency TEXT NOT NULL,
      agree_rules BOOLEAN NOT NULL DEFAULT FALSE,
      agree_no_guarantee BOOLEAN NOT NULL DEFAULT FALSE,
      agree_liability BOOLEAN NOT NULL DEFAULT FALSE,
      locale TEXT NOT NULL DEFAULT 'pt',
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'BRL',
      status TEXT NOT NULL CHECK (
        status IN (
          'submitted',
          'payment_pending',
          'payment_overdue',
          'payment_approved',
          'under_review',
          'access_ready',
          'account_ready',
          'rejected',
          'cancelled'
        )
      ),
      payment_status TEXT NOT NULL CHECK (
        payment_status IN ('pending','approved','overdue','failed','cancelled')
      ),
      payment_due_at TEXT,
      submitted_at TEXT NOT NULL,
      paid_at TEXT,
      reviewed_at TEXT,
      admin_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(normalized_email);
    CREATE INDEX IF NOT EXISTS idx_applications_cpf_hash ON applications(cpf_hash);
    CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
      payment_code TEXT NOT NULL UNIQUE,
      provider TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pending','approved','overdue','failed','cancelled')),
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL,
      checkout_url TEXT,
      external_reference TEXT,
      due_at TEXT,
      approved_at TEXT,
      reminder_sent_at TEXT,
      metadata TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      application_id TEXT REFERENCES applications(id) ON DELETE SET NULL,
      plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
      account_id TEXT NOT NULL UNIQUE,
      platform_login TEXT NOT NULL,
      platform_password_enc TEXT NOT NULL,
      phase INTEGER NOT NULL CHECK (phase IN (1,2)),
      status TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      cooldown_until TEXT,
      initial_balance REAL NOT NULL,
      balance REAL NOT NULL,
      today_pnl REAL NOT NULL,
      days_traded INTEGER NOT NULL,
      max_drawdown_hit_pct REAL NOT NULL,
      notes TEXT,
      sync_status TEXT NOT NULL DEFAULT 'pending',
      last_synced_at TEXT,
      updated_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
    CREATE INDEX IF NOT EXISTS idx_accounts_status ON accounts(status);
    CREATE INDEX IF NOT EXISTS idx_accounts_application_id ON accounts(application_id);

    CREATE TABLE IF NOT EXISTS performance_points (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      pnl REAL NOT NULL,
      balance REAL NOT NULL,
      phase INTEGER NOT NULL,
      breached_daily_limit BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TEXT NOT NULL,
      UNIQUE (account_id, date)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor_user_id TEXT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      payload TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      revoked_at TEXT,
      user_agent TEXT,
      ip TEXT
    );

    CREATE TABLE IF NOT EXISTS password_otps (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      requested_for TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      consumed_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS communication_logs (
      id TEXT PRIMARY KEY,
      application_id TEXT REFERENCES applications(id) ON DELETE SET NULL,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      kind TEXT NOT NULL,
      recipient TEXT NOT NULL,
      subject TEXT NOT NULL,
      status TEXT NOT NULL,
      provider_message_id TEXT,
      payload TEXT,
      created_at TEXT NOT NULL,
      sent_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sync_runs (
      id TEXT PRIMARY KEY,
      trigger_type TEXT NOT NULL,
      status TEXT NOT NULL,
      notes TEXT,
      account_count INTEGER NOT NULL DEFAULT 0,
      started_at TEXT NOT NULL,
      finished_at TEXT
    );
  `);

  await exec(`
    ALTER TABLE applications ADD COLUMN IF NOT EXISTS document_type TEXT;
  `);

  await exec(`
    ALTER TABLE accounts ADD COLUMN IF NOT EXISTS broker_name TEXT;
  `);

  await exec(`
    ALTER TABLE accounts ADD COLUMN IF NOT EXISTS platform_user_id TEXT;
  `);

  await exec(`
    ALTER TABLE accounts ADD COLUMN IF NOT EXISTS platform_email TEXT;
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS trade_events (
      id TEXT PRIMARY KEY,
      platform_user_id TEXT NOT NULL,
      prop_account_id TEXT,
      event_type TEXT NOT NULL,
      payload TEXT NOT NULL,
      flagged INTEGER NOT NULL DEFAULT 0,
      flag_reason TEXT,
      created_at TEXT NOT NULL
    );
  `);
}

async function seedUsers() {
  const existing = await one("SELECT id FROM users WHERE email = $1", ["admin@everwin.trade"]);
  if (existing) return;

  const adminPassword = process.env.PROP_ADMIN_DEFAULT_PASSWORD;
  if (!adminPassword && process.env.NODE_ENV === "production") {
    console.warn("[Seed] Skipping admin user seed — PROP_ADMIN_DEFAULT_PASSWORD not set in production");
    return;
  }

  const now = nowISO();
  await query(
    `
      INSERT INTO users (
        id, role, status, name, email, primary_email, primary_email_normalized, password_hash, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    `,
    [
      "user_admin_webmaster",
      "admin",
      "active",
      "Webmaster Everwin",
      "admin@everwin.trade",
      "admin@everwin.trade",
      "admin@everwin.trade",
      await hashPassword(adminPassword ?? "Admin@2026"),
      now,
      now,
    ],
  );
}

async function seedPlans() {
  const countRow = await one("SELECT COUNT(*)::int AS count FROM plans");
  if ((countRow?.count ?? 0) > 0) return;

  const now = nowISO();
  const plans = [
    { id: "plan_brl_25k", name: "BRL 25K", account_size: 25000, fee: 497, currency: "BRL" },
    { id: "plan_brl_50k", name: "BRL 50K", account_size: 50000, fee: 874, currency: "BRL" },
    { id: "plan_brl_100k", name: "BRL 100K", account_size: 100000, fee: 1397, currency: "BRL" },
    { id: "plan_brl_150k", name: "BRL 150K", account_size: 150000, fee: 1497, currency: "BRL" },
    { id: "plan_usd_12k", name: "USD 12.5K", account_size: 12500, fee: 199, currency: "USD" },
    { id: "plan_usd_25k", name: "USD 25K", account_size: 25000, fee: 349, currency: "USD" },
    { id: "plan_usd_50k", name: "USD 50K", account_size: 50000, fee: 549, currency: "USD" },
    { id: "plan_usd_75k", name: "USD 75K", account_size: 75000, fee: 999, currency: "USD" },
  ];

  for (const plan of plans) {
    await query(
      `
        INSERT INTO plans (
          id, name, account_size, fee, currency,
          profit_target_phase1_pct, profit_target_phase2_pct,
          max_drawdown_pct, daily_loss_limit_pct,
          min_trading_days, duration_days,
          created_at, updated_at
        ) VALUES ($1,$2,$3,$4,$5,10,15,5,3,5,30,$6,$7)
      `,
      [plan.id, plan.name, plan.account_size, plan.fee, plan.currency, now, now],
    );
  }
}

async function seedDemoData() {
  const userRow = await one("SELECT id FROM users WHERE email = $1", ["cliente.demo@everwin.trade"]);
  if (userRow) return;

  const now = nowISO();
  const tempPassword = await hashPassword("client@123");
  const userId = uid("user");
  const applicationId = uid("application");
  const paymentId = uid("payment");
  const accountId = uid("account");
  const startDate = now;
  const endDate = addDays(now, 30);
  const submissionCode = createShortCode("sub_");
  const paymentCode = createShortCode("pay_");

  await query(
    `
      INSERT INTO users (
        id, role, status, name, email, primary_email, primary_email_normalized, password_hash, source_application_id, created_at, updated_at
      ) VALUES ($1,'client','active',$2,$3,$4,$5,$6,$7,$8,$9)
    `,
    [userId, "Cliente Demo", "cliente.demo@everwin.trade", "client@everwin.trade", "client@everwin.trade", tempPassword, applicationId, now, now],
  );

  await query(
    `
      INSERT INTO applications (
        id, submission_code, plan_id, portal_user_id,
        first_name, last_name, full_name, normalized_name,
        email, normalized_email, document_type, phone, country, city, occupation,
        experience, session, risk_per_day, motivation, consistency,
        agree_rules, agree_no_guarantee, agree_liability,
        locale, amount, currency, status, payment_status,
        payment_due_at, submitted_at, paid_at, reviewed_at,
        created_at, updated_at
      ) VALUES (
        $1,$2,'plan_brl_50k',$3,
        'Cliente','Demo','Cliente Demo','cliente demo',
        'client@everwin.trade','client@everwin.trade','CPF','+55 85 99999-0000','Brasil','Fortaleza','Trader',
        '2 a 5 anos','Abertura','0,5% a 1%','Perfil seed para validação do painel.','Disciplina baseada em drawdown diário.',
        TRUE,TRUE,TRUE,
        'pt',874,'BRL','account_ready','approved',
        $4,$5,$6,$7,
        $8,$9
      )
    `,
    [applicationId, submissionCode, userId, addHours(now, 1), now, now, now, now, now],
  );

  await query(
    `
      INSERT INTO payments (
        id, application_id, payment_code, provider, status, amount, currency, due_at, approved_at, created_at, updated_at
      ) VALUES ($1,$2,$3,'manual_link','approved',874,'BRL',$4,$5,$6,$7)
    `,
    [paymentId, applicationId, paymentCode, addHours(now, 1), now, now, now],
  );

  await query(
    `
      INSERT INTO accounts (
        id, user_id, application_id, plan_id, account_id, platform_login, platform_password_enc,
        phase, status, start_date, end_date, initial_balance, balance, today_pnl, days_traded,
        max_drawdown_hit_pct, notes, sync_status, last_synced_at, updated_at, created_at
      ) VALUES (
        $1,$2,$3,'plan_brl_50k','EVW-ACCT-50001','demo.login@broker.local',$4,
        1,'active',$5,$6,50000,51250,280,8,1.2,'Conta seed para testes do painel.','synced',$7,$8,$9
      )
    `,
    [accountId, userId, applicationId, encryptSecret("Demo@123"), startDate, endDate, now, now, now],
  );

  let balance = 50000;
  for (let i = 9; i >= 0; i -= 1) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const pnl = Math.round((Math.sin(i * 0.9) * 0.008 + 0.0025) * 50000);
    balance += pnl;
    await query(
      `
        INSERT INTO performance_points (id, account_id, date, pnl, balance, phase, breached_daily_limit, created_at)
        VALUES ($1,$2,$3,$4,$5,1,$6,$7)
        ON CONFLICT (account_id, date) DO NOTHING
      `,
      [uid("point"), accountId, date, pnl, balance, pnl <= -1500, now],
    );
  }
}

export async function initDatabase() {
  if (pool) return pool;

  const candidates = [config.databasePoolUrl, config.databaseUrl].filter(Boolean);
  let lastError = null;

  for (const connectionString of candidates) {
    const candidatePool = new Pool({
      connectionString,
      ssl: config.databaseSsl ? { rejectUnauthorized: false } : false,
      max: 10,
    });

    try {
      pool = candidatePool;
      await createSchema();
      await seedUsers();
      await seedPlans();
      // Demo data seeding disabled for production readiness
      // if (process.env.NODE_ENV !== "production") {
      //   await seedDemoData();
      // }
      return pool;
    } catch (error) {
      lastError = error;
      pool = undefined;
      await candidatePool.end().catch(() => undefined);
    }
  }

  throw lastError ?? new Error("No database connection string configured.");
}

export function getPool() {
  return pool;
}

export function getDb() {
  if (!pool) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return pool;
}

export async function query(text, params = []) {
  return getDb().query(text, params);
}

export async function one(text, params = []) {
  const result = await query(text, params);
  return result.rows[0] ?? null;
}

export async function many(text, params = []) {
  const result = await query(text, params);
  return result.rows;
}

export async function withTransaction(callback) {
  const client = await getDb().connect();
  try {
    await client.query("BEGIN");
    const result = await callback({
      query: (text, params = []) => client.query(text, params),
      one: async (text, params = []) => {
        const response = await client.query(text, params);
        return response.rows[0] ?? null;
      },
      many: async (text, params = []) => {
        const response = await client.query(text, params);
        return response.rows;
      },
    });
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export function mapPlanRow(row) {
  return {
    id: row.id,
    name: row.name,
    accountSize: Number(row.account_size),
    fee: Number(row.fee),
    currency: row.currency,
    profitTargetPhase1Pct: Number(row.profit_target_phase1_pct),
    profitTargetPhase2Pct: Number(row.profit_target_phase2_pct),
    maxDrawdownPct: Number(row.max_drawdown_pct),
    dailyLossLimitPct: Number(row.daily_loss_limit_pct),
    minTradingDays: Number(row.min_trading_days),
    durationDays: Number(row.duration_days),
  };
}

export function mapUserRow(row) {
  return {
    id: row.id,
    role: row.role,
    status: row.status === "invited" ? "active" : row.status,
    name: row.name,
    email: row.email,
    primaryEmail: row.primary_email ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapAccountRow(row, includeSecrets = false) {
  const status = ACCOUNT_STATUSES.includes(row.status) ? row.status : "pending_payment";

  return {
    id: row.id,
    userId: row.user_id,
    applicationId: row.application_id ?? undefined,
    planId: row.plan_id,
    accountId: row.account_id,
    platformLogin: row.platform_login,
    platformPassword: includeSecrets ? decryptSecret(row.platform_password_enc) : "••••••••",
    brokerName: row.broker_name ?? undefined,
    platformUserId: row.platform_user_id ?? undefined,
    platformEmail: row.platform_email ?? undefined,
    phase: Number(row.phase),
    status,
    startDate: row.start_date,
    endDate: row.end_date,
    cooldownUntil: row.cooldown_until ?? undefined,
    initialBalance: Number(row.initial_balance),
    balance: Number(row.balance),
    todayPnl: Number(row.today_pnl),
    daysTraded: Number(row.days_traded),
    maxDrawdownHitPct: Number(row.max_drawdown_hit_pct),
    notes: row.notes ?? undefined,
    syncStatus: row.sync_status ?? "pending",
    lastSyncedAt: row.last_synced_at ?? undefined,
    performanceSeries: [],
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  };
}

export function mapApplicationRow(row) {
  return {
    id: row.id,
    submissionCode: row.submission_code,
    portalUserId: row.portal_user_id ?? undefined,
    planId: row.plan_id,
    firstName: row.first_name,
    lastName: row.last_name,
    fullName: row.full_name,
    email: row.email,
    documentType: row.document_type ?? undefined,
    documentNumber: row.cpf ?? undefined,
    cpf: row.cpf ?? undefined,
    phone: row.phone,
    country: row.country,
    city: row.city,
    occupation: row.occupation,
    experience: row.experience,
    session: row.session,
    riskPerDay: row.risk_per_day,
    motivation: row.motivation,
    consistency: row.consistency,
    agreeRules: Boolean(row.agree_rules),
    agreeNoGuarantee: Boolean(row.agree_no_guarantee),
    agreeLiability: Boolean(row.agree_liability),
    locale: row.locale,
    amount: Number(row.amount),
    currency: row.currency,
    status: row.status,
    paymentStatus: row.payment_status,
    paymentDueAt: row.payment_due_at ?? undefined,
    submittedAt: row.submitted_at,
    paidAt: row.paid_at ?? undefined,
    reviewedAt: row.reviewed_at ?? undefined,
    adminNotes: row.admin_notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapPaymentRow(row) {
  return {
    id: row.id,
    applicationId: row.application_id,
    paymentCode: row.payment_code,
    provider: row.provider,
    status: row.status,
    amount: Number(row.amount),
    currency: row.currency,
    checkoutUrl: row.checkout_url ?? undefined,
    externalReference: row.external_reference ?? undefined,
    dueAt: row.due_at ?? undefined,
    approvedAt: row.approved_at ?? undefined,
    reminderSentAt: row.reminder_sent_at ?? undefined,
    metadata: row.metadata ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getPerformanceSeries(accountId) {
  const rows = await many(
    `
      SELECT date, pnl, balance, phase, breached_daily_limit
      FROM performance_points
      WHERE account_id = $1
      ORDER BY date ASC
    `,
    [accountId],
  );

  return rows.map((row) => ({
    date: row.date,
    pnl: Number(row.pnl),
    balance: Number(row.balance),
    phase: Number(row.phase),
    breachedDailyLimit: Boolean(row.breached_daily_limit),
  }));
}

export async function getAccounts({ userId, includeSecrets = false } = {}) {
  const rows = userId
    ? await many("SELECT * FROM accounts WHERE user_id = $1 ORDER BY updated_at DESC", [userId])
    : await many("SELECT * FROM accounts ORDER BY updated_at DESC");

  const accounts = [];
  for (const row of rows) {
    const account = mapAccountRow(row, includeSecrets);
    account.performanceSeries = await getPerformanceSeries(account.id);
    accounts.push(account);
  }
  return accounts;
}

export async function getPlans() {
  const rows = await many("SELECT * FROM plans ORDER BY account_size ASC");
  return rows.map(mapPlanRow);
}

export async function getUsers() {
  const rows = await many("SELECT * FROM users ORDER BY created_at DESC");
  return rows.map(mapUserRow);
}

export async function getUserById(userId) {
  const row = await one("SELECT * FROM users WHERE id = $1", [userId]);
  return row ? mapUserRow(row) : null;
}

export async function findUserByEmail(email) {
  const row = await one("SELECT * FROM users WHERE email = $1", [normalizeEmail(email)]);
  return row ? mapUserRow(row) : null;
}

export async function getSubmissionBundleByCode(code) {
  const applicationRow = await one("SELECT * FROM applications WHERE submission_code = $1", [code]);
  if (!applicationRow) return null;

  const paymentRow = await one("SELECT * FROM payments WHERE application_id = $1", [applicationRow.id]);
  const planRow = await one("SELECT * FROM plans WHERE id = $1", [applicationRow.plan_id]);
  const userRow = applicationRow.portal_user_id
    ? await one("SELECT * FROM users WHERE id = $1", [applicationRow.portal_user_id])
    : null;
  const accountRows = applicationRow.portal_user_id
    ? await many("SELECT * FROM accounts WHERE user_id = $1 ORDER BY created_at DESC", [applicationRow.portal_user_id])
    : [];

  const accounts = [];
  for (const row of accountRows) {
    const account = mapAccountRow(row, true);
    account.performanceSeries = await getPerformanceSeries(account.id);
    accounts.push(account);
  }

  return {
    application: mapApplicationRow(applicationRow),
    payment: paymentRow ? mapPaymentRow(paymentRow) : null,
    plan: planRow ? mapPlanRow(planRow) : null,
    user: userRow ? mapUserRow(userRow) : null,
    accounts,
  };
}

export async function findReusableOpenApplication({ normalizedEmail, cpfHash }) {
  const rows = await many(
    `
      SELECT *
      FROM applications
      WHERE (
        normalized_email = $1
        OR ($2 <> '' AND cpf_hash = $2)
      )
        AND status NOT IN ('cancelled','rejected')
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [normalizedEmail, cpfHash ?? ""],
  );
  return rows[0] ? mapApplicationRow(rows[0]) : null;
}

export async function recordCommunication({
  applicationId,
  userId,
  kind,
  recipient,
  subject,
  status,
  providerMessageId,
  payload,
  sentAt,
}) {
  await query(
    `
      INSERT INTO communication_logs (
        id, application_id, user_id, kind, recipient, subject, status, provider_message_id, payload, created_at, sent_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    `,
    [
      uid("comm"),
      applicationId ?? null,
      userId ?? null,
      kind,
      recipient,
      subject,
      status,
      providerMessageId ?? null,
      payload ? JSON.stringify(payload) : null,
      nowISO(),
      sentAt ?? null,
    ],
  );
}

export async function createPortalUserFromApplication(application, password) {
  const now = nowISO();
  const primaryEmailNormalized = normalizeEmail(application.email);
  const existingByPrimary = await one(
    "SELECT * FROM users WHERE primary_email_normalized = $1 LIMIT 1",
    [primaryEmailNormalized],
  );

  if (existingByPrimary) {
    return mapUserRow(existingByPrimary);
  }

  let portalEmail = buildPortalEmail(application.fullName, config.portalDomain);
  let collision = await one("SELECT id FROM users WHERE email = $1", [portalEmail]);
  let attempts = 0;
  while (collision && attempts < 20) {
    attempts += 1;
    portalEmail = buildPortalEmail(application.fullName, config.portalDomain, createShortCode("").slice(0, 4));
    collision = await one("SELECT id FROM users WHERE email = $1", [portalEmail]);
  }

  const id = uid("user");
  await query(
    `
      INSERT INTO users (
        id, role, status, name, email, primary_email, primary_email_normalized, password_hash, source_application_id, created_at, updated_at
      ) VALUES ($1,'client','active',$2,$3,$4,$5,$6,$7,$8,$9)
    `,
    [
      id,
      application.fullName,
      portalEmail,
      application.email,
      primaryEmailNormalized,
      await hashPassword(password),
      application.id,
      now,
      now,
    ],
  );

  const created = await one("SELECT * FROM users WHERE id = $1", [id]);
  return mapUserRow(created);
}
