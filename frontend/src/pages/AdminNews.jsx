import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Newspaper, Plus, Edit, Trash2, Image, Video, Save, X, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { getNews, createNews, updateNews, deleteNews, uploadFile } from '../services/api';

const AdminNews = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [newsPosts, setNewsPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_urls: [],
    video_urls: [],
    published: true
  });

  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }
    setToken(adminToken);
    fetchNews(adminToken);
  }, []);

  const fetchNews = async (adminToken) => {
    try {
      setLoading(true);
      const data = await getNews(100, false);
      setNewsPosts(data);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('Failed to load news posts');
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

  const handleFileUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => uploadFile(file, token));
      const results = await Promise.all(uploadPromises);
      
      const urls = results.map(r => r.url);
      setFormData({
        ...formData,
        [type === 'image' ? 'image_urls' : 'video_urls']: [
          ...formData[type === 'image' ? 'image_urls' : 'video_urls'],
          ...urls
        ]
      });
      toast.success(`${type === 'image' ? 'Images' : 'Videos'} uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = (type, index) => {
    const key = type === 'image' ? 'image_urls' : 'video_urls';
    setFormData({
      ...formData,
      [key]: formData[key].filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    try {
      if (editingPost) {
        await updateNews(editingPost.id, formData, token);
        toast.success('News post updated successfully');
      } else {
        await createNews(formData, token);
        toast.success('News post created successfully');
      }
      
      setShowForm(false);
      setEditingPost(null);
      resetForm();
      fetchNews(token);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(`Failed to ${editingPost ? 'update' : 'create'} news post`);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      image_urls: post.image_urls || [],
      video_urls: post.video_urls || [],
      published: post.published
    });
    setShowForm(true);
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this news post?')) return;
    if (!token) return;

    try {
      await deleteNews(postId, token);
      toast.success('News post deleted successfully');
      fetchNews(token);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete news post');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      image_urls: [],
      video_urls: [],
      published: true
    });
    setEditingPost(null);
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
              Manage <span className="text-amber-400">News</span>
            </h1>
            <p className="text-slate-400">Create, edit, and manage news posts</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg font-semibold hover:from-amber-400 hover:to-amber-500 transition-all flex items-center shadow-lg shadow-amber-500/30"
            >
              <Plus className="mr-2" size={20} />
              Create News Post
            </button>
          )}
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingPost ? 'Edit' : 'Create'} News Post
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
                <label className="block text-white font-semibold mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors"
                  placeholder="Enter news title"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-white font-semibold mb-2">Content *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows="10"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors resize-none"
                  placeholder="Enter news content..."
                ></textarea>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-white font-semibold mb-2">Images</label>
                <div className="mb-4">
                  <label className="flex items-center justify-center w-full px-4 py-3 bg-slate-950 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-amber-400 transition-colors">
                    <Image className="text-amber-400 mr-2" size={20} />
                    <span className="text-slate-400">Click to upload images</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'image')}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
                {formData.image_urls.length > 0 && (
                  <div className="grid grid-cols-4 gap-4">
                    {formData.image_urls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeMedia('image', index)}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-white font-semibold mb-2">Videos</label>
                <div className="mb-4">
                  <label className="flex items-center justify-center w-full px-4 py-3 bg-slate-950 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-amber-400 transition-colors">
                    <Video className="text-amber-400 mr-2" size={20} />
                    <span className="text-slate-400">Click to upload videos</span>
                    <input
                      type="file"
                      multiple
                      accept="video/*"
                      onChange={(e) => handleFileUpload(e, 'video')}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
                {formData.video_urls.length > 0 && (
                  <div className="space-y-2">
                    {formData.video_urls.map((url, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-950 rounded-lg">
                        <span className="text-slate-400 text-sm truncate">Video {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeMedia('video', index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                  disabled={uploading}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg font-semibold hover:from-amber-400 hover:to-amber-500 transition-all flex items-center disabled:opacity-50"
                >
                  <Save className="mr-2" size={20} />
                  {editingPost ? 'Update' : 'Create'} Post
                </button>
              </div>
            </form>
          </div>
        )}

        {/* News Posts List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Newspaper className="text-amber-400 mr-2" size={24} />
              All News Posts ({newsPosts.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin h-12 w-12 border-4 border-amber-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-400">Loading news posts...</p>
            </div>
          ) : newsPosts.length === 0 ? (
            <div className="p-12 text-center">
              <Newspaper className="text-slate-700 mx-auto mb-4" size={64} />
              <p className="text-slate-400 text-lg">No news posts yet</p>
              <p className="text-slate-500 text-sm mt-2">Click "Create News Post" to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {newsPosts.map((post) => (
                <div key={post.id} className="p-6 hover:bg-slate-950 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-bold text-white mr-4">{post.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          post.published 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mb-2">{formatDate(post.created_at)}</p>
                      <p className="text-slate-300 line-clamp-2 mb-3">{post.content.substring(0, 200)}...</p>
                      <div className="flex items-center text-slate-500 text-sm space-x-4">
                        {post.image_urls && post.image_urls.length > 0 && (
                          <span className="flex items-center">
                            <Image size={16} className="mr-1" />
                            {post.image_urls.length} image(s)
                          </span>
                        )}
                        {post.video_urls && post.video_urls.length > 0 && (
                          <span className="flex items-center">
                            <Video size={16} className="mr-1" />
                            {post.video_urls.length} video(s)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(post)}
                        className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
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

export default AdminNews;
