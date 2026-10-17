import { CATEGORIES, STATUSES, DEPARTMENTS, MAX_LENGTH } from '../data/constants.js';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ASSET_TAG = /^IT-\d{4,}$/;

function isValidDate(value) {
  if (!ISO_DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

// Trims every string field so stored data is clean; asset tags are stored in upper case.
export function normalizeAsset(values) {
  const result = {};
  for (const [key, value] of Object.entries(values)) {
    result[key] = typeof value === 'string' ? value.trim() : value;
  }
  if (typeof result.assetTag === 'string') result.assetTag = result.assetTag.toUpperCase();
  return result;
}

/**
 * Validates an asset form.
 * @param {object} values   form values
 * @param {Array}  assets   current collection (for uniqueness checks)
 * @param {string} [currentId] id of the asset being edited, excluded from uniqueness checks
 * @returns {object} map of field name -> error message (empty when valid)
 */
export function validateAsset(values, assets = [], currentId = null) {
  const v = normalizeAsset(values);
  const errors = {};
  const others = assets.filter((a) => a.id !== currentId);

  if (!v.assetTag) errors.assetTag = 'Enter an asset tag.';
  else if (!ASSET_TAG.test(v.assetTag)) errors.assetTag = 'Use the format IT-0001.';
  else if (others.some((a) => a.assetTag.toLowerCase() === v.assetTag.toLowerCase()))
    errors.assetTag = 'Another asset already uses this tag.';

  if (!CATEGORIES.includes(v.category)) errors.category = 'Choose a category.';

  if (!v.brand) errors.brand = 'Enter the brand.';
  else if (v.brand.length > MAX_LENGTH.short) errors.brand = `Keep it under ${MAX_LENGTH.short} characters.`;

  if (!v.model) errors.model = 'Enter the model.';
  else if (v.model.length > MAX_LENGTH.short) errors.model = `Keep it under ${MAX_LENGTH.short} characters.`;

  if (!v.serialNumber) errors.serialNumber = 'Enter the serial number.';
  else if (!/^[A-Za-z0-9-]+$/.test(v.serialNumber))
    errors.serialNumber = 'Use letters, numbers and dashes only.';
  else if (others.some((a) => a.serialNumber.toLowerCase() === v.serialNumber.toLowerCase()))
    errors.serialNumber = 'Another asset already has this serial number.';

  if (!DEPARTMENTS.includes(v.department)) errors.department = 'Choose a department.';
  if (!STATUSES.includes(v.status)) errors.status = 'Choose a status.';

  if (v.status === 'In use' && !v.assignedTo)
    errors.assignedTo = 'Assets in use need a person assigned.';
  else if (v.assignedTo && v.assignedTo.length > MAX_LENGTH.short)
    errors.assignedTo = `Keep it under ${MAX_LENGTH.short} characters.`;

  if (v.location && v.location.length > MAX_LENGTH.short)
    errors.location = `Keep it under ${MAX_LENGTH.short} characters.`;

  if (!v.purchaseDate) errors.purchaseDate = 'Enter the purchase date.';
  else if (!isValidDate(v.purchaseDate)) errors.purchaseDate = 'Enter a valid date.';

  if (!v.warrantyExpiry) errors.warrantyExpiry = 'Enter the warranty end date.';
  else if (!isValidDate(v.warrantyExpiry)) errors.warrantyExpiry = 'Enter a valid date.';
  else if (isValidDate(v.purchaseDate) && v.warrantyExpiry < v.purchaseDate)
    errors.warrantyExpiry = 'Warranty cannot end before the purchase date.';

  const cost = Number(v.purchaseCost);
  if (v.purchaseCost === '' || v.purchaseCost === null || v.purchaseCost === undefined)
    errors.purchaseCost = 'Enter the purchase cost.';
  else if (!Number.isFinite(cost) || cost < 0) errors.purchaseCost = 'Enter a cost of 0 or more.';

  if (v.notes && v.notes.length > MAX_LENGTH.notes)
    errors.notes = `Keep notes under ${MAX_LENGTH.notes} characters.`;

  return errors;
}
