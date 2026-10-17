import { useCallback, useState } from 'react';
import { useAssets } from '../context/AssetContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

/**
 * Shared delete flow (ask -> confirm -> delete -> notify) used by the list and details pages.
 * Returns the asset waiting for confirmation plus handlers for the dialog.
 */
export default function useDeleteAsset(onDeleted) {
  const { deleteAsset } = useAssets();
  const { notify } = useToast();
  const [pending, setPending] = useState(null);

  const requestDelete = useCallback((asset) => setPending(asset), []);
  const cancelDelete = useCallback(() => setPending(null), []);
  const confirmDelete = useCallback(() => {
    if (!pending) return;
    deleteAsset(pending.id);
    notify(`Deleted ${pending.assetTag}`);
    setPending(null);
    onDeleted?.(pending);
  }, [pending, deleteAsset, notify, onDeleted]);

  return { pending, requestDelete, cancelDelete, confirmDelete };
}
