import React from 'react';
import styles from './ServiceCard.module.css';

interface ServiceCardProps {
  name: string;
  description?: string;
  duration: number;
  price?: number;
  icon?: React.ReactNode;
  selected?: boolean;
  onSelect: () => void;
}

export const ServiceCard = ({
  name, description, duration, price, icon, selected = false, onSelect,
}: ServiceCardProps) => (
  <div
    className={`${styles.card} ${selected ? styles.cardSelected : ''}`}
    onClick={onSelect}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === 'Enter' && onSelect()}
    aria-pressed={selected}
  >
    {icon && (
      <div className={styles.iconWrap}>
        <span className={styles.icon}>{icon}</span>
      </div>
    )}

    <div className={styles.body}>
      <h3 className={styles.title}>{name}</h3>
      {description && <p className={styles.description}>{description}</p>}
      <div className={styles.meta}>
        <span className={styles.duration}>⏱ {duration} min</span>
        {price !== undefined && (
          <span className={styles.price}>
            <span className={styles.priceFrom}>min </span>
            €{Number(price).toFixed(2)}
          </span>
        )}
      </div>
    </div>

    <div className={styles.footer}>
      <button
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        className={`${styles.cta} ${selected ? styles.ctaSelected : ''}`}
        aria-label={selected ? `Deselect ${name}` : `Select ${name}`}
      >
        {selected ? '✓ Selected' : 'Select →'}
      </button>
    </div>
  </div>
);

export default ServiceCard;
