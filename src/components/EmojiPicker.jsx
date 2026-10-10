import { useState } from 'react';

const EMOJIS = {
  Finance: ['📈', '📉', '💹', '💰', '💵', '💸', '🪙', '🏦', '💳', '🧾', '📊', '💎', '🐂', '🐻', '🏛️', '⚖️'],
  Work: ['📄', '📝', '📒', '📓', '📚', '🗂️', '📁', '📌', '📎', '🗓️', '⏰', '✅', '☑️', '🧠', '💡', '🔍'],
  Symbols: ['⭐', '🔥', '⚡', '🎯', '🚀', '🏆', '🎖️', '❤️', '💪', '🧘', '🛡️', '⚠️', '🔔', '🔒', '🌐', '🧭'],
  Misc: ['🏠', '🌱', '☕', '🍀', '🌙', '☀️', '🌈', '🎵', '🎮', '✈️', '🚗', '🍎', '🏋️', '🧩', '🛠️', '🗒️'],
};

export default function EmojiPicker({ value, onChange }) {
  const [tab, setTab] = useState('Finance');
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1">
        {Object.keys(EMOJIS).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`chip cursor-pointer ${tab === k ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
          >
            {k}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-8 gap-1">
        {EMOJIS[tab].map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => onChange(e)}
            className={`flex h-9 items-center justify-center rounded-lg text-xl transition hover:bg-slate-100 dark:hover:bg-slate-800 ${value === e ? 'bg-brand-100 ring-2 ring-brand-500 dark:bg-brand-600/30' : ''}`}
          >
            {e}
          </button>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs text-slate-500">Or type any emoji:</span>
        <input className="input w-20 text-center" maxLength={4} value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}
