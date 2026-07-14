import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { getPropUiLocale } from "../../../rules";

type DataPoint = {
  label: string;
  value: number;
};

export function InteractiveLineChart({
  title,
  subtitle,
  data,
  valueFormatter,
  theme = "dark",
}: {
  title: string;
  subtitle?: string;
  data: DataPoint[];
  valueFormatter?: (value: number) => string;
  theme?: "light" | "dark";
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const { i18n } = useTranslation();
  const locale = getPropUiLocale(i18n.language);
  const light = theme === "light";

  const chart = useMemo(() => {
    const width = 760;
    const height = 240;
    const padX = 22;
    const padY = 22;

    if (data.length === 0) {
      return { width, height, points: [] as Array<{ x: number; y: number }>, path: "", areaPath: "", min: 0, max: 0, stepX: 0 };
    }

    const min = Math.min(...data.map((d) => d.value));
    const max = Math.max(...data.map((d) => d.value));
    const range = max - min || 1;
    const stepX = data.length > 1 ? (width - padX * 2) / (data.length - 1) : 0;

    const points = data.map((point, i) => {
      const x = padX + stepX * i;
      const y = height - padY - ((point.value - min) / range) * (height - padY * 2);
      return { x, y };
    });

    const path = points
      .map((point, i) => `${i === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(" ");

    const areaPath = [
      path,
      `L ${(points[points.length - 1]?.x ?? padX).toFixed(2)} ${(height - padY).toFixed(2)}`,
      `L ${(points[0]?.x ?? padX).toFixed(2)} ${(height - padY).toFixed(2)}`,
      "Z",
    ].join(" ");

    return { width, height, points, path, areaPath, min, max, stepX };
  }, [data]);

  const activeIndex = hoverIndex ?? data.length - 1;
  const activePoint = chart.points[activeIndex];
  const activeData = data[activeIndex];

  return (
    <div
      className="rounded-[24px] border p-5"
      style={
        light
          ? {
              background: "rgba(255,255,255,0.96)",
              borderColor: "rgba(226,232,240,0.95)",
              boxShadow: "0 24px 60px -48px rgba(15,23,42,0.35)",
            }
          : {
              background: "linear-gradient(-83deg, rgb(23,26,35) 8%, rgb(37,42,54) 171%)",
              borderColor: "rgba(255,255,255,0.07)",
            }
      }
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className={light ? "font-bricolage_grotesque text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500" : "font-bricolage_grotesque text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400"}>{title}</p>
          {subtitle ? (
            <p className="mt-1 font-bricolage_grotesque text-xs" style={{ color: light ? "rgba(71,85,105,0.8)" : "rgba(255,255,255,0.45)" }}>
              {subtitle}
            </p>
          ) : null}
        </div>
        {activeData ? (
          <div className="text-right">
            <p className="font-bricolage_grotesque text-xs" style={{ color: light ? "rgba(100,116,139,0.9)" : "rgba(255,255,255,0.4)" }}>
              {activeData.label}
            </p>
            <p className={light ? "font-bricolage_grotesque text-xl font-semibold text-slate-950" : "font-bricolage_grotesque text-xl font-semibold text-white"}>
              {valueFormatter ? valueFormatter(activeData.value) : activeData.value.toLocaleString(locale)}
            </p>
          </div>
        ) : null}
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="h-[260px] w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(16,185,129,0.34)" />
              <stop offset="100%" stopColor="rgba(16,185,129,0.02)" />
            </linearGradient>
          </defs>

          {[0.2, 0.4, 0.6, 0.8].map((v) => (
            <line
              key={v}
              x1={16}
              x2={chart.width - 16}
              y1={chart.height * v}
              y2={chart.height * v}
              stroke={light ? "rgba(148,163,184,0.26)" : "rgba(255,255,255,0.06)"}
              strokeDasharray="4 5"
            />
          ))}

          {chart.areaPath ? <path d={chart.areaPath} fill="url(#lineGradient)" /> : null}
          {chart.path ? <path d={chart.path} fill="none" stroke={light ? "rgba(15,118,110,0.94)" : "rgba(16,185,129,0.92)"} strokeWidth={3} strokeLinecap="round" /> : null}

          {chart.points.map((point, i) => (
            <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r={hoverIndex === i ? 5 : 3} fill={light ? "rgba(15,118,110,0.94)" : "rgba(16,185,129,0.95)"} />
          ))}

          {activePoint ? (
            <>
              <line x1={activePoint.x} x2={activePoint.x} y1={18} y2={chart.height - 20} stroke={light ? "rgba(71,85,105,0.35)" : "rgba(255,255,255,0.2)"} strokeDasharray="3 4" />
              <circle cx={activePoint.x} cy={activePoint.y} r={6} fill={light ? "rgba(15,118,110,1)" : "rgba(16,185,129,1)"} stroke={light ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.95)"} strokeWidth={2} />
            </>
          ) : null}

          <rect
            x={0}
            y={0}
            width={chart.width}
            height={chart.height}
            fill="transparent"
            onMouseLeave={() => setHoverIndex(null)}
            onMouseMove={(event) => {
              if (data.length === 0) return;
              const target = event.currentTarget;
              const rect = target.getBoundingClientRect();
              const relativeX = event.clientX - rect.left;
              const normalizedX = (relativeX / rect.width) * chart.width;
              const rawIndex = chart.stepX > 0 ? Math.round((normalizedX - 22) / chart.stepX) : 0;
              const clamped = Math.max(0, Math.min(data.length - 1, rawIndex));
              setHoverIndex(clamped);
            }}
          />
        </svg>

        {activeData ? (
          <motion.div
            key={activeData.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="pointer-events-none absolute right-3 top-3 rounded-[14px] border px-3 py-2"
            style={{
              background: light ? "rgba(248,250,252,0.98)" : "rgb(37,42,54)",
              borderColor: light ? "rgba(226,232,240,1)" : "rgba(255,255,255,0.12)",
            }}
          >
            <p className="font-bricolage_grotesque text-[11px]" style={{ color: light ? "rgba(100,116,139,0.95)" : "rgba(255,255,255,0.45)" }}>{activeData.label}</p>
            <p className={light ? "font-bricolage_grotesque text-sm font-semibold text-slate-950" : "font-bricolage_grotesque text-sm font-semibold text-white"}>
              {valueFormatter ? valueFormatter(activeData.value) : activeData.value.toLocaleString(locale)}
            </p>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
