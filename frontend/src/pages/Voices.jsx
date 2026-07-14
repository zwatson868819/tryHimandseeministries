import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mic, Play, Pause, Quote, Heart } from 'lucide-react';
import PageMeta from '../components/PageMeta';
import { getApprovedVoices } from '../services/api';

const CATEGORY_LABELS = {
  praise: 'Praise',
  prayer: 'Prayer',
  thanks: 'Thanks',
  testimony: 'Testimony',
};

const audioSrcFor = (v) =>
  v.audio_url || `${process.env.REACT_APP_BACKEND_URL}/api/voices/audio/${v.id}`;

const VoiceCard = ({ voice }) => {
  const [playing, setPlaying] = useState(false);
  const audioRef = React.useRef(null);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
  };

  return (
    <article
      data-testid={`voice-card-${voice.id}`}
      className="bg-slate-900/80 border border-amber-500/20 rounded-xl p-6 hover:border-amber-400/60 hover:shadow-lg hover:shadow-amber-500/10 transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="text-white text-lg font-semibold">{voice.first_name}</h3>
          {voice.category && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs rounded-full">
              {CATEGORY_LABELS[voice.category] || voice.category}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={toggle}
          data-testid={`voice-play-${voice.id}`}
          aria-label={playing ? 'Pause' : 'Play'}
          className="w-11 h-11 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 flex-shrink-0"
        >
          {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>
      </div>
      <audio
        ref={audioRef}
        src={audioSrcFor(voice)}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        className="hidden"
      />
      {voice.transcript && (
        <p className="text-slate-300 text-sm leading-relaxed italic border-l-2 border-amber-500/40 pl-3">
          <Quote size={12} className="inline text-amber-400 mr-1" />
          {voice.transcript}
        </p>
      )}
    </article>
  );
};

const Voices = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getApprovedVoices()
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 pt-24" data-testid="voices-page">
      <PageMeta
        title="Voices from the Street"
        description="Real voices, real stories. Audio testimonies from the people tryHimandsee Ministries serves in Richmond and Henrico."
        path="/voices"
      />

      <section className="py-16 bg-gradient-to-br from-slate-950 via-amber-900/10 to-slate-950 border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full mb-6">
            <Mic className="text-amber-400" size={32} />
          </div>
          <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-3">Voices from the Street</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Real Voices. <span className="text-amber-400">Real Stories.</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed mb-6">
            Audio testimonies from the people we serve on the streets of Richmond and Henrico. Their stories, in their own words.
          </p>
          <Link
            to="/voices/record"
            data-testid="voices-share-cta"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg font-semibold hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20"
          >
            <Heart size={18} /> Share your voice
          </Link>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && <p className="text-slate-400 text-center py-12" data-testid="voices-loading">Loading voices...</p>}
          {!loading && items.length === 0 && (
            <p data-testid="voices-empty" className="text-slate-400 text-center py-12">
              No approved testimonies yet. Be the first to <Link to="/voices/record" className="text-amber-400 hover:underline">share yours</Link>.
            </p>
          )}
          <div className="grid md:grid-cols-2 gap-5" data-testid="voices-list">
            {items.length > 0 && items.map((v) => <VoiceCard key={v.id} voice={v} />)}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Voices;
