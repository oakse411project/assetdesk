// REST client for the AssetDesk Spring server (Part 2).
// Every function returns a Promise and throws an ApiError when the server answers with an error.

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1/assets';

// Largest page the server allows. Used to load every asset for the dashboard and search.
export const MAX_PAGE_SIZE = 1000;

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const MESSAGES = {
  400: 'The server rejected the data. Check the form and try again.',
  404: 'This asset no longer exists.',
  409: 'Another asset already uses this tag or serial number.',
};

async function request(url, options = {}) {
  let response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new ApiError(0, 'Cannot reach the AssetDesk server. Make sure the backend is running on port 3001.');
  }
  if (!response.ok) {
    throw new ApiError(response.status, MESSAGES[response.status] ?? `The server returned an error (${response.status}).`);
  }
  return response;
}

// The server stores optional text as null; the form expects empty strings and a numeric cost.
function fromServer(asset) {
  return {
    ...asset,
    assignedTo: asset.assignedTo ?? '',
    location: asset.location ?? '',
    notes: asset.notes ?? '',
    purchaseCost: Number(asset.purchaseCost),
  };
}

// The server rejects a body that contains an id (the id is in the URL instead).
function toServer(values) {
  // eslint-disable-next-line no-unused-vars
  const { id, ...body } = values;
  return JSON.stringify(body);
}

const JSON_HEADERS = { 'Content-Type': 'application/json' };

/**
 * GET /api/v1/assets?page=&size=&sort=&dir=
 * @returns {{ content: object[], page: { number, size, totalElements, totalPages } }}
 */
export async function getAssetPage({ page = 0, size = 10, sort = 'assetTag', dir = 'asc' } = {}) {
  const params = new URLSearchParams({ page, size, sort, dir });
  const response = await request(`${API_URL}?${params}`);
  const body = await response.json();
  return { content: body.content.map(fromServer), page: body.page };
}

/** Every asset (one large page). */
export async function getAllAssets() {
  const { content } = await getAssetPage({ size: MAX_PAGE_SIZE });
  return content;
}

/** GET /api/v1/assets/{id}. Returns null when the asset does not exist. */
export async function getAssetById(id) {
  try {
    const response = await request(`${API_URL}/${encodeURIComponent(id)}`);
    return fromServer(await response.json());
  } catch (error) {
    if (error.status === 404 || error.status === 400) return null;
    throw error;
  }
}

/** POST /api/v1/assets. Returns the id of the new asset, read from the Location header. */
export async function createAsset(values) {
  const response = await request(API_URL, { method: 'POST', headers: JSON_HEADERS, body: toServer(values) });
  const location = response.headers.get('Location') ?? '';
  return Number(location.split('/').pop());
}

/** PUT /api/v1/assets/{id} */
export async function updateAsset(id, values) {
  await request(`${API_URL}/${encodeURIComponent(id)}`, { method: 'PUT', headers: JSON_HEADERS, body: toServer(values) });
}

/** DELETE /api/v1/assets/{id} */
export async function deleteAsset(id) {
  await request(`${API_URL}/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

const assetApi = { getAssetPage, getAllAssets, getAssetById, createAsset, updateAsset, deleteAsset };
export default assetApi;
