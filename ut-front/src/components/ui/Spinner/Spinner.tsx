import React from 'react';
import styles from './Spinner.module.css';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  label?: string;
}

export const Spinner = ({
  size = 'md',
  color,
  label = 'Loading...',
}: SpinnerProps) => {
  return (
    <div className={styles.wrapper} role="status" aria-label={label}>
      <div
        className={styles.spinner}
        style={{ borderTopColor: color ?? '#2563eb' }}
      />
    </div>
  );
};

export default Spinner;

