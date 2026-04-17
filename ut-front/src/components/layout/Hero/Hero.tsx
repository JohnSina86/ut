import React from 'react';
import styles from './Hero.module.css';

interface HeroCtaProps {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

interface HeroProps {
  title: string;
  subtitle?: string;
  cta?: HeroCtaProps | HeroCtaProps[];
  backgroundImage?: string;
  align?: 'left' | 'center';
  overlay?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const Hero = ({
  title,
  subtitle,
  cta,
  backgroundImage,
  align = 'center',
  overlay = true,
  children,
  className = '',
}: HeroProps) => {
  const ctaArray  = cta ? (Array.isArray(cta) ? cta : [cta]) : [];
  const alignClass = styles[`align-${align}`] ?? '';
  const bgStyle   = backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined;

  return (
    <section
      className={`${styles.hero} ${alignClass} ${className}`}
      style={bgStyle}
    >
      {backgroundImage && overlay && <div className={styles.overlay} />}
      <div className={styles.inner}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {ctaArray.length > 0 && (
          <div className={styles.ctaGroup}>
            {ctaArray.map((btn, i) => {
              const btnClass = `${styles.cta} ${styles[btn.variant ?? 'primary']}`;
              return btn.href ? (
                <a key={i} href={btn.href} className={btnClass}>
                  {btn.label}
                </a>
              ) : (
                <button key={i} onClick={btn.onClick} className={btnClass}>
                  {btn.label}
                </button>
              );
            })}
          </div>
        )}
        {children && <div className={styles.extra}>{children}</div>}
      </div>
    </section>
  );
};

export default Hero;

