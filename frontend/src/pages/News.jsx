import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getNews } from '../services/api';
import PageMeta from '../components/PageMeta';

const News = () => {
  const [newsPosts, setNewsPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const data = await getNews(50, true);
      setNewsPosts(data);
    } catch (error) {
      console.error('Error loading news:', error);
      toast.error('Failed to load news posts');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen pt-20">
      <PageMeta
        title="News &amp; Updates"
        description="Latest news, outreach stories, and ministry updates from tryHimandsee ministries."
        path="/news"
      />
      {/* Hero Section */}
      <section className="relative py-24 bg-slate-900">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1504711434969-e33886168f5c" 
            alt="News" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Newspaper className="text-amber-400 mx-auto mb-6" size={64} />
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Ministry <span className="text-amber-400">News</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Stay updated with the latest news, events, and testimonies from tryHimandsee ministries.
          </p>
        </div>
      </section>

      {/* News Posts */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="text-amber-400 mx-auto mb-4 animate-spin" size={48} />
              <p className="text-slate-400">Loading news...</p>
            </div>
          ) : newsPosts.length === 0 ? (
            <div className="text-center py-12">
              <Newspaper className="text-amber-400 mx-auto mb-6" size={64} />
              <h2 className="text-3xl font-bold text-white mb-4">
                No News Yet
              </h2>
              <p className="text-slate-400 text-lg">
                Check back soon for updates from our ministry.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/news/${post.id}`}
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
                    <div className="flex items-center text-amber-400 text-sm mb-3">
                      <Calendar size={16} className="mr-2" />
                      {formatDate(post.created_at)}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-400 mb-4 line-clamp-3">
                      {post.content.substring(0, 150)}...
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

export default News;
