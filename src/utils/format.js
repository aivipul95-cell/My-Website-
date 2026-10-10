export function fmtMoney(value, currency = '₹', digits = 2) {
  if (value == null || Number.isNaN(value)) return '—';
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value).toLocaleString('en-IN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return `${sign}${currency}${abs}`;
}

export function fmtNum(value, digits = 2) {
  if (value == null || Number.isNaN(value)) return '—';
  return Number(value).toLocaleString('en-IN', { maximumFractionDigits: digits });
}

export function fmtPct(value, digits = 2) {
  if (value == null || Number.isNaN(value)) return '—';
  return `${value > 0 ? '+' : ''}${value.toFixed(digits)}%`;
}

export const pnlColor = (v) =>
  v == null ? 'text-slate-500' : v > 0 ? 'text-emerald-500' : v < 0 ? 'text-rose-500' : 'text-slate-500';

export const today = () => new Date().toISOString().slice(0, 10);
