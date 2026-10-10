import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, BookPlus, Calculator, RotateCcw } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { LS_KEYS } from '../utils/storage';
import { calcRisk, targetFor } from '../utils/calc';
import { fmtMoney, fmtNum, today } from '../utils/format';
import { JOURNALS } from '../utils/journal';
import { useSettings } from '../context/SettingsContext';
import PageHeader from '../components/PageHeader';

const PRESETS = [2, 3, 4, 5];
const defaults = {
  capital: '100000', riskPct: '1', entry: '', stopLoss: '', side: 'Long', symbol: '',
  ratio: 2, customRatio: '', journal: 'trading',
};

function NumberInput({ label, value, onChange, suffix, ...rest }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input type="number" step="any" min="0" className={`input ${suffix ? 'pr-10' : ''}`} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
        {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">{suffix}</span>}
      </div>
    </div>
  );
}

function Metric({ label, value, tone }) {
  const color = { red: 'text-rose-500', green: 'text-emerald-500', brand: 'text-brand-600 dark:text-brand-400' }[tone] || '';
  return (
    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

export default function RiskCalculator() {
  const [state, setState] = useLocalStorage(LS_KEYS.risk, defaults);
  const s = { ...defaults, ...state };
  const set = (k) => (v) => setState((p) => ({ ...defaults, ...p, [k]: v }));
  const { currency } = useSettings();
  const navigate = useNavigate();

  const result = calcRisk(s);
  const ok = result && !result.error;
  const custom = parseFloat(s.customRatio);
  const ratios = useMemo(() => {
    const list = [...PRESETS];
    if (custom > 0 && !list.includes(custom)) list.push(custom);
    return list.sort((a, b) => a - b);
  }, [custom]);
  const selected = s.ratio === 'custom' ? (custom > 0 ? custom : null) : s.ratio;

  const rows = ok
    ? ratios.map((r) => {
        const target = targetFor({ entry: s.entry, perShare: result.perShare, ratio: r, side: s.side });
        return { r, target, profit: result.quantity * result.perShare * r, invalid: target <= 0 };
      })
    : [];
  const sel = rows.find((row) => row.r === selected);

  const saveToJournal = () => {
    if (!ok) return;
    const prefill = {
      journal: s.journal,
      date: today(),
      symbol: s.symbol.toUpperCase(),
      side: s.side,
      entry: s.entry,
      stopLoss: s.stopLoss,
      quantity: String(result.quantity),
      target: sel ? String(+sel.target.toFixed(2)) : '',
      notes: `Planned via risk calculator: risk ${fmtMoney(result.actualRisk, currency)} (${s.riskPct}% of ${fmtMoney(+s.capital, currency, 0)})${selected ? `, R:R 1:${selected}` : ''}.`,
      imageIds: [],
      emotions: [],
    };
    navigate(`/journals?tab=${s.journal}`, { state: { prefill } });
  };

  return (
    <div>
      <PageHeader
        icon={<Calculator size={22} />}
        title="Risk Management Calculator"
        subtitle="Size every position so a single loss never hurts."
        actions={<button className="btn-ghost" onClick={() => setState(defaults)}><RotateCcw size={16} /> Reset</button>}
      />

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="card space-y-4 self-start p-5 lg:col-span-2">
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            {['Long', 'Short'].map((side) => (
              <button
                key={side}
                onClick={() => set('side')(side)}
                className={`rounded-md py-2 text-sm font-semibold transition ${s.side === side ? (side === 'Long' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white') : 'text-slate-500'}`}
              >
                {side === 'Long' ? 'Buy / Long' : 'Sell / Short'}
              </button>
            ))}
          </div>
          <div>
            <label className="label">Symbol (optional)</label>
            <input className="input uppercase" value={s.symbol} onChange={(e) => set('symbol')(e.target.value)} placeholder="NIFTY / RELIANCE" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumberInput label={`Capital (${currency})`} value={s.capital} onChange={set('capital')} />
            <NumberInput label="Risk per trade" value={s.riskPct} onChange={set('riskPct')} suffix="%" max="100" />
            <NumberInput label="Entry price" value={s.entry} onChange={set('entry')} />
            <NumberInput label="Stop loss price" value={s.stopLoss} onChange={set('stopLoss')} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[0.5, 1, 2, 3].map((p) => (
              <button key={p} onClick={() => set('riskPct')(String(p))} className={`chip cursor-pointer border ${+s.riskPct === p ? 'border-brand-500 bg-brand-600 text-white' : 'border-slate-300 text-slate-500 dark:border-slate-700'}`}>{p}% risk</button>
            ))}
          </div>

          <div>
            <label className="label">Risk : Reward</label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((r) => (
                <button key={r} onClick={() => set('ratio')(r)} className={`btn ${s.ratio === r ? 'bg-brand-600 text-white' : 'btn-outline'}`}>1:{r}</button>
              ))}
              <div className={`flex items-center gap-1 rounded-lg border px-2 ${s.ratio === 'custom' ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-300 dark:border-slate-700'}`}>
                <span className="text-sm text-slate-500">1:</span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="custom"
                  className="w-16 bg-transparent py-2 text-sm outline-none"
                  value={s.customRatio}
                  onFocus={() => set('ratio')('custom')}
                  onChange={(e) => setState((p) => ({ ...defaults, ...p, customRatio: e.target.value, ratio: 'custom' }))}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 lg:col-span-3">
          {result?.error && (
            <div className="card flex items-center gap-3 border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300">
              <AlertTriangle size={18} /> {result.error}
            </div>
          )}
          {!result && (
            <div className="card p-8 text-center text-sm text-slate-500">Enter capital, risk %, entry and stop loss to see your position size.</div>
          )}
          {ok && (
            <>
              <div className="card p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Metric label="Risk amount" value={fmtMoney(result.riskAmount, currency)} tone="red" />
                  <Metric label="Position size" value={`${fmtNum(result.quantity, 0)} qty`} tone="brand" />
                  <Metric label="Total investment" value={fmtMoney(result.totalInvestment, currency)} />
                </div>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <span>Risk / share: <b>{fmtMoney(result.perShare, currency)}</b></span>
                  <span>Actual risk at this qty: <b>{fmtMoney(result.actualRisk, currency)}</b></span>
                  <span>Capital used: <b>{((result.totalInvestment / +s.capital) * 100).toFixed(1)}%</b></span>
                </div>
                {result.cappedByCapital && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-amber-600"><AlertTriangle size={12} /> Quantity capped by available capital (no leverage).</p>
                )}
                {result.quantity === 0 && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-amber-600"><AlertTriangle size={12} /> Risk amount is smaller than risk per share — quantity is 0.</p>
                )}
              </div>

              {sel && (
                <div className="card p-5">
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="font-semibold">Risk vs Reward (1:{selected})</span>
                    <span className="text-slate-500">Target <b className="text-slate-800 dark:text-slate-100">{fmtNum(sel.target)}</b></span>
                  </div>
                  <div className="flex h-10 overflow-hidden rounded-xl text-xs font-semibold text-white">
                    <div className="flex items-center justify-center bg-rose-500 transition-all duration-500" style={{ width: `${100 / (1 + selected)}%` }}>
                      {fmtMoney(result.actualRisk, currency, 0)}
                    </div>
                    <div className="flex items-center justify-center bg-emerald-500 transition-all duration-500" style={{ width: `${(100 * selected) / (1 + selected)}%` }}>
                      {fmtMoney(sel.profit, currency, 0)}
                    </div>
                  </div>
                  <div className="relative mt-2 h-4 text-xs text-slate-500">
                    <span className="absolute left-0">SL {fmtNum(+s.stopLoss)}</span>
                    <span className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${100 / (1 + selected)}%` }}>Entry {fmtNum(+s.entry)}</span>
                    <span className="absolute right-0">Target {fmtNum(sel.target)}</span>
                  </div>
                  {sel.invalid && <p className="mt-2 text-xs text-amber-600">Target price would be ≤ 0 for this ratio.</p>}
                </div>
              )}

              <div className="card overflow-hidden">
                <div className="border-b border-slate-200 px-5 py-3 text-sm font-semibold dark:border-slate-800">Target comparison</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                      <tr>
                        <th className="px-5 py-2.5 font-medium">R:R</th>
                        <th className="px-5 py-2.5 font-medium">Target price</th>
                        <th className="px-5 py-2.5 font-medium">Move</th>
                        <th className="px-5 py-2.5 font-medium">Potential profit</th>
                        <th className="px-5 py-2.5 font-medium">Return on capital</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {rows.map((row) => (
                        <tr
                          key={row.r}
                          onClick={() => set('ratio')(PRESETS.includes(row.r) ? row.r : 'custom')}
                          className={`cursor-pointer transition ${row.r === selected ? 'bg-brand-50 dark:bg-brand-600/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
                        >
                          <td className="px-5 py-2.5 font-semibold">1:{row.r}{!PRESETS.includes(row.r) && <span className="ml-1 text-xs text-slate-400">custom</span>}</td>
                          <td className={`px-5 py-2.5 ${row.invalid ? 'text-amber-600' : ''}`}>{fmtNum(row.target)}</td>
                          <td className="px-5 py-2.5 text-slate-500">{(((row.target - +s.entry) / +s.entry) * 100).toFixed(2)}%</td>
                          <td className="px-5 py-2.5 font-semibold text-emerald-500">{fmtMoney(row.profit, currency)}</td>
                          <td className="px-5 py-2.5 text-slate-500">{((row.profit / +s.capital) * 100).toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card flex flex-wrap items-center gap-3 p-4">
                <span className="text-sm text-slate-500">Save this plan to</span>
                <select className="input w-auto" value={s.journal} onChange={(e) => set('journal')(e.target.value)}>
                  {JOURNALS.map((j) => <option key={j.id} value={j.id}>{j.label}</option>)}
                </select>
                <button className="btn-primary ml-auto" onClick={saveToJournal} disabled={!result.quantity}>
                  <BookPlus size={16} /> Save to Journal
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
