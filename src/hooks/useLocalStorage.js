import { useEffect, useRef, useState } from 'react';
import { readLS } from '../utils/storage';

/**
 * State persisted in localStorage. All hook instances using the same key stay in sync
 * (same tab via a custom event, other tabs via the native `storage` event).
 */
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => readLS(key, initial));
  const lastRaw = useRef(null);

  useEffect(() => {
    const raw = JSON.stringify(value);
    if (raw === lastRaw.current) return;
    lastRaw.current = raw;
    try {
      if (localStorage.getItem(key) !== raw) {
        localStorage.setItem(key, raw);
        window.dispatchEvent(new CustomEvent('td-storage', { detail: { key } }));
      }
    } catch (e) {
      console.error('localStorage write failed', e);
    }
  }, [key, value]);

  useEffect(() => {
    const onChange = (e) => {
      const changedKey = e.type === 'storage' ? e.key : e.detail?.key;
      if (changedKey && changedKey !== key) return;
      const raw = localStorage.getItem(key);
      if (raw === lastRaw.current) return;
      lastRaw.current = raw;
      setValue(readLS(key, initial));
    };
    window.addEventListener('storage', onChange);
    window.addEventListener('td-storage', onChange);
    return () => {
      window.removeEventListener('storage', onChange);
      window.removeEventListener('td-storage', onChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, setValue];
}

/** Notify all hooks that localStorage changed externally (e.g. after a backup import). */
export const notifyStorageChanged = () => window.dispatchEvent(new CustomEvent('td-storage', { detail: {} }));
