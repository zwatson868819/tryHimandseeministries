import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Feather, Calendar, User, ArrowRight, Loader2, Mail, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getBlogPosts, subscribeToBlog } from '../services/api';
import PageMeta from '../components/PageMeta';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getBlogPosts(50, true);
        setPosts(data);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load posts');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const formatDate = (s) =>
    new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setSubscribing(true);
    try {
      await subscribeToBlog({ email, name: name || null });
      setSubscribed(true);
      toast.success("You're subscribed — welcome to the Secret Place");
      setEmail('');
      setName('');
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Subscription failed';
      toast.error(msg);
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen pt-20" data-testid="blog-page">
      <PageMeta
        title="Notes from the Secret Place"
        description="Devotional writings from tryHimandsee ministries on faith, encounter with Christ, and outreach. Subscribe for new posts by email."
        path="/blog"
      />
      <section className="relative py-24 bg-slate-900">
        <div className="absolute inset-0 opacity-10">
          <img
            src="https://images.unsplash.com/photo-1455390582262-044cdead277a"
            alt="Notes"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Feather className="text-amber-400 mx-auto mb-6" size={64} />
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Notes from the <span className="text-amber-400">Secret Place</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto italic">
            "But thou, when thou prayest, enter into thy closet, and when thou hast shut thy door, pray to thy Father which is in secret..." — Matthew 6:6
          </p>
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="py-12 bg-gradient-to-b from-slate-900 to-slate-950 border-y border-amber-500/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {subscribed ? (
            <div className="text-center" data-testid="blog-subscribed-state">
              <CheckCircle className="text-amber-400 mx-auto mb-3" size={48} />
              <h3 className="text-2xl font-bold text-white mb-2">You're in.</h3>
              <p className="text-slate-300">
                You'll get an email whenever a new note is shared.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <Mail className="text-amber-400 mx-auto mb-3" size={32} />
              <h3 className="text-2xl font-bold text-white mb-2">Get the next note in your inbox</h3>
              <p className="text-slate-400 mb-6">
                Receive devotionals and reflections as they're written. Unsubscribe anytime.
              </p>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto" data-testid="blog-subscribe-form">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="First name (optional)"
                  data-testid="blog-subscribe-name"
                  className="flex-1 px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  data-testid="blog-subscribe-email"
                  className="flex-1 px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors"
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  data-testid="blog-subscribe-submit"
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg font-semibold hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 whitespace-nowrap"
                >
                  {subscribing ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Posts */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="text-amber-400 mx-auto mb-4 animate-spin" size={48} />
              <p className="text-slate-400">Loading...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12" data-testid="blog-empty-state">
              <Feather className="text-amber-400 mx-auto mb-6" size={64} />
              <h2 className="text-3xl font-bold text-white mb-4">No notes yet</h2>
              <p className="text-slate-400 text-lg">Check back soon — the first one is coming.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="blog-grid">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.id}`}
                  data-testid={`blog-card-${post.id}`}
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all group"
                >
                  {post.image_urls && post.image_urls.length > 0 && (
                    <div className="aspect-video bg-slate-950 overflow-hidden">
                      <img
                        src={post.image_urls[0]}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center text-amber-400 text-sm mb-3 space-x-4 flex-wrap">
                      <span className="flex items-center">
                        <Calendar size={16} className="mr-2" />
                        {formatDate(post.created_at)}
                      </span>
                      {post.author && (
                        <span className="flex items-center">
                          <User size={16} className="mr-2" />
                          {post.author}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-400 mb-4 line-clamp-3">
                      {post.excerpt || (post.content || '').substring(0, 150) + '...'}
                    </p>
                    <div className="flex items-center text-amber-400 font-semibold group-hover:translate-x-2 transition-transform">
                      Read More
                      <ArrowRight size={18} className="ml-2" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Blog;
