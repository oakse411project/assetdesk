import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import defaultApi from '../api/assetApi.js';
import { normalizeAsset } from '../utils/validation.js';

const AssetContext = createContext(null);

// Converts raw form values into the shape the server expects (trimmed strings, numeric cost).
function toAsset(values) {
  const clean = normalizeAsset(values);
  return { ...clean, purchaseCost: Number(clean.purchaseCost) };
}

/**
 * Loads the asset collection from the Spring server and exposes the CRUD operations.
 * `assets` holds every asset (used by the dashboard, search and duplicate checks);
 * the Assets list asks the server for one page at a time through `api.getAssetPage`.
 * `api` can be replaced (tests pass an in-memory fake).
 */
export function AssetProvider({ children, api = defaultApi }) {
  const [assets, setAssets] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    try {
      const all = await api.getAllAssets();
      setAssets(all);
      setStatus('ready');
      setError(null);
    } catch (err) {
      setError(err);
      setStatus('error');
    }
  }, [api]);

  useEffect(() => {
    reload();
  }, [reload]);

  const addAsset = useCallback(
    async (values) => {
      const asset = toAsset(values);
      const id = await api.createAsset(asset);
      await reload();
      return { ...asset, id };
    },
    [api, reload],
  );

  const updateAsset = useCallback(
    async (id, values) => {
      const asset = toAsset(values);
      await api.updateAsset(id, asset);
      await reload();
      return { ...asset, id };
    },
    [api, reload],
  );

  const deleteAsset = useCallback(
    async (id) => {
      await api.deleteAsset(id);
      await reload();
    },
    [api, reload],
  );

  const value = useMemo(
    () => ({ assets, status, error, reload, addAsset, updateAsset, deleteAsset, api }),
    [assets, status, error, reload, addAsset, updateAsset, deleteAsset, api],
  );

  return <AssetContext.Provider value={value}>{children}</AssetContext.Provider>;
}

export function useAssets() {
  const context = useContext(AssetContext);
  if (!context) throw new Error('useAssets must be used inside <AssetProvider>.');
  return context;
}
