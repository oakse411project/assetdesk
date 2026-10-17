// Pure reducer for the in-memory asset collection.
// Keeping this free of React makes it easy to test and to swap for an API in Part 2.

export const ACTIONS = {
  ADD: 'ADD_ASSET',
  UPDATE: 'UPDATE_ASSET',
  DELETE: 'DELETE_ASSET',
};

export function assetReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD:
      return [...state, action.payload];

    case ACTIONS.UPDATE:
      return state.map((asset) =>
        asset.id === action.payload.id ? { ...asset, ...action.payload } : asset,
      );

    case ACTIONS.DELETE:
      return state.filter((asset) => asset.id !== action.payload);

    default:
      return state;
  }
}

let idCounter = 0;

// Unique id for new assets. crypto.randomUUID is used when available.
export function createId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  idCounter += 1;
  return `asset-${Date.now()}-${idCounter}`;
}

// Next asset tag in the IT-0000 sequence, based on the highest existing number.
export function nextAssetTag(assets) {
  const highest = assets.reduce((max, asset) => {
    const match = /^IT-(\d+)$/.exec(asset.assetTag ?? '');
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `IT-${String(highest + 1).padStart(4, '0')}`;
}
