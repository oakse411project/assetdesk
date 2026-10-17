import { useNavigate, useParams } from 'react-router-dom';
import AssetNotFound from '../components/AssetNotFound.jsx';
import { useAssets } from '../context/AssetContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import AssetForm from '../components/AssetForm.jsx';

export default function EditAssetPage() {
  const { id } = useParams();
  const { assets, getAsset, updateAsset } = useAssets();
  const { notify } = useToast();
  const navigate = useNavigate();
  const asset = getAsset(id);

  if (!asset) return <AssetNotFound />;

  const handleSubmit = (values) => {
    updateAsset(id, values);
    notify(`Saved changes to ${values.assetTag.trim().toUpperCase()}`);
    navigate(`/assets/${id}`);
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
        currentId={id}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/assets/${id}`)}
      />
    </div>
  );
}
