import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  CalendarClock,
  CalendarDays,
  Check,
  X,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  FileText,
  Gauge,
  KeyRound,
  ScrollText,
  ShieldCheck,
  Target,
  TrendingUp,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../../../../lib/utils";
import { usePropSystem } from "../../context";
import { fetchMySubmissionsApi } from "../../api";
import {
  buildAccountAnalytics,
  formatPropDate,
  formatPropDateTime,
  formatPropMoney,
  getPlanById,
} from "../../rules";
import { getAccountStatusMeta, getDaysRemaining, getPaymentStatusMeta } from "../../portal-presentation";
import { EdgeScoreDial } from "../components/charts/EdgeScoreDial";
import { InteractiveLineChart } from "../components/charts/InteractiveLineChart";
import { DailyResultBars, PropGuide, ResultsCalendar } from "./portal-widgets";
import type { ClientSubmissionItem, PlanTemplate, PropAccount } from "../../types";

/* ── the landing page's vocabulary, reused verbatim so the portal reads as the
      same product: Bricolage display type, 2xl cards, pill badges, emerald glow ── */

const CARD = "rounded-2xl border border-white/[0.07] bg-[linear-gradient(-83deg,rgb(23,26,35)_8%,rgb(37,42,54)_171%)] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.6)]";
const CARD_HOVER = "transition-all duration-300 hover:border-white/[0.14] hover:shadow-[0_28px_70px_-28px_rgba(0,0,0,0.75)]";
const LABEL = "font-bricolage_grotesque text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35";
const DISPLAY = "font-bricolage_grotesque font-bold tracking-[-0.03em] text-white";

const SECTIONS = [
  { id: "resumo", label: "Resumo", icon: Gauge },
  { id: "risco", label: "Risco", icon: ShieldCheck },
  { id: "desempenho", label: "Desempenho", icon: TrendingUp },
  { id: "calendario", label: "Calendário", icon: CalendarDays },
  { id: "acesso", label: "Acesso", icon: KeyRound },
  { id: "regras", label: "Regras", icon: ScrollText },
  { id: "guia", label: "Guia", icon: BookOpen },
  { id: "inscricao", label: "Inscrição", icon: FileText },
] as const;

/** Soft emerald light behind a block — the landing page's signature. */
function Glow({ className }: { className?: string }) {
  return <div aria-hidden className={cn("pointer-events-none absolute rounded-full bg-emerald-500/10 blur-[110px]", className)} />;
}

function Pill({ tone = "neutral", children }: { tone?: "live" | "warn" | "danger" | "neutral"; children: React.ReactNode }) {
  const map = {
    live: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    warn: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    danger: "border-red-500/30 bg-red-500/10 text-red-400",
    neutral: "border-white/10 bg-white/[0.04] text-white/55",
  };
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border px-4 py-1.5 backdrop-blur-sm", map[tone])}>
      {tone === "live" ? (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
      ) : null}
      <span className="font-bricolage_grotesque text-[11px] font-semibold uppercase tracking-[0.14em]">{children}</span>
    </span>
  );
}

