import React from 'react';
import { Star, MapPin, X } from 'lucide-react';

interface FeaturedStaysSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const FEATURED_STAYS = [
  {
    id: 1,
    name: "Wild Coast Tented Lodge",
    location: "Yala National Park",
    rating: 4.9,
    reviews: 1243,
    image: "https://images.unsplash.com/photo-1582610116397-edb318620f90?auto=format&fit=crop&q=80&w=400&h=300",
    vibe: "Luxury Safari"
  },
  {
    id: 2,
    name: "Ceylon Tea Trails",
    location: "Hatton",
    rating: 4.9,
    reviews: 892,
    image: "https://images.unsplash.com/photo-1546804784-896d274dcbf0?auto=format&fit=crop&q=80&w=400&h=300",
    vibe: "Heritage Tea Estate"
  },
  {
    id: 3,
    name: "Amanwella",
    location: "Tangalle",
    rating: 4.8,
    reviews: 654,
    image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=400&h=300",
    vibe: "Secluded Beach"
  },
  {
    id: 4,
    name: "Tri by Amaya",
    location: "Koggala Lake",
    rating: 4.8,
    reviews: 512,
    image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=400&h=300",
    vibe: "Eco-Wellness"
  },
  {
    id: 5,
    name: "Heritance Kandalama",
    location: "Dambulla",
    rating: 4.7,
    reviews: 3210,
    image: "https://images.unsplash.com/photo-1542314831-c6a4d14d8c1e?auto=format&fit=crop&q=80&w=400&h=300",
    vibe: "Jungle Architecture"
  }
];

export const FeaturedStaysSidebar: React.FC<FeaturedStaysSidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="featured-sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Content */}
      <div className={`featured-sidebar glass-card ${isOpen ? 'open' : ''}`}>
        <div className="featured-sidebar-header">
          <div>
            <h3>Featured Stays</h3>
            <p className="subtitle">Top Rated in Sri Lanka</p>
          </div>
          <button onClick={onClose} className="close-btn" aria-label="Close featured stays">
            <X size={24} />
          </button>
        </div>

        <div className="featured-stays-list">
          {FEATURED_STAYS.map((stay) => (
            <div key={stay.id} className="featured-stay-card glass-panel">
              <div className="featured-stay-image" style={{ backgroundImage: `url(${stay.image})` }}>
                <div className="featured-stay-rating glass-badge">
                  <Star size={14} className="star-icon" fill="currentColor" />
                  <span>{stay.rating}</span>
                </div>
              </div>
              <div className="featured-stay-info">
                <h4>{stay.name}</h4>
                <div className="featured-stay-meta">
                  <span className="location"><MapPin size={12} /> {stay.location}</span>
                  <span className="reviews">({stay.reviews} Google Reviews)</span>
                </div>
                <div className="featured-stay-vibe">{stay.vibe}</div>
              </div>
            </div>
          ))}
        </div>

        <style>{`
          .featured-sidebar-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            z-index: 1040;
            opacity: 1;
            transition: opacity 0.3s ease;
          }

          .featured-sidebar {
            position: fixed;
            top: 0;
            right: -400px;
            width: 100%;
            max-width: 400px;
            height: 100vh;
            z-index: 1050;
            background: color-mix(in srgb, var(--color-surface) 85%, transparent);
            border-left: 1px solid var(--color-border);
            display: flex;
            flex-direction: column;
            transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: -8px 0 32px rgba(0, 0, 0, 0.1);
          }

          .featured-sidebar.open {
            right: 0;
          }

          .featured-sidebar-header {
            padding: 24px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 1px solid var(--color-border);
          }

          .featured-sidebar-header h3 {
            margin: 0 0 4px 0;
            font-family: var(--font-serif);
            font-size: 1.5rem;
            color: var(--color-text);
          }

          .featured-sidebar-header .subtitle {
            margin: 0;
            font-size: 0.85rem;
            color: var(--color-text-muted);
            font-weight: 500;
          }

          .close-btn {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid var(--color-border);
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--color-text);
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .close-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.05);
          }

          .featured-stays-list {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .featured-stay-card {
            border-radius: 16px;
            overflow: hidden;
            background: color-mix(in srgb, var(--color-bg) 60%, transparent);
            border: 1px solid var(--color-border);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            cursor: pointer;
          }

          .featured-stay-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
            border-color: var(--color-primary);
          }

          .featured-stay-image {
            height: 160px;
            background-size: cover;
            background-position: center;
            position: relative;
          }

          .featured-stay-rating {
            position: absolute;
            top: 12px;
            right: 12px;
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 4px 10px;
            border-radius: 100px;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            color: #FFD700;
            font-weight: 700;
            font-size: 0.85rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .featured-stay-info {
            padding: 16px;
          }

          .featured-stay-info h4 {
            margin: 0 0 8px 0;
            font-size: 1.1rem;
            color: var(--color-text);
          }

          .featured-stay-meta {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 0.85rem;
            color: var(--color-text-muted);
            margin-bottom: 12px;
          }

          .featured-stay-meta .location {
            display: flex;
            align-items: center;
            gap: 4px;
            color: var(--color-text);
          }

          .featured-stay-vibe {
            display: inline-block;
            padding: 4px 12px;
            background: color-mix(in srgb, var(--color-primary) 15%, transparent);
            color: var(--color-primary);
            border-radius: 100px;
            font-size: 0.75rem;
            font-weight: 600;
          }
        `}</style>
      </div>
    </>
  );
};
