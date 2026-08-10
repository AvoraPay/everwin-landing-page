import type { AccountAnalytics, AccountStatus, DailyPerformancePoint, PlanTemplate, PropAccount, RiskSnapshot } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

export type PropUiLanguage = "pt" | "en" | "es";

export function getPropUiLanguage(language?: string): PropUiLanguage {
  if (language?.startsWith("pt")) return "pt";
  if (language?.startsWith("es")) return "es";
  return "en";
}

export function getPropUiLocale(language?: string): string {
  const normalized = getPropUiLanguage(language);
  if (normalized === "pt") return "pt-BR";
  if (normalized === "es") return "es-ES";
  return "en-US";
}

/**
 * Formats an account value in the currency the plan is actually denominated in.
 * A USD 75K account showing "R$ 75.000" is not a cosmetic slip — it misstates
 * the capital the trader is operating, so currency is a required argument.
 */
export function formatPropMoney(value: number, currency: string, language?: string): string {
  return new Intl.NumberFormat(getPropUiLocale(language), {
    style: "currency",
    currency: currency || "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/** @deprecated Use formatPropMoney with the plan currency. */
export function currencyBRL(value: number, language?: string): string {
  return formatPropMoney(value, "BRL", language);
}

export function formatPropDate(
  value: string | Date,
  language?: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(getPropUiLocale(language), options).format(new Date(value));
}

export function formatPropDateTime(
  value: string | Date,
  language?: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(
    getPropUiLocale(language),
    options ?? {
      dateStyle: "short",
      timeStyle: "short",
    },
  ).format(new Date(value));
}

export function getPlanById(plans: PlanTemplate[], planId: string): PlanTemplate {
  const found = plans.find((p) => p.id === planId);
  if (!found) {
    throw new Error(`Plan not found: ${planId}`);
  }
  return found;
}

/**
 * The consistency rule — the mirror of buildConsistency in server/rules.js.
 *
 * No single day may be worth more than `consistencyRulePct` of the total
 * profit. A trader who makes the whole target in one session has not shown a
 * method, so the target stops being a fixed number and becomes
 * `bestDay / rulePct` — reachable only by adding more, smaller days. The best
 * day is never punished and never erased: it just stops being enough on its own.
 */
export function buildConsistency(
  account: PropAccount,
  plan: PlanTemplate,
): Pick<
  RiskSnapshot,
  "consistencyRulePct" | "bestDayProfit" | "consistencyPct" | "requiredTotalProfit" | "isConsistencyMet"
> {
  const rulePct = Number(plan.consistencyRulePct ?? 0);
  const totalProfit = account.balance - account.initialBalance;
  const series = account.performanceSeries ?? [];
  const bestDayProfit = series.reduce((best, point) => Math.max(best, point.pnl ?? 0), 0);

  if (rulePct <= 0 || bestDayProfit <= 0) {
    return {
      consistencyRulePct: rulePct,
      bestDayProfit,
      consistencyPct: 0,
      requiredTotalProfit: 0,
      isConsistencyMet: true,
    };
  }

  const requiredTotalProfit = bestDayProfit / (rulePct / 100);
  return {
    consistencyRulePct: rulePct,
    bestDayProfit,
    consistencyPct: totalProfit > 0 ? (bestDayProfit / totalProfit) * 100 : 100,
    requiredTotalProfit,
    isConsistencyMet: totalProfit >= requiredTotalProfit,
  };
}

export function buildRiskSnapshot(account: PropAccount, plan: PlanTemplate, nowISO: string): RiskSnapshot {
  const currentProfit = account.balance - account.initialBalance;
  const profitPct = (currentProfit / account.initialBalance) * 100;
  const targetPct = account.phase === 1 ? plan.profitTargetPhase1Pct : plan.profitTargetPhase2Pct;

  const maxAllowedLoss = (account.initialBalance * plan.maxDrawdownPct) / 100;
  const dailyLossLimit = (account.initialBalance * plan.dailyLossLimitPct) / 100;

  const currentDrawdownAmount = account.initialBalance - account.balance;
  const remainingDrawdownBeforeBreach = maxAllowedLoss - currentDrawdownAmount;
  const remainingDailyLossBeforePause = dailyLossLimit + account.todayPnl;

  const endDateMs = new Date(account.endDate).getTime();
  const nowMs = new Date(nowISO).getTime();

  const consistency = buildConsistency(account, plan);
  const nominalTargetMoney = (targetPct / 100) * account.initialBalance;
  const effectiveTargetMoney = Math.max(nominalTargetMoney, consistency.requiredTotalProfit);
  const effectiveTargetPct = (effectiveTargetMoney / account.initialBalance) * 100;

  return {
    profitPct,
    targetPct,
    remainingToTarget: targetPct - profitPct,
    maxAllowedLoss,
    dailyLossLimit,
    remainingDrawdownBeforeBreach,
    remainingDailyLossBeforePause,
    isDailyLimitBreached: account.todayPnl <= -dailyLossLimit,
    isHardBreach: currentDrawdownAmount >= maxAllowedLoss,
    isTimeout: nowMs > endDateMs,
    ...consistency,
    nominalTargetMoney,
    effectiveTargetMoney,
    effectiveTargetPct,
    remainingToEffectiveTarget: Math.max(0, effectiveTargetMoney - currentProfit),
    isPhaseTargetMet:
      currentProfit >= effectiveTargetMoney &&
      profitPct >= targetPct &&
      account.daysTraded >= plan.minTradingDays,
  };
}

export function evaluateAccount(account: PropAccount, plan: PlanTemplate, nowISO: string): PropAccount {
  const snapshot = buildRiskSnapshot(account, plan, nowISO);
  const next: PropAccount = { ...account, updatedAt: nowISO };
  const currentDrawdownPct = Math.max(0, ((account.initialBalance - account.balance) / account.initialBalance) * 100);
  next.maxDrawdownHitPct = Math.max(next.maxDrawdownHitPct, currentDrawdownPct);

  const terminalStatuses: AccountStatus[] = ["approved_for_funded", "rejected", "failed_drawdown", "failed_timeout"];

  if (terminalStatuses.includes(account.status)) {
    return next;
  }

  if (account.status === "cooldown") {
    if (account.cooldownUntil && new Date(nowISO).getTime() >= new Date(account.cooldownUntil).getTime()) {
      next.status = "awaiting_account_creation";
      next.cooldownUntil = undefined;
    }
    return next;
  }

  if (snapshot.isHardBreach) {
    next.status = "failed_drawdown";
    next.cooldownUntil = new Date(new Date(nowISO).getTime() + 7 * DAY_MS).toISOString();
    next.maxDrawdownHitPct = Math.max(next.maxDrawdownHitPct, plan.maxDrawdownPct);
    return next;
  }

  if (snapshot.isTimeout && (account.status === "active" || account.status === "paused")) {
    next.status = "failed_timeout";
    next.cooldownUntil = new Date(new Date(nowISO).getTime() + 7 * DAY_MS).toISOString();
    return next;
  }

  if (account.status === "active" && snapshot.isDailyLimitBreached) {
    next.status = "paused";
    return next;
  }

  if (account.status === "paused" && !snapshot.isDailyLimitBreached) {
    next.status = "active";
  }

  if ((account.status === "active" || account.status === "paused") && snapshot.isPhaseTargetMet) {
    if (account.phase === 1) {
      next.phase = 2;
      next.startDate = nowISO;
      next.endDate = new Date(new Date(nowISO).getTime() + plan.durationDays * DAY_MS).toISOString();
      next.todayPnl = 0;
      next.daysTraded = 0;
      next.status = "active";
      return next;
    }

    next.status = "passed";
    return next;
  }

  return next;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getStdDev(values: number[]): number {
  if (values.length <= 1) return 0;
  const mean = values.reduce((acc, value) => acc + value, 0) / values.length;
  const variance = values.reduce((acc, value) => acc + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function buildAccountAnalytics(account: PropAccount, plan: PlanTemplate, nowISO: string): AccountAnalytics {
  const snapshot = buildRiskSnapshot(account, plan, nowISO);
  const series = account.performanceSeries;

  const totalDays = series.length;
  const positiveDays = series.filter((point) => point.pnl > 0).length;
  const pnlSeries = series.map((point) => point.pnl);

  const winRatePct = totalDays > 0 ? (positiveDays / totalDays) * 100 : 0;
  const averageDailyPnl = totalDays > 0 ? pnlSeries.reduce((acc, value) => acc + value, 0) / totalDays : 0;
  const pnlVolatility = getStdDev(pnlSeries);

  // Progress is measured against the target the trader actually has to reach,
  // so a single huge day does not read as "almost done".
  const targetMoney = snapshot.effectiveTargetMoney;
  const currentProfitMoney = account.balance - account.initialBalance;
  const remainingMoney = Math.max(0, targetMoney - currentProfitMoney);
  const projectedDaysToTarget = averageDailyPnl > 0 ? Math.ceil(remainingMoney / averageDailyPnl) : null;

  const progressScore = clamp(targetMoney > 0 ? (currentProfitMoney / targetMoney) * 100 : 0, 0, 100);
  const drawdownUsePct = snapshot.maxAllowedLoss > 0 ? ((snapshot.maxAllowedLoss - snapshot.remainingDrawdownBeforeBreach) / snapshot.maxAllowedLoss) * 100 : 100;
  const riskDisciplineScore = clamp(100 - drawdownUsePct * 1.1, 0, 100);
  const volatilityPenalty = account.initialBalance > 0 ? (pnlVolatility / account.initialBalance) * 1500 : 0;
  const consistencyBase = winRatePct * 0.7 + clamp((account.daysTraded / plan.minTradingDays) * 100, 0, 100) * 0.3;
  const consistencyScore = clamp(consistencyBase - volatilityPenalty, 0, 100);

  const rulePenalty =
    (snapshot.isDailyLimitBreached ? 18 : 0) +
    (snapshot.isHardBreach ? 35 : 0) +
    (account.status === "paused" ? 12 : 0) +
    (account.status === "failed_drawdown" || account.status === "failed_timeout" ? 30 : 0);

  const everwinEdgeScore = clamp(progressScore * 0.35 + riskDisciplineScore * 0.35 + consistencyScore * 0.3 - rulePenalty, 0, 100);

  return {
    snapshot,
    winRatePct,
    averageDailyPnl,
    pnlVolatility,
    consistencyScore,
    riskDisciplineScore,
    progressScore,
    projectedDaysToTarget,
    everwinEdgeScore,
  };
}

export function appendPerformancePoint(
  currentSeries: DailyPerformancePoint[],
  point: DailyPerformancePoint,
  maxEntries = 90,
): DailyPerformancePoint[] {
  if (currentSeries.length === 0) return [point];

  const next = [...currentSeries];
  const last = next[next.length - 1];
  if (last.date === point.date) {
    next[next.length - 1] = point;
    return next;
  }

  next.push(point);
  if (next.length > maxEntries) {
    return next.slice(next.length - maxEntries);
  }
  return next;
}

export function buildPortfolioEquitySeries(accounts: PropAccount[]): Array<{ date: string; equity: number }> {
  const map = new Map<string, number>();
  for (const account of accounts) {
    for (const point of account.performanceSeries) {
      map.set(point.date, (map.get(point.date) ?? 0) + point.balance);
    }
  }

  return [...map.entries()]
    .map(([date, equity]) => ({ date, equity }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getStatusVariant(status: AccountStatus): "neutral" | "success" | "warning" | "danger" | "info" {
  if (status === "active" || status === "approved_for_funded" || status === "passed") return "success";
  if (status === "paused" || status === "cooldown" || status === "awaiting_account_creation") return "warning";
  if (status === "failed_drawdown" || status === "failed_timeout" || status === "rejected") return "danger";
  if (status === "pending_payment") return "info";
  return "neutral";
}

export function statusToLabel(status: AccountStatus, language?: string): string {
  const map: Record<PropUiLanguage, Record<AccountStatus, string>> = {
    pt: {
      pending_payment: "Pagamento pendente",
      awaiting_account_creation: "Aguardando configuração",
      active: "Ativa",
      paused: "Pausada (DLL)",
      passed: "Aprovada",
      failed_drawdown: "Falha por drawdown",
      failed_timeout: "Falha por prazo",
      cooldown: "Cooldown",
      approved_for_funded: "Aprovada para funded",
      rejected: "Rejeitada",
    },
    en: {
      pending_payment: "Pending payment",
      awaiting_account_creation: "Awaiting setup",
      active: "Active",
      paused: "Paused (DLL)",
      passed: "Passed",
      failed_drawdown: "Failed drawdown",
      failed_timeout: "Failed timeout",
      cooldown: "Cooldown",
      approved_for_funded: "Approved for funded",
      rejected: "Rejected",
    },
    es: {
      pending_payment: "Pago pendiente",
      awaiting_account_creation: "Esperando configuración",
      active: "Activa",
      paused: "Pausada (DLL)",
      passed: "Aprobada",
      failed_drawdown: "Fallo por drawdown",
      failed_timeout: "Fallo por plazo",
      cooldown: "Cooldown",
      approved_for_funded: "Aprobada para funded",
      rejected: "Rechazada",
    },
  };
  return map[getPropUiLanguage(language)][status];
}
