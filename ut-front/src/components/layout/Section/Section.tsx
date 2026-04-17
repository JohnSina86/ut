import React from 'react';
import styles from './Section.module.css';

interface SectionProps {
  title?: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  background?: 'white' | 'gray' | 'dark';
  spacing?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export const Section = ({
  title,
  subtitle,
  align = 'left',
  background = 'white',
  spacing = 'md',
  children,
  className = '',
}: SectionProps) => {
  const spacingClass = styles[`spacing-${spacing}`] ?? '';
  const alignClass   = styles[`align-${align}`]     ?? '';

  return (
    <section className={`${styles.section} ${styles[background]} ${spacingClass} ${className}`}>
      <div className={styles.inner}>
        {(title || subtitle) && (
          <div className={`${styles.heading} ${alignClass}`}>
            {title    && <h2 className={styles.title}>{title}</h2>}
            {subtitle && <p  className={styles.subtitle}>{subtitle}</p>}
          </div>
        )}
        <div className={styles.content}>{children}</div>
      </div>
    </section>
  );
};

export default Section;

