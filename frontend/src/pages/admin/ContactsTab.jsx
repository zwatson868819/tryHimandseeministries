import React from 'react';
import { formatDate } from './utils';

const ContactsTab = ({ contacts }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-800">
          <th className="pb-3 text-slate-400 font-semibold">Date</th>
          <th className="pb-3 text-slate-400 font-semibold">Name</th>
          <th className="pb-3 text-slate-400 font-semibold">Email</th>
          <th className="pb-3 text-slate-400 font-semibold">Subject</th>
          <th className="pb-3 text-slate-400 font-semibold">Message</th>
        </tr>
      </thead>
      <tbody>
        {contacts.length === 0 ? (
          <tr>
            <td colSpan="5" className="py-8 text-center text-slate-500">No contact messages</td>
          </tr>
        ) : (
          contacts.map((c) => (
            <tr key={c.id} className="border-b border-slate-800">
              <td className="py-3 text-white">{formatDate(c.created_at)}</td>
              <td className="py-3 text-white">{c.name}</td>
              <td className="py-3 text-slate-400 text-sm">{c.email}</td>
              <td className="py-3 text-white">{c.subject}</td>
              <td className="py-3 text-slate-400 text-sm max-w-xs truncate">{c.message}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default ContactsTab;
