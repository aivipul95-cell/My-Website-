import { useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { AlertTriangle, CheckCircle2, Download, Moon, Settings as SettingsIcon, Sun, Trash2, Upload } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useConfirm } from '../context/ConfirmContext';
import { db } from '../db/db';
import { clearAll, downloadBackup, importAll } from '../utils/backup';
import PageHeader from '../components/PageHeader';

const CURRENCIES = [
  ['₹', 'Indian Rupee'], ['$', 'US Dollar'], ['€', 'Euro'], ['£', 'British Pound'], ['¥', 'Japanese Yen'],
  ['A$', 'Australian Dollar'], ['C$', 'Canadian Dollar'], ['S$', 'Singapore Dollar'], ['AED ', 'UAE Dirham'], ['₿', 'Bitcoin'],
];

function Section({ title, desc, children }) {
  return (
    <section className="card p-5">
      <h2 className="font-semibold">{title}</h2>
      {desc && <p className="mb-4 mt-0.5 text-sm text-slate-500 dark:text-slate-400">{desc}</p>}
      {children}
    </section>
  );
}

export default function Settings() {
  const { theme, currency, update } = useSettings();
  const confirm = useConfirm();
  const fileRef = useRef(null);
  const [msg, setMsg] = useState(null);
  const counts = useLiveQuery(async () => ({ entries: await db.entries.count(), images: await db.images.count() }), []);
  const isPreset = CURRENCIES.some(([c]) => c === currency);

  const flash = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 4000); };

  const onImport = async (file) => {
    if (!file) return;
    try {
      const json = JSON.parse(await file.text());
      if (!(await confirm({ title: 'Restore backup', message: 'This will REPLACE all current data with the backup. Continue?', confirmText: 'Restore' }))) return;
      const r = await importAll(json);
      flash('ok', `Restored ${r.entries} journal entries and ${r.images} images.`);
    } catch (e) {
      flash('err', e.message || 'Import failed.');
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader icon={<SettingsIcon size={22} />} title="Settings" subtitle="Personalise the app and manage your data." />

      {msg && (
        <div className={`card flex items-center gap-2 p-3 text-sm ${msg.type === 'ok' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {msg.type === 'ok' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />} {msg.text}
        </div>
      )}

      <Section title="Theme" desc="Choose how the app looks.">
        <div className="grid max-w-md grid-cols-2 gap-3">
          {[['light', 'Light', Sun], ['dark', 'Dark', Moon]].map(([k, l, Icon]) => (
            <button
              key={k}
              onClick={() => update({ theme: k })}
              className={`flex items-center gap-3 rounded-xl border-2 p-4 text-sm font-medium transition ${theme === k ? 'border-brand-500 bg-brand-50 dark:bg-brand-600/10' : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'}`}
            >
              <Icon size={18} /> {l}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Currency" desc="Symbol used for all P&L and money values.">
        <div className="flex max-w-md flex-wrap items-center gap-3">
          <select className="input w-auto" value={isPreset ? currency : 'custom'} onChange={(e) => e.target.value !== 'custom' && update({ currency: e.target.value })}>
            {CURRENCIES.map(([c, n]) => <option key={c} value={c}>{c.trim()} — {n}</option>)}
            <option value="custom">Custom…</option>
          </select>
          <input className="input w-28" value={currency} maxLength={5} onChange={(e) => update({ currency: e.target.value })} title="Custom symbol" />
        </div>
      </Section>

      <Section title="Backup & Restore" desc="Export everything (journals, screenshots, tasks, pages, settings) as one JSON file, or restore from a backup.">
        <p className="mb-3 text-xs text-slate-500">Currently stored: {counts?.entries ?? 0} journal entries · {counts?.images ?? 0} images</p>
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={async () => { await downloadBackup(); flash('ok', 'Backup downloaded.'); }}><Download size={16} /> Export JSON</button>
          <button className="btn-outline" onClick={() => fileRef.current?.click()}><Upload size={16} /> Import JSON</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => { onImport(e.target.files[0]); e.target.value = ''; }} />
        </div>
      </Section>

      <Section title="Danger zone" desc="Permanently delete all data stored in this browser.">
        <button
          className="btn-danger"
          onClick={async () => {
            if (await confirm({ title: 'Clear all data', message: 'This permanently deletes ALL journals, screenshots, tasks, pages and settings. Export a backup first if you might need it.', confirmText: 'Delete everything' })) {
              await clearAll();
              flash('ok', 'All data cleared.');
            }
          }}
        >
          <Trash2 size={16} /> Clear all data
        </button>
      </Section>
    </div>
  );
}
