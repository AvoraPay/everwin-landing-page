import crypto from "node:crypto";
import cron from "node-cron";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "./config.js";
import {
  createPortalUserFromApplication,
  getAccounts,
  getDb,
  getPool,
  getPerformanceSeries,
  getPlans,
  getSubmissionBundleByCode,
  getUserById,
  getUsers,
  initDatabase,
  mapAccountRow,
  mapApplicationRow,
  mapPaymentRow,
  mapPlanRow,
  mapUserRow,
  many,
  one,
  query,
  recordCommunication,
  withTransaction,
} from "./db.js";
import { requireAuth, requireRole } from "./middleware/auth.js";
import {
  encryptSecret,
  hashPassword,
  sha256,
  signAccessToken,
  signRefreshToken,
  verifyPassword,
  verifyRefreshToken,
} from "./security.js";
import { appendPerformancePoint, buildAccountAnalytics, evaluateAccount } from "./rules.js";
import {
  addDays,
  addHours,
  buildPortalEmail,
  createOtpCode,
  createShortCode,
  createTempPassword,
  normalizeCpf,
  normalizeEmail,
  normalizeName,
  nowISO,
  uid,
} from "./utils.js";
import {
  sendAccessReadyEmail,
  sendAccountCredentialsEmail,
  sendOtpEmail,
  sendPaymentApprovedEmail,
  sendPaymentLinkReleasedEmail,
  sendPendingPaymentReminderEmail,
  sendSubmissionReceivedEmail,
  sendWaitlistConfirmationEmail,
} from "./emails.js";
import { createCheckoutSession, isStripeEnabled, verifyStripeWebhook } from "./stripe.js";
import {
  blockPlatformUser,
  fetchPlatformUser,
  getWebhookSecret,
  provisionTradingAccount,
  resetPlatformPassword,
} from "./everwinTradeApi.js";

const app = express();
app.set("trust proxy", 1); // Trust first proxy (Vercel, CloudFlare, etc.)
app.locals.bootError = null;

/* ─── Database initialization (once per cold start) ─── */

let _dbReady = false;
let _dbInitPromise = null;

async function ensureDb() {
  if (_dbReady) return;
  if (_dbInitPromise) return _dbInitPromise;
  _dbInitPromise = initDatabase()
    .then(() => { _dbReady = true; })
    .catch((error) => {
      app.locals.bootError = error;
      const bootError = describeBootError(error);
      console.error("Prop API boot error:", bootError?.message ?? error);
      if (bootError?.details) console.error("Boot details:", bootError.details);
      _dbInitPromise = null;
    });
  return _dbInitPromise;
}

app.use(async (_req, _res, next) => {
  await ensureDb();
  next();
});

app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), async (req, res) => {
  if (!isStripeEnabled() || !config.stripeWebhookSecret) {
    return res.status(204).end();
  }

  const signature = req.headers["stripe-signature"];
  if (!signature || typeof signature !== "string") {
    return res.status(400).send("Missing Stripe signature");
  }

  let event;
  try {
    event = verifyStripeWebhook(req.body, signature);
  } catch (error) {
    return res.status(400).send(error instanceof Error ? error.message : "Invalid webhook");
  }

  try {
    const object = event.data.object;
    const applicationId = object?.metadata?.applicationId;

    if (!applicationId) {
      return res.status(200).json({ received: true });
    }

    if (event.type === "checkout.session.completed" && object.payment_status === "paid") {
      await syncPaymentStatus({
        applicationId,
        status: "approved",
        approvedAt: nowISO(),
        externalReference: object.id,
        provider: "stripe",
      });
    }

    if (event.type === "checkout.session.expired") {
      await syncPaymentStatus({
        applicationId,
        status: "overdue",
        externalReference: object.id,
        provider: "stripe",
      });
    }

    if (event.type === "checkout.session.async_payment_failed") {
      await syncPaymentStatus({
        applicationId,
        status: "failed",
        externalReference: object.id,
        provider: "stripe",
      });
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Stripe webhook handler failed:", error);
    return res.status(500).send("Webhook handling failed");
  }
});

app.use(helmet());
app.use(cors(
  config.isProduction && config.corsOrigins.length > 0
    ? {
        origin(origin, callback) {
          if (!origin || config.corsOrigins.includes(origin)) {
            callback(null, true);
            return;
          }
          callback(new Error("Origin not allowed by CORS."));
        },
        credentials: true,
      }
    : {
        origin: true,
        credentials: true,
      },
));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

const loginLimiter = rateLimit({ windowMs: 60_000, max: 5, standardHeaders: true, legacyHeaders: false, message: { message: "Too many login attempts. Try again in 1 minute." } });
const submissionLimiter = rateLimit({ windowMs: 60_000, max: 3, standardHeaders: true, legacyHeaders: false, message: { message: "Too many submissions. Try again in 1 minute." } });
const otpLimiter = rateLimit({ windowMs: 60_000, max: 3, standardHeaders: true, legacyHeaders: false, message: { message: "Too many OTP requests. Try again in 1 minute." } });
const refreshLimiter = rateLimit({ windowMs: 60_000, max: 10, standardHeaders: true, legacyHeaders: false, message: { message: "Too many refresh attempts. Try again in 1 minute." } });
const webhookLimiter = rateLimit({ windowMs: 60_000, max: 60, standardHeaders: true, legacyHeaders: false, message: { message: "Too many webhook requests." } });

function describeBootError(error) {
  if (!error) {
    return null;
  }

  const message = error instanceof Error ? error.message : "Unknown startup error";
  const code = typeof error === "object" && error && "code" in error ? error.code : undefined;

  if (code === "ENOTFOUND") {
    return {
      code: "DATABASE_HOST_UNRESOLVED",
      message:
        "Prop API started in degraded mode because the Supabase Postgres host could not be resolved. Supabase direct connections are IPv6-first; use the exact connection string from the dashboard Connect modal or set DATABASE_POOL_URL with the Supavisor session string for IPv4 environments.",
      details: message,
    };
  }

  return {
    code: "DATABASE_BOOT_ERROR",
    message: "Prop API started in degraded mode because database bootstrap failed.",
    details: message,
  };
}

app.use((req, res, next) => {
  if (!app.locals.bootError) {
    next();
    return;
  }

  if (req.path === "/api/health") {
    next();
    return;
  }

  const bootError = describeBootError(app.locals.bootError);
  res.status(503).json(bootError);
});

function normalizeLocale(language) {
  if (language?.startsWith("pt")) return "pt";
  if (language?.startsWith("es")) return "es";
  return "en";
}

function mapPublicPlanId(planKey, locale) {
  const normalized = normalizeLocale(locale);
  const isBrl = normalized === "pt";
  const map = {
    plan_1: isBrl ? "plan_brl_25k" : "plan_usd_12k",
    plan_2: isBrl ? "plan_brl_50k" : "plan_usd_25k",
    plan_3: isBrl ? "plan_brl_100k" : "plan_usd_50k",
    plan_4: isBrl ? "plan_brl_150k" : "plan_usd_75k",
  };
  return map[planKey] ?? map.plan_2;
}

function buildStatusUrl(submissionCode) {
  return `${config.appBaseUrl}/prop/submission?id=${submissionCode}`;
}

function buildLoginUrl() {
  return `${config.appBaseUrl}/prop/login`;
}

const DEFAULT_VACANCIES_MESSAGE =
  "Vacancies temporarily closed. Your application remains under review and the payment link will be sent manually by email and on the status page when availability opens.";

const SETTINGS_META = {
  everwin_admin_bearer: { sensitive: true },
  everwin_webhook_secret: { sensitive: true },
  prop_vacancies_locked: { sensitive: false, defaultValue: "false" },
  prop_vacancies_message: { sensitive: false, defaultValue: DEFAULT_VACANCIES_MESSAGE },
};

const ALLOWED_SETTINGS = Object.keys(SETTINGS_META);

async function getSystemSettingValue(key) {
  const row = await one("SELECT value FROM system_settings WHERE key = $1", [key]);
  return row?.value?.trim() ?? "";
}

async function areVacanciesLocked() {
  const value = (await getSystemSettingValue("prop_vacancies_locked")).toLowerCase();
  if (!value) return true;
  return value !== "false";
}

async function getVacanciesMessage() {
  return (await getSystemSettingValue("prop_vacancies_message")) || DEFAULT_VACANCIES_MESSAGE;
}

async function audit(actorUserId, action, entityType, entityId, payload) {
  await query(
    `
      INSERT INTO audit_logs (id, actor_user_id, action, entity_type, entity_id, payload, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
    `,
    [uid("audit"), actorUserId ?? null, action, entityType, entityId, payload ? JSON.stringify(payload) : null, nowISO()],
  );
}

async function saveAccount(account) {
  await query(
    `
      UPDATE accounts SET
        phase = $1,
        status = $2,
        start_date = $3,
        end_date = $4,
        cooldown_until = $5,
        initial_balance = $6,
        balance = $7,
        today_pnl = $8,
        days_traded = $9,
        max_drawdown_hit_pct = $10,
        notes = $11,
        sync_status = $12,
        last_synced_at = $13,
        updated_at = $14
      WHERE id = $15
    `,
    [
      account.phase,
      account.status,
      account.startDate,
      account.endDate,
      account.cooldownUntil ?? null,
      account.initialBalance,
      account.balance,
      account.todayPnl,
      account.daysTraded,
      account.maxDrawdownHitPct,
      account.notes ?? null,
      account.syncStatus ?? "pending",
      account.lastSyncedAt ?? null,
      nowISO(),
      account.id,
    ],
  );
}

