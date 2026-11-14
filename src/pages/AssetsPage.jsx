import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAssets } from '../context/AssetContext.jsx';
import { CATEGORIES, STATUSES } from '../data/constants.js';
import { filterAssets, sortAssets } from '../utils/assetQueries.js';
import AssetTag from '../components/AssetTag.jsx';
import { StatusBadge, WarrantyBadge } from '../components/Badges.jsx';
import DeleteAssetDialog from '../components/DeleteAssetDialog.jsx';
import LoadState from '../components/LoadState.jsx';
import useDeleteAsset from '../components/useDeleteAsset.js';

export const PAGE_SIZE = 10;

const COLUMNS = [
  { field: 'assetTag', label: 'Tag' },
  { field: 'brand', label: 'Device' },
  { field: 'assignedTo', label: 'Assigned to' },
  { field: 'status', label: 'Status' },
  { field: 'warrantyExpiry', label: 'Warranty' },
];

export default function AssetsPage() {
  const { assets, status: loadStatus, api } = useAssets();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { pending, requestDelete, cancelDelete, confirmDelete } = useDeleteAsset();
  const [findId, setFindId] = useState('');

  // Filters, sort and page live in the URL so dashboard links and the back button work.
  const query = params.get('q') ?? '';
  const category = params.get('category') ?? '';
  const status = params.get('status') ?? '';
  const sort = params.get('sort') ?? 'assetTag';
  const dir = params.get('dir') === 'desc' ? 'desc' : 'asc';
  const pageNumber = Math.max(1, Math.floor(Number(params.get('page'))) || 1); // 1-based in the UI
  const hasFilters = Boolean(query || category || status);

  // Without filters, the server paginates: GET /api/v1/assets?page=&size=&sort=&dir=
  const [serverPage, setServerPage] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (hasFilters || loadStatus !== 'ready') return undefined;
    let active = true;
    setServerError(null);
    api
      .getAssetPage({ page: pageNumber - 1, size: PAGE_SIZE, sort, dir })
      .then((result) => active && setServerPage(result))
      .catch((error) => active && setServerError(error));
    return () => {
      active = false;
    };
    // `assets` changes after every add/update/delete, so the current page is fetched again.
  }, [api, hasFilters, loadStatus, pageNumber, sort, dir, assets, attempt]);

  // With filters, search runs over the full list already loaded from the server, then is split into pages.
  const filtered = useMemo(
    () => (hasFilters ? sortAssets(filterAssets(assets, { query, category, status }), sort, dir) : []),
    [hasFilters, assets, query, category, status, sort, dir],
  );

  let rows = [];
  let total = 0;
  let totalPages = 1;
  if (hasFilters) {
    total = filtered.length;
    totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    rows = filtered.slice((pageNumber - 1) * PAGE_SIZE, pageNumber * PAGE_SIZE);
  } else if (serverPage) {
    rows = serverPage.content;
    total = serverPage.page.totalElements;
    totalPages = Math.max(1, serverPage.page.totalPages);
  }
  const pageReady = hasFilters || serverPage !== null;

  // If the current page no longer exists (e.g. its last asset was deleted), go to the last page.
  useEffect(() => {
    if (pageReady && pageNumber > totalPages) {
      const next = new URLSearchParams(params);
      if (totalPages > 1) next.set('page', String(totalPages));
      else next.delete('page');
      setParams(next, { replace: true });
    }
  }, [pageReady, pageNumber, totalPages, params, setParams]);

  if (loadStatus !== 'ready') return <LoadState />;
  if (serverError) return <LoadState error={serverError} onRetry={() => setAttempt((n) => n + 1)} />;

  // Changing a filter or the sort order starts again from page 1.
  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setParams(next, { replace: true });
  };

  const goToPage = (number) => {
    const next = new URLSearchParams(params);
    if (number > 1) next.set('page', String(number));
    else next.delete('page');
    setParams(next);
  };

  const toggleSort = (field) => {
    const next = new URLSearchParams(params);
    next.set('sort', field);
    next.set('dir', sort === field && dir === 'asc' ? 'desc' : 'asc');
    next.delete('page');
    setParams(next, { replace: true });
  };

  const handleFind = (event) => {
    event.preventDefault();
    const id = findId.trim();
    if (id) navigate(`/assets/${encodeURIComponent(id)}`);
  };

  const from = total === 0 ? 0 : (pageNumber - 1) * PAGE_SIZE + 1;
  const to = Math.min(pageNumber * PAGE_SIZE, total);

  return (
    <div className="page">
      <header className="page-header page-header-row">
        <div>
          <h1>Assets</h1>
          <p className="lede">Search by tag, serial number, person, model or location.</p>
        </div>
        <Link to="/assets/new" className="button button-primary">Add asset</Link>
      </header>

      <form className="find-by-id" onSubmit={handleFind} role="search" aria-label="Find asset by ID">
        <div className="field">
          <label htmlFor="find-id">Find by ID</label>
          <input
            id="find-id"
            type="number"
            min="1"
            inputMode="numeric"
            value={findId}
            placeholder="e.g. 8"
            onChange={(e) => setFindId(e.target.value)}
          />
        </div>
        <button type="submit" className="button">Open</button>
      </form>

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
        {!pageReady
          ? 'Loading…'
          : hasFilters
            ? `Showing ${from}–${to} of ${total} matching assets (${assets.length} in total)`
            : `Showing ${from}–${to} of ${total} assets`}
      </p>

      {!pageReady ? null : rows.length === 0 ? (
        <div className="empty">
          {!hasFilters ? (
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
              {rows.map((asset) => (
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

      {pageReady && totalPages > 1 && (
        <nav className="pager" aria-label="Pagination">
          <button
            type="button"
            className="button button-small"
            disabled={pageNumber <= 1}
            onClick={() => goToPage(pageNumber - 1)}
          >
            Previous
          </button>
          <span className="pager-status">Page {pageNumber} of {totalPages}</span>
          <button
            type="button"
            className="button button-small"
            disabled={pageNumber >= totalPages}
            onClick={() => goToPage(pageNumber + 1)}
          >
            Next
          </button>
        </nav>
      )}

      <DeleteAssetDialog asset={pending} onConfirm={confirmDelete} onCancel={cancelDelete} />
    </div>
  );
}
