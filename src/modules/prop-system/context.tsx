import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  createAccountApi,
  createClientUserApi,
  fetchAccountsApi,
  fetchAuditLogsApi,
  fetchMeApi,
  fetchPlansApi,
  fetchUsersApi,
  hasStoredTokens,
  loginApi,
  logoutApi,
  runRulesEvaluationApi,
  setAccountStatusApi,
  updateAccountApi,
  updateUserStatusApi,
} from "./api";
import type {
  AccountStatus,
  CreateAccountInput,
  CreateClientInput,
  PlanTemplate,
  PropAccount,
  PropSystemState,
  PropUser,
  SessionState,
  UpdateAccountInput,
} from "./types";

type LoginResult = { ok: true; role: "admin" | "client" } | { ok: false; message: string };

interface PropSystemContextValue {
  state: PropSystemState;
  session: SessionState | null;
  currentUser: PropUser | null;
  usersById: Record<string, PropUser>;
  plansById: Record<string, PlanTemplate>;
  bootstrapping: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  createClientUser: (input: CreateClientInput) => Promise<{ ok: true; temporaryPassword?: string } | { ok: false; message: string }>;
  updateUserStatus: (userId: string, status: "active" | "blocked") => Promise<void>;
  createAccount: (input: CreateAccountInput) => Promise<{ ok: true } | { ok: false; message: string }>;
  updateAccount: (input: UpdateAccountInput) => Promise<{ ok: true } | { ok: false; message: string }>;
  setAccountStatus: (accountId: string, status: AccountStatus) => Promise<void>;
  runRulesEvaluation: () => Promise<void>;
  getUserAccounts: (userId: string) => PropAccount[];
  refreshAll: () => Promise<void>;
}

const PropSystemContext = createContext<PropSystemContextValue | null>(null);

const INITIAL_STATE: PropSystemState = {
  users: [],
  plans: [],
  accounts: [],
  auditLogs: [],
};

