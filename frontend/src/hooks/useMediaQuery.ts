import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if the current viewport matches a CSS media query.
 * @param query The media query to evaluate (e.g., '(min-width: 768px)')
 * @returns boolean true if the viewport matches the query
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set initial value
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    // Listener for viewport changes
    const listener = () => setMatches(media.matches);
    
    // Modern browsers use addEventListener
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    } else {
      // Fallback for older Safari
      media.addListener(listener);
      return () => media.removeListener(listener);
    }
  }, [matches, query]);

  return matches;
}
