import { useCallback, useEffect, useState } from 'react';
import { useAssets } from '../context/AssetContext.jsx';

/**
 * Loads one asset from the server (GET /api/v1/assets/{id}).
 * `asset` is undefined while loading and null when the id does not exist.
 */
export default function useAsset(id) {
  const { api } = useAssets();
  const [asset, setAsset] = useState(undefined);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setAsset(undefined);
    setError(null);
    api
      .getAssetById(id)
      .then((found) => active && setAsset(found))
      .catch((err) => active && setError(err));
    return () => {
      active = false;
    };
  }, [api, id, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { asset, error, retry };
}
