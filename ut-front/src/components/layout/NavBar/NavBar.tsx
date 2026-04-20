import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import styles from './NavBar.module.css';

interface NavItem { label: string; to: string; icon: string; }
interface User    { name: string; email: string; initials: string; }
interface NavBarProps { user?: User | null; onLogout?: () => void; isAdmin?: boolean; }

const NAV_ITEMS: NavItem[] = [
  { label: 'Home',     to: '/',         icon: '🏠' },
  { label: 'Services', to: '/services', icon: '🔧' },
  { label: 'Contact',  to: '/contact',  icon: '📞' },
];

const USER_MENU_ITEMS = [
  { label: 'Dashboard',         to: '/dashboard',        icon: '📊' },
  { label: 'Book Appointment',  to: '/booking',          icon: '📋' },
  { label: 'My Vehicles',       to: '/vehicles',         icon: '🚗' },
  { label: 'My Appointments',   to: '/appointments',     icon: '📅' },
  { label: 'Account Settings',  to: '/account-settings', icon: '⚙️' },
];

const Avatar = ({ initials }: { initials: string }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '1.875rem', height: '1.875rem', borderRadius: '50%',
    background: 'var(--color-accent)', color: '#fff',
    fontFamily: 'var(--font-heading)', fontWeight: 700,
    fontSize: '0.7rem', flexShrink: 0, letterSpacing: '0.02em',
  }}>
    {initials}
  </span>
);

export const NavBar = ({ user = null, onLogout, isAdmin = false }: NavBarProps) => {
  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate    = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = useCallback(() => {
    setUserMenuOpen(false);
    setMobileOpen(false);
    onLogout?.();
    navigate('/login');
  }, [onLogout, navigate]);

  const desktopClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.link} ${isActive ? styles.linkActive : ''}`;

  const drawerClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.drawerLink} ${isActive ? styles.drawerLinkActive : ''}`;

  return (
    <>
      <nav
        className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className={styles.inner}>

          {/* Logo */}
          <Link to="/" className={styles.logo} aria-label="United Tyres Home">
            <span className={styles.logoAccent}>United</span>
            <span className={styles.logoMain}>Tyres</span>
          </Link>

          {/* Desktop nav */}
          <div className={styles.links} role="menubar">
            {NAV_ITEMS.map(({ label, to }) => (
              <NavLink key={to} to={to} className={desktopClass} end={to === '/'}>
                {label}
              </NavLink>
            ))}
          </div>

          {/* Desktop actions */}
          <div className={styles.actions}>
            {user ? (
              <div className={styles.userMenu} ref={dropdownRef}>
                <button
                  className={styles.userBtn}
                  onClick={() => setUserMenuOpen(o => !o)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  aria-label="Account menu"
                >
                  <Avatar initials={user.initials} />
                  <span>{user.name.split(' ')[0]}</span>
                  <span className={`${styles.userChevron} ${userMenuOpen ? styles.userChevronOpen : ""}`} />
                </button>

                {userMenuOpen && (
                  <div className={styles.dropdown} role="menu">
                    <div className={styles.dropdownHeader}>
                      <div className={styles.dropdownName}>{user.name}</div>
                      <div className={styles.dropdownEmail}>{user.email}</div>
                    </div>
                    {USER_MENU_ITEMS.map(({ label, to, icon }) => (
                      <Link key={to} to={to} className={styles.dropdownItem} role="menuitem"
                        onClick={() => setUserMenuOpen(false)}>
                        <span className={styles.dropdownIcon}>{icon}</span>{label}
                      </Link>
                    ))}
                                        {isAdmin && (
                      <Link to="/admin/appointments" className={styles.dropdownItem} role="menuitem" onClick={() => setUserMenuOpen(false)}>
                        <span className={styles.dropdownIcon}>🛡️</span>Admin Panel
                      </Link>
                    )}<div className={styles.dropdownDivider} />
                    <button className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                      role="menuitem" onClick={handleLogout}>
                      <span className={styles.dropdownIcon}>🚪</span>Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login"   className={styles.loginBtn}>Sign in</Link>
                <Link to="/booking" className={styles.bookBtn}>Book Now</Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            className={styles.hamburger}
            onClick={() => setMobileOpen(o => !o)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            <span className={`${styles.bar} ${mobileOpen ? styles.barOpen : ''}`} />
            <span className={`${styles.bar} ${mobileOpen ? styles.barOpen : ''}`} />
            <span className={`${styles.bar} ${mobileOpen ? styles.barOpen : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className={styles.overlay} onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <div className={styles.drawer} aria-label="Mobile navigation">
            <div className={styles.drawerInner}>
              {NAV_ITEMS.map(({ label, to, icon }) => (
                <NavLink key={to} to={to} className={drawerClass} end={to === '/'}
                  onClick={() => setMobileOpen(false)}>
                  <span>{icon}</span>{label}
                </NavLink>
              ))}

              <div className={styles.drawerDivider} />

              {user ? (
                <>
                  <div style={{ padding: '0.5rem var(--spacing-md)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    {user.name}
                  </div>
                  {USER_MENU_ITEMS.map(({ label, to, icon }) => (
                    <NavLink key={to} to={to} className={drawerClass} onClick={() => setMobileOpen(false)}>
                      <span>{icon}</span>{label}
                    </NavLink>
                  ))}
                  <div className={styles.drawerDivider} />
                  <div className={styles.drawerActions}>
                    <button onClick={handleLogout}
                      className={`${styles.drawerLink} ${styles.dropdownItemDanger}`}
                      style={{ border: 'none', background: 'transparent', fontFamily: 'inherit', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
                      🚪 Sign out
                    </button>
                  </div>
                </>
              ) : (
                <div className={styles.drawerActions}>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className={styles.loginBtn}
                    style={{ justifyContent: 'center', border: '1.5px solid var(--color-border)', borderRadius: 'var(--border-radius-md)', padding: '0.75rem' }}>
                    Sign in
                  </Link>
                  <Link to="/booking" onClick={() => setMobileOpen(false)} className={styles.bookBtn}
                    style={{ justifyContent: 'center', padding: '0.75rem' }}>
                    Book Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default NavBar;





