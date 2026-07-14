import React, { useState, useEffect, useCallback } from 'react';
import { Flame, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { lightCandle, getCandles } from '../services/api';
import PageMeta from '../components/PageMeta';

const LIT_STORAGE_KEY = 'lit_candle_at';

const formatRelative = (iso) => {
  const date = new Date(iso);
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const LightACandle = () => {
  const [candles, setCandles] = useState([]);
  const [total, setTotal] = useState(0);
  const [name, setName] = useState('');
  const [intention, setIntention] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getCandles(200);
      setCandles(data.candles || []);
      setTotal(data.total || 0);
    } catch {
      // soft fail
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const created = await lightCandle({
        name: name.trim() || 'Anonymous',
        intention: intention.trim(),
      });
      setCandles((prev) => [created, ...prev]);
      setTotal((t) => t + 1);
      localStorage.setItem(LIT_STORAGE_KEY, new Date().toISOString());
      setName('');
      setIntention('');
      toast.success('Your candle is lit. Thank you for adding light to the wall.');
    } catch {
      toast.error('Could not light your candle. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <PageMeta
        title="Light a Candle"
        description="Light a candle of prayer for yourself, a loved one, or someone you&rsquo;ve never met. A wall of intentions rising before the Father."
        path="/light-a-candle"
      />
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-b from-amber-950/30 to-slate-950">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 25% 30%, rgba(251, 191, 36, 0.3) 0%, transparent 40%), radial-gradient(circle at 75% 70%, rgba(251, 191, 36, 0.2) 0%, transparent 40%)',
        }} />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-3">
            A wall of prayers
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5">
            Light a <span className="text-amber-400">Candle</span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">
            For yourself. For a loved one. For someone you&rsquo;ve never met. Every candle is a prayer rising before the Father.
          </p>
          <p className="text-amber-400 text-sm font-semibold mt-6" data-testid="candle-total">
            {total.toLocaleString()} {total === 1 ? 'candle' : 'candles'} lit so far
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-12 bg-slate-950">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <form
            onSubmit={handleSubmit}
            data-testid="light-candle-form"
            className="bg-slate-900 border border-amber-500/30 rounded-xl p-6 sm:p-8 space-y-4"
          >
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2" htmlFor="candle-name">
                First name <span className="text-slate-500 font-normal">(optional - leave blank to be anonymous)</span>
              </label>
              <input
                id="candle-name"
                type="text"
                maxLength={40}
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="candle-name-input"
                placeholder="Anonymous"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2" htmlFor="candle-intention">
                Intention <span className="text-slate-500 font-normal">(optional, up to 200 characters)</span>
              </label>
              <textarea
                id="candle-intention"
                rows={3}
                maxLength={200}
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                data-testid="candle-intention-input"
                placeholder="e.g. For my mother&rsquo;s healing"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              data-testid="light-candle-submit"
              className="w-full px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 text-slate-900 disabled:text-slate-500 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2"
            >
              <Flame size={20} />
              {submitting ? 'Lighting...' : 'Light a candle'}
            </button>
            <p className="text-slate-500 text-xs text-center">
              Your candle is added to the wall below. We don&rsquo;t collect emails or share intentions outside this page.
            </p>
          </form>
        </div>
      </section>

      {/* Wall */}
      <section className="py-12 relative overflow-hidden" style={{ background: 'radial-gradient(ellipse at top, #0a0f1a 0%, #020617 70%)' }}>
        {/* Twinkling background stars */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 60 }).map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-amber-200/40"
              style={{
                width: `${1 + Math.random() * 2}px`,
                height: `${1 + Math.random() * 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: 0.3 + Math.random() * 0.5,
                animation: `candle-flicker ${2 + Math.random() * 4}s ease-in-out ${Math.random() * 4}s infinite`,
              }}
            />
          ))}
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <h2 className="text-2xl font-bold text-white text-center mb-2">The Wall</h2>
          <p className="text-slate-400 text-center text-sm mb-10">
            Most recent first &middot; showing up to 200
          </p>
          {candles.length === 0 ? (
            <p className="text-center text-slate-500" data-testid="candles-empty">
              Be the first to light a candle.
            </p>
          ) : (
            <div
              data-testid="candle-wall"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
            >
              {candles.map((c) => (
                <div
                  key={c.id}
                  data-testid={`candle-${c.id}`}
                  className="group rounded-lg p-4 flex flex-col items-center text-center transition-all"
                  style={{
                    background: 'linear-gradient(180deg, rgba(15,23,42,0.75) 0%, rgba(2,6,23,0.95) 100%)',
                    border: '1px solid rgba(251, 191, 36, 0.25)',
                    boxShadow: '0 0 20px rgba(251, 191, 36, 0.18), inset 0 1px 0 rgba(251, 191, 36, 0.1)',
                  }}
                >
                  <span className="text-3xl mb-2 candle-flame drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" role="img" aria-label="lit candle">🕯️</span>
                  <p className="text-amber-300 text-sm font-semibold truncate w-full">{c.name || 'Anonymous'}</p>
                  {c.intention && (
                    <p className="text-slate-400 text-xs mt-2 italic line-clamp-3">&ldquo;{c.intention}&rdquo;</p>
                  )}
                  <p className="text-slate-600 text-[10px] mt-3 uppercase tracking-wider">
                    {formatRelative(c.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA strip */}
      <section className="py-12 bg-gradient-to-r from-amber-900/20 via-slate-900 to-amber-900/20 border-y border-amber-500/20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Heart className="text-amber-400 mx-auto mb-3" size={32} />
          <p className="text-white text-lg leading-relaxed">
            &ldquo;The Lord is near to all who call on Him, to all who call on Him in truth.&rdquo;
          </p>
          <p className="text-amber-400 text-sm font-semibold mt-2">&mdash; Psalm 145:18</p>
        </div>
      </section>
    </div>
  );
};

export default LightACandle;
