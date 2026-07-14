import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, X, Trash2, Edit, ArrowLeft, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { getAdminTestimonies, updateTestimony, deleteTestimony } from '../services/api';

const AdminTestimonies = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', location: '', testimony: '' });

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (!t) {
      navigate('/admin/login');
      return;
    }
    setToken(t);
  }, [navigate]);

  useEffect(() => {
    if (token) fetchItems();
  }, [token, filter]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await getAdminTestimonies(token, filter === 'all' ? null : filter);
      setItems(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await updateTestimony(id, { status: 'approved' }, token);
      toast.success('Testimony approved - now live on site');
      fetchItems();
    } catch {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      await updateTestimony(id, { status: 'rejected' }, token);
      toast.success('Marked as rejected');
      fetchItems();
    } catch {
      toast.error('Failed to reject');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this testimony?')) return;
    try {
      await deleteTestimony(id, token);
      toast.success('Deleted');
      fetchItems();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const startEdit = (item) => {
    setEditing(item.id);
    setEditForm({
      name: item.name,
      location: item.location || '',
      testimony: item.testimony,
    });
  };

  const saveEdit = async () => {
    try {
      await updateTestimony(editing, editForm, token);
      toast.success('Saved');
      setEditing(null);
      fetchItems();
    } catch {
      toast.error('Failed to save');
    }
  };

  const fmt = (s) =>
    new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const statusBadge = (s) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      approved: 'bg-green-500/20 text-green-400',
      rejected: 'bg-red-500/20 text-red-400',
    };
    return styles[s] || styles.pending;
  };

  return (
    <div className="min-h-screen pt-20 bg-slate-950" data-testid="admin-testimonies-page">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center text-amber-400 hover:text-amber-300 mb-4 transition-colors"
          >
            <ArrowLeft className="mr-2" size={18} />
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">
            Manage <span className="text-amber-400">Testimonies</span>
          </h1>
          <p className="text-slate-400">Review submissions and publish approved testimonies to your site</p>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {['pending', 'approved', 'rejected', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              data-testid={`admin-testimonies-filter-${f}`}
              className={`px-4 py-2 rounded-lg font-semibold capitalize transition-all ${
                filter === f
                  ? 'bg-amber-500 text-slate-900'
                  : 'bg-slate-900 text-slate-400 hover:text-amber-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="text-amber-400 mx-auto mb-4 animate-spin" size={48} />
              <p className="text-slate-400">Loading...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center">
              <Sparkles className="text-slate-700 mx-auto mb-4" size={64} />
              <p className="text-slate-400 text-lg">No {filter !== 'all' ? filter : ''} testimonies</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {items.map((item) => (
                <div key={item.id} className="p-6">
                  <div className="flex justify-between items-start mb-3 flex-wrap gap-3">
                    <div className="flex-1 min-w-0">
                      {editing === item.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            placeholder="Name"
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                          />
                          <input
                            type="text"
                            value={editForm.location}
                            onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                            placeholder="Location"
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 flex-wrap mb-1">
                            <h3 className="text-xl font-bold text-white">{item.name}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${statusBadge(item.status)}`}>
                              {item.status}
                            </span>
                          </div>
                          <p className="text-slate-500 text-sm flex items-center gap-3 flex-wrap">
                            {item.location && (
                              <span className="flex items-center">
                                <MapPin size={14} className="mr-1" />
                                {item.location}
                              </span>
                            )}
                            <span>{fmt(item.created_at)}</span>
                            {item.email && <span className="text-slate-600">{item.email}</span>}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {editing === item.id ? (
                    <textarea
                      value={editForm.testimony}
                      onChange={(e) => setEditForm({ ...editForm, testimony: e.target.value })}
                      rows="5"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-slate-200 mb-3 resize-none"
                    />
                  ) : (
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap mb-4">
                      "{item.testimony}"
                    </p>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {editing === item.id ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
                        >
                          <Check className="mr-1" size={16} /> Save
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        {item.status !== 'approved' && (
                          <button
                            onClick={() => handleApprove(item.id)}
                            data-testid={`admin-testimony-approve-${item.id}`}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center"
                          >
                            <Check className="mr-1" size={16} /> Approve
                          </button>
                        )}
                        {item.status === 'approved' && (
                          <button
                            onClick={() => handleReject(item.id)}
                            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors flex items-center"
                          >
                            <X className="mr-1" size={16} /> Unpublish
                          </button>
                        )}
                        {item.status === 'pending' && (
                          <button
                            onClick={() => handleReject(item.id)}
                            data-testid={`admin-testimony-reject-${item.id}`}
                            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors flex items-center"
                          >
                            <X className="mr-1" size={16} /> Reject
                          </button>
                        )}
                        <button
                          onClick={() => startEdit(item)}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
                        >
                          <Edit className="mr-1" size={16} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          data-testid={`admin-testimony-delete-${item.id}`}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center"
                        >
                          <Trash2 className="mr-1" size={16} /> Delete
                        </button>
                      </>
                    )}
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

export default AdminTestimonies;
