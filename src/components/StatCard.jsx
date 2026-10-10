export default function StatCard({ label, value, sub, icon: Icon, tone = 'default' }) {
  const tones = {
    default: 'bg-brand-100 text-brand-600 dark:bg-brand-600/20 dark:text-brand-400',
    green: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    red: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
  };
  const valueTone = { green: 'text-emerald-500', red: 'text-rose-500' }[tone] || '';
  return (
    <div className="card flex items-center gap-4 p-4 transition hover:shadow-md">
      {Icon && <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}><Icon size={20} /></div>}
      <div className="min-w-0">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
        <div className={`truncate text-xl font-bold ${valueTone}`}>{value}</div>
        {sub && <div className="truncate text-xs text-slate-500 dark:text-slate-400">{sub}</div>}
      </div>
    </div>
  );
}
