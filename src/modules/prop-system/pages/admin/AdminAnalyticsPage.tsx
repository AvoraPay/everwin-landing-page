import { useEffect, useMemo, useState } from "react";
import { CalendarRange, RefreshCw, ShoppingCart, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Select } from "../../../../components/ui/select";
import { fetchSubmissionsApi } from "../../api";
import { currencyBRL, formatPropDate, getPropUiLanguage, getPropUiLocale } from "../../rules";
import type { AdminSubmissionListItem, PaymentStatus } from "../../types";
import { InteractiveDonutChart } from "../components/charts/InteractiveDonutChart";
import { InteractiveLineChart } from "../components/charts/InteractiveLineChart";
import {
  PortalPageHeader,
  PortalSection,
  PortalSurface,
  PortalStatCard,
  PortalField,
  PortalFilterBar,
  PortalSearchInput,
  PortalLoadingState,
  PortalEmptyState,
  PortalStatusPill,
} from "../../portal-ui";
import {
  analyticsCopy,
  getPaymentVariantLabel,
  type CopyLang,
  type RangePreset,
  type PaymentFilter,
  type StatusFilter,
} from "./analytics-copy";

const DEFAULT_USD_TO_BRL_RATE = 5.7;

function normalizeText(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function formatPercent(value: number, language?: string) {
  return new Intl.NumberFormat(getPropUiLocale(language), { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
}

function formatDateKey(value: string) {
  return new Date(value).toLocaleDateString("en-CA");
}

function convertToBrl(amount: number, currency: string, usdToBrlRate: number) {
  if (currency === "USD") return amount * usdToBrlRate;
  return amount;
}

function getPresetWindow(preset: Exclude<RangePreset, "custom">) {
  if (preset === "all") return { from: "", to: "" };
  const days = preset === "7d" ? 6 : preset === "30d" ? 29 : 89;
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  return { from: start.toLocaleDateString("en-CA"), to: end.toLocaleDateString("en-CA") };
}

function getAppliedRange(preset: RangePreset, fromDate: string, toDate: string) {
  if (preset === "all") return { from: "", to: "" };
  if (preset === "custom") return { from: fromDate, to: toDate };
  return getPresetWindow(preset);
}

function isInRange(value: string, fromDate: string, toDate: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  if (fromDate) { const from = new Date(`${fromDate}T00:00:00`); if (date < from) return false; }
  if (toDate) { const to = new Date(`${toDate}T23:59:59.999`); if (date > to) return false; }
  return true;
}

function buildDateKeys(fromDate: string, toDate: string, items: AdminSubmissionListItem[]) {
  if (!items.length) return [];
  const derivedFrom = fromDate || formatDateKey(items[items.length - 1]?.application.submittedAt ?? items[0].application.submittedAt);
  const derivedTo = toDate || formatDateKey(items[0]?.application.submittedAt ?? items[items.length - 1].application.submittedAt);
  const start = new Date(`${derivedFrom}T00:00:00`);
  const end = new Date(`${derivedTo}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return [];
  const keys: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end) { keys.push(cursor.toLocaleDateString("en-CA")); cursor.setDate(cursor.getDate() + 1); }
  return keys;
}

type DailyMetricRow = { dateKey: string; submissions: number; sales: number; submittedValueBrl: number; approvedValueBrl: number; pendingValueBrl: number };

export function AdminAnalyticsPage() {
  const { i18n } = useTranslation();
  const language = getPropUiLanguage(i18n.language);
  const copy = analyticsCopy[language];

  const [items, setItems] = useState<AdminSubmissionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rangePreset, setRangePreset] = useState<RangePreset>("30d");
  const [fromDate, setFromDate] = useState(() => getPresetWindow("30d").from);
  const [toDate, setToDate] = useState(() => getPresetWindow("30d").to);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [localeFilter, setLocaleFilter] = useState<"all" | "pt" | "en" | "es">("all");
  const [currencyFilter, setCurrencyFilter] = useState<"all" | "BRL" | "USD">("all");
  const [query, setQuery] = useState("");
  const [usdToBrlRate, setUsdToBrlRate] = useState(DEFAULT_USD_TO_BRL_RATE.toString());

  const loadSubmissions = async () => {
    setLoading(true); setError(null);
    try { setItems(await fetchSubmissionsApi()); } catch (err) { setError(err instanceof Error ? err.message : copy.loadError); } finally { setLoading(false); }
  };

  useEffect(() => { void loadSubmissions(); }, []);
  useEffect(() => { if (rangePreset !== "custom") { const w = getPresetWindow(rangePreset); setFromDate(w.from); setToDate(w.to); } }, [rangePreset]);

  const appliedRange = useMemo(() => getAppliedRange(rangePreset, fromDate, toDate), [rangePreset, fromDate, toDate]);
  const parsedFxRate = useMemo(() => { const n = Number(usdToBrlRate); return Number.isFinite(n) && n > 0 ? n : DEFAULT_USD_TO_BRL_RATE; }, [usdToBrlRate]);
  const planOptions = useMemo(() => Array.from(new Set(items.map((i) => i.plan?.name ?? i.application.planId).filter(Boolean))).sort((a, b) => a.localeCompare(b)), [items]);

  const filteredItems = useMemo(() => {
    const nq = normalizeText(query.trim());
    return items.filter((item) => {
      const s = normalizeText([item.application.submissionCode, item.application.fullName, item.application.email, item.application.documentNumber ?? "", item.application.phone, item.plan?.name ?? item.application.planId].join(" "));
      if (nq && !s.includes(nq)) return false;
      if (planFilter !== "all" && (item.plan?.name ?? item.application.planId) !== planFilter) return false;
      if (localeFilter !== "all" && !item.application.locale.startsWith(localeFilter)) return false;
      if (currencyFilter !== "all" && item.application.currency !== currencyFilter) return false;
      if (statusFilter !== "all" && item.application.status !== statusFilter) return false;
      if (paymentFilter !== "all") {
        if (paymentFilter === "open" && !["pending", "overdue"].includes(item.application.paymentStatus)) return false;
        if (paymentFilter !== "open" && item.application.paymentStatus !== paymentFilter) return false;
      }
      return isInRange(item.application.submittedAt, appliedRange.from, appliedRange.to);
    });
  }, [items, query, planFilter, localeFilter, currencyFilter, statusFilter, paymentFilter, appliedRange]);

  const approvedItems = useMemo(() => filteredItems.filter((i) => i.application.paymentStatus === "approved"), [filteredItems]);
  const openItems = useMemo(() => filteredItems.filter((i) => ["pending", "overdue"].includes(i.application.paymentStatus)), [filteredItems]);

  const totals = useMemo(() => {
    const sv = filteredItems.reduce((a, i) => a + convertToBrl(i.application.amount, i.application.currency, parsedFxRate), 0);
    const av = approvedItems.reduce((a, i) => a + convertToBrl(i.application.amount, i.application.currency, parsedFxRate), 0);
    const ov = openItems.reduce((a, i) => a + convertToBrl(i.application.amount, i.application.currency, parsedFxRate), 0);
    return { submittedValueBrl: sv, approvedValueBrl: av, openValueBrl: ov, approvedCount: approvedItems.length, conversionPct: filteredItems.length ? (approvedItems.length / filteredItems.length) * 100 : 0, averageApprovedTicketBrl: approvedItems.length ? av / approvedItems.length : 0 };
  }, [filteredItems, approvedItems, openItems, parsedFxRate]);

  const dailyRows = useMemo<DailyMetricRow[]>(() => {
    const keys = buildDateKeys(appliedRange.from, appliedRange.to, filteredItems);
    const map = new Map<string, DailyMetricRow>(keys.map((dk) => [dk, { dateKey: dk, submissions: 0, sales: 0, submittedValueBrl: 0, approvedValueBrl: 0, pendingValueBrl: 0 }]));
    filteredItems.forEach((item) => {
      const sk = formatDateKey(item.application.submittedAt);
      const sr = map.get(sk);
      if (sr) { sr.submissions += 1; sr.submittedValueBrl += convertToBrl(item.application.amount, item.application.currency, parsedFxRate); if (["pending", "overdue"].includes(item.application.paymentStatus)) sr.pendingValueBrl += convertToBrl(item.application.amount, item.application.currency, parsedFxRate); }
      const approvedAt = item.application.paidAt ?? item.payment?.approvedAt;
      if (item.application.paymentStatus === "approved" && approvedAt) { const ak = formatDateKey(approvedAt); const ar = map.get(ak); if (ar) { ar.sales += 1; ar.approvedValueBrl += convertToBrl(item.application.amount, item.application.currency, parsedFxRate); } }
    });
    return Array.from(map.values());
  }, [filteredItems, parsedFxRate, appliedRange]);

  const submissionsChartData = useMemo(() => dailyRows.map((r) => ({ label: formatPropDate(r.dateKey, i18n.language, { day: "2-digit", month: "2-digit" }), value: r.submissions })), [dailyRows, i18n.language]);
  const approvedRevenueChartData = useMemo(() => dailyRows.map((r) => ({ label: formatPropDate(r.dateKey, i18n.language, { day: "2-digit", month: "2-digit" }), value: r.approvedValueBrl })), [dailyRows, i18n.language]);

  const paymentDistribution = useMemo(() =>
    (["approved", "pending", "overdue", "failed", "cancelled"] as PaymentStatus[])
      .map((st) => ({ label: getPaymentVariantLabel(st, language), value: filteredItems.filter((i) => i.application.paymentStatus === st).length, color: st === "approved" ? "#10b981" : st === "pending" ? "#3b82f6" : st === "overdue" ? "#f59e0b" : st === "failed" ? "#ef4444" : "#64748b" }))
      .filter((i) => i.value > 0),
  [filteredItems, language]);

  const planDistribution = useMemo(() =>
    planOptions.map((pn, idx) => ({ label: pn, value: filteredItems.filter((i) => (i.plan?.name ?? i.application.planId) === pn).length, color: ["#10b981", "#0f172a", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"][idx % 6] })).filter((i) => i.value > 0),
  [filteredItems, planOptions]);

  const sel = "h-10 rounded-xl border-slate-200 dark:border-white/[0.07] bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20";
  const inp = "h-10 rounded-xl border-slate-200 dark:border-white/[0.07] bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/35 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20";

  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow="Análise"
        title={copy.title}
        description={copy.description}
        actions={<Button type="button" className="h-10 rounded-lg bg-emerald-600 dark:bg-emerald-600 px-5 text-white hover:bg-emerald-500 dark:hover:bg-emerald-500" onClick={() => void loadSubmissions()}><RefreshCw className="h-4 w-4" />{copy.refresh}</Button>}
        meta={<><PortalStatusPill tone="success">Sales: {totals.approvedCount}</PortalStatusPill><PortalStatusPill tone="warning">Pipeline: {openItems.length}</PortalStatusPill><PortalStatusPill tone="neutral">{filteredItems.length} Total</PortalStatusPill></>}
      />

      <PortalSection title={copy.filtersTitle} description={copy.filtersDescription}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <PortalField label={copy.range}>
            <Select value={rangePreset} onChange={(e) => setRangePreset(e.target.value as RangePreset)} className={sel}>
              {(["7d", "30d", "90d", "all", "custom"] as RangePreset[]).map((p) => <option key={p} value={p}>{copy.presets[p]}</option>)}
            </Select>
          </PortalField>
          <PortalField label={copy.from}><Input type="date" value={fromDate} className={inp} onChange={(e) => { setRangePreset("custom"); setFromDate(e.target.value); }} /></PortalField>
          <PortalField label={copy.to}><Input type="date" value={toDate} className={inp} onChange={(e) => { setRangePreset("custom"); setToDate(e.target.value); }} /></PortalField>
          <PortalField label={copy.fx} hint={copy.fxHelper}><Input type="number" min="0.01" step="0.01" value={usdToBrlRate} className={inp} onChange={(e) => setUsdToBrlRate(e.target.value)} /></PortalField>
          <PortalField label={copy.payment}>
            <Select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value as PaymentFilter)} className={sel}>
              {(["all", "approved", "open", "overdue", "failed", "cancelled"] as PaymentFilter[]).map((o) => <option key={o} value={o}>{copy.paymentOptions[o]}</option>)}
            </Select>
          </PortalField>
          <PortalField label={copy.status}>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className={sel}>
              {(["all", "submitted", "payment_pending", "payment_overdue", "payment_approved", "under_review", "access_ready", "account_ready", "rejected", "cancelled"] as StatusFilter[]).map((o) => <option key={o} value={o}>{copy.statusOptions[o]}</option>)}
            </Select>
          </PortalField>
          <PortalField label={copy.plan}>
            <Select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className={sel}>
              <option value="all">{copy.planAll}</option>
              {planOptions.map((pn) => <option key={pn} value={pn}>{pn}</option>)}
            </Select>
          </PortalField>
          <PortalField label={copy.locale}>
            <Select value={localeFilter} onChange={(e) => setLocaleFilter(e.target.value as "all" | "pt" | "en" | "es")} className={sel}>
              {(Object.entries(copy.localeOptions) as [string, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </PortalField>
          <PortalField label={copy.currency}>
            <Select value={currencyFilter} onChange={(e) => setCurrencyFilter(e.target.value as "all" | "BRL" | "USD")} className={sel}>
              {(Object.entries(copy.currencyOptions) as [string, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </PortalField>
          <div className="md:col-span-2 xl:col-span-3">
            <PortalField label={copy.search}><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={copy.searchPlaceholder} className={inp} /></PortalField>
          </div>
        </div>
      </PortalSection>

      {error ? <PortalSurface className="border-rose-200 bg-rose-50 dark:border-red-500/20 dark:bg-red-500/10"><p className="text-sm font-medium text-rose-700 dark:text-red-400">{error}</p></PortalSurface> : null}

      {loading ? <PortalLoadingState title={copy.loading} lines={3} /> : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <PortalStatCard label={copy.kpis.submissions} value={filteredItems.length} helper={copy.helpers.submissions} tone="neutral" icon={<RefreshCw className="h-4 w-4" />} />
            <PortalStatCard label={copy.kpis.sales} value={totals.approvedCount} helper={copy.helpers.sales} tone="success" icon={<ShoppingCart className="h-4 w-4" />} />
            <PortalStatCard label={copy.kpis.conversion} value={`${formatPercent(totals.conversionPct, i18n.language)}%`} helper={copy.helpers.conversion} tone="info" icon={<CalendarRange className="h-4 w-4" />} />
            <PortalStatCard label={copy.kpis.realizedRevenue} value={currencyBRL(totals.approvedValueBrl, i18n.language)} helper={copy.helpers.realizedRevenue} tone="success" icon={<Wallet className="h-4 w-4" />} />
            <PortalStatCard label={copy.kpis.pipelineRevenue} value={currencyBRL(totals.openValueBrl, i18n.language)} helper={copy.helpers.pipelineRevenue} tone="warning" icon={<Wallet className="h-4 w-4" />} />
            <PortalStatCard label={copy.kpis.averageTicket} value={currencyBRL(totals.averageApprovedTicketBrl, i18n.language)} helper={copy.helpers.averageTicket} tone="neutral" icon={<ShoppingCart className="h-4 w-4" />} />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <InteractiveLineChart title={copy.charts.submissions} subtitle={copy.charts.submissionsSubtitle} data={submissionsChartData} />
            <InteractiveLineChart title={copy.charts.approvedRevenue} subtitle={copy.charts.approvedRevenueSubtitle} data={approvedRevenueChartData} valueFormatter={(v) => currencyBRL(v, i18n.language)} />
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <InteractiveDonutChart title={copy.charts.paymentMix} data={paymentDistribution} />
            <InteractiveDonutChart title={copy.charts.planMix} data={planDistribution} />
          </div>

          <PortalSection title={copy.table.title} description={copy.table.subtitle}>
            {dailyRows.length === 0 ? <PortalEmptyState title={copy.table.empty} /> : (
              <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-white/[0.07]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/[0.07] bg-slate-50 dark:bg-white/[0.04]">
                        <th scope="col" className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-white/40">{copy.table.day}</th>
                        <th scope="col" className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-white/40">{copy.table.submissions}</th>
                        <th scope="col" className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-white/40">{copy.table.sales}</th>
                        <th scope="col" className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-white/40">{copy.table.conversion}</th>
                        <th scope="col" className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-white/40">{copy.table.submittedValue}</th>
                        <th scope="col" className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-white/40">{copy.table.approvedValue}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyRows.map((row) => {
                        const conv = row.submissions ? (row.sales / row.submissions) * 100 : 0;
                        return (
                          <tr key={row.dateKey} className="border-b border-slate-100 dark:border-white/[0.05] last:border-b-0 hover:bg-slate-50/60 dark:hover:bg-white/[0.04]">
                            <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-950 dark:text-white">{formatPropDate(row.dateKey, i18n.language, { day: "2-digit", month: "short" })}</td>
                            <td className="px-4 py-3 text-slate-600 dark:text-white/60">{row.submissions}</td>
                            <td className="px-4 py-3 text-slate-600 dark:text-white/60">{row.sales}</td>
                            <td className="px-4 py-3 text-slate-600 dark:text-white/60">{formatPercent(conv, i18n.language)}%</td>
                            <td className="px-4 py-3 text-slate-600 dark:text-white/60">{currencyBRL(row.submittedValueBrl, i18n.language)}</td>
                            <td className="px-4 py-3"><p className="text-slate-600 dark:text-white/60">{currencyBRL(row.approvedValueBrl, i18n.language)}</p><p className="mt-0.5 text-xs text-slate-400 dark:text-white/35">{copy.table.pendingValue}: {currencyBRL(row.pendingValueBrl, i18n.language)}</p></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {!filteredItems.length ? <PortalEmptyState title={copy.noData} className="mt-4" /> : null}
          </PortalSection>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <PortalStatCard label={copy.kpis.sales} value={totals.approvedCount} helper={currencyBRL(totals.approvedValueBrl, i18n.language)} tone="success" icon={<ShoppingCart className="h-4 w-4" />} />
            <PortalStatCard label={copy.kpis.pipelineRevenue} value={currencyBRL(totals.openValueBrl, i18n.language)} helper={`${openItems.length} ${copy.kpis.submissions.toLowerCase()}`} tone="info" icon={<Wallet className="h-4 w-4" />} />
            <PortalStatCard label={copy.kpis.conversion} value={`${formatPercent(totals.conversionPct, i18n.language)}%`} helper={`${filteredItems.length} ${copy.kpis.submissions.toLowerCase()}`} tone="warning" icon={<CalendarRange className="h-4 w-4" />} />
          </div>
        </>
      )}
    </div>
  );
}