async function upsertPerformancePoint(accountId, point) {
  await query(
    `
      INSERT INTO performance_points (id, account_id, date, pnl, balance, phase, breached_daily_limit, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT (account_id, date)
      DO UPDATE SET
        pnl = EXCLUDED.pnl,
        balance = EXCLUDED.balance,
        phase = EXCLUDED.phase,
        breached_daily_limit = EXCLUDED.breached_daily_limit
    `,
    [uid("point"), accountId, point.date, point.pnl, point.balance, point.phase, point.breachedDailyLimit, nowISO()],
  );
}

async function getAccountDomainByRow(row, includeSecrets = false) {
  const account = mapAccountRow(row, includeSecrets);
  account.performanceSeries = await getPerformanceSeries(account.id);
  return account;
}

async function getApplicationById(applicationId) {
  const row = await one("SELECT * FROM applications WHERE id = $1", [applicationId]);
  return row ? mapApplicationRow(row) : null;
}

async function getPaymentByApplicationId(applicationId) {
  const row = await one("SELECT * FROM payments WHERE application_id = $1", [applicationId]);
  return row ? mapPaymentRow(row) : null;
}

async function sendAndLogEmail(kind, sender, payload) {
  try {
    const response = await sender();
    const data = response?.data ?? response;
    await recordCommunication({
      applicationId: payload.applicationId,
      userId: payload.userId,
      kind,
      recipient: payload.recipient,
      subject: payload.subject,
      status: "sent",
      providerMessageId: data?.id ?? null,
      payload,
      sentAt: nowISO(),
    });
  } catch (error) {
    await recordCommunication({
      applicationId: payload.applicationId,
      userId: payload.userId,
      kind,
      recipient: payload.recipient,
      subject: payload.subject,
      status: "failed",
      payload: {
        ...payload,
        error: error instanceof Error ? error.message : "Unknown email error",
      },
    });
    throw error;
  }
}

async function sendAndLogEmailBestEffort(kind, sender, payload) {
  try {
    await sendAndLogEmail(kind, sender, payload);
  } catch (error) {
    console.error(`Email send failed for ${kind}:`, error);
  }
}

async function fetchApplicationAdminRows() {
  return many(
    `
      SELECT
        a.*,
        p.payment_code,
        p.status AS payment_row_status,
        p.checkout_url,
        p.provider,
        p.due_at,
        p.approved_at,
        u.email AS portal_email,
        u.primary_email,
        u.status AS portal_user_status,
        pl.name AS plan_name,
        pl.account_size,
        pl.fee
      FROM applications a
      LEFT JOIN payments p ON p.application_id = a.id
      LEFT JOIN users u ON u.id = a.portal_user_id
      LEFT JOIN plans pl ON pl.id = a.plan_id
      ORDER BY a.created_at DESC
    `,
  );
}

async function syncPaymentStatus({
  applicationId,
  status,
  checkoutUrl,
  externalReference,
  approvedAt,
  provider,
  adminNotes,
}) {
  const paymentRow = await one("SELECT * FROM payments WHERE application_id = $1", [applicationId]);
  const applicationRow = await one("SELECT * FROM applications WHERE id = $1", [applicationId]);
  if (!paymentRow || !applicationRow) {
    throw new Error("Payment or submission not found.");
  }

  const statusMap = {
    pending: "payment_pending",
    overdue: "payment_overdue",
    approved: applicationRow.portal_user_id ? "access_ready" : "payment_approved",
    failed: "cancelled",
    cancelled: "cancelled",
  };

  const updatedAt = nowISO();
  await query(
    `
      UPDATE payments
      SET status = $1,
          provider = COALESCE($2, provider),
          checkout_url = COALESCE($3, checkout_url),
          external_reference = COALESCE($4, external_reference),
          approved_at = CASE WHEN $1 = 'approved' THEN COALESCE($5, approved_at, $6) ELSE approved_at END,
          updated_at = $6
      WHERE application_id = $7
    `,
    [status, provider ?? null, checkoutUrl ?? null, externalReference ?? null, approvedAt ?? null, updatedAt, applicationId],
  );

  await query(
    `
      UPDATE applications
      SET status = $1,
          payment_status = $2,
          paid_at = CASE WHEN $2 = 'approved' THEN COALESCE($3, paid_at, $4) ELSE paid_at END,
          admin_notes = COALESCE(NULLIF($5, ''), admin_notes),
          updated_at = $4
      WHERE id = $6
    `,
    [statusMap[status], status, approvedAt ?? null, updatedAt, adminNotes ?? "", applicationId],
  );

  const application = mapApplicationRow({
    ...applicationRow,
    status: statusMap[status],
    payment_status: status,
    paid_at: status === "approved" ? approvedAt ?? updatedAt : applicationRow.paid_at,
    updated_at: updatedAt,
  });

  // ─── AUTO-PROVISION: when payment approved → create user + account + platform ───
  if (status === "approved") {
    try {
      await autoProvisionFullAccount(application);
    } catch (provisionErr) {
      console.error("[AutoProvision] Failed (non-fatal):", provisionErr instanceof Error ? provisionErr.message : provisionErr);
    }
  }

  return { applicationRow, application };
}

/**
 * Full auto-provision triggered when payment is approved:
 * 1. Create portal user (if not exists) with submission data
 * 2. Create prop account (with plan data, auto-generated accountId)
 * 3. Provision trading platform account (create user + add balance)
 * 4. Send access-ready email with credentials
 * 5. Update submission status to "account_ready"
 */
async function autoProvisionFullAccount(application) {
  const planRow = await one("SELECT * FROM plans WHERE id = $1", [application.planId]);
  if (!planRow) {
    console.warn("[AutoProvision] Plan not found:", application.planId);
    return;
  }
  const plan = mapPlanRow(planRow);

  // 1. Create or find portal user
  let portalUserRow = application.portalUserId
    ? await one("SELECT * FROM users WHERE id = $1", [application.portalUserId])
    : await one("SELECT * FROM users WHERE primary_email_normalized = $1 LIMIT 1", [normalizeEmail(application.email)]);

  let temporaryPassword = createTempPassword();
  let portalUser;

  if (portalUserRow) {
    // User exists — rotate password
    await query("UPDATE users SET password_hash = $1, updated_at = $2 WHERE id = $3", [
      await hashPassword(temporaryPassword),
      nowISO(),
      portalUserRow.id,
    ]);
    portalUser = mapUserRow(portalUserRow);
  } else {
    portalUser = await createPortalUserFromApplication(application, temporaryPassword);
  }

  // Link user to application
  await query(
    `UPDATE applications SET portal_user_id = $1, status = 'account_ready', reviewed_at = COALESCE(reviewed_at, $2), updated_at = $3 WHERE id = $4`,
    [portalUser.id, nowISO(), nowISO(), application.id],
  );

  // 2. Check if account already exists for this application
  const existingAccount = await one("SELECT id FROM accounts WHERE application_id = $1", [application.id]);
  let accountInternalId;

  if (!existingAccount) {
    // Create prop account automatically
    const accountId = `EW-${createShortCode().toUpperCase()}`;
    const now = nowISO();
    const startDate = now;
    const endDate = addDays(startDate, plan.durationDays);
    accountInternalId = uid("account");

    await query(
      `INSERT INTO accounts (
        id, user_id, application_id, plan_id, account_id, platform_login, platform_password_enc,
        phase, status, start_date, end_date, initial_balance, balance, today_pnl, days_traded,
        max_drawdown_hit_pct, notes, sync_status, updated_at, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        1, 'active', $8, $9, $10, $10, 0, 0,
        0, $11, 'pending', $12, $12
      )`,
      [
        accountInternalId,
        portalUser.id,
        application.id,
        plan.id,
        accountId,
        portalUser.email,
        encryptSecret(temporaryPassword),
        startDate,
        endDate,
        plan.accountSize,
        `Auto-criada via aprovação de pagamento • ${application.submissionCode}`,
        now,
      ],
    );

    console.log(`[AutoProvision] Account ${accountId} created for user ${portalUser.email}`);
  } else {
    accountInternalId = existingAccount.id;
  }

  // 3. Provision trading platform (best-effort)
  const accountRow = await one("SELECT * FROM accounts WHERE id = $1", [accountInternalId]);
  if (accountRow && !accountRow.platform_user_id) {
    try {
      const platformResult = await provisionTradingAccount({ application, plan, temporaryPassword });
      await query(
        `UPDATE accounts SET platform_user_id = $1, platform_email = $2, updated_at = $3 WHERE id = $4`,
        [platformResult.platformUserId, platformResult.platformEmail, nowISO(), accountInternalId],
      );
      console.log(`[AutoProvision] Platform account provisioned: ${platformResult.platformEmail}`);
    } catch (platformErr) {
      console.warn("[AutoProvision] Platform provision skipped:", platformErr instanceof Error ? platformErr.message : platformErr);
    }
  }

  // 4. Send access-ready email (best-effort)
  try {
    const subject =
      application.locale === "en"
        ? `Your prop account is ready • ${portalUser.email}`
        : application.locale === "es"
          ? `Tu cuenta prop está lista • ${portalUser.email}`
          : `Sua conta prop está pronta • ${portalUser.email}`;

    await sendAndLogEmailBestEffort(
      "portal.access.ready",
      () =>
        sendAccessReadyEmail({
          application,
          portalUser,
          temporaryPassword,
          loginUrl: buildLoginUrl(),
          statusUrl: buildStatusUrl(application.submissionCode),
        }),
      {
        applicationId: application.id,
        userId: portalUser.id,
        recipient: application.email,
        subject,
      },
    );
  } catch {
    // Non-fatal
  }

  console.log(`[AutoProvision] Complete for submission ${application.submissionCode}`);
}

