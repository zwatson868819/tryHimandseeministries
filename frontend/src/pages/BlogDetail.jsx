import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getBlogPost } from '../services/api';

const BlogDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getBlogPost(id);
        setPost(data);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const formatDate = (s) =>
    new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-slate-950">
        <Loader2 className="text-amber-400 animate-spin" size={48} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Post Not Found</h2>
          <Link to="/blog" className="text-amber-400 hover:text-amber-300">
            <ArrowLeft className="inline mr-2" size={18} />
            Back to Notes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-slate-950" data-testid="blog-detail-page">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/blog"
          data-testid="blog-back-link"
          className="inline-flex items-center text-amber-400 hover:text-amber-300 mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2" size={18} />
          Back to Notes
        </Link>

        {post.image_urls && post.image_urls.length > 0 && (
          <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden mb-8">
            <img
              src={post.image_urls[0]}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="mb-8">
          <div className="flex flex-wrap items-center text-amber-400 text-sm mb-4 gap-x-6 gap-y-2">
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{post.title}</h1>
        </div>

        <div className="prose prose-invert prose-lg max-w-none">
          <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">{post.content}</div>
        </div>

        {post.image_urls && post.image_urls.length > 1 && (
          <div className="grid md:grid-cols-2 gap-4 mt-8">
            {post.image_urls.slice(1).map((url, i) => (
              <div key={i} className="aspect-video bg-slate-900 rounded-lg overflow-hidden">
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {post.video_urls && post.video_urls.length > 0 && (
          <div className="mt-8 space-y-4">
            {post.video_urls.map((url, i) => (
              <div key={i} className="aspect-video bg-slate-900 rounded-lg overflow-hidden">
                <video controls className="w-full h-full" src={url}>
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

export default BlogDetail;
