import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarClock,
  Monitor,
  RefreshCw,
  ShieldCheck,
  WalletCards,
  Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Select } from "../../../../components/ui/select";
import { Textarea } from "../../../../components/ui/textarea";
import { usePropSystem } from "../../context";
import {
  fetchAccountEventsApi,
  fetchUserSubmissionsApi,
  provisionTradingPlatformApi,
} from "../../api";
import {
  buildAccountAnalytics,
  currencyBRL,
  formatPropDate,
  formatPropDateTime,
  getPlanById,
} from "../../rules";
import {
  formatSignedCurrency,
  formatSignedPercent,
  getAccountStatusMeta,
  getDaysRemaining,
  getRiskLabel,
  getRiskTone,
} from "../../portal-presentation";
import {
  PortalDrawer,
  PortalEmptyState,
  PortalField,
  PortalFilterBar,
  PortalFilterChip,
  PortalLoadingState,
  PortalMetricList,
  PortalPageHeader,
  PortalPagination,
  PortalSearchInput,
  PortalSection,
  PortalStatCard,
  PortalStatusPill,
  PortalSurface,
} from "../../portal-ui";
import type { AccountStatus, PropAccount, TradeEvent } from "../../types";
import { useTheme } from "../../theme";
import { EdgeScoreDial } from "../components/charts/EdgeScoreDial";
import { InteractiveLineChart } from "../components/charts/InteractiveLineChart";

type StatusFilter = "all" | AccountStatus;
type UserSubmission = { id: string; submissionCode: string; email: string; status: string; createdAt: string };

