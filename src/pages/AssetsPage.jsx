import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAssets } from '../context/AssetContext.jsx';
import { CATEGORIES, STATUSES } from '../data/constants.js';
import { filterAssets, sortAssets } from '../utils/assetQueries.js';
import AssetTag from '../components/AssetTag.jsx';
import { StatusBadge, WarrantyBadge } from '../components/Badges.jsx';
import DeleteAssetDialog from '../components/DeleteAssetDialog.jsx';
import useDeleteAsset from '../components/useDeleteAsset.js';

const COLUMNS = [
  { field: 'assetTag', label: 'Tag' },
  { field: 'brand', label: 'Device' },
  { field: 'assignedTo', label: 'Assigned to' },
  { field: 'status', label: 'Status' },
  { field: 'warrantyExpiry', label: 'Warranty' },
];

export default function AssetsPage() {
  const { assets } = useAssets();
  const [params, setParams] = useSearchParams();
  const { pending, requestDelete, cancelDelete, confirmDelete } = useDeleteAsset();

  // Filters live in the URL so dashboard links and the back button work.
  const query = params.get('q') ?? '';
  const category = params.get('category') ?? '';
  const status = params.get('status') ?? '';
  const sort = params.get('sort') ?? 'assetTag';
  const dir = params.get('dir') === 'desc' ? 'desc' : 'asc';

  const visible = useMemo(
    () => sortAssets(filterAssets(assets, { query, category, status }), sort, dir),
    [assets, query, category, status, sort, dir],
  );

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const toggleSort = (field) => {
    const next = new URLSearchParams(params);
    next.set('sort', field);
    next.set('dir', sort === field && dir === 'asc' ? 'desc' : 'asc');
    setParams(next, { replace: true });
  };

  const hasFilters = Boolean(query || category || status);

  return (
    <div className="page">
      <header className="page-header page-header-row">
        <div>
          <h1>Assets</h1>
          <p className="lede">Search by tag, serial number, person, model or location.</p>
        </div>
        <Link to="/assets/new" className="button button-primary">Add asset</Link>
      </header>

      <div className="filters" role="search">
        <div className="field">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            type="search"
            value={query}
            placeholder="e.g. Dell, IT-0004, Sara"
            onChange={(e) => setParam('q', e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="filter-category">Category</label>
          <select id="filter-category" value={category} onChange={(e) => setParam('category', e.target.value)}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="filter-status">Status</label>
          <select id="filter-status" value={status} onChange={(e) => setParam('status', e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        {hasFilters && (
          <button type="button" className="button button-quiet" onClick={() => setParams({}, { replace: true })}>
            Clear filters
          </button>
        )}
      </div>

      <p className="result-count" aria-live="polite">
        Showing {visible.length} of {assets.length} assets
      </p>

      {visible.length === 0 ? (
        <div className="empty">
          {assets.length === 0 ? (
            <>
              <p>The inventory is empty.</p>
              <Link to="/assets/new" className="button button-primary">Add the first asset</Link>
            </>
          ) : (
            <>
              <p>No assets match these filters.</p>
              <button type="button" className="button" onClick={() => setParams({}, { replace: true })}>
                Clear filters
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="table-wrap">
          <table className="asset-table">
            <thead>
              <tr>
                {COLUMNS.map((col) => (
                  <th
                    key={col.field}
                    scope="col"
                    aria-sort={sort === col.field ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <button type="button" className="sort-button" onClick={() => toggleSort(col.field)}>
                      {col.label}
                      <span className="sort-indicator" aria-hidden="true">
                        {sort === col.field ? (dir === 'asc' ? '▲' : '▼') : ''}
                      </span>
                    </button>
                  </th>
                ))}
                <th scope="col"><span className="visually-hidden">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((asset) => (
                <tr key={asset.id}>
                  <td><AssetTag tag={asset.assetTag} /></td>
                  <td>
                    <Link to={`/assets/${asset.id}`} className="device-link">
                      {asset.brand} {asset.model}
                    </Link>
                    <span className="device-category">{asset.category}</span>
                  </td>
                  <td>
                    <span className="cell-main">{asset.assignedTo || <span className="muted">Unassigned</span>}</span>
                    <span className="cell-sub">{asset.department}</span>
                  </td>
                  <td><StatusBadge status={asset.status} /></td>
                  <td><WarrantyBadge date={asset.warrantyExpiry} /></td>
                  <td className="row-actions">
                    <Link to={`/assets/${asset.id}/edit`} className="button button-small" aria-label={`Edit ${asset.assetTag}`}>
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="button button-small button-danger-quiet"
                      onClick={() => requestDelete(asset)}
                      aria-label={`Delete ${asset.assetTag}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DeleteAssetDialog asset={pending} onConfirm={confirmDelete} onCancel={cancelDelete} />
    </div>
  );
}
