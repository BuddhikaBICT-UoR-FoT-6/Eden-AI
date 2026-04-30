import React, { useState, useRef, useEffect } from 'react';

// Hick's Law: Only 8 vibe suggestions — keeps decision time low
const VIBE_SUGGESTIONS = [
  '🌿 Jungle Luxury',
  '🏄 Surf Chill',
  '🏛️ Colonial Charm',
  '🌊 Beachfront Zen',
  '🦁 Safari Wild',
  '🏔️ Highland Escape',
  '🎉 Party Vibe',
  '🧘 Wellness Retreat',
];

interface SearchBarProps {
  onSearch: (prompt: string) => void;
  isLoading: boolean;
}

/**
 * SearchBar Component
 *
 * UX Laws Applied:
 * - Fitts' Law: Large search button with generous padding for easy targeting.
 * - Hick's Law: Exactly 8 pre-defined vibe chips reduce decision paralysis.
 * - Miller's Law: Suggestions shown as a single scannable row (≤7±2 visible at once).
 * - Norman Visceral: Glowing border on focus creates a premium feel.
 * - Shneiderman Consistency: Submit triggers on both Enter key and button click.
 * - Shneiderman Error Prevention: Disabled state while loading prevents duplicate submissions.
 */
const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSearch(prompt);
  };

  const handleChipClick = (vibe: string) => {
    const cleanVibe = vibe.replace(/^[\S]+\s/, ''); // strip emoji
    setPrompt(`Find me a ${cleanVibe} property in Sri Lanka`);
    onSearch(`Find me a ${cleanVibe} property in Sri Lanka`);
  };

  return (
    <div className="search-bar-wrapper">
      <form onSubmit={handleSubmit} className="search-form" role="search">
        <div className="search-input-group">
          <span className="search-icon" aria-hidden="true">✨</span>
          <input
            id="vibe-search-input"
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your dream stay... (e.g. a quiet jungle villa under $500)"
            className="search-input"
            disabled={isLoading}
            aria-label="Describe your ideal property vibe"
            autoComplete="off"
          />
          <button
            id="vibe-search-btn"
            type="submit"
            className="search-btn"
            disabled={isLoading || !prompt.trim()}
            aria-label="Search by vibe"
          >
            {isLoading ? (
              <span className="search-btn-spinner" aria-label="Searching..." />
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>

      {/* Vibe Chips — Hick's Law: Max 8, scannable, one-tap search */}
      <div className="vibe-chips" role="group" aria-label="Quick vibe filters">
        {VIBE_SUGGESTIONS.map((vibe) => (
          <button
            key={vibe}
            onClick={() => handleChipClick(vibe)}
            className="vibe-chip"
            disabled={isLoading}
            aria-label={`Search for ${vibe}`}
          >
            {vibe}
          </button>
        ))}
      </div>

      <style>{`
        .search-bar-wrapper {
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .search-form { width: 100%; }

        .search-input-group {
          display: flex;
          align-items: center;
          background: rgba(26, 34, 53, 0.8);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 6px 6px 6px 20px;
          gap: 12px;
          transition: border-color 0.25s, box-shadow 0.25s;
        }

        .search-input-group:focus-within {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 4px var(--color-primary-glow);
        }

        .search-icon { font-size: 1.25rem; flex-shrink: 0; }

        .search-input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: var(--color-text);
          font-size: 1rem;
          font-family: var(--font-sans);
          min-height: 44px; /* Fitts' Law: min touch target */
        }

        .search-input::placeholder { color: var(--color-text-muted); }
        .search-input:disabled { opacity: 0.6; }

        /* Fitts' Law: Large, easy-to-hit submit button */
        .search-btn {
          min-width: 100px;
          min-height: 48px;
          padding: 0 28px;
          background: linear-gradient(135deg, var(--color-primary), #818cf8);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .search-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .search-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .search-btn-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* Vibe Chips */
        .vibe-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }

        .vibe-chip {
          padding: 8px 16px;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 100px;
          color: #a5b4fc;
          font-size: 0.875rem;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
          min-height: 36px; /* Fitts' Law */
        }

        .vibe-chip:hover:not(:disabled) {
          background: rgba(99, 102, 241, 0.25);
          border-color: rgba(99, 102, 241, 0.6);
          transform: translateY(-1px);
        }

        .vibe-chip:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>
    </div>
  );
};

export default SearchBar;
