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
  const orderedTrades = [...trades].sort((a, b) => String(a.endTime ?? "").localeCompare(String(b.endTime ?? "")));
  for (const trade of orderedTrades) {
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
    const day = byDate.get(date) ?? { pnl: 0, lowestPnl: 0 };
    day.pnl += amount(trade.profit);
    day.lowestPnl = Math.min(day.lowestPnl, day.pnl);
    byDate.set(date, day);
  }

  let balance = options.initialBalance;
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, day]) => {
      balance += day.pnl;
      return {
        date,
        pnl: day.pnl,
        lowestPnl: day.lowestPnl,
        balance,
        phase: options.phase,
        breachedDailyLimit: day.lowestPnl <= -options.dailyLossLimit,
      };
    });
}
