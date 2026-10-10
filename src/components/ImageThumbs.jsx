import { useState } from 'react';
import { X } from 'lucide-react';
import { useImages } from '../hooks/useImages';
import Lightbox from './Lightbox';

/** Thumbnail strip for stored images with click-to-zoom lightbox. */
export default function ImageThumbs({ ids = [], onRemove, size = 'md', max }) {
  const images = useImages(ids);
  const [index, setIndex] = useState(null);
  if (!images.length) return null;
  const dims = { sm: 'h-10 w-10', md: 'h-20 w-20', lg: 'h-32 w-full' }[size];
  const shown = max ? images.slice(0, max) : images;
  const extra = images.length - shown.length;

  return (
    <>
      <div className={size === 'lg' ? 'grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4' : 'flex flex-wrap gap-2'}>
        {shown.map((img, i) => (
          <div key={img.id} className={`group relative ${dims} overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700`}>
            <img src={img.data} alt="" loading="lazy" onClick={() => setIndex(i)} className="h-full w-full cursor-zoom-in object-cover transition group-hover:scale-105" />
            {extra > 0 && i === shown.length - 1 && (
              <span onClick={() => setIndex(i)} className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/60 text-xs font-semibold text-white">+{extra}</span>
            )}
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(img.id)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition group-hover:opacity-100 max-sm:opacity-100"
                aria-label="Remove image"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
      <Lightbox images={images} index={index} onClose={() => setIndex(null)} onIndex={setIndex} />
    </>
  );
}
