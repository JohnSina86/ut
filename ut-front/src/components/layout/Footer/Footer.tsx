import React from 'react';
import styles from './Footer.module.css';

interface FooterProps {
  children?: React.ReactNode;
  copyright?: string;          // kept for compatibility but not used
  columns?: React.ReactNode[];
  className?: string;
}

export const Footer = ({
  children,
  columns,
  className = '',
}: FooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`${styles.footer} ${className}`}>
      {columns && columns.length > 0 && (
        <div className={styles.columns}>
          {columns.map((col, i) => (
            <div key={i} className={styles.column}>{col}</div>
          ))}
        </div>
      )}
      {children && <div className={styles.body}>{children}</div>}

      {/* New contact info section */}
      <div className={styles.contactInfo}>
        <h4>Visit Us</h4>
        <p>123 Main Street<br />Dundrum, Dublin</p>
        <p>Phone: <a href="tel:+35312345678">+353 1 234 5678</a></p>
        <p>
          <a 
            href="https://www.google.com/maps/search/?api=1&query=United+Tyres+Dundrum+Dublin" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Get Directions
          </a>
          <br/>
          <span className={styles.copyright}>
          © {currentYear} United Tyres Dundrum. All rights reserved.
        </span>
        </p>
          <br/>
      </div>
    </footer>
  );
};

export default Footer;