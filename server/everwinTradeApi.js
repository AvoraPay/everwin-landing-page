/**
 * Client for the Everwin trading platform admin API (api.everwin.trade).
 * Handles provisioning new trading accounts when prop submissions are approved
 * and enforcing rules (auto-block on deposit/withdrawal).
 */

import { one } from "./db.js";

const EVERWIN_API_BASE = "https://api.everwin.trade";

/** Reads admin bearer token from DB system_settings (admin can update it in the panel) */
export async function getAdminToken() {
  const row = await one("SELECT value FROM system_settings WHERE key = $1", ["everwin_admin_bearer"]);
  return row?.value ?? process.env.EVERWIN_ADMIN_BEARER ?? "";
}

export async function getWebhookSecret() {
  const row = await one("SELECT value FROM system_settings WHERE key = $1", ["everwin_webhook_secret"]);
  return row?.value ?? process.env.EVERWIN_WEBHOOK_SECRET ?? "";
}

async function adminApi(method, path, body) {
  const token = await getAdminToken();
  if (!token) {
    throw new Error("Everwin admin bearer token not configured. Set it in Admin > Configurações.");
  }

  const init = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  if (body !== undefined && body !== null) {
    init.body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(`${EVERWIN_API_BASE}${path}`, init);
  } catch (err) {
    throw new Error(`Network error calling Everwin API: ${err instanceof Error ? err.message : String(err)}`);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message ?? data?.error ?? `Everwin API error ${res.status} on ${path}`);
  }
  return data;
}

/** Build a platform username from name — e.g. "João Da Silva" → "joaodasilva" */
function buildPlatformUsername(firstName, lastName) {
  const clean = (s) =>
    (s ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
  return (clean(firstName) + clean(lastName)).slice(0, 28) || "usuario";
}

export async function createPlatformUser({ email, username, password, firstName, lastName, country }) {
  return adminApi("POST", "/api/auth/register", { email, username, password, firstName, lastName, country: country ?? "Brazil" });
}

export async function updatePlatformUser(userId, data) {
  return adminApi("PUT", `/api/admin/users/${userId}`, data);
}

export async function verifyPlatformEmail(userId) {
  return adminApi("POST", `/api/admin/users/${userId}/verify-email`, { reason: "Validação manual pelo admin" });
}

export async function markPlatformMarketing(userId) {
  return adminApi("POST", `/api/admin/users/${userId}/marketing`, {});
}

export async function addPlatformBalance(userId, { currency, amount, reason }) {
  return adminApi("POST", `/api/admin/users/${userId}/balance/add`, { currency, amount, reason });
}

export async function resetPlatformPassword(userId, newPassword) {
  return adminApi("POST", `/api/admin/users/${userId}/reset-password`, { newPassword });
}

export async function blockPlatformUser(userId, reason) {
  return adminApi("POST", `/api/admin/users/${userId}/block`, { reason });
}

export async function fetchPlatformUser(userId) {
  return adminApi("GET", `/api/admin/users/${userId}`);
}

export async function unblockPlatformUser(userId, reason) {
  return adminApi("POST", `/api/admin/users/${userId}/unblock`, { reason });
}

/**
 * Full 6-step provision sequence when a submission payment is approved:
 * 1. Create user → email: username@everwin.trade
 * 2. Update profile with real form data (name, cpf, phone, city, country)
 * 3. Verify email manually
 * 4. Mark as marketing/influencer
 * 5. Add balance = plan.accountSize (in plan.currency)
 * 6. Set temporaryPassword via reset-password
 *
 * @returns { platformUserId, platformEmail, username }
 */
export async function provisionTradingAccount({ application, plan, temporaryPassword }) {
  const fn = (application.firstName ?? "").trim().toUpperCase();
  const ln = (application.lastName ?? "").trim().toUpperCase();

  let username = buildPlatformUsername(application.firstName, application.lastName);
  let platformEmail = `${username}@everwin.trade`;

  const country = application.country ?? "Brazil";

  // Step 1 — Create user via /api/auth/register; retry with suffix if username/email taken
  let createRes;
  try {
    createRes = await createPlatformUser({
      email: platformEmail,
      username,
      password: temporaryPassword,
      firstName: fn,
      lastName: ln,
      country,
    });
  } catch {
    const suffix = String(Math.floor(Math.random() * 9000) + 1000);
    username = `${username.slice(0, 24)}${suffix}`;
    platformEmail = `${username}@everwin.trade`;
    createRes = await createPlatformUser({
      email: platformEmail,
      username,
      password: temporaryPassword,
      firstName: fn,
      lastName: ln,
      country,
    });
  }

  const platformUserId = createRes.user?.id ?? createRes.id;
  if (!platformUserId) throw new Error("Platform API did not return a user ID.");
  const finalEmail = createRes.user?.email ?? platformEmail;

  // Step 2 — Update profile with real data (best-effort: CPF conflicts are non-fatal)
  try {
    await updatePlatformUser(platformUserId, {
      email: finalEmail,
      username,
      firstName: fn,
      lastName: ln,
      cpf: application.cpf ?? application.documentNumber ?? undefined,
      phone: application.phone ?? undefined,
      country,
      city: application.city ?? "—",
      dateOfBirth: null,
    });
  } catch (updateErr) {
    // CPF conflict or similar — log and continue (user was already created)
    console.warn("[Provision] Profile update warning:", updateErr instanceof Error ? updateErr.message : String(updateErr));
  }

  // Step 3 — Verify email
  await verifyPlatformEmail(platformUserId);

  // Step 4 — Mark as marketing
  await markPlatformMarketing(platformUserId);

  // Step 5 — Add balance
  await addPlatformBalance(platformUserId, {
    currency: plan.currency ?? "BRL",
    amount: plan.accountSize,
    reason: "Usuário de prop trading - SAQUE NÃO PERMITIDO",
  });

  // Step 6 — Set password
  await resetPlatformPassword(platformUserId, temporaryPassword);

  return { platformUserId, platformEmail: finalEmail, username };
}
