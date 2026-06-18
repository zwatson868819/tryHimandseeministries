import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA',
];

// Easter egg: typing ↑↑↓↓←→←→BA anywhere fires a confetti rain of love.
const KonamiCode = () => {
  useEffect(() => {
    let progress = 0;
    const onKey = (e) => {
      const expected = KONAMI[progress];
      if (e.code === expected) {
        progress += 1;
        if (progress === KONAMI.length) {
          progress = 0;
          // 5-second confetti rain
          const end = Date.now() + 4000;
          const palette = ['#fbbf24', '#f59e0b', '#fde68a', '#ffffff'];
          (function frame() {
            confetti({
              particleCount: 3,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
              colors: palette,
            });
            confetti({
              particleCount: 3,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
              colors: palette,
            });
            if (Date.now() < end) requestAnimationFrame(frame);
          })();
          toast.success('You found a secret blessing! God loves you. 🕊️', {
            duration: 5000,
          });
        }
      } else {
        progress = 0;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return null;
};

export default KonamiCode;
