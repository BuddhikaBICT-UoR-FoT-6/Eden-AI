import React, { useState } from 'react';
import { updateName, initiatePasswordChange, verifyPasswordChange } from '../services/api';
import type { User } from '../services/api';

interface UserSettingsModalProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onClose: () => void;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ currentUser, onUpdateUser, onClose }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  
  const [name, setName] = useState(currentUser.name || '');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const updatedUser = await updateName({ email: currentUser.email, name });
      onUpdateUser({ ...currentUser, name: updatedUser.name });
      setSuccessMsg("Name updated successfully!");
    } catch (err: any) {
      setErrorMsg("Failed to update name.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiatePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const msg = await initiatePasswordChange({ email: currentUser.email, newPassword: password });
      setSuccessMsg(msg);
      setIsOtpStep(true);
    } catch (err: any) {
      setErrorMsg("Failed to initiate password change.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const updatedUser = await verifyPasswordChange({ email: currentUser.email, otpCode });
      onUpdateUser(updatedUser);
      setSuccessMsg("Password changed successfully!");
      setIsOtpStep(false);
      setPassword('');
      setOtpCode('');
    } catch (err: any) {
      setErrorMsg("Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999
    }}>
      <div className="glass-card" style={{ width: '400px', maxWidth: '90%', padding: '24px', borderRadius: '16px', position: 'relative' }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.5rem' }}
        >×</button>
        
        <h2 style={{ color: '#fff', marginBottom: '24px', fontSize: '1.5rem' }}>Account Settings</h2>
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button 
            onClick={() => { setActiveTab('profile'); setIsOtpStep(false); setErrorMsg(null); setSuccessMsg(null); }}
            style={{ flex: 1, padding: '8px', background: activeTab === 'profile' ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >Profile</button>
          <button 
            onClick={() => { setActiveTab('password'); setIsOtpStep(false); setErrorMsg(null); setSuccessMsg(null); }}
            style={{ flex: 1, padding: '8px', background: activeTab === 'password' ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >Password</button>
        </div>

        {errorMsg && <div style={{ color: '#ff6b6b', background: 'rgba(255,0,0,0.1)', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>{errorMsg}</div>}
        {successMsg && <div style={{ color: '#51cf66', background: 'rgba(0,255,0,0.1)', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>{successMsg}</div>}

        {activeTab === 'profile' && (
          <form onSubmit={handleUpdateName}>
            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'var(--color-text-muted)', marginBottom: '8px', fontSize: '0.85rem' }}>Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="auth-input" 
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div className="input-group" style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: 'var(--color-text-muted)', marginBottom: '8px', fontSize: '0.85rem' }}>Email</label>
              <input 
                type="text" 
                value={currentUser.email} 
                disabled 
                className="auth-input" 
                style={{ width: '100%', boxSizing: 'border-box', opacity: 0.7 }}
              />
            </div>
            <button type="submit" disabled={isLoading} className="auth-submit-btn" style={{ width: '100%' }}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}

        {activeTab === 'password' && (
          !isOtpStep ? (
            <form onSubmit={handleInitiatePasswordChange}>
              <div className="input-group" style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', color: 'var(--color-text-muted)', marginBottom: '8px', fontSize: '0.85rem' }}>New Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="auth-input" 
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <button type="submit" disabled={isLoading} className="auth-submit-btn" style={{ width: '100%' }}>
                {isLoading ? 'Requesting OTP...' : 'Change Password'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyPasswordChange}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>Enter the OTP sent to your email to confirm password change.</p>
              <div className="input-group" style={{ marginBottom: '24px' }}>
                <input 
                  type="text" 
                  placeholder="6-digit OTP" 
                  value={otpCode} 
                  onChange={(e) => setOtpCode(e.target.value)} 
                  required 
                  className="auth-input" 
                  style={{ width: '100%', boxSizing: 'border-box', letterSpacing: '2px', textAlign: 'center' }}
                />
              </div>
              <button type="submit" disabled={isLoading} className="auth-submit-btn" style={{ width: '100%' }}>
                {isLoading ? 'Verifying...' : 'Verify & Change Password'}
              </button>
            </form>
          )
        )}
      </div>
    </div>
  );
};
