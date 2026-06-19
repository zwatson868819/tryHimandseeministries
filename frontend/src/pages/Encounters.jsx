import React, { useState, useEffect } from 'react';
import { Flame, MessageCircle, Calendar, Send, User } from 'lucide-react';
import { toast } from 'sonner';
import { getLessons, getComments, submitComment } from '../services/api';
import PageMeta from '../components/PageMeta';

const Encounters = () => {
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({
    name: '',
    email: '',
    comment: ''
  });

  useEffect(() => {
    fetchLessons();
  }, []);

  useEffect(() => {
    if (selectedLesson) {
      fetchComments(selectedLesson.id);
    }
  }, [selectedLesson]);

  const fetchLessons = async () => {
    try {
      const data = await getLessons(50, true);
      setLessons(data);
      if (data.length > 0) {
        setSelectedLesson(data[0]); // Select the most recent lesson
      }
    } catch (error) {
      console.error('Error loading lessons:', error);
      toast.error('Failed to load lessons');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (lessonId) => {
    try {
      const data = await getComments(lessonId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLesson) return;

    try {
      const commentData = {
        lesson_id: selectedLesson.id,
        name: commentForm.name,
        email: commentForm.email || null,
        comment: commentForm.comment
      };

      await submitComment(commentData);
      toast.success('Thank you for sharing! Your comment has been posted.');
      setCommentForm({ name: '', email: '', comment: '' });
      
      // Refresh comments
      fetchComments(selectedLesson.id);
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
    <div className="min-h-screen pt-20 relative">
      <PageMeta
        title="Encounters with Christ"
        description="Stories, lessons, and devotional teachings about meeting Jesus in everyday life. Encounter the love and presence of God through real-life testimonies."
        path="/encounters"
      />
      {/* Full Page Encounter Logo Background */}
      <div className="fixed inset-0 z-0">
        <img 
          src="/images/encounter-series-logo.jpeg" 
          alt="Encounter Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/85"></div>
      </div>

      {/* All content with relative positioning to appear above background */}
      <div className="relative z-10">
      {/* Hero Section */}
      <section className="relative py-24 flex items-center justify-center overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <img 
              src="/images/encounter-logo.jpeg" 
              alt="Encounter Logo" 
              className="h-32 w-32 mx-auto object-contain drop-shadow-2xl"
            />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            <span className="text-amber-400">Encounter</span> Series
          </h1>
          
          <p className="text-2xl text-purple-200 italic mb-4">
            "Draw near. Be changed."
          </p>
          
          <p className="text-lg text-slate-300 mb-2">James 4:8</p>

          <p className="text-lg text-slate-300 max-w-3xl mx-auto">
            Weekly teachings to help you grow deeper in your relationship with God. 
            Share your thoughts and testimonies with our community.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center text-slate-400 py-12">
              <div className="animate-pulse">Loading encounter lessons...</div>
            </div>
          ) : lessons.length === 0 ? (
            <div className="text-center py-12">
              <Flame className="text-amber-400 mx-auto mb-6" size={64} />
              <h2 className="text-3xl font-bold text-white mb-4">
                New Teachings <span className="text-amber-400">Coming Soon</span>
              </h2>
              <p className="text-slate-400 text-lg">
                Check back soon for powerful weekly encounter lessons and teachings.
              </p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Lessons Sidebar */}
              <div className="lg:col-span-1">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Flame className="text-amber-400 mr-2" size={28} />
                  Recent Lessons
                </h2>
                
                <div className="space-y-3">
                  {lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => setSelectedLesson(lesson)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        selectedLesson?.id === lesson.id
                          ? 'bg-amber-500/10 border-amber-500'
                          : 'bg-slate-900 border-slate-800 hover:border-amber-500/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-semibold text-amber-400">
                          Week {lesson.week_number}
                        </span>
                        <div className="flex items-center text-slate-500 text-xs">
                          <MessageCircle size={14} className="mr-1" />
                          {lesson.comment_count}
                        </div>
                      </div>
                      <h3 className="text-white font-semibold mb-1 line-clamp-2">
                        {lesson.title}
                      </h3>
                      <p className="text-slate-400 text-sm flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {new Date(lesson.created_at).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lesson Content & Comments */}
              <div className="lg:col-span-2">
                {selectedLesson && (
                  <>
                    {/* Lesson Content */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 mb-8">
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-sm font-semibold rounded-full">
                            Week {selectedLesson.week_number}
                          </span>
                          <span className="text-slate-500 text-sm">
                            {new Date(selectedLesson.created_at).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">
                          {selectedLesson.title}
                        </h2>
                        {selectedLesson.scripture_reference && (
                          <p className="text-amber-400 italic mb-4">
                            {selectedLesson.scripture_reference}
                          </p>
                        )}
                      </div>

                      {selectedLesson.video_url && (
                        <div className="mb-6 aspect-video bg-slate-950 rounded-lg overflow-hidden">
                          <iframe
                            src={selectedLesson.video_url}
                            title={selectedLesson.title}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      )}

                      <div className="prose prose-invert max-w-none">
                        <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {selectedLesson.content}
                        </div>
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
                            placeholder="Share your thoughts, testimony, or how this message impacted you..."
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
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Flame className="text-amber-400 mx-auto mb-6" size={56} />
          <h2 className="text-4xl font-bold text-white mb-6">
            Join the <span className="text-amber-400">Conversation</span>
          </h2>
          <p className="text-slate-300 text-lg mb-8">
            Every week, new teachings are posted to help you grow in your faith. 
            Join our community in learning, sharing, and being transformed together.
          </p>
          <p className="text-purple-300 italic text-lg">
            "Draw near to God, and He will draw near to you." - James 4:8
          </p>
        </div>
      </section>
      </div>
    </div>
  );
};

export default Encounters;
