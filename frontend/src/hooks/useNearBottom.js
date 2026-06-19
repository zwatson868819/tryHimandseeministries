import { useState, useEffect } from 'react';

// Returns true when the user has scrolled close to the bottom of the page,
// so floating buttons can move out of the way of footer content (copyright,
// staff login link, etc).
export const useNearBottom = (threshold = 160) => {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const viewportBottom = window.scrollY + window.innerHeight;
      setNear(scrollHeight - viewportBottom < threshold);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [threshold]);

  return near;
};
