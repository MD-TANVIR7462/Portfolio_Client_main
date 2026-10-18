import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTopOnRoute
 * Automatically scrolls the browser window to top (0, 0)
 * whenever the pathname changes, unless it's an on-page hash link.
 */
export const ScrollToTopOnRoute = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If not an in-page hash scroll, scroll immediately to the very top
    if (!hash) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      });
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToTopOnRoute;
