import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  getDashboardStats,
  getAdminDonations,
  exportDonationsCSV,
  getAdminVolunteers,
  getAdminContacts,
  getAdminPrayerRequests,
  getDonationProgress,
  updateMonthlyGoal,
  getAdminTodaySummary,
  getImpactStats,
  updateImpactStats,
  deletePrayerRequest,
  getAdminNotaryRequests,
  deleteNotaryRequest,
  getAdminResources,
  createResource,
  updateResource,
  deleteResource,
} from '../services/api';
import { RESOURCE_CATEGORIES } from './ResourceDirectory';

import AdminHeader from './admin/AdminHeader';
import TodayCard from './admin/TodayCard';
import ImpactEditor from './admin/ImpactEditor';
import GoalEditor from './admin/GoalEditor';
import StatsCards from './admin/StatsCards';
import TabBar from './admin/TabBar';
import DonationsTab from './admin/DonationsTab';
import VolunteersTab from './admin/VolunteersTab';
import ContactsTab from './admin/ContactsTab';
import PrayersTab from './admin/PrayersTab';
import NotaryTab from './admin/NotaryTab';
import ResourcesTab from './admin/ResourcesTab';
import ResourceModal from './admin/ResourceModal';

const emptyResource = (defaultCategory) => ({
  id: null,
  category: defaultCategory,
  name: '',
  description: '',
  address: '',
  phone: '',
  website: '',
  hours: '',
  notes: '',
  sort_order: 999,
  is_active: true,
});

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Auth + top-level data
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [donations, setDonations] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [prayers, setPrayers] = useState([]);
  const [notaryRequests, setNotaryRequests] = useState([]);
  const [resources, setResources] = useState([]);
  const [progress, setProgress] = useState(null);
  const [todaySummary, setTodaySummary] = useState(null);
  const [impact, setImpact] = useState(null);

  // UI state
  const [activeTab, setActiveTab] = useState('donations');

  // Editors
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [editingImpact, setEditingImpact] = useState(false);
  const [impactInputs, setImpactInputs] = useState({ lives_touched: '', kits_given: '', miracle_runs: '' });

  // Resource CRUD state
  const [resourceFilter, setResourceFilter] = useState('all');
  const [editingResource, setEditingResource] = useState(null);
  const [showResourceModal, setShowResourceModal] = useState(false);

  // Donation filters
  const [filters, setFilters] = useState({
    donation_type: '',
    start_date: '',
    end_date: '',
    min_amount: '',
    max_amount: '',
  });

  // ---- Auth guard + initial load ----
  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }
    setToken(adminToken);
    fetchAllData(adminToken);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const fetchAllData = async (adminToken) => {
    try {
      setLoading(true);
      const [
        statsData, donationsData, volunteersData, contactsData, prayersData,
        progressData, today, impactData, notaryData, resourcesData,
      ] = await Promise.all([
        getDashboardStats(adminToken),
        getAdminDonations(adminToken),
        getAdminVolunteers(adminToken),
        getAdminContacts(adminToken),
        getAdminPrayerRequests(adminToken),
        getDonationProgress(),
        getAdminTodaySummary().catch(() => null),
        getImpactStats().catch(() => null),
        getAdminNotaryRequests(adminToken).catch(() => []),
        getAdminResources(adminToken).catch(() => []),
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
      setNotaryRequests(notaryData || []);
      setResources(resourcesData || []);
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

  // ---- Goal ----
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
    } catch {
      toast.error('Failed to update goal');
    }
  };

  // ---- Impact ----
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

  const handleCancelImpactEdit = () => {
    setEditingImpact(false);
    setImpactInputs({
      lives_touched: String(impact?.lives_touched ?? 0),
      kits_given: String(impact?.kits_given ?? 0),
      miracle_runs: String(impact?.miracle_runs ?? 0),
    });
  };

  // ---- Prayers ----
  const handleDeletePrayer = async (prayerId) => {
    if (!window.confirm('Delete this prayer request? This cannot be undone.')) return;
    try {
      await deletePrayerRequest(prayerId);
      setPrayers((prev) => prev.filter((p) => p.id !== prayerId));
      toast.success('Prayer request deleted');
    } catch {
      toast.error('Failed to delete prayer request');
    }
  };

  // ---- Notary ----
  const handleDeleteNotary = async (notaryId) => {
    if (!window.confirm('Delete this notary request? This cannot be undone.')) return;
    try {
      await deleteNotaryRequest(notaryId, token);
      setNotaryRequests((prev) => prev.filter((n) => n.id !== notaryId));
      toast.success('Notary request deleted');
    } catch {
      toast.error('Failed to delete notary request');
    }
  };

  // ---- Resources ----
  const openNewResource = () => {
    const defaultCategory = resourceFilter !== 'all' ? resourceFilter : RESOURCE_CATEGORIES[0].key;
    setEditingResource(emptyResource(defaultCategory));
    setShowResourceModal(true);
  };

  const openEditResource = (r) => {
    setEditingResource({ ...r, is_active: r.is_active !== 0 && r.is_active !== false });
    setShowResourceModal(true);
  };

  const closeResourceModal = () => {
    setShowResourceModal(false);
    setEditingResource(null);
  };

  const handleResourceFieldChange = (field, value) => {
    setEditingResource((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveResource = async () => {
    if (!editingResource) return;
    if (!editingResource.category || !editingResource.name) {
      toast.error('Category and name are required.');
      return;
    }
    const payload = {
      category: editingResource.category,
      name: editingResource.name.trim(),
      description: editingResource.description || '',
      address: editingResource.address || '',
      phone: editingResource.phone || '',
      website: editingResource.website || '',
      hours: editingResource.hours || '',
      notes: editingResource.notes || '',
      sort_order: Number(editingResource.sort_order) || 999,
      is_active: !!editingResource.is_active,
    };
    try {
      if (editingResource.id) {
        const updated = await updateResource(editingResource.id, payload, token);
        setResources((prev) =>
          prev.map((r) => (r.id === editingResource.id ? { ...r, ...payload, updated_at: updated?.updated_at || r.updated_at } : r))
        );
        toast.success('Resource updated');
      } else {
        const created = await createResource(payload, token);
        setResources((prev) => [...prev, created]);
        toast.success('Resource added');
      }
      closeResourceModal();
    } catch {
      toast.error('Failed to save resource');
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Delete this resource? This cannot be undone.')) return;
    try {
      await deleteResource(resourceId, token);
      setResources((prev) => prev.filter((r) => r.id !== resourceId));
      toast.success('Resource deleted');
    } catch {
      toast.error('Failed to delete resource');
    }
  };

  const handleToggleResourceActive = async (resource) => {
    const nextActive = !(resource.is_active !== 0 && resource.is_active !== false);
    try {
      await updateResource(resource.id, { ...resource, is_active: nextActive }, token);
      setResources((prev) =>
        prev.map((r) => (r.id === resource.id ? { ...r, is_active: nextActive ? 1 : 0 } : r))
      );
    } catch {
      toast.error('Failed to update visibility');
    }
  };

  // ---- Donations filters ----
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = async () => {
    if (!token) return;
    try {
      const filtered = await getAdminDonations(token, filters);
      setDonations(filtered);
      toast.success('Filters applied');
    } catch {
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
    } catch {
      toast.error('Failed to export donations');
    }
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
        <AdminHeader onLogout={handleLogout} />

        <TodayCard summary={todaySummary} />

        <ImpactEditor
          impact={impact}
          editing={editingImpact}
          inputs={impactInputs}
          onEditStart={() => setEditingImpact(true)}
          onCancelEdit={handleCancelImpactEdit}
          onInputChange={(key, value) => setImpactInputs((prev) => ({ ...prev, [key]: value }))}
          onSave={handleSaveImpact}
        />

        <GoalEditor
          progress={progress}
          editing={editingGoal}
          goalInput={goalInput}
          onEditStart={() => setEditingGoal(true)}
          onCancelEdit={() => {
            setEditingGoal(false);
            setGoalInput(String(progress?.goal ?? ''));
          }}
          onGoalInputChange={setGoalInput}
          onSave={handleSaveGoal}
        />

        <StatsCards stats={stats} />

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <TabBar activeTab={activeTab} onChange={setActiveTab} />

          <div className="p-6">
            {activeTab === 'donations' && (
              <DonationsTab
                donations={donations}
                filters={filters}
                onFilterChange={handleFilterChange}
                onApplyFilters={applyFilters}
                onExportCSV={handleExportCSV}
              />
            )}
            {activeTab === 'volunteers' && <VolunteersTab volunteers={volunteers} />}
            {activeTab === 'contacts' && <ContactsTab contacts={contacts} />}
            {activeTab === 'prayers' && <PrayersTab prayers={prayers} onDelete={handleDeletePrayer} />}
            {activeTab === 'notary' && <NotaryTab notaryRequests={notaryRequests} onDelete={handleDeleteNotary} />}
            {activeTab === 'resources' && (
              <ResourcesTab
                resources={resources}
                resourceFilter={resourceFilter}
                onFilterChange={setResourceFilter}
                onOpenNew={openNewResource}
                onEdit={openEditResource}
                onDelete={handleDeleteResource}
                onToggleActive={handleToggleResourceActive}
              />
            )}
          </div>
        </div>
      </div>

      {showResourceModal && (
        <ResourceModal
          resource={editingResource}
          onFieldChange={handleResourceFieldChange}
          onSave={handleSaveResource}
          onClose={closeResourceModal}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
