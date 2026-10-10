import { useState } from 'react';
import { GripVertical, Plus, X } from 'lucide-react';
import { uid } from '../../utils/storage';
import { SortableItem, SortableList } from '../Sortable';

export default function ChecklistBlock({ data, onChange }) {
  const items = data.items || [];
  const [draft, setDraft] = useState('');
  const setItems = (next) => onChange({ items: next });
  const done = items.filter((i) => i.done).length;

  const add = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setItems([...items, { id: uid(), text: draft.trim(), done: false }]);
    setDraft('');
  };

  return (
    <div>
      {items.length > 0 && (
        <div className="mb-3 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(done / items.length) * 100}%` }} />
          </div>
          <span className="text-xs text-slate-500">{done}/{items.length}</span>
        </div>
      )}
      <SortableList items={items} onReorder={setItems}>
        <div className="space-y-1">
          {items.map((item) => (
            <SortableItem key={item.id} id={item.id}>
              {({ handleProps }) => (
                <div className="group flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <span {...handleProps} className="cursor-grab touch-none text-slate-300 opacity-0 group-hover:opacity-100 dark:text-slate-600"><GripVertical size={14} /></span>
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => setItems(items.map((i) => (i.id === item.id ? { ...i, done: !i.done } : i)))}
                    className="h-4 w-4 cursor-pointer accent-brand-600"
                  />
                  <input
                    className={`flex-1 bg-transparent text-sm outline-none ${item.done ? 'text-slate-400 line-through' : ''}`}
                    value={item.text}
                    onChange={(e) => setItems(items.map((i) => (i.id === item.id ? { ...i, text: e.target.value } : i)))}
                  />
                  <button className="text-slate-400 opacity-0 hover:text-rose-500 group-hover:opacity-100 max-sm:opacity-100" onClick={() => setItems(items.filter((i) => i.id !== item.id))} aria-label="Remove">
                    <X size={14} />
                  </button>
                </div>
              )}
            </SortableItem>
          ))}
        </div>
      </SortableList>
      <form onSubmit={add} className="mt-2 flex gap-2">
        <input className="input" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add an item and press Enter" />
        <button className="btn-outline shrink-0" type="submit"><Plus size={16} /></button>
      </form>
    </div>
  );
}
