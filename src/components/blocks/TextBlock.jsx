import { useEffect, useRef } from 'react';

export default function TextBlock({ data, onChange }) {
  const ref = useRef(null);
  // Auto-grow textarea.
  useEffect(() => {
    const el = ref.current;
    if (el) { el.style.height = 'auto'; el.style.height = `${Math.max(el.scrollHeight, 96)}px`; }
  }, [data.text]);
  return (
    <textarea
      ref={ref}
      className="w-full resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-slate-400"
      placeholder="Write notes, ideas, rules…"
      value={data.text || ''}
      onChange={(e) => onChange({ text: e.target.value })}
    />
  );
}
