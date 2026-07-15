import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Sparkles, BookOpen, Heart, Play, ArrowRight } from 'lucide-react';
import PageMeta from '../components/PageMeta';
import { getMailbox } from '../services/api';
import { RESOURCE_CATEGORIES } from './ResourceDirectory';

const DEFAULT_WELCOME = "You are not alone. Whatever brought you here today - you were meant to receive this message.";
const DEFAULT_SCRIPTURE_REF = 'Isaiah 41:10';
const DEFAULT_SCRIPTURE_TEXT = 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.';

const audioSrcFor = (v) =>
  v?.audio_url || (v?.id ? `${process.env.REACT_APP_BACKEND_URL}/api/voices/audio/${v.id}` : null);

const Mailbox = () => {
  const { code } = useParams();
  const [box, setBox] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    getMailbox(code.toUpperCase())
      .then(setBox)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 pt-32 text-center">
        <p className="text-slate-400">Opening your mailbox...</p>
      </div>
    );
  }

  if (error || !box) {
    return (
      <div className="min-h-screen bg-slate-950 pt-32 text-center px-4" data-testid="mailbox-not-found">
        <h1 className="text-3xl font-bold text-white mb-3">This mailbox is empty</h1>
        <p className="text-slate-400 mb-6">The code on your card may be worn or mistyped. Try again, or visit our home page.</p>
        <Link to="/" className="text-amber-400 hover:underline">Return home</Link>
      </div>
    );
  }

  const welcome = box.welcome_text || DEFAULT_WELCOME;
  const scriptureRef = box.scripture_ref || DEFAULT_SCRIPTURE_REF;
  const audio = box.featured_voice ? audioSrcFor(box.featured_voice) : null;

  return (
    <div className="min-h-screen bg-slate-950 pt-24" data-testid="mailbox-page">
      <PageMeta title="A Message For You" description="A personal note from tryHimandsee ministries." path={`/mailbox/${code}`} />

      <section className="py-16 bg-gradient-to-br from-slate-950 via-amber-900/10 to-slate-950 border-b border-amber-500/20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full mb-6">
            <Sparkles className="text-amber-400" size={32} />
          </div>
          <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-3">A message for you</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
            You were <span className="text-amber-400">meant</span> to find this.
          </h1>
          <p className="text-slate-200 text-lg leading-relaxed" data-testid="mailbox-welcome">{welcome}</p>
        </div>
      </section>

      {/* Scripture */}
      <section className="py-12 bg-slate-950">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900/60 border border-amber-500/20 rounded-2xl p-8 text-center" data-testid="mailbox-scripture">
            <BookOpen className="text-amber-400 mx-auto mb-3" size={22} />
            <p className="text-slate-200 text-lg italic leading-relaxed mb-4">&ldquo;{DEFAULT_SCRIPTURE_TEXT}&rdquo;</p>
            <p className="text-amber-400 text-sm font-semibold tracking-wider">- {scriptureRef}</p>
          </div>
        </div>
      </section>

      {/* Featured voice */}
      {audio && (
        <section className="py-6 bg-slate-950">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-slate-900 via-amber-900/10 to-slate-900 border border-amber-500/30 rounded-2xl p-6" data-testid="mailbox-voice">
              <div className="flex items-center gap-3 mb-3">
                <Play className="text-amber-400" size={18} />
                <p className="text-white text-sm font-semibold">Hear from {box.featured_voice.first_name}</p>
              </div>
              <audio src={audio} controls preload="none" className="w-full" data-testid="mailbox-audio" />
              {box.featured_voice.transcript && (
                <p className="text-slate-400 text-xs italic mt-2">&ldquo;{box.featured_voice.transcript}&rdquo;</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Resources */}
      <section className="py-12 bg-slate-950">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <Heart className="text-amber-400 mx-auto mb-2" size={22} />
            <h2 className="text-2xl font-bold text-white mb-2">Need help right now?</h2>
            <p className="text-slate-400 text-sm">Free, verified resources in Richmond and Henrico. Tap what you need.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {RESOURCE_CATEGORIES.map((c) => {
              const CIcon = c.icon;
              return (
                <Link
                  key={c.key}
                  to={`/resources/${c.key}`}
                  data-testid={`mailbox-resource-${c.key}`}
                  className="flex items-center gap-3 p-4 bg-slate-900/60 border border-amber-500/20 rounded-xl hover:border-amber-400 hover:bg-slate-900 transition-all"
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${c.color} flex items-center justify-center flex-shrink-0`}>
                    <CIcon className="text-white" size={16} />
                  </div>
                  <span className="text-white font-medium text-sm flex-1">{c.label}</span>
                  <ArrowRight size={14} className="text-slate-500" />
                </Link>
              );
            })}
          </div>
          <div className="mt-6 text-center">
            <Link to="/prayer-requests" className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm font-semibold">
              Or submit a prayer request <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Mailbox;
