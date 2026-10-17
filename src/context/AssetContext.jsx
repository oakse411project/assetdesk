import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import seedAssets from '../data/seedAssets.js';
import { ACTIONS, assetReducer, createId } from '../utils/assetReducer.js';
import { normalizeAsset } from '../utils/validation.js';

const AssetContext = createContext(null);

// Converts raw form values into a stored asset (trimmed strings, numeric cost).
function toAsset(values) {
  const clean = normalizeAsset(values);
  return { ...clean, purchaseCost: Number(clean.purchaseCost) };
}

/**
 * Holds the in-memory asset collection and exposes CRUD operations.
 * `initialAssets` can be overridden (used by tests).
 */
export function AssetProvider({ children, initialAssets = seedAssets }) {
  const [assets, dispatch] = useReducer(assetReducer, initialAssets);

  const addAsset = useCallback((values) => {
    const asset = { ...toAsset(values), id: createId() };
    dispatch({ type: ACTIONS.ADD, payload: asset });
    return asset;
  }, []);

  const updateAsset = useCallback((id, values) => {
    const asset = { ...toAsset(values), id };
    dispatch({ type: ACTIONS.UPDATE, payload: asset });
    return asset;
  }, []);

  const deleteAsset = useCallback((id) => {
    dispatch({ type: ACTIONS.DELETE, payload: id });
  }, []);

  const getAsset = useCallback((id) => assets.find((a) => a.id === id), [assets]);

  const value = useMemo(
    () => ({ assets, addAsset, updateAsset, deleteAsset, getAsset }),
    [assets, addAsset, updateAsset, deleteAsset, getAsset],
  );

  return <AssetContext.Provider value={value}>{children}</AssetContext.Provider>;
}

export function useAssets() {
  const context = useContext(AssetContext);
  if (!context) throw new Error('useAssets must be used inside <AssetProvider>.');
  return context;
}
