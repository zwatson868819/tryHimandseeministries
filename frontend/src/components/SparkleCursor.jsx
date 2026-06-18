import React, { useEffect, useRef } from 'react';

// Tiny golden sparkles trail the cursor on desktop / fine-pointer devices only.
// Pure CSS — no canvas. Safe to mount once at the App root.
const SparkleCursor = () => {
  const containerRef = useRef(null);
  const throttleRef = useRef(0);

  useEffect(() => {
    // Skip on touch / coarse pointer devices entirely — saves battery on phones.
    if (!window.matchMedia?.('(pointer: fine)').matches) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const container = containerRef.current;

    const spawn = (x, y) => {
      const dot = document.createElement('span');
      dot.className = 'sparkle-dot';
      const size = 4 + Math.random() * 6;
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.left = `${x + (Math.random() - 0.5) * 12}px`;
      dot.style.top = `${y + (Math.random() - 0.5) * 12}px`;
      dot.style.setProperty('--dx', `${(Math.random() - 0.5) * 30}px`);
      dot.style.setProperty('--dy', `${-15 - Math.random() * 25}px`);
      container.appendChild(dot);
      setTimeout(() => dot.remove(), 900);
    };

    const onMove = (e) => {
      const now = performance.now();
      if (now - throttleRef.current < 35) return; // ~28 sparkles/sec max
      throttleRef.current = now;
      spawn(e.clientX, e.clientY);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9998] overflow-hidden"
      data-testid="sparkle-cursor"
    />
  );
};

export default SparkleCursor;
