import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import { addImages } from '../db/db';
import { fileToDataUrl, imageFiles } from '../utils/image';

/**
 * Add images by drag & drop, file picker, or clipboard paste.
 * Images are saved to IndexedDB immediately; onAdded receives the new ids.
 * globalPaste: listen for paste anywhere on the page (use inside modals);
 * otherwise paste works when the dropzone is focused.
 */
export default function ImageDropzone({ owner, onAdded, globalPaste = false, compact = false }) {
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);
  const zoneRef = useRef(null);
  const onAddedRef = useRef(onAdded);
  onAddedRef.current = onAdded;

  const handleFiles = async (files) => {
    const list = imageFiles(files);
    if (!list.length) return;
    setBusy(true);
    try {
      const urls = await Promise.all(list.map((f) => fileToDataUrl(f)));
      const ids = await addImages(owner, urls);
      onAddedRef.current(ids);
    } finally {
      setBusy(false);
    }
  };
  const handleRef = useRef(handleFiles);
  handleRef.current = handleFiles;

  useEffect(() => {
    const target = globalPaste ? window : zoneRef.current;
    if (!target) return;
    const onPaste = (e) => {
      const files = Array.from(e.clipboardData?.items || [])
        .filter((i) => i.kind === 'file' && i.type.startsWith('image/'))
        .map((i) => i.getAsFile());
      if (files.length) {
        e.preventDefault();
        handleRef.current(files);
      }
    };
    target.addEventListener('paste', onPaste);
    return () => target.removeEventListener('paste', onPaste);
  }, [globalPaste]);

  return (
    <div
      ref={zoneRef}
      tabIndex={0}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); handleFiles(e.dataTransfer.files); }}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed text-center text-sm outline-none transition focus:border-brand-500
        ${compact ? 'p-3' : 'p-6'}
        ${over ? 'border-brand-500 bg-brand-50 dark:bg-brand-600/10' : 'border-slate-300 hover:border-brand-400 dark:border-slate-700'}`}
    >
      {busy ? <Loader2 className="animate-spin text-brand-500" size={22} /> : <ImagePlus className="text-slate-400" size={22} />}
      <span className="text-slate-600 dark:text-slate-300">
        <span className="font-medium text-brand-600 dark:text-brand-400">Click to upload</span>, drag & drop, or paste (Ctrl/⌘+V)
      </span>
      {!compact && <span className="text-xs text-slate-400">PNG, JPG, GIF, WebP — multiple allowed</span>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onClick={(e) => e.stopPropagation()}
        hidden
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
      />
    </div>
  );
}
