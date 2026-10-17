const currency = new Intl.NumberFormat('en-SA', {
  style: 'currency',
  currency: 'SAR',
  maximumFractionDigits: 0,
});

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export function formatCurrency(value) {
  return currency.format(Number(value) || 0);
}

export function formatDate(isoDate) {
  if (!isoDate) return '-';
  const date = new Date(`${isoDate}T00:00:00`);
  return Number.isNaN(date.getTime()) ? '-' : dateFormat.format(date);
}
