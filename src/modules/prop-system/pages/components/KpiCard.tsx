import type { ReactNode } from "react";
import { cn } from "../../../../lib/utils";

const ACCENT_MAP = {
  emerald: {
    glow: "bg-emerald-500/12",
    border: "border-emerald-200",
    shadow: "shadow-[0_24px_60px_-48px_rgba(15,23,42,0.28)]",
    text: "text-emerald-700",
  },
  sky: {
    glow: "bg-sky-500/12",
    border: "border-sky-200",
    shadow: "shadow-[0_24px_60px_-48px_rgba(15,23,42,0.28)]",
    text: "text-sky-700",
  },
  red: {
    glow: "bg-red-500/12",
    border: "border-red-200",
    shadow: "shadow-[0_24px_60px_-48px_rgba(15,23,42,0.28)]",
    text: "text-red-700",
  },
  amber: {
    glow: "bg-amber-500/12",
    border: "border-amber-200",
    shadow: "shadow-[0_24px_60px_-48px_rgba(15,23,42,0.28)]",
    text: "text-amber-700",
  },
} as const;

export function KpiCard({
  title,
  value,
  helper,
  accent = "emerald",
}: {
  title: string;
  value: ReactNode;
  helper?: string;
  accent?: keyof typeof ACCENT_MAP;
}) {
  const a = ACCENT_MAP[accent];

  return (
    <div className={cn("relative overflow-hidden rounded-[24px] border bg-white p-5", a.border, a.shadow)}>
      <div className={cn("pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl", a.glow)} />
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <p className={cn("mt-3 text-[28px] font-semibold tracking-[-0.03em]", a.text)}>{value}</p>
      {helper && <p className="mt-1.5 text-sm leading-6 text-slate-600">{helper}</p>}
    </div>
  );
}
