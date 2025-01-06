import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

export function useScrollRestoration() {
  const { pathname } = useLocation();
  
  const resetScroll = useCallback(() => {
    // Cancel any ongoing smooth scrolls
    if ('scrollEndCallback' in window) {
      (window as any).scrollEndCallback?.();
    }

    // Force scroll to top immediately
    if (window.document.documentElement) {
      window.document.documentElement.scrollTop = 0;
    }
    if (window.document.body) {
      window.document.body.scrollTop = 0;
    }

    // Ensure scroll is reset after any reflows
    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto'
      });
    });
  }, []);

  useEffect(() => {
    // Reset scroll on route change
    resetScroll();

    // Cleanup any ongoing animations
    return () => {
      if ('scrollEndCallback' in window) {
        (window as any).scrollEndCallback?.();
      }
    };
  }, [pathname, resetScroll]);
}