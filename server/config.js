import "dotenv/config";

const isProduction = process.env.NODE_ENV === "production";

const DEFAULT_ACCESS_SECRET = "dev-everwin-access-secret-change-me";
const DEFAULT_REFRESH_SECRET = "dev-everwin-refresh-secret-change-me";
const DEFAULT_DATA_SECRET = "dev-everwin-data-secret-change-me";

if (isProduction) {
  if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET || !process.env.PROP_DATA_SECRET) {
    throw new Error("Missing required security env vars in production: JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, PROP_DATA_SECRET");
  }
}

const rawDatabaseUrl = process.env.DATABASE_URL ?? "";
const rawCorsOrigins = process.env.PROP_CORS_ORIGIN ?? "";

export const config = {
  isProduction,
  port: Number(process.env.PROP_API_PORT ?? 8787),
  corsOrigins: rawCorsOrigins
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
  appBaseUrl: process.env.APP_BASE_URL ?? "http://localhost:5173",
  portalDomain: process.env.PROP_PORTAL_EMAIL_DOMAIN ?? "everwin.trade",
  accessTokenSecret: process.env.JWT_ACCESS_SECRET ?? DEFAULT_ACCESS_SECRET,
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET ?? DEFAULT_REFRESH_SECRET,
  dataSecret: process.env.PROP_DATA_SECRET ?? DEFAULT_DATA_SECRET,
  accessTokenTtl: (process.env.JWT_ACCESS_TTL ?? "15m").trim(),
  refreshTokenTtl: (process.env.JWT_REFRESH_TTL ?? "7d").trim(),
  databaseUrl: rawDatabaseUrl,
  databasePoolUrl: process.env.DATABASE_POOL_URL ?? "",
  databaseSsl: (process.env.PROP_DATABASE_SSL ?? "true") !== "false",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  resendFrom: process.env.RESEND_FROM_EMAIL ?? "Everwin Prop <prop@everwin.trade>",
  supportEmail: process.env.SUPPORT_EMAIL ?? "support@everwin.capital",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  reminderCron: process.env.PROP_REMINDER_CRON ?? "*/10 * * * *",
  dailySyncCron: process.env.PROP_DAILY_SYNC_CRON ?? "0 3 * * *",
  paymentProvider: process.env.PROP_PAYMENT_PROVIDER ?? "manual_link",
  defaultCheckoutBaseUrl: process.env.PROP_CHECKOUT_BASE_URL ?? "",
  viteSupabaseUrl: process.env.VITE_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  viteSupabasePublishableKey:
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    "",
};

if (!config.databaseUrl) {
  console.warn("DATABASE_URL is not configured. Supabase/Postgres-backed flows will fail until this env is set.");
}
