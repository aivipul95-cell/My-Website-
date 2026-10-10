import { useMemo, useState } from 'react';
import { CalendarDays, GripVertical, ListTodo, Pencil, Plus, Trash2 } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { LS_KEYS, uid } from '../utils/storage';
import { today } from '../utils/format';
import { useConfirm } from '../context/ConfirmContext';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import { SortableItem, SortableList } from '../components/Sortable';

const PRIORITIES = ['High', 'Medium', 'Low'];
const PRIORITY_RANK = { High: 0, Medium: 1, Low: 2 };
const PRIORITY_STYLE = {
  High: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  Low: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400',
};
const CATEGORIES = ['Trading', 'Research', 'Investment', 'Learning', 'Personal', 'Admin'];
const emptyTask = () => ({ title: '', description: '', priority: 'Medium', dueDate: '', category: '' });

function TaskForm({ open, onClose, onSave, initial, categories }) {
  const [form, setForm] = useState(emptyTask());
  const [lastOpen, setLastOpen] = useState(false);
  if (open && !lastOpen) { setForm({ ...emptyTask(), ...(initial || {}) }); setLastOpen(true); }
  if (!open && lastOpen) setLastOpen(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = (e) => {
    e?.preventDefault();
    if (!form.title.trim()) return;
    onSave({ ...form, title: form.title.trim() });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial?.id ? 'Edit task' : 'New task'}
      footer={<><button className="btn-ghost" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={submit} disabled={!form.title.trim()}>Save</button></>}
    >
      <form onSubmit={submit} className="space-y-3">
        <div><label className="label">Title *</label><input className="input" autoFocus value={form.title} onChange={set('title')} placeholder="Review weekly watchlist" /></div>
        <div><label className="label">Description</label><textarea className="input min-h-[80px]" value={form.description} onChange={set('description')} /></div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="label">Priority</label>
            <select className="input" value={form.priority} onChange={set('priority')}>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select>
          </div>
          <div><label className="label">Due date</label><input type="date" className="input" value={form.dueDate} onChange={set('dueDate')} /></div>
          <div>
            <label className="label">Category</label>
            <input className="input" list="task-cats" value={form.category} onChange={set('category')} placeholder="Trading" />
            <datalist id="task-cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default function Tasks() {
  const [tasks, setTasks] = useLocalStorage(LS_KEYS.tasks, []);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('manual');
  const [category, setCategory] = useState('');
  const [modal, setModal] = useState(null);
  const confirm = useConfirm();

  const pending = tasks.filter((t) => !t.done).length;
  const categories = useMemo(() => [...new Set([...CATEGORIES, ...tasks.map((t) => t.category).filter(Boolean)])], [tasks]);
  const usedCategories = useMemo(() => [...new Set(tasks.map((t) => t.category).filter(Boolean))].sort(), [tasks]);

  const visible = useMemo(() => {
    let list = tasks.filter((t) => (filter === 'all' ? true : filter === 'pending' ? !t.done : t.done));
    if (category) list = list.filter((t) => t.category === category);
    if (sort === 'priority') list = [...list].sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
    if (sort === 'date') list = [...list].sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'));
    return list;
  }, [tasks, filter, sort, category]);

  const canDrag = sort === 'manual';

  const save = (data) => {
    if (data.id) setTasks((ts) => ts.map((t) => (t.id === data.id ? { ...t, ...data } : t)));
    else setTasks((ts) => [{ ...data, id: uid(), done: false, createdAt: Date.now() }, ...ts]);
  };
  const toggle = (id) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done, completedAt: !t.done ? Date.now() : null } : t)));
  const remove = async (t) => {
    if (await confirm({ title: 'Delete task', message: `Delete "${t.title}"?` })) setTasks((ts) => ts.filter((x) => x.id !== t.id));
  };

  // Reorder only the visible subset, keeping hidden tasks in their slots.
  const reorder = (newVisible) => {
    const visibleIds = new Set(newVisible.map((t) => t.id));
    let i = 0;
    setTasks(tasks.map((t) => (visibleIds.has(t.id) ? newVisible[i++] : t)));
  };

  const clearCompleted = async () => {
    if (await confirm({ title: 'Clear completed', message: 'Remove all completed tasks?', confirmText: 'Clear' })) setTasks((ts) => ts.filter((t) => !t.done));
  };

  const isOverdue = (t) => !t.done && t.dueDate && t.dueDate < today();

  return (
    <div>
      <PageHeader
        icon={<ListTodo size={22} />}
        title="Pending Tasks"
        subtitle={`${pending} pending · ${tasks.length - pending} completed`}
        actions={<button className="btn-primary" onClick={() => setModal({})}><Plus size={16} /> New task</button>}
      />

      <div className="card mb-4 flex flex-wrap items-center gap-2 p-3">
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          {[['all', 'All', tasks.length], ['pending', 'Pending', pending], ['completed', 'Completed', tasks.length - pending]].map(([k, l, n]) => (
            <button key={k} onClick={() => setFilter(k)} className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${filter === k ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-900 dark:text-brand-400' : 'text-slate-500'}`}>
              {l} <span className="ml-1 text-xs opacity-70">{n}</span>
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <select className="input w-auto" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {usedCategories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="input w-auto" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="manual">Sort: Manual (drag)</option>
          <option value="priority">Sort: Priority</option>
          <option value="date">Sort: Due date</option>
        </select>
        {tasks.some((t) => t.done) && <button className="btn-ghost" onClick={clearCompleted}>Clear completed</button>}
      </div>

      {visible.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <ListTodo size={36} className="text-slate-300 dark:text-slate-600" />
          <p className="text-slate-500">{tasks.length ? 'Nothing here.' : 'No tasks yet — add one to get started.'}</p>
        </div>
      ) : (
        <SortableList items={visible} onReorder={reorder}>
          <div className="space-y-2">
            {visible.map((t) => (
              <SortableItem key={t.id} id={t.id}>
                {({ handleProps }) => (
                  <div className={`card group flex items-start gap-3 p-3 transition ${t.done ? 'opacity-60' : ''}`}>
                    <button
                      {...(canDrag ? handleProps : {})}
                      className={`mt-0.5 touch-none text-slate-300 dark:text-slate-600 ${canDrag ? 'cursor-grab hover:text-slate-500' : 'cursor-not-allowed opacity-40'}`}
                      title={canDrag ? 'Drag to reorder' : 'Switch to manual sort to reorder'}
                      aria-label="Drag handle"
                    >
                      <GripVertical size={18} />
                    </button>
                    <input type="checkbox" checked={!!t.done} onChange={() => toggle(t.id)} className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-brand-600" />
                    <div className="min-w-0 flex-1">
                      <div className={`font-medium ${t.done ? 'line-through' : ''}`}>{t.title}</div>
                      {t.description && <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-500 dark:text-slate-400">{t.description}</p>}
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className={`chip ${PRIORITY_STYLE[t.priority]}`}>{t.priority}</span>
                        {t.category && <span className="chip bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{t.category}</span>}
                        {t.dueDate && (
                          <span className={`inline-flex items-center gap-1 ${isOverdue(t) ? 'font-semibold text-rose-500' : 'text-slate-500'}`}>
                            <CalendarDays size={12} /> {t.dueDate}{isOverdue(t) && ' · overdue'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
                      <button className="icon-btn" onClick={() => setModal(t)} aria-label="Edit"><Pencil size={15} /></button>
                      <button className="icon-btn hover:!text-rose-500" onClick={() => remove(t)} aria-label="Delete"><Trash2 size={15} /></button>
                    </div>
                  </div>
                )}
              </SortableItem>
            ))}
          </div>
        </SortableList>
      )}

      <TaskForm open={!!modal} onClose={() => setModal(null)} onSave={save} initial={modal} categories={categories} />
    </div>
  );
}
