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
  isNavbarMode?: boolean;
  onExit?: () => void;
  initialValue?: string;
  weather?: {
    condition: string;
    temperature: number;
    locationName: string;
  } | null;
}

/**
 * SearchBar Component
 * Supports standard mode (centered on homepage with vibes above it)
 * and navbar mode (compact search bar embedded inside top navigation).
 */
const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  isLoading,
  isNavbarMode = false,
  onExit,
  initialValue = '',
  weather,
}) => {
  const [prompt, setPrompt] = useState(initialValue);
  const [selectedVibePriorities, setSelectedVibePriorities] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync priority state when prompt is manually changed or initialized
  useEffect(() => {
    setSelectedVibePriorities(getSelectedVibesFromPrompt(prompt));
  }, [prompt]);

  useEffect(() => {
    setPrompt(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (!isNavbarMode) {
      inputRef.current?.focus();
    }
  }, [isNavbarMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    onSearch(prompt);
  };

  // Helper to parse currently active vibes ordered by priority (first occurrence index in prompt text)
  const getSelectedVibesFromPrompt = (text: string): string[] => {
    const lower = text.toLowerCase();
    const matches: { vibe: string; index: number }[] = [];
    
    VIBE_SUGGESTIONS.forEach(v => {
      const cleanVibe = v.replace(/^[\S]+\s/, '').toLowerCase();
      let idx = lower.indexOf(cleanVibe);
      if (idx !== -1) {
        matches.push({ vibe: v, index: idx });
      } else {
        // match key aliases
        if (cleanVibe === 'jungle luxury' && lower.includes('jungle')) {
          matches.push({ vibe: v, index: lower.indexOf('jungle') });
        } else if (cleanVibe === 'surf chill' && lower.includes('surf')) {
          matches.push({ vibe: v, index: lower.indexOf('surf') });
        } else if (cleanVibe === 'colonial charm' && lower.includes('colonial')) {
          matches.push({ vibe: v, index: lower.indexOf('colonial') });
        } else if (cleanVibe === 'beachfront zen' && (lower.includes('beach') || lower.includes('ocean'))) {
          const i1 = lower.indexOf('beach');
          const i2 = lower.indexOf('ocean');
          matches.push({ vibe: v, index: i1 !== -1 ? i1 : i2 });
        } else if (cleanVibe === 'safari wild' && (lower.includes('safari') || lower.includes('wild'))) {
          const i1 = lower.indexOf('safari');
          const i2 = lower.indexOf('wild');
          matches.push({ vibe: v, index: i1 !== -1 ? i1 : i2 });
        } else if (cleanVibe === 'highland escape' && (lower.includes('highland') || lower.includes('mountain') || lower.match(/\bhill/))) {
          const i1 = lower.indexOf('highland');
          const i2 = lower.indexOf('mountain');
          const m3 = lower.match(/\bhill/);
          const i3 = m3 && m3.index !== undefined ? m3.index : -1;
          const indices = [i1, i2, i3].filter(i => i !== -1);
          if (indices.length > 0) {
            matches.push({ vibe: v, index: Math.min(...indices) });
          }
        } else if (cleanVibe === 'party vibe' && lower.includes('party')) {
          matches.push({ vibe: v, index: lower.indexOf('party') });
        } else if (cleanVibe === 'wellness retreat' && (lower.includes('wellness') || lower.includes('yoga') || lower.includes('retreat'))) {
          const i1 = lower.indexOf('wellness');
          const i2 = lower.indexOf('yoga');
          const i3 = lower.indexOf('retreat');
          const indices = [i1, i2, i3].filter(i => i !== -1);
          if (indices.length > 0) {
            matches.push({ vibe: v, index: Math.min(...indices) });
          }
        }
      }
    });
    
    // Sort matches by index to preserve priority order in prompt
    matches.sort((a, b) => a.index - b.index);
    return matches.map(m => m.vibe);
  };

  const handleChipClick = (vibeSuggestion: string) => {
    // 1. Get current active vibes from prompt
    const currentActive = getSelectedVibesFromPrompt(prompt);
    
    // 2. Toggle clicked vibe
    let nextActive: string[];
    if (currentActive.includes(vibeSuggestion)) {
      nextActive = currentActive.filter(v => v !== vibeSuggestion);
    } else {
      nextActive = [...currentActive, vibeSuggestion];
    }
    
    // 3. Extract location (in [Word] or in [Word] [Word])
    const locationMatch = prompt.match(/in\s+([A-Za-z\s]+?)(?:\s+under|\s+\$|\s+below|$)/i);
    let location = locationMatch ? locationMatch[1].trim() : 'Sri Lanka';
    if (location.toLowerCase() === 'sri lanka') {
      location = 'Sri Lanka';
    }
    
    // 4. Extract budget (under [Number])
    const budgetMatch = prompt.match(/(?:under|below|budget of|max)\s*\$?\s*(\d+)/i);
    const budget = budgetMatch ? budgetMatch[1] : '';

    // 5. Reconstruct prompt (using prioritizing X, then Y style)
    const cleanVibeNames = nextActive.map(v => v.replace(/^[\S]+\s/, ''));
    
    let newPrompt = '';
    if (cleanVibeNames.length > 0) {
      newPrompt += `Find me a property prioritizing ${cleanVibeNames.join(', then ')}`;
    } else {
      newPrompt += 'Find me a property';
    }
    
    if (location) {
      newPrompt += ` in ${location}`;
    }
    
    if (budget) {
      newPrompt += ` under $${budget}`;
    }
    
    setPrompt(newPrompt);
  };

  const renderWeather = () => {
    if (!weather) return null;
    const emoji = weather.condition === 'clear' ? '☀️' : weather.condition === 'cloudy' ? '☁️' : weather.condition === 'rain' ? '🌧️' : '⛈️';
    return (
      <div className="search-bar-weather">
        <span>📍 {weather.locationName}</span>
        <span>{emoji} {weather.temperature}°C</span>
      </div>
    );
  };

  if (isNavbarMode) {
    return (
      <div className="search-bar-navbar-wrapper">
        <form onSubmit={handleSubmit} className="search-form-navbar" role="search">
          <div className="search-input-group navbar-style">
            <span className="search-icon" aria-hidden="true">✨</span>
            <input
              id="vibe-search-input-nav"
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Search vibe..."
              className="search-input"
              disabled={isLoading}
              aria-label="Search by vibe"
              autoComplete="off"
            />
            {renderWeather()}
            <button
              id="vibe-search-btn-nav"
              type="submit"
              className="search-btn compact"
              disabled={isLoading}
              aria-label="Search"
            >
              {isLoading ? <span className="search-btn-spinner" /> : 'Search'}
            </button>
            {onExit && (
              <button
                type="button"
                className="exit-search-btn"
                onClick={onExit}
                title="Exit Search"
                aria-label="Exit search and return home"
              >
                ✕
              </button>
            )}
          </div>
        </form>
        <style>{`
          .search-bar-navbar-wrapper {
            flex: 1;
            width: 580px;
            max-width: 100%;
            justify-self: center;
            margin: 0 20px;
          }
          .search-form-navbar { width: 100%; }
          .search-input-group.navbar-style {
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid var(--color-border);
            border-radius: 12px;
            padding: 2px 2px 2px 12px;
            gap: 8px;
            height: 40px;
            display: flex;
            align-items: center;
          }
          .search-input-group.navbar-style .search-input {
            height: 100%;
            min-height: auto;
            font-size: 0.85rem;
          }
          .search-bar-weather {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.75rem;
            color: var(--color-text-muted);
            background: rgba(0,0,0,0.2);
            padding: 4px 8px;
            border-radius: 8px;
            white-space: nowrap;
          }
          .search-btn.compact {
            min-width: 70px;
            min-height: 34px;
            padding: 0 14px;
            border-radius: 8px;
            font-size: 0.8rem;
          }
          .exit-search-btn {
            background: transparent;
            border: none;
            color: var(--color-text-muted);
            font-size: 0.95rem;
            cursor: pointer;
            padding: 4px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            width: 28px;
            height: 28px;
            flex-shrink: 0;
          }
          .exit-search-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            color: var(--color-text);
          }
        `}</style>
      </div>
    );
  }

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
          {renderWeather()}
          <button
            id="vibe-search-btn"
            type="submit"
            className="search-btn"
            disabled={isLoading}
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

      {/* Vibe Chips — Suggestive vibes are rendered BELOW the search input bar */}
      <div className="vibe-chips" role="group" aria-label="Quick vibe filters">
        {VIBE_SUGGESTIONS.map((vibe) => {
          const priorityIndex = selectedVibePriorities.indexOf(vibe);
          const isActive = priorityIndex !== -1;
          return (
            <button
              key={vibe}
              onClick={() => handleChipClick(vibe)}
              className={`vibe-chip ${isActive ? 'active' : ''}`}
              disabled={isLoading}
              aria-label={`Search for ${vibe}`}
              aria-pressed={isActive}
            >
              {isActive && <span className="vibe-priority-badge">{priorityIndex + 1}</span>}
              {vibe}
            </button>
          );
        })}
      </div>

      <style>{`
        .search-bar-wrapper {
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: center;
        }

        .search-form { width: 100%; }

        .search-input-group {
          display: flex;
          align-items: center;
          background: color-mix(in srgb, var(--color-surface) 80%, transparent);
          border: 1.5px solid var(--color-border);
          border-radius: 16px;
          padding: 6px 6px 6px 20px;
          gap: 12px;
          transition: border-color 0.25s, box-shadow 0.25s;
          width: 100%;
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
          min-height: 44px; /* Fitts' Law touch targets */
        }

        .search-input::placeholder { color: var(--color-text-muted); }
        .search-input:disabled { opacity: 0.6; }

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
          width: 100%;
        }

        .vibe-chip {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid #ffffff;
          border-radius: 100px;
          color: #ffffff;
          font-size: 0.875rem;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.15s;
          min-height: 36px;
        }

        .vibe-chip:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.15);
          border-color: #ffffff;
          transform: translateY(-1px);
        }

        .vibe-chip.active {
          background: #ffffff;
          border-color: #ffffff;
          color: var(--color-bg, #0d0e12);
          font-weight: 600;
          box-shadow: 0 0 12px rgba(255, 255, 255, 0.4);
          display: inline-flex;
          align-items: center;
        }

        .vibe-chip.active:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.9);
          border-color: rgba(255, 255, 255, 0.9);
          transform: translateY(-1px);
        }

        .vibe-priority-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--color-bg, #0d0e12);
          color: var(--color-primary);
          font-size: 0.7rem;
          font-weight: 800;
          margin-right: 8px;
          line-height: 1;
        }

        .vibe-chip:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>
    </div>
  );
};

export default SearchBar;
