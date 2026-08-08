import "dotenv/config";
import { randomBytes } from "node:crypto";

const isProduction = process.env.NODE_ENV === "production";

// A published constant is a signing key anyone can use. These fall back to a
// value that is random per process instead: development still runs without a
// .env, but a token forged against the source tree never verifies anywhere.
const DEFAULT_ACCESS_SECRET = randomBytes(48).toString("hex");
const DEFAULT_REFRESH_SECRET = randomBytes(48).toString("hex");
const DEFAULT_DATA_SECRET = randomBytes(48).toString("hex");

// NODE_ENV alone is not a reliable signal of "this is the real deployment", so
// any Vercel runtime counts too. Booting a hosted instance on throwaway keys
// would silently invalidate every session on each cold start.
if (isProduction || process.env.VERCEL) {
  if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET || !process.env.PROP_DATA_SECRET) {
    throw new Error("Missing required security env vars: JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, PROP_DATA_SECRET");
  }
}

/**
 * Env values pasted through dashboards routinely carry trailing newlines or
 * quotes. Untrimmed, a value of "\n" is truthy and silently wins over a real
 * fallback — that is how the plan checkout links were once blanked out.
 */
function env(name, fallback = "") {
  const raw = process.env[name];
  if (raw === undefined || raw === null) return fallback;
  const cleaned = raw.trim().replace(/^["']|["']$/g, "").trim();
  return cleaned === "" ? fallback : cleaned;
}

/** Production must work even if an env var is missing or was pasted blank. */
const PROD_BASE_URL = "https://www.everwin.capital";
const PROD_CORS = "https://everwin.capital,https://www.everwin.capital";

const rawDatabaseUrl = env("DATABASE_URL");
const rawCorsOrigins = env("PROP_CORS_ORIGIN", isProduction ? PROD_CORS : "");

export const config = {
  isProduction,
  port: Number(env("PROP_API_PORT", "8787")),
  corsOrigins: rawCorsOrigins
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
  appBaseUrl: env("APP_BASE_URL", isProduction ? PROD_BASE_URL : "http://localhost:5173"),
  portalDomain: env("PROP_PORTAL_EMAIL_DOMAIN", "everwin.capital"),
  accessTokenSecret: env("JWT_ACCESS_SECRET", DEFAULT_ACCESS_SECRET),
  refreshTokenSecret: env("JWT_REFRESH_SECRET", DEFAULT_REFRESH_SECRET),
  dataSecret: env("PROP_DATA_SECRET", DEFAULT_DATA_SECRET),
  accessTokenTtl: env("JWT_ACCESS_TTL", "15m"),
  refreshTokenTtl: env("JWT_REFRESH_TTL", "7d"),
  databaseUrl: rawDatabaseUrl,
  databasePoolUrl: env("DATABASE_POOL_URL"),
  databaseSsl: env("PROP_DATABASE_SSL", "true") !== "false",
  resendApiKey: env("RESEND_API_KEY"),
  // Must be a domain verified in the Resend account — everwin.capital is the
  // only one there, so everwin.trade would be rejected at send time.
  resendFrom: env("RESEND_FROM_EMAIL", "Everwin Prop <prop@everwin.capital>"),
  emailLogoUrl: env("EMAIL_LOGO_URL", "https://i.postimg.cc/RFLkLvK0/everwin-logo.png"),
  emailReplyTo: env("EMAIL_REPLY_TO", ""),
  supportEmail: env("SUPPORT_EMAIL", "support@everwin.capital"),
  stripeSecretKey: env("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: env("STRIPE_WEBHOOK_SECRET"),
  reminderCron: env("PROP_REMINDER_CRON", "*/10 * * * *"),
  dailySyncCron: env("PROP_DAILY_SYNC_CRON", "0 3 * * *"),
  paymentProvider: env("PROP_PAYMENT_PROVIDER", "manual_link"),
  // Only honoured when it is a real URL — a stray newline must never win here.
  defaultCheckoutBaseUrl: /^https?:\/\//.test(env("PROP_CHECKOUT_BASE_URL")) ? env("PROP_CHECKOUT_BASE_URL") : "",
  viteSupabaseUrl: env("VITE_SUPABASE_URL") || env("NEXT_PUBLIC_SUPABASE_URL"),
  viteSupabasePublishableKey:
    env("VITE_SUPABASE_PUBLISHABLE_KEY") || env("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY"),
};

if (!config.databaseUrl) {
  console.warn("DATABASE_URL is not configured. Supabase/Postgres-backed flows will fail until this env is set.");
}
