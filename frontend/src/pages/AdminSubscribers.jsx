import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AtSign, Trash2, Download, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getSubscribers, deleteSubscriber } from '../services/api';

const AdminSubscribers = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (!t) {
      navigate('/admin/login');
      return;
    }
    setToken(t);
    fetchAll(t);
  }, [navigate]);

  const fetchAll = async (t) => {
    try {
      setLoading(true);
      const data = await getSubscribers(t);
      setSubs(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this subscriber?')) return;
    try {
      await deleteSubscriber(id, token);
      toast.success('Removed');
      fetchAll(token);
    } catch (e) {
      console.error(e);
      toast.error('Failed to remove');
    }
  };

  const exportCSV = () => {
    const header = 'email,name,created_at';
    const lines = subs.map(
      (s) =>
        `${s.email},"${(s.name || '').replace(/"/g, '""')}",${s.created_at}`
    );
    const csv = [header, ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fmt = (s) =>
    new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen pt-20 bg-slate-950" data-testid="admin-subscribers-page">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
          <div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center text-amber-400 hover:text-amber-300 mb-4 transition-colors"
            >
              <ArrowLeft className="mr-2" size={18} />
              Back to Dashboard
            </button>
            <h1 className="text-4xl font-bold text-white mb-2">
              <span className="text-amber-400">Notes</span> Subscribers
            </h1>
            <p className="text-slate-400">
              {subs.length} {subs.length === 1 ? 'person' : 'people'} subscribed to Notes from the Secret Place
            </p>
          </div>
          {subs.length > 0 && (
            <button
              onClick={exportCSV}
              className="px-4 py-2 bg-amber-500 text-slate-900 rounded-lg hover:bg-amber-400 font-semibold flex items-center transition-colors"
            >
              <Download className="mr-2" size={18} />
              Export CSV
            </button>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="text-amber-400 mx-auto mb-4 animate-spin" size={48} />
              <p className="text-slate-400">Loading...</p>
            </div>
          ) : subs.length === 0 ? (
            <div className="p-12 text-center">
              <AtSign className="text-slate-700 mx-auto mb-4" size={64} />
              <p className="text-slate-400 text-lg">No subscribers yet</p>
              <p className="text-slate-500 text-sm mt-2">
                When visitors subscribe from the Notes page, they'll appear here.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-950 border-b border-slate-800">
                <tr>
                  <th className="text-left px-6 py-3 text-amber-400 text-sm font-semibold">Email</th>
                  <th className="text-left px-6 py-3 text-amber-400 text-sm font-semibold">Name</th>
                  <th className="text-left px-6 py-3 text-amber-400 text-sm font-semibold">Subscribed</th>
                  <th className="text-right px-6 py-3 text-amber-400 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {subs.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-950 transition-colors">
                    <td className="px-6 py-4 text-white">{s.email}</td>
                    <td className="px-6 py-4 text-slate-300">{s.name || '—'}</td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{fmt(s.created_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(s.id)}
                        data-testid={`admin-subscriber-delete-${s.id}`}
                        className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSubscribers;