async function ensurePendingPaymentReminders() {
  const rows = await many(
    `
      SELECT a.*, p.id AS payment_id, p.payment_code, p.checkout_url, p.reminder_sent_at, p.amount, p.currency
      FROM applications a
      JOIN payments p ON p.application_id = a.id
      WHERE p.status IN ('pending','overdue')
        AND a.status NOT IN ('submitted')
        AND p.reminder_sent_at IS NULL
        AND p.created_at <= $1
      ORDER BY p.created_at ASC
    `,
    [addHours(nowISO(), -1)],
  );

  for (const row of rows) {
    const application = mapApplicationRow(row);
    const payment = {
      id: row.payment_id,
      applicationId: application.id,
      paymentCode: row.payment_code,
      provider: row.provider,
      status: row.payment_status,
      amount: Number(row.amount),
      currency: row.currency,
      checkoutUrl: row.checkout_url ?? undefined,
      dueAt: application.paymentDueAt,
      reminderSentAt: row.reminder_sent_at ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    const subject =
      application.locale === "en"
        ? `Pending payment reminder • ${application.submissionCode}`
        : application.locale === "es"
          ? `Recordatorio de pago pendiente • ${application.submissionCode}`
          : `Lembrete de pagamento pendente • ${application.submissionCode}`;

    await sendAndLogEmail(
      "payment.pending.reminder",
      () => sendPendingPaymentReminderEmail({ application, payment, statusUrl: buildStatusUrl(application.submissionCode) }),
      {
        applicationId: application.id,
        recipient: application.email,
        subject,
      },
    );

    await query(
      `
        UPDATE payments
        SET reminder_sent_at = $1,
            status = CASE WHEN status = 'pending' THEN 'overdue' ELSE status END,
            updated_at = $2
        WHERE id = $3
      `,
      [nowISO(), nowISO(), row.payment_id],
    );
    await query(
      `
        UPDATE applications
        SET status = CASE WHEN status = 'payment_pending' THEN 'payment_overdue' ELSE status END,
            payment_status = CASE WHEN payment_status = 'pending' THEN 'overdue' ELSE payment_status END,
            updated_at = $1
        WHERE id = $2
      `,
      [nowISO(), application.id],
    );
  }
}

async function runDailyAccountSync(triggerType = "system") {
  const runId = uid("sync");
  const startedAt = nowISO();
  await query(
    `
      INSERT INTO sync_runs (id, trigger_type, status, notes, account_count, started_at)
      VALUES ($1,$2,'running',$3,0,$4)
    `,
    [runId, triggerType, "Daily account snapshot sync placeholder", startedAt],
  );

  const plans = await getPlans();
  const accounts = await getAccounts({ includeSecrets: true });

  for (const account of accounts) {
    const plan = plans.find((item) => item.id === account.planId);
    if (!plan) continue;

    const point = {
      date: nowISO().slice(0, 10),
      pnl: account.todayPnl,
      balance: account.balance,
      phase: account.phase,
      breachedDailyLimit: account.todayPnl <= -((account.initialBalance * plan.dailyLossLimitPct) / 100),
    };

    account.performanceSeries = appendPerformancePoint(account.performanceSeries, point);
    const evaluated = evaluateAccount(
      {
        ...account,
        syncStatus: "synced",
        lastSyncedAt: nowISO(),
      },
      plan,
      nowISO(),
    );

    await saveAccount(evaluated);
    await upsertPerformancePoint(evaluated.id, point);
  }

  await query(
    `
      UPDATE sync_runs
      SET status = 'completed',
          account_count = $1,
          finished_at = $2
      WHERE id = $3
    `,
    [accounts.length, nowISO(), runId],
  );

  await audit(null, "DAILY_ACCOUNT_SYNC", "sync", runId, { triggerType, accounts: accounts.length });
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const createSubmissionSchema = z.object({
  planKey: z.enum(["plan_1", "plan_2", "plan_3", "plan_4"]),
  locale: z.string().min(2).max(5),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  documentType: z.string().min(2).optional(),
  documentNumber: z.string().min(3).optional(),
  cpf: z.string().min(11).optional(),
  country: z.string().min(2),
  city: z.string().min(2),
  occupation: z.string().min(2),
  experience: z.string().min(1),
  session: z.string().min(1),
  riskPerDay: z.string().min(1),
  motivation: z.string().min(20),
  consistency: z.string().min(20),
  agreeRules: z.literal(true),
  agreeNoGuarantee: z.literal(true),
  agreeLiability: z.literal(true),
});

const optionalTrimmedString = (schema) =>
  z.preprocess((value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }, schema.optional());

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: optionalTrimmedString(z.string().min(6)),
  primaryEmail: optionalTrimmedString(z.string().email()),
});

const updateUserStatusSchema = z.object({
  status: z.enum(["active", "blocked"]),
});

const createAccountSchema = z.object({
  userId: z.string().min(1),
  applicationId: z.string().optional(),
  submissionCode: z.string().min(4).optional(),
  planId: z.string().min(1),
  accountId: z.string().min(3),
  platformLogin: z.string().min(3),
  platformPassword: z.string().min(3),
  startDate: z.string().min(8),
  notes: z.string().optional(),
});

const updateAccountSchema = z.object({
  balance: z.number().optional(),
  todayPnl: z.number().optional(),
  daysTraded: z.number().int().nonnegative().optional(),
  phase: z.union([z.literal(1), z.literal(2)]).optional(),
  notes: z.string().nullable().optional(),
  platformLogin: z.string().min(1).optional(),
  platformPassword: z.string().min(1).optional(),
  brokerName: z.string().optional().or(z.literal("")),
  status: z
    .enum([
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
    ])
    .optional(),
});

const statusSchema = z.object({
  status: z.enum([
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
  ]),
});

const updateSubmissionPaymentSchema = z.object({
  status: z.enum(["pending", "overdue", "approved", "failed", "cancelled"]),
  checkoutUrl: z.string().url().optional().or(z.literal("")),
  externalReference: z.string().optional().or(z.literal("")),
  adminNotes: z.string().optional().or(z.literal("")),
});

const updateSubmissionStatusSchema = z.object({
  status: z.enum(["submitted", "payment_pending", "payment_overdue", "payment_approved", "under_review", "access_ready", "account_ready", "rejected", "cancelled"]),
  adminNotes: z.string().optional().or(z.literal("")),
});

const releasePaymentSchema = z.object({
  checkoutUrl: z.string().url(),
  adminNotes: z.string().optional().or(z.literal("")),
});

const provisionAccessSchema = z.object({
  rotatePassword: z.boolean().optional(),
});

const requestOtpSchema = z.object({
  email: z.string().email(),
});

const confirmOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(6).max(6),
  newPassword: z.string().min(8),
});

app.get("/api/health", async (_req, res) => {
  let dbReady = false;
  try {
    dbReady = Boolean(getDb());
  } catch {
    dbReady = false;
  }

  res.json({
    ok: !app.locals.bootError,
    service: "everwin-prop-api",
    dbReady,
    timestamp: nowISO(),
    bootError: describeBootError(app.locals.bootError),
  });
});

app.get("/api/public/plans", async (_req, res) => {
  const plans = await getPlans();
  res.json({ plans });
});

app.get("/api/public/submissions-config", async (_req, res) => {
  const vacanciesLocked = await areVacanciesLocked();
  const vacanciesMessage = await getVacanciesMessage();
  res.json({
    vacanciesLocked,
    vacanciesMessage,
  });
});

