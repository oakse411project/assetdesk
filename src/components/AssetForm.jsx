import { useRef, useState } from 'react';
import { CATEGORIES, DEPARTMENTS, MAX_LENGTH, STATUSES } from '../data/constants.js';
import { validateAsset } from '../utils/validation.js';

export const EMPTY_ASSET = {
  assetTag: '',
  category: '',
  brand: '',
  model: '',
  serialNumber: '',
  status: 'In storage',
  assignedTo: '',
  department: '',
  location: '',
  purchaseDate: '',
  purchaseCost: '',
  warrantyExpiry: '',
  notes: '',
};

// Order used to move focus to the first invalid field.
const FIELD_ORDER = Object.keys(EMPTY_ASSET);

function Field({ id, label, error, hint, required, children }) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field${error ? ' field-invalid' : ''}`}>
      <label htmlFor={id}>
        {label}
        {!required && <span className="optional"> (optional)</span>}
      </label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
      {error && <p id={`${id}-error`} className="field-error">{error}</p>}
    </div>
  );
}

/**
 * Shared add/edit form. Validation runs on submit and then live for fields that had errors.
 * @param {object} props.initialValues
 * @param {Array}  props.assets       collection used for uniqueness checks
 * @param {string} [props.currentId]  id of the asset being edited
 * @param {string} props.submitLabel
 * @param {(values) => void} props.onSubmit
 * @param {() => void} props.onCancel
 */
export default function AssetForm({ initialValues, assets, currentId = null, submitLabel, onSubmit, onCancel }) {
  const [values, setValues] = useState({ ...EMPTY_ASSET, ...initialValues });
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const next = { ...values, [name]: value };
    setValues(next);
    // Once a field has shown an error, re-check it as the user types.
    if (errors[name] || (name === 'status' && errors.assignedTo)) {
      const fresh = validateAsset(next, assets, currentId);
      setErrors((prev) => {
        const updated = { ...prev, [name]: fresh[name] };
        if (name === 'status') updated.assignedTo = fresh.assignedTo;
        return updated;
      });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = validateAsset(values, assets, currentId);
    setErrors(found);
    const firstInvalid = FIELD_ORDER.find((name) => found[name]);
    if (firstInvalid) {
      formRef.current?.elements.namedItem(firstInvalid)?.focus();
      return;
    }
    onSubmit(values);
  };

  const errorCount = Object.values(errors).filter(Boolean).length;
  const text = (name) => ({ name, value: values[name], onChange: handleChange });

  return (
    <form ref={formRef} className="asset-form" onSubmit={handleSubmit} noValidate>
      {errorCount > 0 && (
        <p className="form-alert" role="alert">
          Fix {errorCount} {errorCount === 1 ? 'field' : 'fields'} before saving.
        </p>
      )}

      <fieldset>
        <legend>Device</legend>
        <div className="field-grid">
          <Field id="assetTag" label="Asset tag" error={errors.assetTag} hint="Printed on the label, e.g. IT-0016" required>
            {(a) => <input {...a} {...text('assetTag')} maxLength={12} autoComplete="off" className="mono" />}
          </Field>
          <Field id="category" label="Category" error={errors.category} required>
            {(a) => (
              <select {...a} {...text('category')}>
                <option value="">Choose…</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            )}
          </Field>
          <Field id="brand" label="Brand" error={errors.brand} required>
            {(a) => <input {...a} {...text('brand')} maxLength={MAX_LENGTH.short} />}
          </Field>
          <Field id="model" label="Model" error={errors.model} required>
            {(a) => <input {...a} {...text('model')} maxLength={MAX_LENGTH.short} />}
          </Field>
          <Field id="serialNumber" label="Serial number" error={errors.serialNumber} required>
            {(a) => <input {...a} {...text('serialNumber')} maxLength={MAX_LENGTH.short} autoComplete="off" className="mono" />}
          </Field>
        </div>
      </fieldset>

      <fieldset>
        <legend>Assignment</legend>
        <div className="field-grid">
          <Field id="status" label="Status" error={errors.status} required>
            {(a) => (
              <select {...a} {...text('status')}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            )}
          </Field>
          <Field
            id="assignedTo"
            label="Assigned to"
            error={errors.assignedTo}
            hint={values.status === 'In use' ? 'Required while the asset is in use.' : undefined}
            required={values.status === 'In use'}
          >
            {(a) => <input {...a} {...text('assignedTo')} maxLength={MAX_LENGTH.short} />}
          </Field>
          <Field id="department" label="Department" error={errors.department} required>
            {(a) => (
              <select {...a} {...text('department')}>
                <option value="">Choose…</option>
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            )}
          </Field>
          <Field id="location" label="Location" error={errors.location}>
            {(a) => <input {...a} {...text('location')} maxLength={MAX_LENGTH.short} />}
          </Field>
        </div>
      </fieldset>

      <fieldset>
        <legend>Purchase and warranty</legend>
        <div className="field-grid">
          <Field id="purchaseDate" label="Purchase date" error={errors.purchaseDate} required>
            {(a) => <input {...a} {...text('purchaseDate')} type="date" />}
          </Field>
          <Field id="purchaseCost" label="Purchase cost (SAR)" error={errors.purchaseCost} required>
            {(a) => <input {...a} {...text('purchaseCost')} type="number" min="0" step="1" inputMode="numeric" />}
          </Field>
          <Field id="warrantyExpiry" label="Warranty ends" error={errors.warrantyExpiry} required>
            {(a) => <input {...a} {...text('warrantyExpiry')} type="date" />}
          </Field>
        </div>
      </fieldset>

      <fieldset>
        <legend>Notes</legend>
        <Field id="notes" label="Notes" error={errors.notes}>
          {(a) => <textarea {...a} {...text('notes')} rows={3} maxLength={MAX_LENGTH.notes} />}
        </Field>
      </fieldset>

      <div className="form-actions">
        <button type="submit" className="button button-primary">{submitLabel}</button>
        <button type="button" className="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
