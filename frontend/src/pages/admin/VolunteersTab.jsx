import React from 'react';
import { formatDate } from './utils';

const VolunteersTab = ({ volunteers }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-800">
          <th className="pb-3 text-slate-400 font-semibold">Date</th>
          <th className="pb-3 text-slate-400 font-semibold">Name</th>
          <th className="pb-3 text-slate-400 font-semibold">Email</th>
          <th className="pb-3 text-slate-400 font-semibold">Phone</th>
          <th className="pb-3 text-slate-400 font-semibold">Opportunity</th>
        </tr>
      </thead>
      <tbody>
        {volunteers.length === 0 ? (
          <tr>
            <td colSpan="5" className="py-8 text-center text-slate-500">No volunteer applications</td>
          </tr>
        ) : (
          volunteers.map((v) => (
            <tr key={v.id} className="border-b border-slate-800">
              <td className="py-3 text-white">{formatDate(v.created_at)}</td>
              <td className="py-3 text-white">{v.name}</td>
              <td className="py-3 text-slate-400 text-sm">{v.email}</td>
              <td className="py-3 text-slate-400 text-sm">{v.phone || 'N/A'}</td>
              <td className="py-3 text-white">{v.opportunity}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default VolunteersTab;
