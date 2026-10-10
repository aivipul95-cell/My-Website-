import Modal from '../Modal';
import ImageThumbs from '../ImageThumbs';
import { calcPnL } from '../../utils/calc';
import { fmtMoney, fmtNum, fmtPct, pnlColor } from '../../utils/format';
import { useSettings } from '../../context/SettingsContext';

const Row = ({ label, children }) => (
  <div>
    <div className="label">{label}</div>
    <div className="text-sm font-medium">{children || '—'}</div>
  </div>
);

export default function EntryDetail({ entry, onClose, onEdit }) {
  const { currency } = useSettings();
  if (!entry) return null;
  const { pnl, pnlPct } = calcPnL(entry);
  const inv = entry.journal === 'investment';
  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={`${entry.symbol} · ${entry.date}`}
      footer={<><button className="btn-ghost" onClick={onClose}>Close</button><button className="btn-primary" onClick={onEdit}>Edit</button></>}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Row label="Side"><span className={entry.side === 'Long' ? 'text-emerald-500' : 'text-rose-500'}>{entry.side}</span></Row>
          <Row label="Entry">{fmtNum(+entry.entry)}</Row>
          <Row label="Exit">{entry.exit === '' ? 'Open' : fmtNum(+entry.exit)}</Row>
          <Row label="Quantity">{fmtNum(+entry.quantity, 4)}</Row>
          <Row label="Stop loss">{entry.stopLoss && fmtNum(+entry.stopLoss)}</Row>
          <Row label={inv ? 'Target price' : 'Target'}>{entry.target && fmtNum(+entry.target)}</Row>
          <Row label="P&L"><span className={pnlColor(pnl)}>{fmtMoney(pnl, currency)}</span></Row>
          <Row label="P&L %"><span className={pnlColor(pnlPct)}>{fmtPct(pnlPct)}</span></Row>
          <Row label="Strategy">{entry.strategy}</Row>
          {inv && <Row label="Holding period">{entry.holdingPeriod}</Row>}
          {inv && <Row label="Review date">{entry.reviewDate}</Row>}
        </div>
        {entry.emotions?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {entry.emotions.map((t) => <span key={t} className="chip bg-brand-100 text-brand-700 dark:bg-brand-600/20 dark:text-brand-300">{t}</span>)}
          </div>
        )}
        {inv && entry.thesis && (
          <div><div className="label">Investment thesis</div><p className="whitespace-pre-wrap text-sm">{entry.thesis}</p></div>
        )}
        {entry.notes && (
          <div><div className="label">Notes / Lesson learned</div><p className="whitespace-pre-wrap text-sm">{entry.notes}</p></div>
        )}
        {entry.imageIds?.length > 0 && (
          <div><div className="label">Screenshots</div><ImageThumbs ids={entry.imageIds} size="lg" /></div>
        )}
      </div>
    </Modal>
  );
}
