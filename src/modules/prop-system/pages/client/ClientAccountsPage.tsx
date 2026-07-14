import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Layers3,
  ShieldAlert,
  Target,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePropSystem } from "../../context";
import {
  buildAccountAnalytics,
  currencyBRL,
  formatPropDate,
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
  PortalEmptyState,
  PortalMetricList,
  PortalPageHeader,
  PortalSection,
  PortalStatusPill,
  PortalSurface,
} from "../../portal-ui";
import { EdgeScoreDial } from "../components/charts/EdgeScoreDial";
import { InteractiveLineChart } from "../components/charts/InteractiveLineChart";

export function ClientAccountsPage() {
  const { currentUser, getUserAccounts, state } = usePropSystem();
  const { i18n } = useTranslation();

  if (!currentUser) return null;

  const accounts = getUserAccounts(currentUser.id);
  const [selectedId, setSelectedId] = useState(accounts[0]?.id ?? "");

  useEffect(() => {
    if (!selectedId && accounts[0]?.id) setSelectedId(accounts[0].id);
  }, [accounts, selectedId]);

  const views = useMemo(() => {
    const nowISO = new Date().toISOString();
    return accounts.map((account) => {
      const plan = getPlanById(state.plans, account.planId);
      const analytics = buildAccountAnalytics(account, plan, nowISO);
      return { account, plan, analytics };
    });
  }, [accounts, state.plans]);

  const selected = views.find((entry) => entry.account.id === selectedId) ?? views[0] ?? null;

  if (!selected) {
    return (
      <PortalEmptyState
        title="Sem Contas"
        description="Inicie uma nova avaliação para começar."
      />
    );
  }

  const status = getAccountStatusMeta(selected.account.status, i18n.language);
  const targetPct =
    selected.account.phase === 1
      ? selected.plan.profitTargetPhase1Pct
      : selected.plan.profitTargetPhase2Pct;
  const targetValue = (targetPct / 100) * selected.account.initialBalance;
  const maxDrawdownValue = (selected.plan.maxDrawdownPct / 100) * selected.account.initialBalance;
  const dailyLossValue = (selected.plan.dailyLossLimitPct / 100) * selected.account.initialBalance;
  const daysRemaining = Math.max(getDaysRemaining(selected.account.endDate), 0);
  const history = [...selected.account.performanceSeries].sort((left, right) => right.date.localeCompare(left.date));

  return (
    <div className="space-y-6">
      <PortalPageHeader title="Contas" description="Avaliações Ativas" />

      <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
        <PortalSection title="Contas" className="xl:sticky xl:top-[104px] xl:self-start">
          <div className="space-y-2">
            {views.map((entry) => {
              const entryStatus = getAccountStatusMeta(entry.account.status, i18n.language);
              return (
                <button
                  key={entry.account.id}
                  type="button"
                  onClick={() => setSelectedId(entry.account.id)}
                  className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                    entry.account.id === selected.account.id
                      ? "border-slate-950 dark:border-white/20 bg-slate-950 dark:bg-[#171a23] text-white"
                      : "border-slate-200 dark:border-white/[0.07] bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white hover:border-slate-300 hover:bg-white dark:hover:bg-[#171a23]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{entry.account.accountId}</p>
                      <p className={`mt-1 text-xs ${entry.account.id === selected.account.id ? "text-slate-300" : "text-slate-500 dark:text-white/40"}`}>
                        {entry.plan.name} · Fase {entry.account.phase}
                      </p>
                    </div>
                    <PortalStatusPill tone={entryStatus.tone}>{entryStatus.label}</PortalStatusPill>
                  </div>
                  <div className={`mt-3 flex items-center justify-between text-xs ${entry.account.id === selected.account.id ? "text-slate-300" : "text-slate-500 dark:text-white/40"}`}>
                    <span>{currencyBRL(entry.account.balance, i18n.language)}</span>
                    <span>{entry.analytics.progressScore.toFixed(0)} / 100</span>
                  </div>
                </button>
              );
            })}
          </div>
        </PortalSection>

        <div className="space-y-4">
          <PortalSurface tone="inverse" padding="none">
            <div className="border-b border-white/10 px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-white/35">Selecionada</p>
                  <h2 className="mt-2 font-bricolage_grotesque text-[28px] font-semibold tracking-[-0.04em] text-white">
                    {selected.account.accountId}
                  </h2>
                  <p className="mt-1 text-sm text-slate-300">
                    {selected.plan.name} · Fase {selected.account.phase}
                  </p>
                </div>
                <PortalStatusPill tone={status.tone}>{status.label}</PortalStatusPill>
              </div>
            </div>
            <div className="p-5">
              <PortalMetricList
                inverse
                items={[
                  {
                    label: "Saldo",
                    value: currencyBRL(selected.account.balance, i18n.language),
                    hint: `Inicial ${currencyBRL(selected.account.initialBalance, i18n.language)}`,
                  },
                  {
                    label: "Hoje",
                    value: formatSignedCurrency(selected.account.todayPnl, i18n.language),
                    hint: formatSignedPercent(
                      selected.account.initialBalance > 0
                        ? (selected.account.todayPnl / selected.account.initialBalance) * 100
                        : 0,
                    ),
                  },
                  {
                    label: "Edge",
                    value: `${selected.analytics.everwinEdgeScore.toFixed(0)} / 100`,
                    hint: `${selected.analytics.consistencyScore.toFixed(0)} Consistência`,
                  },
                  {
                    label: "Prazo",
                    value: `${daysRemaining}d`,
                    hint: formatPropDate(selected.account.endDate, i18n.language),
                  },
                ]}
                columns={2}
              />
            </div>
          </PortalSurface>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_320px]">
            <InteractiveLineChart
              title="Equity"
              subtitle="Conta Selecionada"
              data={selected.account.performanceSeries.map((point) => ({
                label: formatPropDate(point.date, i18n.language, { day: "2-digit", month: "2-digit" }),
                value: point.balance,
              }))}
              valueFormatter={(value) => currencyBRL(value, i18n.language)}
            />
            <EdgeScoreDial score={selected.analytics.everwinEdgeScore} label="Score da Conta" />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <PortalSection title="Plano">
              <PortalMetricList
                items={[
                  { label: "Capital", value: currencyBRL(selected.account.initialBalance, i18n.language), hint: `Fase ${selected.account.phase}` },
                  { label: "Meta", value: `${targetPct}%`, hint: currencyBRL(targetValue, i18n.language) },
                  { label: "DD Máx", value: `${selected.plan.maxDrawdownPct}%`, hint: currencyBRL(maxDrawdownValue, i18n.language) },
                  { label: "PD", value: `${selected.plan.dailyLossLimitPct}%`, hint: currencyBRL(dailyLossValue, i18n.language) },
                  { label: "Dias Mín", value: `${selected.plan.minTradingDays}`, hint: `${selected.account.daysTraded} Operados` },
                  { label: "Duração", value: `${selected.plan.durationDays}d`, hint: `${daysRemaining} Restantes` },
                ]}
                columns={2}
              />
            </PortalSection>

            <PortalSection title="Limites">
              <div className="space-y-4">
                <RuleProgress
                  label="Meta"
                  current={`${selected.analytics.snapshot.profitPct.toFixed(2)}%`}
                  helper={currencyBRL(selected.account.balance - selected.account.initialBalance, i18n.language)}
                  value={Math.min(selected.analytics.progressScore, 100)}
                  tone="success"
                />
                <RuleProgress
                  label="Drawdown"
                  current={currencyBRL(Math.max(selected.analytics.snapshot.remainingDrawdownBeforeBreach, 0), i18n.language)}
                  helper={getRiskLabel(selected.analytics, i18n.language)}
                  value={Math.min(
                    ((maxDrawdownValue - Math.max(selected.analytics.snapshot.remainingDrawdownBeforeBreach, 0)) / maxDrawdownValue) * 100,
                    100,
                  )}
                  tone="warning"
                />
                <RuleProgress
                  label="PD"
                  current={currencyBRL(Math.max(selected.analytics.snapshot.remainingDailyLossBeforePause, 0), i18n.language)}
                  helper={selected.analytics.snapshot.isDailyLimitBreached ? "Atingido" : "OK"}
                  value={Math.min(
                    ((dailyLossValue - Math.max(selected.analytics.snapshot.remainingDailyLossBeforePause, 0)) / dailyLossValue) * 100,
                    100,
                  )}
                  tone={selected.analytics.snapshot.isDailyLimitBreached ? "danger" : "warning"}
                />
                <RuleProgress
                  label="Dias"
                  current={`${selected.account.daysTraded} / ${selected.plan.minTradingDays}`}
                  helper={`${daysRemaining} Restantes`}
                  value={Math.min((selected.account.daysTraded / selected.plan.minTradingDays) * 100, 100)}
                  tone="info"
                />
              </div>
            </PortalSection>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <PortalSection title="Acesso">
              <PortalMetricList
                items={[
                  { label: "Login", value: selected.account.platformLogin || "-", hint: selected.account.platformEmail || "-" },
                  { label: "Senha", value: selected.account.platformPassword ? "Disponível" : "-", hint: "Manter seguro" },
                  { label: "Broker", value: selected.account.brokerName || "-", hint: selected.account.platformName || "-" },
                  { label: "Trade Room", value: selected.account.tradeRoomUrl ? "Configurado" : "Padrão", hint: selected.account.tradeRoomUrl || "https://app.everwin.capital/pt/auth/login" },
                ]}
                columns={2}
              />
              <div className="mt-4">
                <a
                  href={selected.account.tradeRoomUrl || "https://app.everwin.capital/pt/auth/login"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 dark:bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 dark:hover:bg-emerald-500"
                >
                  <ExternalLink className="h-4 w-4" />
                  Trade Room
                </a>
              </div>
            </PortalSection>

            <PortalSection title="Risco">
              <PortalMetricList
                items={[
                  { label: "Risco", value: getRiskLabel(selected.analytics, i18n.language), hint: `${getRiskTone(selected.analytics)}` },
                  { label: "Disciplina", value: `${selected.analytics.riskDisciplineScore.toFixed(0)} / 100`, hint: `${selected.analytics.consistencyScore.toFixed(0)} Consistência` },
                  { label: "Volatilidade", value: currencyBRL(selected.analytics.pnlVolatility, i18n.language), hint: "StdDev diário" },
                  { label: "Projeção", value: selected.analytics.projectedDaysToTarget ? `${selected.analytics.projectedDaysToTarget}d` : "-", hint: "PnL Médio" },
                ]}
                columns={2}
              />
            </PortalSection>
          </div>

          <PortalSection title="Histórico">
            {history.length === 0 ? (
              <PortalEmptyState
                title="Sem Histórico"
                description="Resultados diários aparecerão aqui."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-fixed">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/[0.07] text-left">
                      {["Data", "PnL", "Saldo", "Obs"].map((header) => (
                        <th key={header} className="px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/40 first:pl-0 last:pr-0">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.slice(0, 30).map((point) => (
                      <tr key={point.date} className="border-b border-slate-100 dark:border-white/[0.05] last:border-b-0">
                        <td className="px-3 py-4 pl-0 text-sm font-medium text-slate-900 dark:text-white">
                          {formatPropDate(point.date, i18n.language, {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                          })}
                        </td>
                        <td className="px-3 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                          <span className={point.pnl > 0 ? "text-emerald-600" : point.pnl < 0 ? "text-rose-600" : "text-slate-500 dark:text-white/40"}>
                            {formatSignedCurrency(point.pnl, i18n.language)}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-sm text-slate-700 dark:text-white/70">{currencyBRL(point.balance, i18n.language)}</td>
                        <td className="px-3 py-4 pr-0 text-sm text-slate-500 dark:text-white/40">
                          {point.breachedDailyLimit
                            ? "PD Atingida"
                            : point.pnl === 0
                            ? "Sem Op."
                            : "Operado"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </PortalSection>

          <PortalSurface tone="subtle">
            <div className="flex flex-wrap items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-white">Aviso de Risco</p>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-white/60">
                  Verifique as regras oficiais antes de alterar o risco intradiário.
                </p>
              </div>
            </div>
          </PortalSurface>
        </div>
      </div>
    </div>
  );
}

function RuleProgress({
  label,
  current,
  helper,
  value,
  tone,
}: {
  label: string;
  current: string;
  helper: string;
  value: number;
  tone: "success" | "warning" | "danger" | "info";
}) {
  const clamped = Math.max(0, Math.min(value, 100));
  const colorClass =
    tone === "success"
      ? "bg-emerald-500"
      : tone === "warning"
      ? "bg-amber-500"
      : tone === "danger"
      ? "bg-rose-500"
      : "bg-sky-500";

  return (
    <div className="rounded-lg border border-slate-200 dark:border-white/[0.07] bg-slate-50 dark:bg-white/[0.04] px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950 dark:text-white">{label}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-white/40">{helper}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-950 dark:text-white">{current}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-white/40">{clamped.toFixed(0)}%</p>
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/[0.06]">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
