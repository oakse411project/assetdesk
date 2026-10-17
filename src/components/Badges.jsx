import { STATUS_CLASS } from '../data/constants.js';
import { daysUntil, warrantyState } from '../utils/assetQueries.js';
import { formatDate } from '../utils/format.js';

export function StatusBadge({ status }) {
  return <span className={`status status-${STATUS_CLASS[status] ?? 'retired'}`}>{status}</span>;
}

export function WarrantyBadge({ date }) {
  const state = warrantyState(date);
  const days = daysUntil(date);
  const label =
    state === 'expired'
      ? 'Expired'
      : state === 'expiring'
        ? `${days} ${days === 1 ? 'day' : 'days'} left`
        : formatDate(date);
  return (
    <span className={`warranty warranty-${state}`} title={`Warranty ends ${formatDate(date)}`}>
      {label}
    </span>
  );
}
