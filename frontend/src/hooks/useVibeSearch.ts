import { useState, useCallback } from 'react';
import { Property, searchByVibe, getAllProperties } from '../services/api';

interface UseVibeSearchReturn {
  results: Property[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  search: (prompt: string) => Promise<void>;
  reset: () => void;
}

/**
 * Custom React Hook encapsulating all vibe search state and logic.
 *
 * SRP: This hook owns only the AI search workflow — loading state,
 * error handling, and result management.
 *
 * UX Principles:
 * - Shneiderman Feedback: isLoading exposes skeleton loader states.
 * - Error Prevention: error state prevents silent failures from reaching the UI.
 */
export const useVibeSearch = (): UseVibeSearchReturn => {
  const [results, setResults] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const search = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

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
    setResults([]);
    setError(null);
    setHasSearched(false);
  }, []);

  return { results, isLoading, error, hasSearched, search, reset };
};
