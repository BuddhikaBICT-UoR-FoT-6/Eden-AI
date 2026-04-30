import React from 'react';
import SearchBar from '../components/SearchBar';
import PropertyGrid from '../components/PropertyGrid';
import { useVibeSearch } from '../hooks/useVibeSearch';

/**
 * HomePage — the main page of Eden AI.
 *
 * Norman Emotional Design:
 * - Visceral: Full-screen hero with gradient bg, serif headline.
 * - Behavioral: Single, prominent search bar — no navigation clutter.
 * - Reflective: Tagline "Find your vibe" creates emotional alignment.
 *
 * ISO 9241-11:
 * - Effectiveness: Users can find results in one action.
 * - Efficiency: AI interprets intent, no multi-step filters needed.
 * - Satisfaction: Premium aesthetics create a positive first impression.
 */
const HomePage: React.FC = () => {
  const { results, isLoading, error, hasSearched, search } = useVibeSearch();

  return (
    <main className="home-page">
      {/* Hero Section */}
      <section className="hero" aria-labelledby="hero-headline">
        <div className="hero-bg-gradient" aria-hidden="true" />

        <div className="hero-content">
          <div className="hero-badge">✨ AI-Powered Discovery</div>
          <h1 id="hero-headline" className="hero-title">
            Find Your <span className="gradient-text">Perfect Vibe</span>
            <br />in Sri Lanka
          </h1>
          <p className="hero-subtitle">
            Describe your dream stay in plain English. Our AI finds hotels and villas
            that match your mood, not just your budget.
          </p>

          <div className="hero-search">
            <SearchBar onSearch={search} isLoading={isLoading} />
          </div>
        </div>

        {/* Decorative Blobs */}
        <div className="blob blob-1" aria-hidden="true" />
        <div className="blob blob-2" aria-hidden="true" />
      </section>

      {/* Results Section */}
      {hasSearched && (
        <section className="results-section" aria-label="Search results">
          <PropertyGrid
            properties={results}
            isLoading={isLoading}
            hasSearched={hasSearched}
            error={error}
          />
        </section>
      )}

      <style>{`
        .home-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* Hero */
        .hero {
          position: relative;
          overflow: hidden;
          padding: 80px 24px 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
        }

        .hero-bg-gradient {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.18) 0%, transparent 70%),
                      radial-gradient(ellipse 50% 40% at 80% 80%, rgba(52,211,153,0.1) 0%, transparent 60%);
          pointer-events: none;
        }

        .hero-content {
          position: relative;
          z-index: 1;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          max-width: 860px;
          width: 100%;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          background: rgba(99,102,241,0.12);
          border: 1px solid rgba(99,102,241,0.3);
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 500;
          color: #a5b4fc;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .hero-title {
          font-family: var(--font-serif);
          font-size: clamp(2.5rem, 7vw, 4.5rem);
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: var(--color-text);
        }

        .hero-subtitle {
          font-size: clamp(1rem, 2.5vw, 1.2rem);
          color: var(--color-text-muted);
          max-width: 520px;
          line-height: 1.7;
        }

        .hero-search { width: 100%; }

        /* Decorative background blobs */
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.12;
          pointer-events: none;
          animation: float 8s ease-in-out infinite;
        }

        .blob-1 {
          width: 400px; height: 400px;
          background: var(--color-primary);
          top: -100px; left: -100px;
        }

        .blob-2 {
          width: 300px; height: 300px;
          background: var(--color-accent);
          bottom: -80px; right: -80px;
          animation-delay: -4s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50%       { transform: translateY(-20px) scale(1.05); }
        }

        /* Results */
        .results-section {
          padding: 0 24px 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
      `}</style>
    </main>
  );
};

export default HomePage;
