import Dexie from 'dexie';

// IndexedDB stores journal entries and all images (screenshots, gallery images).
// Small config (tasks, pages, settings) lives in localStorage.
export const db = new Dexie('tradeDeskDB');

db.version(1).stores({
  entries: '++id, journal, date, symbol, createdAt',
  images: '++id, owner, createdAt',
});

export async function addImages(owner, dataUrls) {
  const now = Date.now();
  return db.images.bulkAdd(
    dataUrls.map((data, i) => ({ owner, data, createdAt: now + i })),
    { allKeys: true },
  );
}

export async function getImages(ids = []) {
  if (!ids.length) return [];
  const rows = await db.images.bulkGet(ids);
  return rows.filter(Boolean);
}

export async function deleteImages(ids = []) {
  if (ids.length) await db.images.bulkDelete(ids);
}