app.post("/api/public/submissions", submissionLimiter, async (req, res) => {
  const parsed = createSubmissionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload." });

  const locale = normalizeLocale(parsed.data.locale);
  const normalizedEmail = normalizeEmail(parsed.data.email);
  const normalizedName = normalizeName(`${parsed.data.firstName} ${parsed.data.lastName}`);
  const rawDocumentNumber = parsed.data.documentNumber ?? parsed.data.cpf ?? "";
  const isBrazilianDocument =
    ["brazil", "brasil"].includes(parsed.data.country.trim().toLowerCase()) &&
    (parsed.data.documentType ?? "CPF").toUpperCase() === "CPF";
  const normalizedDocumentNumber = isBrazilianDocument
    ? normalizeCpf(rawDocumentNumber)
    : rawDocumentNumber.trim().toUpperCase();
  const documentHash = normalizedDocumentNumber ? sha256(normalizedDocumentNumber) : "";
  const documentType = (parsed.data.documentType ?? (locale === "pt" ? "CPF" : "Document")).trim();

  const existing = await one(
    `
      SELECT *
      FROM applications
      WHERE (
        normalized_email = $1
        OR ($2 <> '' AND cpf_hash = $2)
        OR (normalized_name = $3 AND phone = $4)
      )
        AND status NOT IN ('cancelled','rejected')
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [normalizedEmail, documentHash, normalizedName, parsed.data.phone.trim()],
  );

  if (existing) {
    const bundle = await getSubmissionBundleByCode(existing.submission_code);
    return res.status(200).json({
      reused: true,
      submissionCode: existing.submission_code,
      application: bundle?.application,
      payment: bundle?.payment,
    });
  }

  const planId = mapPublicPlanId(parsed.data.planKey, locale);
  const planRow = await one("SELECT * FROM plans WHERE id = $1", [planId]);
  if (!planRow) return res.status(404).json({ message: "Plan not found." });
  const plan = mapPlanRow(planRow);

  const applicationId = uid("application");
  const paymentId = uid("payment");
  const submissionCode = createShortCode("sub_");
  const paymentCode = createShortCode("pay_");
  const submittedAt = nowISO();
  const paymentDueAt = addHours(submittedAt, 1);
  const paymentProvider = "manual_link";

  const applicationRow = await withTransaction(async (trx) => {
    await trx.query(
      `
        INSERT INTO applications (
          id, submission_code, plan_id, first_name, last_name, full_name, normalized_name,
          email, normalized_email, document_type, cpf, cpf_hash, phone, country, city, occupation,
          experience, session, risk_per_day, motivation, consistency,
          agree_rules, agree_no_guarantee, agree_liability,
          locale, amount, currency, status, payment_status,
          payment_due_at, submitted_at, created_at, updated_at
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,
          $8,$9,$10,$11,$12,$13,$14,$15,$16,
          $17,$18,$19,$20,$21,
          $22,$23,$24,
          $25,$26,$27,'submitted','pending',
          $28,$29,$30,$31
        )
      `,
      [
        applicationId,
        submissionCode,
        plan.id,
        parsed.data.firstName.trim(),
        parsed.data.lastName.trim(),
        `${parsed.data.firstName.trim()} ${parsed.data.lastName.trim()}`,
        normalizedName,
        normalizedEmail,
        normalizedEmail,
        documentType,
        normalizedDocumentNumber || null,
        documentHash || null,
        parsed.data.phone.trim(),
        parsed.data.country.trim(),
        parsed.data.city.trim(),
        parsed.data.occupation.trim(),
        parsed.data.experience.trim(),
        parsed.data.session.trim(),
        parsed.data.riskPerDay.trim(),
        parsed.data.motivation.trim(),
        parsed.data.consistency.trim(),
        true,
        true,
        true,
        locale,
        plan.fee,
        plan.currency,
        paymentDueAt,
        submittedAt,
        submittedAt,
        submittedAt,
      ],
    );

    await trx.query(
      `
        INSERT INTO payments (
          id, application_id, payment_code, provider, status, amount, currency, due_at, checkout_url, created_at, updated_at
        ) VALUES ($1,$2,$3,$4,'pending',$5,$6,$7,$8,$9,$10)
      `,
      [
        paymentId,
        applicationId,
        paymentCode,
        paymentProvider,
        plan.fee,
        plan.currency,
        paymentDueAt,
        null,
        submittedAt,
        submittedAt,
      ],
    );

    return trx.one("SELECT * FROM applications WHERE id = $1", [applicationId]);
  });

  const application = mapApplicationRow(applicationRow);
  const payment = await getPaymentByApplicationId(application.id);

  // Waitlist mode: do NOT create Stripe session or redirect to payment.
  // Payment link will be released manually by admin via /release-payment endpoint.

  const subject =
    locale === "en"
      ? `Everwin Prop — application received • ${application.submissionCode}`
      : locale === "es"
        ? `Everwin Prop — solicitud recibida • ${application.submissionCode}`
        : `Everwin Prop — inscrição recebida • ${application.submissionCode}`;

  await sendAndLogEmailBestEffort(
    "submission.waitlist",
    () => sendWaitlistConfirmationEmail({ application, plan, statusUrl: buildStatusUrl(application.submissionCode) }),
    {
      applicationId: application.id,
      recipient: application.email,
      subject,
    },
  );

  await audit(null, "CREATE_SUBMISSION", "application", application.id, {
    submissionCode: application.submissionCode,
    planId: application.planId,
    waitlist: true,
  });

  return res.status(201).json({
    reused: false,
    submissionCode,
    application,
    payment,
  });
});

app.get("/api/public/submissions/:code", async (req, res) => {
  const bundle = await getSubmissionBundleByCode(req.params.code);
  if (!bundle) return res.status(404).json({ message: "Submission not found." });
  const vacanciesLocked = await areVacanciesLocked();
  const vacanciesMessage = await getVacanciesMessage();

  // Strip sensitive credentials from public endpoint
  const safeAccounts = (bundle.accounts ?? []).map(({ platformPassword, platformLogin, ...rest }) => ({
    ...rest,
    platformLogin: platformLogin ? `${platformLogin.slice(0, 3)}***` : undefined,
  }));

  const safePayment =
    vacanciesLocked && bundle.application.paymentStatus !== "approved" && bundle.payment
      ? {
          ...bundle.payment,
          checkoutUrl: undefined,
        }
      : bundle.payment;

  return res.json({
    ...bundle,
    payment: safePayment,
    accounts: safeAccounts,
    loginUrl: buildLoginUrl(),
    canAccessPortal: Boolean(bundle.user && ["access_ready", "account_ready"].includes(bundle.application.status)),
    vacanciesLocked,
    vacanciesMessage,
  });
});

app.post("/api/public/password/request-otp", otpLimiter, async (req, res) => {
  const parsed = requestOtpSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload." });

  const normalized = normalizeEmail(parsed.data.email);
  const userRow =
    (await one("SELECT * FROM users WHERE email = $1", [normalized])) ??
    (await one("SELECT * FROM users WHERE primary_email_normalized = $1", [normalized]));

  if (!userRow) {
    return res.json({ ok: true });
  }

  const user = mapUserRow(userRow);
  const otp = createOtpCode();
  const expiresAt = addHours(nowISO(), 0.25);

  await query(
    `
      INSERT INTO password_otps (id, user_id, requested_for, code_hash, expires_at, created_at)
      VALUES ($1,$2,$3,$4,$5,$6)
    `,
    [uid("otp"), user.id, normalized, sha256(otp), expiresAt, nowISO()],
  );

  const localeRow = await one(
    `
      SELECT locale
      FROM applications
      WHERE portal_user_id = $1 OR normalized_email = $2
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [user.id, normalized],
  );
  const locale = normalizeLocale(localeRow?.locale ?? "pt");
  const subject =
    locale === "en"
      ? "Your Everwin verification code"
      : locale === "es"
        ? "Su código de verificación Everwin"
        : "Seu código de verificação Everwin";

  await sendAndLogEmail(
    "password.otp",
    () => sendOtpEmail({ email: user.primaryEmail ?? normalized, otp, locale, loginUrl: buildLoginUrl() }),
    {
      userId: user.id,
      recipient: user.primaryEmail ?? normalized,
      subject,
    },
  );

  return res.json({ ok: true });
});

