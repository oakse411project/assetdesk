import { useNavigate, useParams } from 'react-router-dom';
import AssetNotFound from '../components/AssetNotFound.jsx';
import LoadState from '../components/LoadState.jsx';
import useAsset from '../components/useAsset.js';
import { useAssets } from '../context/AssetContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import AssetForm from '../components/AssetForm.jsx';

export default function EditAssetPage() {
  const { id } = useParams();
  const { assets, status, updateAsset } = useAssets();
  const { asset, error, retry } = useAsset(id);
  const { notify } = useToast();
  const navigate = useNavigate();

  if (error) return <LoadState error={error} onRetry={retry} />;
  if (asset === null) return <AssetNotFound />;
  if (asset === undefined || status !== 'ready') return <LoadState />;

  const handleSubmit = async (values) => {
    try {
      await updateAsset(asset.id, values);
      notify(`Saved changes to ${values.assetTag.trim().toUpperCase()}`);
      navigate(`/assets/${asset.id}`);
    } catch (err) {
      notify(`Could not save: ${err.message}`);
    }
  };

  return (
    <div className="page page-narrow">
      <header className="page-header">
        <h1>Edit {asset.assetTag}</h1>
        <p className="lede">{asset.brand} {asset.model}</p>
      </header>
      <AssetForm
        initialValues={{ ...asset, purchaseCost: String(asset.purchaseCost) }}
        assets={assets}
        currentId={asset.id}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/assets/${asset.id}`)}
      />
    </div>
  );
}