const STATUS_OPTIONS: AccountStatus[] = [
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

const PAGE_SIZE = 8;

export function AdminAccountsPage() {
  const { state, usersById, createAccount, updateAccount, runRulesEvaluation } = usePropSystem();
  const { i18n } = useTranslation();
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();

  const clients = useMemo(
    () => state.users.filter((user) => user.role === "client" && user.status === "active"),
    [state.users],
  );

  const [form, setForm] = useState({
    userId: searchParams.get("userId") ?? clients[0]?.id ?? "",
    planId: searchParams.get("planId") ?? state.plans[0]?.id ?? "",
    submissionCode: searchParams.get("submissionCode") ?? "",
    accountId: "",
    platformLogin: "",
    platformPassword: "",
    brokerName: "",
    startDate: new Date().toISOString().slice(0, 10),
    notes: "",
  });
  const [userSubmissions, setUserSubmissions] = useState<UserSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [createFeedback, setCreateFeedback] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [drawerAccountId, setDrawerAccountId] = useState<string | null>(null);
  const [savingAccount, setSavingAccount] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [events, setEvents] = useState<TradeEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [provisioningId, setProvisioningId] = useState<string | null>(null);
  const [provisionResult, setProvisionResult] = useState<{ accountId: string; platformEmail: string; tempPass: string } | null>(null);
  const [editState, setEditState] = useState({
    status: "active" as AccountStatus,
    phase: "1",
    balance: "",
    todayPnl: "",
    daysTraded: "",
    platformLogin: "",
    platformPassword: "",
    brokerName: "",
    notes: "",
  });

  const deferredQuery = useDeferredValue(query);
  const nowISO = new Date().toISOString();

  useEffect(() => {
    if (!form.userId) {
      setUserSubmissions([]);
      return;
    }

    let active = true;
    setLoadingSubmissions(true);

    fetchUserSubmissionsApi(form.userId)
      .then((items) => {
        if (active) setUserSubmissions(items);
      })
      .catch(() => {
        if (active) setUserSubmissions([]);
      })
      .finally(() => {
        if (active) setLoadingSubmissions(false);
      });

    return () => {
      active = false;
    };
  }, [form.userId]);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      userId: current.userId || clients[0]?.id || "",
      planId: current.planId || state.plans[0]?.id || "",
    }));
  }, [clients, state.plans]);

  const accountViews = useMemo(() => {
    return state.accounts.map((account) => {
      const plan = getPlanById(state.plans, account.planId);
      const analytics = buildAccountAnalytics(account, plan, nowISO);
      return { account, plan, analytics };
    });
  }, [nowISO, state.accounts, state.plans]);

  const filteredAccounts = useMemo(() => {
    return accountViews.filter((entry) => {
      if (statusFilter !== "all" && entry.account.status !== statusFilter) return false;
      if (!deferredQuery.trim()) return true;

      const text = [
        entry.account.accountId,
        usersById[entry.account.userId]?.name,
        usersById[entry.account.userId]?.email,
        entry.plan.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(deferredQuery.trim().toLowerCase());
    });
  }, [accountViews, deferredQuery, statusFilter, usersById]);

  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filteredAccounts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const focusEntry =
    filteredAccounts.find((entry) => entry.account.id === drawerAccountId) ??
    [...filteredAccounts].sort((left, right) => right.account.updatedAt.localeCompare(left.account.updatedAt))[0] ??
    null;

  const activeAccounts = accountViews.filter((entry) => entry.account.status === "active").length;
  const waitingProvision = accountViews.filter((entry) => !entry.account.platformUserId).length;
  const highRiskAccounts = accountViews.filter((entry) => getRiskTone(entry.analytics) !== "success").length;
  const averageEdge =
    accountViews.length > 0
      ? accountViews.reduce((sum, entry) => sum + entry.analytics.everwinEdgeScore, 0) / accountViews.length
      : 0;

  const selectedAccount = accountViews.find((entry) => entry.account.id === drawerAccountId) ?? null;

  useEffect(() => {
    if (!selectedAccount) return;

    setEditState({
      status: selectedAccount.account.status,
      phase: String(selectedAccount.account.phase),
      balance: String(selectedAccount.account.balance),
      todayPnl: String(selectedAccount.account.todayPnl),
      daysTraded: String(selectedAccount.account.daysTraded),
      platformLogin: selectedAccount.account.platformLogin,
      platformPassword: selectedAccount.account.platformPassword,
      brokerName: selectedAccount.account.brokerName ?? "",
      notes: selectedAccount.account.notes ?? "",
    });
    setSaveFeedback(null);
  }, [selectedAccount]);

  useEffect(() => {
    if (!drawerAccountId) {
      setEvents([]);
      return;
    }

    let active = true;
    setLoadingEvents(true);

    fetchAccountEventsApi(drawerAccountId)
      .then((items) => {
        if (active) setEvents(items);
      })
      .catch(() => {
        if (active) setEvents([]);
      })
      .finally(() => {
        if (active) setLoadingEvents(false);
      });

    return () => {
      active = false;
    };
  }, [drawerAccountId]);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateFeedback(null);

    const result = await createAccount({
      userId: form.userId,
      planId: form.planId,
      submissionCode: form.submissionCode || undefined,
      accountId: form.accountId,
      platformLogin: form.platformLogin,
      platformPassword: form.platformPassword,
      brokerName: form.brokerName || undefined,
      startDate: new Date(form.startDate).toISOString(),
      notes: form.notes || undefined,
    });

    if (!result.ok) {
      setCreateFeedback(result.message);
      return;
    }

    setForm((current) => ({
      ...current,
      submissionCode: "",
      accountId: "",
      platformLogin: "",
      platformPassword: "",
      brokerName: "",
      notes: "",
    }));
    setCreateFeedback("Conta criada com sucesso.");
    await runRulesEvaluation();
  };

  const handleSaveAccount = async () => {
    if (!selectedAccount) return;

    setSavingAccount(true);
    setSaveFeedback(null);

    const result = await updateAccount({
      accountId: selectedAccount.account.id,
      status: editState.status,
      phase: Number(editState.phase) as 1 | 2,
      balance: Number(editState.balance),
      todayPnl: Number(editState.todayPnl),
      daysTraded: Number(editState.daysTraded),
      platformLogin: editState.platformLogin,
      platformPassword: editState.platformPassword,
      brokerName: editState.brokerName || undefined,
      notes: editState.notes || undefined,
    });

    setSavingAccount(false);

    if (!result.ok) {
      setSaveFeedback(result.message);
      return;
    }

    setSaveFeedback("Conta salva com sucesso.");
  };

  const handleProvision = async (account: PropAccount) => {
    setProvisioningId(account.id);
    try {
      const result = await provisionTradingPlatformApi(account.id);
      setProvisionResult({
        accountId: account.id,
        platformEmail: result.platformEmail,
        tempPass: result.temporaryPassword,
      });
      await runRulesEvaluation();
    } finally {
      setProvisioningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Contas de Operação"
        description="Provisionamento via plataforma Everwin"
        actions={
          <Button type="button" size="sm" className="h-9 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500" onClick={() => void runRulesEvaluation()}>
            <RefreshCw className="h-3.5 w-3.5" /> Reavaliar
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PortalStatCard label="Total" value={accountViews.length} tone="neutral" icon={<WalletCards className="h-4 w-4" />} />
        <PortalStatCard label="Ativas" value={activeAccounts} tone="success" icon={<ShieldCheck className="h-4 w-4" />} />
        <PortalStatCard label="Pendentes" value={waitingProvision} tone={waitingProvision > 0 ? "warning" : "neutral"} icon={<Monitor className="h-4 w-4" />} />
        <PortalStatCard label="Risco" value={highRiskAccounts} tone={highRiskAccounts > 0 ? "warning" : "neutral"} icon={<AlertTriangle className="h-4 w-4" />} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <PortalSection title="Nova Conta" className="xl:sticky xl:top-[72px] xl:self-start">
          <form className="space-y-4" onSubmit={handleCreate}>
            <PortalField label="Cliente">
              <Select
                value={form.userId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    userId: event.target.value,
                    submissionCode: "",
                  }))
                }
                className="h-10 rounded-xl border-slate-200 bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white"
                required
              >
                <option value="">Selecionar cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.email})
                  </option>
                ))}
              </Select>
            </PortalField>

            <PortalField label="Plano">
              <Select
                value={form.planId}
                onChange={(event) => setForm((current) => ({ ...current, planId: event.target.value }))}
                className="h-10 rounded-xl border-slate-200 bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white"
                required
              >
                <option value="">Selecionar plano</option>
                {state.plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} · {currencyBRL(plan.accountSize, i18n.language)}
                  </option>
                ))}
              </Select>
            </PortalField>

            <PortalField label="Inscrição">
              {loadingSubmissions ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-white/50">
                  Carregando inscrições...
                </div>
              ) : userSubmissions.length > 0 ? (
                <Select
                  value={form.submissionCode}
                  onChange={(event) => setForm((current) => ({ ...current, submissionCode: event.target.value }))}
                  className="h-10 rounded-xl border-slate-200 bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white"
                >
                  <option value="">Sem vínculo</option>
                  {userSubmissions.map((submission) => (
                    <option key={submission.id} value={submission.submissionCode}>
                      {submission.submissionCode} · {submission.status}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  value={form.submissionCode}
                  onChange={(event) => setForm((current) => ({ ...current, submissionCode: event.target.value }))}
                  className="h-10 rounded-xl border-slate-200 bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white"
                  placeholder="Código opcional"
                />
              )}
            </PortalField>

            <div className="grid gap-4 sm:grid-cols-2">
              <PortalField label="ID da Conta">
                <Input
                  value={form.accountId}
                  onChange={(event) => setForm((current) => ({ ...current, accountId: event.target.value }))}
                  className="h-10 rounded-xl border-slate-200 bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white"
                  placeholder="ex: EW-00123"
                  required
                />
              </PortalField>
              <PortalField label="Data de Início">
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))}
                  className="h-10 rounded-xl border-slate-200 bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white"
                  required
                />
              </PortalField>
            </div>

            <PortalField label="Login">
              <Input
                value={form.platformLogin}
                onChange={(event) => setForm((current) => ({ ...current, platformLogin: event.target.value }))}
                className="h-10 rounded-xl border-slate-200 bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white"
                required
              />
            </PortalField>

            <PortalField label="Senha">
              <Input
                value={form.platformPassword}
                onChange={(event) => setForm((current) => ({ ...current, platformPassword: event.target.value }))}
                className="h-10 rounded-xl border-slate-200 bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white"
                required
              />
            </PortalField>

            <PortalField label="Corretora">
              <Input
                value={form.brokerName}
                onChange={(event) => setForm((current) => ({ ...current, brokerName: event.target.value }))}
                className="h-10 rounded-xl border-slate-200 bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white"
                placeholder="Equiti, Eightcap..."
              />
            </PortalField>

            <PortalField label="Notas">
              <Textarea
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                className="min-h-[108px] rounded-xl border-slate-200 bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white"
              />
            </PortalField>

            {createFeedback ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700 dark:text-emerald-400 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                {createFeedback}
              </div>
            ) : null}

            <Button type="submit" className="h-10 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500">
              Criar Conta
            </Button>
          </form>
        </PortalSection>

        <div className="space-y-4">
          {focusEntry ? (
            <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.35fr)_300px]">
              <InteractiveLineChart
                theme={theme}
                title={`Focus • ${focusEntry.account.accountId}`}
                subtitle={`${usersById[focusEntry.account.userId]?.name ?? "Cliente"} • ${focusEntry.plan.name}`}
                data={focusEntry.account.performanceSeries.map((point) => ({
                  label: formatPropDate(point.date, i18n.language, { day: "2-digit", month: "2-digit" }),
                  value: point.balance,
                }))}
                valueFormatter={(value) => currencyBRL(value, i18n.language)}
              />
              <EdgeScoreDial score={focusEntry.analytics.everwinEdgeScore} label="Focus Edge" />
            </div>
          ) : null}

          <PortalSurface padding="none">
            <div className="border-b border-slate-200/80 px-5 py-4 dark:border-white/[0.07]">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/40">Registro de contas</p>
                <h2 className="mt-2 font-bricolage_grotesque text-[24px] font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
                    Contas
                </h2>
              </div>
            </div>
          </div>

            <div className="p-5">
              <PortalFilterBar>
                <PortalSearchInput
                  value={query}
                  onChange={(value) => {
                    setQuery(value);
                    setPage(1);
                  }}
                  placeholder="Buscar conta, cliente ou plano"
                />
                <div className="flex flex-wrap gap-2">
                  {[{ key: "all" as const, label: "Todas" }, { key: "active" as const, label: "Ativas" }, { key: "paused" as const, label: "Pausadas" }, { key: "approved_for_funded" as const, label: "Funded" }].map(
                    (filter) => (
                      <PortalFilterChip
                        key={filter.key}
                        active={statusFilter === filter.key}
                        onClick={() => {
                          setStatusFilter(filter.key);
                          setPage(1);
                        }}
                      >
                        {filter.label}
                      </PortalFilterChip>
                    ),
                  )}
                </div>
              </PortalFilterBar>
            </div>

            {pageItems.length === 0 ? (
              <div className="px-5 pb-5">
                <PortalEmptyState
                  title="Nenhuma Conta"
                  description="Ajuste os filtros ou busca."
                />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto px-5">
                  <table className="min-w-full table-fixed">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/[0.07] text-left">
                        {["Conta", "Cliente / Plano", "Saldo", "Risco", "Corretora", "Status", "Ação"].map((header) => (
                          <th key={header} className="px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/40 first:pl-0 last:pr-0">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pageItems.map((entry) => {
                        const status = getAccountStatusMeta(entry.account.status, i18n.language);
                        return (
                          <tr key={entry.account.id} className="border-b border-slate-100 last:border-b-0 dark:border-white/[0.05]">
                            <td className="px-3 py-4 pl-0">
                              <div>
                                <p className="text-sm font-semibold text-slate-950 dark:text-white">{entry.account.accountId}</p>
                                <p className="mt-1 text-xs text-slate-500 dark:text-white/40">
                                  Atualizado {formatPropDateTime(entry.account.updatedAt, i18n.language)}
                                </p>
                              </div>
                            </td>
                            <td className="px-3 py-4">
                              <p className="text-sm font-medium text-slate-900 dark:text-white/80">
                                {usersById[entry.account.userId]?.name ?? "Cliente"}
                              </p>
                              <p className="mt-1 text-xs text-slate-500 dark:text-white/40">
                                {entry.plan.name} · Fase {entry.account.phase}
                              </p>
                            </td>
                            <td className="px-3 py-4">
                              <p className="text-sm font-semibold text-slate-950 dark:text-white">
                                {currencyBRL(entry.account.balance, i18n.language)}
                              </p>
                              <p className="mt-1 text-xs text-slate-500 dark:text-white/40">
                                Hoje {formatSignedCurrency(entry.account.todayPnl, i18n.language)}
                              </p>
                            </td>
                            <td className="px-3 py-4">
                              <PortalStatusPill tone={getRiskTone(entry.analytics)}>
                                {getRiskLabel(entry.analytics, i18n.language)}
                              </PortalStatusPill>
                            </td>
                            <td className="px-3 py-4">
                              {entry.account.platformUserId ? (
                                <div>
                                  <p className="text-sm font-medium text-slate-900 dark:text-white/80">Provisionada</p>
                                  <p className="mt-1 text-xs text-slate-500 dark:text-white/40">{entry.account.platformEmail || entry.account.platformLogin}</p>
                                </div>
                              ) : (
                                <PortalStatusPill tone="warning">Pendente</PortalStatusPill>
                              )}
                            </td>
                            <td className="px-3 py-4">
                              <PortalStatusPill tone={status.tone}>{status.label}</PortalStatusPill>
                            </td>
                            <td className="px-3 py-4 pr-0">
                              <div className="flex flex-wrap gap-2">
                                {!entry.account.platformUserId ? (
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="h-9 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400"
                                    disabled={provisioningId === entry.account.id}
                                    onClick={() => void handleProvision(entry.account)}
                                  >
                                    <Zap className="h-4 w-4" />
                                    {provisioningId === entry.account.id ? "Provisionando..." : "Provisionar"}
                                  </Button>
                                ) : null}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-9 rounded-lg border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-white/[0.07] dark:bg-[#171a23] dark:text-white/70 dark:hover:border-white/[0.12] dark:hover:text-white"
                                  onClick={() => setDrawerAccountId(entry.account.id)}
                                >
                                  Abrir
                                  <ArrowUpRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <PortalPagination
                  page={safePage}
                  totalPages={totalPages}
                  totalItems={filteredAccounts.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setPage}
                />
              </>
            )}
          </PortalSurface>
        </div>
      </div>

      <PortalDrawer
        open={!!selectedAccount}
        onOpenChange={(open) => {
          if (!open) setDrawerAccountId(null);
        }}
        title={selectedAccount ? `Conta ${selectedAccount.account.accountId}` : "Conta"}
        description={
          selectedAccount
            ? `${usersById[selectedAccount.account.userId]?.name ?? "Cliente"} · ${selectedAccount.plan.name}`
            : undefined
        }
      >
        {selectedAccount ? (
          <div className="space-y-6">
            {/* ── Resumo de métricas ── */}
            <PortalMetricList
              items={[
                {
                  label: "Saldo",
                  value: currencyBRL(selectedAccount.account.balance, i18n.language),
                  hint: `Inicial ${currencyBRL(selectedAccount.account.initialBalance, i18n.language)}`,
                },
                {
                  label: "Hoje",
                  value: formatSignedCurrency(selectedAccount.account.todayPnl, i18n.language),
                  hint: formatSignedPercent(
                    selectedAccount.account.initialBalance > 0
                      ? (selectedAccount.account.todayPnl / selectedAccount.account.initialBalance) * 100
                      : 0,
                  ),
                },
                {
                  label: "Drawdown",
                  value: currencyBRL(
                    Math.max(selectedAccount.analytics.snapshot.remainingDrawdownBeforeBreach, 0),
                    i18n.language,
                  ),
                  hint: getRiskLabel(selectedAccount.analytics, i18n.language),
                },
                {
                  label: "Prazo",
                  value: `${Math.max(getDaysRemaining(selectedAccount.account.endDate), 0)}d`,
                  hint: `Encerra ${formatPropDate(selectedAccount.account.endDate, i18n.language)}`,
                },
              ]}
              columns={2}
            />

            {/* ── Resultado do provisionamento ── */}
            {provisionResult?.accountId === selectedAccount.account.id ? (
              <PortalSurface className="border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Conta provisionada na corretora</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Email da plataforma</p>
                    <p className="mt-0.5 text-sm font-medium text-slate-950">{provisionResult.platformEmail}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Senha temporária</p>
                    <p className="mt-0.5 font-mono text-sm font-medium text-slate-950">{provisionResult.tempPass}</p>
                  </div>
                </div>
              </PortalSurface>
            ) : null}

            {/* ── Provisionar (se ainda não provisionada) ── */}
            {!selectedAccount.account.platformUserId ? (
              <PortalSurface className="border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">Conta não provisionada</p>
                    <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">Cria o usuário na corretora e gera credenciais de acesso.</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="h-9 shrink-0 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400"
                    disabled={provisioningId === selectedAccount.account.id}
                    onClick={() => void handleProvision(selectedAccount.account)}
                  >
                    <Zap className="h-3.5 w-3.5" />
                    {provisioningId === selectedAccount.account.id ? "Provisionando..." : "Provisionar"}
                  </Button>
                </div>
              </PortalSurface>
            ) : null}

            {/* ── Dados da conta ── */}
            <PortalSection title="Dados da Conta" description="Status, fase e valores atuais da conta de operação.">
              <div className="grid gap-4 md:grid-cols-2">
                <PortalField label="Status">
                  <Select
                    value={editState.status}
                    onChange={(event) =>
                      setEditState((current) => ({ ...current, status: event.target.value as AccountStatus }))
                    }
                    className="h-10 rounded-xl border-slate-200 bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white"
                  >
                    {STATUS_OPTIONS.map((status) => {
                      const statusMeta = getAccountStatusMeta(status, i18n.language);
                      return (
                        <option key={status} value={status}>
                          {statusMeta.label}
                        </option>
                      );
                    })}
                  </Select>
                </PortalField>

                <PortalField label="Fase">
                  <Select
                    value={editState.phase}
                    onChange={(event) => setEditState((current) => ({ ...current, phase: event.target.value }))}
                    className="h-10 rounded-xl border-slate-200 bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white"
                  >
                    <option value="1">Fase 1</option>
                    <option value="2">Fase 2</option>
                  </Select>
                </PortalField>

                <PortalField label="Saldo">
                  <Input
                    type="number"
                    value={editState.balance}
                    onChange={(event) => setEditState((current) => ({ ...current, balance: event.target.value }))}
                    className="h-10 rounded-xl border-slate-200 bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white"
                  />
                </PortalField>

                <PortalField label="P&L Hoje">
                  <Input
                    type="number"
                    value={editState.todayPnl}
                    onChange={(event) => setEditState((current) => ({ ...current, todayPnl: event.target.value }))}
                    className="h-10 rounded-xl border-slate-200 bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white"
                  />
                </PortalField>

                <PortalField label="Dias Operados">
                  <Input
                    type="number"
                    value={editState.daysTraded}
                    onChange={(event) => setEditState((current) => ({ ...current, daysTraded: event.target.value }))}
                    className="h-10 rounded-xl border-slate-200 bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white"
                  />
                </PortalField>

                <PortalField label="Corretora">
                  <Input
                    value={editState.brokerName}
                    onChange={(event) => setEditState((current) => ({ ...current, brokerName: event.target.value }))}
                    className="h-10 rounded-xl border-slate-200 bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white"
                  />
                </PortalField>
              </div>
            </PortalSection>

            {/* ── Credenciais ── */}
            <PortalSection title="Credenciais da Corretora" description="Login e senha da conta na plataforma de trading.">
              <div className="grid gap-4 md:grid-cols-2">
                <PortalField label="Login">
                  <Input
                    value={editState.platformLogin}
                    onChange={(event) => setEditState((current) => ({ ...current, platformLogin: event.target.value }))}
                    className="h-10 rounded-xl border-slate-200 bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white"
                  />
                </PortalField>

                <PortalField label="Senha">
                  <Input
                    value={editState.platformPassword}
                    onChange={(event) => setEditState((current) => ({ ...current, platformPassword: event.target.value }))}
                    className="h-10 rounded-xl border-slate-200 bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white"
                  />
                </PortalField>
              </div>
            </PortalSection>

            {/* ── Notas ── */}
            <PortalField label="Notas internas">
              <Textarea
                value={editState.notes}
                onChange={(event) => setEditState((current) => ({ ...current, notes: event.target.value }))}
                className="min-h-[100px] rounded-xl border-slate-200 bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white"
              />
            </PortalField>

            {/* ── Feedback + Salvar ── */}
            {saveFeedback ? (
              <PortalSurface className={saveFeedback.includes("sucesso") ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10" : "border-rose-200 bg-rose-50 dark:border-red-500/20 dark:bg-red-500/10"}>
                <p className={`text-sm font-medium ${saveFeedback.includes("sucesso") ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700"}`}>{saveFeedback}</p>
              </PortalSurface>
            ) : null}

              <Button
              type="button"
              className="h-10 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              disabled={savingAccount}
              onClick={() => void handleSaveAccount()}
            >
              {savingAccount ? "Salvando..." : "Salvar Alterações"}
            </Button>

            {/* ── Eventos da corretora ── */}
            <PortalSection title="Eventos" description="Atividade recebida da plataforma de trading via webhook.">
              {loadingEvents ? (
                <PortalLoadingState title="Carregando eventos..." lines={3} />
              ) : events.length === 0 ? (
                <PortalEmptyState
                  title="Sem Eventos"
                  description="Eventos da corretora aparecerão aqui."
                />
              ) : (
                <div className="space-y-3">
                  {events.slice(0, 10).map((event) => (
                    <div key={event.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/[0.07] dark:bg-white/[0.03]">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-950 dark:text-white">{event.eventType}</p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-white/40">
                            {formatPropDateTime(event.createdAt, i18n.language)}
                          </p>
                        </div>
                        <PortalStatusPill tone={event.flagged ? "danger" : "neutral"}>
                          {event.flagged ? event.flagReason || "Flagged" : "Normal"}
                        </PortalStatusPill>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </PortalSection>
          </div>
        ) : null}
      </PortalDrawer>
    </div>
  );
}
