import React from 'react';
import { Trash2 } from 'lucide-react';
import { formatDate } from './utils';

const NotaryTab = ({ notaryRequests, onDelete }) => (
  <div className="overflow-x-auto" data-testid="admin-notary-panel">
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-800">
          <th className="pb-3 text-slate-400 font-semibold">Date</th>
          <th className="pb-3 text-slate-400 font-semibold">Name</th>
          <th className="pb-3 text-slate-400 font-semibold">Phone</th>
          <th className="pb-3 text-slate-400 font-semibold">Email</th>
          <th className="pb-3 text-slate-400 font-semibold">Paperwork</th>
          <th className="pb-3 text-slate-400 font-semibold">Preferred Time</th>
          <th className="pb-3 text-slate-400 font-semibold">Message</th>
          <th className="pb-3 text-slate-400 font-semibold text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {notaryRequests.length === 0 ? (
          <tr>
            <td colSpan="8" className="py-8 text-center text-slate-500">No notary requests yet</td>
          </tr>
        ) : (
          notaryRequests.map((n) => (
            <tr key={n.id} className="border-b border-slate-800" data-testid={`notary-row-${n.id}`}>
              <td className="py-3 text-white whitespace-nowrap">{formatDate(n.created_at)}</td>
              <td className="py-3 text-white">{n.name}</td>
              <td className="py-3 text-slate-300 text-sm whitespace-nowrap">
                <a href={`tel:${n.phone}`} className="hover:text-amber-400">{n.phone}</a>
              </td>
              <td className="py-3 text-slate-400 text-sm">
                {n.email ? <a href={`mailto:${n.email}`} className="hover:text-amber-400">{n.email}</a> : 'N/A'}
              </td>
              <td className="py-3 text-slate-300 text-sm max-w-[180px] truncate">{n.document_type || '-'}</td>
              <td className="py-3 text-slate-300 text-sm max-w-[180px] truncate">{n.preferred_time || '-'}</td>
              <td className="py-3 text-slate-400 text-sm max-w-xs truncate">{n.message || '-'}</td>
              <td className="py-3 text-right">
                <button
                  onClick={() => onDelete(n.id)}
                  data-testid={`delete-notary-${n.id}`}
                  title="Delete notary request"
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

export default NotaryTab;
