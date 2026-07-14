import { Wallet, TrendingUp, BarChart2, CalendarRange } from "lucide-react";
import { useTranslation } from "react-i18next";
import { currencyBRL } from "../../rules";
import { cn } from "../../../../lib/utils";
import { IconBadge } from "./shared/IconBadge";
import { MetricLabel } from "./shared/MetricLabel";
import type { AccountAnalytics, PlanTemplate, PropAccount } from "../../types";

interface AccountMetricsStripProps {
  account: PropAccount;
  analytics: AccountAnalytics;
  plan: PlanTemplate;
}

export function AccountMetricsStrip({ account, analytics, plan }: AccountMetricsStripProps) {
  const { t, i18n } = useTranslation();

  const profitPct = analytics.snapshot.profitPct;
  const totalPnl = account.balance - account.initialBalance;
  const todayPct = account.initialBalance > 0 ? (account.todayPnl / account.initialBalance) * 100 : 0;
  const minDaysReached = account.daysTraded >= plan.minTradingDays;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        icon={<Wallet className="h-4 w-4" />}
        iconColor="emerald"
        label={t("prop_portal.client_accounts.metric_balance")}
        value={currencyBRL(account.balance, i18n.language)}
        helper={`Start ${currencyBRL(account.initialBalance, i18n.language)}`}
      />
      <MetricCard
        icon={<TrendingUp className="h-4 w-4" />}
        iconColor={account.todayPnl >= 0 ? "emerald" : "red"}
        label={t("prop_portal.client_accounts.metric_pnl_today")}
        value={`${account.todayPnl >= 0 ? "+" : ""}${currencyBRL(account.todayPnl, i18n.language)}`}
        helper={`${todayPct >= 0 ? "+" : ""}${todayPct.toFixed(2)}%`}
        valueClassName={account.todayPnl >= 0 ? "text-emerald-400" : "text-red-400"}
      />
      <MetricCard
        icon={<BarChart2 className="h-4 w-4" />}
        iconColor={totalPnl >= 0 ? "emerald" : "red"}
        label={t("prop_portal.client_accounts.metric_pnl_total")}
        value={`${totalPnl >= 0 ? "+" : ""}${currencyBRL(totalPnl, i18n.language)}`}
        helper={`${profitPct >= 0 ? "+" : ""}${profitPct.toFixed(2)}%`}
        valueClassName={totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}
      />
      <MetricCard
        icon={<CalendarRange className="h-4 w-4" />}
        iconColor={minDaysReached ? "emerald" : "neutral"}
        label={t("prop_portal.client_accounts.metric_trading_days")}
        value={`${account.daysTraded} / ${plan.minTradingDays}`}
        helper={minDaysReached ? "Min Met" : `Phase ${account.phase}`}
        valueClassName={minDaysReached ? "text-emerald-400" : "text-white"}
      />
    </div>
  );
}

function MetricCard({
  icon,
  iconColor,
  label,
  value,
  helper,
  valueClassName,
}: {
  icon: React.ReactNode;
  iconColor: "emerald" | "red" | "neutral";
  label: string;
  value: string;
  helper?: string;
  valueClassName?: string;
}) {
  return (
    <div className="portal-card overflow-hidden rounded-portal-sm border border-portal-border p-4">
      <div className="flex items-center justify-between gap-3">
        <IconBadge
          icon={icon}
          color={iconColor}
          size="sm"
          className="h-9 w-9 rounded-portal-xs"
        />
        <MetricLabel
          as="span"
          className="text-right text-[10px] font-semibold uppercase tracking-[0.14em]"
        >
          {label}
        </MetricLabel>
      </div>
      <p
        className={cn(
          "mt-3 text-lg font-semibold tracking-[-0.01em] text-white",
          valueClassName
        )}
      >
        {value}
      </p>
      {helper && (
        <MetricLabel as="p" className="mt-1 text-xs">
          {helper}
        </MetricLabel>
      )}
    </div>
  );
}
