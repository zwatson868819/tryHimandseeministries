import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Edit, Trash2, Save, X, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { getLessons, createLesson, updateLesson, deleteLesson } from '../services/api';

const AdminEncounters = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    week_number: 1,
    published: true
  });

  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }
    setToken(adminToken);
    fetchLessons(adminToken);
  }, []);

  const fetchLessons = async (adminToken) => {
    try {
      setLoading(true);
      const data = await getLessons(100, false);
      setLessons(data);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast.error('Failed to load lessons');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    try {
      if (editingLesson) {
        await updateLesson(editingLesson.id, formData, token);
        toast.success('Encounter lesson updated successfully');
      } else {
        await createLesson(formData, token);
        toast.success('Encounter lesson created successfully');
      }
      
      setShowForm(false);
      setEditingLesson(null);
      resetForm();
      fetchLessons(token);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(`Failed to ${editingLesson ? 'update' : 'create'} lesson`);
    }
  };

  const handleEdit = (lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      content: lesson.content,
      week_number: lesson.week_number || 1,
      published: lesson.published
    });
    setShowForm(true);
  };

  const handleDelete = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson? This will also delete all associated comments.')) return;
    if (!token) return;

    try {
      await deleteLesson(lessonId, token);
      toast.success('Lesson deleted successfully');
      fetchLessons(token);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete lesson');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      week_number: lessons.length + 1,
      published: true
    });
    setEditingLesson(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen pt-20 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center text-amber-400 hover:text-amber-300 mb-4 transition-colors"
            >
              <ArrowLeft className="mr-2" size={18} />
              Back to Dashboard
            </button>
            <h1 className="text-4xl font-bold text-white mb-2">
              Manage <span className="text-amber-400">Encounters</span>
            </h1>
            <p className="text-slate-400">Create and manage weekly encounter lessons</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg font-semibold hover:from-amber-400 hover:to-amber-500 transition-all flex items-center shadow-lg shadow-amber-500/30"
            >
              <Plus className="mr-2" size={20} />
              Create Lesson
            </button>
          )}
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingLesson ? 'Edit' : 'Create'} Encounter Lesson
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-white font-semibold mb-2">Lesson Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors"
                  placeholder="e.g., Worship as a Lifestyle"
                />
              </div>

              {/* Week Number */}
              <div>
                <label className="block text-white font-semibold mb-2">Week Number *</label>
                <input
                  type="number"
                  name="week_number"
                  value={formData.week_number}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-white font-semibold mb-2">Lesson Content *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows="15"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors resize-none"
                  placeholder="Enter the full lesson content here..."
                ></textarea>
              </div>

              {/* Published Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="published"
                  name="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-5 h-5 text-amber-500 bg-slate-950 border-slate-700 rounded focus:ring-amber-400"
                />
                <label htmlFor="published" className="ml-3 text-white font-semibold">
                  Publish immediately
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg font-semibold hover:from-amber-400 hover:to-amber-500 transition-all flex items-center"
                >
                  <Save className="mr-2" size={20} />
                  {editingLesson ? 'Update' : 'Create'} Lesson
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lessons List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <BookOpen className="text-amber-400 mr-2" size={24} />
              All Encounter Lessons ({lessons.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin h-12 w-12 border-4 border-amber-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-400">Loading lessons...</p>
            </div>
          ) : lessons.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="text-slate-700 mx-auto mb-4" size={64} />
              <p className="text-slate-400 text-lg">No encounter lessons yet</p>
              <p className="text-slate-500 text-sm mt-2">Click "Create Lesson" to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {lessons.map((lesson) => (
                <div key={lesson.id} className="p-6 hover:bg-slate-950 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-amber-400 font-semibold mr-3">Week {lesson.week_number}</span>
                        <h3 className="text-xl font-bold text-white mr-4">{lesson.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          lesson.published 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {lesson.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mb-2">{formatDate(lesson.created_at)}</p>
                      <p className="text-slate-300 line-clamp-2 mb-3">{lesson.content.substring(0, 200)}...</p>
                      <div className="flex items-center text-slate-500 text-sm">
                        <span>{lesson.comment_count || 0} comment(s)</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(lesson)}
                        className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(lesson.id)}
                        className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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

export default AdminEncounters;
