import React, { useState, useEffect, useRef } from 'react';
import { Wind, X } from 'lucide-react';

// Guided 60-second breathing prayer overlay.
// Inhale: "Be still" (4s) — Hold (2s) — Exhale: "and know that I am God" (6s)
// Loops for ~5 cycles, then closes.

const CYCLE_MS = 12000; // total inhale + hold + exhale + rest

const BreathingPrayer = ({ open, onClose }) => {
  const [phase, setPhase] = useState('inhale');
  const [secondsLeft, setSecondsLeft] = useState(60);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setPhase('inhale');
    setSecondsLeft(60);

    const phases = [
      { name: 'inhale', ms: 4000 },
      { name: 'hold', ms: 2000 },
      { name: 'exhale', ms: 5000 },
      { name: 'rest', ms: 1000 },
    ];
    let idx = 0;
    const next = () => {
      idx = (idx + 1) % phases.length;
      setPhase(phases[idx].name);
      timerRef.current = setTimeout(next, phases[idx].ms);
    };
    timerRef.current = setTimeout(next, phases[0].ms);

    const startedAt = Date.now();
    const tick = setInterval(() => {
      const remaining = 60 - Math.floor((Date.now() - startedAt) / 1000);
      if (remaining <= 0) {
        onClose();
      } else {
        setSecondsLeft(remaining);
      }
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

  const phaseText = {
    inhale: 'Breathe in… Be still',
    hold: '…',
    exhale: 'Breathe out… and know that I am God',
    rest: ' ',
  }[phase];

  // Circle scale per phase
  const scale = { inhale: 1.0, hold: 1.0, exhale: 0.5, rest: 0.5 }[phase];

  return (
    <div
      role="dialog"
      data-testid="breathing-prayer-overlay"
      className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center px-6"
    >
      <button
        onClick={onClose}
        aria-label="Close"
        data-testid="breathing-prayer-close"
        className="absolute top-6 right-6 text-slate-400 hover:text-white p-2"
      >
        <X size={26} />
      </button>

      <p className="text-amber-400 text-xs uppercase tracking-widest font-semibold mb-2">
        A Sacred Pause
      </p>
      <p className="text-slate-300 text-sm mb-8">{secondsLeft}s remaining</p>

      <div
        aria-hidden="true"
        className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center"
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
        key={phase}
        data-testid="breathing-prayer-text"
        className="mt-10 text-white text-xl sm:text-2xl text-center font-light tracking-wide animate-in fade-in duration-700 min-h-[3rem]"
      >
        {phaseText}
      </p>
      <p className="text-amber-400 text-sm mt-3">&mdash; Psalm 46:10</p>
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
