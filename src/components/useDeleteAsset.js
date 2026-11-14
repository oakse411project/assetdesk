import { useCallback, useState } from 'react';
import { useAssets } from '../context/AssetContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

/**
 * Shared delete flow (ask -> confirm -> DELETE on the server -> notify) used by the list and details pages.
 * Returns the asset waiting for confirmation plus handlers for the dialog.
 */
export default function useDeleteAsset(onDeleted) {
  const { deleteAsset } = useAssets();
  const { notify } = useToast();
  const [pending, setPending] = useState(null);

  const requestDelete = useCallback((asset) => setPending(asset), []);
  const cancelDelete = useCallback(() => setPending(null), []);
  const confirmDelete = useCallback(async () => {
    if (!pending) return;
    const asset = pending;
    setPending(null);
    try {
      await deleteAsset(asset.id);
      notify(`Deleted ${asset.assetTag}`);
      onDeleted?.(asset);
    } catch (error) {
      notify(`Could not delete ${asset.assetTag}: ${error.message}`);
    }
  }, [pending, deleteAsset, notify, onDeleted]);

  return { pending, requestDelete, cancelDelete, confirmDelete };
}
