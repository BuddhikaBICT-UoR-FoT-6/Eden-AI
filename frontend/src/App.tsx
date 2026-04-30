import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ThemeSelector from './components/ThemeSelector';
import { ThemeProvider } from './theme/ThemeProvider';
import './index.css';

/**
 * App Root
 * SRP: Handles only routing configuration. All page logic lives in page components.
 * ThemeProvider wraps everything so all components can access the theme context.
 */
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="app-root">
          {/* Navigation */}
          <nav className="navbar" role="navigation" aria-label="Main navigation">
            <a href="/" className="navbar-brand" aria-label="Eden AI Home">
              <span className="navbar-logo">🌴</span>
              <span className="navbar-name">Eden <strong>AI</strong></span>
            </a>
            <p className="navbar-tagline">Sri Lanka's Vibe-Based Travel Finder</p>
          </nav>

          {/* Pages */}
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>

          {/* Footer */}
          <footer className="footer" role="contentinfo">
            <p>© 2026 Eden AI · Crafted for the Sri Lankan Tourism Market</p>
          </footer>
        </div>

        {/* Floating Theme Selector — available on all pages */}
        <ThemeSelector />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
