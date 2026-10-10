import { Plus, X } from 'lucide-react';
import { uid } from '../../utils/storage';

export const defaultTable = () => {
  const cols = [{ id: uid(), name: 'Column 1' }, { id: uid(), name: 'Column 2' }, { id: uid(), name: 'Column 3' }];
  return { columns: cols, rows: [{ id: uid(), cells: {} }, { id: uid(), cells: {} }] };
};

export default function TableBlock({ data, onChange }) {
  const columns = data.columns || [];
  const rows = data.rows || [];

  const setCell = (rowId, colId, value) =>
    onChange({ rows: rows.map((r) => (r.id === rowId ? { ...r, cells: { ...r.cells, [colId]: value } } : r)) });
  const renameCol = (colId, name) => onChange({ columns: columns.map((c) => (c.id === colId ? { ...c, name } : c)) });
  const addCol = () => onChange({ columns: [...columns, { id: uid(), name: `Column ${columns.length + 1}` }] });
  const removeCol = (colId) =>
    onChange({
      columns: columns.filter((c) => c.id !== colId),
      rows: rows.map((r) => { const { [colId]: _x, ...cells } = r.cells; return { ...r, cells }; }),
    });
  const addRow = () => onChange({ rows: [...rows, { id: uid(), cells: {} }] });
  const removeRow = (rowId) => onChange({ rows: rows.filter((r) => r.id !== rowId) });

  const cellCls = 'w-full min-w-[110px] bg-transparent px-3 py-2 text-sm outline-none focus:bg-brand-50 dark:focus:bg-brand-600/10';

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/60">
            <tr>
              {columns.map((c) => (
                <th key={c.id} className="group border-b border-r border-slate-200 p-0 dark:border-slate-800">
                  <div className="flex items-center">
                    <input className={`${cellCls} font-semibold`} value={c.name} onChange={(e) => renameCol(c.id, e.target.value)} />
                    {columns.length > 1 && (
                      <button className="mr-1 text-slate-400 opacity-0 hover:text-rose-500 group-hover:opacity-100 max-sm:opacity-100" onClick={() => removeCol(c.id)} aria-label="Remove column"><X size={13} /></button>
                    )}
                  </div>
                </th>
              ))}
              <th className="w-10 border-b border-slate-200 dark:border-slate-800">
                <button className="icon-btn" onClick={addCol} title="Add column"><Plus size={15} /></button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="group">
                {columns.map((c) => (
                  <td key={c.id} className="border-b border-r border-slate-200 p-0 dark:border-slate-800">
                    <input className={cellCls} value={r.cells[c.id] ?? ''} onChange={(e) => setCell(r.id, c.id, e.target.value)} />
                  </td>
                ))}
                <td className="border-b border-slate-200 text-center dark:border-slate-800">
                  <button className="text-slate-400 opacity-0 hover:text-rose-500 group-hover:opacity-100 max-sm:opacity-100" onClick={() => removeRow(r.id)} aria-label="Remove row"><X size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="btn-ghost mt-2 text-xs" onClick={addRow}><Plus size={14} /> Add row</button>
    </div>
  );
}
