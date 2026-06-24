import React, { useState, useEffect, useRef } from 'react';
import { Wind, X } from 'lucide-react';

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
  const timerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setPhase('inhale');
    setCycleIdx(0);
    setSecondsLeft(60);

    let phaseIdx = 0;
    let cycleN = 0;
    const next = () => {
      phaseIdx = (phaseIdx + 1) % PHASES.length;
      // When we complete a full cycle (rest → inhale), advance to next verse
      if (phaseIdx === 0) {
        cycleN = (cycleN + 1) % CYCLES.length;
        setCycleIdx(cycleN);
      }
      setPhase(PHASES[phaseIdx].name);
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
      <button
        onClick={onClose}
        aria-label="Close"
        data-testid="breathing-prayer-close"
        className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 z-10"
      >
        <X size={26} />
      </button>

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
