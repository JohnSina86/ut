import React from 'react';
import styles from './Divider.module.css';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
}

export const Divider = ({
  orientation = 'horizontal',
  label,
}: DividerProps) => {
  if (orientation === 'vertical') {
    return <div className={styles.vertical} role="separator" />;
  }

  return (
    <div className={styles.horizontal} role="separator">
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
};

export default Divider;

