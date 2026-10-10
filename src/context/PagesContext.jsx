import { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { LS_KEYS, uid } from '../utils/storage';
import { db } from '../db/db';

const PagesContext = createContext(null);

export function PagesProvider({ children }) {
  const [pages, setPages] = useLocalStorage(LS_KEYS.pages, []);

  const addPage = (name = 'Untitled', icon = '📄') => {
    const page = { id: uid(), name, icon, blocks: [] };
    setPages((p) => [...p, page]);
    return page;
  };

  const updatePage = (id, patch) =>
    setPages((p) => p.map((pg) => (pg.id === id ? { ...pg, ...(typeof patch === 'function' ? patch(pg) : patch) } : pg)));

  const deletePage = async (id) => {
    const page = pages.find((p) => p.id === id);
    const imageIds = (page?.blocks || []).flatMap((b) => b.data?.imageIds || []);
    if (imageIds.length) await db.images.bulkDelete(imageIds);
    setPages((p) => p.filter((pg) => pg.id !== id));
  };

  const duplicatePage = async (id) => {
    const page = pages.find((p) => p.id === id);
    if (!page) return null;
    // Copy gallery images so the duplicate is independent of the original.
    const blocks = await Promise.all(
      page.blocks.map(async (b) => {
        const copy = { ...structuredClone(b), id: uid() };
        if (b.data?.imageIds?.length) {
          const imgs = (await db.images.bulkGet(b.data.imageIds)).filter(Boolean);
          copy.data.imageIds = await db.images.bulkAdd(
            imgs.map(({ id: _id, ...rest }) => rest),
            { allKeys: true },
          );
        }
        return copy;
      }),
    );
    const dup = { ...page, id: uid(), name: `${page.name} (copy)`, blocks };
    setPages((p) => {
      const i = p.findIndex((pg) => pg.id === id);
      const next = [...p];
      next.splice(i + 1, 0, dup);
      return next;
    });
    return dup;
  };

  return (
    <PagesContext.Provider value={{ pages, setPages, addPage, updatePage, deletePage, duplicatePage }}>
      {children}
    </PagesContext.Provider>
  );
}

export const usePages = () => useContext(PagesContext);
