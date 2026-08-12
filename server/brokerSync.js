function amount(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function localDate(value, timezone) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function selectBrokerAccount(accounts = [], trades = [], { currency, platformAccountId } = {}) {
  if (platformAccountId) {
    const linked = accounts.find((account) => account.id === platformAccountId);
    if (linked) return linked;
  }

  const eligible = accounts.filter(
    (account) => !account.isDemo && !account.isTournament && (!currency || account.currency === currency),
  );
  const usedIds = new Set(
    trades
      .filter((trade) => trade.status === "COMPLETED" && trade.type === "REAL")
      .map((trade) => trade.accountId),
  );
  return eligible.find((account) => usedIds.has(account.id)) ?? (eligible.length === 1 ? eligible[0] : null);
}

export function buildDailyPerformance(trades = [], options) {
  const byDate = new Map();
  for (const trade of trades) {
    if (
      trade.accountId !== options.accountId ||
      trade.status !== "COMPLETED" ||
      trade.type !== "REAL" ||
      trade.isReverted ||
      trade.removedAt ||
      !trade.endTime
    ) {
      continue;
    }
    const date = localDate(trade.endTime, options.timezone);
    byDate.set(date, (byDate.get(date) ?? 0) + amount(trade.profit));
  }

  let balance = options.initialBalance;
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, pnl]) => {
      balance += pnl;
      return {
        date,
        pnl,
        balance,
        phase: options.phase,
        breachedDailyLimit: pnl <= -options.dailyLossLimit,
      };
    });
}
