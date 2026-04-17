import React, { useState, useEffect } from 'react';
import { Footer }    from '../../components/layout/Footer/Footer';
import { Container } from '../../components/layout/Container/Container';
import { Input }     from '../../components/ui/Input/Input';
import { Button }    from '../../components/ui/Button/Button';
import { useAuth }   from '../../context/AuthContext';
import { authAPI }   from '../../services/api';
import styles from './AccountSettingsPage.module.css';

type NavTab = 'profile' | 'security' | 'danger';

export const AccountSettingsPage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('profile');
  const [profile,   setProfile]   = useState({ fullName: '', email: '', phone: '' });
  const [passwords, setPasswords] = useState({ current: '', newPw: '', confirm: '' });
  const [message,   setMessage]   = useState('');
  const [error,     setError]     = useState('');

  useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.name  ?? '',
        email:    user.email ?? '',
        phone:    user.phone ?? '',
      });
    }
  }, [user]);

  const clearFeedback = () => { setMessage(''); setError(''); };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearFeedback();
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearFeedback();
    setPasswords((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const saveProfile = async () => {
    try {
      clearFeedback();
      const updated = await authAPI.updateProfile(profile.fullName, profile.phone);
      localStorage.setItem('userData', JSON.stringify(updated));
      setMessage('Profile updated successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    }
  };

  const changePassword = async () => {
    try {
      clearFeedback();
      if (passwords.newPw !== passwords.confirm) { setError('Passwords do not match'); return; }
      if (passwords.newPw.length < 8)            { setError('Password must be at least 8 characters'); return; }
      await authAPI.updatePassword(passwords.current, passwords.newPw);
      setMessage('Password changed successfully.');
      setPasswords({ current: '', newPw: '', confirm: '' });
    } catch (err: any) {
      setError(err.message || 'Password change failed');
    }
  };

  const deleteAccount = async () => {
    if (!confirm('Are you sure? This permanently deletes your account and all data.')) return;
    try {
      await authAPI.deleteAccount();
      logout();
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
    }
  };

  const NAV: { id: NavTab; label: string; icon: string }[] = [
    { id: 'profile',  label: 'Profile',         icon: '👤' },
    { id: 'security', label: 'Security',         icon: '🔒' },
    { id: 'danger',   label: 'Danger Zone',      icon: '⚠️' },
  ];

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Container maxWidth="md">
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-dark)', marginBottom: 'var(--spacing-xl)' }}>
            Account Settings
          </h1>

          <div className={styles.layout}>

            {/* Sidebar */}
            <nav className={styles.settingsNav}>
              {NAV.map((item) => (
                <button
                  key={item.id}
                  className={[styles.navItem, activeTab === item.id ? styles.navItemActive : '', item.id === 'danger' ? styles.navItemDanger : ''].filter(Boolean).join(' ')}
                  onClick={() => { setActiveTab(item.id); clearFeedback(); }}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Panel */}
            <div className={styles.panel}>

              {/* Feedback */}
              {message && <p style={{ color: 'var(--color-success, green)', fontSize: 'var(--font-size-sm)', margin: 0 }}>✓ {message}</p>}
              {error   && <p style={{ color: 'var(--color-error)',          fontSize: 'var(--font-size-sm)', margin: 0 }}>✕ {error}</p>}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <>
                  <div>
                    <h2 className={styles.panelTitle}>Profile Information</h2>
                    <p className={styles.panelSubtitle}>Update your name and contact details.</p>
                  </div>
                  <div className={styles.panelSection}>
                    <div className={styles.formRow}>
                      <Input label="Full Name" name="fullName" value={profile.fullName} onChange={handleProfileChange} />
                      <Input label="Phone"     name="phone"    value={profile.phone}    onChange={handleProfileChange} type="tel" placeholder="+353 87 000 0000" />
                    </div>
                    <Input label="Email" name="email" value={profile.email} type="email" disabled onChange={() => {}} />
                    <div className={styles.actions}>
                      <Button variant="primary" onClick={saveProfile}>Save Changes</Button>
                    </div>
                  </div>
                </>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <>
                  <div>
                    <h2 className={styles.panelTitle}>Change Password</h2>
                    <p className={styles.panelSubtitle}>Use a strong password you don't use elsewhere.</p>
                  </div>
                  <div className={styles.panelSection}>
                    <Input label="Current Password" name="current" value={passwords.current} onChange={handlePasswordChange} type="password" placeholder="••••••••" />
                    <div className={styles.formRow}>
                      <Input label="New Password"     name="newPw"   value={passwords.newPw}   onChange={handlePasswordChange} type="password" placeholder="••••••••" />
                      <Input label="Confirm Password" name="confirm" value={passwords.confirm} onChange={handlePasswordChange} type="password" placeholder="••••••••" />
                    </div>
                    <div className={styles.actions}>
                      <Button variant="secondary" onClick={changePassword}>Update Password</Button>
                    </div>
                  </div>
                </>
              )}

              {/* Danger Tab */}
              {activeTab === 'danger' && (
                <>
                  <div>
                    <h2 className={styles.panelTitle} style={{ color: 'var(--color-error)' }}>Danger Zone</h2>
                    <p className={styles.panelSubtitle}>Permanent actions that cannot be undone.</p>
                  </div>
                  <div className={styles.panelSection}>
                    <div style={{ background: 'var(--color-error-light, #fef2f2)', border: '1px solid var(--color-error)', borderRadius: 'var(--border-radius-md)', padding: 'var(--spacing-lg)' }}>
                      <p style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-error)', marginBottom: 'var(--spacing-sm)' }}>Delete Account</p>
                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-grey)', marginBottom: 'var(--spacing-md)' }}>
                        Permanently delete your account and all associated vehicles, appointments, and data. This cannot be undone.
                      </p>
                      <Button variant="danger" onClick={deleteAccount}>Delete My Account</Button>
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>
        </Container>
      </main>
      <Footer copyright="© 2025 United Tyres Dundrum." />
    </div>
  );
};

export default AccountSettingsPage;
