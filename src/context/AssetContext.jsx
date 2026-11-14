import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import defaultApi from '../api/assetApi.js';
import { normalizeAsset } from '../utils/validation.js';

const AssetContext = createContext(null);

function toAsset(values) {
  const clean = normalizeAsset(values);
  return { ...clean, purchaseCost: Number(clean.purchaseCost) };
}


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
