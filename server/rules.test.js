import test from "node:test";
import assert from "node:assert/strict";

import { buildRiskSnapshot } from "./rules.js";

const plan = {
  dailyLossLimitPct: 5,
  maxDrawdownPct: 10,
  profitTargetPhase1Pct: 10,
  profitTargetPhase2Pct: 5,
  minTradingDays: 5,
  consistencyRulePct: 0,
};

const account = {
  initialBalance: 75000,
  balance: 76000,
  todayPnl: 1000,
  phase: 1,
  daysTraded: 1,
  endDate: "2026-12-31T23:59:59.000Z",
  maxDrawdownHitPct: 0,
  performanceSeries: [],
};

test("keeps a recovered intraday daily-limit breach active for that day", () => {
  const snapshot = buildRiskSnapshot(
    { ...account, performanceSeries: [{ date: "2026-08-12", pnl: 1000, breachedDailyLimit: true }] },
    plan,
    "2026-08-12T21:00:00.000Z",
  );
  assert.equal(snapshot.isDailyLimitBreached, true);
});

test("keeps a recovered maximum-drawdown breach terminal", () => {
  const snapshot = buildRiskSnapshot({ ...account, maxDrawdownHitPct: 10.2 }, plan, "2026-08-12T21:00:00.000Z");
  assert.equal(snapshot.isHardBreach, true);
});
