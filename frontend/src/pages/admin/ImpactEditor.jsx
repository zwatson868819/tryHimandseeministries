import React from 'react';
import { Gift, Edit, Check } from 'lucide-react';

const IMPACT_FIELDS = [
  { key: 'lives_touched', label: 'Lives Touched' },
  { key: 'kits_given', label: 'Hygiene Kits Given' },
  { key: 'miracle_runs', label: 'Miracle Runs Completed' },
];

const ImpactEditor = ({ impact, editing, inputs, onEditStart, onCancelEdit, onInputChange, onSave }) => {
  if (!impact) return null;
  return (
    <div data-testid="admin-impact-card" className="bg-slate-900 border border-amber-500/30 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center">
          <Gift className="text-amber-400 mr-3" size={26} />
          <div>
            <h3 className="text-white font-bold text-lg">Homepage Impact Counter</h3>
            <p className="text-slate-400 text-sm">Numbers shown in the &ldquo;Miracles in Motion&rdquo; section on the homepage</p>
          </div>
        </div>
        {editing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onSave}
              data-testid="admin-impact-save"
              className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
            >
              <Check size={16} className="mr-1" /> Save
            </button>
            <button
              onClick={onCancelEdit}
              className="px-3 py-2 bg-slate-700 text-white rounded hover:bg-slate-600"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={onEditStart}
            data-testid="admin-impact-edit"
            className="px-3 py-2 bg-slate-800 text-amber-400 rounded hover:bg-slate-700 flex items-center"
          >
            <Edit size={16} className="mr-1" /> Edit
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {IMPACT_FIELDS.map(({ key, label }) => (
          <div key={key} className="bg-slate-950 border border-slate-800 rounded-lg p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">{label}</p>
            {editing ? (
              <input
                type="number"
                min="0"
                value={inputs[key]}
                onChange={(e) => onInputChange(key, e.target.value)}
                data-testid={`admin-impact-${key}`}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-3xl font-bold text-amber-400"
              />
            ) : (
              <p className="text-3xl font-bold text-amber-400">{impact[key]?.toLocaleString?.() ?? 0}</p>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-3">
        Tip: Set any to <strong>0</strong> to hide the section on the homepage. The &ldquo;Donations Received&rdquo; tile pulls live from completed Stripe payments.
      </p>
    </div>
  );
};

export default ImpactEditor;
