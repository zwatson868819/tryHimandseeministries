import React, { useState, useEffect } from 'react';
import { BookOpen, MessageCircle, Calendar, Send, User, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { getRevelations, getRevelationComments, submitRevelationComment } from '../services/api';

const ReadingRevelation = () => {
  const [revelations, setRevelations] = useState([]);
  const [selectedRevelation, setSelectedRevelation] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({
    name: '',
    email: '',
    comment: ''
  });

  useEffect(() => {
    fetchRevelations();
  }, []);

  useEffect(() => {
    if (selectedRevelation) {
      fetchComments(selectedRevelation.id);
    }
  }, [selectedRevelation]);

  const fetchRevelations = async () => {
    try {
      const data = await getRevelations(50, true);
      setRevelations(data);
      if (data.length > 0) {
        setSelectedRevelation(data[0]); // Select the most recent revelation
      }
    } catch (error) {
      console.error('Error loading revelations:', error);
      toast.error('Failed to load revelations');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (revelationId) => {
    try {
      const data = await getRevelationComments(revelationId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRevelation) return;

    try {
      const commentData = {
        revelation_id: selectedRevelation.id,
        name: commentForm.name,
        email: commentForm.email || null,
        comment: commentForm.comment
      };

      await submitRevelationComment(commentData);
      toast.success('Thank you for sharing! Your comment has been posted.');
      setCommentForm({ name: '', email: '', comment: '' });
      
      // Refresh comments
      fetchComments(selectedRevelation.id);
    } catch (error) {
      toast.error('Failed to post comment. Please try again.');
      console.error('Comment error:', error);
    }
  };

  const handleInputChange = (e) => {
    setCommentForm({
      ...commentForm,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative py-24 bg-slate-900">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920" 
            alt="Reading Bible" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center border-2 border-amber-400">
              <BookOpen className="text-amber-400" size={40} />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Reading <span className="text-amber-400">Revelation</span>
          </h1>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-4">
            Insights and revelations God imparts through His Word. Join the conversation 
            as we explore what the Holy Spirit reveals in Scripture.
          </p>
          
          <p className="text-amber-300 italic text-lg">
            "Your word is a lamp to my feet and a light to my path." - Psalm 119:105
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center text-slate-400 py-12">
              <div className="animate-pulse">Loading revelations...</div>
            </div>
          ) : revelations.length === 0 ? (
            <div className="text-center py-12">
              <Lightbulb className="text-amber-400 mx-auto mb-6" size={64} />
              <h2 className="text-3xl font-bold text-white mb-4">
                New Revelations <span className="text-amber-400">Coming Soon</span>
              </h2>
              <p className="text-slate-400 text-lg">
                Check back soon for insights and revelations from God's Word.
              </p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Revelations Sidebar */}
              <div className="lg:col-span-1">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <BookOpen className="text-amber-400 mr-2" size={28} />
                  Recent Posts
                </h2>
                
                <div className="space-y-3">
                  {revelations.map((revelation) => (
                    <button
                      key={revelation.id}
                      onClick={() => setSelectedRevelation(revelation)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        selectedRevelation?.id === revelation.id
                          ? 'bg-amber-500/10 border-amber-500'
                          : 'bg-slate-900 border-slate-800 hover:border-amber-500/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-semibold text-amber-400">
                          {revelation.scripture_passage}
                        </span>
                        <div className="flex items-center text-slate-500 text-xs">
                          <MessageCircle size={14} className="mr-1" />
                          {revelation.comment_count}
                        </div>
                      </div>
                      <h3 className="text-white font-semibold mb-1 line-clamp-2">
                        {revelation.title}
                      </h3>
                      <p className="text-slate-400 text-sm flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {new Date(revelation.created_at).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Revelation Content & Comments */}
              <div className="lg:col-span-2">
                {selectedRevelation && (
                  <>
                    {/* Revelation Content */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 mb-8">
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-sm font-semibold rounded-full">
                            {selectedRevelation.scripture_passage}
                          </span>
                          <span className="text-slate-500 text-sm">
                            {new Date(selectedRevelation.created_at).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-6">
                          {selectedRevelation.title}
                        </h2>
                      </div>

                      <div className="prose prose-invert max-w-none">
                        <div className="bg-slate-950 border-l-4 border-amber-400 p-6 mb-6 rounded-r-lg">
                          <p className="text-slate-400 text-sm font-semibold mb-2">REVELATION FROM GOD'S WORD:</p>
                          <div className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                            {selectedRevelation.revelation}
                          </div>
                        </div>

                        {selectedRevelation.personal_note && (
                          <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-lg">
                            <p className="text-amber-400 text-sm font-semibold mb-2 flex items-center">
                              <Lightbulb size={16} className="mr-2" />
                              PERSONAL NOTE:
                            </p>
                            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                              {selectedRevelation.personal_note}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Comments Section */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
                      <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                        <MessageCircle className="text-amber-400 mr-2" size={24} />
                        Community Thoughts ({comments.length})
                      </h3>

                      {/* Comment Form */}
                      <form onSubmit={handleCommentSubmit} className="mb-8 p-6 bg-slate-950 border border-amber-500/30 rounded-lg">
                        <h4 className="text-white font-semibold mb-4">Share Your Thoughts</h4>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label htmlFor="name" className="block text-white text-sm font-semibold mb-2">
                              Name *
                            </label>
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={commentForm.name}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors"
                              placeholder="Your name"
                            />
                          </div>

                          <div>
                            <label htmlFor="email" className="block text-white text-sm font-semibold mb-2">
                              Email (Optional)
                            </label>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={commentForm.email}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors"
                              placeholder="your@email.com"
                            />
                          </div>
                        </div>

                        <div className="mb-4">
                          <label htmlFor="comment" className="block text-white text-sm font-semibold mb-2">
                            Comment *
                          </label>
                          <textarea
                            id="comment"
                            name="comment"
                            value={commentForm.comment}
                            onChange={handleInputChange}
                            required
                            rows="4"
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors resize-none"
                            placeholder="Share your thoughts, insights, or how this revelation spoke to you..."
                          ></textarea>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg font-semibold hover:from-amber-400 hover:to-amber-500 transition-all duration-300 flex items-center justify-center"
                        >
                          <Send className="mr-2" size={18} />
                          Post Comment
                        </button>
                      </form>

                      {/* Comments List */}
                      <div className="space-y-4">
                        {comments.length === 0 ? (
                          <p className="text-slate-400 text-center py-8">
                            No comments yet. Be the first to share your thoughts!
                          </p>
                        ) : (
                          comments.map((comment) => (
                            <div 
                              key={comment.id}
                              className="p-4 bg-slate-950 border border-slate-800 rounded-lg hover:border-amber-500/30 transition-all"
                            >
                              <div className="flex items-start space-x-3">
                                <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="text-amber-400" size={20} />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-white font-semibold">{comment.name}</span>
                                    <span className="text-slate-500 text-sm">
                                      {new Date(comment.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-slate-300 leading-relaxed">
                                    {comment.comment}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-amber-900/20 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BookOpen className="text-amber-400 mx-auto mb-6" size={56} />
          <h2 className="text-4xl font-bold text-white mb-6">
            Join the <span className="text-amber-400">Conversation</span>
          </h2>
          <p className="text-slate-300 text-lg mb-8">
            As God reveals truth through His Word, share your insights and learn from others 
            in our community. Together, we grow in understanding and faith.
          </p>
          <p className="text-amber-300 italic text-lg">
            "Open my eyes, that I may behold wondrous things out of your law." - Psalm 119:18
          </p>
        </div>
      </section>
    </div>
  );
};

export default ReadingRevelation;
