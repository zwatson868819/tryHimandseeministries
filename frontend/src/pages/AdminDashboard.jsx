import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Users, Mail, Heart, Download, Filter, Calendar, LogOut, Newspaper } from 'lucide-react';
import { toast } from 'sonner';
import { getDashboardStats, getAdminDonations, exportDonationsCSV, getAdminVolunteers, getAdminContacts, getAdminPrayerRequests } from '../services/api';

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
      const [statsData, donationsData, volunteersData, contactsData, prayersData] = await Promise.all([
        getDashboardStats(adminToken),
        getAdminDonations(adminToken),
        getAdminVolunteers(adminToken),
        getAdminContacts(adminToken),
        getAdminPrayerRequests(adminToken)
      ]);
      
      setStats(statsData);
      setDonations(donationsData);
      setVolunteers(volunteersData);
      setContacts(contactsData);
      setPrayers(prayersData);
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
          <div className="flex space-x-4">
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
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center"
            >
              <LogOut className="mr-2" size={18} />
              Logout
            </button>
          </div>
        </div>

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
