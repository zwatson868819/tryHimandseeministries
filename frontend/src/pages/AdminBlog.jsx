import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Edit, Trash2, Image, Video, Save, X, ArrowLeft, User } from 'lucide-react';
import { toast } from 'sonner';
import {
  getBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  uploadFile,
} from '../services/api';

const AdminBlog = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    content: '',
    image_urls: [],
    video_urls: [],
    published: true,
  });

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (!t) {
      navigate('/admin/login');
      return;
    }
    setToken(t);
    fetchPosts();
  }, [navigate]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await getBlogPosts(100, false);
      setPosts(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const results = await Promise.all(files.map((f) => uploadFile(f, token)));
      const urls = results.map((r) => r.url);
      setFormData((fd) => ({
        ...fd,
        [type === 'image' ? 'image_urls' : 'video_urls']: [
          ...fd[type === 'image' ? 'image_urls' : 'video_urls'],
          ...urls,
        ],
      }));
      toast.success(`${type === 'image' ? 'Images' : 'Videos'} uploaded`);
    } catch (e) {
      console.error(e);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = (type, index) => {
    const key = type === 'image' ? 'image_urls' : 'video_urls';
    setFormData({ ...formData, [key]: formData[key].filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    try {
      if (editing) {
        await updateBlogPost(editing.id, formData, token);
        toast.success('Note updated');
      } else {
        await createBlogPost(formData, token);
        toast.success('Note created — subscribers will be emailed');
      }
      setShowForm(false);
      setEditing(null);
      resetForm();
      fetchPosts();
    } catch (e) {
      console.error(e);
      toast.error(`Failed to ${editing ? 'update' : 'create'} post`);
    }
  };

  const handleEdit = (post) => {
    setEditing(post);
    setFormData({
      title: post.title,
      author: post.author || '',
      content: post.content,
      image_urls: post.image_urls || [],
      video_urls: post.video_urls || [],
      published: post.published,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await deleteBlogPost(id, token);
      toast.success('Deleted');
      fetchPosts();
    } catch (e) {
      console.error(e);
      toast.error('Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', author: '', content: '', image_urls: [], video_urls: [], published: true });
    setEditing(null);
  };

  const fmt = (s) =>
    new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen pt-20 bg-slate-950" data-testid="admin-blog-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              data-testid="admin-blog-back"
              className="flex items-center text-amber-400 hover:text-amber-300 mb-4 transition-colors"
            >
              <ArrowLeft className="mr-2" size={18} />
              Back to Dashboard
            </button>
            <h1 className="text-4xl font-bold text-white mb-2">
              <span className="text-amber-400">Notes</span> from the Secret Place
            </h1>
            <p className="text-slate-400">Manage your personal writings and devotionals</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              data-testid="admin-blog-new-btn"
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg font-semibold hover:from-amber-400 hover:to-amber-500 transition-all flex items-center shadow-lg shadow-amber-500/30"
            >
              <Plus className="mr-2" size={20} />
              New Note
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editing ? 'Edit' : 'Create'} Note
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
              <div>
                <label className="block text-white font-semibold mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  data-testid="admin-blog-title-input"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors"
                  placeholder="Enter blog title"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2 flex items-center">
                  <User size={16} className="mr-2 text-amber-400" />
                  Author
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  data-testid="admin-blog-author-input"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors"
                  placeholder="e.g. Z. Watson"
                />
                <p className="text-slate-500 text-sm mt-1">
                  Optional — leave blank to hide the byline on this post.
                </p>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Content *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows="12"
                  data-testid="admin-blog-content-input"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors resize-none"
                  placeholder="Write your blog post..."
                ></textarea>
              </div>

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
                    {formData.image_urls.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt={`Upload ${i + 1}`} className="w-full h-24 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeMedia('image', i)}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
                    {formData.video_urls.map((url, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-950 rounded-lg">
                        <span className="text-slate-400 text-sm truncate">Video {i + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeMedia('video', i)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="blog-published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-5 h-5 text-amber-500 bg-slate-950 border-slate-700 rounded focus:ring-amber-400"
                />
                <label htmlFor="blog-published" className="ml-3 text-white font-semibold">
                  Publish immediately
                </label>
              </div>

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
                  data-testid="admin-blog-submit-btn"
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg font-semibold hover:from-amber-400 hover:to-amber-500 transition-all flex items-center disabled:opacity-50"
                >
                  <Save className="mr-2" size={20} />
                  {editing ? 'Update' : 'Create'} Post
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <BookOpen className="text-amber-400 mr-2" size={24} />
              All Notes ({posts.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin h-12 w-12 border-4 border-amber-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-400">Loading...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="text-slate-700 mx-auto mb-4" size={64} />
              <p className="text-slate-400 text-lg">No notes yet</p>
              <p className="text-slate-500 text-sm mt-2">Click "New Note" to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {posts.map((post) => (
                <div key={post.id} className="p-6 hover:bg-slate-950 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2 flex-wrap gap-2">
                        <h3 className="text-xl font-bold text-white">{post.title}</h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            post.published
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mb-2">
                        {fmt(post.created_at)}
                        {post.author && <span className="ml-3">by {post.author}</span>}
                      </p>
                      <p className="text-slate-300 line-clamp-2 mb-3">
                        {(post.content || '').substring(0, 200)}...
                      </p>
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
                        data-testid={`admin-blog-edit-${post.id}`}
                        className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        data-testid={`admin-blog-delete-${post.id}`}
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

export default AdminBlog;
