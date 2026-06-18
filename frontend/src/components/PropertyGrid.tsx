import React from 'react';
import PropertyCard, { PropertyCardSkeleton } from './PropertyCard';
import type { Property } from '../services/api';

interface PropertyGridProps {
  properties: Property[];
  isLoading: boolean;
  hasSearched: boolean;
  error: string | null;
  focusedPropertyIds: string[];
  onFocusProperty: (id: string | null) => void;
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
  properties, isLoading, hasSearched, error, focusedPropertyIds, onFocusProperty,
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
      {hasSearched && (
        <p className="results-count" aria-live="polite">
          {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
        </p>
      )}
      <section className="property-grid" aria-label="Search results">
        {properties.map((property) => (
          <PropertyCard 
            key={property.id} 
            {...property} 
            isFocused={focusedPropertyIds.includes(property.id)}
            onFocus={() => onFocusProperty(property.id)}
            onCloseFocus={() => onFocusProperty(property.id)} // Toggle off by passing the same id, or handled in HomePage
          />
        ))}
      </section>
    </>
  );
};

export default PropertyGrid;
