import React, { useState, useEffect, useRef } from 'react';
import SearchBar from '../components/SearchBar';
import PropertyGrid from '../components/PropertyGrid';
import Sidebar from '../components/Sidebar';
import ImmersiveBackground from '../components/ImmersiveBackground';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useWeather } from '../hooks/useWeather';
import { useTheme } from '../theme/ThemeProvider';
import { 
  initiateLogin,
  verifyLogin,
  initiateRegister,
  verifyRegister,
  updateUserConsent,
  getFeaturedProperties
} from '../services/api';
import type { Property } from '../services/api';

interface HomePageProps {
  searchState: {
    results: Property[];
    isLoading: boolean;
    error: string | null;
    hasSearched: boolean;
    search: (prompt: string) => Promise<void>;
    reset: () => void;
  };
  userProps: {
    currentUser: any;
    onLogin: (user: any) => void;
    onLogout: () => void;
    history: any[];
    suggestions: Property[];
    onHistoryClick: (query: string) => void;
    onConsentChange: (consent: boolean) => void;
  };
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  activeMobileTab?: 'search' | 'auth_explore' | 'settings';
  setActiveMobileTab?: (tab: 'search' | 'auth_explore' | 'settings') => void;
}

/**
 * HomePage — the main workspace.
 * Uses 65:35 split background, user profiles, and interactive cards.
 */
