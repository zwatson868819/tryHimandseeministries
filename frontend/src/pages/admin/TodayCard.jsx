import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Sparkles } from 'lucide-react';

const Metric = ({ value, label, color }) => (
  <div className="text-center">
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    <p className="text-xs text-slate-400 mt-1">{label}</p>
  </div>
);

const TodayCard = ({ summary }) => {
  const navigate = useNavigate();
  if (!summary) return null;
  return (
    <div
      data-testid="admin-today-card"
      className="bg-gradient-to-r from-slate-900 via-amber-900/10 to-slate-900 border border-amber-500/30 rounded-xl p-6 mb-6"
    >
      <div className="flex items-center mb-4">
        <TrendingUp className="text-amber-400 mr-3" size={26} />
        <div>
          <h3 className="text-white font-bold text-lg">Today at a Glance</h3>
          <p className="text-slate-400 text-sm">Activity in the last 24 hours</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Metric value={summary.new_donations} label="New donations" color="text-amber-400" />
        <Metric
          value={`$${Math.round(summary.new_donation_amount || 0).toLocaleString()}`}
          label="Raised today" color="text-green-400"
        />
        <Metric value={summary.new_prayer_requests} label="Prayer requests" color="text-pink-400" />
        <Metric value={summary.new_contacts} label="New CRM contacts" color="text-blue-400" />
        <Metric value={summary.new_subscribers} label="New subscribers" color="text-purple-400" />
        <Metric value={summary.followups_due_today} label="Follow-ups due" color="text-orange-400" />
      </div>
      {summary.new_testimonies_pending > 0 && (
        <div className="mt-4 pt-4 border-t border-amber-500/20 flex items-center justify-between flex-wrap gap-2">
          <p className="text-amber-300 text-sm">
            <Sparkles className="inline mr-1" size={14} />
            {summary.new_testimonies_pending} new testimon{summary.new_testimonies_pending === 1 ? 'y' : 'ies'} awaiting moderation
          </p>
          <button
            onClick={() => navigate('/admin/testimonies')}
            className="text-amber-400 text-sm font-semibold hover:text-amber-300"
          >
            Review &rarr;
          </button>
        </div>
      )}
    </div>
  );
};

export default TodayCard;
