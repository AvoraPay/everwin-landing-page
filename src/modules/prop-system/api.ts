import type {
  AccountStatus,
  AdminSubmissionListItem,
  AuditLog,
  ClientSubmissionItem,
  CreateAccountInput,
  CreateClientInput,
  CreateSubmissionInput,
  PlanTemplate,
  PropAccount,
  PropPayment,
  PropSubmission,
  PropUser,
  PublicSubmissionsConfig,
  PublicSubmissionBundle,
  SystemSetting,
  TradeEvent,
  UpdateAccountInput,
} from "./types";

// In production (Vercel), frontend and API share the same origin — use relative /api path.
// In development, VITE_PROP_API_URL points to the local Express server.
const API_BASE = (import.meta.env.VITE_PROP_API_URL as string | undefined) || "/api";

const ACCESS_TOKEN_KEY = "everwin-prop-access-token";
const REFRESH_TOKEN_KEY = "everwin-prop-refresh-token";

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: PropUser;
};

let refreshingPromise: Promise<boolean> | null = null;

function toNetworkError(error: unknown) {
  if (error instanceof TypeError) {
    return new Error("Could not reach the Prop API. Start the backend and confirm the database connection.");
  }
  return error instanceof Error ? error : new Error("Unexpected network error.");
}

export function hasStoredTokens(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window.localStorage.getItem(ACCESS_TOKEN_KEY) || window.localStorage.getItem(REFRESH_TOKEN_KEY));
}

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

function setTokens(accessToken: string, refreshToken: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function refreshTokens(): Promise<boolean> {
  if (refreshingPromise) return refreshingPromise;

  refreshingPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    let response: Response;
    try {
      response = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      clearTokens();
      return false;
    }

    if (!response.ok) {
      clearTokens();
      return false;
    }

    const data = (await response.json()) as LoginResponse;
    setTokens(data.accessToken, data.refreshToken);
    return true;
  })();

  try {
    return await refreshingPromise;
  } finally {
    refreshingPromise = null;
  }
}

async function request<T>(path: string, init?: RequestInit, retry = true): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(init?.headers ?? {});
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
    });
  } catch (error) {
    throw toNetworkError(error);
  }

  if (response.status === 401 && retry) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      return request<T>(path, init, false);
    }
    // Only redirect to login if user had a token (actual session expiry).
    // If there was no token, this is a bootstrap check — just throw.
    if (token && typeof window !== "undefined" && !window.location.pathname.includes("/prop/login")) {
      window.location.href = "/prop/login";
    }
    throw new Error("Session expired.");
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const payload = (await response.json()) as { message?: string };
      if (payload.message) message = payload.message;
    } catch {
      // noop
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function loginApi(email: string, password: string): Promise<PropUser> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch (error) {
    throw toNetworkError(error);
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(payload.message ?? "Invalid credentials");
  }

  const data = (await response.json()) as LoginResponse;
  setTokens(data.accessToken, data.refreshToken);
  return data.user;
}

export async function logoutApi(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => undefined);
  }
  clearTokens();
}

export async function fetchMeApi(): Promise<PropUser> {
  const data = await request<{ user: PropUser }>("/auth/me", { method: "GET" });
  return data.user;
}

export async function fetchPlansApi(): Promise<PlanTemplate[]> {
  const data = await request<{ plans: PlanTemplate[] }>("/plans", { method: "GET" });
  return data.plans;
}

export async function fetchUsersApi(): Promise<PropUser[]> {
  const data = await request<{ users: PropUser[] }>("/users", { method: "GET" });
  return data.users;
}

export async function createClientUserApi(input: CreateClientInput): Promise<{ user: PropUser; temporaryPassword?: string }> {
  const data = await request<{ user: PropUser; temporaryPassword?: string }>("/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data;
}

export async function updateUserStatusApi(userId: string, status: "active" | "blocked"): Promise<void> {
  await request<{ ok: true }>(`/users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function fetchAccountsApi(): Promise<PropAccount[]> {
  const data = await request<{ accounts: PropAccount[] }>("/accounts", { method: "GET" });
  return data.accounts;
}

export async function createAccountApi(input: CreateAccountInput): Promise<PropAccount> {
  const data = await request<{ account: PropAccount }>("/accounts", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.account;
}

export async function updateAccountApi(accountId: string, input: Omit<UpdateAccountInput, "accountId">): Promise<PropAccount> {
  const data = await request<{ account: PropAccount }>(`/accounts/${accountId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return data.account;
}

export async function setAccountStatusApi(accountId: string, status: AccountStatus): Promise<PropAccount> {
  const data = await request<{ account: PropAccount }>(`/accounts/${accountId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return data.account;
}

export async function runRulesEvaluationApi(): Promise<PropAccount[]> {
  const data = await request<{ ok: true; accounts: PropAccount[] }>("/rules/evaluate", {
    method: "POST",
    body: JSON.stringify({}),
  });
  return data.accounts;
}

export async function fetchAuditLogsApi(): Promise<AuditLog[]> {
  const data = await request<{ logs: AuditLog[] }>("/audit-logs", { method: "GET" });
  return data.logs;
}

export async function createSubmissionApi(input: CreateSubmissionInput): Promise<{
  reused: boolean;
  submissionCode: string;
  application: PropSubmission;
  payment: PropPayment | null;
}> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/public/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch (error) {
    throw toNetworkError(error);
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(payload.message ?? "Submission failed");
  }

  return (await response.json()) as {
    reused: boolean;
    submissionCode: string;
    application: PropSubmission;
    payment: PropPayment | null;
  };
}

export async function fetchSubmissionByCodeApi(code: string): Promise<PublicSubmissionBundle> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/public/submissions/${code}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    throw toNetworkError(error);
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(payload.message ?? "Submission not found");
  }

  return (await response.json()) as PublicSubmissionBundle;
}

export async function fetchPublicSubmissionsConfigApi(): Promise<PublicSubmissionsConfig> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/public/submissions-config`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    throw toNetworkError(error);
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(payload.message ?? "Failed to load submissions config");
  }

  return (await response.json()) as PublicSubmissionsConfig;
}

export async function requestPasswordOtpApi(email: string): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/public/password/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  } catch (error) {
    throw toNetworkError(error);
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(payload.message ?? "OTP request failed");
  }
}

export async function confirmPasswordOtpApi(email: string, otp: string, newPassword: string): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/public/password/confirm-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword }),
    });
  } catch (error) {
    throw toNetworkError(error);
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(payload.message ?? "OTP confirmation failed");
  }
}

