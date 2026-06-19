import React, { useState, useRef } from 'react';
import { Gift, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

// 12 blessings — each a short, joyful encouragement prompt to bless someone today.
const BLESSINGS = [
  { label: 'Pray for a stranger today', emoji: '🙏' },
  { label: 'Smile at someone you don\u2019t know', emoji: '😊' },
  { label: 'Bring a meal to a neighbor today', emoji: '🍞' },
  { label: 'Text a friend "I prayed for you"', emoji: '💬' },
  { label: 'God has not forgotten you', emoji: '🕊️' },
  { label: 'Carry an extra hygiene kit in your trunk', emoji: '✨' },
  { label: 'Pay for the person behind you in line', emoji: '☕' },
  { label: 'Listen, really listen, to someone today', emoji: '👂' },
  { label: 'Send a Scripture to someone you love', emoji: '📖' },
  { label: 'Forgive someone in your heart', emoji: '💛' },
  { label: 'Volunteer at the next Miracle Run', emoji: '🎁' },
  { label: 'You are loved beyond measure', emoji: '❤️' },
];

const WheelOfBlessing = () => {
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [resultIdx, setResultIdx] = useState(null);
  const baseRotation = useRef(0);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResultIdx(null);
    const target = Math.floor(Math.random() * BLESSINGS.length);
    // 4-6 full rotations + land on the chosen slice (center of slice)
    const sliceAngle = 360 / BLESSINGS.length;
    const turns = 4 + Math.floor(Math.random() * 3);
    const offset = 360 - (target * sliceAngle + sliceAngle / 2);
    const next = baseRotation.current + turns * 360 + offset;
    baseRotation.current = next;
    setAngle(next);
    setTimeout(() => {
      setSpinning(false);
      setResultIdx(target);
      // Tiny confetti burst on the result
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.45 },
        colors: ['#fbbf24', '#f59e0b', '#fde68a', '#ffffff'],
      });
    }, 4200);
  };

  const sliceAngle = 360 / BLESSINGS.length;

  return (
    <section
      data-testid="wheel-of-blessing"
      className="bg-slate-900 border border-amber-500/30 rounded-2xl p-8"
    >
      <div className="text-center mb-6">
        <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-2">
          Random Blessings, Eternal Impact
        </p>
        <h3 className="text-2xl md:text-3xl font-bold text-white">
          Spin the <span className="text-amber-400">Wheel of Blessing</span>
        </h3>
        <p className="text-slate-400 text-sm mt-2">A free prompt to bless someone today.</p>
      </div>

      <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto">
        {/* Pointer at top */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 -translate-x-1/2 -top-2 z-10 w-0 h-0"
          style={{
            borderLeft: '14px solid transparent',
            borderRight: '14px solid transparent',
            borderTop: '22px solid #fbbf24',
            filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.4))',
          }}
        />
        <div
          className="w-full h-full rounded-full border-4 border-amber-500 shadow-xl shadow-amber-500/20 overflow-hidden relative"
          style={{
            transform: `rotate(${angle}deg)`,
            transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.18, 0.99)' : 'none',
            background: 'conic-gradient(from 0deg, ' +
              BLESSINGS.map((_, i) =>
                `${i % 2 === 0 ? '#1e293b' : '#451a03'} ${(i * sliceAngle).toFixed(2)}deg ${((i + 1) * sliceAngle).toFixed(2)}deg`
              ).join(', ') + ')',
          }}
        >
          {BLESSINGS.map((b, i) => {
            // Center of slice i, measured clockwise from 12 o'clock (top).
            const centerDeg = i * sliceAngle + sliceAngle / 2;
            // Convert to standard math angle: -90° offset (because conic 0° = top, but cos/sin use 3 o'clock = 0°)
            const rad = (centerDeg - 90) * (Math.PI / 180);
            const radius = 105; // distance from wheel center in px (works for w-72/w-80)
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;
            return (
              <div
                key={b.label}
                className="absolute text-2xl select-none pointer-events-none"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {b.emoji}
              </div>
            );
          })}
        </div>
        {/* Center hub */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-amber-500 border-4 border-slate-900 flex items-center justify-center shadow-lg"
        >
          <Sparkles className="text-slate-900" size={24} />
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={spin}
          disabled={spinning}
          data-testid="spin-wheel-btn"
          className="px-8 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-slate-900 disabled:text-slate-500 rounded-lg font-bold text-lg transition-all flex items-center gap-2 mx-auto"
        >
          <Gift size={20} />
          {spinning ? 'Spinning...' : 'Spin the wheel'}
        </button>

        {resultIdx !== null && (
          <div
            data-testid="wheel-result"
            className="mt-6 mx-auto max-w-md bg-gradient-to-r from-amber-900/20 via-slate-900 to-amber-900/20 border border-amber-500/40 rounded-xl p-5 animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <p className="text-3xl mb-2">{BLESSINGS[resultIdx].emoji}</p>
            <p className="text-white text-lg font-semibold">{BLESSINGS[resultIdx].label}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default WheelOfBlessing;
