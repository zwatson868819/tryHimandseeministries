import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, User, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getBlogPosts } from '../services/api';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getBlogPosts(50, true);
        setPosts(data);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load blog posts');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const formatDate = (s) =>
    new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen pt-20" data-testid="blog-page">
      <section className="relative py-24 bg-slate-900">
        <div className="absolute inset-0 opacity-10">
          <img
            src="https://images.unsplash.com/photo-1455390582262-044cdead277a"
            alt="Blog"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BookOpen className="text-amber-400 mx-auto mb-6" size={64} />
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            The <span className="text-amber-400">Blog</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Personal reflections, devotionals, and everyday writings from the heart of the ministry.
          </p>
        </div>
      </section>

      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="text-amber-400 mx-auto mb-4 animate-spin" size={48} />
              <p className="text-slate-400">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12" data-testid="blog-empty-state">
              <BookOpen className="text-amber-400 mx-auto mb-6" size={64} />
              <h2 className="text-3xl font-bold text-white mb-4">No Posts Yet</h2>
              <p className="text-slate-400 text-lg">Check back soon for new writings.</p>
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
                    <div className="flex items-center text-amber-400 text-sm mb-3 space-x-4">
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