export async function fetchUserSubmissionsApi(userId: string): Promise<Array<{ id: string; submissionCode: string; email: string; status: string; createdAt: string }>> {
  const data = await request<{ submissions: Array<{ id: string; submissionCode: string; email: string; status: string; createdAt: string }> }>(`/users/${userId}/submissions`, { method: "GET" });
  return data.submissions;
}

export async function fetchSubmissionsApi(): Promise<AdminSubmissionListItem[]> {
  const data = await request<{ submissions: AdminSubmissionListItem[] }>("/submissions", { method: "GET" });
  return data.submissions;
}

export async function updateSubmissionPaymentApi(
  applicationId: string,
  input: { status: "pending" | "overdue" | "approved" | "failed" | "cancelled"; checkoutUrl?: string; externalReference?: string; adminNotes?: string },
): Promise<PublicSubmissionBundle> {
  return request<PublicSubmissionBundle>(`/submissions/${applicationId}/payment`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function updateSubmissionStatusApi(
  applicationId: string,
  input: { status: "submitted" | "payment_pending" | "payment_overdue" | "payment_approved" | "under_review" | "access_ready" | "account_ready" | "rejected" | "cancelled"; adminNotes?: string },
): Promise<PublicSubmissionBundle> {
  return request<PublicSubmissionBundle>(`/submissions/${applicationId}/status`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function provisionSubmissionAccessApi(
  applicationId: string,
  input?: { rotatePassword?: boolean },
): Promise<PublicSubmissionBundle> {
  return request<PublicSubmissionBundle>(`/submissions/${applicationId}/provision-access`, {
    method: "POST",
    body: JSON.stringify(input ?? {}),
  });
}

export async function releasePaymentLinkApi(
  applicationId: string,
  input: { checkoutUrl: string; adminNotes?: string },
): Promise<PublicSubmissionBundle> {
  return request<PublicSubmissionBundle>(`/submissions/${applicationId}/release-payment`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function fetchSettingsApi(): Promise<Record<string, SystemSetting>> {
  const data = await request<{ settings: Record<string, SystemSetting> }>("/settings", { method: "GET" });
  return data.settings;
}

export async function updateSettingsApi(settings: Record<string, string>): Promise<void> {
  await request<{ ok: true }>("/settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
}

export async function fetchAccountEventsApi(accountId: string): Promise<TradeEvent[]> {
  const data = await request<{ events: TradeEvent[] }>(`/accounts/${accountId}/events`, { method: "GET" });
  return data.events;
}

export async function fetchMySubmissionsApi(): Promise<ClientSubmissionItem[]> {
  return request<ClientSubmissionItem[]>("/my/submissions", { method: "GET" });
}

export async function fetchMyAccountEventsApi(accountId: string): Promise<TradeEvent[]> {
  const data = await request<{ events: TradeEvent[] }>(`/my/account-events/${accountId}`, { method: "GET" });
  return data.events;
}

export async function fetchPlatformUserApi(platformUserId: string): Promise<Record<string, unknown>> {
  return request(`/platform-users/${platformUserId}`, { method: "GET" });
}

export async function resetPlatformPasswordApi(platformUserId: string): Promise<{ ok: true; temporaryPassword: string }> {
  return request(`/platform-users/${platformUserId}/reset-password`, { method: "POST", body: JSON.stringify({}) });
}

export async function provisionTradingPlatformApi(accountId: string): Promise<{
  ok: true;
  platformUserId: string;
  platformEmail: string;
  temporaryPassword: string;
}> {
  return request(`/accounts/${accountId}/provision-trading`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}