app.post("/api/public/password/confirm-otp", otpLimiter, async (req, res) => {
  const parsed = confirmOtpSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload." });

  const normalized = normalizeEmail(parsed.data.email);
  const userRow =
    (await one("SELECT * FROM users WHERE email = $1", [normalized])) ??
    (await one("SELECT * FROM users WHERE primary_email_normalized = $1", [normalized]));
  if (!userRow) return res.status(404).json({ message: "User not found." });

  const otpRow = await one(
    `
      SELECT *
      FROM password_otps
      WHERE user_id = $1
        AND requested_for = $2
        AND consumed_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [userRow.id, normalized],
  );

  if (!otpRow) return res.status(400).json({ message: "OTP not found." });
  if (new Date(otpRow.expires_at).getTime() < Date.now()) return res.status(400).json({ message: "OTP expired." });
  if (otpRow.code_hash !== sha256(parsed.data.otp)) return res.status(400).json({ message: "OTP invalid." });

  await query(
    `
      UPDATE users
      SET password_hash = $1,
          updated_at = $2
      WHERE id = $3
    `,
    [await hashPassword(parsed.data.newPassword), nowISO(), userRow.id],
  );
  await query("UPDATE password_otps SET consumed_at = $1 WHERE id = $2", [nowISO(), otpRow.id]);
  await audit(userRow.id, "RESET_PASSWORD_OTP", "user", userRow.id, null);

  return res.json({ ok: true });
});

app.post("/api/auth/login", loginLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload." });

  const userRow = await one("SELECT * FROM users WHERE email = $1", [normalizeEmail(parsed.data.email)]);
  if (!userRow) return res.status(401).json({ message: "Invalid credentials." });
  if (!["active", "invited"].includes(userRow.status)) return res.status(403).json({ message: "User blocked." });

  const valid = await verifyPassword(parsed.data.password, userRow.password_hash);
  if (!valid) return res.status(401).json({ message: "Invalid credentials." });

  const user = mapUserRow(userRow);
  const payload = { sub: user.id, role: user.role, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const decoded = jwt.decode(refreshToken);
  const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000).toISOString() : addDays(nowISO(), 7);

  await query(
    `
      INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at, user_agent, ip)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
    `,
    [uid("rft"), user.id, sha256(refreshToken), expiresAt, nowISO(), req.headers["user-agent"] ?? null, req.ip ?? null],
  );

  await query("UPDATE users SET last_login_at = $1, updated_at = $2 WHERE id = $3", [nowISO(), nowISO(), user.id]);
  await audit(user.id, "LOGIN", "system", user.id, { role: user.role });

  return res.json({ accessToken, refreshToken, user });
});

app.post("/api/auth/refresh", refreshLimiter, async (req, res) => {
  const token = req.body?.refreshToken;
  if (!token) return res.status(400).json({ message: "Missing refresh token." });

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    return res.status(401).json({ message: "Invalid refresh token." });
  }

  const tokenHash = sha256(token);
  const tokenRow = await one("SELECT * FROM refresh_tokens WHERE token_hash = $1 AND revoked_at IS NULL", [tokenHash]);
  if (!tokenRow) return res.status(401).json({ message: "Refresh token revoked." });
  if (new Date(tokenRow.expires_at).getTime() < Date.now()) return res.status(401).json({ message: "Refresh token expired." });

  const userRow = await one("SELECT * FROM users WHERE id = $1", [payload.sub]);
  if (!userRow || !["active", "invited"].includes(userRow.status)) return res.status(401).json({ message: "Invalid user." });

  const user = mapUserRow(userRow);
  const nextPayload = { sub: user.id, role: user.role, email: user.email };
  const accessToken = signAccessToken(nextPayload);
  const refreshToken = signRefreshToken(nextPayload);
  const decoded = jwt.decode(refreshToken);
  const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000).toISOString() : addDays(nowISO(), 7);

  await query("UPDATE refresh_tokens SET revoked_at = $1 WHERE id = $2", [nowISO(), tokenRow.id]);
  await query(
    `
      INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at, user_agent, ip)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
    `,
    [uid("rft"), user.id, sha256(refreshToken), expiresAt, nowISO(), req.headers["user-agent"] ?? null, req.ip ?? null],
  );

  return res.json({ accessToken, refreshToken, user });
});

app.post("/api/auth/logout", async (req, res) => {
  const token = req.body?.refreshToken;
  if (token) {
    const tokenHash = sha256(token);
    const tokenRow = await one("SELECT user_id FROM refresh_tokens WHERE token_hash = $1", [tokenHash]);
    await query("UPDATE refresh_tokens SET revoked_at = $1 WHERE token_hash = $2", [nowISO(), tokenHash]);
    if (tokenRow?.user_id) {
      await audit(tokenRow.user_id, "LOGOUT", "system", tokenRow.user_id, null);
    }
  }
  return res.json({ ok: true });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ user: req.authUser });
});

app.get("/api/plans", requireAuth, async (_req, res) => {
  res.json({ plans: await getPlans() });
});

// ── Client-facing endpoints (any authenticated user) ──────────────────

app.get("/api/my/submissions", requireAuth, async (req, res) => {
  try {
    const rows = await many(
      `SELECT a.*, p.id as payment_id, p.payment_code, p.status as payment_status_pay, p.amount as payment_amount, p.currency as payment_currency, p.approved_at as payment_approved_at, p.due_at as payment_due_at, p.checkout_url as payment_checkout_url
       FROM applications a
       LEFT JOIN payments p ON p.application_id = a.id
       WHERE a.portal_user_id = $1 OR a.email = $2
       ORDER BY a.created_at DESC`,
      [req.authUser.id, req.authUser.email],
    );

    const submissions = rows.map((row) => ({
      id: row.id,
      submissionCode: row.submission_code,
      planId: row.plan_id,
      status: row.status,
      paymentStatus: row.payment_status,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      country: row.country,
      city: row.city,
      submittedAt: row.submitted_at,
      paidAt: row.paid_at ?? null,
      reviewedAt: row.reviewed_at ?? null,
      payment: row.payment_id
        ? {
            id: row.payment_id,
            paymentCode: row.payment_code,
            status: row.payment_status_pay,
            amount: row.payment_amount != null ? Number(row.payment_amount) : null,
            currency: row.payment_currency ?? null,
            approvedAt: row.payment_approved_at ?? null,
            dueAt: row.payment_due_at ?? null,
            checkoutUrl: row.payment_checkout_url ?? null,
          }
        : null,
    }));

    res.json(submissions);
  } catch (error) {
    console.error("[my/submissions]", error);
    res.status(500).json({ message: "Failed to fetch submissions." });
  }
});

app.get("/api/my/account-events/:accountId", requireAuth, async (req, res) => {
  try {
    const account = await one(
      "SELECT id FROM accounts WHERE id = $1 AND user_id = $2",
      [req.params.accountId, req.authUser.id],
    );

    if (!account) {
      return res.status(403).json({ message: "Account not found or access denied." });
    }

    const events = await many(
      "SELECT * FROM trade_events WHERE prop_account_id = $1 ORDER BY created_at DESC LIMIT 50",
      [req.params.accountId],
    );

    const mapped = events.map((row) => ({
      id: row.id,
      platformUserId: row.platform_user_id,
      propAccountId: row.prop_account_id ?? null,
      eventType: row.event_type,
      payload: row.payload ? JSON.parse(row.payload) : {},
      flagged: Boolean(row.flagged),
      flagReason: row.flag_reason ?? null,
      createdAt: row.created_at,
    }));

    res.json({ events: mapped });
  } catch (error) {
    console.error("[my/account-events]", error);
    res.status(500).json({ message: "Failed to fetch account events." });
  }
});

app.get("/api/users", requireAuth, requireRole("admin"), async (_req, res) => {
  res.json({ users: await getUsers() });
});

app.post("/api/users", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid payload.",
      issues: parsed.error.flatten(),
    });
  }

  const email = normalizeEmail(parsed.data.email);
  const exists = await one("SELECT id FROM users WHERE email = $1", [email]);
  if (exists) return res.status(409).json({ message: "E-mail already registered." });

  const primaryEmail = parsed.data.primaryEmail ? normalizeEmail(parsed.data.primaryEmail) : email;
  const temporaryPassword = parsed.data.password?.trim() ? parsed.data.password.trim() : createTempPassword();
  const now = nowISO();
  const userId = uid("user");

  await query(
    `
      INSERT INTO users (
        id, role, status, name, email, primary_email, primary_email_normalized, password_hash, created_at, updated_at
      ) VALUES ($1,'client','active',$2,$3,$4,$5,$6,$7,$8)
    `,
    [userId, parsed.data.name.trim(), email, primaryEmail, primaryEmail, await hashPassword(temporaryPassword), now, now],
  );

  await audit(req.authUser.id, "CREATE_CLIENT_USER", "user", userId, { email, primaryEmail });
  const user = await getUserById(userId);
  return res.status(201).json({ user, temporaryPassword });
});

app.patch("/api/users/:id/status", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = updateUserStatusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload." });

  const result = await query("UPDATE users SET status = $1, updated_at = $2 WHERE id = $3", [parsed.data.status, nowISO(), req.params.id]);
  if (result.rowCount === 0) return res.status(404).json({ message: "User not found." });

  await audit(req.authUser.id, "UPDATE_USER_STATUS", "user", req.params.id, parsed.data);
  return res.json({ ok: true });
});

app.get("/api/users/:id/submissions", requireAuth, requireRole("admin"), async (req, res) => {
  const rows = await query(
    `SELECT a.id, a.submission_code, a.plan_id, a.full_name, a.email, a.status, a.created_at
     FROM applications a
     WHERE a.portal_user_id = $1
     ORDER BY a.created_at DESC`,
    [req.params.id],
  );
  return res.json({ submissions: rows.rows.map((r) => ({ id: r.id, submissionCode: r.submission_code, email: r.email, status: r.status, createdAt: r.created_at })) });
});

app.get("/api/submissions", requireAuth, requireRole("admin"), async (_req, res) => {
  const rows = await fetchApplicationAdminRows();
  const items = rows.map((row) => ({
    application: mapApplicationRow(row),
    payment: {
      paymentCode: row.payment_code,
      status: row.payment_row_status,
      checkoutUrl: row.checkout_url,
      provider: row.provider,
      dueAt: row.due_at,
      approvedAt: row.approved_at,
    },
    user: row.portal_email
      ? {
          email: row.portal_email,
          primaryEmail: row.primary_email,
          status: row.portal_user_status,
        }
      : null,
    plan: row.plan_name
      ? {
          name: row.plan_name,
          accountSize: Number(row.account_size),
          fee: Number(row.fee),
        }
      : null,
  }));
  res.json({ submissions: items });
});

app.patch("/api/submissions/:id/payment", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = updateSubmissionPaymentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload." });

  const { applicationRow, application } = await syncPaymentStatus({
    applicationId: req.params.id,
    status: parsed.data.status,
    checkoutUrl: parsed.data.checkoutUrl || undefined,
    externalReference: parsed.data.externalReference || undefined,
    approvedAt: parsed.data.status === "approved" ? nowISO() : undefined,
    adminNotes: parsed.data.adminNotes || undefined,
  });

  if (parsed.data.status === "approved") {
    const subject =
      application.locale === "en"
        ? `Payment confirmed • ${application.submissionCode}`
        : application.locale === "es"
          ? `Pago confirmado • ${application.submissionCode}`
          : `Pagamento confirmado • ${application.submissionCode}`;

    await sendAndLogEmailBestEffort("payment.approved", () => sendPaymentApprovedEmail({ application, statusUrl: buildStatusUrl(application.submissionCode) }), {
        applicationId: application.id,
        recipient: application.email,
        subject,
      },
    );
  }

  await audit(req.authUser.id, "UPDATE_PAYMENT_STATUS", "application", req.params.id, parsed.data);
  const bundle = await getSubmissionBundleByCode(applicationRow.submission_code);
  res.json(bundle);
});

app.patch("/api/submissions/:id/status", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = updateSubmissionStatusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload." });

  const row = await one("SELECT * FROM applications WHERE id = $1", [req.params.id]);
  if (!row) return res.status(404).json({ message: "Submission not found." });

  await query(
    `
      UPDATE applications
      SET status = $1,
          admin_notes = COALESCE(NULLIF($2, ''), admin_notes),
          reviewed_at = CASE WHEN $1 IN ('under_review','access_ready','account_ready','rejected') THEN $3 ELSE reviewed_at END,
          updated_at = $4
      WHERE id = $5
    `,
    [parsed.data.status, parsed.data.adminNotes ?? "", nowISO(), nowISO(), req.params.id],
  );

  await audit(req.authUser.id, "UPDATE_SUBMISSION_STATUS", "application", req.params.id, parsed.data);
  const bundle = await getSubmissionBundleByCode(row.submission_code);
  res.json(bundle);
});

app.post("/api/submissions/:id/release-payment", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = releasePaymentSchema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload." });

  const applicationRow = await one("SELECT * FROM applications WHERE id = $1", [req.params.id]);
  if (!applicationRow) return res.status(404).json({ message: "Submission not found." });

  const application = mapApplicationRow(applicationRow);

  if (!["submitted", "payment_pending"].includes(application.status)) {
    return res.status(400).json({ message: "Submission is not in waitlist status." });
  }

  const resolvedCheckoutUrl = parsed.data.checkoutUrl.trim();

  // Update application status to payment_pending
  await query(
    `
      UPDATE applications
      SET status = 'payment_pending',
          payment_status = 'pending',
          admin_notes = COALESCE(NULLIF($1, ''), admin_notes),
          updated_at = $2
      WHERE id = $3
    `,
    [parsed.data.adminNotes ?? "", nowISO(), application.id],
  );

  await query(
    `
      UPDATE payments
      SET checkout_url = $1,
          updated_at = $2
      WHERE application_id = $3
    `,
    [resolvedCheckoutUrl, nowISO(), application.id],
  );

  // Send payment link email
  const planRow = await one("SELECT * FROM plans WHERE id = $1", [application.planId]);
  const plan = planRow ? mapPlanRow(planRow) : null;

  const subject =
    application.locale === "en"
      ? `Everwin Prop — your payment link is ready • ${application.submissionCode}`
      : application.locale === "es"
        ? `Everwin Prop — su link de pago está listo • ${application.submissionCode}`
        : `Everwin Prop — seu link de pagamento está liberado • ${application.submissionCode}`;

  await sendAndLogEmailBestEffort(
    "payment.link.released",
    () => sendPaymentLinkReleasedEmail({
      application,
      plan,
      checkoutUrl: resolvedCheckoutUrl,
      statusUrl: buildStatusUrl(application.submissionCode),
    }),
    {
      applicationId: application.id,
      recipient: application.email,
      subject,
    },
  );

  await audit(req.authUser.id, "RELEASE_PAYMENT_LINK", "application", application.id, {
    checkoutUrl: resolvedCheckoutUrl,
    submissionCode: application.submissionCode,
  });

  const bundle = await getSubmissionBundleByCode(applicationRow.submission_code);
  res.json(bundle);
});

app.post("/api/submissions/:id/provision-access", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = provisionAccessSchema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload." });

  const applicationRow = await one("SELECT * FROM applications WHERE id = $1", [req.params.id]);
  if (!applicationRow) return res.status(404).json({ message: "Submission not found." });
  const application = mapApplicationRow(applicationRow);

  let portalUserRow = application.portalUserId
    ? await one("SELECT * FROM users WHERE id = $1", [application.portalUserId])
    : await one("SELECT * FROM users WHERE primary_email_normalized = $1 LIMIT 1", [normalizeEmail(application.email)]);

  let temporaryPassword = "";
  let portalUser;

  if (portalUserRow && !parsed.data.rotatePassword) {
    portalUser = mapUserRow(portalUserRow);
  } else {
    temporaryPassword = createTempPassword();
    if (portalUserRow) {
      await query(
        `
          UPDATE users
          SET password_hash = $1,
              updated_at = $2
          WHERE id = $3
        `,
        [await hashPassword(temporaryPassword), nowISO(), portalUserRow.id],
      );
      portalUser = mapUserRow(portalUserRow);
    } else {
      portalUser = await createPortalUserFromApplication(application, temporaryPassword);
    }
  }

  await query(
    `
      UPDATE applications
      SET portal_user_id = $1,
          status = CASE WHEN status = 'account_ready' THEN 'account_ready' ELSE 'access_ready' END,
          reviewed_at = COALESCE(reviewed_at, $2),
          updated_at = $3
      WHERE id = $4
    `,
    [portalUser.id, nowISO(), nowISO(), application.id],
  );

  const subject =
    application.locale === "en"
      ? `Portal access ready • ${portalUser.email}`
      : application.locale === "es"
        ? `Acceso al portal listo • ${portalUser.email}`
        : `Acesso ao portal liberado • ${portalUser.email}`;

  await sendAndLogEmailBestEffort(
    "portal.access.ready",
    () =>
      sendAccessReadyEmail({
        application,
        portalUser,
        temporaryPassword: temporaryPassword || "Use your current password",
        loginUrl: buildLoginUrl(),
        statusUrl: buildStatusUrl(application.submissionCode),
      }),
    {
      applicationId: application.id,
      userId: portalUser.id,
      recipient: application.email,
      subject,
    },
  );

  await audit(req.authUser.id, "PROVISION_PORTAL_ACCESS", "application", application.id, { portalEmail: portalUser.email });

  // Auto-provision trading platform account (best-effort — non-fatal if API not configured)
  if (temporaryPassword) {
    const planRow = await one("SELECT * FROM plans WHERE id = $1", [application.planId]);
    if (planRow) {
      const plan = mapPlanRow(planRow);
      try {
        const platformResult = await provisionTradingAccount({ application, plan, temporaryPassword });
        // Link platform_user_id to any account with this applicationId
        await query(
          `UPDATE accounts SET platform_user_id = $1, platform_email = $2, updated_at = $3
           WHERE application_id = $4 AND (platform_user_id IS NULL OR platform_user_id = '')`,
          [platformResult.platformUserId, platformResult.platformEmail, nowISO(), application.id],
        );
        await audit(req.authUser.id, "PROVISION_TRADING_ACCOUNT", "application", application.id, {
          platformUserId: platformResult.platformUserId,
          platformEmail: platformResult.platformEmail,
        });
      } catch (platformErr) {
        // Non-fatal: log and continue — admin can provision manually later
        console.warn("[Provision] Trading platform auto-provision skipped:", platformErr.message);
      }
    }
  }

  const bundle = await getSubmissionBundleByCode(application.submissionCode);
  res.json(bundle);
});

app.get("/api/accounts", requireAuth, async (req, res) => {
  if (req.authUser.role === "admin") {
    return res.json({ accounts: await getAccounts({ includeSecrets: true }) });
  }
  return res.json({ accounts: await getAccounts({ userId: req.authUser.id, includeSecrets: false }) });
});

app.post("/api/accounts", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = createAccountSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload." });

  const userRow = await one("SELECT * FROM users WHERE id = $1", [parsed.data.userId]);
  if (!userRow || userRow.role !== "client") return res.status(404).json({ message: "Client not found." });

  let resolvedApplicationId = parsed.data.applicationId ?? null;
  if (!resolvedApplicationId && parsed.data.submissionCode) {
    const applicationByCode = await one("SELECT * FROM applications WHERE submission_code = $1", [parsed.data.submissionCode.trim()]);
    if (!applicationByCode) return res.status(404).json({ message: "Submission not found." });
    resolvedApplicationId = applicationByCode.id;

    if (applicationByCode.portal_user_id && applicationByCode.portal_user_id !== parsed.data.userId) {
      return res.status(409).json({ message: "Submission belongs to a different portal user." });
    }

    if (applicationByCode.plan_id !== parsed.data.planId) {
      return res.status(409).json({ message: "Plan does not match linked submission." });
    }
  }

  const planRow = await one("SELECT * FROM plans WHERE id = $1", [parsed.data.planId]);
  if (!planRow) return res.status(404).json({ message: "Plan not found." });

  const accountIdExists = await one("SELECT id FROM accounts WHERE account_id = $1", [parsed.data.accountId.trim()]);
  if (accountIdExists) return res.status(409).json({ message: "Account ID already exists." });

  const plan = mapPlanRow(planRow);
  const now = nowISO();
  const startDate = new Date(parsed.data.startDate).toISOString();
  const endDate = addDays(startDate, plan.durationDays);
  const accountId = uid("account");

  await query(
    `
      INSERT INTO accounts (
        id, user_id, application_id, plan_id, account_id, platform_login, platform_password_enc,
        phase, status, start_date, end_date, initial_balance, balance, today_pnl, days_traded,
        max_drawdown_hit_pct, notes, sync_status, updated_at, created_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,
        1,'awaiting_account_creation',$8,$9,$10,$11,0,0,0,$12,'pending',$13,$14
      )
    `,
    [
      accountId,
      parsed.data.userId,
      resolvedApplicationId,
      parsed.data.planId,
      parsed.data.accountId.trim(),
      parsed.data.platformLogin.trim(),
      encryptSecret(parsed.data.platformPassword),
      startDate,
      endDate,
      plan.accountSize,
      plan.accountSize,
      parsed.data.notes?.trim() ?? null,
      now,
      now,
    ],
  );

  await upsertPerformancePoint(accountId, {
    date: now.slice(0, 10),
    pnl: 0,
    balance: plan.accountSize,
    phase: 1,
    breachedDailyLimit: false,
  });

  if (resolvedApplicationId) {
    await query(
      `
        UPDATE applications
        SET status = 'account_ready',
            portal_user_id = COALESCE(portal_user_id, $2),
            updated_at = $1
        WHERE id = $3
      `,
      [nowISO(), parsed.data.userId, resolvedApplicationId],
    );
  }

  await audit(req.authUser.id, "CREATE_ACCOUNT", "account", accountId, {
    accountId: parsed.data.accountId,
    userId: parsed.data.userId,
    planId: parsed.data.planId,
    applicationId: resolvedApplicationId,
  });

  const row = await one("SELECT * FROM accounts WHERE id = $1", [accountId]);
  const account = await getAccountDomainByRow(row, true);

  if (resolvedApplicationId) {
    const applicationRow = await one("SELECT * FROM applications WHERE id = $1", [resolvedApplicationId]);
    if (applicationRow) {
      const application = mapApplicationRow(applicationRow);
      const portalUser = mapUserRow(userRow);
      const subject =
        application.locale === "en"
          ? `Trading account delivered • ${account.accountId}`
          : application.locale === "es"
            ? `Cuenta entregada • ${account.accountId}`
            : `Conta entregue • ${account.accountId}`;

      await sendAndLogEmailBestEffort(
        "account.credentials.ready",
        () => sendAccountCredentialsEmail({ application, portalUser, account, loginUrl: buildLoginUrl() }),
        {
          applicationId: application.id,
          userId: portalUser.id,
          recipient: application.email,
          subject,
        },
      );
    }
  }

  return res.status(201).json({ account });
});

app.patch("/api/accounts/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = updateAccountSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload." });

  const row = await one("SELECT * FROM accounts WHERE id = $1", [req.params.id]);
  if (!row) return res.status(404).json({ message: "Account not found." });

  const planRow = await one("SELECT * FROM plans WHERE id = $1", [row.plan_id]);
  if (!planRow) return res.status(500).json({ message: "Plan missing for account." });

  const plan = mapPlanRow(planRow);
  const current = await getAccountDomainByRow(row, true);
  const next = {
    ...current,
    balance: parsed.data.balance ?? current.balance,
    todayPnl: parsed.data.todayPnl ?? current.todayPnl,
    daysTraded: parsed.data.daysTraded ?? current.daysTraded,
    phase: parsed.data.phase ?? current.phase,
    notes: parsed.data.notes === null ? undefined : parsed.data.notes ?? current.notes,
    status: parsed.data.status ?? current.status,
    updatedAt: nowISO(),
  };

  const dailyLimit = (next.initialBalance * plan.dailyLossLimitPct) / 100;
  const point = {
    date: next.updatedAt.slice(0, 10),
    pnl: next.todayPnl,
    balance: next.balance,
    phase: next.phase,
    breachedDailyLimit: next.todayPnl <= -dailyLimit,
  };

  next.performanceSeries = appendPerformancePoint(current.performanceSeries, point);
  const evaluated = evaluateAccount(next, plan, next.updatedAt);

  await saveAccount(evaluated);
  await upsertPerformancePoint(evaluated.id, point);

  // Update credentials if provided
  if (parsed.data.platformLogin || parsed.data.platformPassword || parsed.data.brokerName !== undefined) {
    const credUpdates = [];
    const credValues = [];
    let idx = 1;
    if (parsed.data.platformLogin) { credUpdates.push(`platform_login = $${idx++}`); credValues.push(parsed.data.platformLogin.trim()); }
    if (parsed.data.platformPassword) { credUpdates.push(`platform_password_enc = $${idx++}`); credValues.push(encryptSecret(parsed.data.platformPassword)); }
    if (parsed.data.brokerName !== undefined) { credUpdates.push(`broker_name = $${idx++}`); credValues.push(parsed.data.brokerName || null); }
    credValues.push(evaluated.id);
    if (credUpdates.length > 0) {
      await query(`UPDATE accounts SET ${credUpdates.join(", ")} WHERE id = $${idx}`, credValues);
    }
  }

  await audit(req.authUser.id, "UPDATE_ACCOUNT", "account", evaluated.id, parsed.data);

  const fresh = await one("SELECT * FROM accounts WHERE id = $1", [evaluated.id]);
  return res.json({ account: await getAccountDomainByRow(fresh, true) });
});

app.patch("/api/accounts/:id/status", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload." });

  const result = await query("UPDATE accounts SET status = $1, updated_at = $2 WHERE id = $3", [parsed.data.status, nowISO(), req.params.id]);
  if (result.rowCount === 0) return res.status(404).json({ message: "Account not found." });

  await audit(req.authUser.id, "SET_ACCOUNT_STATUS", "account", req.params.id, parsed.data);
  const row = await one("SELECT * FROM accounts WHERE id = $1", [req.params.id]);
  return res.json({ account: await getAccountDomainByRow(row, true) });
});

app.post("/api/rules/evaluate", requireAuth, requireRole("admin"), async (req, res) => {
  const plans = await getPlans();
  const accounts = await getAccounts({ includeSecrets: true });

  for (const account of accounts) {
    const plan = plans.find((item) => item.id === account.planId);
    if (!plan) continue;
    const evaluated = evaluateAccount(account, plan, nowISO());
    await saveAccount(evaluated);
  }

  await audit(req.authUser.id, "RUN_RULES_EVALUATION", "system", "prop-rules", { accounts: accounts.length });
  res.json({ ok: true, accounts: await getAccounts({ includeSecrets: true }) });
});

app.get("/api/audit-logs", requireAuth, requireRole("admin"), async (_req, res) => {
  const rows = await many("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 200");
  res.json({
    logs: rows.map((row) => ({
      id: row.id,
      actorUserId: row.actor_user_id,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      payload: row.payload,
      createdAt: row.created_at,
    })),
  });
});

app.get("/api/analytics/account/:id", requireAuth, async (req, res) => {
  const row = await one("SELECT * FROM accounts WHERE id = $1", [req.params.id]);
  if (!row) return res.status(404).json({ message: "Account not found." });

  const account = await getAccountDomainByRow(row, true);
  if (req.authUser.role !== "admin" && req.authUser.id !== account.userId) {
    return res.status(403).json({ message: "Forbidden." });
  }

  const planRow = await one("SELECT * FROM plans WHERE id = $1", [account.planId]);
  if (!planRow) return res.status(500).json({ message: "Plan missing." });

  const analytics = buildAccountAnalytics(account, mapPlanRow(planRow), nowISO());
  res.json({ analytics });
});

// ─── ADMIN SETTINGS (bearer token, webhook secret, vacancies control) ─────────

app.get("/api/settings", requireAuth, requireRole("admin"), async (_req, res) => {
  const rows = await many("SELECT key, value, updated_at FROM system_settings WHERE key = ANY($1::text[])", [ALLOWED_SETTINGS]);
  const rowByKey = new Map(rows.map((row) => [row.key, row]));
  const settings = {};

  for (const key of ALLOWED_SETTINGS) {
    const row = rowByKey.get(key);
    const meta = SETTINGS_META[key];
    const rawValue = row?.value?.trim() || meta.defaultValue || "";

    if (meta.sensitive) {
      settings[key] = rawValue
        ? { set: true, preview: `••••${rawValue.slice(-4)}`, updatedAt: row?.updated_at }
        : { set: false, preview: "", updatedAt: row?.updated_at };
      continue;
    }

    settings[key] = {
      set: rawValue.length > 0,
      preview: rawValue,
      updatedAt: row?.updated_at,
    };
  }

  res.json({ settings });
});

app.put("/api/settings", requireAuth, requireRole("admin"), async (req, res) => {
  const body = req.body ?? {};
  const updatedKeys = [];

  for (const key of ALLOWED_SETTINGS) {
    const meta = SETTINGS_META[key];
    const val = body[key];
    if (typeof val !== "string") continue;

    const trimmed = val.trim();
    if (!trimmed) continue;

    let normalized = trimmed;
    if (key === "prop_vacancies_locked") {
      const normalizedBool = trimmed.toLowerCase();
      if (!["true", "false"].includes(normalizedBool)) continue;
      normalized = normalizedBool;
    }

    await query(
      `INSERT INTO system_settings (key, value, updated_at) VALUES ($1, $2, $3)
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = $3`,
      [key, normalized, nowISO()],
    );
    if (meta) updatedKeys.push(key);
  }

  await audit(req.authUser.id, "UPDATE_SETTINGS", "system", "settings", { keys: updatedKeys });
  res.json({ ok: true });
});

// ─── TRADE EVENTS (from Everwin platform webhook) ──────────────────────────────

/** Detect event type from payload shape */
function detectEventType(payload) {
  if (payload.loginAt && payload.userId && payload.ipAddress) return "login";
  if (payload.tradeId && payload.asset) return "trade";
  if (payload.depositId) return "deposit";
  if (payload.withdrawalId) return "withdrawal";
  return "unknown";
}

async function handleEverwinWebhook(req, res) {
  // Auth: X-Webhook-Secret header or Authorization: Bearer {secret}
  const providedSecret =
    req.headers["x-webhook-secret"] ??
    (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : null);

  const storedSecret = await getWebhookSecret();
  if (!storedSecret) {
    return res.status(403).json({ error: "Webhook secret not configured. Configure it in Admin > Settings." });
  }
  const a = Buffer.from(providedSecret ?? "", "utf8");
  const b = Buffer.from(storedSecret, "utf8");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ error: "Invalid webhook secret." });
  }

  const payload = req.body ?? {};
  const eventType = detectEventType(payload);
  const platformUserId = String(payload.userId ?? payload.user_id ?? "unknown");

  // Find linked prop account
  const accountRow = await one("SELECT id, notes, status FROM accounts WHERE platform_user_id = $1", [platformUserId]);
  const propAccountId = accountRow?.id ?? null;

  let flagged = 0;
  let flagReason = null;

  // Trade completed → update account balance/PnL and evaluate rules
  if (eventType === "trade" && accountRow) {
    const profit = Number(payload.profit ?? 0);
    try {
      // Update today's PnL and balance
      await query(
        `UPDATE accounts SET
          balance = balance + $1,
          today_pnl = today_pnl + $1,
          updated_at = $2
        WHERE id = $3`,
        [profit, nowISO(), accountRow.id],
      );

      // Upsert daily performance point
      const tradeDate = (payload.completedAt ?? nowISO()).slice(0, 10);
      const updatedAccountRow = await one("SELECT * FROM accounts WHERE id = $1", [accountRow.id]);
      if (updatedAccountRow) {
        const account = mapAccountRow(updatedAccountRow, true);
        const planRow = await one("SELECT * FROM plans WHERE id = $1", [account.planId]);
        if (planRow) {
          const plan = mapPlanRow(planRow);
          const point = appendPerformancePoint(account, plan, {
            date: tradeDate,
            pnl: profit,
            balance: account.balance,
          });
          await upsertPerformancePoint(account.id, point);

          // Evaluate rules (drawdown, daily limit, timeout, etc.)
          const evaluated = evaluateAccount(account, plan, nowISO());
          await saveAccount(evaluated);
        }
      }
    } catch (tradeErr) {
      console.error("[Webhook] Trade update failed:", tradeErr instanceof Error ? tradeErr.message : tradeErr);
    }
  }

  // Deposits and withdrawals violate prop rules → auto-block
  if (eventType === "deposit" || eventType === "withdrawal") {
    const amount = payload.amount ?? 0;
    const currency = payload.currency ?? "";
    const method = payload.method ?? "";
    flagged = 1;
    flagReason =
      eventType === "deposit"
        ? `Depósito detectado: ${amount} ${currency} via ${method}`
        : `Saque solicitado: ${amount} ${currency} via ${method}`;

    // Block on trading platform (best-effort)
    if (platformUserId !== "unknown") {
      try {
        await blockPlatformUser(platformUserId, `Regra de prop violada: ${flagReason}`);
      } catch (blockErr) {
        console.error("[Everwin Webhook] blockPlatformUser failed:", blockErr.message);
      }
    }

    // Update prop account: set status + append note
    if (accountRow) {
      const existingNotes = accountRow.notes ?? "";
      const autoNote = `[AUTO-BLOQUEIO ${nowISO()}] ${flagReason}`;
      const newNotes = existingNotes ? `${existingNotes}\n${autoNote}` : autoNote;
      await query(
        `UPDATE accounts SET status = 'rejected', notes = $1, updated_at = $2 WHERE id = $3`,
        [newNotes, nowISO(), accountRow.id],
      );
    }
  }

  // Store event
  await query(
    `INSERT INTO trade_events (id, platform_user_id, prop_account_id, event_type, payload, flagged, flag_reason, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [uid("evt"), platformUserId, propAccountId, eventType, JSON.stringify(payload), flagged, flagReason, nowISO()],
  );

  return res.json({ received: true, eventType, flagged: flagged === 1 });
}

