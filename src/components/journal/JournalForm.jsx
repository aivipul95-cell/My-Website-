import { useEffect, useMemo, useRef, useState } from 'react';
import Modal from '../Modal';
import ImageDropzone from '../ImageDropzone';
import ImageThumbs from '../ImageThumbs';
import { deleteImages } from '../../db/db';
import { calcPnL } from '../../utils/calc';
import { fmtMoney, fmtPct, pnlColor, today } from '../../utils/format';
import { EMOTIONS, HOLDING_PERIODS, JOURNALS, STRATEGIES, emptyEntry } from '../../utils/journal';
import { useSettings } from '../../context/SettingsContext';

function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

/**
 * Add / edit a journal entry. Screenshots are written to IndexedDB as soon as they're added;
 * on cancel we delete the ones added in this session, on save we delete the ones removed.
 */
export default function JournalForm({ open, onClose, onSave, initial, journal, strategies = [] }) {
  const { currency } = useSettings();
  const [form, setForm] = useState(() => emptyEntry(journal, today()));
  const originalIds = useRef([]);
  const addedIds = useRef([]);

  useEffect(() => {
    if (!open) return;
    const base = { ...emptyEntry(journal, today()), ...(initial || {}) };
    setForm(base);
    originalIds.current = initial?.id ? [...(initial.imageIds || [])] : [];
    addedIds.current = [];
  }, [open, initial, journal]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }));
  const { pnl, pnlPct } = calcPnL(form);
  const isInvestment = form.journal === 'investment';
  const strategyOptions = useMemo(() => [...new Set([...STRATEGIES, ...strategies])], [strategies]);

  const cancel = async () => {
    await deleteImages(addedIds.current);
    onClose();
  };

  const submit = async (e) => {
    e?.preventDefault();
    if (!form.symbol.trim()) return;
    const removed = originalIds.current.filter((id) => !form.imageIds.includes(id));
    await deleteImages(removed);
    await onSave({ ...form, symbol: form.symbol.trim().toUpperCase() });
    addedIds.current = [];
    onClose();
  };

  const removeImage = async (id) => {
    setForm((f) => ({ ...f, imageIds: f.imageIds.filter((x) => x !== id) }));
    if (addedIds.current.includes(id)) {
      addedIds.current = addedIds.current.filter((x) => x !== id);
      await deleteImages([id]);
    }
  };

  const toggleEmotion = (tag) =>
    setForm((f) => ({ ...f, emotions: f.emotions.includes(tag) ? f.emotions.filter((t) => t !== tag) : [...f.emotions, tag] }));

  const jLabel = JOURNALS.find((j) => j.id === form.journal)?.label;

  return (
    <Modal
      open={open}
      onClose={cancel}
      size="lg"
      title={`${initial?.id ? 'Edit' : 'New'} entry — ${jLabel}`}
      footer={
        <>
          <button className="btn-ghost" onClick={cancel}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={!form.symbol.trim()}>Save entry</button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Field label="Date"><input type="date" className="input" value={form.date} onChange={set('date')} /></Field>
          <Field label="Symbol / Stock *"><input className="input uppercase" value={form.symbol} onChange={set('symbol')} placeholder="RELIANCE" autoFocus /></Field>
          <Field label="Side" className="col-span-2">
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              {['Long', 'Short'].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => set('side')(s)}
                  className={`rounded-md py-1.5 text-sm font-medium transition ${
                    form.side === s ? (s === 'Long' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white') : 'text-slate-500'
                  }`}
                >
                  {s === 'Long' ? 'Buy / Long' : 'Sell / Short'}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Entry price"><input type="number" step="any" className="input" value={form.entry} onChange={set('entry')} /></Field>
          <Field label="Exit price"><input type="number" step="any" className="input" value={form.exit} onChange={set('exit')} placeholder="Open" /></Field>
          <Field label="Quantity"><input type="number" step="any" className="input" value={form.quantity} onChange={set('quantity')} /></Field>
          <Field label="Stop loss"><input type="number" step="any" className="input" value={form.stopLoss} onChange={set('stopLoss')} /></Field>
          <Field label={isInvestment ? 'Target price' : 'Target'}><input type="number" step="any" className="input" value={form.target} onChange={set('target')} /></Field>
          <div className="col-span-2 flex items-end gap-4 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60 sm:col-span-3">
            <div>
              <div className="label">P&L</div>
              <div className={`text-lg font-semibold ${pnlColor(pnl)}`}>{fmtMoney(pnl, currency)}</div>
            </div>
            <div>
              <div className="label">P&L %</div>
              <div className={`text-lg font-semibold ${pnlColor(pnlPct)}`}>{fmtPct(pnlPct)}</div>
            </div>
          </div>
        </div>

        {isInvestment && (
          <div className="grid gap-3 rounded-xl border border-brand-200 bg-brand-50/50 p-3 dark:border-brand-600/30 dark:bg-brand-600/5 sm:grid-cols-2">
            <Field label="Investment thesis" className="sm:col-span-2">
              <textarea className="input min-h-[70px]" value={form.thesis} onChange={set('thesis')} placeholder="Why are you investing in this business?" />
            </Field>
            <Field label="Holding period">
              <input className="input" list="holding-periods" value={form.holdingPeriod} onChange={set('holdingPeriod')} placeholder="e.g. 1–3 years" />
              <datalist id="holding-periods">{HOLDING_PERIODS.map((h) => <option key={h} value={h} />)}</datalist>
            </Field>
            <Field label="Review date"><input type="date" className="input" value={form.reviewDate} onChange={set('reviewDate')} /></Field>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Strategy / Setup">
            <input className="input" list="strategy-list" value={form.strategy} onChange={set('strategy')} placeholder="e.g. Breakout" />
            <datalist id="strategy-list">{strategyOptions.map((s) => <option key={s} value={s} />)}</datalist>
          </Field>
          <Field label="Emotion / Mistake tags">
            <div className="flex flex-wrap gap-1.5">
              {EMOTIONS.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => toggleEmotion(t)}
                  className={`chip cursor-pointer border transition ${
                    form.emotions.includes(t)
                      ? 'border-brand-500 bg-brand-600 text-white'
                      : 'border-slate-300 text-slate-600 hover:border-brand-400 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <Field label="Notes / Lesson learned">
          <textarea className="input min-h-[90px]" value={form.notes} onChange={set('notes')} placeholder="What went right, what went wrong, what will you do differently?" />
        </Field>

        <Field label={`Screenshots (${form.imageIds.length})`}>
          <div className="space-y-3">
            <ImageThumbs ids={form.imageIds} onRemove={removeImage} />
            <ImageDropzone
              owner="journal"
              globalPaste
              compact={form.imageIds.length > 0}
              onAdded={(ids) => {
                addedIds.current.push(...ids);
                setForm((f) => ({ ...f, imageIds: [...f.imageIds, ...ids] }));
              }}
            />
          </div>
        </Field>
      </form>
    </Modal>
  );
}
