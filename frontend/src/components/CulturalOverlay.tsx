import React from 'react';
import { detectPropertyCultureTheme } from '../theme/themes';
import { useTheme } from '../theme/ThemeProvider';

interface CulturalOverlayProps {
  vibes: string[];
  location: string;
  name: string;
}

/**
 * CulturalOverlay Component
 *
 * Auto-detects cultural context from a property's vibes/location/name and
 * renders a subtle identity badge in the card foreground.
 *
 * This satisfies the requirement: "if a suggested store for suggested restaurants
 * are based on different sub-culture these must be automatically triggered
 * just to show identity on foreground of where content are shown."
 */
const CULTURE_META: Record<string, { label: string; emoji: string; color: string }> = {
  'sinhala-buddhist': {
    label: 'Buddhist Heritage',
    emoji: '☸️',
    color: 'rgba(255, 140, 0, 0.15)',
  },
  'tamil-hindu': {
    label: 'Tamil Heritage',
    emoji: '🪔',
    color: 'rgba(220, 20, 60, 0.15)',
  },
  'muslim': {
    label: 'Muslim Heritage',
    emoji: '☪️',
    color: 'rgba(22, 101, 52, 0.15)',
  },
};

const CulturalOverlay: React.FC<CulturalOverlayProps> = ({ vibes, location, name }) => {
  const detectedCulture = detectPropertyCultureTheme(vibes, location, name);
  if (!detectedCulture) return null;

  const meta = CULTURE_META[detectedCulture];
  if (!meta) return null;

  return (
    <div
      className="cultural-overlay"
      style={{ background: meta.color }}
      aria-label={`Cultural identity: ${meta.label}`}
      role="note"
    >
      <span className="cultural-overlay-emoji" aria-hidden="true">{meta.emoji}</span>
      <span className="cultural-overlay-label">{meta.label}</span>

      <style>{`
        .cultural-overlay {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(4px);
          font-size: 0.72rem;
          font-weight: 500;
          color: var(--color-text);
          width: fit-content;
        }

        .cultural-overlay-emoji { font-size: 0.85rem; }
        .cultural-overlay-label { letter-spacing: 0.02em; }
      `}</style>
    </div>
  );
};

export default CulturalOverlay;
