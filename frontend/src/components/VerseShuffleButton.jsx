import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Shuffle, X, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { getVerseOfTheDay } from '../data/verses';
import { shareVerse } from '../lib/shareVerse';
import { useNearBottom } from '../hooks/useNearBottom';

// Small floating button (bottom-right) that opens a modal showing a random verse.
// Clicking "Another verse" reshuffles. Clicking "Share" generates a quote card.
const VerseShuffleButton = () => {
  const [open, setOpen] = useState(false);
  const [verse, setVerse] = useState(null);
  const nearBottom = useNearBottom(180);

  const pickRandom = useCallback(() => {
    // The verses module exports a getter only - pick another based on a random offset.
    // Cheap trick: fetch by random day-of-month index by mutating Date prototype briefly.
    const original = Date.prototype.getUTCDate;
    const rand = 1 + Math.floor(Math.random() * 31);
    // eslint-disable-next-line no-extend-native
    Date.prototype.getUTCDate = function () { return rand; };
    try {
      setVerse(getVerseOfTheDay());
    } finally {
      // eslint-disable-next-line no-extend-native
      Date.prototype.getUTCDate = original;
    }
  }, []);

  useEffect(() => {
    if (open && !verse) pickRandom();
  }, [open, verse, pickRandom]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const handleShare = async () => {
    if (!verse) return;
    try {
      const { method } = await shareVerse(verse);
      if (method === 'downloaded') toast.success('Verse copied and quote card downloaded!');
      else if (method === 'shared') toast.success('Thanks for sharing the Word!');
    } catch {
      toast.error('Could not share the verse.');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="random-verse-btn"
        aria-label="Show a random Scripture"
        title="A random word from the Lord"
        style={{ bottom: nearBottom ? '8.5rem' : '1.5rem' }}
        className="fixed right-6 z-[60] w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all flex items-center justify-center hover:scale-110 duration-300"
      >
        <BookOpen size={22} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center px-4 animate-in fade-in duration-200"
          onClick={() => setOpen(false)}
          data-testid="random-verse-modal"
        >
          <div
            className="bg-gradient-to-br from-slate-900 via-amber-900/10 to-slate-900 border border-amber-500/40 rounded-2xl p-8 max-w-xl w-full shadow-2xl shadow-amber-500/10 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              data-testid="random-verse-close"
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-2"
            >
              <X size={20} />
            </button>
            <p className="text-amber-400 text-xs uppercase tracking-widest font-semibold mb-4 flex items-center gap-2">
              <BookOpen size={14} /> A word for you
            </p>
            {verse && (
              <>
                <p className="text-slate-100 text-xl md:text-2xl italic leading-relaxed mb-5">
                  &ldquo;{verse.text}&rdquo;
                </p>
                <p className="text-amber-400 font-semibold mb-7">&mdash; {verse.ref}</p>
              </>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={pickRandom}
                data-testid="random-verse-shuffle"
                className="flex-1 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Shuffle size={18} /> Another verse
              </button>
              <button
                onClick={handleShare}
                data-testid="random-verse-share"
                className="flex-1 px-5 py-3 bg-slate-800 hover:bg-slate-700 border border-amber-500/30 text-amber-400 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Share2 size={18} /> Share this verse
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VerseShuffleButton;