const HomePage: React.FC<HomePageProps> = ({ 
  searchState, 
  userProps, 
  isSidebarOpen, 
  setIsSidebarOpen,
  activeMobileTab = 'search',
  setActiveMobileTab
}) => {
  const { results, isLoading, error, hasSearched, search } = searchState;
  const isMobile = useMediaQuery('(max-width: 767px)');
  
  // Focused Property State for contact details and map expansion
  const [focusedPropertyIds, setFocusedPropertyIds] = useState<string[]>([]);
  const { themeId, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(themeId === 'light' ? 'dark' : 'light');
  };
  
  const [locationAllowed, setLocationAllowed] = useState(() => {
    return localStorage.getItem('eden-location-allowed') !== 'false';
  });

  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);

  // Fetch featured properties on initial load
  useEffect(() => {
    let isMounted = true;
    if (!hasSearched && featuredProperties.length === 0) {
      if (userProps.currentUser && locationAllowed && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            getFeaturedProperties(position.coords.latitude, position.coords.longitude)
              .then((props) => {
                if (isMounted) setFeaturedProperties(props);
              })
              .catch(err => console.error("Featured stays error", err));
          },
          (error) => {
            console.warn("Location not provided", error);
            getFeaturedProperties().then((props) => {
              if (isMounted) setFeaturedProperties(props);
            }).catch(err => console.error("Featured stays error", err));
          }
        );
      } else {
        getFeaturedProperties().then((props) => {
          if (isMounted) setFeaturedProperties(props);
        }).catch(err => console.error("Featured stays error", err));
      }
    }
    return () => { isMounted = false; };
  }, [hasSearched, featuredProperties.length, userProps.currentUser, locationAllowed]);

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [consent, setConsent] = useState(true);
  
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const handleMobileAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    if (isRegisterMode && (!name.trim() || !email.trim())) return;

    setIsAuthLoading(true);
    setAuthError(null);
    setAuthSuccessMsg(null);

    try {
      if (isRegisterMode) {
        const msg = await initiateRegister({ name, email, username, password, consent });
        setAuthSuccessMsg(msg);
        setIsOtpStep(true);
      } else {
        const emailSentTo = await initiateLogin({ username, password });
        setEmail(emailSentTo);
        setAuthSuccessMsg(`OTP sent to ${emailSentTo}`);
        setIsOtpStep(true);
      }
    } catch (err: any) {
      setAuthError(err.response?.data || 'Authentication failed. Please try again.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleMobileOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;

    setIsAuthLoading(true);
    setAuthError(null);

    try {
      if (isRegisterMode) {
        const user = await verifyRegister({ email, otpCode });
        userProps.onLogin(user);
        addToast(`Welcome to Eden AI, ${user.username}!`, "🎉");
      } else {
        const user = await verifyLogin({ email, otpCode });
        userProps.onLogin(user);
        addToast(`Welcome back, ${user.username}!`, "🔑");
      }
      setName('');
      setEmail('');
      setUsername('');
      setPassword('');
      setOtpCode('');
      setIsOtpStep(false);
      setAuthSuccessMsg(null);
    } catch (err: any) {
      setAuthError(err.response?.data || 'Invalid OTP. Please try again.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Toast Notifications State
  interface Toast {
    id: string;
    message: string;
    emoji: string;
  }
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, emoji: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, emoji }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // 1. Toast for Search Start
  const prevIsLoading = useRef<boolean>(false);
  useEffect(() => {
    if (isLoading && !prevIsLoading.current) {
      addToast("Analyzing your vibe and searching for perfect locations...", "🔍");
    }
    prevIsLoading.current = isLoading;
  }, [isLoading]);

  // 2. Toast for Search Results Count
  const prevResultsCount = useRef<number | null>(null);
  useEffect(() => {
    if (hasSearched && !isLoading && results) {
      if (prevResultsCount.current !== results.length) {
        addToast(`Found ${results.length} personalized vibe matches!`, "✨");
        prevResultsCount.current = results.length;
      }
    }
  }, [hasSearched, isLoading, results]);

  // 3. Toast for Errors
  useEffect(() => {
    if (error) {
      addToast("Unable to connect to Eden AI. Please check your internet connection and try again.", "⚠️");
    }
  }, [error]);

  // Ensure body scroll is unlocked so that users can explore featured stays on landing and scroll the panels
  useEffect(() => {
    document.body.style.overflow = 'unset';
    document.documentElement.style.overflow = 'unset';
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, []);

  // Determine active location from search results, defaulting to Sri Lanka (center)
  const activeLocation = hasSearched && results && results.length > 0 
    ? results[0].location 
    : 'Sri Lanka';

  const { weather } = useWeather(activeLocation);

  // Background click deselects any focused location card and closes sidebars
  const handleBackgroundClick = () => {
    if (focusedPropertyIds.length > 0) {
      setFocusedPropertyIds([]);
    }
    if (isRightSidebarOpen) {
      setIsRightSidebarOpen(false);
    }
  };

  const handleSuggestionClick = (property: Property) => {
    // Run search for this specific property and set it to focus once loaded
    search(`Find me ${property.name} in ${property.location}`);
    setFocusedPropertyIds((prev) => prev.includes(property.id) ? prev : [...prev, property.id]);
  };

  const handleFocusProperty = (id: string | null) => {
    if (!id) return;
    setFocusedPropertyIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter(p => p !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  return (
    <main 
      className={`home-page ${isSidebarOpen ? 'sidebar-active' : ''} ${isRightSidebarOpen ? 'right-sidebar-active' : ''} ${!hasSearched ? 'not-searched' : ''}`}
      onClick={handleBackgroundClick}
    >
      {/* 65:35 split background: Sky (Weather) & Ground (Holiday/Paradise) */}
      <ImmersiveBackground 
        condition={weather?.condition || 'clear'} 
        isDay={weather ? weather.isDay : true} 
      />

      {/* Toast Notification Container */}
      <div className="toast-container" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast-card glass-card">
            <span className="toast-emoji">{toast.emoji}</span>
            <p className="toast-message">{toast.message}</p>
            <button 
              className="toast-close-btn"
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Sidebar Toggle Button — Desktop Only */}
      {!isMobile && !isSidebarOpen && userProps.currentUser && (
        <button 
          className="sidebar-toggle-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsSidebarOpen(true);
          }}
          title="Expand menu"
          aria-label="Expand menu sidebar"
        >
          ☰ Menu
        </button>
      )}

      {/* Sidebar - Desktop Only */}
      {!isMobile && (
        <Sidebar 
          {...userProps}
          isOpen={isSidebarOpen}
          hasSearched={hasSearched}
          onSuggestionClick={handleSuggestionClick}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Right Sidebar Toggle Button — Desktop Only */}
      {!isMobile && !isRightSidebarOpen && (
        <button 
          className="right-sidebar-toggle-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsRightSidebarOpen(true);
          }}
          title="Featured Stays"
          aria-label="Expand featured stays sidebar"
        >
          🏨 Featured Stays
        </button>
      )}

      {/* Right Sidebar (Featured Stays) - Desktop Only */}
      {!isMobile && (
        <aside 
          className={`right-sidebar glass-card ${isRightSidebarOpen ? 'open' : 'collapsed'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sidebar-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="sidebar-title">Featured Stays</h3>
              <button 
                onClick={() => setIsRightSidebarOpen(false)}
                className="sidebar-inner-close-btn"
                aria-label="Close featured stays"
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  transition: 'background 0.2s'
                }}
              >
                ✕ Close
              </button>
            </div>
            <p className="sidebar-info-text">
              Recommended properties in Sri Lanka sorted by Google Maps review scores.
            </p>

            <div className="featured-stays-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
              {featuredProperties
                .slice()
                .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                .map((property) => (
                  <div 
                    key={property.id} 
                    className="sidebar-suggestion-card"
                    onClick={() => {
                      handleSuggestionClick(property);
                      setIsRightSidebarOpen(false);
                    }}
                    style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '10px', cursor: 'pointer' }}
                  >
                    <img 
                      src={property.imageUrl} 
                      alt={property.name} 
                      className="suggestion-img" 
                      style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div className="suggestion-details" style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginLeft: '12px' }}>
                      <div className="suggestion-name" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>{property.name}</div>
                      <div className="suggestion-loc" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>📍 {property.location}</div>
                      <div className="suggestion-rating" style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                        ⭐ {property.rating ? property.rating.toFixed(1) : '4.5'} ({property.reviewsCount || 100} reviews)
                      </div>
                      <div className="suggestion-price" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        ${property.pricePerNight} / night
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </aside>
      )}

      {isMobile && activeMobileTab !== 'search' ? (
        <div className="main-content">
          {activeMobileTab === 'auth_explore' && (
            <div className="mobile-panel">
              {userProps.currentUser ? (
                <>
                  <h2 className="mobile-panel-title">Explore Matches</h2>
                  <div className="mobile-card">
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
                      Personalized recommendations based on your saved vibes and previous travels:
                    </p>
                    {userProps.currentUser.consent ? (
                      userProps.suggestions.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {userProps.suggestions.map((property) => (
                            <div 
                              key={property.id} 
                              className="sidebar-suggestion-card"
                              onClick={() => handleSuggestionClick(property)}
                              style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '10px' }}
                            >
                              <img 
                                src={property.imageUrl} 
                                alt={property.name} 
                                className="suggestion-img" 
                                style={{ width: '60px', height: '60px' }}
                              />
                              <div className="suggestion-details">
                                <div className="suggestion-name" style={{ fontSize: '0.9rem' }}>{property.name}</div>
                                <div className="suggestion-loc" style={{ fontSize: '0.75rem' }}>📍 {property.location}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--color-text-muted)' }}>
                          <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>✨</span>
                          <p style={{ fontSize: '0.85rem' }}>No personalized recommendations yet. Try searching for different vibes!</p>
                        </div>
                      )
                    ) : (
                      <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-accent-2)', marginBottom: '12px', lineHeight: 1.4 }}>
                          Personalized vibe discovery is disabled. Enable search history access in Settings to view personalized matches.
                        </p>
                        <button 
                          className="auth-submit-btn" 
                          style={{ background: 'var(--color-accent-2)', width: 'auto', padding: '8px 16px', fontSize: '0.75rem' }}
                          onClick={() => setActiveMobileTab?.('settings')}
                        >
                          Go to Settings
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h2 className="mobile-panel-title">{isRegisterMode ? 'Create Account' : 'Sign In'}</h2>
                  <div className="mobile-card">
                    {isOtpStep ? (
                      <form onSubmit={handleMobileOtpSubmit} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <p className="auth-teaser" style={{ marginBottom: '8px' }}>
                          {authSuccessMsg || `Please enter the 6-digit code sent to your email.`}
                        </p>
                        
                        <div className="input-group">
                          <input 
                            type="text" 
                            placeholder="6-digit OTP" 
                            value={otpCode} 
                            onChange={(e) => setOtpCode(e.target.value)}
                            required
                            className="auth-input"
                            disabled={isAuthLoading}
                          />
                        </div>
                        
                        {authError && (
                          <div className="auth-error-msg" style={{ fontSize: '0.8rem', color: 'var(--color-danger)' }}>
                            ⚠️ {authError}
                          </div>
                        )}

                        <button type="submit" className="auth-submit-btn" disabled={isAuthLoading}>
                          {isAuthLoading ? 'Verifying...' : 'Verify OTP'}
                        </button>

                        <button 
                          type="button" 
                          onClick={() => {
                            setIsOtpStep(false);
                            setAuthError(null);
                            setAuthSuccessMsg(null);
                          }}
                          className="toggle-mode-btn"
                          disabled={isAuthLoading}
                          style={{ alignSelf: 'center', background: 'none', border: 'none', color: 'var(--color-primary)', textDecoration: 'underline', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleMobileAuthSubmit} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <p className="auth-teaser" style={{ marginBottom: '8px' }}>
                          Create an optional account to save your search history and unlock personalized vibe suggestions.
                        </p>
                        
                        {isRegisterMode && (
                          <>
                            <div className="input-group">
                              <input 
                                type="text" 
                                placeholder="Full Name" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="auth-input"
                                disabled={isAuthLoading}
                              />
                            </div>
                            <div className="input-group">
                              <input 
                                type="email" 
                                placeholder="Email Address" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="auth-input"
                                disabled={isAuthLoading}
                              />
                            </div>
                          </>
                        )}

                        <div className="input-group">
                          <input 
                            type="text" 
                            placeholder="Username" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="auth-input"
                            disabled={isAuthLoading}
                            autoComplete="username"
                          />
                        </div>
                        
                        <div className="input-group" style={{ position: 'relative' }}>
                          <input 
                            type={showPassword ? 'text' : 'password'} 
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="auth-input"
                            disabled={isAuthLoading}
                            autoComplete="current-password"
                            style={{ paddingRight: '40px' }}
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                              position: 'absolute',
                              right: '10px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              color: 'var(--color-text-muted)',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                          >
                            {showPassword ? '👁️' : '🙈'}
                          </button>
                        </div>

                        {isRegisterMode && (
                          <div className="consent-toggle-wrapper" style={{ marginTop: '4px' }}>
                            <label className="consent-label" style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                              <input 
                                type="checkbox" 
                                checked={consent}
                                onChange={(e) => setConsent(e.target.checked)}
                                className="consent-checkbox"
                                disabled={isAuthLoading}
                                style={{ marginTop: '3px' }}
                              />
                              <span className="consent-text" style={{ fontSize: '0.75rem' }}>
                                Allow using my search data to personalize recommendations and improve the AI models.
                              </span>
                            </label>
                          </div>
                        )}

                        {authError && (
                          <div className="auth-error-msg" style={{ fontSize: '0.8rem', color: 'var(--color-danger)' }}>
                            ⚠️ {authError}
                          </div>
                        )}

                        <button type="submit" className="auth-submit-btn" disabled={isAuthLoading}>
                          {isAuthLoading ? 'Processing...' : isRegisterMode ? 'Send OTP' : 'Login with OTP'}
                        </button>

                        <button 
                          type="button" 
                          onClick={() => {
                            setIsRegisterMode(!isRegisterMode);
                            setAuthError(null);
                            setAuthSuccessMsg(null);
                          }}
                          className="toggle-mode-btn"
                          disabled={isAuthLoading}
                          style={{ alignSelf: 'center', background: 'none', border: 'none', color: 'var(--color-primary)', textDecoration: 'underline', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                          {isRegisterMode ? 'Already have an account? Sign In' : "Don't have an account? Register"}
                        </button>
                      </form>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {activeMobileTab === 'settings' && (
            <div className="mobile-panel">
              <h2 className="mobile-panel-title">Settings</h2>
              
              {/* User Profile Info / Sign In Teaser */}
              {userProps.currentUser ? (
                <div className="mobile-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ fontSize: '2.5rem' }}>🌴</div>
                    <div>
                      <h4 style={{ color: 'var(--color-text)', fontSize: '1.1rem', fontWeight: 600 }}>Welcome, {userProps.currentUser.username}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Traveler Account</p>
                    </div>
                  </div>

                  <div className="settings-row" style={{ borderBottom: 'none', padding: '0', marginTop: '4px' }}>
                    <div className="settings-info">
                      <span className="settings-label" style={{ fontSize: '0.9rem' }}>Personalized Discovery</span>
                      <span className="settings-description" style={{ fontSize: '0.75rem' }}>
                        Use my search history to customize dashboard suggestions.
                      </span>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={userProps.currentUser.consent}
                        onChange={async (e) => {
                          const checked = e.target.checked;
                          try {
                            const updated = await updateUserConsent(userProps.currentUser.id, checked);
                            userProps.onConsentChange(updated.consent);
                            addToast(checked ? "Personalization enabled!" : "Personalization disabled.", "✨");
                          } catch (err) {
                            console.error('Failed to update consent', err);
                          }
                        }}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <button 
                    onClick={() => {
                      userProps.onLogout();
                      addToast("Logged out successfully.", "👋");
                    }} 
                    className="logout-btn"
                    style={{ marginTop: '8px' }}
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="mobile-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '2.5rem' }}>👤</div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Guest Account</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                    Sign in to save search history, enable AI model personalization, and unlock custom vibe matches.
                  </p>
                  <button 
                    className="auth-submit-btn" 
                    style={{ width: 'auto', padding: '10px 20px', marginTop: '4px' }}
                    onClick={() => setActiveMobileTab?.('auth_explore')}
                  >
                    Sign In / Register
                  </button>
                </div>
              )}

              {/* Preferences Settings (Location and Theme) */}
              <div className="mobile-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.06em', marginBottom: '8px' }}>Preferences</h3>
                
                {/* Location Detection */}
                <div className="settings-row">
                  <div className="settings-info">
                    <span className="settings-label">Location Detection Allowed</span>
                    <span className="settings-description">
                      Read device coordinates to query weather. Fallback defaults to Colombo.
                    </span>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={locationAllowed}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setLocationAllowed(checked);
                        localStorage.setItem('eden-location-allowed', checked ? 'true' : 'false');
                        addToast(
                          checked 
                            ? "Location detection enabled! Weather will sync with your device." 
                            : "Location detection disabled. Defaulting to Colombo.", 
                          "📍"
                        );
                      }}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                {/* Theme Selector */}
                <div className="settings-row">
                  <div className="settings-info">
                    <span className="settings-label">App Display Theme</span>
                    <span className="settings-description">
                      Toggle Light or Dark mode.
                    </span>
                  </div>
                  <button 
                    className="nav-theme-toggle-btn" 
                    onClick={toggleTheme}
                    style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', minWidth: '44px', minHeight: '44px' }}
                  >
                    {themeId === 'light' ? '🌙 Dark' : '☀️ Light'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="main-content">
          {/* Center fixed Workspace Vibe Card BEFORE searching */}
          {!hasSearched && (
            <div className="search-workspace-wrapper">
              <div className="hero-content">
                <div className="hero-badge">✨ AI-Powered Discovery</div>
                <h1 id="hero-headline" className="hero-title">
                  Find Your <span className="gradient-text">Perfect Vibe</span>
                  <br />in Sri Lanka
                </h1>
                <p className="hero-subtitle">
                  Describe your dream stay in plain English. Our AI finds hotels and villas
                  that match your mood.
                </p>
              </div>

              <div className="portal-search-bar-wrapper">
                <SearchBar 
                  onSearch={async (q) => {
                    setIsSidebarOpen(false);
                    await search(q);
                  }} 
                  isLoading={isLoading} 
                  weather={weather} 
                />
              </div>
            </div>
          )}

          {/* Results Section - Scrolls below search bar */}
          {(hasSearched || (isMobile && results && results.length > 0)) && (
            <section className="results-section" aria-label="Properties list">
              {!hasSearched && (
                <h2 className="featured-stays-title" style={{ fontSize: '1.5rem', fontWeight: 700, margin: '40px 0 16px', color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.5)', textAlign: 'center' }}>
                  Featured Stays in Sri Lanka
                </h2>
              )}
              <PropertyGrid
                properties={results}
                isLoading={isLoading}
                hasSearched={hasSearched}
                error={error}
                focusedPropertyIds={focusedPropertyIds}
                onFocusProperty={handleFocusProperty}
              />
            </section>
          )}
        </div>
      )}

      <style>{`
        /* HomePage Layout */
        .home-page {
          display: flex;
          flex-direction: column;
          flex: 1;
          position: relative;
          min-height: 100vh;
        }

        .home-page.not-searched {
          position: fixed;
          top: 80px;
          bottom: 0;
          left: 0;
          right: 0;
          overflow: hidden;
          height: auto;
          display: flex;
          flex-direction: column;
        }

        /* Toast Notification System */
        .toast-container {
          position: fixed;
          top: 88px;
          right: 24px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 360px;
          pointer-events: none;
        }

        @media (max-width: 767px) {
          .toast-container {
            top: 72px;
            right: 16px;
            width: calc(100% - 32px);
          }
        }

        .toast-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
          border-radius: 12px;
          background: color-mix(in srgb, var(--color-surface) 80%, transparent);
          border: 1px solid var(--color-border);
          box-shadow: 0 10px 30px rgba(0,0,0,0.25);
          pointer-events: auto;
          animation: slideInDown 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .toast-emoji {
          font-size: 1.5rem;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: wave 1s ease-in-out;
        }

        .toast-message {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--color-text);
          line-height: 1.4;
          flex: 1;
        }

        .toast-close-btn {
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          font-size: 0.8rem;
          padding: 4px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          width: 24px;
          height: 24px;
        }

        .toast-close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--color-text);
        }

        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes wave {
          0%, 100% { transform: rotate(0); }
          50%      { transform: rotate(15deg) scale(1.1); }
        }

        /* Sidebars overlay directly on top of centered main content, avoiding horizontal layout shifts */
        @media (min-width: 768px) {
          .home-page .main-content {
            transition: padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .home-page.sidebar-active .main-content {
            padding-left: 320px;
          }
          .home-page.right-sidebar-active .main-content {
            padding-right: 320px;
          }
        }

        /* Right Sidebar Toggle Button styling */
        .right-sidebar-toggle-btn {
          position: absolute;
          top: 16px;
          right: 24px;
          z-index: 1000;
          background: rgba(10, 14, 26, 0.85);
          border: 1px solid var(--color-border);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          color: #ffffff;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .right-sidebar-toggle-btn:hover {
          background: var(--color-primary-glow);
          border-color: var(--color-primary);
        }

        /* Collapsible Right Sidebar styling */
        .right-sidebar {
          display: flex;
          flex-direction: column;
          gap: 24px;
          overflow-y: auto;
          box-sizing: border-box;
          scrollbar-width: none;
          -ms-overflow-style: none;
          position: fixed;
          top: 80px;
          bottom: 48px;
          right: 0;
          width: 320px;
          height: calc(100vh - 80px - 48px);
          padding: 24px;
          border-radius: 0;
          border-top: none;
          border-bottom: none;
          border-right: none;
          border-left: 1px solid var(--color-border);
          z-index: 999;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .right-sidebar::-webkit-scrollbar {
          display: none;
        }
        .right-sidebar.collapsed {
          transform: translateX(100%);
        }
        .right-sidebar.open {
          transform: translateX(0);
        }

        /* Sidebar Toggle Button styling */
        .sidebar-toggle-btn {
          position: absolute;
          top: 16px;
          left: 24px;
          z-index: 1000;
          background: rgba(10, 14, 26, 0.85);
          border: 1px solid var(--color-border);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          color: #ffffff;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .sidebar-toggle-btn:hover {
          background: var(--color-primary-glow);
          border-color: var(--color-primary);
        }

        .home-page.sidebar-active .sidebar-toggle-btn {
          left: 344px; /* Move next to the 320px open sidebar */
        }

        @media (max-width: 767px) {
          .home-page.not-searched {
            top: 60px;
            bottom: 48px;
            padding: 16px;
          }
        }

        @media (min-width: 768px) {
          .home-page {
            flex-direction: row;
            max-width: 1450px;
            margin: 0 auto;
            width: 100%;
            align-items: flex-start;
            padding: 24px;
            gap: 24px;
          }
          .home-page.not-searched {
            left: 0;
            right: 0;
            margin: 0 auto;
            width: 100%;
            max-width: 100%;
            flex-direction: row;
            padding: 24px;
            bottom: 48px;
          }
        }

        .home-page.not-searched .main-content {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding-top: 40px; /* Space just below top nav bar */
          padding-bottom: 24px;
          padding-left: 24px;
          padding-right: 24px;
          box-sizing: border-box;
          flex: 1;
        }

        .home-page.not-searched .search-bar-wrapper {
          max-width: 580px;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          z-index: 2; /* Sits on top of the immersive background */
        }

        /* Hero */
        .hero {
          position: relative;
          overflow: hidden;
          padding: 40px 24px 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 25vh;
          width: 100%;
        }

        .home-page.not-searched .hero {
          min-height: auto;
          padding: 20px 24px 10px;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          max-width: 860px;
          width: 100%;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 500;
          color: #ffffff;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .hero-title {
          font-family: var(--font-serif);
          font-size: clamp(2.2rem, 5.5vw, 3.8rem);
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: #ffffff;
          text-shadow: 0 2px 16px rgba(0,0,0,0.6);
        }

        .hero-subtitle {
          font-size: clamp(0.95rem, 1.8vw, 1.1rem);
          color: rgba(255, 255, 255, 0.85);
          max-width: 520px;
          line-height: 1.6;
          text-shadow: 0 1px 10px rgba(0,0,0,0.5);
        }

        /* Center fixed Search Container before searching */
        .center-search-container {
          position: absolute;
          top: 65vh; /* Places it exactly at the white line / top of the ground */
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          padding: 0 24px;
          display: flex;
          justify-content: center;
          z-index: 10;
        }

        /* Sticky Search Container right below top nav bar after searching */
        .sticky-search-container {
          position: sticky;
          top: 80px; /* Below the 80px desktop navbar */
          z-index: 900;
          background: color-mix(in srgb, var(--color-bg) 85%, transparent);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          padding: 12px 24px;
          border-bottom: 1px solid var(--color-border);
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .search-weather-info {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--color-text-muted);
          padding-left: 4px;
        }

        .weather-info-location {
          font-weight: 600;
          color: var(--color-text);
        }

        @media (max-height: 700px) {
          .home-page.not-searched .hero {
            padding: 10px 16px;
          }
          .home-page.not-searched .center-search-container {
            padding: 0 16px 10px;
          }
          .home-page.not-searched .hero-subtitle {
            display: none;
          }
        }

        @media (max-width: 767px) {
          .sticky-search-container {
            top: 60px; /* Below the 60px mobile header */
            padding: 8px 16px;
          }
        }

        /* Results */
        .results-section {
          padding: 24px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          width: 100%;
        }

        /* ─── Search Workspace Wrapper ─────────────────────────────────────── */
        .search-workspace-wrapper {
          width: 100%;
          max-width: 860px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          box-sizing: border-box;
          z-index: 5;
        }

        .portal-search-bar-wrapper {
          width: 100%;
          max-width: 680px;
        }
      `}</style>
    </main>
  );
};

export default HomePage;
