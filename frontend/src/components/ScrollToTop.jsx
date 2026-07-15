import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Ensures every route change scrolls to the top of the viewport.
// Also respects same-page hash anchors (e.g. /resources/food#feed-more).
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If a hash target is present, let the browser handle in-page scrolling.
    if (hash) return;
    // Instant jump so nav feels crisp on link tap.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
