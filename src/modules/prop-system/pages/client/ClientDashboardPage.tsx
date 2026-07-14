import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ExternalLink,
  Gauge,
  ShieldCheck,
  Target,
  TrendingUp,
  Wallet,
  Calendar,
  BarChart3,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../../components/ui/button";
import { cn } from "../../../../lib/utils";
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
  PortalSection,
  PortalStatusPill,
  PortalSurface,
} from "../../portal-ui";
import { EdgeScoreDial } from "../components/charts/EdgeScoreDial";
import { InteractiveLineChart } from "../components/charts/InteractiveLineChart";

export function ClientDashboardPage() {
  const { currentUser, getUserAccounts, state } = usePropSystem();
  const { i18n } = useTranslation();

  if (!currentUser) return null;

  const nowISO = new Date().toISOString();
  const accountViews = getUserAccounts(currentUser.id).map((account) => {
    const plan = getPlanById(state.plans, account.planId);
    const analytics = buildAccountAnalytics(account, plan, nowISO);
    return { account, plan, analytics };
  });

  const activeAccounts = accountViews.filter((e) => e.account.status === "active").length;
  const completedAccounts = accountViews.filter(
    (e) => e.account.status === "passed" || e.account.status === "approved_for_funded",
  ).length;
  const consolidatedBalance = accountViews.reduce((s, e) => s + e.account.balance, 0);

  const mainView =
    accountViews
      .filter((e) => e.account.status === "active")
      .sort((a, b) => b.analytics.progressScore - a.analytics.progressScore)[0] ??
    [...accountViews].sort((a, b) => b.account.updatedAt.localeCompare(a.account.updatedAt))[0] ??
    null;

  const alerts = accountViews.flatMap((entry) => {
    const out: Array<{ id: string; tone: "warning" | "success" | "info"; title: string; text: string }> = [];
    const dr = getDaysRemaining(entry.account.endDate);
    if (entry.analytics.snapshot.isDailyLimitBreached)
      out.push({ id: `${entry.account.id}-dll`, tone: "warning", title: `PD • ${entry.account.accountId}`, text: "Revisar" });
    if (entry.analytics.snapshot.isPhaseTargetMet)
      out.push({ id: `${entry.account.id}-target`, tone: "success", title: `Meta • ${entry.account.accountId}`, text: "Pronto" });
    if (entry.account.status === "active" && dr <= 5)
      out.push({ id: `${entry.account.id}-deadline`, tone: "info", title: `Prazo • ${entry.account.accountId}`, text: `${Math.max(dr, 0)}d` });
    return out;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bricolage_grotesque text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Visão Geral
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-white/40">
            Acompanhe suas contas e performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={mainView?.account.tradeRoomUrl || "https://app.everwin.capital/pt/auth/login"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#171a23] px-4 text-sm font-medium text-slate-700 dark:text-white/70 transition-all hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04]"
          >
            <ExternalLink className="h-4 w-4" />
            Trade Room
          </a>
          <Button asChild variant="outline" size="sm" className="h-10 rounded-xl">
            <Link to="/prop/client/accounts">
              Contas
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          label="Contas Ativas"
          value={activeAccounts}
          icon={<ShieldCheck className="h-5 w-5" />}
          tone="emerald"
        />
        <KpiCard
          label="Saldo Consolidado"
          value={currencyBRL(consolidatedBalance, i18n.language)}
          icon={<Wallet className="h-5 w-5" />}
          tone="blue"
        />
        <KpiCard
          label="Concluídas"
          value={completedAccounts}
          icon={<TrendingUp className="h-5 w-5" />}
          tone="slate"
        />
      </div>

      {/* Alerts */}
      {alerts.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-3",
                alert.tone === "warning"
                  ? "border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10"
                  : alert.tone === "success"
                    ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10"
                    : "border-sky-200 bg-sky-50 dark:border-sky-500/20 dark:bg-sky-500/10",
              )}
            >
              <AlertTriangle
                className={cn(
                  "h-4 w-4 shrink-0",
                  alert.tone === "warning"
                    ? "text-amber-600"
                    : alert.tone === "success"
                      ? "text-emerald-600"
                      : "text-sky-600",
                )}
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{alert.title}</p>
                <p className="text-xs text-slate-600 dark:text-white/60">{alert.text}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {mainView ? (
        <>
          {/* Main account card */}
          <PortalSurface tone="inverse" padding="none">
            <div className="border-b border-white/10 px-6 py-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-400 dark:text-white/35">Conta Ativa</p>
                  <h2 className="mt-1.5 font-bricolage_grotesque text-2xl font-semibold tracking-tight text-white">
                    {mainView.account.accountId}
                  </h2>
                  <p className="mt-1 text-sm text-slate-400 dark:text-white/35">{mainView.plan.name} · Fase {mainView.account.phase}</p>
                </div>
                <PortalStatusPill tone={getAccountStatusMeta(mainView.account.status, i18n.language).tone}>
                  {getAccountStatusMeta(mainView.account.status, i18n.language).label}
                </PortalStatusPill>
              </div>
            </div>
            <div className="p-6">
              <PortalMetricList
                inverse
                items={[
                  { label: "Saldo", value: currencyBRL(mainView.account.balance, i18n.language), hint: currencyBRL(mainView.account.initialBalance, i18n.language) },
                  { label: "Hoje", value: formatSignedCurrency(mainView.account.todayPnl, i18n.language), hint: formatSignedPercent(mainView.account.initialBalance > 0 ? (mainView.account.todayPnl / mainView.account.initialBalance) * 100 : 0) },
                  { label: "Progresso", value: `${mainView.analytics.progressScore.toFixed(0)}%`, hint: `${mainView.analytics.snapshot.profitPct.toFixed(2)}% PnL` },
                  { label: "Dias", value: `${mainView.account.daysTraded} / ${mainView.plan.minTradingDays}`, hint: `${Math.max(getDaysRemaining(mainView.account.endDate), 0)}d restantes` },
                ]}
                columns={4}
              />
            </div>
          </PortalSurface>

          {/* Equity + Score */}
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <PortalSurface className="p-5">
              <InteractiveLineChart
                title="Equity"
                subtitle={mainView.account.accountId}
                data={mainView.account.performanceSeries.map((p) => ({
                  label: formatPropDate(p.date, i18n.language, { day: "2-digit", month: "2-digit" }),
                  value: p.balance,
                }))}
                valueFormatter={(v) => currencyBRL(v, i18n.language)}
              />
            </PortalSurface>
            <div className="flex items-center justify-center">
              <EdgeScoreDial score={mainView.analytics.everwinEdgeScore} label="Edge Score" />
            </div>
          </div>

          {/* Rules & Score */}
          <div className="grid gap-4 xl:grid-cols-2">
            <PortalSurface className="p-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Regras da Avaliação</h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-white/40">Limites e progresso</p>
              </div>
              <div className="mt-4 space-y-4">
                <RuleBar
                  label="Meta de Lucro"
                  current={`${mainView.analytics.snapshot.profitPct.toFixed(2)}%`}
                  limit={`${mainView.account.phase === 1 ? mainView.plan.profitTargetPhase1Pct : mainView.plan.profitTargetPhase2Pct}%`}
                  pct={Math.min(mainView.analytics.progressScore, 100)}
                  tone="emerald"
                  met={mainView.analytics.snapshot.isPhaseTargetMet}
                />
                <RuleBar
                  label="Drawdown Máximo"
                  current={currencyBRL(Math.max(mainView.analytics.snapshot.remainingDrawdownBeforeBreach, 0), i18n.language)}
                  limit={`${mainView.plan.maxDrawdownPct}%`}
                  pct={Math.min(((mainView.plan.maxDrawdownPct / 100 * mainView.account.initialBalance - Math.max(mainView.analytics.snapshot.remainingDrawdownBeforeBreach, 0)) / (mainView.plan.maxDrawdownPct / 100 * mainView.account.initialBalance)) * 100, 100)}
                  tone="amber"
                />
                <RuleBar
                  label="Perda Diária"
                  current={currencyBRL(Math.max(mainView.analytics.snapshot.remainingDailyLossBeforePause, 0), i18n.language)}
                  limit={`${mainView.plan.dailyLossLimitPct}%`}
                  pct={Math.min(((mainView.plan.dailyLossLimitPct / 100 * mainView.account.initialBalance - Math.max(mainView.analytics.snapshot.remainingDailyLossBeforePause, 0)) / (mainView.plan.dailyLossLimitPct / 100 * mainView.account.initialBalance)) * 100, 100)}
                  tone={mainView.analytics.snapshot.isDailyLimitBreached ? "red" : "amber"}
                />
                <RuleBar
                  label="Dias Mínimos"
                  current={`${mainView.account.daysTraded}`}
                  limit={`${mainView.plan.minTradingDays}`}
                  pct={Math.min((mainView.account.daysTraded / mainView.plan.minTradingDays) * 100, 100)}
                  tone="sky"
                />
              </div>
            </PortalSurface>

            <PortalSurface className="p-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Score de Performance</h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-white/40">Métricas detalhadas</p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <ScoreCard label="Edge" value={mainView.analytics.everwinEdgeScore} />
                <ScoreCard label="Consistência" value={mainView.analytics.consistencyScore} />
                <ScoreCard label="Disciplina" value={mainView.analytics.riskDisciplineScore} />
                <ScoreCard label="Progresso" value={mainView.analytics.progressScore} />
              </div>
              <div className="mt-4">
                <PortalMetricList
                  items={[
                    { label: "Risco", value: getRiskLabel(mainView.analytics, i18n.language) },
                    { label: "Volatilidade", value: currencyBRL(mainView.analytics.pnlVolatility, i18n.language), hint: "StdDev diário" },
                    { label: "Projeção", value: mainView.analytics.projectedDaysToTarget ? `${mainView.analytics.projectedDaysToTarget}d` : "-", hint: "Para a meta" },
                    { label: "Prazo", value: `${Math.max(getDaysRemaining(mainView.account.endDate), 0)}d`, hint: formatPropDate(mainView.account.endDate, i18n.language) },
                  ]}
                  columns={2}
                />
              </div>
            </PortalSurface>
          </div>

          {/* Access */}
          <PortalSurface className="p-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Dados de Acesso</h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-white/40">Credenciais da conta de operação</p>
            </div>
            <div className="mt-4">
              <PortalMetricList
                items={[
                  { label: "Login", value: mainView.account.platformLogin || "-", hint: mainView.account.platformEmail || undefined },
                  { label: "Broker", value: mainView.account.brokerName || "-", hint: mainView.account.platformName || undefined },
                  { label: "Trade Room", value: mainView.account.tradeRoomUrl ? "Configurado" : "Padrão" },
                  { label: "Senha", value: mainView.account.platformPassword ? "Disponível" : "-" },
                ]}
                columns={4}
              />
            </div>
          </PortalSurface>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#171a23] px-6 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/[0.06] text-slate-400 dark:text-white/35">
            <TrendingUp className="h-7 w-7" />
          </div>
          <p className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Sem Contas</p>
          <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-white/40">Inicie uma nova avaliação para começar.</p>
          <a
            href="https://app.everwin.capital/pt/auth/login"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 hover:shadow-emerald-600/30"
          >
            Começar
          </a>
        </div>
      )}

      {/* All accounts table */}
      {accountViews.length > 1 ? (
        <PortalSurface className="p-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Todas as Contas</h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-white/40">Visão completa das suas contas</p>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/[0.05] text-left">
                  {["Conta", "Plano", "Saldo", "Edge", "Risco", "Status"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/35 first:pl-0 last:pr-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {accountViews.map((entry) => {
                  const st = getAccountStatusMeta(entry.account.status, i18n.language);
                  return (
                    <tr key={entry.account.id} className="border-b border-slate-50 last:border-b-0 dark:border-white/[0.05] transition-colors hover:bg-slate-50/50 dark:hover:bg-white/[0.04]">
                      <td className="px-4 py-3.5 pl-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{entry.account.accountId}</p>
                        <p className="text-xs text-slate-500 dark:text-white/40">{formatPropDate(entry.account.updatedAt, i18n.language)}</p>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-600 dark:text-white/60">{entry.plan.name}</td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{currencyBRL(entry.account.balance, i18n.language)}</p>
                        <p className="text-xs text-slate-500 dark:text-white/40">{formatSignedCurrency(entry.account.todayPnl, i18n.language)}</p>
                      </td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-slate-900 dark:text-white">{entry.analytics.everwinEdgeScore.toFixed(0)}</td>
                      <td className="px-4 py-3.5">
                        <PortalStatusPill tone={getRiskTone(entry.analytics)}>{getRiskLabel(entry.analytics, i18n.language)}</PortalStatusPill>
                      </td>
                      <td className="px-4 py-3.5 pr-0">
                        <PortalStatusPill tone={st.tone}>{st.label}</PortalStatusPill>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </PortalSurface>
      ) : null}
    </div>
  );
}

/* ─── KPI Card ─── */

function KpiCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  tone: "emerald" | "amber" | "red" | "blue" | "slate";
}) {
  const toneMap = {
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    red: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
    blue: "bg-blue-50 text-blue-600 dark:bg-sky-500/10 dark:text-sky-400",
    slate: "bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-white/40",
  };

  const borderMap = {
    emerald: "border-l-emerald-500",
    amber: "border-l-amber-500",
    red: "border-l-red-500",
    blue: "border-l-blue-500",
    slate: "border-l-slate-300",
  };

  return (
    <div className={`rounded-xl border border-l-4 border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#171a23] p-5 ${borderMap[tone]}`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-white/40">{label}</p>
          <p className="mt-2 font-bricolage_grotesque text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{value}</p>
        </div>
        <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneMap[tone]}`}>
          {icon}
        </span>
      </div>
    </div>
  );
}

/* ─── Rule Progress Bar ─── */

function RuleBar({
  label,
  current,
  limit,
  pct,
  tone,
  met,
}: {
  label: string;
  current: string;
  limit: string;
  pct: number;
  tone: "emerald" | "amber" | "red" | "sky";
  met?: boolean;
}) {
  const clamped = Math.max(0, Math.min(pct, 100));
  const barColor = tone === "emerald" ? "bg-emerald-500" : tone === "amber" ? "bg-amber-500" : tone === "red" ? "bg-red-500" : "bg-sky-500";
  const barTrack = tone === "emerald" ? "bg-emerald-100 dark:bg-emerald-500/10" : tone === "amber" ? "bg-amber-100 dark:bg-amber-500/10" : tone === "red" ? "bg-red-100 dark:bg-red-500/10" : "bg-sky-100 dark:bg-sky-500/10";

  return (
    <div className="rounded-xl border border-slate-100 dark:border-white/[0.05] bg-slate-50/50 dark:bg-white/[0.04] px-4 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
          {met ? (
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              ATINGIDO
            </span>
          ) : null}
        </div>
        <div className="text-right">
          <span className="text-sm font-semibold text-slate-900 dark:text-white">{current}</span>
          <span className="text-xs text-slate-400 dark:text-white/35"> / {limit}</span>
        </div>
      </div>
      <div className={cn("mt-3 h-2 overflow-hidden rounded-full", barTrack)}>
        <div className={cn("h-full rounded-full transition-all duration-500", barColor)} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

/* ─── Score Card ─── */

function ScoreCard({ label, value }: { label: string; value: number }) {
  const score = Math.round(value);
  const color = score >= 75 ? "text-emerald-600 dark:text-emerald-400" : score >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";
  const bg = score >= 75 ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20" : score >= 50 ? "bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20" : "bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20";

  return (
    <div className={cn("rounded-xl border px-4 py-3.5 text-center", bg)}>
      <p className="text-xs font-medium text-slate-500 dark:text-white/40">{label}</p>
      <p className={cn("mt-1.5 font-bricolage_grotesque text-3xl font-semibold tracking-tight", color)}>{score}</p>
    </div>
  );
}
