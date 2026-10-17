import { describe, expect, it } from 'vitest';
import { ACTIONS, assetReducer, createId, nextAssetTag } from './assetReducer.js';

const base = [
  { id: '1', assetTag: 'IT-0001', brand: 'Dell' },
  { id: '2', assetTag: 'IT-0002', brand: 'HP' },
];

describe('assetReducer', () => {
  it('adds an asset without mutating the old state', () => {
    const next = assetReducer(base, { type: ACTIONS.ADD, payload: { id: '3', assetTag: 'IT-0003' } });
    expect(next).toHaveLength(3);
    expect(base).toHaveLength(2);
  });

  it('updates only the matching asset', () => {
    const next = assetReducer(base, { type: ACTIONS.UPDATE, payload: { id: '2', brand: 'Lenovo' } });
    expect(next[1]).toEqual({ id: '2', assetTag: 'IT-0002', brand: 'Lenovo' });
    expect(next[0]).toBe(base[0]);
  });

  it('deletes by id', () => {
    const next = assetReducer(base, { type: ACTIONS.DELETE, payload: '1' });
    expect(next.map((a) => a.id)).toEqual(['2']);
  });

  it('returns the same state for unknown actions', () => {
    expect(assetReducer(base, { type: 'NOPE' })).toBe(base);
  });
});

describe('nextAssetTag', () => {
  it('continues after the highest tag number', () => {
    expect(nextAssetTag([{ assetTag: 'IT-0002' }, { assetTag: 'IT-0010' }])).toBe('IT-0011');
  });

  it('starts at IT-0001 for an empty list and ignores odd tags', () => {
    expect(nextAssetTag([])).toBe('IT-0001');
    expect(nextAssetTag([{ assetTag: 'LEGACY-9' }])).toBe('IT-0001');
  });
});

describe('createId', () => {
  it('produces unique ids', () => {
    expect(createId()).not.toBe(createId());
  });
});
