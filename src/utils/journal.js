export const JOURNALS = [
  { id: 'trading', label: 'Trading Journal', short: 'Trading' },
  { id: 'swing', label: 'Swing Trading Journal', short: 'Swing' },
  { id: 'investment', label: 'Investment Journal', short: 'Investment' },
];

export const STRATEGIES = [
  'Breakout', 'Breakdown', 'Pullback', 'Reversal', 'Trend Following', 'Range Trading', 'Gap Up/Down',
  'VWAP', 'Opening Range Breakout', 'Support/Resistance', 'Moving Average Crossover', 'Momentum',
  'Scalping', 'Options Selling', 'Value Investing', 'Growth Investing', 'Dividend', 'SIP',
];

export const EMOTIONS = [
  'Disciplined', 'Patient', 'Confident', 'FOMO', 'Fear', 'Greed', 'Revenge Trade', 'Overtrading',
  'Early Exit', 'Late Entry', 'Moved SL', 'No SL', 'Oversized', 'Ignored Plan', 'Impulsive',
];

export const HOLDING_PERIODS = ['< 1 month', '1–3 months', '3–6 months', '6–12 months', '1–3 years', '3–5 years', '5+ years'];

export const emptyEntry = (journal, date) => ({
  journal,
  date,
  symbol: '',
  side: 'Long',
  entry: '',
  exit: '',
  quantity: '',
  stopLoss: '',
  target: '',
  strategy: '',
  emotions: [],
  notes: '',
  imageIds: [],
  thesis: '',
  holdingPeriod: '',
  reviewDate: '',
});
