import React from 'react';
import CulturalOverlay from './CulturalOverlay';

/**
 * PropertyCardSkeleton — shown while data is loading.
 * Shneiderman's "Offer Informative Feedback": Users see progress
 * immediately, reducing perceived wait time (ISO 9241-11 Efficiency).
 */
export const PropertyCardSkeleton: React.FC = () => (
  <div className="property-card skeleton-card" aria-label="Loading property">
    <div className="skeleton card-img-skeleton" />
    <div className="card-body">
      <div className="skeleton" style={{ height: 22, width: '70%', marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 14, width: '45%', marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 14, width: '75%', marginBottom: 20 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="skeleton" style={{ height: 26, width: 80, borderRadius: 100 }} />
        <div className="skeleton" style={{ height: 26, width: 70, borderRadius: 100 }} />
      </div>
    </div>

    <style>{`
      .skeleton-card { cursor: default; }
      .card-img-skeleton { height: 200px; border-radius: 12px 12px 0 0; }
    `}</style>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

interface PropertyCardProps {
  id: string;
  name: string;
  description: string;
  location: string;
  pricePerNight: number;
  imageUrl: string;
  vibes: string[];
}

/**
 * PropertyCard Component
 *
 * Norman Emotional Design:
 * - Visceral: Gradient overlay, hover scale, glow shadows.
 * - Behavioral: Quick-scan layout (image → name → location → price → vibes).
 * - Reflective: Vibe tags give users confidence they found "the right vibe".
 *
 * Miller's Law: Max 3 vibe tags shown — prevents cognitive overload.
 */
const PropertyCard: React.FC<PropertyCardProps> = ({
  id, name, description, location, pricePerNight, imageUrl, vibes,
}) => {
  // Miller's Law: Cap displayed vibes at 3
  const displayedVibes = vibes.slice(0, 3);
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(pricePerNight);

  return (
    <article
      className="property-card"
      id={`property-card-${id}`}
      aria-label={`Property: ${name}`}
    >
      <div className="card-img-wrapper">
        <img
          src={imageUrl || 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80'}
          alt={`${name} - ${location}`}
          className="card-img"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80';
          }}
        />
        <div className="card-img-overlay" />
        <div className="card-price-badge">{formattedPrice}<span>/night</span></div>
      </div>

      <div className="card-body">
        <h3 className="card-title">{name}</h3>
        <p className="card-location">
          <span className="card-location-icon">📍</span>
          {location}, Sri Lanka
        </p>
        <p className="card-description">{description}</p>

        {displayedVibes.length > 0 && (
          <div className="card-vibes" aria-label="Property vibes">
            {displayedVibes.map((vibe) => (
              <span key={vibe} className="card-vibe-tag">{vibe}</span>
            ))}
          </div>
        )}

        {/* Cultural identity badge — auto-detected from property metadata */}
        <CulturalOverlay vibes={vibes} location={location} name={name} />
      </div>

      <style>{`
        .property-card {
          background: rgba(17, 24, 39, 0.8);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s;
          cursor: pointer;
          display: flex;
          flex-direction: column;
        }

        .property-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.3);
          border-color: rgba(99, 102, 241, 0.3);
        }

        .card-img-wrapper {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .property-card:hover .card-img { transform: scale(1.06); }

        .card-img-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(10,14,26,0.8) 0%, transparent 60%);
        }

        .card-price-badge {
          position: absolute;
          top: 14px;
          right: 14px;
          background: rgba(10,14,26,0.85);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(8px);
          padding: 6px 12px;
          border-radius: 100px;
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--color-accent);
        }

        .card-price-badge span {
          font-weight: 400;
          font-size: 0.75rem;
          color: var(--color-text-muted);
          margin-left: 2px;
        }

        .card-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .card-title {
          font-family: var(--font-serif);
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--color-text);
          line-height: 1.3;
        }

        .card-location {
          font-size: 0.85rem;
          color: var(--color-text-muted);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .card-location-icon { font-size: 0.8rem; }

        .card-description {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-top: 4px;
        }

        .card-vibes {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
        }

        .card-vibe-tag {
          padding: 4px 12px;
          background: rgba(52, 211, 153, 0.1);
          border: 1px solid rgba(52, 211, 153, 0.25);
          border-radius: 100px;
          font-size: 0.75rem;
          color: var(--color-accent);
          font-weight: 500;
        }
      `}</style>
    </article>
  );
};

export default PropertyCard;
