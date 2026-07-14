import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, Plus, Phone, Mail, MapPin, Gift, Users, Camera, Loader2,
  Calendar, Check, Trash2, BookOpen, X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getLybtlContact,
  updateLybtlContact,
  getLybtlJournal,
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  uploadFile,
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

const AdminLybtlContact = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [contact, setContact] = useState(null);
  const [journal, setJournal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newEntry, setNewEntry] = useState({ note: '', follow_up_date: '', follow_up_reason: '' });
  const [addingEntry, setAddingEntry] = useState(false);

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
    refresh();
  }, [token, id]);

  const refresh = async () => {
    try {
      setLoading(true);
      const [c, j] = await Promise.all([getLybtlContact(id, token), getLybtlJournal(id, token)]);
      setContact(c);
      setJournal(j);
    } catch {
      toast.error('Failed to load contact');
    } finally {
      setLoading(false);
    }
  };

  const handleField = (k, v) => setContact((c) => ({ ...c, [k]: v }));

  const toggleTag = (tag) => {
    setContact((c) => {
      const tags = c.tags || [];
      return { ...c, tags: tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag] };
    });
  };

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadFile(file, token);
      setContact((c) => ({ ...c, photo_url: res.url }));
      toast.success('Photo uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateLybtlContact(id, contact, token);
      toast.success('Saved');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!newEntry.note.trim()) return;
    setAddingEntry(true);
    try {
      await addJournalEntry(id, newEntry, token);
      toast.success('Note added');
      setNewEntry({ note: '', follow_up_date: '', follow_up_reason: '' });
      refresh();
    } catch {
      toast.error('Failed to add note');
    } finally {
      setAddingEntry(false);
    }
  };

  const handleMarkDone = async (entryId) => {
    try {
      await updateJournalEntry(entryId, { status: 'done' }, token);
      toast.success('Marked done');
      refresh();
    } catch {
      toast.error('Failed');
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Delete this journal entry?')) return;
    try {
      await deleteJournalEntry(entryId, token);
      toast.success('Deleted');
      refresh();
    } catch {
      toast.error('Failed');
    }
  };

  const fmt = (s) =>
    s ? new Date(s + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : '';
  const fmtTime = (s) =>
    new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading || !contact) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-slate-950">
        <Loader2 className="text-amber-400 animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-slate-950" data-testid="admin-lybtl-contact-page">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/admin/lybtl')}
          className="flex items-center text-amber-400 hover:text-amber-300 mb-6 transition-colors"
        >
          <ArrowLeft className="mr-2" size={18} />
          Back to all contacts
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: profile */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              {/* Photo */}
              <div className="text-center mb-4">
                <div className="relative inline-block">
                  {contact.photo_url ? (
                    <img src={contact.photo_url} alt={contact.name} className="w-32 h-32 rounded-full object-cover border-2 border-amber-500/40 mx-auto" />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-5xl mx-auto">
                      {contact.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-amber-500 text-slate-900 rounded-full p-2 cursor-pointer hover:bg-amber-400 shadow-lg">
                    <Camera size={16} />
                    <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" disabled={uploading} />
                  </label>
                </div>
                {uploading && <p className="text-slate-400 text-sm mt-2">Uploading...</p>}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-amber-400 text-xs font-semibold mb-1 uppercase tracking-wide">Name</label>
                  <input
                    value={contact.name || ''}
                    onChange={(e) => handleField('name', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white text-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-amber-400 text-xs font-semibold mb-1 uppercase tracking-wide flex items-center"><Phone size={12} className="mr-1" />Phone</label>
                  <input
                    value={contact.phone || ''}
                    onChange={(e) => handleField('phone', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-amber-400 text-xs font-semibold mb-1 uppercase tracking-wide flex items-center"><Mail size={12} className="mr-1" />Email</label>
                  <input
                    type="email"
                    value={contact.email || ''}
                    onChange={(e) => handleField('email', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-amber-400 text-xs font-semibold mb-1 uppercase tracking-wide flex items-center"><MapPin size={12} className="mr-1" />Address</label>
                  <input
                    value={contact.address || ''}
                    onChange={(e) => handleField('address', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-amber-400 text-xs font-semibold mb-1 uppercase tracking-wide flex items-center"><Gift size={12} className="mr-1" />Birthday</label>
                  <input
                    type="date"
                    value={contact.birthday || ''}
                    onChange={(e) => handleField('birthday', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-amber-400 text-xs font-semibold mb-1 uppercase tracking-wide">How we met</label>
                  <input
                    value={contact.how_we_met || ''}
                    onChange={(e) => handleField('how_we_met', e.target.value)}
                    placeholder="e.g. PEW Pantry, March 8 2026"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-amber-400 text-xs font-semibold mb-1 uppercase tracking-wide flex items-center"><Users size={12} className="mr-1" />Family / Dependents</label>
                  <textarea
                    rows="3"
                    value={contact.family_notes || ''}
                    onChange={(e) => handleField('family_notes', e.target.value)}
                    placeholder="Spouse, kids, who lives with them..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white resize-none"
                  />
                </div>
                <div>
                  <label className="block text-amber-400 text-xs font-semibold mb-2 uppercase tracking-wide">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_TAGS.map((t) => {
                      const active = (contact.tags || []).includes(t);
                      return (
                        <button
                          type="button"
                          key={t}
                          onClick={() => toggleTag(t)}
                          className={`px-3 py-1 rounded-full text-xs transition-colors ${
                            active ? 'bg-amber-500 text-slate-900 font-semibold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                data-testid="lybtl-save-contact"
                className="mt-6 w-full px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded font-semibold hover:from-amber-400 hover:to-amber-500 transition-all flex items-center justify-center disabled:opacity-50"
              >
                <Save className="mr-2" size={18} />
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>

          {/* Right: Next Step Journal */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white flex items-center mb-1">
                <BookOpen className="text-amber-400 mr-2" size={24} />
                Next Step <span className="text-amber-400 ml-2">Journal</span>
              </h2>
              <p className="text-slate-500 text-sm mb-4">Notes, prayers, and follow-ups for {contact.name}</p>

              <form onSubmit={handleAddEntry} className="space-y-3 mb-6">
                <textarea
                  required
                  rows="3"
                  value={newEntry.note}
                  onChange={(e) => setNewEntry({ ...newEntry, note: e.target.value })}
                  placeholder="What happened? What's on your heart for them?"
                  data-testid="lybtl-new-note"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white resize-none"
                />
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-amber-400 text-xs font-semibold mb-1 uppercase tracking-wide">Follow-up date (optional)</label>
                    <input
                      type="date"
                      value={newEntry.follow_up_date}
                      onChange={(e) => setNewEntry({ ...newEntry, follow_up_date: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-amber-400 text-xs font-semibold mb-1 uppercase tracking-wide">Reason</label>
                    <input
                      value={newEntry.follow_up_reason}
                      onChange={(e) => setNewEntry({ ...newEntry, follow_up_reason: e.target.value })}
                      placeholder="e.g. Job interview"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={addingEntry}
                  data-testid="lybtl-add-entry"
                  className="px-4 py-2 bg-amber-500 text-slate-900 rounded font-semibold hover:bg-amber-400 flex items-center disabled:opacity-50"
                >
                  <Plus className="mr-2" size={18} />
                  {addingEntry ? 'Adding...' : 'Add Journal Entry'}
                </button>
              </form>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-800">
                <h3 className="text-white font-bold">All entries ({journal.length})</h3>
              </div>
              {journal.length === 0 ? (
                <div className="p-12 text-center">
                  <BookOpen className="text-slate-700 mx-auto mb-4" size={64} />
                  <p className="text-slate-400">No journal entries yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {journal.map((e) => (
                    <div key={e.id} className={`p-5 ${e.status === 'done' ? 'opacity-60' : ''}`}>
                      <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                        <span className="text-slate-500 text-xs">{fmtTime(e.created_at)}</span>
                        <div className="flex gap-2">
                          {e.follow_up_date && e.status === 'active' && (
                            <button
                              onClick={() => handleMarkDone(e.id)}
                              className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                            >
                              <Check size={12} className="mr-1" /> Mark Done
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteEntry(e.id)}
                            className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-200 whitespace-pre-wrap mb-2">{e.note}</p>
                      {e.follow_up_date && (
                        <div className={`inline-flex items-center text-xs px-2.5 py-1 rounded ${e.status === 'done' ? 'bg-slate-800 text-slate-500 line-through' : 'bg-amber-500/15 text-amber-400'}`}>
                          <Calendar size={12} className="mr-1.5" />
                          <span>Follow up {fmt(e.follow_up_date)}{e.follow_up_reason ? ` - ${e.follow_up_reason}` : ''}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLybtlContact;
