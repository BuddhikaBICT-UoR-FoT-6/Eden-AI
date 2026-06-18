import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SearchBar from './components/SearchBar';
import { FeaturedStaysSidebar } from './components/FeaturedStaysSidebar';
import { useMediaQuery } from './hooks/useMediaQuery';
import { useTheme } from './theme/ThemeProvider';
import { useVibeSearch } from './hooks/useVibeSearch';
import { 
  getUserHistory, 
  addUserHistory, 
  getSuggestions,
  pingBackend
} from './services/api';
import type { User, SearchHistory, Property } from './services/api';
import { UserSettingsModal } from './components/UserSettingsModal';
import './index.css';

/**
 * App Root
 * Implements Responsive Layout (PWA vs Desktop)
 */
const App: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const { themeId, setTheme } = useTheme();
  
  // Search state hook
  const searchState = useVibeSearch();
  const { isLoading, hasSearched, query, search, reset } = searchState;

  // Active mobile navigation tab state ('search' | 'auth_explore' | 'settings')
  const [activeMobileTab, setActiveMobileTab] = useState<'search' | 'auth_explore' | 'settings'>('search');

  // User state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('eden-user');
    return saved ? JSON.parse(saved) : null;
  });
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [suggestions, setSuggestions] = useState<Property[]>([]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFeaturedSidebarOpen, setIsFeaturedSidebarOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Ping backend on mount to wake from cold start
  useEffect(() => { pingBackend(); }, []);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(themeId === 'light' ? 'dark' : 'light');
  };

  // Load history and suggestions on user state change
  useEffect(() => {
    if (currentUser) {
      getUserHistory(currentUser.id).then(setHistory).catch(console.error);
      if (currentUser.consent) {
        getSuggestions(currentUser.id).then(setSuggestions).catch(console.error);
      } else {
        setSuggestions([]);
      }
      setIsSidebarOpen(false);
    } else {
      setHistory([]);
      setSuggestions([]);
      // Only close sidebar for guests if they have already searched, otherwise keep it open on initial load
      if (hasSearched) {
        setIsSidebarOpen(false);
      }
    }
  }, [currentUser, hasSearched]);

  // Listen to browser back/forward buttons to sync search state
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const q = urlParams.get('q');
      if (q) {
        search(q);
      } else {
        reset();
        // If returning to initial screen, keep sidebar open for guests, closed for users
        setIsSidebarOpen(!!currentUser);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [search, reset, currentUser]);

  // Wrap search function to also log query history in the database if logged in
  const handleSearch = async (prompt: string) => {
    setIsSidebarOpen(false);
    setActiveMobileTab('search');
    
    // Update URL so the browser "Back" button works
    const newUrl = `?q=${encodeURIComponent(prompt)}`;
    if (window.location.search !== newUrl) {
      window.history.pushState({ search: prompt }, '', newUrl);
    }

    await search(prompt);
    if (currentUser) {
      try {
        await addUserHistory(currentUser.id, prompt);
        const updatedHistory = await getUserHistory(currentUser.id);
        setHistory(updatedHistory);
        if (currentUser.consent) {
          const updatedSuggestions = await getSuggestions(currentUser.id);
          setSuggestions(updatedSuggestions);
        }
      } catch (err) {
        console.error('Failed to log search query', err);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('eden-user');
    setCurrentUser(null);
    reset();
  };

  const handleLogin = (user: User) => {
    localStorage.setItem('eden-user', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleConsentChange = (consent: boolean) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, consent };
      localStorage.setItem('eden-user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
    }
  };

  return (
    <BrowserRouter>
      <div className={`app-root ${isMobile ? 'mobile-layout' : 'desktop-layout'}`}>
        
        {/* Top Navigation - Desktop Only */}
        {!isMobile && (
          <nav className="navbar" role="navigation" aria-label="Main navigation">
            <div className="navbar-left">
              <a href="/" className="navbar-brand" aria-label="Eden AI Home" onClick={(e) => { e.preventDefault(); reset(); }}>
                <img src="/eden_logo.png" alt="Eden AI Logo" className="navbar-logo-img" />
                <span className="navbar-name">Eden <strong>AI</strong></span>
              </a>
              
              {/* Sign In Button for Guests (visible when sidebar is closed) */}
              {!currentUser && !isSidebarOpen && (
                <button 
                  className="yellow-blink-btn" 
                  onClick={() => setIsSidebarOpen(true)}
                  aria-label="Sign in to save searches"
                >
                  Sign In / Register
                </button>
              )}
            </div>
            
            <div className="navbar-center-item">
              {hasSearched ? (
                <SearchBar 
                  isNavbarMode={true} 
                  onSearch={handleSearch} 
                  isLoading={isLoading} 
                  onExit={reset} 
                  initialValue={query} 
                />
              ) : (
                <p className="navbar-tagline">Sri Lanka's Vibe-Based Travel Finder</p>
              )}
            </div>

            <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {currentUser && (
                <div className="navbar-user-profile" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>🌴</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>
                      Welcome, {currentUser.username}
                    </span>
                  </div>
                  <button 
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="settings-btn-navbar"
                    style={{
                      background: 'color-mix(in srgb, var(--color-surface) 60%, transparent)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                      padding: '6px 14px',
                      borderRadius: '100px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    ⚙️ Settings
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="logout-btn-navbar"
                    style={{
                      background: 'rgba(255, 107, 107, 0.1)',
                      border: '1px solid rgba(255, 107, 107, 0.3)',
                      color: '#ff6b6b',
                      padding: '6px 14px',
                      borderRadius: '100px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
              <button
                className="nav-theme-toggle-btn"
                onClick={toggleTheme}
                title={`Switch to ${themeId === 'light' ? 'Dark' : 'Light'} Mode`}
                aria-label="Toggle display theme"
              >
                {themeId === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
          </nav>
        )}

        {isSettingsModalOpen && currentUser && (
          <UserSettingsModal 
            currentUser={currentUser} 
            onUpdateUser={handleLogin} 
            onClose={() => setIsSettingsModalOpen(false)} 
          />
        )}

        {/* Mobile Header */}
        {isMobile && (
          <header className="mobile-header glass-card">
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <a href="/" className="navbar-brand" aria-label="Eden AI Home" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => { e.preventDefault(); reset(); }}>
                 <img src="/eden_logo.png" alt="Eden AI Logo" className="navbar-logo-img" style={{ height: '32px', width: '32px' }} />
                 {!hasSearched && <span className="navbar-name" style={{ fontSize: '1.2rem' }}>Eden <strong>AI</strong></span>}
               </a>
               {!currentUser && activeMobileTab !== 'auth_explore' && (
                  <button 
                    className="yellow-blink-btn" 
                    onClick={() => setActiveMobileTab('auth_explore')}
                    style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                  >
                    Sign In
                  </button>
               )}
             </div>

             {hasSearched && (
               <SearchBar 
                 isNavbarMode={true} 
                 onSearch={handleSearch} 
                 isLoading={isLoading} 
                 onExit={reset} 
                 initialValue={query} 
               />
             )}

             <button
               className="nav-theme-toggle-btn"
               onClick={toggleTheme}
               title={`Switch to ${themeId === 'light' ? 'Dark' : 'Light'} Mode`}
               aria-label="Toggle display theme"
               style={{ marginLeft: 'auto' }}
             >
               {themeId === 'light' ? '🌙' : '☀️'}
             </button>
          </header>
        )}

        {/* Featured Stays Sidebar */}
        <FeaturedStaysSidebar 
          isOpen={isFeaturedSidebarOpen} 
          onClose={() => setIsFeaturedSidebarOpen(false)} 
        />

        {/* Main Content Area */}
        <Routes>
          <Route path="/" element={
            <HomePage 
              searchState={{ ...searchState, search: handleSearch }} 
              userProps={{
                currentUser,
                onLogin: handleLogin,
                onLogout: handleLogout,
                history,
                suggestions,
                onHistoryClick: handleSearch,
                onConsentChange: handleConsentChange,
              }}
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              activeMobileTab={activeMobileTab}
              setActiveMobileTab={setActiveMobileTab}
            />
          } />
        </Routes>

        {/* Footer / Bottom Bar - Desktop Only */}
        {!isMobile && (
          <footer className="app-bottom-bar" role="contentinfo">
            <p>© 2026 Eden AI · All Rights Reserved</p>
          </footer>
        )}

        {/* Mobile Navigation Bar - Mobile Only */}
        {isMobile && (
          <nav className="mobile-bottom-nav" role="navigation" aria-label="Mobile Navigation">
            <button 
              className={`mobile-bottom-nav-item ${activeMobileTab === 'search' ? 'active' : ''}`}
              onClick={() => setActiveMobileTab('search')}
              aria-label="Search vibe"
              aria-pressed={activeMobileTab === 'search'}
            >
              <img src="/icon_search.png" alt="" className="mobile-bottom-nav-item-icon" />
              <span className="mobile-bottom-nav-item-label">Search</span>
            </button>
            
            <button 
              className={`mobile-bottom-nav-item ${activeMobileTab === 'auth_explore' ? 'active' : ''}`}
              onClick={() => setActiveMobileTab('auth_explore')}
              aria-label={currentUser ? 'Explore recommendations' : 'Login or Register'}
              aria-pressed={activeMobileTab === 'auth_explore'}
            >
              <img 
                src={currentUser ? '/icon_explore.png' : '/icon_login.png'} 
                alt="" 
                className="mobile-bottom-nav-item-icon" 
              />
              <span className="mobile-bottom-nav-item-label">
                {currentUser ? 'Explore' : 'Sign In'}
              </span>
            </button>

            <button 
              className={`mobile-bottom-nav-item ${activeMobileTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveMobileTab('settings')}
              aria-label="Settings"
              aria-pressed={activeMobileTab === 'settings'}
            >
              <img src="/icon_settings.png" alt="" className="mobile-bottom-nav-item-icon" />
              <span className="mobile-bottom-nav-item-label">Settings</span>
            </button>
          </nav>
        )}
      </div>
    </BrowserRouter>
  );
};

export default App;
