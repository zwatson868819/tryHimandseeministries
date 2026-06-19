import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { toast } from 'sonner';
import { useNearBottom } from '../hooks/useNearBottom';

const AUDIO_SRC = '/audio/worship.mp3';
const STORAGE_KEY = 'worship_music_pref';

const WorshipMusic = () => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [hasAudio, setHasAudio] = useState(true);
  const [showLabel, setShowLabel] = useState(false);
  const nearBottom = useNearBottom(180);

  useEffect(() => {
    // Cloudflare Pages serves index.html (HTTP 200) for any missing path.
    // So a plain `r.ok` check isn't enough — we must verify the response is
    // actually an audio file via Content-Type.
    fetch(AUDIO_SRC, { method: 'HEAD' })
      .then((r) => {
        const type = r.headers.get('content-type') || '';
        setHasAudio(r.ok && type.startsWith('audio/'));
      })
      .catch(() => setHasAudio(false));
  }, []);

  useEffect(() => {
    // First-mount welcome label that fades away
    const t = setTimeout(() => setShowLabel(false), 4500);
    setShowLabel(true);
    return () => clearTimeout(t);
  }, []);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!hasAudio) {
      toast.info('Worship music is coming soon — your custom track will go here.');
      return;
    }
    try {
      if (playing) {
        audio.pause();
        setPlaying(false);
        localStorage.setItem(STORAGE_KEY, 'paused');
      } else {
        audio.volume = 0.25;
        await audio.play();
        setPlaying(true);
        localStorage.setItem(STORAGE_KEY, 'playing');
      }
    } catch {
      toast.error('Browser blocked auto-play. Please tap the button once more.');
    }
  };

  return (
    <>
      <audio ref={audioRef} src={AUDIO_SRC} loop preload="none" aria-hidden="true" />
      <div
        className="fixed left-6 z-[60] flex items-center gap-2 transition-all duration-300"
        style={{ bottom: nearBottom ? '8.5rem' : '1.5rem' }}
        data-testid="worship-music-widget"
      >
        {showLabel && (
          <span className="hidden sm:inline-block bg-slate-900/90 border border-amber-500/30 text-amber-300 text-xs font-medium px-3 py-1.5 rounded-lg animate-in fade-in duration-500">
            Tap for soft worship music
          </span>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? 'Pause worship music' : 'Play worship music'}
          title={playing ? 'Pause worship music' : 'Play worship music'}
          data-testid="worship-music-toggle"
          className={`w-12 h-12 rounded-full transition-all flex items-center justify-center shadow-lg ${
            playing
              ? 'bg-amber-500 text-slate-900 shadow-amber-500/40 hover:bg-amber-400'
              : 'bg-slate-900/90 text-amber-400 border border-amber-500/30 hover:border-amber-400 hover:bg-slate-900'
          }`}
        >
          {playing ? <Volume2 size={20} /> : hasAudio ? <Music size={20} /> : <VolumeX size={20} />}
        </button>
      </div>
    </>
  );
};

export default WorshipMusic;
