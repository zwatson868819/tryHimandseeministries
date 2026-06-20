import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

// 5 dove hiding spots — visible-but-easy-to-miss. Each spot is identified by
// a stable key. The first time a user clicks any spot, they "find" that dove
// and the count goes up. State persists in localStorage so finding them all
// across multiple visits still counts.
const TOTAL_DOVES = 5;
const STORAGE_KEY = 'doves_found_v1';

const readFound = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  } catch {
    return new Set();
  }
};
const writeFound = (set) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
};

// A clickable hidden dove SVG. Pass `id` (1..5) and optional className for
// positioning.
export const HiddenDove = ({ id, className = '', size = 28 }) => {
  const [found, setFound] = useState(() => readFound().has(String(id)));
  const announcedFinishRef = useRef(false);

  const onClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (found) return;
    const set = readFound();
    if (set.has(String(id))) return;
    set.add(String(id));
    writeFound(set);
    setFound(true);

    if (set.size >= TOTAL_DOVES) {
      // Found all 5 — celebrate
      if (!announcedFinishRef.current) {
        announcedFinishRef.current = true;
        toast.success('You found all 5 doves! 🕊️ "I will give you the desires of your heart." — Psalm 37:4', {
          duration: 7000,
        });
        const end = Date.now() + 2500;
        const palette = ['#fbbf24', '#ffffff', '#fde68a'];
        (function frame() {
          confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors: palette });
          confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors: palette });
          if (Date.now() < end) requestAnimationFrame(frame);
        })();
      }
    } else {
      toast.success(`🕊️ You found a dove! ${TOTAL_DOVES - set.size} more to find.`, {
        duration: 4000,
      });
    }
  };

  if (found) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Hidden dove"
      data-testid={`hidden-dove-${id}`}
      className={`opacity-70 hover:opacity-100 transition-all hover:scale-125 p-1 leading-none select-none ${className}`}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: `${size}px`,
        filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))',
      }}
    >
      <span role="img" aria-hidden="true">🕊️</span>
    </button>
  );
};

// Optional progress badge — shows in the footer how many doves remain.
export const DoveProgress = () => {
  const [count, setCount] = useState(() => readFound().size);

  useEffect(() => {
    const i = setInterval(() => setCount(readFound().size), 1500);
    return () => clearInterval(i);
  }, []);

  if (count === 0) return null;
  if (count >= TOTAL_DOVES) {
    return (
      <p className="text-amber-400 text-xs text-center mt-3" data-testid="dove-progress-complete">
        🕊️ All 5 doves found — you have an eye for grace.
      </p>
    );
  }
  return (
    <p className="text-slate-500 text-xs text-center mt-3" data-testid="dove-progress">
      🕊️ You&rsquo;ve found {count} of {TOTAL_DOVES} hidden doves
    </p>
  );
};
