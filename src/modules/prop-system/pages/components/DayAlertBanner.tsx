import { AlertTriangle, CheckCircle2, XCircle, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { currencyBRL } from "../../rules";
import type { AccountAnalytics, PlanTemplate, PropAccount } from "../../types";

type AlertType = "danger" | "warning" | "success" | "info";

interface AlertItem {
  type: AlertType;
  accountId: string;
  message: string;
}

interface DayAlertBannerProps {
  views: Array<{ account: PropAccount; plan: PlanTemplate; analytics: AccountAnalytics }>;
}

function buildAlerts(
  views: Array<{ account: PropAccount; plan: PlanTemplate; analytics: AccountAnalytics }>,
  language: string,
): AlertItem[] {
  const alerts: AlertItem[] = [];

  for (const { account, plan, analytics } of views) {
    const { snapshot } = analytics;

    if (account.status === "failed_drawdown" || account.status === "failed_timeout") continue;

    if (snapshot.isDailyLimitBreached) {
      alerts.push({
        type: "danger",
        accountId: account.accountId,
        message: "DLL Hit • Review now",
      });
    }

    const ddPct =
      snapshot.maxAllowedLoss > 0
        ? ((snapshot.maxAllowedLoss - Math.max(snapshot.remainingDrawdownBeforeBreach, 0)) /
            snapshot.maxAllowedLoss) *
          100
        : 0;
    if (ddPct >= 80 && !snapshot.isHardBreach) {
      alerts.push({
        type: "danger",
        accountId: account.accountId,
        message: `Drawdown ${ddPct.toFixed(0)}% • ${currencyBRL(Math.max(snapshot.remainingDrawdownBeforeBreach, 0), language)}`,
      });
    }

    const dllPct =
      snapshot.dailyLossLimit > 0
        ? ((snapshot.dailyLossLimit - Math.max(snapshot.remainingDailyLossBeforePause, 0)) /
            snapshot.dailyLossLimit) *
          100
        : 0;
    if (dllPct >= 60 && !snapshot.isDailyLimitBreached) {
      alerts.push({
        type: "warning",
        accountId: account.accountId,
        message: `DLL ${dllPct.toFixed(0)}% • ${currencyBRL(Math.max(snapshot.remainingDailyLossBeforePause, 0), language)}`,
      });
    }

    const daysLeft = Math.ceil(
      (new Date(account.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    if (daysLeft <= 5 && daysLeft > 0 && (account.status === "active" || account.status === "paused")) {
      alerts.push({
        type: "warning",
        accountId: account.accountId,
        message: `Deadline • ${daysLeft}d Left`,
      });
    }

    if (snapshot.isPhaseTargetMet) {
      alerts.push({
        type: "success",
        accountId: account.accountId,
        message: `Phase ${account.phase} • Target Met`,
      });
    }

    if (account.daysTraded >= plan.minTradingDays && account.status === "active") {
      alerts.push({
        type: "success",
        accountId: account.accountId,
        message: `${account.daysTraded} Days • Min Met`,
      });
    }
  }

  return alerts;
}

const ICON_MAP: Record<AlertType, typeof AlertTriangle> = {
  danger: XCircle,
  warning: AlertTriangle,
  success: CheckCircle2,
  info: Info,
};

const COLOR_MAP: Record<AlertType, { border: string; bg: string; icon: string; label: string; text: string }> = {
  danger: {
    border: "rgba(239,68,68,0.25)",
    bg: "rgba(239,68,68,0.07)",
    icon: "#f87171",
    label: "#fca5a5",
    text: "rgba(255,255,255,0.75)",
  },
  warning: {
    border: "rgba(245,158,11,0.25)",
    bg: "rgba(245,158,11,0.07)",
    icon: "#fbbf24",
    label: "#fcd34d",
    text: "rgba(255,255,255,0.75)",
  },
  success: {
    border: "rgba(16,185,129,0.25)",
    bg: "rgba(16,185,129,0.07)",
    icon: "#34d399",
    label: "#6ee7b7",
    text: "rgba(255,255,255,0.75)",
  },
  info: {
    border: "rgba(56,189,248,0.25)",
    bg: "rgba(56,189,248,0.07)",
    icon: "#38bdf8",
    label: "#7dd3fc",
    text: "rgba(255,255,255,0.75)",
  },
};

export function DayAlertBanner({ views }: DayAlertBannerProps) {
  const { t, i18n } = useTranslation();

  const alerts = buildAlerts(views, i18n.language);

  if (alerts.length === 0) {
    return (
      <div
        className="overflow-hidden rounded-[16px] border px-5 py-4"
        style={{ borderColor: "rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.06)" }}
      >
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <p className="font-bricolage_grotesque text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
            {t("prop_portal.client_dashboard.no_alerts")}
          </p>
        </div>
      </div>
    );
  }

  const sorted = alerts.sort((a, b) => {
    const order: Record<AlertType, number> = { danger: 0, warning: 1, success: 2, info: 3 };
    return order[a.type] - order[b.type];
  });

  return (
    <div className="space-y-2">
      {sorted.map((alert, idx) => {
        const Icon = ICON_MAP[alert.type];
        const colors = COLOR_MAP[alert.type];

        return (
          <div
            key={idx}
            className="overflow-hidden rounded-[14px] border px-4 py-3.5"
            style={{ borderColor: colors.border, background: colors.bg }}
          >
            <div className="flex items-start gap-3">
              <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: colors.icon }} />
              <div className="min-w-0">
                <p
                  className="font-bricolage_grotesque text-[11px] font-semibold uppercase tracking-[0.12em]"
                  style={{ color: colors.label }}
                >
                  {alert.accountId}
                </p>
                <p className="mt-0.5 font-bricolage_grotesque text-sm" style={{ color: colors.text }}>
                  {alert.message}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