// Accept webhook at both paths (production may proxy /prop prefix or not)
app.post("/prop/api/deposit", webhookLimiter, handleEverwinWebhook);
app.post("/api/webhooks/deposit", webhookLimiter, handleEverwinWebhook);

// ─── TRADE EVENTS READ (admin) ─────────────────────────────────────────────────

app.get("/api/accounts/:id/events", requireAuth, requireRole("admin"), async (req, res) => {
  const accountRow = await one("SELECT platform_user_id FROM accounts WHERE id = $1", [req.params.id]);
  if (!accountRow) return res.status(404).json({ message: "Account not found." });

  const platUid = accountRow.platform_user_id ?? "";
  const rows = await many(
    `SELECT * FROM trade_events
     WHERE prop_account_id = $1 OR (platform_user_id = $2 AND $2 != '')
     ORDER BY created_at DESC LIMIT 200`,
    [req.params.id, platUid],
  );

  res.json({
    events: rows.map((r) => ({
      id: r.id,
      platformUserId: r.platform_user_id,
      propAccountId: r.prop_account_id ?? null,
      eventType: r.event_type,
      payload: (() => { try { return JSON.parse(r.payload); } catch { return {}; } })(),
      flagged: r.flagged === 1 || r.flagged === true,
      flagReason: r.flag_reason ?? null,
      createdAt: r.created_at,
    })),
  });
});

