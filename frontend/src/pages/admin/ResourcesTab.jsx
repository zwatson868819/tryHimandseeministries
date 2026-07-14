import React from 'react';
import { Trash2 } from 'lucide-react';
import { RESOURCE_CATEGORIES } from '../ResourceDirectory';

const ResourceRow = ({ resource, onEdit, onDelete, onToggleActive }) => {
  const category = RESOURCE_CATEGORIES.find((c) => c.key === resource.category);
  const active = resource.is_active !== 0 && resource.is_active !== false;
  return (
    <div
      data-testid={`admin-resource-${resource.id}`}
      className={`flex flex-col md:flex-row md:items-start md:justify-between gap-3 p-4 border rounded-lg ${
        active ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-900/30 border-slate-800 opacity-60'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs rounded-full">
            {category?.label || resource.category}
          </span>
          {!active && <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded-full">Hidden</span>}
        </div>
        <h4 className="text-white font-semibold">{resource.name}</h4>
        {resource.address && <p className="text-slate-400 text-xs mt-1">{resource.address}</p>}
        {resource.phone && <p className="text-slate-400 text-xs">{resource.phone}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={() => onToggleActive(resource)}
          data-testid={`resource-toggle-${resource.id}`}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            active
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
          }`}
        >
          {active ? 'Visible' : 'Hidden'}
        </button>
        <button
          type="button"
          onClick={() => onEdit(resource)}
          data-testid={`resource-edit-${resource.id}`}
          className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded text-xs transition-colors"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(resource.id)}
          data-testid={`resource-delete-${resource.id}`}
          className="inline-flex items-center px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded text-xs transition-colors"
        >
          <Trash2 size={12} className="mr-1" />
          Delete
        </button>
      </div>
    </div>
  );
};

const ResourcesTab = ({ resources, resourceFilter, onFilterChange, onOpenNew, onEdit, onDelete, onToggleActive }) => {
  const visible = resourceFilter === 'all' ? resources : resources.filter((r) => r.category === resourceFilter);

  return (
    <div data-testid="admin-resources-panel">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-slate-400 text-sm mr-2">Filter:</label>
          <select
            value={resourceFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            data-testid="resource-filter"
            className="bg-slate-900 border border-slate-700 rounded-lg text-white text-sm px-3 py-1.5 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All categories ({resources.length})</option>
            {RESOURCE_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label} ({resources.filter((r) => r.category === c.key).length})
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={onOpenNew}
          data-testid="add-resource-btn"
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg text-sm font-semibold hover:from-amber-400 hover:to-amber-500 transition-all"
        >
          + Add Resource
        </button>
      </div>

      <div className="grid gap-3">
        {visible.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No resources in this category yet.</p>
        ) : (
          visible.map((r) => (
            <ResourceRow
              key={r.id}
              resource={r}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ResourcesTab;
