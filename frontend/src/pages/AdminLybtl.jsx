import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Heart, Plus, Search, ArrowLeft, Calendar, Phone, MapPin, Gift, Loader2, Edit, Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getLybtlContacts,
  createLybtlContact,
  deleteLybtlContact,
  getLybtlUpcoming,
} from '../services/api';

const PRESET_TAGS = [
  'PEW Pantry',
  'Garments of Grace',
  'Hygiene Kit',
  'Monthly Miracle Run',
  'Volunteer',
  'Prayer Partner',
  'Event Attendee',
];

const AdminLybtl = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [upcoming, setUpcoming] = useState({ follow_ups: [], birthdays: [] });
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', phone: '', email: '', address: '', birthday: '', how_we_met: '', tags: [] });

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (!t) {
      navigate('/admin/login');
      return;
    }
    setToken(t);
  }, [navigate]);

  useEffect(() => {
    if (!token) return;
    fetchAll();
  }, [token]);

  const fetchAll = async (q = '') => {
    try {
      setLoading(true);
      const [list, up] = await Promise.all([getLybtlContacts(token, q), getLybtlUpcoming(token)]);
      setContacts(list);
      setUpcoming(up);
    } catch (e) {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAll(search);
  };

  const toggleTag = (tag) => {
    setNewForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const c = await createLybtlContact(newForm, token);
      toast.success('Contact added');
      setShowNew(false);
      setNewForm({ name: '', phone: '', email: '', address: '', birthday: '', how_we_met: '', tags: [] });
      navigate(`/admin/lybtl/${c.id}`);
    } catch {
      toast.error('Failed to add contact');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? All journal notes for this person will be lost.`)) return;
    try {
      await deleteLybtlContact(id, token);
      toast.success('Removed');
      fetchAll(search);
    } catch {
      toast.error('Failed to delete');
    }
  };

  const fmtDate = (s) => (s ? new Date(s + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : '');

  return (
    <div className="min-h-screen pt-20 bg-slate-950" data-testid="admin-lybtl-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center text-amber-400 hover:text-amber-300 mb-4 transition-colors"
          >
            <ArrowLeft className="mr-2" size={18} />
            Back to Dashboard
          </button>
          <div className="flex items-start gap-3">
            <Heart className="text-amber-400 mt-1" size={36} />
            <div>
              <h1 className="text-4xl font-bold text-white mb-1">
                Loving You <span className="text-amber-400">Back To Life</span>
              </h1>
              <p className="text-slate-400">Your private outreach contact book - names, journal notes, follow-ups</p>
            </div>
          </div>
        </div>

        {/* Upcoming */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-5" data-testid="lybtl-followups-card">
            <h3 className="text-white font-bold flex items-center mb-3">
              <Calendar className="text-amber-400 mr-2" size={20} />
              Follow-ups (next 14 days) - {upcoming.follow_ups.length}
            </h3>
            {upcoming.follow_ups.length === 0 ? (
              <p className="text-slate-500 text-sm">Nothing scheduled.</p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {upcoming.follow_ups.map((f) => (
                  <li key={f.id}>
                    <Link
                      to={`/admin/lybtl/${f.contact_id}`}
                      className="block p-2 -mx-2 rounded hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex justify-between gap-3">
                        <span className="text-white font-semibold">{f.name}</span>
                        <span className="text-amber-400 text-sm whitespace-nowrap">{fmtDate(f.follow_up_date)}</span>
                      </div>
                      {f.follow_up_reason && (
                        <p className="text-slate-400 text-sm mt-0.5">{f.follow_up_reason}</p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-slate-900 border border-pink-500/30 rounded-xl p-5" data-testid="lybtl-birthdays-card">
            <h3 className="text-white font-bold flex items-center mb-3">
              <Gift className="text-pink-400 mr-2" size={20} />
              Birthdays (next 14 days) - {upcoming.birthdays.length}
            </h3>
            {upcoming.birthdays.length === 0 ? (
              <p className="text-slate-500 text-sm">No birthdays coming up.</p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {upcoming.birthdays.map((b) => (
                  <li key={b.contact_id}>
                    <Link
                      to={`/admin/lybtl/${b.contact_id}`}
                      className="block p-2 -mx-2 rounded hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex justify-between gap-3">
                        <span className="text-white font-semibold">{b.name}</span>
                        <span className="text-pink-400 text-sm whitespace-nowrap">{fmtDate(b.date)}</span>
                      </div>
                      {b.phone && <p className="text-slate-400 text-sm">{b.phone}</p>}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Search + New */}
        <div className="flex justify-between items-center gap-4 mb-6 flex-wrap">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[280px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, phone, email, address..."
                data-testid="lybtl-search-input"
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
            >
              Search
            </button>
          </form>
          <button
            onClick={() => setShowNew(!showNew)}
            data-testid="lybtl-new-btn"
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg font-semibold hover:from-amber-400 hover:to-amber-500 flex items-center"
          >
            <Plus className="mr-2" size={18} />
            New Contact
          </button>
        </div>

        {/* Inline new form */}
        {showNew && (
          <form onSubmit={handleCreate} className="bg-slate-900 border border-amber-500/30 rounded-xl p-6 mb-6 grid md:grid-cols-2 gap-4" data-testid="lybtl-new-form">
            <div>
              <label className="block text-white font-semibold mb-1 text-sm">Name *</label>
              <input
                required
                value={newForm.name}
                onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                data-testid="lybtl-new-name"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-1 text-sm">Phone</label>
              <input
                value={newForm.phone}
                onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-1 text-sm">Email</label>
              <input
                type="email"
                value={newForm.email}
                onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-1 text-sm">Birthday</label>
              <input
                type="date"
                value={newForm.birthday}
                onChange={(e) => setNewForm({ ...newForm, birthday: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-white font-semibold mb-1 text-sm">Address</label>
              <input
                value={newForm.address}
                onChange={(e) => setNewForm({ ...newForm, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-white font-semibold mb-1 text-sm">How we met</label>
              <input
                value={newForm.how_we_met}
                onChange={(e) => setNewForm({ ...newForm, how_we_met: e.target.value })}
                placeholder="e.g. PEW Pantry event, March 8 2026"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-white font-semibold mb-2 text-sm">Tags</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_TAGS.map((t) => {
                  const active = newForm.tags.includes(t);
                  return (
                    <button
                      type="button"
                      key={t}
                      onClick={() => toggleTag(t)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        active ? 'bg-amber-500 text-slate-900 font-semibold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
              <button type="button" onClick={() => setShowNew(false)} className="px-4 py-2 bg-slate-700 text-white rounded">
                Cancel
              </button>
              <button
                type="submit"
                data-testid="lybtl-new-submit"
                className="px-5 py-2 bg-amber-500 text-slate-900 rounded font-semibold hover:bg-amber-400"
              >
                Add Contact
              </button>
            </div>
          </form>
        )}

        {/* List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="text-amber-400 mx-auto mb-4 animate-spin" size={48} />
              <p className="text-slate-400">Loading...</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-12 text-center">
              <Heart className="text-slate-700 mx-auto mb-4" size={64} />
              <p className="text-slate-400 text-lg">{search ? 'No matches' : 'No contacts yet'}</p>
              <p className="text-slate-500 text-sm mt-2">
                {search ? 'Try a different search.' : 'Click "New Contact" to begin loving people back to life.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {contacts.map((c) => (
                <div key={c.id} className="p-5 hover:bg-slate-950 transition-colors flex justify-between items-start gap-4">
                  <Link to={`/admin/lybtl/${c.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                    {c.photo_url ? (
                      <img src={c.photo_url} alt={c.name} className="w-14 h-14 rounded-full object-cover border border-slate-700 flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xl flex-shrink-0">
                        {c.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-white truncate">{c.name}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400 mt-1">
                        {c.phone && <span className="flex items-center"><Phone size={12} className="mr-1" />{c.phone}</span>}
                        {c.birthday && <span className="flex items-center"><Gift size={12} className="mr-1" />{c.birthday}</span>}
                        {c.address && <span className="flex items-center truncate"><MapPin size={12} className="mr-1" />{c.address}</span>}
                      </div>
                      {c.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {c.tags.map((t) => (
                            <span key={t} className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-xs rounded">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/lybtl/${c.id}`}
                      className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      title="Open"
                    >
                      <Edit size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLybtl;
