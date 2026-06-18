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
export const HiddenDove = ({ id, className = '', size = 18 }) => {
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
      className={`opacity-25 hover:opacity-90 transition-opacity p-1 ${className}`}
      style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="#fef3c7"
        aria-hidden="true"
      >
        <path d="M32 8c-4 0-8 2-10 5-2 4-2 8 1 11l-7 6c-2 2-2 5 0 7l3 3c2 1 4 1 6 0l5-4 2 3c1 2 3 3 5 3h6c2 0 4-1 5-3l5-8c2-3 1-7-2-9l-7-5c1-4-1-8-5-9-2-1-5 0-7 0z" />
        <circle cx="38" cy="20" r="1.5" fill="#0f172a" />
      </svg>
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
