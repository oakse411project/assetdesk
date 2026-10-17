import ConfirmDialog from './ConfirmDialog.jsx';

export default function DeleteAssetDialog({ asset, onConfirm, onCancel }) {
  if (!asset) return null;
  return (
    <ConfirmDialog
      title={`Delete ${asset.assetTag}?`}
      message={`This removes the ${asset.brand} ${asset.model} from the inventory. You can’t undo this.`}
      confirmLabel="Delete asset"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
