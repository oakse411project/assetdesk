import { useNavigate } from 'react-router-dom';
import { useAssets } from '../context/AssetContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import AssetForm from '../components/AssetForm.jsx';
import LoadState from '../components/LoadState.jsx';
import { nextAssetTag } from '../utils/assetQueries.js';

export default function AddAssetPage() {
  const { assets, status, addAsset } = useAssets();
  const { notify } = useToast();
  const navigate = useNavigate();

  if (status !== 'ready') return <LoadState />;

  const handleSubmit = async (values) => {
    try {
      const asset = await addAsset(values);
      notify(`Added ${asset.assetTag}`);
      navigate(`/assets/${asset.id}`);
    } catch (error) {
      notify(`Could not add the asset: ${error.message}`);
    }
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
