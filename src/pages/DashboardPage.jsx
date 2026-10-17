import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAssets } from '../context/AssetContext.jsx';
import { STATUSES, STATUS_CLASS } from '../data/constants.js';
import { summarizeAssets } from '../utils/assetQueries.js';
import { formatCurrency } from '../utils/format.js';
import AssetTag from '../components/AssetTag.jsx';
import { StatusBadge, WarrantyBadge } from '../components/Badges.jsx';

export default function DashboardPage() {
  const { assets } = useAssets();
  const { summary, attention, categories } = useMemo(() => {
    const result = summarizeAssets(assets);
    const underRepair = assets.filter((a) => a.status === 'Under repair');
    return {
      summary: result,
      attention: [...underRepair, ...result.expiringSoon.filter((a) => a.status !== 'Under repair')],
      categories: Object.entries(result.byCategory).sort((a, b) => b[1] - a[1]),
    };
  }, [assets]);
  const maxCategory = categories[0]?.[1] ?? 1;

  return (
    <div className="page">
      <header className="page-header">
        <h1>Dashboard</h1>
        <p className="lede">
          {summary.total} {summary.total === 1 ? 'asset' : 'assets'} on record, worth {formatCurrency(summary.totalValue)} at
          purchase (excluding retired equipment).
        </p>
      </header>

      <section className="panel" aria-labelledby="attention-heading">
        <h2 id="attention-heading">Needs attention</h2>
        {attention.length === 0 ? (
          <p className="muted">Nothing is under repair and no warranties end in the next 90 days.</p>
        ) : (
          <ul className="attention-list">
            {attention.map((asset) => (
              <li key={asset.id}>
                <Link to={`/assets/${asset.id}`} className="attention-link">
                  <AssetTag tag={asset.assetTag} />
                  <span className="attention-name">{asset.brand} {asset.model}</span>
                  {asset.status === 'Under repair' ? (
                    <StatusBadge status={asset.status} />
                  ) : (
                    <span className="attention-reason">
                      Warranty <WarrantyBadge date={asset.warrantyExpiry} />
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="dashboard-grid">
        <section className="panel" aria-labelledby="status-heading">
          <h2 id="status-heading">By status</h2>
          <div className="status-bar" aria-hidden="true">
            {STATUSES.map((status) => {
              const count = summary.byStatus[status] ?? 0;
              return count ? (
                <span
                  key={status}
                  className={`status-bar-segment seg-${STATUS_CLASS[status]}`}
                  style={{ flexGrow: count }}
                />
              ) : null;
            })}
          </div>
          <ul className="status-legend">
            {STATUSES.map((status) => (
              <li key={status}>
                <Link to={`/assets?status=${encodeURIComponent(status)}`}>
                  <span className={`dot seg-${STATUS_CLASS[status]}`} aria-hidden="true" />
                  {status}
                  <span className="count">{summary.byStatus[status] ?? 0}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel" aria-labelledby="category-heading">
          <h2 id="category-heading">By category</h2>
          <ul className="category-list">
            {categories.map(([category, count]) => (
              <li key={category}>
                <Link to={`/assets?category=${encodeURIComponent(category)}`}>
                  <span className="category-name">{category}</span>
                  <span className="category-bar" aria-hidden="true">
                    <span style={{ width: `${(count / maxCategory) * 100}%` }} />
                  </span>
                  <span className="count">{count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
