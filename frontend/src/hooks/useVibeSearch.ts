import { useState, useCallback, useEffect } from 'react';
import { searchByVibe, getAllProperties } from '../services/api';
import type { Property } from '../services/api';

interface UseVibeSearchReturn {
  results: Property[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  query: string;
  search: (prompt: string) => Promise<void>;
  reset: () => void;
}

/**
 * Custom React Hook encapsulating all vibe search state and logic.
 */
export const useVibeSearch = (): UseVibeSearchReturn => {
  const [results, setResults] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [query, setQuery] = useState('');

  // Pre-populate with all properties on initialization
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getAllProperties()
      .then((data) => {
        if (isMounted) {
          setResults(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load initial properties', err);
        if (isMounted) {
          setError('Unable to load featured properties.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const search = useCallback(async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setQuery(prompt);

    try {
      const data = prompt.trim()
        ? await searchByVibe(prompt)
        : await getAllProperties();
      setResults(data);
    } catch (err) {
      setError('Unable to connect to Eden AI. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    // Reset back to all properties rather than empty results
    setError(null);
    setHasSearched(false);
    setQuery('');
    setIsLoading(true);
    getAllProperties()
      .then(setResults)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return { results, isLoading, error, hasSearched, query, search, reset };
};
