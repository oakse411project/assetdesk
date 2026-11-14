import { WARRANTY_WARNING_DAYS } from '../data/constants.js';

const SEARCHABLE_FIELDS = [
  'assetTag',
  'brand',
  'model',
  'serialNumber',
  'assignedTo',
  'department',
  'location',
  'category',
];

/** Filters assets by a free-text query plus optional category and status. */
export function filterAssets(assets, { query = '', category = '', status = '' } = {}) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return assets.filter((asset) => {
    if (category && asset.category !== category) return false;
    if (status && asset.status !== status) return false;
    if (terms.length === 0) return true;
    const haystack = SEARCHABLE_FIELDS.map((f) => String(asset[f] ?? '')).join(' ').toLowerCase();
    // Every word typed must appear somewhere in the asset.
    return terms.every((term) => haystack.includes(term));
  });
}

/** Returns a new array sorted by the given field. */
export function sortAssets(assets, field = 'assetTag', direction = 'asc') {
  const factor = direction === 'desc' ? -1 : 1;
  return [...assets].sort((a, b) => {
    const x = a[field];
    const y = b[field];
    if (typeof x === 'number' && typeof y === 'number') return (x - y) * factor;
    return String(x ?? '').localeCompare(String(y ?? ''), undefined, { numeric: true }) * factor;
  });
}

/** Days from `today` until `isoDate` (negative when in the past). */
export function daysUntil(isoDate, today = new Date()) {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(`${isoDate}T00:00:00`);
  return Math.round((end - start) / 86_400_000);
}

/** Warranty state used for badges: 'expired' | 'expiring' | 'active'. */
export function warrantyState(isoDate, today = new Date()) {
  const days = daysUntil(isoDate, today);
  if (days < 0) return 'expired';
  if (days <= WARRANTY_WARNING_DAYS) return 'expiring';
  return 'active';
}

/** Summary numbers for the dashboard. Retired assets are excluded from value and warranty alerts. */
export function summarizeAssets(assets, today = new Date()) {
  const byStatus = {};
  const byCategory = {};
  let totalValue = 0;
  const expiringSoon = [];

  for (const asset of assets) {
    byStatus[asset.status] = (byStatus[asset.status] ?? 0) + 1;
    byCategory[asset.category] = (byCategory[asset.category] ?? 0) + 1;
    if (asset.status !== 'Retired') {
      totalValue += Number(asset.purchaseCost) || 0;
      if (warrantyState(asset.warrantyExpiry, today) === 'expiring') expiringSoon.push(asset);
    }
  }

  expiringSoon.sort((a, b) => a.warrantyExpiry.localeCompare(b.warrantyExpiry));
  return { total: assets.length, byStatus, byCategory, totalValue, expiringSoon };
}

/** Next asset tag in the IT-0000 sequence, based on the highest existing number. */
export function nextAssetTag(assets) {
  const highest = assets.reduce((max, asset) => {
    const match = /^IT-(\d+)$/.exec(asset.assetTag ?? '');
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `IT-${String(highest + 1).padStart(4, '0')}`;
}
