import React from 'react';
import styles from './Grid.module.css';

interface GridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'none' | 'sm' | 'md' | 'lg';
  rowGap?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Grid = ({
  children,
  columns = 3,
  gap = 'md',
  rowGap,
  className = '',
}: GridProps) => {
  const colClass   = styles[`cols${columns}`]       ?? '';
  const gapClass   = styles[`gap-${gap}`]           ?? '';
  const rowGapClass = rowGap ? (styles[`rowGap-${rowGap}`] ?? '') : '';

  return (
    <div className={`styles.grid ${colClass} ${gapClass} ${rowGapClass} ${className}`}>
      {children}
    </div>
  );
};

export default Grid;

