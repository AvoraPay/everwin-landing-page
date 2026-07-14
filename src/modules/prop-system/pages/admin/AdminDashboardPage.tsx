import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Clock,
  FileText,
  RefreshCw,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../../../../components/ui/button";
import { usePropSystem } from "../../context";
import { fetchSubmissionsApi } from "../../api";
import {
  buildAccountAnalytics,
  buildPortfolioEquitySeries,
  currencyBRL,
  formatPropDate,
  formatPropDateTime,
  getPlanById,
} from "../../rules";
import {
  getAccountStatusMeta,
  getRiskTone,
  getSubmissionStatusMeta,
} from "../../portal-presentation";
import {
  PortalMetricList,
  PortalPageHeader,
  PortalSection,
  PortalStatusPill,
  PortalSurface,
  PortalStatCard,
} from "../../portal-ui";
import type { AdminSubmissionListItem } from "../../types";
import { InteractiveLineChart } from "../components/charts/InteractiveLineChart";
import { useTheme } from "../../theme";

export function AdminDashboardPage() {
  const { state, usersById, runRulesEvaluation, currentUser } = usePropSystem();
  const { theme } = useTheme();
  const { i18n } = useTranslation();
  const [submissions, setSubmissions] = useState<AdminSubmissionListItem[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") return;
    let mounted = true;
    setLoadingSubs(true);
    fetchSubmissionsApi()
      .then((items) => { if (mounted) setSubmissions(items); })
      .catch(() => { if (mounted) setSubmissions([]); })
      .finally(() => { if (mounted) setLoadingSubs(false); });
    return () => { mounted = false; };
  }, [currentUser]);

  const nowISO = new Date().toISOString();
  const views = useMemo(() =>
    state.accounts.map((account) => {
      const plan = getPlanById(state.plans, account.planId);
      const analytics = buildAccountAnalytics(account, plan, nowISO);
      return { account, plan, analytics };
    }),
  [nowISO, state.accounts, state.plans]);

  const active = views.filter((e) => e.account.status === "active").length;
  const funded = views.filter((e) => e.account.status === "approved_for_funded" || e.account.status === "passed").length;

  const riskList = [...views]
    .filter((e) => e.account.status === "active")
    .sort((a, b) => a.analytics.snapshot.remainingDrawdownBeforeBreach - b.analytics.snapshot.remainingDrawdownBeforeBreach)
    .slice(0, 6);

  const equityData = buildPortfolioEquitySeries(state.accounts).slice(-30).map((p) => ({
    label: formatPropDate(p.date, i18n.language, { day: "2-digit", month: "2-digit" }),
    value: p.equity,
  }));

  const subSummary = {
    total: submissions.length,
    open: submissions.filter((s) => ["pending", "overdue"].includes(s.application.paymentStatus)).length,
    review: submissions.filter((s) => s.application.status === "under_review").length,
    ready: submissions.filter((s) => s.application.status === "access_ready" || s.application.status === "account_ready").length,
    approved: submissions.filter((s) => s.application.status === "approved").length,
    totalRevenue: submissions.reduce((acc, s) => acc + (s.application.paymentAmount ?? 0), 0),
  };

  const accountStatusSummary = useMemo(() => {
    const statusMap: Record<string, number> = {};
    state.accounts.forEach((acc) => {
      const meta = getAccountStatusMeta(acc.status, i18n.language);
      statusMap[meta.label] = (statusMap[meta.label] || 0) + 1;
    });
    return Object.entries(statusMap).map(([label, count]) => ({ label, count }));
  }, [state.accounts, i18n.language]);

  const paymentBreakdown = useMemo(() => {
    const paid = submissions.filter((s) => s.application.paymentStatus === "paid").length;
    const pending = submissions.filter((s) => ["pending", "overdue"].includes(s.application.paymentStatus)).length;
    const failed = submissions.filter((s) => s.application.paymentStatus === "failed").length;
    return [
      { label: "Pagas", count: paid },
      { label: "Pendentes", count: pending },
      { label: "Falhas", count: failed },
    ];
  }, [submissions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PortalPageHeader
        eyebrow="Admin"
        title="Visão Geral"
        description="Acompanhe o desempenho do sistema prop"
        actions={
          <Button
            type="button"
            size="sm"
            className="h-10 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 hover:shadow-emerald-600/30 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            onClick={() => void runRulesEvaluation()}
          >
            <RefreshCw className="h-4 w-4" />
            Reavaliar
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <PortalStatCard
          label="Total de Inscrições"
          value={loadingSubs ? "..." : subSummary.total}
          helper={loadingSubs ? undefined : `${subSummary.open} abertos`}
          icon={<FileText className="h-4 w-4" />}
          tone="info"
        />
        <PortalStatCard
          label="Aprovação Pendente"
          value={loadingSubs ? "..." : subSummary.review}
          helper={loadingSubs ? undefined : `${subSummary.open} pagamentos pendentes`}
          icon={<Clock className="h-4 w-4" />}
          tone="warning"
        />
        <PortalStatCard
          label="Aprovadas"
          value={loadingSubs ? "..." : subSummary.approved}
          icon={<TrendingUp className="h-4 w-4" />}
          tone="success"
        />
        <PortalStatCard
          label="Receita Total"
          value={loadingSubs ? "..." : currencyBRL(subSummary.totalRevenue, i18n.language)}
          icon={<Wallet className="h-4 w-4" />}
          tone="success"
        />
        <PortalStatCard
          label="Contas Ativas"
          value={active}
          helper={`${funded} financiadas`}
          icon={<Activity className="h-4 w-4" />}
          tone="success"
        />
        <PortalStatCard
          label="Usuários Ativos"
          value={new Set(state.accounts.map((a) => a.userId)).size}
          helper={`${views.length} contas`}
          icon={<Users className="h-4 w-4" />}
          tone="info"
        />
      </div>

      {/* Equity + Submissions */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
        <PortalSurface className="p-5">
          <InteractiveLineChart
            title="Equity"
            subtitle="Portfólio"
            data={equityData}
            valueFormatter={(v) => currencyBRL(v, i18n.language)}
            theme={theme}
          />
        </PortalSurface>

        <PortalSection
          title="Inscrições"
          description="Últimas submissões"
          actions={
            <Button asChild variant="outline" size="sm" className="h-8 rounded-lg text-xs dark:border-white/[0.05] dark:bg-[#171a23] dark:text-white/70">
              <Link to="/prop/admin/submissions">Ver todas</Link>
            </Button>
          }
        >
          {loadingSubs ? (
            <div className="flex items-center gap-2 py-8 text-sm text-slate-500 dark:text-white/50">
              <Clock className="h-4 w-4 animate-spin" /> Carregando...
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400 dark:text-white/40">Sem inscrições</div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <PortalStatusPill tone="warning">{subSummary.open} Abertos</PortalStatusPill>
                <PortalStatusPill tone="info">{subSummary.review} Revisão</PortalStatusPill>
                <PortalStatusPill tone="success">{subSummary.ready} Prontos</PortalStatusPill>
              </div>
              <div className="space-y-2">
                {submissions.slice(0, 5).map((item) => {
                  const st = getSubmissionStatusMeta(item.application.status, i18n.language);
                  return (
                    <div key={item.application.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 transition-colors hover:bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.03] dark:hover:bg-white/[0.04]">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{item.application.fullName}</p>
                        <p className="truncate text-xs text-slate-500 dark:text-white/50">{item.plan?.name ?? "-"} · {formatPropDate(item.application.submittedAt, i18n.language)}</p>
                      </div>
                      <PortalStatusPill tone={st.tone}>{st.label}</PortalStatusPill>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </PortalSection>
      </div>

      {/* Risk Watchlist + Payment Breakdown + Account Status */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <PortalSection
          title="Watchlist de Risco"
          description="Contas com drawdown próximo ao limite"
          actions={
            <Button asChild variant="outline" size="sm" className="h-8 rounded-lg text-xs dark:border-white/[0.05] dark:bg-[#171a23] dark:text-white/70">
              <Link to="/prop/admin/accounts">Contas</Link>
            </Button>
          }
        >
          {riskList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <Activity className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-slate-900 dark:text-white">Sem risco</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-white/50">Todas contas dentro dos limites.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/[0.07]">
                    {["Conta", "Cliente", "Drawdown", "DLL", "Edge"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40 first:pl-0 last:pr-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {riskList.map((entry) => (
                    <tr key={entry.account.id} className="border-b border-slate-50 last:border-b-0 transition-colors hover:bg-slate-50/50 dark:border-white/[0.07] dark:hover:bg-white/[0.04]/50">
                      <td className="px-4 py-3 pl-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{entry.account.accountId}</p>
                        <p className="text-xs text-slate-500 dark:text-white/50">{entry.plan.name}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-white/70">{usersById[entry.account.userId]?.name ?? "-"}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{currencyBRL(Math.max(entry.analytics.snapshot.remainingDrawdownBeforeBreach, 0), i18n.language)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{currencyBRL(Math.max(entry.analytics.snapshot.remainingDailyLossBeforePause, 0), i18n.language)}</td>
                      <td className="px-4 py-3 pr-0">
                        <PortalStatusPill tone={getRiskTone(entry.analytics)}>{entry.analytics.everwinEdgeScore.toFixed(0)}</PortalStatusPill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </PortalSection>

        <div className="space-y-4">
          <PortalSurface className="p-5">
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Pagamentos</h3>
            <PortalMetricList
              items={paymentBreakdown.map((p) => ({
                label: p.label,
                value: p.count,
              }))}
              columns={3}
            />
          </PortalSurface>

          <PortalSurface className="p-5">
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Status das Contas</h3>
            <PortalMetricList
              items={accountStatusSummary.map((s) => ({
                label: s.label,
                value: s.count,
              }))}
              columns={2}
            />
          </PortalSurface>
        </div>
      </div>

      {/* Audit Log */}
      <PortalSection
        title="Auditoria"
        description="Últimas ações registradas"
      >
        {state.auditLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-[#171a23] dark:text-white/40">
              <Clock className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-900 dark:text-white">Sem eventos</p>
          </div>
        ) : (
          <div className="space-y-2">
            {state.auditLogs.slice(0, 8).map((log) => (
              <div key={log.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 transition-colors hover:bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.03] dark:hover:bg-white/[0.04]">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{log.action}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-white/50">{formatPropDateTime(log.createdAt, i18n.language)} · {log.entityType}</p>
                </div>
                <PortalStatusPill tone="neutral">{log.entityType}</PortalStatusPill>
              </div>
            ))}
          </div>
        )}
      </PortalSection>
    </div>
  );
}
