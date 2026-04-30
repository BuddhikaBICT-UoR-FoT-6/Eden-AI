import React from 'react';
import PropertyCard, { PropertyCardSkeleton } from './PropertyCard';
import { Property } from '../services/api';

interface PropertyGridProps {
  properties: Property[];
  isLoading: boolean;
  hasSearched: boolean;
  error: string | null;
}

const SKELETON_COUNT = 6;

/**
 * PropertyGrid Component
 *
 * Orchestrates the display state machine:
 * 1. Loading  → show skeleton cards (Shneiderman: Informative Feedback)
 * 2. Error    → show friendly error message (Shneiderman: Error Prevention)
 * 3. Empty    → helpful nudge to refine the search
 * 4. Results  → responsive card grid
 */
const PropertyGrid: React.FC<PropertyGridProps> = ({
  properties, isLoading, hasSearched, error,
}) => {
  if (isLoading) {
    return (
      <section className="property-grid" aria-label="Loading properties" aria-busy="true">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </section>
    );
  }

  if (error) {
    return (
      <div className="grid-message error-message" role="alert">
        <span className="grid-message-icon">⚠️</span>
        <p>{error}</p>
      </div>
    );
  }

  if (hasSearched && properties.length === 0) {
    return (
      <div className="grid-message empty-message" role="status">
        <span className="grid-message-icon">🌴</span>
        <p>No properties matched your vibe. Try a different search!</p>
      </div>
    );
  }

  if (!hasSearched) return null;

  return (
    <>
      <p className="results-count" aria-live="polite">
        {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
      </p>
      <section className="property-grid" aria-label="Search results">
        {properties.map((property) => (
          <PropertyCard key={property.id} {...property} />
        ))}
      </section>

      <style>{`
        .results-count {
          text-align: center;
          color: var(--color-text-muted);
          font-size: 0.9rem;
          margin-bottom: 12px;
        }

        .property-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        .grid-message {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          padding: 60px 24px;
          text-align: center;
          color: var(--color-text-muted);
        }

        .grid-message-icon { font-size: 2.5rem; }
        .grid-message p { font-size: 1.05rem; }
        .error-message { color: var(--color-danger); }
      `}</style>
    </>
  );
};

export default PropertyGrid;
