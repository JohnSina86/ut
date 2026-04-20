import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import styles from './AdminLayout.module.css';

interface NavItem {
  to: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/admin/appointments', label: 'Appointments' },
  // Future admin sections can be added here (Customers, Services, Reports, etc.)
];

/**
 * Shell for every /admin/* page: dark sidebar + white topbar.
 * Deliberately simple so it can be extended with more nav items later
 * without affecting the public-facing site layout.
 */
export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <h1 className={styles.brand}>UT Admin</h1>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}
        <NavLink to="/" className={({ isActive }) => styles.navLink} style={{ marginTop: 'auto', opacity: 0.6, fontSize: '0.85rem' }}>← Back to site</NavLink>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <h2 className={styles.topbarTitle}>Admin panel</h2>
          <div className={styles.topbarActions}>
            {user?.name && <span>Signed in as {user.name}</span>}
            <button
              type="button"
              className={styles.logoutBtn}
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

