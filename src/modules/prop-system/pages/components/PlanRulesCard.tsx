import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";
import { currencyBRL, formatPropDate } from "../../rules";
import { cn } from "../../../../lib/utils";
import { ProgressBar } from "./shared/ProgressBar";
import { MetricLabel } from "./shared/MetricLabel";
import type { AccountAnalytics, PlanTemplate, PropAccount } from "../../types";

interface PlanRulesCardProps {
  account: PropAccount;
  plan: PlanTemplate;
  analytics: AccountAnalytics;
}

export function PlanRulesCard({ account, plan, analytics }: PlanRulesCardProps) {
  const { t, i18n } = useTranslation();
  const { snapshot } = analytics;

  const targetPct = account.phase === 1 ? plan.profitTargetPhase1Pct : plan.profitTargetPhase2Pct;
  const targetValue = (targetPct / 100) * account.initialBalance;
  const profitProgress = Math.min((snapshot.profitPct / targetPct) * 100, 100);

  const maxDrawdownValue = (plan.maxDrawdownPct / 100) * account.initialBalance;
  const drawdownUsed = maxDrawdownValue - Math.max(snapshot.remainingDrawdownBeforeBreach, 0);
  const drawdownProgress = Math.min((drawdownUsed / maxDrawdownValue) * 100, 100);

  const dailyLossValue = (plan.dailyLossLimitPct / 100) * account.initialBalance;
  const dllUsed = dailyLossValue - Math.max(snapshot.remainingDailyLossBeforePause, 0);
  const dllProgress = Math.min((dllUsed / dailyLossValue) * 100, 100);

  const minDaysProgress = Math.min((account.daysTraded / plan.minTradingDays) * 100, 100);
  const minDaysReached = account.daysTraded >= plan.minTradingDays;

  const startMs = new Date(account.startDate).getTime();
  const endMs = new Date(account.endDate).getTime();
  const nowMs = Date.now();
  const totalDuration = endMs - startMs;
  const elapsed = Math.max(0, nowMs - startMs);
  const phaseProgress = Math.min((elapsed / totalDuration) * 100, 100);
  const daysLeft = Math.max(0, Math.ceil((endMs - nowMs) / (1000 * 60 * 60 * 24)));

  return (
    <div className="portal-card">
      <div className="border-b border-portal-border px-5 py-4">
        <MetricLabel variant="emerald">
          {t("prop_portal.client_accounts.rules_title")}
        </MetricLabel>
        <p className="mt-0.5 text-sm font-semibold text-white">
          {plan.name} — {t("prop_portal.common.phase", { value: account.phase })}
        </p>
      </div>

      <div className="space-y-5 px-5 py-5">
        <RuleRow
          label={t("prop_portal.client_accounts.rule_profit_target")}
          limit={`${targetPct}% = ${currencyBRL(targetValue, i18n.language)}`}
          current={`${currencyBRL(account.balance - account.initialBalance, i18n.language)} (${snapshot.profitPct.toFixed(2)}%)`}
          progress={profitProgress}
          direction="good"
          achieved={snapshot.isPhaseTargetMet}
          achievedLabel={t("prop_portal.client_accounts.rule_achieved")}
        />

        <RuleRow
          label={t("prop_portal.client_accounts.rule_max_drawdown")}
          limit={`${plan.maxDrawdownPct}% = ${currencyBRL(maxDrawdownValue, i18n.language)}`}
          current={`${currencyBRL(Math.max(snapshot.remainingDrawdownBeforeBreach, 0), i18n.language)} restante`}
          progress={drawdownProgress}
          direction="bad"
        />

        <RuleRow
          label={t("prop_portal.client_accounts.rule_daily_loss")}
          limit={`${plan.dailyLossLimitPct}% = ${currencyBRL(dailyLossValue, i18n.language)}`}
          current={`${currencyBRL(Math.max(snapshot.remainingDailyLossBeforePause, 0), i18n.language)} Left Today`}
          progress={dllProgress}
          direction="bad"
          breached={snapshot.isDailyLimitBreached}
        />

        <RuleRow
          label={t("prop_portal.client_accounts.rule_min_days")}
          limit={`${plan.minTradingDays} ${t("prop_portal.client_accounts.metric_trading_days").toLowerCase()}`}
          current={`${account.daysTraded} / ${plan.minTradingDays}`}
          progress={minDaysProgress}
          direction="good"
          achieved={minDaysReached}
          achievedLabel={t("prop_portal.client_accounts.rule_achieved")}
        />

        <RuleRow
          label={t("prop_portal.client_accounts.rule_deadline")}
          limit={`${plan.durationDays}d • ${formatPropDate(account.endDate, i18n.language)}`}
          current={daysLeft > 0 ? `${daysLeft} Left` : "Closed"}
          progress={phaseProgress}
          direction="neutral"
          breached={snapshot.isTimeout}
        />
      </div>
    </div>
  );
}

function resolveVariant(
  progress: number,
  direction: "good" | "bad" | "neutral",
  breached?: boolean
): "emerald" | "danger" | "warning" | "dynamic" {
  if (breached) return "danger";
  if (direction === "good") return "emerald";
  if (direction === "bad") return "dynamic";
  // neutral — use emerald at low opacity via the default
  return "emerald";
}

function RuleRow({
  label,
  limit,
  current,
  progress,
  direction,
  achieved,
  achievedLabel,
  breached,
}: {
  label: string;
  limit: string;
  current: string;
  progress: number;
  direction: "good" | "bad" | "neutral";
  achieved?: boolean;
  achievedLabel?: string;
  breached?: boolean;
}) {
  const variant = resolveVariant(progress, direction, breached);
  const clamped = Math.max(0, Math.min(100, progress));

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <MetricLabel className="text-[11px] tracking-[0.14em] text-white/70">
            {label}
          </MetricLabel>
          <MetricLabel variant="muted" className="mt-0.5 normal-case text-xs tracking-normal">
            {limit}
          </MetricLabel>
        </div>
        <div className="shrink-0 text-right">
          {achieved ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/[0.12] px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              {achievedLabel}
            </span>
          ) : (
            <p
              className={cn(
                "text-xs font-semibold",
                breached ? "text-red-400" : "text-portal-secondary"
              )}
            >
              {current}
            </p>
          )}
        </div>
      </div>

      <div
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemax={100}
      >
        <ProgressBar
          value={clamped}
          variant={variant}
          size="sm"
          className={cn("mt-2", direction === "neutral" && "opacity-60")}
        />
      </div>

      <p className="mt-1 text-right text-[10px] text-portal-muted">
        {progress.toFixed(0)}%
      </p>
    </div>
  );
}
