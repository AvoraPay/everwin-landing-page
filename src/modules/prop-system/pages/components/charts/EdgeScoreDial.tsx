import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export function EdgeScoreDial({ score, label }: { score: number; label?: string }) {
  const { t } = useTranslation();
  const clamped = Math.max(0, Math.min(100, score));
  const angle = -120 + (clamped / 100) * 240;

  const tone = clamped >= 75 ? "#10b981" : clamped >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div
      className="rounded-[24px] border p-5"
      style={{
        background: "linear-gradient(-83deg, rgb(23,26,35) 8%, rgb(37,42,54) 171%)",
        borderColor: "rgba(255,255,255,0.07)",
      }}
    >
      <p
        className="font-bricolage_grotesque text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        {label ?? t("prop_portal.charts.edge_score")}
      </p>
      <div className="mt-3 flex items-center justify-center">
        <svg viewBox="0 0 220 130" className="h-[130px] w-full max-w-[240px]">
          <path
            d="M20 110 A90 90 0 0 1 200 110"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            d="M20 110 A90 90 0 0 1 200 110"
            fill="none"
            stroke={tone}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={`${(clamped / 100) * 282} 400`}
            style={{ filter: `drop-shadow(0 0 8px ${tone}80)` }}
          />
          <motion.g
            animate={{ rotate: angle }}
            transition={{ type: "spring", stiffness: 130, damping: 16 }}
            style={{ transformOrigin: "110px 110px" }}
          >
            <line x1="110" y1="110" x2="110" y2="36" stroke="rgba(255,255,255,0.9)" strokeWidth="4" strokeLinecap="round" />
            <circle cx="110" cy="110" r="6" fill="rgba(255,255,255,0.9)" />
          </motion.g>
        </svg>
      </div>
      <div className="-mt-2 text-center">
        <p className="font-bricolage_grotesque text-3xl font-bold" style={{ color: tone }}>
          {clamped.toFixed(0)}
        </p>
        <p className="font-bricolage_grotesque text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
          {t("prop_portal.charts.edge_quality")}
        </p>
      </div>
    </div>
  );
}
