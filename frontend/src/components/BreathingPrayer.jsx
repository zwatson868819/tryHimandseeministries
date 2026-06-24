import React, { useState, useEffect, useRef } from 'react';
import { Wind, X, Bell, BellOff } from 'lucide-react';

// Plays a soft meditation-bell tone using Web Audio API. No audio file needed.
// A sine carrier at the fundamental + a quick decay envelope creates a gentle
// "ting" reminiscent of a singing bowl.
const playChime = (ctx, frequency = 440) => {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const harmonic = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.value = frequency;
  harmonic.type = 'sine';
  harmonic.frequency.value = frequency * 2.76; // slight inharmonic gives bell timbre
  const harmonicGain = ctx.createGain();
  harmonicGain.gain.value = 0.12;

  // Soft attack + long exponential decay
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

  osc.connect(gain);
  harmonic.connect(harmonicGain).connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  harmonic.start(now);
  osc.stop(now + 2.5);
  harmonic.stop(now + 2.5);
};

// Guided 60-second breathing prayer overlay. Five cycles, each cycle pairs
// an inhale phrase with an exhale phrase from a different Scripture so the
// user hears variety, not just one verse repeated.

const CYCLES = [
  { inhale: 'Be still',                exhale: 'and know that I am God',           ref: 'Psalm 46:10' },
  { inhale: 'The Lord is my shepherd', exhale: 'I shall not want',                 ref: 'Psalm 23:1' },
  { inhale: 'Cast your cares on Him',  exhale: 'for He cares for you',             ref: '1 Peter 5:7' },
  { inhale: 'Come to me',              exhale: 'and I will give you rest',         ref: 'Matthew 11:28' },
  { inhale: 'My grace is sufficient',  exhale: 'for you',                          ref: '2 Corinthians 12:9' },
  { inhale: 'Peace I leave with you',  exhale: 'My peace I give to you',           ref: 'John 14:27' },
];

const PHASES = [
  { name: 'inhale', ms: 4000 },
  { name: 'hold',   ms: 1500 },
  { name: 'exhale', ms: 5000 },
  { name: 'rest',   ms: 1500 },
];

const BreathingPrayer = ({ open, onClose }) => {
  const [phase, setPhase] = useState('inhale');
  const [cycleIdx, setCycleIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [chimeOn, setChimeOn] = useState(true);
  const timerRef = useRef(null);
  const audioCtxRef = useRef(null);
  const chimeOnRef = useRef(true);

  useEffect(() => {
    chimeOnRef.current = chimeOn;
  }, [chimeOn]);

  useEffect(() => {
    if (!open) return;
    setPhase('inhale');
    setCycleIdx(0);
    setSecondsLeft(60);

    // Initialize AudioContext lazily on user-gesture (open is triggered by click)
    if (!audioCtxRef.current && typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new Ctx();
    }
    // Play opening chime
    if (audioCtxRef.current && chimeOnRef.current) {
      try { playChime(audioCtxRef.current, 528); } catch {}
    }

    let phaseIdx = 0;
    let cycleN = 0;
    const next = () => {
      phaseIdx = (phaseIdx + 1) % PHASES.length;
      // When we complete a full cycle (rest → inhale), advance to next verse
      if (phaseIdx === 0) {
        cycleN = (cycleN + 1) % CYCLES.length;
        setCycleIdx(cycleN);
      }
      const nextPhase = PHASES[phaseIdx].name;
      setPhase(nextPhase);
      // Soft chime on inhale (higher) and exhale (lower) — skip hold + rest
      if (audioCtxRef.current && chimeOnRef.current) {
        try {
          if (nextPhase === 'inhale') playChime(audioCtxRef.current, 528); // C5-ish
          else if (nextPhase === 'exhale') playChime(audioCtxRef.current, 396); // G4-ish
        } catch {}
      }
      timerRef.current = setTimeout(next, PHASES[phaseIdx].ms);
    };
    timerRef.current = setTimeout(next, PHASES[0].ms);

    const startedAt = Date.now();
    const tick = setInterval(() => {
      const remaining = 60 - Math.floor((Date.now() - startedAt) / 1000);
      if (remaining <= 0) onClose();
      else setSecondsLeft(remaining);
    }, 250);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(tick);
    };
  }, [open, onClose]);

  // Escape closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const cycle = CYCLES[cycleIdx];
  const phaseText = {
    inhale: `Breathe in… ${cycle.inhale}`,
    hold:   '…',
    exhale: `Breathe out… ${cycle.exhale}`,
    rest:   ' ',
  }[phase];

  // Circle scale per phase
  const scale = { inhale: 1.0, hold: 1.0, exhale: 0.5, rest: 0.5 }[phase];

  return (
    <div
      role="dialog"
      data-testid="breathing-prayer-overlay"
      className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md overflow-y-auto"
    >
      <div className="absolute top-6 right-6 flex items-center gap-1 z-10">
        <button
          onClick={() => setChimeOn((v) => !v)}
          aria-label={chimeOn ? 'Mute chime' : 'Unmute chime'}
          title={chimeOn ? 'Mute chime' : 'Play chime'}
          data-testid="breathing-prayer-chime-toggle"
          className="text-slate-400 hover:text-amber-300 p-2"
        >
          {chimeOn ? <Bell size={22} /> : <BellOff size={22} />}
        </button>
        <button
          onClick={onClose}
          aria-label="Close"
          data-testid="breathing-prayer-close"
          className="text-slate-400 hover:text-white p-2"
        >
          <X size={26} />
        </button>
      </div>

      <div className="min-h-full flex flex-col items-center justify-center px-6 py-12">
        <p className="text-amber-400 text-xs uppercase tracking-widest font-semibold mb-2">
          A Sacred Pause
        </p>
        <p className="text-slate-300 text-sm mb-6">{secondsLeft}s remaining</p>

        <div
          aria-hidden="true"
          className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center flex-shrink-0"
        >
          {/* Soft outer glow */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(251,191,36,0.18) 0%, rgba(251,191,36,0) 70%)',
              transform: `scale(${scale * 1.4})`,
              transition: 'transform 4s cubic-bezier(0.45, 0, 0.55, 1)',
            }}
          />
          {/* The breathing orb */}
          <div
            className="rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-[0_0_60px_rgba(251,191,36,0.4)]"
            style={{
              width: '60%',
              height: '60%',
              transform: `scale(${scale})`,
              transition: 'transform 4s cubic-bezier(0.45, 0, 0.55, 1)',
            }}
          />
        </div>

        <p
          key={`${cycleIdx}-${phase}`}
          data-testid="breathing-prayer-text"
          className="mt-8 text-white text-lg sm:text-xl text-center font-light tracking-wide animate-in fade-in duration-700 max-w-xl px-4"
        >
          {phaseText}
        </p>
        <p className="text-amber-400 text-sm mt-2">&mdash; {cycle.ref}</p>
      </div>
    </div>
  );
};

// Floating trigger button — small, unobtrusive. Place anywhere.
export const BreathingPrayerTrigger = ({ className = '' }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="breathing-prayer-trigger"
        title="Take a sacred 60-second pause"
        aria-label="Take a sacred pause"
        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/10 text-amber-300 transition-all whitespace-nowrap ${className}`}
      >
        <Wind size={15} />
        <span>Sacred pause</span>
      </button>
      <BreathingPrayer open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default BreathingPrayer;
