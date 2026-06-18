import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getNewsPost } from '../services/api';

const NewsDetail = () => {
  const { id } = useParams();
  const [newsPost, setNewsPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNewsPost();
  }, [id]);

  const fetchNewsPost = async () => {
    try {
      const data = await getNewsPost(id);
      setNewsPost(data);
    } catch (error) {
      console.error('Error loading news post:', error);
      toast.error('Failed to load news post');
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

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <Loader2 className="text-amber-400 mx-auto mb-4 animate-spin" size={48} />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!newsPost) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">News Post Not Found</h2>
          <Link to="/news" className="text-amber-400 hover:text-amber-300">
            <ArrowLeft className="inline mr-2" size={18} />
            Back to News
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-slate-950">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <Link 
          to="/news" 
          className="inline-flex items-center text-amber-400 hover:text-amber-300 mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2" size={18} />
          Back to News
        </Link>

        {/* Featured Image */}
        {newsPost.image_urls && newsPost.image_urls.length > 0 && (
          <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden mb-8">
            <img 
              src={newsPost.image_urls[0]} 
              alt={newsPost.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Title & Date */}
        <div className="mb-8">
          <div className="flex items-center text-amber-400 text-sm mb-4">
            <Calendar size={16} className="mr-2" />
            {formatDate(newsPost.created_at)}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {newsPost.title}
          </h1>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none">
          <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
            {newsPost.content}
          </div>
        </div>

        {/* Additional Images */}
        {newsPost.image_urls && newsPost.image_urls.length > 1 && (
          <div className="grid md:grid-cols-2 gap-4 mt-8">
            {newsPost.image_urls.slice(1).map((url, index) => (
              <div key={url} className="aspect-video bg-slate-900 rounded-lg overflow-hidden">
                <img 
                  src={url} 
                  alt={`${newsPost.title} ${index + 2}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Videos */}
        {newsPost.video_urls && newsPost.video_urls.length > 0 && (
          <div className="mt-8 space-y-4">
            {newsPost.video_urls.map((url, index) => (
              <div key={url} className="aspect-video bg-slate-900 rounded-lg overflow-hidden">
                <video 
                  controls 
                  className="w-full h-full"
                  src={url}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ))}
          </div>
        )}
      </article>
    </div>
  );
};

export default NewsDetail;
