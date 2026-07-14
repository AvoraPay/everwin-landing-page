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

export function buildRiskSnapshot(account, plan, nowISO = new Date().toISOString()) {
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
    isPhaseTargetMet: profitPct >= targetPct && account.daysTraded >= plan.minTradingDays,
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

  const targetMoney = (snapshot.targetPct / 100) * account.initialBalance;
  const currentProfitMoney = account.balance - account.initialBalance;
  const remainingMoney = Math.max(0, targetMoney - currentProfitMoney);
  const projectedDaysToTarget = averageDailyPnl > 0 ? Math.ceil(remainingMoney / averageDailyPnl) : null;

  const progressScore = clamp((snapshot.profitPct / snapshot.targetPct) * 100, 0, 100);
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
