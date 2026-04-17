import React from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

export const Badge = ({
  label,
  variant = 'default',
  size = 'md',
}: BadgeProps) => {
  return (
    <span className={styles.badge}>
      {label}
    </span>
  );
};

export default Badge;

