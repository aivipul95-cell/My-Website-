import { useEffect, useState } from 'react';
import Modal from './Modal';
import EmojiPicker from './EmojiPicker';

export default function PageFormModal({ open, onClose, onSave, initial, title = 'New page' }) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📄');

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? '');
      setIcon(initial?.icon ?? '📄');
    }
  }, [open, initial]);

  const submit = (e) => {
    e?.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), icon: icon || '📄' });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={!name.trim()}>Save</button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Page name</label>
          <div className="flex gap-2">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xl dark:bg-slate-800">{icon}</span>
            <input className="input" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Watchlist" />
          </div>
        </div>
        <div>
          <label className="label">Icon</label>
          <EmojiPicker value={icon} onChange={setIcon} />
        </div>
      </form>
    </Modal>
  );
}
