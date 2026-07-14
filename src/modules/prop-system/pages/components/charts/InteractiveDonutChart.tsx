import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../../../../lib/utils";

type DonutDatum = {
  label: string;
  value: number;
  color: string;
};

export function InteractiveDonutChart({
  title,
  data,
  theme = "light",
}: {
  title: string;
  data: DonutDatum[];
  theme?: "light" | "dark";
}) {
  const { t } = useTranslation();
  const light = theme === "light";
  const chart = useMemo(() => {
    const total = data.reduce((acc, item) => acc + item.value, 0) || 1;
    let start = -90;

    const arcs = data.map((item) => {
      const sweep = (item.value / total) * 360;
      const end = start + sweep;
      const arc = describeArc(54, 54, 36, start, end);
      const entry = { ...item, arc, percentage: (item.value / total) * 100 };
      start = end;
      return entry;
    });

    return { arcs, total };
  }, [data]);

  return (
    <div className={cn("rounded-2xl border p-5", light ? "border-slate-200 bg-white shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)]" : "border-white/10 bg-slate-950 text-white shadow-[0_28px_64px_-48px_rgba(2,6,23,0.72)]")}>
      <p className={cn("font-bricolage_grotesque text-sm uppercase tracking-[0.13em]", light ? "text-slate-500" : "text-slate-400")}>{title}</p>

      <div className="mt-4 grid grid-cols-[120px_1fr] items-center gap-4">
        <div className="relative h-[120px] w-[120px]">
          <svg viewBox="0 0 108 108" className="h-full w-full">
            <circle cx="54" cy="54" r="36" fill="none" stroke={light ? "rgba(148,163,184,0.18)" : "rgba(255,255,255,0.12)"} strokeWidth="14" />
            {chart.arcs.map((arc) => (
              <path key={arc.label} d={arc.arc} fill="none" stroke={arc.color} strokeWidth="14" strokeLinecap="round" />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className={cn("font-bricolage_grotesque text-2xl font-semibold", light ? "text-slate-900" : "text-white")}>{chart.total}</p>
            <p className={cn("font-bricolage_grotesque text-[11px] uppercase tracking-wide", light ? "text-slate-500" : "text-slate-400")}>{t("prop_portal.charts.accounts")}</p>
          </div>
        </div>

        <div className="space-y-2">
          {chart.arcs.map((item) => (
            <div key={item.label} className={cn("flex items-center justify-between rounded-md border px-3 py-2", light ? "border-slate-100" : "border-white/10 bg-white/[0.02]")}>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className={cn("font-bricolage_grotesque text-xs", light ? "text-slate-700" : "text-slate-200")}>{item.label}</span>
              </div>
              <span className={cn("font-bricolage_grotesque text-xs font-semibold", light ? "text-slate-900" : "text-white")}>{item.value} ({item.percentage.toFixed(0)}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [`M`, start.x, start.y, `A`, radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(" ");
}
