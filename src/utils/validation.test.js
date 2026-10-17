import { describe, expect, it } from 'vitest';
import { normalizeAsset, validateAsset } from './validation.js';

const valid = {
  assetTag: 'IT-0100',
  category: 'Laptop',
  brand: 'Dell',
  model: 'Latitude 5440',
  serialNumber: 'ABC-123',
  status: 'In use',
  assignedTo: 'Sara',
  department: 'IT',
  location: '',
  purchaseDate: '2025-01-01',
  purchaseCost: '4500',
  warrantyExpiry: '2028-01-01',
  notes: '',
};

const existing = [{ id: 'x', assetTag: 'IT-0001', serialNumber: 'SN-1' }];

describe('validateAsset', () => {
  it('accepts a complete, valid asset', () => {
    expect(validateAsset(valid, existing)).toEqual({});
  });

  it('requires the mandatory fields', () => {
    const errors = validateAsset({}, []);
    for (const field of ['assetTag', 'category', 'brand', 'model', 'serialNumber', 'department', 'status', 'purchaseDate', 'warrantyExpiry', 'purchaseCost']) {
      expect(errors[field], field).toBeTruthy();
    }
  });

  it('rejects a badly formatted tag', () => {
    expect(validateAsset({ ...valid, assetTag: 'laptop-1' }).assetTag).toMatch(/format/);
  });

  it('rejects duplicate tags and serial numbers (case-insensitive)', () => {
    const errors = validateAsset({ ...valid, assetTag: 'it-0001', serialNumber: 'sn-1' }, existing);
    expect(errors.assetTag).toMatch(/already/);
    expect(errors.serialNumber).toMatch(/already/);
  });

  it('allows an asset to keep its own tag when editing', () => {
    const errors = validateAsset({ ...valid, assetTag: 'IT-0001', serialNumber: 'SN-1' }, existing, 'x');
    expect(errors).toEqual({});
  });

  it('needs a person when the status is In use', () => {
    expect(validateAsset({ ...valid, assignedTo: '  ' }).assignedTo).toBeTruthy();
    expect(validateAsset({ ...valid, assignedTo: '', status: 'In storage' }).assignedTo).toBeUndefined();
  });

  it('rejects a warranty that ends before the purchase', () => {
    expect(validateAsset({ ...valid, warrantyExpiry: '2024-12-31' }).warrantyExpiry).toMatch(/before/);
  });

  it('rejects impossible dates and negative costs', () => {
    expect(validateAsset({ ...valid, purchaseDate: '2025-02-30' }).purchaseDate).toBeTruthy();
    expect(validateAsset({ ...valid, purchaseCost: '-5' }).purchaseCost).toBeTruthy();
    expect(validateAsset({ ...valid, purchaseCost: 'abc' }).purchaseCost).toBeTruthy();
  });

  it('rejects unknown categories and over-long text', () => {
    expect(validateAsset({ ...valid, category: 'Toaster' }).category).toBeTruthy();
    expect(validateAsset({ ...valid, brand: 'x'.repeat(61) }).brand).toBeTruthy();
    expect(validateAsset({ ...valid, notes: 'x'.repeat(501) }).notes).toBeTruthy();
  });

  it('rejects serial numbers with symbols', () => {
    expect(validateAsset({ ...valid, serialNumber: '<script>' }).serialNumber).toBeTruthy();
  });
});

describe('normalizeAsset', () => {
  it('trims strings and leaves other values alone', () => {
    expect(normalizeAsset({ a: '  hi ', b: 5 })).toEqual({ a: 'hi', b: 5 });
  });

  it('upper-cases the asset tag', () => {
    expect(normalizeAsset({ assetTag: ' it-0042 ' }).assetTag).toBe('IT-0042');
  });
});
