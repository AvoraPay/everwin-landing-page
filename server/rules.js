const DAY_MS = 24 * 60 * 60 * 1000;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function stdDev(values) {
  if (!values.length) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, value) => acc + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * The consistency rule.
 *
 * No single day may be worth more than `consistencyRulePct` of the total
 * profit. A trader who makes the whole target in one session has not shown a
 * method, so the target stops being a fixed number and becomes
 * `bestDay / rulePct` — reachable only by adding more, smaller days. The best
 * day is never punished and never erased: it just stops being enough on its own.
 *
 * Modelled on the rule Tradeify enforces, and it never fails an account —
 * it only withholds the pass.
 */
export function buildConsistency(account, plan) {
  const rulePct = Number(plan.consistencyRulePct ?? 0);
  const totalProfit = account.balance - account.initialBalance;
  const series = account.performanceSeries ?? [];
  const bestDayProfit = series.reduce((best, point) => Math.max(best, point.pnl ?? 0), 0);

  // No rule, no winning day, or nothing gained yet: nothing to enforce.
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

export function buildRiskSnapshot(account, plan, nowISO = new Date().toISOString()) {
  const currentProfit = account.balance - account.initialBalance;
  const profitPct = (currentProfit / account.initialBalance) * 100;
  const targetPct = account.phase === 1 ? plan.profitTargetPhase1Pct : plan.profitTargetPhase2Pct;

  const maxAllowedLoss = (account.initialBalance * plan.maxDrawdownPct) / 100;
  const dailyLossLimit = (account.initialBalance * plan.dailyLossLimitPct) / 100;

  const currentDrawdownAmount = account.initialBalance - account.balance;
  const remainingDrawdownBeforeBreach = maxAllowedLoss - currentDrawdownAmount;
  const remainingDailyLossBeforePause = dailyLossLimit + account.todayPnl;
  const localToday = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Fortaleza",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(nowISO));
  const todayPoint = (account.performanceSeries ?? []).find((point) => point.date === localToday);
  const dailyLimitWasBreached = Boolean(todayPoint?.breachedDailyLimit);
  const hardLimitWasBreached = Number(account.maxDrawdownHitPct ?? 0) >= Number(plan.maxDrawdownPct);

  const endDateMs = new Date(account.endDate).getTime();
  const nowMs = new Date(nowISO).getTime();

  const consistency = buildConsistency(account, plan);
  const nominalTargetMoney = (targetPct / 100) * account.initialBalance;
  // The number the trader actually has to reach: whichever is higher.
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
    isDailyLimitBreached: dailyLimitWasBreached || account.todayPnl <= -dailyLossLimit,
    isHardBreach: hardLimitWasBreached || currentDrawdownAmount >= maxAllowedLoss,
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

export function evaluateAccount(account, plan, nowISO = new Date().toISOString()) {
  const snapshot = buildRiskSnapshot(account, plan, nowISO);
  const next = { ...account, updatedAt: nowISO };

  const currentDrawdownPct = Math.max(0, ((next.initialBalance - next.balance) / next.initialBalance) * 100);
  next.maxDrawdownHitPct = Math.max(next.maxDrawdownHitPct ?? 0, currentDrawdownPct);

  const terminal = ["approved_for_funded", "rejected", "failed_drawdown", "failed_timeout"];
  if (terminal.includes(next.status)) return next;

  if (next.status === "cooldown") {
    if (next.cooldownUntil && new Date(nowISO).getTime() >= new Date(next.cooldownUntil).getTime()) {
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

  if (snapshot.isTimeout && ["active", "paused"].includes(next.status)) {
    next.status = "failed_timeout";
    next.cooldownUntil = new Date(new Date(nowISO).getTime() + 7 * DAY_MS).toISOString();
    return next;
  }

  if (next.status === "active" && snapshot.isDailyLimitBreached) {
    next.status = "paused";
    return next;
  }

  if (next.status === "paused" && !snapshot.isDailyLimitBreached) {
    next.status = "active";
  }

  if (["active", "paused"].includes(next.status) && snapshot.isPhaseTargetMet) {
    if (next.phase === 1) {
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

export function appendPerformancePoint(series, point, maxEntries = 90) {
  if (!Array.isArray(series) || series.length === 0) return [point];

  const next = [...series];
  const last = next[next.length - 1];
  if (last.date === point.date) {
    next[next.length - 1] = point;
    return next;
  }

  next.push(point);
  return next.length > maxEntries ? next.slice(next.length - maxEntries) : next;
}

export function buildAccountAnalytics(account, plan, nowISO = new Date().toISOString()) {
  const snapshot = buildRiskSnapshot(account, plan, nowISO);
  const series = account.performanceSeries ?? [];
  const totalDays = series.length;
  const positiveDays = series.filter((p) => p.pnl > 0).length;
  const pnlSeries = series.map((p) => p.pnl);

  const winRatePct = totalDays ? (positiveDays / totalDays) * 100 : 0;
  const averageDailyPnl = totalDays ? pnlSeries.reduce((a, b) => a + b, 0) / totalDays : 0;
  const pnlVolatility = stdDev(pnlSeries);

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
    (["failed_drawdown", "failed_timeout"].includes(account.status) ? 30 : 0);

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
