import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Award, BookOpen, Image as ImageIcon, Pencil, Plus, Scale, Search, Trash2, TrendingUp, Wallet, X,
} from 'lucide-react';
import { db, deleteImages } from '../db/db';
import { calcPnL, summarize } from '../utils/calc';
import { fmtMoney, fmtNum, fmtPct, pnlColor } from '../utils/format';
import { JOURNALS } from '../utils/journal';
import { useSettings } from '../context/SettingsContext';
import { useConfirm } from '../context/ConfirmContext';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import JournalForm from '../components/journal/JournalForm';
import EntryDetail from '../components/journal/EntryDetail';
import ImageThumbs from '../components/ImageThumbs';

const emptyFilters = { q: '', from: '', to: '', symbol: '', outcome: 'all' };

export default function Journals() {
  const [params, setParams] = useSearchParams();
  const tab = JOURNALS.some((j) => j.id === params.get('tab')) ? params.get('tab') : 'trading';
  const { currency } = useSettings();
  const confirm = useConfirm();
  const location = useLocation();
  const navigate = useNavigate();

  const [filters, setFilters] = useState(emptyFilters);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);

  const all = useLiveQuery(() => db.entries.where('journal').equals(tab).toArray(), [tab]);
  const entries = useMemo(() => all ?? [], [all]);

  // Pre-fill from the risk calculator ("Save to Journal").
  useEffect(() => {
    const prefill = location.state?.prefill;
    if (prefill) {
      setEditing({ ...prefill, journal: prefill.journal || tab });
      setFormOpen(true);
      navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    }
  }, [location.state, location.pathname, location.search, navigate, tab]);

  useEffect(() => setFilters(emptyFilters), [tab]);

  const symbols = useMemo(() => [...new Set(entries.map((e) => e.symbol))].sort(), [entries]);
  const strategies = useMemo(() => [...new Set(entries.map((e) => e.strategy).filter(Boolean))], [entries]);

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return entries
      .filter((e) => {
        if (filters.from && e.date < filters.from) return false;
        if (filters.to && e.date > filters.to) return false;
        if (filters.symbol && e.symbol !== filters.symbol) return false;
        if (filters.outcome !== 'all') {
          const { pnl } = calcPnL(e);
          if (filters.outcome === 'win' && !(pnl > 0)) return false;
          if (filters.outcome === 'loss' && !(pnl < 0)) return false;
          if (filters.outcome === 'open' && pnl != null) return false;
        }
        if (q) {
          const hay = [e.symbol, e.strategy, e.notes, e.thesis, ...(e.emotions || [])].join(' ').toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.createdAt - a.createdAt);
  }, [entries, filters]);

  const stats = summarize(filtered);
  const hasFilters = JSON.stringify(filters) !== JSON.stringify(emptyFilters);

  const save = async (data) => {
    const now = Date.now();
    if (data.id) await db.entries.put({ ...data, updatedAt: now });
    else {
      const { id: _omit, ...rest } = data;
      await db.entries.add({ ...rest, journal: rest.journal || tab, createdAt: now, updatedAt: now });
    }
  };

  const remove = async (entry) => {
    if (!(await confirm({ title: 'Delete entry', message: `Delete ${entry.symbol} (${entry.date}) and its screenshots?` }))) return;
    await deleteImages(entry.imageIds);
    await db.entries.delete(entry.id);
  };

  const openNew = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (e) => { setViewing(null); setEditing(e); setFormOpen(true); };
  const f = (k) => (ev) => setFilters((s) => ({ ...s, [k]: ev.target.value }));
  const isInv = tab === 'investment';

  return (
    <div>
      <PageHeader
        icon={<BookOpen size={22} />}
        title="Journals"
        subtitle="Log every trade, learn from every lesson."
        actions={<button className="btn-primary" onClick={openNew}><Plus size={16} /> New entry</button>}
      />

      <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl bg-slate-200/60 p-1 dark:bg-slate-800/60">
        {JOURNALS.map((j) => (
          <button
            key={j.id}
            onClick={() => setParams({ tab: j.id })}
            className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === j.id ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-900 dark:text-brand-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span className="sm:hidden">{j.short}</span>
            <span className="hidden sm:inline">{j.label}</span>
          </button>
        ))}
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total P&L" value={fmtMoney(stats.totalPnL, currency)} icon={Wallet} tone={stats.totalPnL >= 0 ? 'green' : 'red'} sub={`${stats.closedTrades} closed`} />
        <StatCard label="Win rate" value={`${stats.winRate.toFixed(1)}%`} icon={Award} tone="amber" sub={`${stats.wins}W · ${stats.losses}L`} />
        <StatCard
          label="Avg win / Avg loss"
          value={<><span className="text-emerald-500">{fmtMoney(stats.avgWin, currency, 0)}</span> <span className="text-slate-400">/</span> <span className="text-rose-500">{fmtMoney(stats.avgLoss, currency, 0)}</span></>}
          icon={Scale}
          sub={stats.avgLoss ? `Payoff ratio ${(stats.avgWin / Math.abs(stats.avgLoss)).toFixed(2)}` : 'Payoff ratio —'}
        />
        <StatCard label="Total trades" value={stats.totalTrades} icon={TrendingUp} sub={`${stats.totalTrades - stats.closedTrades} open`} />
      </div>

      <div className="card mb-4 grid grid-cols-2 gap-2 p-3 md:grid-cols-6">
        <div className="relative col-span-2">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search symbol, setup, notes, tags…" value={filters.q} onChange={f('q')} />
        </div>
        <input type="date" className="input" value={filters.from} onChange={f('from')} title="From date" />
        <input type="date" className="input" value={filters.to} onChange={f('to')} title="To date" />
        <select className="input" value={filters.symbol} onChange={f('symbol')}>
          <option value="">All symbols</option>
          {symbols.map((s) => <option key={s}>{s}</option>)}
        </select>
        <div className="flex gap-2">
          <select className="input" value={filters.outcome} onChange={f('outcome')}>
            <option value="all">All results</option>
            <option value="win">Wins</option>
            <option value="loss">Losses</option>
            <option value="open">Open</option>
          </select>
          {hasFilters && <button className="icon-btn h-auto shrink-0" onClick={() => setFilters(emptyFilters)} title="Clear filters"><X size={16} /></button>}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-3 p-12 text-center">
          <BookOpen size={36} className="text-slate-300 dark:text-slate-600" />
          <p className="text-slate-500">{entries.length ? 'No entries match your filters.' : 'No entries yet. Log your first one!'}</p>
          {!entries.length && <button className="btn-primary" onClick={openNew}><Plus size={16} /> New entry</button>}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  {['Date', 'Symbol', 'Side', 'Entry', 'Exit', 'Qty', 'SL', isInv ? 'Target price' : 'Target', 'P&L', 'P&L %', 'Setup', 'Shots', ''].map((h) => (
                    <th key={h} className="px-3 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((e) => {
                  const { pnl, pnlPct } = calcPnL(e);
                  return (
                    <tr key={e.id} onClick={() => setViewing(e)} className="cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="whitespace-nowrap px-3 py-2.5 text-slate-500">{e.date}</td>
                      <td className="px-3 py-2.5 font-semibold">{e.symbol}</td>
                      <td className="px-3 py-2.5">
                        <span className={`chip ${e.side === 'Long' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400'}`}>{e.side}</span>
                      </td>
                      <td className="px-3 py-2.5">{fmtNum(parseFloat(e.entry))}</td>
                      <td className="px-3 py-2.5">{e.exit === '' || e.exit == null ? <span className="chip bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400">Open</span> : fmtNum(parseFloat(e.exit))}</td>
                      <td className="px-3 py-2.5">{fmtNum(parseFloat(e.quantity), 4)}</td>
                      <td className="px-3 py-2.5 text-slate-500">{e.stopLoss ? fmtNum(parseFloat(e.stopLoss)) : '—'}</td>
                      <td className="px-3 py-2.5 text-slate-500">{e.target ? fmtNum(parseFloat(e.target)) : '—'}</td>
                      <td className={`whitespace-nowrap px-3 py-2.5 font-semibold ${pnlColor(pnl)}`}>{fmtMoney(pnl, currency)}</td>
                      <td className={`px-3 py-2.5 ${pnlColor(pnlPct)}`}>{fmtPct(pnlPct)}</td>
                      <td className="max-w-[140px] truncate px-3 py-2.5 text-slate-500">{e.strategy || '—'}</td>
                      <td className="px-3 py-2.5" onClick={(ev) => ev.stopPropagation()}>
                        {e.imageIds?.length ? <ImageThumbs ids={e.imageIds} size="sm" max={2} /> : <ImageIcon size={14} className="text-slate-300 dark:text-slate-600" />}
                      </td>
                      <td className="px-3 py-2.5" onClick={(ev) => ev.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          <button className="icon-btn" onClick={() => openEdit(e)} aria-label="Edit"><Pencil size={15} /></button>
                          <button className="icon-btn hover:!text-rose-500" onClick={() => remove(e)} aria-label="Delete"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <JournalForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={save}
        initial={editing}
        journal={editing?.journal || tab}
        strategies={strategies}
      />
      <EntryDetail entry={viewing} onClose={() => setViewing(null)} onEdit={() => openEdit(viewing)} />
    </div>
  );
}
