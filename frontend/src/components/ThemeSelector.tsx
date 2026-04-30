import React, { useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { THEMES, ThemeId } from '../theme/themes';

const THEME_ORDER: ThemeId[] = [
  'dark', 'light',
  'dry-season', 'wet-season',
  'poya', 'avurudu', 'christmas',
  'sinhala-buddhist', 'tamil-hindu', 'muslim',
];

/**
 * ThemeSelector Component
 *
 * Floating theme picker respecting:
 * - Hick's Law: grouped into 3 logical sections (Base / Season / Cultural)
 * - Miller's Law: max 3-4 items per group
 * - Fitts' Law: large 44px+ touch targets
 * - Shneiderman Feedback: active theme highlighted, auto-theme indicator shown
 */
const ThemeSelector: React.FC = () => {
  const { themeId, setTheme, resetToCalendar, isAutoTheme, theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const groups = [
    { label: 'Display', ids: ['dark', 'light'] as ThemeId[] },
    { label: 'Seasons', ids: ['dry-season', 'wet-season'] as ThemeId[] },
    { label: 'Occasions', ids: ['poya', 'avurudu', 'christmas'] as ThemeId[] },
    { label: 'Cultural', ids: ['sinhala-buddhist', 'tamil-hindu', 'muslim'] as ThemeId[] },
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        id="theme-selector-btn"
        onClick={() => setIsOpen(o => !o)}
        className="theme-fab"
        aria-label="Open theme selector"
        title="Change theme"
      >
        <span className="theme-fab-emoji">{theme.emoji}</span>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="theme-panel glass-card" role="dialog" aria-label="Theme selector">
          <div className="theme-panel-header">
            <span className="theme-panel-title">Themes</span>
            {isAutoTheme && (
              <span className="theme-auto-badge">Auto ✦</span>
            )}
            <button
              className="theme-reset-btn"
              onClick={() => { resetToCalendar(); setIsOpen(false); }}
              title="Reset to calendar-based auto theme"
            >
              Reset
            </button>
          </div>

          {groups.map(group => (
            <div key={group.label} className="theme-group">
              <p className="theme-group-label">{group.label}</p>
              <div className="theme-group-items">
                {group.ids.map(id => {
                  const t = THEMES[id];
                  const isActive = themeId === id;
                  return (
                    <button
                      key={id}
                      id={`theme-btn-${id}`}
                      className={`theme-item ${isActive ? 'theme-item--active' : ''}`}
                      onClick={() => { setTheme(id); setIsOpen(false); }}
                      aria-pressed={isActive}
                      title={t.description}
                    >
                      <span className="theme-item-emoji">{t.emoji}</span>
                      <span className="theme-item-label">{t.label}</span>
                      {isActive && <span className="theme-item-check">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="theme-backdrop"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <style>{`
        /* Floating Action Button */
        .theme-fab {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 200;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(26, 34, 53, 0.9);
          border: 1.5px solid var(--color-border);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        }

        .theme-fab:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 28px rgba(0,0,0,0.5), 0 0 0 2px var(--color-primary);
        }

        .theme-fab-emoji { font-size: 1.4rem; }

        /* Panel */
        .theme-panel {
          position: fixed;
          bottom: 92px;
          right: 28px;
          z-index: 201;
          width: 240px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          animation: slideUp 0.2s ease;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .theme-panel-header {
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 10px;
        }

        .theme-panel-title {
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--color-text);
          flex: 1;
        }

        .theme-auto-badge {
          font-size: 0.7rem;
          padding: 2px 8px;
          background: rgba(99,102,241,0.15);
          border: 1px solid rgba(99,102,241,0.3);
          border-radius: 100px;
          color: #a5b4fc;
        }

        .theme-reset-btn {
          font-size: 0.7rem;
          padding: 4px 10px;
          background: transparent;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          color: var(--color-text-muted);
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }

        .theme-reset-btn:hover {
          border-color: var(--color-primary);
          color: var(--color-text);
        }

        /* Groups */
        .theme-group { display: flex; flex-direction: column; gap: 6px; }

        .theme-group-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-text-muted);
          font-weight: 600;
        }

        .theme-group-items { display: flex; flex-direction: column; gap: 3px; }

        /* Items */
        .theme-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 10px;
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          color: var(--color-text-muted);
          font-size: 0.85rem;
          font-family: var(--font-sans);
          text-align: left;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
          min-height: 36px;
        }

        .theme-item:hover {
          background: rgba(255,255,255,0.06);
          color: var(--color-text);
        }

        .theme-item--active {
          background: rgba(99, 102, 241, 0.12);
          border-color: rgba(99, 102, 241, 0.35);
          color: var(--color-text);
        }

        .theme-item-emoji { font-size: 1rem; flex-shrink: 0; }
        .theme-item-label { flex: 1; }
        .theme-item-check {
          font-size: 0.75rem;
          color: var(--color-primary);
          font-weight: 700;
        }

        /* Backdrop */
        .theme-backdrop {
          position: fixed;
          inset: 0;
          z-index: 199;
        }
      `}</style>
    </>
  );
};

export default ThemeSelector;
