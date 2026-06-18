import React from 'react';
import CulturalOverlay from './CulturalOverlay';

interface PropertyCardProps {
  id: string;
  name: string;
  description: string;
  location: string;
  pricePerNight: number;
  imageUrl: string;
  contactDetails?: string;
  vibes: string[];
  isFocused: boolean;
  onFocus: () => void;
  onCloseFocus: () => void;
}

/**
 * PropertyCardSkeleton — shown while data is loading.
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

/**
 * PropertyCard Component
 * Displays property detail cards with support for a focused expanded view.
 * Displays contact details and an interactive Google Map on focus.
 */
const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  name,
  description,
  location,
  pricePerNight,
  imageUrl,
  vibes,
  contactDetails,
  isFocused,
  onFocus,
  onCloseFocus,
}) => {
  // Cap displayed vibes at 3
  const displayedVibes = vibes.slice(0, 3);
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(pricePerNight);

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent propagating up to homepage background deselect handler
    e.stopPropagation();
    if (!isFocused) {
      onFocus();
    }
  };

  // Helper to parse contact details into structured links
  const extractContacts = (text?: string) => {
    if (!text) return { phones: [], emails: [], urls: [] };
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/g;
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
    
    const emails = Array.from(text.match(emailRegex) || []);
    const urls = Array.from(text.match(urlRegex) || []);
    
    let tempText = text;
    emails.forEach(e => tempText = tempText.replace(e, ''));
    urls.forEach(u => tempText = tempText.replace(u, ''));
    
    const phoneRegex = /(\+?\d[\d\s-]{7,15}\d)/g;
    const phones = Array.from(tempText.match(phoneRegex) || []).map(p => p.trim());

    return { phones, emails, urls };
  };

  const { phones, emails, urls } = extractContacts(contactDetails);

  return (
    <article
      className={`property-card ${isFocused ? 'focused' : ''}`}
      id={`property-card-${id}`}
      aria-label={`Property: ${name}`}
      onClick={handleCardClick}
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
        
        {isFocused && (
          <button 
            className="close-focused-badge-btn"
            onClick={(e) => {
              e.stopPropagation();
              onCloseFocus();
            }}
            title="Back to Results"
            aria-label="Back to results"
          >
            ✕ Close
          </button>
        )}
      </div>

      <div className="card-body">
        <h3 className="card-title">{name}</h3>
        <p className="card-location">
          <span className="card-location-icon">📍</span>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${location} Sri Lanka`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="location-link"
            aria-label={`View ${name} on Google Maps`}
            onClick={(e) => e.stopPropagation()}
          >
            {location}, Sri Lanka
          </a>
        </p>
        
        <p className="card-description">{description}</p>

        {/* Show contact details and map only when expanded/focused */}
        {isFocused ? (
          <div className="card-focused-details" onClick={(e) => e.stopPropagation()}>
            {/* Action Buttons for User Interaction */}
            <div className="card-action-buttons">
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${location} Sri Lanka`)}`}
                target="_blank" rel="noopener noreferrer"
                className="action-btn map-btn"
              >
                🗺️ Access Map
              </a>
              
              {phones.length > 0 && (
                <a href={`tel:${phones[0].replace(/[\s-]/g, '')}`} className="action-btn call-btn">
                  📞 Call Number
                </a>
              )}

              {urls.length > 0 && (
                <a href={urls[0].startsWith('http') ? urls[0] : `https://${urls[0]}`} target="_blank" rel="noopener noreferrer" className="action-btn web-btn">
                  🌐 Visit Website
                </a>
              )}
              
              {emails.length > 0 && (
                <a href={`mailto:${emails[0]}`} className="action-btn email-btn">
                  ✉️ Email
                </a>
              )}
            </div>
            
            {/* Embed Google Map for the location */}
            <div className="map-embed-wrapper">
              <iframe
                title={`Map of ${name}`}
                width="100%"
                height="200"
                style={{ border: 0, borderRadius: '12px' }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(`${name} ${location} Sri Lanka`)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
              />
            </div>

            <button 
              className="close-focused-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                onCloseFocus();
              }}
            >
              ← Back to Results
            </button>
          </div>
        ) : (
          <div className="card-focused-teaser">
            <span className="teaser-text">ℹ️ Click card to view contact & map location</span>
          </div>
        )}

        {displayedVibes.length > 0 && (
          <div className="card-vibes" aria-label="Property vibes">
            {displayedVibes.map((vibe) => (
              <span key={vibe} className="card-vibe-tag">{vibe}</span>
            ))}
          </div>
        )}

        <CulturalOverlay vibes={vibes} location={location} name={name} />
      </div>

      <style>{`
        .property-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .property-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(99,102,241,0.2);
          border-color: rgba(99, 102, 241, 0.25);
        }

        /* Focused / Expanded Card State */
        .property-card.focused {
          border-color: var(--color-primary);
          box-shadow: 0 20px 50px rgba(99, 102, 241, 0.25);
          cursor: default;
          grid-column: span 1; /* Keeping it in grid but styled beautifully */
          transform: none;
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

        .property-card:not(.focused):hover .card-img { 
          transform: scale(1.04); 
        }

        .card-img-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(10,14,26,0.7) 0%, transparent 60%);
        }

        .card-price-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          background: rgba(10,14,26,0.85);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(8px);
          padding: 6px 12px;
          border-radius: 100px;
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--color-accent);
          z-index: 2;
        }

        .card-price-badge span {
          font-weight: 400;
          font-size: 0.75rem;
          color: var(--color-text-muted);
          margin-left: 2px;
        }

        .close-focused-badge-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          background: var(--color-danger);
          border: none;
          color: white;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          z-index: 2;
        }

        .close-focused-badge-btn:hover {
          opacity: 0.9;
        }

        .card-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
        }

        .card-title {
          font-family: var(--font-serif);
          font-size: 1.25rem;
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

        .card-location-icon { font-size: 0.85rem; }

        .location-link {
          color: var(--color-text-muted);
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.2s;
        }

        .location-link:hover {
          color: var(--color-primary);
        }

        .card-description {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          line-height: 1.5;
        }

        .property-card:not(.focused) .card-description {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Focused Card Details & Maps */
        .card-focused-details {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 8px;
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .card-action-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 6px;
        }

        .action-btn {
          flex: 1;
          min-width: 130px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          color: white;
          transition: transform 0.2s, opacity 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .action-btn:hover {
          opacity: 0.95;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.25);
        }

        .map-btn { background: linear-gradient(135deg, #3b82f6, #2563eb); }
        .call-btn { background: linear-gradient(135deg, #10b981, #059669); }
        .web-btn { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
        .email-btn { background: linear-gradient(135deg, #f59e0b, #d97706); }

        .map-embed-wrapper {
          border: 1px solid var(--color-border);
          border-radius: 12px;
          overflow: hidden;
          background: #111827;
        }

        .close-focused-action-btn {
          width: 100%;
          padding: 10px;
          background: transparent;
          border: 1px solid var(--color-primary);
          color: var(--color-primary);
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 4px;
        }

        .close-focused-action-btn:hover {
          background: var(--color-primary-glow);
        }

        .card-focused-teaser {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          background: rgba(255, 255, 255, 0.01);
          border: 1px dashed var(--color-border);
          border-radius: 8px;
          padding: 6px 12px;
          margin-top: 4px;
          text-align: center;
        }

        .teaser-text {
          opacity: 0.8;
        }

        .card-vibes {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 4px;
        }

        .card-vibe-tag {
          padding: 4px 10px;
          background: rgba(52, 211, 153, 0.08);
          border: 1px solid rgba(52, 211, 153, 0.2);
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
