import { useNavigate } from 'react-router-dom';
import { useAssets } from '../context/AssetContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import AssetForm from '../components/AssetForm.jsx';
import { nextAssetTag } from '../utils/assetReducer.js';

export default function AddAssetPage() {
  const { assets, addAsset } = useAssets();
  const { notify } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (values) => {
    const asset = addAsset(values);
    notify(`Added ${asset.assetTag}`);
    navigate(`/assets/${asset.id}`);
  };

  return (
    <div className="page page-narrow">
      <header className="page-header">
        <h1>Add asset</h1>
        <p className="lede">The next free tag is filled in for you. Change it if the label says otherwise.</p>
      </header>
      <AssetForm
        initialValues={{ assetTag: nextAssetTag(assets) }}
        assets={assets}
        submitLabel="Add asset"
        onSubmit={handleSubmit}
        onCancel={() => navigate('/assets')}
      />
    </div>
  );
}
