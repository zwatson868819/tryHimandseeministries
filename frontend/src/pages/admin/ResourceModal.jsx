import React from 'react';
import { X } from 'lucide-react';
import { RESOURCE_CATEGORIES } from '../ResourceDirectory';

const Field = ({ label, required, testId, children }) => (
  <div>
    <label className="block text-slate-300 text-sm mb-1" htmlFor={testId}>
      {label} {required && '*'}
    </label>
    {children}
  </div>
);

const inputCls =
  'w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500';

const ResourceModal = ({ resource, onFieldChange, onSave, onClose }) => {
  if (!resource) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur flex items-start justify-center overflow-y-auto p-4"
      data-testid="resource-modal"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-2xl w-full my-8 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-xl font-bold">
            {resource.id ? 'Edit Resource' : 'Add Resource'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            data-testid="resource-modal-close"
            className="p-2 text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Category" required testId="resource-field-category">
              <select
                value={resource.category}
                onChange={(e) => onFieldChange('category', e.target.value)}
                data-testid="resource-field-category"
                className={inputCls}
              >
                {RESOURCE_CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Sort order" testId="resource-field-sort-order">
              <input
                type="number"
                value={resource.sort_order ?? 999}
                onChange={(e) => onFieldChange('sort_order', e.target.value)}
                data-testid="resource-field-sort-order"
                className={inputCls}
                placeholder="999"
              />
            </Field>
          </div>

          <Field label="Name" required testId="resource-field-name">
            <input
              type="text"
              value={resource.name}
              onChange={(e) => onFieldChange('name', e.target.value)}
              data-testid="resource-field-name"
              className={inputCls}
              placeholder="Organization name"
            />
          </Field>

          <Field label="Description" testId="resource-field-description">
            <textarea
              value={resource.description || ''}
              onChange={(e) => onFieldChange('description', e.target.value)}
              data-testid="resource-field-description"
              rows={2}
              className={`${inputCls} resize-none`}
            />
          </Field>

          <Field label="Address" testId="resource-field-address">
            <input
              type="text"
              value={resource.address || ''}
              onChange={(e) => onFieldChange('address', e.target.value)}
              data-testid="resource-field-address"
              className={inputCls}
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Phone" testId="resource-field-phone">
              <input
                type="text"
                value={resource.phone || ''}
                onChange={(e) => onFieldChange('phone', e.target.value)}
                data-testid="resource-field-phone"
                className={inputCls}
              />
            </Field>
            <Field label="Website" testId="resource-field-website">
              <input
                type="text"
                value={resource.website || ''}
                onChange={(e) => onFieldChange('website', e.target.value)}
                data-testid="resource-field-website"
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Hours" testId="resource-field-hours">
            <input
              type="text"
              value={resource.hours || ''}
              onChange={(e) => onFieldChange('hours', e.target.value)}
              data-testid="resource-field-hours"
              className={inputCls}
              placeholder="Mon-Fri 9am-5pm"
            />
          </Field>

          <Field label="Notes / eligibility" testId="resource-field-notes">
            <textarea
              value={resource.notes || ''}
              onChange={(e) => onFieldChange('notes', e.target.value)}
              data-testid="resource-field-notes"
              rows={2}
              className={`${inputCls} resize-none`}
            />
          </Field>

          <label className="inline-flex items-center gap-2 text-slate-300 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={!!resource.is_active}
              onChange={(e) => onFieldChange('is_active', e.target.checked)}
              data-testid="resource-field-active"
              className="rounded"
            />
            Visible on public directory
          </label>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-800">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white text-sm">
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            data-testid="resource-modal-save"
            className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg text-sm font-semibold hover:from-amber-400 hover:to-amber-500 transition-all"
          >
            {resource.id ? 'Save changes' : 'Add resource'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourceModal;
