import React from 'react';
import styles from './Header.module.css';

interface HeaderProps {
  logo?: React.ReactNode;
  nav?: React.ReactNode;
  actions?: React.ReactNode;
  sticky?: boolean;
  className?: string;
}

export const Header = ({
  logo,
  nav,
  actions,
  sticky = false,
  className = '',
}: HeaderProps) => {
  return (
    <header className={styles.header  }>
      <div className={styles.inner}>
        {logo && <div className={styles.logo}>{logo}</div>}
        {nav && <nav className={styles.nav}>{nav}</nav>}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </header>
  );
};

export default Header;

