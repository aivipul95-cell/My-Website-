import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  BookOpen, Calculator, Copy, GripVertical, ListTodo, MoreHorizontal, PanelLeftClose, PanelLeftOpen,
  Pencil, Plus, Settings, Trash2, TrendingUp, X,
} from 'lucide-react';
import { usePages } from '../context/PagesContext';
import { useConfirm } from '../context/ConfirmContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { LS_KEYS } from '../utils/storage';
import { SortableItem, SortableList } from './Sortable';
import PageFormModal from './PageFormModal';

const CORE = [
  { to: '/journals', label: 'Journals', icon: BookOpen },
  { to: '/tasks', label: 'Pending Tasks', icon: ListTodo, badge: 'tasks' },
  { to: '/risk', label: 'Risk Calculator', icon: Calculator },
];

const linkCls = (collapsed) => ({ isActive }) =>
  `group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
    collapsed ? 'justify-center' : ''
  } ${isActive ? 'bg-brand-600 text-white shadow-md shadow-brand-900/40' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`;

function PageMenu({ page, onRename, onClose }) {
  const { duplicatePage, deletePage } = usePages();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const item = 'flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm text-slate-200 hover:bg-slate-700';
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute right-1 top-9 z-40 w-40 rounded-lg border border-slate-700 bg-slate-800 p-1 shadow-xl">
        <button className={item} onClick={() => { onClose(); onRename(); }}><Pencil size={14} /> Rename</button>
        <button className={item} onClick={async () => { onClose(); const d = await duplicatePage(page.id); if (d) navigate(`/p/${d.id}`); }}>
          <Copy size={14} /> Duplicate
        </button>
        <button
          className={`${item} text-rose-400`}
          onClick={async () => {
            onClose();
            if (await confirm({ title: 'Delete page', message: `Delete "${page.name}" and all its content?` })) {
              await deletePage(page.id);
              navigate('/journals');
            }
          }}
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </>
  );
}

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const [collapsed, setCollapsed] = useLocalStorage(LS_KEYS.sidebar, false);
  const [tasks] = useLocalStorage(LS_KEYS.tasks, []);
  const { pages, setPages, addPage, updatePage } = usePages();
  const [menuFor, setMenuFor] = useState(null);
  const [modal, setModal] = useState(null); // { mode: 'add' } | { mode: 'edit', page }
  const navigate = useNavigate();
  const pendingCount = tasks.filter((t) => !t.done).length;
  // On mobile the drawer is always expanded.
  const isCollapsed = collapsed && !mobileOpen;

  const onNav = () => onMobileClose?.();

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onMobileClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-800 bg-slate-900 text-slate-100 transition-all duration-300
          ${isCollapsed ? 'w-[72px]' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:sticky lg:top-0 lg:h-screen lg:translate-x-0`}
      >
        <div className={`flex h-16 items-center gap-2 px-4 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600"><TrendingUp size={18} /></span>
              <span className="text-lg font-bold tracking-tight">Trade Desk</span>
            </div>
          )}
          <button className="icon-btn hidden text-slate-400 hover:bg-slate-800 lg:inline-flex" onClick={() => setCollapsed((c) => !c)} aria-label="Toggle sidebar">
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
          <button className="icon-btn text-slate-400 hover:bg-slate-800 lg:hidden" onClick={onMobileClose} aria-label="Close menu"><X size={18} /></button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3 pb-3">
          {CORE.map(({ to, label, icon: Icon, badge }) => (
            <NavLink key={to} to={to} className={linkCls(isCollapsed)} onClick={onNav} title={isCollapsed ? label : undefined}>
              <span className="relative">
                <Icon size={18} />
                {badge && isCollapsed && pendingCount > 0 && (
                  <span className="absolute -right-2 -top-2 h-4 min-w-4 rounded-full bg-rose-500 px-1 text-[10px] leading-4">{pendingCount}</span>
                )}
              </span>
              {!isCollapsed && <span className="flex-1 truncate">{label}</span>}
              {badge && !isCollapsed && pendingCount > 0 && (
                <span className="rounded-full bg-rose-500/90 px-2 text-xs text-white">{pendingCount}</span>
              )}
            </NavLink>
          ))}

          <div className={`pb-1 pt-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 ${isCollapsed ? 'text-center' : 'px-3'}`}>
            {isCollapsed ? '•••' : 'My Pages'}
          </div>

          <SortableList items={pages} onReorder={setPages}>
            {pages.map((page) => (
              <SortableItem key={page.id} id={page.id}>
                {({ handleProps }) => (
                  <div className="group relative">
                    <NavLink to={`/p/${page.id}`} className={linkCls(isCollapsed)} onClick={onNav} title={isCollapsed ? page.name : undefined}>
                      {!isCollapsed && (
                        <span {...handleProps} className="-ml-2 cursor-grab touch-none text-slate-500 opacity-0 transition group-hover:opacity-100" onClick={(e) => e.preventDefault()}>
                          <GripVertical size={14} />
                        </span>
                      )}
                      <span className="text-base leading-none">{page.icon}</span>
                      {!isCollapsed && <span className="flex-1 truncate">{page.name}</span>}
                    </NavLink>
                    {!isCollapsed && (
                      <button
                        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 opacity-0 transition hover:bg-slate-700 group-hover:opacity-100 max-lg:opacity-100"
                        onClick={() => setMenuFor(menuFor === page.id ? null : page.id)}
                        aria-label="Page options"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    )}
                    {menuFor === page.id && (
                      <PageMenu page={page} onClose={() => setMenuFor(null)} onRename={() => setModal({ mode: 'edit', page })} />
                    )}
                  </div>
                )}
              </SortableItem>
            ))}
          </SortableList>

          <button
            onClick={() => setModal({ mode: 'add' })}
            className={`flex w-full items-center gap-3 rounded-xl border border-dashed border-slate-700 px-3 py-2 text-sm text-slate-400 transition hover:border-brand-500 hover:text-brand-400 ${isCollapsed ? 'justify-center' : ''}`}
            title="Add page"
          >
            <Plus size={18} />
            {!isCollapsed && 'Add Page'}
          </button>
        </nav>

        <div className="border-t border-slate-800 p-3">
          <NavLink to="/settings" className={linkCls(isCollapsed)} onClick={onNav} title={isCollapsed ? 'Settings' : undefined}>
            <Settings size={18} />
            {!isCollapsed && 'Settings'}
          </NavLink>
        </div>
      </aside>

      <PageFormModal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'edit' ? 'Edit page' : 'New page'}
        initial={modal?.page}
        onSave={({ name, icon }) => {
          if (modal.mode === 'edit') updatePage(modal.page.id, { name, icon });
          else {
            const p = addPage(name, icon);
            navigate(`/p/${p.id}`);
            onNav();
          }
        }}
      />
    </>
  );
}
