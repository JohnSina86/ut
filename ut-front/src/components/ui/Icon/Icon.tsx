import React from 'react';
import styles from './Icon.module.css';

interface IconProps {
  name: string;           // SVG icon name or unicode char
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export const Icon = ({
  name,
  size = 'md',
  color,
  className = '',
  ariaLabel,
}: IconProps) => {
  return (
    <span
      className={styles.icon}
      style={{ color }}
      role="img"
      aria-label={ariaLabel ?? name}
    >
      {name}
    </span>
  );
};

export default Icon;

