import test from "node:test";
import assert from "node:assert/strict";

import { buildDailyPerformance, selectBrokerAccount } from "./brokerSync.js";

test("selects the real broker account used by the user's trades", () => {
  const selected = selectBrokerAccount(
    [
      { id: "real", currency: "USD", balance: 77175.75, isDemo: false, isTournament: false },
      { id: "demo", currency: "USD", balance: 10000, isDemo: true, isTournament: false },
    ],
    [{ accountId: "real", status: "COMPLETED", type: "REAL" }],
    { currency: "USD" },
  );
  assert.equal(selected.id, "real");
});

test("aggregates completed real trades into local trading days", () => {
  const points = buildDailyPerformance(
    [
      { id: "a", accountId: "real", status: "COMPLETED", type: "REAL", profit: "209.25", endTime: "2026-08-11T23:21:00.000Z" },
      { id: "b", accountId: "real", status: "COMPLETED", type: "REAL", profit: "-225", endTime: "2026-08-12T01:00:00.000Z" },
      { id: "ignored", accountId: "demo", status: "COMPLETED", type: "REAL", profit: "999", endTime: "2026-08-12T01:00:00.000Z" },
    ],
    { accountId: "real", initialBalance: 75000, phase: 1, dailyLossLimit: 3750, timezone: "America/Fortaleza" },
  );

  assert.deepEqual(points, [
    {
      date: "2026-08-11",
      pnl: -15.75,
      balance: 74984.25,
      phase: 1,
      breachedDailyLimit: false,
    },
  ]);
});
