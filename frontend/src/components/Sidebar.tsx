import React, { useState } from 'react';
import { 
  initiateLogin,
  verifyLogin,
  initiateRegister,
  verifyRegister
} from '../services/api';
import type { User, SearchHistory, Property } from '../services/api';

interface SidebarProps {
  currentUser: User | null;
  onLogin: (user: User) => void;
  history: SearchHistory[];
  suggestions: Property[];
  onHistoryClick: (query: string) => void;
  onSuggestionClick: (property: Property) => void;
  isOpen?: boolean;
  hasSearched?: boolean;
  onClose?: () => void;
}

/**
 * Desktop-only Sidebar
 * Houses optional User Login/Register section, search history logs, 
 * user model improvement consent, and personalized suggestions.
 */
const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  onLogin,
  history,
  suggestions,
  onHistoryClick,
  onSuggestionClick,
  isOpen = false,
  onClose,
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [consent, setConsent] = useState(true);
  
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    if (isRegisterMode && (!name.trim() || !email.trim())) return;

    setIsLoading(true);
    setAuthError(null);
    setAuthSuccessMsg(null);

    try {
      if (isRegisterMode) {
        const msg = await initiateRegister({ name, email, username, password, consent });
        setAuthSuccessMsg(msg);
        setIsOtpStep(true);
      } else {
        const emailSentTo = await initiateLogin({ username, password });
        setEmail(emailSentTo); // Required for OTP verification
        setAuthSuccessMsg(`OTP sent to ${emailSentTo}`);
        setIsOtpStep(true);
      }
    } catch (err: any) {
      setAuthError(err.response?.data || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;

    setIsLoading(true);
    setAuthError(null);

    try {
      if (isRegisterMode) {
        const user = await verifyRegister({ email, otpCode });
        onLogin(user);
      } else {
        const user = await verifyLogin({ email, otpCode });
        onLogin(user);
      }
      // Reset form
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
      setIsLoading(false);
    }
  };

  const sidebarClass = `logged-in ${isOpen ? 'open' : 'collapsed'}`;

  return (
    <aside 
      className={`sidebar glass-card ${sidebarClass}`}
      aria-label="User Account and Travel History"
      onClick={(e) => e.stopPropagation()}
    >
      
      {/* ─── User Authentication Section (Guests Only) ─── */}
      {!currentUser && (
        <div className="sidebar-section auth-section">
          {onClose && (
            <button 
              onClick={onClose} 
              className="sidebar-inner-close-btn"
              aria-label="Close sidebar"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '16px',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)'}
            >
              ❮ Close
            </button>
          )}
          {isOtpStep ? (
            <form onSubmit={handleOtpSubmit} className="auth-form">
              <h3 className="sidebar-title">Verify OTP</h3>
              <p className="auth-teaser">
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
                  disabled={isLoading}
                />
              </div>
              
              {authError && <div className="auth-error-msg">{authError}</div>}

              <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button 
                type="button" 
                onClick={() => {
                  setIsOtpStep(false);
                  setAuthError(null);
                  setAuthSuccessMsg(null);
                }}
                className="toggle-mode-btn"
                disabled={isLoading}
              >
                Cancel
              </button>
            </form>
          ) : (
            <form onSubmit={handleAuthSubmit} className="auth-form">
              <h3 className="sidebar-title">{isRegisterMode ? 'Register Account' : 'Sign In'}</h3>
              <p className="auth-teaser">
                Create an optional account to save your search history and get personalized vibe matches.
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
                      disabled={isLoading}
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
                      disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                <div className="consent-toggle-wrapper">
                  <label className="consent-label">
                    <input 
                      type="checkbox" 
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="consent-checkbox"
                      disabled={isLoading}
                    />
                    <span className="consent-text">
                      Allow using my search data to personalize recommendations and improve the AI models.
                    </span>
                  </label>
                </div>
              )}

              {authError && <div className="auth-error-msg">{authError}</div>}

              <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                {isLoading ? 'Processing...' : isRegisterMode ? 'Send OTP' : 'Login with OTP'}
              </button>

              <button 
                type="button" 
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setAuthError(null);
                  setAuthSuccessMsg(null);
                }}
                className="toggle-mode-btn"
                disabled={isLoading}
              >
                {isRegisterMode ? 'Already have an account? Sign In' : "Don't have an account? Register"}
              </button>
            </form>
          )}
        </div>
      )}



      <hr className="sidebar-divider" />

      {/* ─── Search History Section ─── */}
      <div className="sidebar-section">
        <h3 className="sidebar-title">Searched Locations</h3>
        {currentUser ? (
          history.length > 0 ? (
            <ul className="history-list">
              {history.map((item) => (
                <li key={item.id} className="history-item">
                  <button 
                    onClick={() => onHistoryClick(item.query)}
                    className="history-query-btn"
                    title={`Search again for "${item.query}"`}
                  >
                    <span className="history-icon">🔍</span>
                    <span className="history-text">{item.query}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="sidebar-info-text">No previous searches yet. Start typing vibes!</p>
          )
        ) : (
          <p className="sidebar-info-text italic">
            Please register or sign in to view and save your previous searches.
          </p>
        )}
      </div>

      {/* ─── Suggestions Section ─── */}
      {currentUser && currentUser.consent && suggestions.length > 0 && (
        <>
          <hr className="sidebar-divider" />
          <div className="sidebar-section">
            <h3 className="sidebar-title">Vibe Matches For You</h3>
            <div className="suggestions-list">
              {suggestions.map((property) => (
                <div 
                  key={property.id} 
                  className="sidebar-suggestion-card"
                  onClick={() => onSuggestionClick(property)}
                  title="Click to view details"
                >
                  <img 
                    src={property.imageUrl} 
                    alt={property.name} 
                    className="suggestion-img" 
                  />
                  <div className="suggestion-details">
                    <div className="suggestion-name">{property.name}</div>
                    <div className="suggestion-loc">📍 {property.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <style>{`
        .sidebar {
          display: flex;
          flex-direction: column;
          gap: 24px;
          overflow-y: auto;
          box-sizing: border-box;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .sidebar::-webkit-scrollbar {
          display: none;
        }


        .sidebar.logged-in {
          position: fixed;
          top: 80px;
          bottom: 48px;
          left: 0;
          width: 320px;
          height: calc(100vh - 80px - 48px);
          padding: 24px;
          border-radius: 0;
          border-top: none;
          border-bottom: none;
          border-left: none;
          z-index: 999;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar.logged-in.collapsed {
          transform: translateX(-100%);
        }

        .sidebar.logged-in.open {
          transform: translateX(0);
        }

        .sidebar-divider {
          border: none;
          border-top: 1px solid var(--color-border);
          margin: 4px 0;
        }

        .sidebar-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .sidebar-title {
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--color-primary);
        }

        .sidebar-info-text {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          line-height: 1.4;
        }

        .sidebar-info-text.italic {
          font-style: italic;
        }

      `}</style>
    </aside>
  );
};

export default Sidebar;
