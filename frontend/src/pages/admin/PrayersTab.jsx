import React from 'react';
import { Trash2 } from 'lucide-react';
import { formatDate } from './utils';

const PrayersTab = ({ prayers, onDelete }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-800">
          <th className="pb-3 text-slate-400 font-semibold">Date</th>
          <th className="pb-3 text-slate-400 font-semibold">Name</th>
          <th className="pb-3 text-slate-400 font-semibold">Email</th>
          <th className="pb-3 text-slate-400 font-semibold">Request</th>
          <th className="pb-3 text-slate-400 font-semibold">Status</th>
          <th className="pb-3 text-slate-400 font-semibold text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {prayers.length === 0 ? (
          <tr>
            <td colSpan="6" className="py-8 text-center text-slate-500">No prayer requests</td>
          </tr>
        ) : (
          prayers.map((p) => (
            <tr key={p.id} className="border-b border-slate-800">
              <td className="py-3 text-white">{formatDate(p.created_at)}</td>
              <td className="py-3 text-white">{p.display_name || p.name || 'Anonymous'}</td>
              <td className="py-3 text-slate-400 text-sm">{p.email || 'N/A'}</td>
              <td className="py-3 text-slate-400 text-sm max-w-md truncate">{p.request}</td>
              <td className="py-3">
                <span className="px-2 py-1 rounded text-xs font-semibold bg-green-500/20 text-green-400">
                  {p.status}
                </span>
              </td>
              <td className="py-3 text-right">
                <button
                  onClick={() => onDelete(p.id)}
                  data-testid={`delete-prayer-${p.id}`}
                  title="Delete prayer request"
                  className="inline-flex items-center px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded text-sm transition-colors"
                >
                  <Trash2 size={14} className="mr-1" />
                  Delete
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default PrayersTab;
