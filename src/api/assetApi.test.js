import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  API_URL,
  ApiError,
  createAsset,
  deleteAsset,
  getAllAssets,
  getAssetById,
  getAssetPage,
  updateAsset,
} from './assetApi.js';

// Fake fetch Response.
function reply(status, body = null, headers = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name) => headers[name] ?? null },
    json: async () => body,
  };
}

const serverAsset = {
  id: 8, assetTag: 'IT-0008', brand: 'Dell', model: 'PowerEdge R760', assignedTo: null,
  location: 'Server room B', notes: null, purchaseCost: 48500.0,
};

afterEach(() => vi.unstubAllGlobals());

describe('assetApi', () => {
  it('requests one page with paging and sort parameters', async () => {
    const fetchMock = vi.fn(async () =>
      reply(200, { content: [serverAsset], page: { number: 1, size: 5, totalElements: 6, totalPages: 2 } }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await getAssetPage({ page: 1, size: 5, sort: 'brand', dir: 'desc' });

    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}?page=1&size=5&sort=brand&dir=desc`, {});
    expect(result.page.totalPages).toBe(2);
    // null text fields become empty strings for the form
    expect(result.content[0]).toMatchObject({ assignedTo: '', notes: '', purchaseCost: 48500 });
  });

  it('loads every asset with one large page', async () => {
    const fetchMock = vi.fn(async () => reply(200, { content: [serverAsset], page: {} }));
    vi.stubGlobal('fetch', fetchMock);

    expect(await getAllAssets()).toHaveLength(1);
    expect(fetchMock.mock.calls[0][0]).toContain('size=1000');
  });

  it('gets one asset by id, or null when the server answers 404', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => reply(200, serverAsset)));
    expect((await getAssetById(8)).model).toBe('PowerEdge R760');

    vi.stubGlobal('fetch', vi.fn(async () => reply(404)));
    expect(await getAssetById(99)).toBeNull();
  });

  it('creates an asset without sending an id and reads the new id from Location', async () => {
    const fetchMock = vi.fn(async () => reply(201, null, { Location: 'http://localhost:3001/api/v1/assets/16' }));
    vi.stubGlobal('fetch', fetchMock);

    const id = await createAsset({ id: 'ignored', assetTag: 'IT-0016' });

    expect(id).toBe(16);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(API_URL);
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ assetTag: 'IT-0016' });
  });

  it('updates with PUT and deletes with DELETE', async () => {
    const fetchMock = vi.fn(async () => reply(204));
    vi.stubGlobal('fetch', fetchMock);

    await updateAsset(7, { id: 7, status: 'In use' });
    await deleteAsset(5);

    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/7`);
    expect(fetchMock.mock.calls[0][1].method).toBe('PUT');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ status: 'In use' });
    expect(fetchMock.mock.calls[1]).toEqual([`${API_URL}/5`, { method: 'DELETE' }]);
  });

  it('turns error statuses into readable ApiErrors', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => reply(409)));
    await expect(createAsset({})).rejects.toMatchObject({ status: 409, message: expect.stringMatching(/already uses/) });

    vi.stubGlobal('fetch', vi.fn(async () => reply(500)));
    await expect(deleteAsset(1)).rejects.toBeInstanceOf(ApiError);
  });

  it('explains when the server cannot be reached', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('Failed to fetch'); }));
    await expect(getAssetPage()).rejects.toMatchObject({ status: 0, message: expect.stringMatching(/port 3001/) });
  });
});
