import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Download, X, ZoomIn, ZoomOut } from 'lucide-react';

export default function Lightbox({ images, index, onClose, onIndex }) {
  const [zoom, setZoom] = useState(false);
  const open = index != null && images[index];

  useEffect(() => setZoom(false), [index]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onIndex((index + 1) % images.length);
      if (e.key === 'ArrowLeft') onIndex((index - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, index, images.length, onClose, onIndex]);

  if (!open) return null;
  const img = images[index];
  const btn = 'rounded-full bg-white/10 p-2 text-white backdrop-blur transition hover:bg-white/20';

  return createPortal(
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/90" onClick={onClose}>
      <div className="flex items-center justify-between p-3 text-sm text-white/80" onClick={(e) => e.stopPropagation()}>
        <span>{index + 1} / {images.length}</span>
        <div className="flex gap-2">
          <button className={btn} onClick={() => setZoom((z) => !z)} aria-label="Zoom">{zoom ? <ZoomOut size={18} /> : <ZoomIn size={18} />}</button>
          <a className={btn} href={img.data} download={`screenshot-${img.id}.png`} aria-label="Download"><Download size={18} /></a>
          <button className={btn} onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
      </div>
      <div className={`relative flex flex-1 items-center justify-center ${zoom ? 'overflow-auto' : 'overflow-hidden p-4'}`}>
        <img
          src={img.data}
          alt=""
          onClick={(e) => { e.stopPropagation(); setZoom((z) => !z); }}
          className={`select-none transition ${zoom ? 'max-w-none cursor-zoom-out' : 'max-h-full max-w-full cursor-zoom-in object-contain'}`}
        />
        {images.length > 1 && (
          <>
            <button className={`${btn} absolute left-3`} onClick={(e) => { e.stopPropagation(); onIndex((index - 1 + images.length) % images.length); }} aria-label="Previous">
              <ChevronLeft size={22} />
            </button>
            <button className={`${btn} absolute right-3`} onClick={(e) => { e.stopPropagation(); onIndex((index + 1) % images.length); }} aria-label="Next">
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
