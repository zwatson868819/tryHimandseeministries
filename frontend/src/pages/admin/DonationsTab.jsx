import React from 'react';
import { Filter, Download } from 'lucide-react';
import { formatDate, formatCurrency } from './utils';

const DonationsTab = ({ donations, filters, onFilterChange, onApplyFilters, onExportCSV }) => (
  <div>
    {/* Filters */}
    <div className="mb-6 p-4 bg-slate-950 border border-slate-800 rounded-lg">
      <div className="flex items-center mb-4">
        <Filter className="text-amber-400 mr-2" size={20} />
        <h3 className="text-white font-semibold">Filter Donations</h3>
      </div>
      <div className="grid md:grid-cols-5 gap-4">
        <div>
          <label className="block text-slate-400 text-sm mb-2">Type</label>
          <select
            name="donation_type"
            value={filters.donation_type}
            onChange={onFilterChange}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm"
          >
            <option value="">All</option>
            <option value="one-time">One-time</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-2">Start Date</label>
          <input type="date" name="start_date" value={filters.start_date} onChange={onFilterChange}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm" />
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-2">End Date</label>
          <input type="date" name="end_date" value={filters.end_date} onChange={onFilterChange}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm" />
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-2">Min Amount</label>
          <input type="number" name="min_amount" value={filters.min_amount} onChange={onFilterChange} placeholder="$0"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm" />
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-2">Max Amount</label>
          <input type="number" name="max_amount" value={filters.max_amount} onChange={onFilterChange} placeholder="$1000"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm" />
        </div>
      </div>
      <div className="flex space-x-4 mt-4">
        <button onClick={onApplyFilters}
          className="px-4 py-2 bg-amber-500 text-slate-900 rounded font-semibold hover:bg-amber-400 transition-colors">
          Apply Filters
        </button>
        <button onClick={onExportCSV}
          className="px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition-colors flex items-center">
          <Download className="mr-2" size={18} />
          Export CSV
        </button>
      </div>
    </div>

    {/* Donations Table */}
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-800">
            <th className="pb-3 text-slate-400 font-semibold">Date</th>
            <th className="pb-3 text-slate-400 font-semibold">Name</th>
            <th className="pb-3 text-slate-400 font-semibold">Email</th>
            <th className="pb-3 text-slate-400 font-semibold">Amount</th>
            <th className="pb-3 text-slate-400 font-semibold">Type</th>
            <th className="pb-3 text-slate-400 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {donations.length === 0 ? (
            <tr>
              <td colSpan="6" className="py-8 text-center text-slate-500">No donations found</td>
            </tr>
          ) : (
            donations.map((donation) => (
              <tr key={donation.id} className="border-b border-slate-800">
                <td className="py-3 text-white">{formatDate(donation.created_at)}</td>
                <td className="py-3 text-white">{donation.name}</td>
                <td className="py-3 text-slate-400 text-sm">{donation.email}</td>
                <td className="py-3 text-amber-400 font-semibold">{formatCurrency(donation.amount)}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    donation.donation_type === 'monthly'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {donation.donation_type}
                  </span>
                </td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    donation.status === 'completed'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {donation.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default DonationsTab;