// ─── MANUAL PROVISION TRADING PLATFORM (admin) ────────────────────────────────

app.post("/api/accounts/:id/provision-trading", requireAuth, requireRole("admin"), async (req, res) => {
  const accountRow = await one("SELECT * FROM accounts WHERE id = $1", [req.params.id]);
  if (!accountRow) return res.status(404).json({ message: "Account not found." });

  if (accountRow.platform_user_id) {
    return res.status(409).json({ message: "Trading platform account already provisioned.", platformUserId: accountRow.platform_user_id });
  }

  const planRow = await one("SELECT * FROM plans WHERE id = $1", [accountRow.plan_id]);
  if (!planRow) return res.status(404).json({ message: "Plan not found." });

  // Find linked application for user data
  let applicationRow = accountRow.application_id
    ? await one("SELECT * FROM applications WHERE id = $1", [accountRow.application_id])
    : null;

  // Fall back to user data if no application
  const userRow = await one("SELECT * FROM users WHERE id = $1", [accountRow.user_id]);
  if (!userRow) return res.status(404).json({ message: "User not found." });

  const application = applicationRow
    ? mapApplicationRow(applicationRow)
    : {
        firstName: userRow.name?.split(" ")[0] ?? "Usuario",
        lastName: userRow.name?.split(" ").slice(1).join(" ") ?? "",
        email: userRow.email,
        cpf: null,
        documentNumber: null,
        phone: null,
        country: "Brazil",
        city: "—",
      };

  const plan = mapPlanRow(planRow);
  const tempPassword = createTempPassword();

  let platformResult;
  try {
    platformResult = await provisionTradingAccount({ application, plan, temporaryPassword: tempPassword });
  } catch (provErr) {
    console.error("[Provision Trading] failed:", provErr.message);
    return res.status(502).json({ message: `Trading platform provision failed: ${provErr.message}` });
  }

  // Persist platform user ID + email in accounts table
  await query(
    `UPDATE accounts SET platform_user_id = $1, platform_email = $2, updated_at = $3 WHERE id = $4`,
    [platformResult.platformUserId, platformResult.platformEmail, nowISO(), accountRow.id],
  );

  await audit(req.authUser.id, "PROVISION_TRADING_ACCOUNT", "account", accountRow.id, {
    platformUserId: platformResult.platformUserId,
    platformEmail: platformResult.platformEmail,
  });

  res.json({
    ok: true,
    platformUserId: platformResult.platformUserId,
    platformEmail: platformResult.platformEmail,
    temporaryPassword: tempPassword,
  });
});

