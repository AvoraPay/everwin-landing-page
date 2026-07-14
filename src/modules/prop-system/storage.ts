import type { DailyPerformancePoint, PlanTemplate, PropAccount, PropSystemState, PropUser, SessionState } from "./types";

const STORAGE_KEY = "everwin-prop-system-v1";
const SESSION_KEY = "everwin-prop-session-v1";

function nowISO() {
  return new Date().toISOString();
}

function uid(prefix: string): string {
  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  return `${prefix}_${id}`;
}

export function loadPropSystemState(): PropSystemState {
  if (typeof window === "undefined") {
    return { users: [], plans: [], accounts: [], auditLogs: [] };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    // Return empty state - all data comes from API
    return { users: [], plans: [], accounts: [], auditLogs: [] };
  }

  try {
    return normalizeState(JSON.parse(raw) as PropSystemState);
  } catch {
    return { users: [], plans: [], accounts: [], auditLogs: [] };
  }
}

function normalizeState(state: PropSystemState): PropSystemState {
  const normalizedAccounts = state.accounts.map((account) => {
    if (Array.isArray(account.performanceSeries) && account.performanceSeries.length > 0) {
      return account;
    }

    const bootstrapDate = (account.updatedAt ?? new Date().toISOString()).slice(0, 10);
    const fallbackSeries: DailyPerformancePoint[] = [
      {
        date: bootstrapDate,
        pnl: account.todayPnl ?? 0,
        balance: account.balance ?? account.initialBalance,
        phase: account.phase,
        breachedDailyLimit: false,
      },
    ];

    return {
      ...account,
      performanceSeries: fallbackSeries,
    };
  });

  return {
    ...state,
    accounts: normalizedAccounts,
  };
}

export function savePropSystemState(state: PropSystemState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadSessionState(): SessionState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SessionState;
  } catch {
    return null;
  }
}

export function saveSessionState(session: SessionState | null) {
  if (typeof window === "undefined") return;
  if (!session) {
    window.localStorage.removeItem(SESSION_KEY);
    return;
  }
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function makeId(prefix: string): string {
  return uid(prefix);
}
