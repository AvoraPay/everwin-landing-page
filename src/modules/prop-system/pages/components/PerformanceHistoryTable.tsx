import { useTranslation } from "react-i18next";
import { currencyBRL, formatPropDate } from "../../rules";
import type { DailyPerformancePoint } from "../../types";

interface PerformanceHistoryTableProps {
  series: DailyPerformancePoint[];
  dailyLossLimit: number;
  language?: string;
}

export function PerformanceHistoryTable({ series, dailyLossLimit, language }: PerformanceHistoryTableProps) {
  const { t, i18n } = useTranslation();
  const lang = language ?? i18n.language;

  const sorted = [...series].sort((a, b) => b.date.localeCompare(a.date));

  const emptyState = (
    <div
      className="overflow-hidden rounded-[20px] border"
      style={{
        background: "linear-gradient(-83deg, rgb(23,26,35) 8%, rgb(37,42,54) 171%)",
        borderColor: "rgba(255,255,255,0.07)",
      }}
    >
      <div className="border-b px-5 py-4" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <p className="font-bricolage_grotesque text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
          {t("prop_portal.client_accounts.history_title")}
        </p>
      </div>
      <div className="px-5 py-10 text-center">
        <p className="font-bricolage_grotesque text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
          {t("prop_portal.client_accounts.history_no_data")}
        </p>
      </div>
    </div>
  );

  if (sorted.length === 0) return emptyState;

  return (
    <div
      className="overflow-hidden rounded-[20px] border"
      style={{
        background: "linear-gradient(-83deg, rgb(23,26,35) 8%, rgb(37,42,54) 171%)",
        borderColor: "rgba(255,255,255,0.07)",
      }}
    >
      <div className="border-b px-5 py-4" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <p className="font-bricolage_grotesque text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
          {t("prop_portal.client_accounts.history_title")}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
              {[
                t("prop_portal.client_accounts.history_date"),
                t("prop_portal.client_accounts.history_pnl"),
                t("prop_portal.client_accounts.history_balance"),
                t("prop_portal.client_accounts.history_note"),
              ].map((h, i) => (
                <th
                  key={h}
                  className={`px-5 py-3 font-bricolage_grotesque text-[10px] font-semibold uppercase tracking-[0.14em] ${i > 0 && i < 3 ? "text-right" : "text-left"}`}
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((point) => {
              const isPositive = point.pnl > 0;
              const isNegative = point.pnl < 0;
              const dllHit = point.breachedDailyLimit;
              const dllPctUsed = dailyLossLimit > 0 ? (Math.abs(point.pnl) / dailyLossLimit) * 100 : 0;

              let noteLabel = "";
              let noteColor = "rgba(255,255,255,0.3)";
              if (dllHit) {
                noteLabel = t("prop_portal.client_accounts.history_dll_breach");
                noteColor = "#f87171";
              } else if (point.pnl === 0) {
                noteLabel = t("prop_portal.client_accounts.history_no_trade");
                noteColor = "rgba(255,255,255,0.3)";
              } else {
                noteLabel = t("prop_portal.client_accounts.history_day_traded");
                noteColor = isPositive ? "#34d399" : "#fbbf24";
              }

              return (
                <tr
                  key={point.date}
                  className="border-b transition"
                  style={{ borderColor: "rgba(255,255,255,0.04)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.02)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
                >
                  <td className="px-5 py-3">
                    <p className="font-bricolage_grotesque text-sm font-semibold text-white">
                      {formatPropDate(point.date, lang, { day: "2-digit", month: "2-digit", year: "2-digit" })}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <p
                      className="font-bricolage_grotesque text-sm font-semibold"
                      style={{ color: isPositive ? "#34d399" : isNegative ? "#f87171" : "rgba(255,255,255,0.35)" }}
                    >
                      {point.pnl > 0 ? "+" : ""}
                      {currencyBRL(point.pnl, lang)}
                    </p>
                    {dllHit && dllPctUsed > 0 && (
                      <p className="mt-0.5 font-bricolage_grotesque text-[10px]" style={{ color: "#f87171" }}>
                        {dllPctUsed.toFixed(0)}% DLL
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <p className="font-bricolage_grotesque text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                      {currencyBRL(point.balance, lang)}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-bricolage_grotesque text-xs" style={{ color: noteColor }}>
                      {noteLabel}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