// ─── PLATFORM USER PROXY (admin reads + actions on api.everwin.trade) ──────────

app.get("/api/platform-users/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const data = await fetchPlatformUser(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(502).json({ message: err instanceof Error ? err.message : "Platform API error" });
  }
});

app.post("/api/platform-users/:id/reset-password", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const tempPass = createTempPassword();
    await resetPlatformPassword(req.params.id, tempPass);
    // Sync in our DB if linked
    const accountRow = await one("SELECT id FROM accounts WHERE platform_user_id = $1", [req.params.id]);
    if (accountRow) {
      await query(
        "UPDATE accounts SET platform_password_enc = $1, updated_at = $2 WHERE id = $3",
        [encryptSecret(tempPass), nowISO(), accountRow.id],
      );
    }
    await audit(req.authUser.id, "RESET_PLATFORM_PASSWORD", "platform_user", req.params.id, {});
    res.json({ ok: true, temporaryPassword: tempPass });
  } catch (err) {
    res.status(502).json({ message: err instanceof Error ? err.message : "Platform API error" });
  }
});

/* ─── Vercel Cron Endpoints ─── */

app.get("/api/cron/reminders", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (process.env.VERCEL && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    await ensurePendingPaymentReminders();
    res.json({ ok: true, job: "reminders" });
  } catch (error) {
    console.error("Cron reminders failed:", error);
    res.status(500).json({ message: "Job failed." });
  }
});

app.get("/api/cron/daily-sync", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (process.env.VERCEL && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    await runDailyAccountSync("cron");
    res.json({ ok: true, job: "daily-sync" });
  } catch (error) {
    console.error("Cron daily-sync failed:", error);
    res.status(500).json({ message: "Job failed." });
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error." });
});

/* ─── Export app for Vercel serverless ─── */

export default app;

/* ─── Standalone mode (local development / traditional server) ─── */

const isVercel = !!process.env.VERCEL;

if (!isVercel) {
  (async function bootstrap() {
    await ensureDb();

    // Cron jobs only run in standalone mode (not serverless)
    cron.schedule(config.reminderCron, () => {
      void ensurePendingPaymentReminders().catch((error) => {
        console.error("Pending reminder job failed:", error);
      });
    });

    cron.schedule(config.dailySyncCron, () => {
      void runDailyAccountSync("cron").catch((error) => {
        console.error("Daily sync job failed:", error);
      });
    });

    const server = app.listen(config.port, () => {
      console.log(`Everwin Prop API running on http://localhost:${config.port}`);
    });

    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => { console.log("HTTP server closed."); });
      try {
        const pool = getPool();
        if (pool) { await pool.end(); console.log("Database pool drained."); }
      } catch {}
      setTimeout(() => process.exit(0), 5000);
    };

    process.on("SIGTERM", () => void shutdown("SIGTERM"));
    process.on("SIGINT", () => void shutdown("SIGINT"));
  })();
}
