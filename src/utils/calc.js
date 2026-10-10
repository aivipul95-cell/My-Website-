const num = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

/** P&L for a trade. side: 'Long' | 'Short'. Returns nulls if trade is still open. */
export function calcPnL({ side, entry, exit, quantity }) {
  const e = num(entry);
  const x = num(exit);
  const q = num(quantity);
  if (e == null || x == null || q == null || e === 0) return { pnl: null, pnlPct: null };
  const dir = side === 'Short' ? -1 : 1;
  const pnl = (x - e) * q * dir;
  const pnlPct = ((x - e) / e) * 100 * dir;
  return { pnl, pnlPct };
}

export function summarize(entries) {
  const closed = entries.map((e) => calcPnL(e).pnl).filter((p) => p != null);
  const wins = closed.filter((p) => p > 0);
  const losses = closed.filter((p) => p < 0);
  const total = closed.reduce((a, b) => a + b, 0);
  const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
  return {
    totalPnL: total,
    totalTrades: entries.length,
    closedTrades: closed.length,
    winRate: closed.length ? (wins.length / closed.length) * 100 : 0,
    avgWin: avg(wins),
    avgLoss: avg(losses),
    wins: wins.length,
    losses: losses.length,
  };
}

/** Position sizing for the risk calculator. */
export function calcRisk({ capital, riskPct, entry, stopLoss, side }) {
  const c = num(capital);
  const r = num(riskPct);
  const e = num(entry);
  const s = num(stopLoss);
  if (c == null || r == null || e == null || s == null) return null;
  const perShare = side === 'Short' ? s - e : e - s;
  if (perShare <= 0) return { error: side === 'Short' ? 'Stop loss must be above entry for a short.' : 'Stop loss must be below entry for a long.' };
  const riskAmount = (c * r) / 100;
  let quantity = Math.floor(riskAmount / perShare);
  let cappedByCapital = false;
  if (quantity * e > c) {
    quantity = Math.floor(c / e);
    cappedByCapital = true;
  }
  return {
    riskAmount,
    perShare,
    quantity,
    totalInvestment: quantity * e,
    actualRisk: quantity * perShare,
    cappedByCapital,
  };
}

export function targetFor({ entry, perShare, ratio, side }) {
  const e = num(entry);
  return side === 'Short' ? e - perShare * ratio : e + perShare * ratio;
}
