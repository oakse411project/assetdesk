import { useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AssetNotFound from '../components/AssetNotFound.jsx';
import { useAssets } from '../context/AssetContext.jsx';
import AssetTag from '../components/AssetTag.jsx';
import { StatusBadge, WarrantyBadge } from '../components/Badges.jsx';
import DeleteAssetDialog from '../components/DeleteAssetDialog.jsx';
import useDeleteAsset from '../components/useDeleteAsset.js';
import { formatCurrency, formatDate } from '../utils/format.js';

export default function AssetDetailsPage() {
  const { id } = useParams();
  const { getAsset } = useAssets();
  const navigate = useNavigate();
  const onDeleted = useCallback(() => navigate('/assets'), [navigate]);
  const { pending, requestDelete, cancelDelete, confirmDelete } = useDeleteAsset(onDeleted);
  const asset = getAsset(id);

  if (!asset) return <AssetNotFound />;

  const rows = [
    ['Category', asset.category],
    ['Serial number', <span className="mono" key="sn">{asset.serialNumber}</span>],
    ['Assigned to', asset.assignedTo || 'Unassigned'],
    ['Department', asset.department],
    ['Location', asset.location || 'Not recorded'],
    ['Purchase date', formatDate(asset.purchaseDate)],
    ['Purchase cost', formatCurrency(asset.purchaseCost)],
    ['Warranty ends', <span key="w">{formatDate(asset.warrantyExpiry)} <WarrantyBadge date={asset.warrantyExpiry} /></span>],
  ];

  return (
    <div className="page page-narrow">
      <p className="breadcrumb"><Link to="/assets">Assets</Link> / {asset.assetTag}</p>

      <section className="label-card" aria-label="Asset label">
        <div className="label-card-top">
          <span>AssetDesk property</span>
          <StatusBadge status={asset.status} />
        </div>
        <AssetTag tag={asset.assetTag} size="large" />
        <h1 className="label-card-title">{asset.brand} {asset.model}</h1>
      </section>

      <dl className="detail-list">
        {rows.map(([term, value]) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      {asset.notes && (
        <section className="notes">
          <h2>Notes</h2>
          <p>{asset.notes}</p>
        </section>
      )}

      <div className="form-actions">
        <Link to={`/assets/${asset.id}/edit`} className="button button-primary">Edit asset</Link>
        <button type="button" className="button button-danger-quiet" onClick={() => requestDelete(asset)}>
          Delete asset
        </button>
      </div>

      <DeleteAssetDialog asset={pending} onConfirm={confirmDelete} onCancel={cancelDelete} />
    </div>
  );
}
