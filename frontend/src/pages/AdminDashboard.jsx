import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Users, Mail, Heart, Download, Filter, Calendar, LogOut, Newspaper, BookOpen, AtSign, Sparkles, Target, Edit, Check, HandHeart, TrendingUp, Gift } from 'lucide-react';
import { toast } from 'sonner';
import { getDashboardStats, getAdminDonations, exportDonationsCSV, getAdminVolunteers, getAdminContacts, getAdminPrayerRequests, getDonationProgress, updateMonthlyGoal, getAdminTodaySummary, getImpactStats, updateImpactStats } from '../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [stats, setStats] = useState(null);
  const [donations, setDonations] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('donations');
  const [progress, setProgress] = useState(null);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [todaySummary, setTodaySummary] = useState(null);
  const [impact, setImpact] = useState(null);
  const [editingImpact, setEditingImpact] = useState(false);
  const [impactInputs, setImpactInputs] = useState({ lives_touched: '', kits_given: '', miracle_runs: '' });
  const [filters, setFilters] = useState({
    donation_type: '',
    start_date: '',
    end_date: '',
    min_amount: '',
    max_amount: ''
  });

  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }
    setToken(adminToken);
    fetchAllData(adminToken);
  }, []);

  const fetchAllData = async (adminToken) => {
    try {
      setLoading(true);
      const [statsData, donationsData, volunteersData, contactsData, prayersData, progressData, today, impactData] = await Promise.all([
        getDashboardStats(adminToken),
        getAdminDonations(adminToken),
        getAdminVolunteers(adminToken),
        getAdminContacts(adminToken),
        getAdminPrayerRequests(adminToken),
        getDonationProgress(),
        getAdminTodaySummary().catch(() => null),
        getImpactStats().catch(() => null),
      ]);
      
      setStats(statsData);
      setDonations(donationsData);
      setVolunteers(volunteersData);
      setContacts(contactsData);
      setPrayers(prayersData);
      setProgress(progressData);
      setGoalInput(String(progressData?.goal ?? 1000));
      setTodaySummary(today);
      setImpact(impactData);
      if (impactData) {
        setImpactInputs({
          lives_touched: String(impactData.lives_touched ?? 0),
          kits_given: String(impactData.kits_given ?? 0),
          miracle_runs: String(impactData.miracle_runs ?? 0),
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        handleLogout();
      } else {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const handleSaveGoal = async () => {
    const goal = parseFloat(goalInput);
    if (!Number.isFinite(goal) || goal <= 0) {
      toast.error('Goal must be a positive number');
      return;
    }
    try {
      await updateMonthlyGoal(goal, token);
      const updated = await getDonationProgress();
      setProgress(updated);
      setEditingGoal(false);
      toast.success('Monthly goal updated');
    } catch (e) {
      toast.error('Failed to update goal');
    }
  };

  const handleSaveImpact = async () => {
    const payload = {
      lives_touched: parseInt(impactInputs.lives_touched, 10) || 0,
      kits_given: parseInt(impactInputs.kits_given, 10) || 0,
      miracle_runs: parseInt(impactInputs.miracle_runs, 10) || 0,
    };
    try {
      await updateImpactStats(payload);
      const updated = await getImpactStats();
      setImpact(updated);
      setEditingImpact(false);
      toast.success('Impact counters updated');
    } catch {
      toast.error('Failed to update impact counters');
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const applyFilters = async () => {
    if (!token) return;
    try {
      const filtered = await getAdminDonations(token, filters);
      setDonations(filtered);
      toast.success('Filters applied');
    } catch (error) {
      toast.error('Failed to apply filters');
    }
  };

  const handleExportCSV = async () => {
    if (!token) return;
    try {
      const blob = await exportDonationsCSV(token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `donations_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Donations exported successfully');
    } catch (error) {
      toast.error('Failed to export donations');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-amber-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Admin <span className="text-amber-400">Dashboard</span>
            </h1>
            <p className="text-slate-400">Manage your ministry data and settings</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/admin/encounters')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Newspaper className="mr-2" size={18} />
              Manage Encounters
            </button>
            <button
              onClick={() => navigate('/admin/news')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <Newspaper className="mr-2" size={18} />
              Manage News
            </button>
            <button
              onClick={() => navigate('/admin/blog')}
              data-testid="admin-manage-blog-btn"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
            >
              <BookOpen className="mr-2" size={18} />
              Manage Notes
            </button>
            <button
              onClick={() => navigate('/admin/subscribers')}
              data-testid="admin-manage-subscribers-btn"
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center"
            >
              <AtSign className="mr-2" size={18} />
              Subscribers
            </button>
            <button
              onClick={() => navigate('/admin/testimonies')}
              data-testid="admin-manage-testimonies-btn"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center"
            >
              <Sparkles className="mr-2" size={18} />
              Testimonies
            </button>
            <button
              onClick={() => navigate('/admin/lybtl')}
              data-testid="admin-manage-lybtl-btn"
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg font-semibold hover:from-amber-400 hover:to-amber-500 transition-all flex items-center"
            >
              <HandHeart className="mr-2" size={18} />
              Loving You Back To Life
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center"
            >
              <LogOut className="mr-2" size={18} />
              Logout
            </button>
          </div>
        </div>

        {/* Today at a Glance */}
        {todaySummary && (
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
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-400">{todaySummary.new_donations}</p>
                <p className="text-xs text-slate-400 mt-1">New donations</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">${Math.round(todaySummary.new_donation_amount || 0).toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-1">Raised today</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-pink-400">{todaySummary.new_prayer_requests}</p>
                <p className="text-xs text-slate-400 mt-1">Prayer requests</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">{todaySummary.new_contacts}</p>
                <p className="text-xs text-slate-400 mt-1">New CRM contacts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">{todaySummary.new_subscribers}</p>
                <p className="text-xs text-slate-400 mt-1">New subscribers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-400">{todaySummary.followups_due_today}</p>
                <p className="text-xs text-slate-400 mt-1">Follow-ups due</p>
              </div>
            </div>
            {todaySummary.new_testimonies_pending > 0 && (
              <div className="mt-4 pt-4 border-t border-amber-500/20 flex items-center justify-between flex-wrap gap-2">
                <p className="text-amber-300 text-sm">
                  <Sparkles className="inline mr-1" size={14} />
                  {todaySummary.new_testimonies_pending} new testimon{todaySummary.new_testimonies_pending === 1 ? 'y' : 'ies'} awaiting moderation
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
        )}

        {/* Impact Counters (Homepage Miracle Counter) */}
        {impact && (
          <div
            data-testid="admin-impact-card"
            className="bg-slate-900 border border-amber-500/30 rounded-xl p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center">
                <Gift className="text-amber-400 mr-3" size={26} />
                <div>
                  <h3 className="text-white font-bold text-lg">Homepage Impact Counter</h3>
                  <p className="text-slate-400 text-sm">Numbers shown in the &ldquo;Miracles in Motion&rdquo; section on the homepage</p>
                </div>
              </div>
              {editingImpact ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveImpact}
                    data-testid="admin-impact-save"
                    className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                  >
                    <Check size={16} className="mr-1" /> Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingImpact(false);
                      setImpactInputs({
                        lives_touched: String(impact.lives_touched ?? 0),
                        kits_given: String(impact.kits_given ?? 0),
                        miracle_runs: String(impact.miracle_runs ?? 0),
                      });
                    }}
                    className="px-3 py-2 bg-slate-700 text-white rounded hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingImpact(true)}
                  data-testid="admin-impact-edit"
                  className="px-3 py-2 bg-slate-800 text-amber-400 rounded hover:bg-slate-700 flex items-center"
                >
                  <Edit size={16} className="mr-1" /> Edit
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { key: 'lives_touched', label: 'Lives Touched' },
                { key: 'kits_given', label: 'Hygiene Kits Given' },
                { key: 'miracle_runs', label: 'Miracle Runs Completed' },
              ].map(({ key, label }) => (
                <div key={key} className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">{label}</p>
                  {editingImpact ? (
                    <input
                      type="number"
                      min="0"
                      value={impactInputs[key]}
                      onChange={(e) => setImpactInputs({ ...impactInputs, [key]: e.target.value })}
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
        )}

        {/* Monthly Goal Card */}
        {progress && (
          <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-6 mb-8" data-testid="admin-goal-card">
            <div className="flex justify-between items-start mb-4 flex-wrap gap-3">
              <div className="flex items-center">
                <Target className="text-amber-400 mr-3" size={28} />
                <div>
                  <h3 className="text-white font-bold text-lg">{progress.month} Outreach Goal</h3>
                  <p className="text-slate-400 text-sm">
                    ${Math.round(progress.raised).toLocaleString()} raised of ${Math.round(progress.goal).toLocaleString()} ({progress.percent}%)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {editingGoal ? (
                  <>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      <input
                        type="number"
                        min="1"
                        step="50"
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value)}
                        data-testid="admin-goal-input"
                        className="pl-7 pr-3 py-2 w-32 bg-slate-950 border border-slate-700 rounded text-white"
                      />
                    </div>
                    <button
                      onClick={handleSaveGoal}
                      data-testid="admin-goal-save"
                      className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingGoal(false);
                        setGoalInput(String(progress.goal));
                      }}
                      className="px-3 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditingGoal(true)}
                    data-testid="admin-goal-edit"
                    className="px-4 py-2 bg-amber-500 text-slate-900 rounded font-semibold hover:bg-amber-400 transition-colors flex items-center"
                  >
                    <Edit className="mr-2" size={16} />
                    Edit Goal
                  </button>
                )}
              </div>
            </div>
            <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700 ease-out"
                style={{ width: `${Math.max(progress.percent, progress.percent > 0 ? 2 : 0)}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <DollarSign className="text-amber-400" size={24} />
              </div>
            </div>
            <h3 className="text-slate-400 text-sm mb-1">Total Donations</h3>
            <p className="text-3xl font-bold text-white">{formatCurrency(stats?.total_donation_amount || 0)}</p>
            <p className="text-xs text-slate-500 mt-2">{stats?.total_donations || 0} transactions</p>
          </div>

          <div className="bg-slate-900 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Users className="text-purple-400" size={24} />
              </div>
            </div>
            <h3 className="text-slate-400 text-sm mb-1">Volunteers</h3>
            <p className="text-3xl font-bold text-white">{stats?.total_volunteers || 0}</p>
            <p className="text-xs text-slate-500 mt-2">Total applications</p>
          </div>

          <div className="bg-slate-900 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Mail className="text-blue-400" size={24} />
              </div>
            </div>
            <h3 className="text-slate-400 text-sm mb-1">Contacts</h3>
            <p className="text-3xl font-bold text-white">{stats?.total_contacts || 0}</p>
            <p className="text-xs text-slate-500 mt-2">Messages received</p>
          </div>

          <div className="bg-slate-900 border border-pink-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center">
                <Heart className="text-pink-400" size={24} />
              </div>
            </div>
            <h3 className="text-slate-400 text-sm mb-1">Prayer Requests</h3>
            <p className="text-3xl font-bold text-white">{stats?.total_prayer_requests || 0}</p>
            <p className="text-xs text-slate-500 mt-2">Active requests</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="flex border-b border-slate-800">
            {['donations', 'volunteers', 'contacts', 'prayers'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-semibold capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-amber-500 text-slate-900'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Donations Tab */}
            {activeTab === 'donations' && (
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
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm"
                      >
                        <option value="">All</option>
                        <option value="one-time">One-time</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">Start Date</label>
                      <input
                        type="date"
                        name="start_date"
                        value={filters.start_date}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">End Date</label>
                      <input
                        type="date"
                        name="end_date"
                        value={filters.end_date}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">Min Amount</label>
                      <input
                        type="number"
                        name="min_amount"
                        value={filters.min_amount}
                        onChange={handleFilterChange}
                        placeholder="$0"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">Max Amount</label>
                      <input
                        type="number"
                        name="max_amount"
                        value={filters.max_amount}
                        onChange={handleFilterChange}
                        placeholder="$1000"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-4 mt-4">
                    <button
                      onClick={applyFilters}
                      className="px-4 py-2 bg-amber-500 text-slate-900 rounded font-semibold hover:bg-amber-400 transition-colors"
                    >
                      Apply Filters
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition-colors flex items-center"
                    >
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
                          <td colSpan="6" className="py-8 text-center text-slate-500">
                            No donations found
                          </td>
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
            )}

            {/* Volunteers Tab */}
            {activeTab === 'volunteers' && (
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
                        <td colSpan="5" className="py-8 text-center text-slate-500">
                          No volunteer applications
                        </td>
                      </tr>
                    ) : (
                      volunteers.map((volunteer) => (
                        <tr key={volunteer.id} className="border-b border-slate-800">
                          <td className="py-3 text-white">{formatDate(volunteer.created_at)}</td>
                          <td className="py-3 text-white">{volunteer.name}</td>
                          <td className="py-3 text-slate-400 text-sm">{volunteer.email}</td>
                          <td className="py-3 text-slate-400 text-sm">{volunteer.phone || 'N/A'}</td>
                          <td className="py-3 text-white">{volunteer.opportunity}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Contacts Tab */}
            {activeTab === 'contacts' && (
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
                        <td colSpan="5" className="py-8 text-center text-slate-500">
                          No contact messages
                        </td>
                      </tr>
                    ) : (
                      contacts.map((contact) => (
                        <tr key={contact.id} className="border-b border-slate-800">
                          <td className="py-3 text-white">{formatDate(contact.created_at)}</td>
                          <td className="py-3 text-white">{contact.name}</td>
                          <td className="py-3 text-slate-400 text-sm">{contact.email}</td>
                          <td className="py-3 text-white">{contact.subject}</td>
                          <td className="py-3 text-slate-400 text-sm max-w-xs truncate">{contact.message}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Prayers Tab */}
            {activeTab === 'prayers' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="pb-3 text-slate-400 font-semibold">Date</th>
                      <th className="pb-3 text-slate-400 font-semibold">Name</th>
                      <th className="pb-3 text-slate-400 font-semibold">Email</th>
                      <th className="pb-3 text-slate-400 font-semibold">Request</th>
                      <th className="pb-3 text-slate-400 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prayers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-500">
                          No prayer requests
                        </td>
                      </tr>
                    ) : (
                      prayers.map((prayer) => (
                        <tr key={prayer.id} className="border-b border-slate-800">
                          <td className="py-3 text-white">{formatDate(prayer.created_at)}</td>
                          <td className="py-3 text-white">{prayer.display_name || prayer.name || 'Anonymous'}</td>
                          <td className="py-3 text-slate-400 text-sm">{prayer.email || 'N/A'}</td>
                          <td className="py-3 text-slate-400 text-sm max-w-md truncate">{prayer.request}</td>
                          <td className="py-3">
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-green-500/20 text-green-400">
                              {prayer.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