function Section({
  id,
  active,
  title,
  hint,
  action,
  children,
}: {
  id: string;
  active: string;
  title: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  if (id !== active) return null;
  return (
    <section id={id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className={cn(DISPLAY, "text-[22px] leading-tight")}>{title}</h2>
          {hint ? <p className="mt-1 font-bricolage_grotesque text-sm text-white/40">{hint}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** A number the trader reads at a glance, with the unit spelled out under it. */
function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "up" | "down" }) {
  return (
    <div className={cn(CARD, CARD_HOVER, "group p-5")}>
      <p className={LABEL}>{label}</p>
      <p
        className={cn(
          "mt-2 font-bricolage_grotesque text-[26px] font-bold tabular-nums tracking-[-0.02em] transition-transform duration-300 group-hover:translate-x-0.5",
          tone === "up" ? "text-emerald-400" : tone === "down" ? "text-red-400" : "text-white",
        )}
      >
        {value}
      </p>
      {sub ? <p className="mt-1 font-bricolage_grotesque text-xs text-white/35">{sub}</p> : null}
    </div>
  );
}

/**
 * A limit expressed as room left, never as a bare percentage — "US$ 7.500 até
 * estourar" is actionable; "62%" is not.
 */
function Meter({
  label,
  headline,
  hint,
  pct,
  tone,
}: {
  label: string;
  headline: string;
  hint: string;
  pct: number;
  tone: "good" | "warn" | "bad";
}) {
  const bar = tone === "bad" ? "bg-red-500" : tone === "warn" ? "bg-amber-400" : "bg-emerald-500";
  const text = tone === "bad" ? "text-red-400" : tone === "warn" ? "text-amber-400" : "text-emerald-400";
  return (
    <div className={cn(CARD, CARD_HOVER, "p-5")}>
      <div className="flex items-baseline justify-between gap-3">
        <p className={LABEL}>{label}</p>
        <span className={cn("font-bricolage_grotesque text-xs font-semibold tabular-nums", text)}>
          {pct >= 99.5 ? "livre" : `${Math.round(pct)}%`}
        </span>
      </div>
      <p className={cn("mt-2 font-bricolage_grotesque text-[22px] font-bold tabular-nums tracking-[-0.02em]", text)}>{headline}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={cn("h-full rounded-full transition-[width] duration-700 ease-out", bar)}
          style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
        />
      </div>
      <p className="mt-2 font-bricolage_grotesque text-xs text-white/35">{hint}</p>
    </div>
  );
}

/** One credential, revealable and copyable — the two things a trader does here. */
function CopyRow({ label, value, secret }: { label: string; value: string; secret?: boolean }) {
  const [shown, setShown] = useState(!secret);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="bg-[rgb(23,26,35)] px-6 py-5">
      <p className={LABEL}>{label}</p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="min-w-0 truncate font-mono text-[15px] font-semibold text-white">
          {value ? (shown ? value : "•".repeat(Math.min(value.length, 18))) : "não disponível"}
        </p>
        <div className="flex shrink-0 items-center gap-1">
          {secret && value ? (
            <button
              type="button"
              onClick={() => setShown((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] text-white/40 transition hover:border-white/20 hover:text-white"
              aria-label={shown ? "Ocultar" : "Mostrar"}
            >
              {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          ) : null}
          {value ? (
            <button
              type="button"
              onClick={() => void copy()}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 font-bricolage_grotesque text-xs font-semibold transition",
                copied
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : "border-white/[0.07] text-white/45 hover:border-white/20 hover:text-white",
              )}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "copiado" : "copiar"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function TradeRoomDialog({
  open,
  onClose,
  login,
  password,
  url,
}: {
  open: boolean;
  onClose: () => void;
  login: string;
  password: string;
  url: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
      <button type="button" className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Fechar" />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          CARD,
          "relative w-full max-w-lg animate-in fade-in zoom-in-95 duration-200",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10">
              <KeyRound className="h-4 w-4 text-amber-400" />
            </span>
            <div>
              <p className="font-bricolage_grotesque text-base font-semibold text-white">Entre com a conta de avaliação</p>
              <p className="font-bricolage_grotesque text-xs text-white/40">Não é o mesmo login do portal</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] text-white/40 transition hover:border-white/20 hover:text-white"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-px bg-white/[0.06]">
          <CopyRow label="Login da plataforma" value={login} />
          <CopyRow label="Senha da plataforma" value={password} secret />
        </div>

        <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl border border-white/[0.07] font-bricolage_grotesque text-sm font-semibold text-white/60 transition hover:border-white/20 hover:text-white"
          >
            Voltar
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,rgb(16,185,129),rgb(5,150,105))] font-bricolage_grotesque text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(16,185,129,0.4)] transition hover:opacity-90"
          >
            <ExternalLink className="h-4 w-4" />
            Continuar
          </a>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  const empty = !value || value === "-";
  return (
    <div>
      <p className={LABEL}>{label}</p>
      <p
        className={cn(
          "mt-1 break-words font-bricolage_grotesque text-sm",
          empty ? "text-white/25" : "font-medium text-white",
        )}
      >
        {empty ? "não informado" : value}
      </p>
    </div>
  );
}

type TabId = (typeof SECTIONS)[number]["id"];

export function ClientPortalPage() {
  const { currentUser, getUserAccounts, state, refreshAll } = usePropSystem();
  useTranslation();
  const lang = "pt-BR";

  const [submission, setSubmission] = useState<ClientSubmissionItem | null>(null);
  // The tab lives in the hash so a refresh and a shared link both land right.
  const [active, setActive] = useState<TabId>(() => {
    const fromHash = window.location.hash.replace("#", "");
    return (SECTIONS.some((s) => s.id === fromHash) ? fromHash : "resumo") as TabId;
  });
  const [selectedId, setSelectedId] = useState<string>("");
  const [tradeRoomOpen, setTradeRoomOpen] = useState(false);

  // Balances move while the trader is logged in. Without this the screen keeps
  // showing whatever was true at login, which reads as invented data.
  useEffect(() => {
    void refreshAll();
    const timer = setInterval(() => void refreshAll(), 60_000);
    return () => clearInterval(timer);
  }, [refreshAll]);

  useEffect(() => {
    let cancelled = false;
    fetchMySubmissionsApi()
      .then((rows) => {
        if (cancelled) return;
        const latest = [...rows].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];
        setSubmission(latest ?? null);
      })
      .catch(() => {
        if (!cancelled) setSubmission(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    window.history.replaceState(null, "", `#${active}`);
  }, [active]);

  const views = useMemo(() => {
    if (!currentUser) return [];
    const nowISO = new Date().toISOString();
    return getUserAccounts(currentUser.id).map((account: PropAccount) => {
      let plan: PlanTemplate | null = null;
      try {
        plan = getPlanById(state.plans, account.planId);
      } catch {
        plan = null;
      }
      return { account, plan, analytics: plan ? buildAccountAnalytics(account, plan, nowISO) : null };
    });
  }, [currentUser, getUserAccounts, state.plans]);

  // Every hook runs before this guard: currentUser flips null → filled on login.
  if (!currentUser) return null;

  const view = views.find((v) => v.account.id === selectedId) ?? views[0] ?? null;
  const account = view?.account ?? null;
  const plan = view?.plan ?? null;
  const analytics = view?.analytics ?? null;
  const currency = plan?.currency ?? submission?.currency ?? "BRL";
  const money = (value: number) => formatPropMoney(value, currency, lang);

  const status = account ? getAccountStatusMeta(account.status, lang) : null;
  const daysLeft = account ? Math.max(getDaysRemaining(account.endDate), 0) : 0;
  const snapshot = analytics?.snapshot ?? null;

  const profit = account ? account.balance - account.initialBalance : 0;
  const targetMoney = snapshot && account ? (snapshot.targetPct / 100) * account.initialBalance : 0;
  const targetPct = snapshot ? Math.max(0, Math.min(100, (snapshot.profitPct / snapshot.targetPct) * 100)) : 0;

  const ddLeft = snapshot ? Math.min(Math.max(snapshot.remainingDrawdownBeforeBreach, 0), snapshot.maxAllowedLoss) : 0;
  const ddPct = snapshot && snapshot.maxAllowedLoss > 0 ? Math.min((ddLeft / snapshot.maxAllowedLoss) * 100, 100) : 0;
  const dayLeft = snapshot ? Math.min(Math.max(snapshot.remainingDailyLossBeforePause, 0), snapshot.dailyLossLimit) : 0;
  const dayPct = snapshot && snapshot.dailyLossLimit > 0 ? Math.min((dayLeft / snapshot.dailyLossLimit) * 100, 100) : 0;

  const tone = (pct: number) => (pct <= 20 ? "bad" : pct <= 50 ? "warn" : "good") as "good" | "warn" | "bad";

  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-[linear-gradient(187deg,rgb(17,19,26)_-24%,rgb(24,27,36)_100%)]">
      <Glow className="-right-48 -top-32 h-[420px] w-[420px]" />
      <Glow className="-left-36 top-[900px] h-[380px] w-[380px] bg-emerald-400/[0.07]" />

      <div className="relative mx-auto w-full max-w-[1600px] flex-1 space-y-8 px-4 py-8 sm:px-6 lg:px-10 2xl:px-16">
        {/* ── identity ── */}
        <header className="relative flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
            <h1 className={cn(DISPLAY, "text-[26px] leading-none sm:text-[30px]")}>{currentUser.name}</h1>
            <Pill tone={account?.status === "active" ? "live" : "neutral"}>{status?.label ?? "Sem conta"}</Pill>
            {account ? (
              <span className="font-bricolage_grotesque text-sm text-white/40">
                <span className="font-mono text-white/60">{account.accountId}</span>
                {" · "}
                {plan?.name}
                {" · Fase "}
                {account.phase}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {views.length > 1
              ? views.map((v) => (
                  <button
                    key={v.account.id}
                    type="button"
                    onClick={() => setSelectedId(v.account.id)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 font-mono text-[11px] font-semibold transition",
                      v.account.id === account?.id
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                        : "border-white/[0.07] bg-white/[0.03] text-white/40 hover:text-white/80",
                    )}
                  >
                    {v.account.accountId}
                  </button>
                ))
              : null}

            {account ? (
              <button
                type="button"
                onClick={() => setTradeRoomOpen(true)}
                className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,rgb(16,185,129),rgb(5,150,105))] px-5 font-bricolage_grotesque text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(16,185,129,0.4)] transition hover:opacity-90"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir plataforma
              </button>
            ) : null}
          </div>
        </header>

        {/* ── tab bar: full width, centred, one panel at a time ── */}
        <div className="sticky top-20 z-20 -mx-4 border-b border-white/[0.07] bg-[rgb(20,23,31)]/92 px-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 2xl:-mx-16 2xl:px-16">
          <div
            role="tablist"
            aria-label="Seções do portal"
            className="mx-auto flex w-full max-w-[1600px] justify-start gap-0.5 overflow-x-auto [scrollbar-width:none] sm:justify-center [&::-webkit-scrollbar]:hidden"
          >
            {SECTIONS.map((tab) => {
              const Icon = tab.icon;
              const on = active === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={on}
                  type="button"
                  onClick={() => setActive(tab.id)}
                  className={cn(
                    "group relative flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-5 py-4 font-bricolage_grotesque text-[13px] font-semibold transition-colors duration-150",
                    on
                      ? "border-emerald-500 text-white"
                      : "border-transparent text-white/40 hover:border-white/15 hover:text-white/80",
                  )}
                >
                  <Icon className={cn("h-4 w-4", on ? "text-emerald-400" : "text-white/30 group-hover:text-white/60")} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {account && plan && analytics && snapshot ? (
          <>
            <Section id="resumo" active={active} title="Resumo" hint="Onde sua avaliação está agora">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:gap-5">
                <Stat label="Saldo" value={money(account.balance)} sub={`Inicial ${money(account.initialBalance)}`} />
                <Stat
                  label="Resultado hoje"
                  value={`${account.todayPnl >= 0 ? "+" : ""}${money(account.todayPnl)}`}
                  sub={`${((account.todayPnl / account.initialBalance) * 100).toFixed(2)}% do capital`}
                  tone={account.todayPnl > 0 ? "up" : account.todayPnl < 0 ? "down" : undefined}
                />
                <Stat
                  label="Resultado acumulado"
                  value={`${profit >= 0 ? "+" : ""}${money(profit)}`}
                  sub={`Meta ${money(targetMoney)}`}
                  tone={profit > 0 ? "up" : profit < 0 ? "down" : undefined}
                />
                <Stat label="Prazo" value={`${daysLeft} dias`} sub={`Termina ${formatPropDate(account.endDate, lang)}`} />
              </div>
            </Section>

            <Section id="risco" active={active} title="Risco" hint="O que encerra a sua conta — em dinheiro, não em porcentagem">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:gap-5">
                <Meter
                  label="Falta para a meta"
                  headline={money(Math.max(targetMoney - profit, 0))}
                  hint={`Meta da fase ${account.phase}: ${snapshot.targetPct}% · ${money(targetMoney)}`}
                  pct={targetPct}
                  tone={targetPct >= 100 ? "good" : "warn"}
                />
                <Meter
                  label="Antes do drawdown"
                  headline={money(ddLeft)}
                  hint={`Limite total de ${plan.maxDrawdownPct}% · ${money(snapshot.maxAllowedLoss)}`}
                  pct={ddPct}
                  tone={tone(ddPct)}
                />
                <Meter
                  label="Antes da perda diária"
                  headline={money(dayLeft)}
                  hint={`Limite de ${plan.dailyLossLimitPct}% ao dia · ${money(snapshot.dailyLossLimit)}`}
                  pct={dayPct}
                  tone={tone(dayPct)}
                />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className={cn(CARD, "p-5")}>
                  <p className={LABEL}>Dias operados</p>
                  <p className={cn(DISPLAY, "mt-2 text-[22px] tabular-nums")}>
                    {account.daysTraded} <span className="text-white/30">/ {plan.minTradingDays}</span>
                  </p>
                  <p className="mt-1 font-bricolage_grotesque text-xs text-white/35">Mínimo exigido para aprovar</p>
                </div>
                <div className={cn(CARD, "p-5")}>
                  <p className={LABEL}>Maior drawdown atingido</p>
                  <p className={cn(DISPLAY, "mt-2 text-[22px] tabular-nums")}>{account.maxDrawdownHitPct.toFixed(2)}%</p>
                  <p className="mt-1 font-bricolage_grotesque text-xs text-white/35">Limite {plan.maxDrawdownPct}%</p>
                </div>
                <div className={cn(CARD, "p-5")}>
                  <p className={LABEL}>Taxa de acerto</p>
                  <p className={cn(DISPLAY, "mt-2 text-[22px] tabular-nums")}>{analytics.winRatePct.toFixed(0)}%</p>
                  <p className="mt-1 font-bricolage_grotesque text-xs text-white/35">Dias positivos no período</p>
                </div>
              </div>
            </Section>

            <Section id="desempenho" active={active} title="Desempenho" hint="Evolução do capital e qualidade operacional">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px] 2xl:gap-5">
                <InteractiveLineChart
                  title="Equity"
                  subtitle={account.accountId}
                  data={account.performanceSeries.map((point) => ({
                    label: formatPropDate(point.date, lang, { day: "2-digit", month: "2-digit" }),
                    value: point.balance,
                  }))}
                  valueFormatter={(value) => money(value)}
                />
                <EdgeScoreDial score={analytics.everwinEdgeScore} />
              </div>

              <div className="mt-4">
                <DailyResultBars series={account.performanceSeries} money={money} />
              </div>

              {account.performanceSeries.length > 0 ? (
                <div className={cn(CARD, "mt-4 overflow-hidden")}>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-white/[0.07]">
                          {["Data", "Resultado", "Saldo", "Fase", "Limite diário"].map((h) => (
                            <th key={h} className={cn(LABEL, "px-5 py-3 text-left")}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...account.performanceSeries]
                          .sort((a, b) => b.date.localeCompare(a.date))
                          .map((point) => (
                            <tr key={point.date} className="border-b border-white/[0.04] last:border-0">
                              <td className="px-5 py-3.5 font-bricolage_grotesque text-sm text-white/70">
                                {formatPropDate(point.date, lang)}
                              </td>
                              <td
                                className={cn(
                                  "px-5 py-3.5 font-bricolage_grotesque text-sm font-semibold tabular-nums",
                                  point.pnl > 0 ? "text-emerald-400" : point.pnl < 0 ? "text-red-400" : "text-white/60",
                                )}
                              >
                                {point.pnl >= 0 ? "+" : ""}
                                {money(point.pnl)}
                              </td>
                              <td className="px-5 py-3.5 font-bricolage_grotesque text-sm tabular-nums text-white/70">
                                {money(point.balance)}
                              </td>
                              <td className="px-5 py-3.5 font-bricolage_grotesque text-sm text-white/50">{point.phase}</td>
                              <td className="px-5 py-3.5">
                                {point.breachedDailyLimit ? <Pill tone="danger">estourou</Pill> : <Pill>ok</Pill>}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </Section>

            <Section
              id="calendario"
              active={active}
              title="Calendário"
              hint="Cada dia operado, colorido pelo resultado"
            >
              {account.performanceSeries.length > 0 ? (
                <div className="grid gap-4 xl:grid-cols-[minmax(0,520px)_minmax(0,1fr)]">
                  <ResultsCalendar
                    series={account.performanceSeries}
                    money={money}
                    dailyLimit={snapshot.dailyLossLimit}
                  />
                  <DailyResultBars series={account.performanceSeries} money={money} />
                </div>
              ) : (
                <div className={cn(CARD, "p-10 text-center")}>
                  <CalendarDays className="mx-auto h-8 w-8 text-white/15" />
                  <p className={cn(DISPLAY, "mt-4 text-[18px]")}>Nenhum dia operado ainda</p>
                  <p className="mx-auto mt-2 max-w-sm font-bricolage_grotesque text-sm text-white/35">
                    Assim que o primeiro resultado for registrado, o calendário mostra cada dia colorido pelo ganho ou
                    pela perda.
                  </p>
                </div>
              )}
            </Section>

            <Section id="acesso" active={active} title="Acesso à plataforma" hint="Use estes dados para operar">
              <div className={cn(CARD, "overflow-hidden")}>
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] px-6 py-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                      <KeyRound className="h-4 w-4 text-emerald-400" />
                    </span>
                    <div>
                      <p className="font-bricolage_grotesque text-sm font-semibold text-white">Credenciais da conta</p>
                      <p className="font-bricolage_grotesque text-xs text-white/40">
                        {account.brokerName || "Everwin Capital"}
                        {account.platformName ? ` · ${account.platformName}` : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTradeRoomOpen(true)}
                    className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,rgb(16,185,129),rgb(5,150,105))] px-5 font-bricolage_grotesque text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(16,185,129,0.4)] transition hover:opacity-90"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Abrir plataforma
                  </button>
                </div>

                <div className="grid gap-px bg-white/[0.06] sm:grid-cols-2">
                  <CopyRow label="Login" value={account.platformLogin || "-"} />
                  <CopyRow label="Senha" value={account.platformPassword || ""} secret />
                </div>

                <p className="border-t border-white/[0.07] px-6 py-4 font-bricolage_grotesque text-xs leading-relaxed text-white/35">
                  Guarde estes dados em local seguro e não compartilhe com ninguém. A Everwin nunca pede sua senha.
                  Depósitos ou saques nesta conta encerram a avaliação.
                </p>
              </div>
            </Section>

            <Section id="regras" active={active} title="Regras da avaliação" hint="Valem para esta conta até o fim do prazo">
              <div className={cn(CARD, "grid gap-6 p-6 sm:grid-cols-3 lg:grid-cols-6")}>
                <Field label="Meta fase 1" value={`${plan.profitTargetPhase1Pct}%`} />
                <Field label="Meta fase 2" value={`${plan.profitTargetPhase2Pct}%`} />
                <Field label="Drawdown máximo" value={`${plan.maxDrawdownPct}%`} />
                <Field label="Perda diária" value={`${plan.dailyLossLimitPct}%`} />
                <Field label="Dias mínimos" value={`${plan.minTradingDays}`} />
                <Field label="Duração" value={`${plan.durationDays} dias`} />
              </div>
            </Section>
          </>
        ) : (
          <div className={cn(CARD, "p-10 text-center")}>
            <Target className="mx-auto h-8 w-8 text-white/20" />
            <p className={cn(DISPLAY, "mt-4 text-[20px]")}>Sua conta ainda não foi liberada</p>
            <p className="mx-auto mt-2 max-w-md font-bricolage_grotesque text-sm text-white/40">
              Assim que o pagamento for confirmado e a conta for provisionada, ela aparece aqui com as credenciais.
            </p>
          </div>
        )}

        {account && plan ? (
          <Section id="guia" active={active} title="Guia do programa" hint="Tudo que decide a sua aprovação">
            <PropGuide plan={plan} account={account} money={money} />
          </Section>
        ) : null}

        {/* ── application ── */}
        <Section
          id="inscricao"
          active={active}
          title="Minha inscrição"
          hint="O que você enviou e o andamento do processo"
          action={
            submission ? (
              <a
                href={`/prop/submission?id=${submission.submissionCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-bricolage_grotesque text-sm font-semibold text-emerald-400 hover:underline"
              >
                Página pública
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            ) : null
          }
        >
          {submission ? (
            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr] 2xl:gap-5">
              <div className={cn(CARD, "p-6")}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className={LABEL}>Código</p>
                    <p className={cn(DISPLAY, "mt-1 font-mono text-[20px]")}>{submission.submissionCode}</p>
                  </div>
                  <Pill tone={submission.paymentStatus === "approved" ? "live" : "warn"}>
                    {getPaymentStatusMeta(submission.paymentStatus as never, lang).label}
                  </Pill>
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Field label="Nome" value={submission.fullName} />
                  <Field label="E-mail" value={submission.email} />
                  <Field label={submission.documentType || "Documento"} value={submission.documentNumber} />
                  <Field label="Telefone" value={submission.phone} />
                  <Field label="Localização" value={[submission.city, submission.country].filter(Boolean).join(", ")} />
                  <Field label="Profissão" value={submission.occupation} />
                  <Field label="Experiência" value={submission.experience} />
                  <Field label="Sessão principal" value={submission.session} />
                  <Field label="Risco por dia" value={submission.riskPerDay} />
                  <Field
                    label="Taxa paga"
                    value={submission.amount != null ? formatPropMoney(submission.amount, submission.currency ?? currency, lang) : null}
                  />
                </div>
              </div>

              <div className={cn(CARD, "p-6")}>
                <p className={LABEL}>Linha do tempo</p>
                <div className="mt-4 space-y-4">
                  {[
                    { label: "Inscrição enviada", at: submission.submittedAt, icon: FileText },
                    { label: "Pagamento confirmado", at: submission.paidAt, icon: ShieldCheck },
                    { label: "Análise concluída", at: submission.reviewedAt, icon: CalendarClock },
                    { label: "Conta liberada", at: account ? account.createdAt : null, icon: Target },
                  ].map((step) => {
                    const Icon = step.icon;
                    const done = Boolean(step.at);
                    return (
                      <div key={step.label} className="flex items-start gap-3">
                        <span
                          className={cn(
                            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border",
                            done
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                              : "border-white/[0.07] bg-white/[0.03] text-white/20",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className={cn("font-bricolage_grotesque text-sm font-semibold", done ? "text-white" : "text-white/30")}>
                            {step.label}
                          </p>
                          <p className="font-bricolage_grotesque text-xs text-white/35">
                            {step.at ? formatPropDateTime(step.at, lang) : "pendente"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {submission.motivation && submission.motivation !== "-" ? (
                  <div className="mt-6 border-t border-white/[0.07] pt-5">
                    <p className={LABEL}>Sua motivação</p>
                    <p className="mt-2 font-bricolage_grotesque text-sm leading-6 text-white/60">{submission.motivation}</p>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className={cn(CARD, "p-8 text-center")}>
              <p className="font-bricolage_grotesque text-sm text-white/40">
                Nenhuma inscrição encontrada para a sua conta.
              </p>
            </div>
          )}
        </Section>
      </div>

      <TradeRoomDialog
        open={tradeRoomOpen}
        onClose={() => setTradeRoomOpen(false)}
        login={account?.platformLogin ?? ""}
        password={account?.platformPassword ?? ""}
        url={account?.tradeRoomUrl || "https://app.everwin.capital/pt/auth/login"}
      />

      {/* ── footer: the landing page's own gradient and rule ── */}
      <footer className="relative mt-auto border-t border-white/10 bg-[linear-gradient(178deg,rgb(24,27,36)_-88%,rgb(17,19,26)_61%)] px-4 py-10 sm:px-6 lg:px-10 2xl:px-16">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md">
            <img
              src="https://i.postimg.cc/RFLkLvK0/everwin-logo.png"
              alt="Everwin"
              className="h-5 w-auto"
              draggable={false}
            />
            <p className="mt-4 font-bricolage_grotesque text-xs leading-relaxed text-white/35">
              Operar nos mercados envolve risco elevado e pode gerar perdas. A avaliação não garante aprovação nem conta
              financiada. Depósitos ou saques na conta de avaliação encerram o processo.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-6 sm:grid-cols-3">
            <div>
              <p className={LABEL}>Suporte</p>
              <a
                href="mailto:support@everwin.capital"
                className="mt-2 block font-bricolage_grotesque text-sm text-white/55 transition hover:text-emerald-400"
              >
                support@everwin.capital
              </a>
            </div>
            <div>
              <p className={LABEL}>Políticas</p>
              <div className="mt-2 space-y-1.5">
                <a href="/legal/prop-trading-terms" className="block font-bricolage_grotesque text-sm text-white/55 transition hover:text-emerald-400">
                  Termos de Prop Trading
                </a>
                <a href="/legal/prop-payout-policy" className="block font-bricolage_grotesque text-sm text-white/55 transition hover:text-emerald-400">
                  Política de Payout
                </a>
              </div>
            </div>
            <div>
              <p className={LABEL}>Conta</p>
              <div className="mt-2 space-y-1.5">
                <a href="/legal/prop-trading-restrictions" className="block font-bricolage_grotesque text-sm text-white/55 transition hover:text-emerald-400">
                  Restrições de Trading
                </a>
                <a href="/legal/risk-disclosure" className="block font-bricolage_grotesque text-sm text-white/55 transition hover:text-emerald-400">
                  Divulgação de Riscos
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 w-full max-w-[1600px] border-t border-white/[0.06] pt-6">
          <p className="font-bricolage_grotesque text-xs text-white/25">
            © {new Date().getFullYear()} Everwin Capital · Portal do Avaliado
          </p>
        </div>
      </footer>
    </div>
  );
}
