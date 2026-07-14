import React from 'react';
import { DollarSign, Users, Mail, Heart } from 'lucide-react';
import { formatCurrency } from './utils';

const StatCard = ({ icon: Icon, iconColor, borderColor, title, value, sub }) => (
  <div className={`bg-slate-900 border ${borderColor} rounded-xl p-6`}>
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 ${iconColor.bg} rounded-lg flex items-center justify-center`}>
        <Icon className={iconColor.text} size={24} />
      </div>
    </div>
    <h3 className="text-slate-400 text-sm mb-1">{title}</h3>
    <p className="text-3xl font-bold text-white">{value}</p>
    <p className="text-xs text-slate-500 mt-2">{sub}</p>
  </div>
);

const StatsCards = ({ stats }) => (
  <div className="grid md:grid-cols-4 gap-6 mb-8">
    <StatCard
      icon={DollarSign}
      iconColor={{ bg: 'bg-amber-500/10', text: 'text-amber-400' }}
      borderColor="border-amber-500/30"
      title="Total Donations"
      value={formatCurrency(stats?.total_donation_amount || 0)}
      sub={`${stats?.total_donations || 0} transactions`}
    />
    <StatCard
      icon={Users}
      iconColor={{ bg: 'bg-purple-500/10', text: 'text-purple-400' }}
      borderColor="border-purple-500/30"
      title="Volunteers"
      value={stats?.total_volunteers || 0}
      sub="Total applications"
    />
    <StatCard
      icon={Mail}
      iconColor={{ bg: 'bg-blue-500/10', text: 'text-blue-400' }}
      borderColor="border-blue-500/30"
      title="Contacts"
      value={stats?.total_contacts || 0}
      sub="Messages received"
    />
    <StatCard
      icon={Heart}
      iconColor={{ bg: 'bg-pink-500/10', text: 'text-pink-400' }}
      borderColor="border-pink-500/30"
      title="Prayer Requests"
      value={stats?.total_prayer_requests || 0}
      sub="Active requests"
    />
  </div>
);

export default StatsCards;