export function PropSystemProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [state, setState] = useState<PropSystemState>(INITIAL_STATE);
  const [session, setSession] = useState<SessionState | null>(null);
  const [currentUser, setCurrentUser] = useState<PropUser | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  const loadStateForUser = useCallback(async (user: PropUser) => {
    const [plans, accounts] = await Promise.all([fetchPlansApi(), fetchAccountsApi()]);

    if (user.role === "admin") {
      const [users, auditLogs] = await Promise.all([fetchUsersApi(), fetchAuditLogsApi()]);
      setState({ users, plans, accounts, auditLogs });
      return;
    }

    setState({ users: [user], plans, accounts, auditLogs: [] });
  }, []);

  const refreshAll = useCallback(async () => {
    if (!currentUser) return;
    await loadStateForUser(currentUser);
  }, [currentUser, loadStateForUser]);

  const translateErrorMessage = useCallback((message: string | undefined, fallbackKey: string) => {
    const map: Record<string, string> = {
      "Invalid credentials": "prop_portal.errors.invalid_credentials",
      "Invalid credentials.": "prop_portal.errors.invalid_credentials",
      "User blocked.": "prop_portal.errors.user_blocked",
      "E-mail already registered.": "prop_portal.errors.email_registered",
      "Client not found.": "prop_portal.errors.client_not_found",
      "Plan not found.": "prop_portal.errors.plan_not_found",
      "Account ID already exists.": "prop_portal.errors.account_id_exists",
      "Account not found.": "prop_portal.errors.account_not_found",
      "Internal server error.": "prop_portal.errors.internal_error",
    };

    if (message && map[message]) {
      return t(map[message]);
    }

    return message ?? t(fallbackKey);
  }, [t]);

  useEffect(() => {
    let active = true;

    // Skip API call if no tokens stored — avoids 401 redirect on public pages
    if (!hasStoredTokens()) {
      setBootstrapping(false);
      return;
    }

    (async () => {
      try {
        const user = await fetchMeApi();
        if (!active) return;
        setCurrentUser(user);
        setSession({ userId: user.id, loginAt: new Date().toISOString() });
        await loadStateForUser(user);
      } catch {
        if (!active) return;
        setCurrentUser(null);
        setSession(null);
        setState(INITIAL_STATE);
      } finally {
        if (active) setBootstrapping(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [loadStateForUser]);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    try {
      const user = await loginApi(email, password);
      setCurrentUser(user);
      setSession({ userId: user.id, loginAt: new Date().toISOString() });
      await loadStateForUser(user);
      return { ok: true, role: user.role };
    } catch (error) {
      return {
        ok: false,
        message: translateErrorMessage(error instanceof Error ? error.message : undefined, "prop_portal.errors.login_failed"),
      };
    }
  }, [loadStateForUser, translateErrorMessage]);

  const logout = useCallback(async () => {
    await logoutApi();
    setCurrentUser(null);
    setSession(null);
    setState(INITIAL_STATE);
  }, []);

  const createClientUser = useCallback(async (input: CreateClientInput) => {
    if (!currentUser || currentUser.role !== "admin") {
      return { ok: false as const, message: t("prop_portal.errors.only_admin_create_users") };
    }

    try {
      const response = await createClientUserApi(input);
      await loadStateForUser(currentUser);
      return { ok: true as const, temporaryPassword: response.temporaryPassword };
    } catch (error) {
      return {
        ok: false as const,
        message: translateErrorMessage(error instanceof Error ? error.message : undefined, "prop_portal.errors.create_client_failed"),
      };
    }
  }, [currentUser, loadStateForUser, t, translateErrorMessage]);

  const updateUserStatus = useCallback(async (userId: string, status: "active" | "blocked") => {
    await updateUserStatusApi(userId, status);
    if (currentUser) {
      await loadStateForUser(currentUser);
    }
  }, [currentUser, loadStateForUser]);

  const createAccount = useCallback(async (input: CreateAccountInput) => {
    if (!currentUser || currentUser.role !== "admin") {
      return { ok: false as const, message: t("prop_portal.errors.only_admin_create_accounts") };
    }

    try {
      await createAccountApi(input);
      await loadStateForUser(currentUser);
      return { ok: true as const };
    } catch (error) {
      return {
        ok: false as const,
        message: translateErrorMessage(error instanceof Error ? error.message : undefined, "prop_portal.errors.create_account_failed"),
      };
    }
  }, [currentUser, loadStateForUser, t, translateErrorMessage]);

  const updateAccount = useCallback(async (input: UpdateAccountInput) => {
    if (!currentUser || currentUser.role !== "admin") {
      return { ok: false as const, message: t("prop_portal.errors.only_admin_update_accounts") };
    }

    try {
      await updateAccountApi(input.accountId, {
        status: input.status,
        balance: input.balance,
        todayPnl: input.todayPnl,
        daysTraded: input.daysTraded,
        notes: input.notes,
        phase: input.phase,
        platformLogin: input.platformLogin,
        platformPassword: input.platformPassword,
        brokerName: input.brokerName,
      });
      await loadStateForUser(currentUser);

      return { ok: true as const };
    } catch (error) {
      return {
        ok: false as const,
        message: translateErrorMessage(error instanceof Error ? error.message : undefined, "prop_portal.errors.update_account_failed"),
      };
    }
  }, [currentUser, loadStateForUser, t, translateErrorMessage]);

  const setAccountStatus = useCallback(async (accountId: string, status: AccountStatus) => {
    await setAccountStatusApi(accountId, status);
    if (currentUser) {
      await loadStateForUser(currentUser);
    }
  }, [currentUser, loadStateForUser]);

  const runRulesEvaluation = useCallback(async () => {
    await runRulesEvaluationApi();
    if (currentUser) {
      await loadStateForUser(currentUser);
    }
  }, [currentUser, loadStateForUser]);

  const getUserAccounts = useCallback(
    (userId: string) => {
      return state.accounts.filter((account) => account.userId === userId);
    },
    [state.accounts],
  );

  const usersById = useMemo(() => Object.fromEntries(state.users.map((u) => [u.id, u])), [state.users]);
  const plansById = useMemo(() => Object.fromEntries(state.plans.map((p) => [p.id, p])), [state.plans]);

  const value = useMemo<PropSystemContextValue>(
    () => ({
      state,
      session,
      currentUser,
      usersById,
      plansById,
      bootstrapping,
      login,
      logout,
      createClientUser,
      updateUserStatus,
      createAccount,
      updateAccount,
      setAccountStatus,
      runRulesEvaluation,
      getUserAccounts,
      refreshAll,
    }),
    [
      state,
      session,
      currentUser,
      usersById,
      plansById,
      bootstrapping,
      login,
      logout,
      createClientUser,
      updateUserStatus,
      createAccount,
      updateAccount,
      setAccountStatus,
      runRulesEvaluation,
      getUserAccounts,
      refreshAll,
    ],
  );

  return <PropSystemContext.Provider value={value}>{children}</PropSystemContext.Provider>;
}

export function usePropSystem() {
  const ctx = useContext(PropSystemContext);
  if (!ctx) {
    throw new Error("usePropSystem must be used within PropSystemProvider");
  }
  return ctx;
}
