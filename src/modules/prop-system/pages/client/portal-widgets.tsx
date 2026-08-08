import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "../../../../lib/utils";
import type { DailyPerformancePoint, PlanTemplate, PropAccount } from "../../types";
import { GUIDE_GROUPS, GUIDE_TOPICS } from "./guide-content";

const CARD =
  "rounded-2xl border border-white/[0.07] bg-[linear-gradient(-83deg,rgb(23,26,35)_8%,rgb(37,42,54)_171%)] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.6)]";
const LABEL = "font-bricolage_grotesque text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35";
const DISPLAY = "font-bricolage_grotesque font-bold tracking-[-0.03em] text-white";

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MONTHS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

type Money = (value: number) => string;

/* ────────────────────────── calendar ────────────────────────── */

/**
 * A month grid coloured by the day's result. Consistency is a rule in every
 * prop programme, and it is far easier to see as a shape than as a table:
 * a wall of pale green reads as discipline, one dark red square reads as risk.
 */
export function ResultsCalendar({
  series,
  money,
  dailyLimit,
}: {
  series: DailyPerformancePoint[];
  money: Money;
  dailyLimit: number;
}) {
  const byDate = useMemo(() => new Map(series.map((p) => [p.date, p])), [series]);

  const [cursor, setCursor] = useState(() => {
    const last = series.length ? series[series.length - 1].date : new Date().toISOString().slice(0, 10);
    const [y, m] = last.split("-").map(Number);
    return { year: y, month: m - 1 };
  });

  const { cells, monthPoints } = useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1);
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
    const lead = first.getDay();

    const out: Array<{ day: number; iso: string; point?: DailyPerformancePoint } | null> = [];
    for (let i = 0; i < lead; i += 1) out.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      const iso = `${cursor.year}-${String(cursor.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      out.push({ day, iso, point: byDate.get(iso) });
    }

    const points = out.filter((c) => c?.point).map((c) => c!.point!);
    return { cells: out, monthPoints: points };
  }, [byDate, cursor]);

  // Scale intensity against the best and worst day, so colour means something.
  const peak = useMemo(
    () => Math.max(1, ...monthPoints.map((p) => Math.abs(p.pnl))),
    [monthPoints],
  );

  const total = monthPoints.reduce((sum, p) => sum + p.pnl, 0);
  const wins = monthPoints.filter((p) => p.pnl > 0).length;
  const losses = monthPoints.filter((p) => p.pnl < 0).length;

  const shift = (delta: number) => {
    setCursor((c) => {
      const next = new Date(c.year, c.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  };

  return (
    <div className={cn(CARD, "p-5 sm:p-6")}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className={LABEL}>Calendário</p>
          <p className={cn(DISPLAY, "mt-1 text-[18px] capitalize")}>
            {MONTHS[cursor.month]} {cursor.year}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => shift(-1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] text-white/45 transition hover:border-white/20 hover:text-white"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] text-white/45 transition hover:border-white/20 hover:text-white"
            aria-label="Próximo mês"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="pb-1 text-center font-bricolage_grotesque text-[10px] font-semibold uppercase text-white/25">
            {d}
          </div>
        ))}

        {cells.map((cell, index) => {
          if (!cell) return <div key={`pad-${index}`} />;
          const point = cell.point;
          const intensity = point ? Math.min(Math.abs(point.pnl) / peak, 1) : 0;
          const positive = (point?.pnl ?? 0) > 0;
          const breached = point?.breachedDailyLimit;

          return (
            <div
              key={cell.iso}
              title={point ? `${cell.day}: ${money(point.pnl)}` : `${cell.day}: sem operação`}
              className={cn(
                "group relative aspect-square rounded-lg border transition-all duration-200",
                point
                  ? breached
                    ? "border-red-500/60 bg-red-500/25"
                    : positive
                      ? "border-emerald-500/25"
                      : "border-red-500/25"
                  : "border-white/[0.05] bg-white/[0.02]",
                point && "cursor-default hover:scale-[1.08] hover:border-white/30",
              )}
              style={
                point && !breached
                  ? {
                      backgroundColor: positive
                        ? `rgba(16,185,129,${0.12 + intensity * 0.45})`
                        : `rgba(239,68,68,${0.12 + intensity * 0.45})`,
                    }
                  : undefined
              }
            >
              <span
                className={cn(
                  "absolute left-1.5 top-1 font-bricolage_grotesque text-[10px] font-semibold",
                  point ? "text-white/70" : "text-white/20",
                )}
              >
                {cell.day}
              </span>
              {point ? (
                <span
                  className={cn(
                    "absolute inset-x-1 bottom-1 truncate text-center font-bricolage_grotesque text-[9px] font-bold tabular-nums",
                    positive ? "text-emerald-300" : "text-red-300",
                  )}
                >
                  {point.pnl > 0 ? "+" : ""}
                  {Math.round(point.pnl)}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/[0.07] pt-4">
        <div>
          <p className={LABEL}>No mês</p>
          <p
            className={cn(
              "mt-1 font-bricolage_grotesque text-[17px] font-bold tabular-nums",
              total > 0 ? "text-emerald-400" : total < 0 ? "text-red-400" : "text-white",
            )}
          >
            {total > 0 ? "+" : ""}
            {money(total)}
          </p>
        </div>
        <div>
          <p className={LABEL}>Dias positivos</p>
          <p className={cn(DISPLAY, "mt-1 text-[17px] tabular-nums")}>{wins}</p>
        </div>
        <div>
          <p className={LABEL}>Dias negativos</p>
          <p className={cn(DISPLAY, "mt-1 text-[17px] tabular-nums")}>{losses}</p>
        </div>
      </div>

      <p className="mt-3 font-bricolage_grotesque text-[11px] text-white/30">
        Um quadrado com borda vermelha forte é um dia que estourou o limite diário de {money(dailyLimit)}.
      </p>
    </div>
  );
}

/* ────────────────────────── daily bars ────────────────────────── */

/** The equity line shows where you got to; the bars show how you got there. */
export function DailyResultBars({ series, money }: { series: DailyPerformancePoint[]; money: Money }) {
  const [hover, setHover] = useState<number | null>(null);
  const peak = Math.max(1, ...series.map((p) => Math.abs(p.pnl)));
  const shown = series.slice(-30);

  if (shown.length === 0) {
    return (
      <div className={cn(CARD, "flex h-full min-h-[220px] items-center justify-center p-6")}>
        <p className="font-bricolage_grotesque text-sm text-white/30">Sem operações registradas ainda.</p>
      </div>
    );
  }

  return (
    <div className={cn(CARD, "p-5 sm:p-6")}>
      <div className="mb-1 flex items-baseline justify-between gap-4">
        <p className={LABEL}>Resultado por dia</p>
        <p className="font-bricolage_grotesque text-xs text-white/30">últimos {shown.length} dias</p>
      </div>

      <div className="relative mt-5 flex h-[180px] items-center gap-[3px]">
        {/* zero line */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/[0.08]" />

        {shown.map((point, index) => {
          const ratio = Math.abs(point.pnl) / peak;
          const positive = point.pnl >= 0;
          const on = hover === index;
          return (
            <div
              key={point.date}
              className="relative flex h-full flex-1 flex-col justify-center"
              onMouseEnter={() => setHover(index)}
              onMouseLeave={() => setHover(null)}
            >
              <div className="flex h-1/2 items-end">
                {positive ? (
                  <div
                    className={cn(
                      "w-full rounded-t-sm transition-all duration-200",
                      on ? "bg-emerald-400" : "bg-emerald-500/60",
                      point.breachedDailyLimit && "bg-red-500",
                    )}
                    style={{ height: `${Math.max(ratio * 100, 3)}%` }}
                  />
                ) : null}
              </div>
              <div className="flex h-1/2 items-start">
                {!positive ? (
                  <div
                    className={cn(
                      "w-full rounded-b-sm transition-all duration-200",
                      on ? "bg-red-400" : "bg-red-500/60",
                      point.breachedDailyLimit && "bg-red-500",
                    )}
                    style={{ height: `${Math.max(ratio * 100, 3)}%` }}
                  />
                ) : null}
              </div>

              {on ? (
                <div className="pointer-events-none absolute -top-2 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[rgb(23,26,35)] px-2.5 py-1.5 shadow-xl">
                  <p className="font-bricolage_grotesque text-[10px] text-white/45">
                    {point.date.slice(8, 10)}/{point.date.slice(5, 7)}
                  </p>
                  <p
                    className={cn(
                      "font-bricolage_grotesque text-xs font-bold tabular-nums",
                      positive ? "text-emerald-400" : "text-red-400",
                    )}
                  >
                    {point.pnl > 0 ? "+" : ""}
                    {money(point.pnl)}
                  </p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}


/* ────────────────────────── guide ────────────────────────── */

/**
 * The rulebook, split three ways: groups on the left, topics inside them, the
 * answer on the right. Every number in the text comes from the trader's own
 * account, so the guide can never contradict the dashboard beside it.
 */
export function PropGuide({
  plan,
  account,
  money,
}: {
  plan: PlanTemplate;
  account: PropAccount;
  money: Money;
}) {
  const [openId, setOpenId] = useState(GUIDE_TOPICS[0].id);
  const [term, setTerm] = useState("");

  const matches = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return GUIDE_TOPICS;
    return GUIDE_TOPICS.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.group.toLowerCase().includes(q),
    );
  }, [term]);

  const grouped = useMemo(
    () =>
      GUIDE_GROUPS.map((group) => ({
        group,
        topics: matches.filter((t) => t.group === group),
      })).filter((g) => g.topics.length > 0),
    [matches],
  );

  const topic = GUIDE_TOPICS.find((t) => t.id === openId) ?? GUIDE_TOPICS[0];
  const blocks = topic.body({ plan, account, money });

  const flat = matches.length ? matches : GUIDE_TOPICS;
  const position = flat.findIndex((t) => t.id === topic.id);
  const previous = position > 0 ? flat[position - 1] : null;
  const next = position >= 0 && position < flat.length - 1 ? flat[position + 1] : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[288px_minmax(0,1fr)]">
      <nav className={cn(CARD, "h-fit p-3 lg:sticky lg:top-32")}>
        <div className="relative mb-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Buscar no guia"
            className="h-9 w-full rounded-xl border border-white/[0.07] bg-white/[0.03] pl-9 pr-3 font-bricolage_grotesque text-[13px] text-white placeholder:text-white/25 outline-none transition focus:border-emerald-500/40 focus:bg-white/[0.05]"
          />
        </div>

        <div className="max-h-[62vh] space-y-3 overflow-y-auto pr-1 lg:max-h-[calc(100vh-260px)]">
          {grouped.map(({ group, topics }) => (
            <div key={group}>
              <p className={cn(LABEL, "px-3 py-1.5")}>{group}</p>
              {topics.map((t) => {
                const on = t.id === topic.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setOpenId(t.id)}
                    className={cn(
                      "group relative w-full rounded-xl px-3 py-2.5 text-left transition-all duration-200",
                      on ? "bg-emerald-500/10" : "hover:bg-white/[0.04]",
                    )}
                  >
                    {on ? (
                      <span className="absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 rounded-full bg-emerald-400" />
                    ) : null}
                    <p
                      className={cn(
                        "font-bricolage_grotesque text-[13px] font-semibold leading-snug transition-colors",
                        on ? "text-emerald-400" : "text-white/70 group-hover:text-white/90",
                      )}
                    >
                      {t.title}
                    </p>
                    <p className="mt-0.5 font-bricolage_grotesque text-[11px] leading-snug text-white/30">
                      {t.summary}
                    </p>
                  </button>
                );
              })}
            </div>
          ))}

          {grouped.length === 0 ? (
            <p className="px-3 py-6 text-center font-bricolage_grotesque text-[13px] text-white/30">
              Nada encontrado para “{term}”.
            </p>
          ) : null}
        </div>
      </nav>

      <article className={cn(CARD, "flex flex-col p-6 sm:p-8")} key={topic.id}>
        <div className="animate-in fade-in slide-in-from-right-2 duration-300">
          <p className={LABEL}>{topic.group}</p>
          <h3 className={cn(DISPLAY, "mt-2 text-[24px] leading-tight sm:text-[28px]")}>{topic.title}</h3>
          <p className="mt-1 font-bricolage_grotesque text-sm text-white/40">{topic.summary}</p>

          <div className="mt-7 space-y-6">
            {blocks.map((block, index) => (
              <div key={index} className="border-l border-white/[0.06] pl-4">
                {block.heading ? (
                  <p className="mb-1.5 font-bricolage_grotesque text-sm font-semibold text-white">{block.heading}</p>
                ) : null}
                <p className="font-bricolage_grotesque text-[15px] leading-7 text-white/55">{block.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-5">
          <button
            type="button"
            disabled={!previous}
            onClick={() => previous && setOpenId(previous.id)}
            className="inline-flex max-w-[45%] items-center gap-2 rounded-xl px-3 py-2 font-bricolage_grotesque text-[13px] text-white/50 transition hover:bg-white/[0.04] hover:text-white disabled:pointer-events-none disabled:opacity-25"
          >
            <ChevronLeft className="h-4 w-4 shrink-0" />
            <span className="truncate">{previous?.title ?? "Início"}</span>
          </button>

          <span className="shrink-0 font-bricolage_grotesque text-[11px] tabular-nums text-white/25">
            {position + 1} / {flat.length}
          </span>

          <button
            type="button"
            disabled={!next}
            onClick={() => next && setOpenId(next.id)}
            className="inline-flex max-w-[45%] items-center gap-2 rounded-xl px-3 py-2 font-bricolage_grotesque text-[13px] text-white/50 transition hover:bg-white/[0.04] hover:text-white disabled:pointer-events-none disabled:opacity-25"
          >
            <span className="truncate">{next?.title ?? "Fim"}</span>
            <ChevronRight className="h-4 w-4 shrink-0" />
          </button>
        </div>
      </article>
    </div>
  );
}
