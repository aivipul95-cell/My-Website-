import { Minus, Plus, RotateCcw } from 'lucide-react';

export const defaultTracker = () => ({ value: 0, step: 1, target: '', unit: '', history: [] });

export default function TrackerBlock({ data, onChange }) {
  const value = Number(data.value) || 0;
  const step = Number(data.step) || 1;
  const target = parseFloat(data.target);
  const hasTarget = Number.isFinite(target) && target !== 0;
  const pct = hasTarget ? Math.min(100, Math.max(0, (value / target) * 100)) : 0;

  const change = (next) => {
    const rounded = Math.round(next * 1e6) / 1e6;
    const history = [{ t: Date.now(), v: rounded }, ...(data.history || [])].slice(0, 20);
    onChange({ value: rounded, history });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600 transition hover:bg-rose-200 active:scale-95 dark:bg-rose-500/15 dark:text-rose-400" onClick={() => change(value - step)} aria-label="Decrease">
          <Minus size={20} />
        </button>
        <div className="w-40 text-center">
          <input
            type="number"
            step="any"
            className="w-full bg-transparent text-center text-4xl font-bold outline-none"
            value={data.value}
            onChange={(e) => onChange({ value: e.target.value })}
            onBlur={(e) => change(parseFloat(e.target.value) || 0)}
          />
          {data.unit && <div className="text-xs text-slate-500">{data.unit}</div>}
        </div>
        <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 transition hover:bg-emerald-200 active:scale-95 dark:bg-emerald-500/15 dark:text-emerald-400" onClick={() => change(value + step)} aria-label="Increase">
          <Plus size={20} />
        </button>
        <button className="icon-btn" onClick={() => change(0)} title="Reset to 0"><RotateCcw size={15} /></button>
      </div>

      {hasTarget && (
        <div>
          <div className="mb-1 flex justify-between text-xs text-slate-500"><span>Progress</span><span>{pct.toFixed(0)}% of {target}</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-full rounded-full bg-brand-500 transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <div><label className="label">Step</label><input type="number" step="any" className="input" value={data.step} onChange={(e) => onChange({ step: e.target.value })} /></div>
        <div><label className="label">Target</label><input type="number" step="any" className="input" value={data.target} onChange={(e) => onChange({ target: e.target.value })} placeholder="optional" /></div>
        <div><label className="label">Unit</label><input className="input" value={data.unit} onChange={(e) => onChange({ unit: e.target.value })} placeholder="e.g. trades" /></div>
      </div>

      {data.history?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 text-xs text-slate-500">
          <span>Recent:</span>
          {data.history.slice(0, 8).map((h) => (
            <span key={h.t} className="chip bg-slate-100 dark:bg-slate-800" title={new Date(h.t).toLocaleString()}>{h.v}</span>
          ))}
        </div>
      )}
    </div>
  );
}
