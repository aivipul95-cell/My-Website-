import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, ChevronRight, Copy, GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { usePages } from '../context/PagesContext';
import { useConfirm } from '../context/ConfirmContext';
import { deleteImages } from '../db/db';
import { uid } from '../utils/storage';
import { BLOCK_TYPES } from '../components/blocks';
import { SortableItem, SortableList } from '../components/Sortable';
import PageFormModal from '../components/PageFormModal';

function AddBlockMenu({ onAdd, align = 'left' }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button className="btn-primary" onClick={() => setOpen((o) => !o)}><Plus size={16} /> Add block</button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className={`card absolute z-40 mt-2 w-56 p-1.5 shadow-xl ${align === 'right' ? 'right-0' : 'left-0'}`}>
            {Object.entries(BLOCK_TYPES).map(([type, { label, icon: Icon }]) => (
              <button
                key={type}
                onClick={() => { onAdd(type); setOpen(false); }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-600/20 dark:text-brand-400"><Icon size={16} /></span>
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function CustomPage() {
  const { pageId } = useParams();
  const { pages, updatePage, deletePage, duplicatePage } = usePages();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const page = pages.find((p) => p.id === pageId);
  if (!page) return <Navigate to="/journals" replace />;

  const setBlocks = (fn) => updatePage(page.id, (pg) => ({ blocks: fn(pg.blocks) }));
  const addBlock = (type) =>
    setBlocks((bs) => [...bs, { id: uid(), type, title: BLOCK_TYPES[type].label, data: BLOCK_TYPES[type].init(), collapsed: false }]);
  const patchBlock = (id, patch) => setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const patchData = (id, patch) => setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, data: { ...b.data, ...patch } } : b)));
  const removeBlock = async (block) => {
    if (!(await confirm({ title: 'Delete block', message: `Delete "${block.title}"?` }))) return;
    await deleteImages(block.data?.imageIds);
    setBlocks((bs) => bs.filter((b) => b.id !== block.id));
  };
  const duplicateBlock = (block) => {
    if (block.type === 'gallery') return; // images are owned by one block
    setBlocks((bs) => {
      const i = bs.findIndex((b) => b.id === block.id);
      const next = [...bs];
      next.splice(i + 1, 0, { ...structuredClone(block), id: uid(), title: `${block.title} (copy)` });
      return next;
    });
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button className="group flex items-center gap-3 text-left" onClick={() => setEditOpen(true)} title="Rename / change icon">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-2xl dark:bg-slate-800">{page.icon}</span>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              {page.name}
              <Pencil size={14} className="text-slate-400 opacity-0 transition group-hover:opacity-100" />
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{page.blocks.length} block{page.blocks.length === 1 ? '' : 's'}</p>
          </div>
        </button>
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost" onClick={async () => { const d = await duplicatePage(page.id); if (d) navigate(`/p/${d.id}`); }}><Copy size={16} /> Duplicate</button>
          <button
            className="btn-ghost hover:!text-rose-500"
            onClick={async () => {
              if (await confirm({ title: 'Delete page', message: `Delete "${page.name}" and all its content?` })) {
                await deletePage(page.id);
                navigate('/journals');
              }
            }}
          >
            <Trash2 size={16} /> Delete
          </button>
          <AddBlockMenu onAdd={addBlock} align="right" />
        </div>
      </div>

      {page.blocks.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 p-12 text-center">
          <span className="text-4xl">{page.icon}</span>
          <div>
            <p className="font-medium">This page is empty</p>
            <p className="text-sm text-slate-500">Add text, checklists, tables, image galleries or number trackers.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {Object.entries(BLOCK_TYPES).map(([type, { label, icon: Icon }]) => (
              <button key={type} className="btn-outline" onClick={() => addBlock(type)}><Icon size={16} /> {label}</button>
            ))}
          </div>
        </div>
      ) : (
        <SortableList items={page.blocks} onReorder={(blocks) => updatePage(page.id, { blocks })}>
          <div className="space-y-4">
            {page.blocks.map((block) => {
              const def = BLOCK_TYPES[block.type];
              if (!def) return null;
              const Block = def.component;
              const Icon = def.icon;
              return (
                <SortableItem key={block.id} id={block.id}>
                  {({ handleProps }) => (
                    <section className="card group">
                      <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                        <button {...handleProps} className="cursor-grab touch-none text-slate-300 hover:text-slate-500 dark:text-slate-600" aria-label="Drag block"><GripVertical size={16} /></button>
                        <button className="text-slate-400" onClick={() => patchBlock(block.id, { collapsed: !block.collapsed })} aria-label="Collapse">
                          {block.collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <Icon size={15} className="text-brand-500" />
                        <input
                          className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none"
                          value={block.title}
                          onChange={(e) => patchBlock(block.id, { title: e.target.value })}
                        />
                        <div className="flex gap-0.5 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
                          {block.type !== 'gallery' && <button className="icon-btn" onClick={() => duplicateBlock(block)} title="Duplicate block"><Copy size={14} /></button>}
                          <button className="icon-btn hover:!text-rose-500" onClick={() => removeBlock(block)} title="Delete block"><Trash2 size={14} /></button>
                        </div>
                      </div>
                      {!block.collapsed && (
                        <div className="p-4">
                          <Block data={block.data} onChange={(patch) => patchData(block.id, patch)} />
                        </div>
                      )}
                    </section>
                  )}
                </SortableItem>
              );
            })}
          </div>
        </SortableList>
      )}

      {page.blocks.length > 0 && (
        <div className="mt-4 flex justify-center"><AddBlockMenu onAdd={addBlock} /></div>
      )}

      <PageFormModal open={editOpen} onClose={() => setEditOpen(false)} title="Edit page" initial={page} onSave={(v) => updatePage(page.id, v)} />
    </div>
  );
}
