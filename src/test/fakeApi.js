import { ApiError } from '../api/assetApi.js';
import { sortAssets } from '../utils/assetQueries.js';

/**
 * In-memory stand-in for the Spring server, with the same functions as src/api/assetApi.js.
 * It follows the server's rules (paging, 404 for unknown ids, 409 for duplicates)
 * so the UI tests run without a backend.
 */
export function createFakeApi(initialAssets = []) {
  let assets = initialAssets.map((a) => ({ ...a }));
  let nextId = assets.reduce((max, a) => Math.max(max, a.id), 0) + 1;
  const copy = (a) => ({ ...a });

  const find = (id) => assets.find((a) => a.id === Number(id));

  const checkDuplicates = (values, ignoreId = null) => {
    const others = assets.filter((a) => a.id !== ignoreId);
    if (others.some((a) => a.assetTag === values.assetTag || a.serialNumber === values.serialNumber)) {
      throw new ApiError(409, 'Another asset already uses this tag or serial number.');
    }
  };

  const api = {
    calls: [],

    async getAssetPage({ page = 0, size = 10, sort = 'assetTag', dir = 'asc' } = {}) {
      api.calls.push(['getAssetPage', { page, size, sort, dir }]);
      const sorted = sortAssets(assets, sort, dir);
      return {
        content: sorted.slice(page * size, (page + 1) * size).map(copy),
        page: { number: page, size, totalElements: sorted.length, totalPages: Math.ceil(sorted.length / size) },
      };
    },

    async getAllAssets() {
      return assets.map(copy);
    },

    async getAssetById(id) {
      api.calls.push(['getAssetById', id]);
      const asset = find(id);
      return asset ? copy(asset) : null;
    },

    async createAsset(values) {
      api.calls.push(['createAsset', values]);
      checkDuplicates(values);
      const asset = { ...values, id: nextId };
      nextId += 1;
      assets = [...assets, asset];
      return asset.id;
    },

    async updateAsset(id, values) {
      api.calls.push(['updateAsset', id, values]);
      if (!find(id)) throw new ApiError(404, 'This asset no longer exists.');
      checkDuplicates(values, Number(id));
      assets = assets.map((a) => (a.id === Number(id) ? { ...values, id: Number(id) } : a));
    },

    async deleteAsset(id) {
      api.calls.push(['deleteAsset', id]);
      if (!find(id)) throw new ApiError(404, 'This asset no longer exists.');
      assets = assets.filter((a) => a.id !== Number(id));
    },
  };
  return api;
}
