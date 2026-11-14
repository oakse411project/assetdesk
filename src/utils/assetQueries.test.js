import { describe, expect, it } from 'vitest';
import { daysUntil, filterAssets, nextAssetTag, sortAssets, summarizeAssets, warrantyState } from './assetQueries.js';
import seedAssets from '../test/seedAssets.js';

describe('filterAssets', () => {
  it('returns everything with no filters', () => {
    expect(filterAssets(seedAssets)).toHaveLength(seedAssets.length);
  });

  it('matches text in any searchable field, case-insensitively', () => {
    expect(filterAssets(seedAssets, { query: 'sara' }).map((a) => a.assetTag)).toEqual(['IT-0001', 'IT-0004']);
    expect(filterAssets(seedAssets, { query: 'foc2419' })).toHaveLength(1);
  });

  it('requires every word of a multi-word query', () => {
    const result = filterAssets(seedAssets, { query: 'apple laptop' });
    expect(result.map((a) => a.assetTag)).toEqual(['IT-0002']);
  });

  it('combines text, category and status filters', () => {
    const result = filterAssets(seedAssets, { query: 'apple', category: 'Phone', status: 'Under repair' });
    expect(result.map((a) => a.assetTag)).toEqual(['IT-0014']);
  });

  it('returns nothing when nothing matches', () => {
    expect(filterAssets(seedAssets, { query: 'zzzz' })).toEqual([]);
  });
});

describe('sortAssets', () => {
  it('sorts strings both ways without mutating input', () => {
    const copy = [...seedAssets];
    const asc = sortAssets(seedAssets, 'brand');
    expect(asc[0].brand).toBe('Apple');
    expect(sortAssets(seedAssets, 'brand', 'desc')[0].brand).toBe('Ubiquiti');
    expect(seedAssets).toEqual(copy);
  });

  it('sorts numbers numerically', () => {
    const costs = sortAssets(seedAssets, 'purchaseCost').map((a) => a.purchaseCost);
    expect(costs[0]).toBe(750);
    expect(costs.at(-1)).toBe(48500);
  });
});

describe('warranty helpers', () => {
  const today = new Date(2026, 9, 17); // 17 Oct 2026

  it('counts days until a date', () => {
    expect(daysUntil('2026-10-27', today)).toBe(10);
    expect(daysUntil('2026-10-16', today)).toBe(-1);
  });

  it('labels warranty state', () => {
    expect(warrantyState('2026-01-01', today)).toBe('expired');
    expect(warrantyState('2026-12-01', today)).toBe('expiring');
    expect(warrantyState('2028-01-01', today)).toBe('active');
  });
});

describe('summarizeAssets', () => {
  const today = new Date(2026, 9, 17);
  const summary = summarizeAssets(seedAssets, today);

  it('counts by status and category', () => {
    expect(summary.total).toBe(15);
    expect(summary.byStatus['Under repair']).toBe(2);
    expect(summary.byCategory.Laptop).toBe(4);
  });

  it('excludes retired assets from total value', () => {
    const all = seedAssets.reduce((sum, a) => sum + a.purchaseCost, 0);
    expect(summary.totalValue).toBe(all - 4800);
  });

  it('lists warranties ending within 90 days, soonest first', () => {
    expect(summary.expiringSoon.map((a) => a.assetTag)).toEqual(['IT-0007', 'IT-0002', 'IT-0009']);
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
