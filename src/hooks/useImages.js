import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

/** Live-load image records for the given ids, preserving order. */
export function useImages(ids = []) {
  const key = ids.join(',');
  return (
    useLiveQuery(async () => {
      if (!ids.length) return [];
      const rows = await db.images.bulkGet(ids);
      return rows.filter(Boolean);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]) ?? []
  );
}
