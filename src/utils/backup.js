import { db } from '../db/db';
import { LS_KEYS } from './storage';
import { notifyStorageChanged } from '../hooks/useLocalStorage';

const LS_EXPORT_KEYS = [LS_KEYS.settings, LS_KEYS.tasks, LS_KEYS.pages, LS_KEYS.risk];

export async function exportAll() {
  const local = {};
  for (const k of LS_EXPORT_KEYS) {
    const raw = localStorage.getItem(k);
    if (raw != null) local[k] = JSON.parse(raw);
  }
  return {
    app: 'trade-desk',
    version: 1,
    exportedAt: new Date().toISOString(),
    localStorage: local,
    entries: await db.entries.toArray(),
    images: await db.images.toArray(),
  };
}

export async function downloadBackup() {
  const data = await exportAll();
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `trade-desk-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return data;
}

/** Replace all data with the contents of a backup file. */
export async function importAll(json) {
  if (!json || json.app !== 'trade-desk' || !Array.isArray(json.entries)) {
    throw new Error('This file is not a valid Trade Desk backup.');
  }
  await db.transaction('rw', db.entries, db.images, async () => {
    await db.entries.clear();
    await db.images.clear();
    if (json.images?.length) await db.images.bulkPut(json.images);
    if (json.entries.length) await db.entries.bulkPut(json.entries);
  });
  for (const k of LS_EXPORT_KEYS) localStorage.removeItem(k);
  for (const [k, v] of Object.entries(json.localStorage || {})) {
    if (LS_EXPORT_KEYS.includes(k)) localStorage.setItem(k, JSON.stringify(v));
  }
  notifyStorageChanged();
  return { entries: json.entries.length, images: json.images?.length || 0 };
}

export async function clearAll() {
  await db.entries.clear();
  await db.images.clear();
  for (const k of [...LS_EXPORT_KEYS, LS_KEYS.sidebar]) localStorage.removeItem(k);
  notifyStorageChanged();
}
