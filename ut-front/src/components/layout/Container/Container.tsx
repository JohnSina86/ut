import React from 'react';
import styles from './Container.module.css';

interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export const Container = ({
  children,
  maxWidth,
  size,
  className = '',
}: ContainerProps) => {
  // size is alias for maxWidth if provided
  const width = maxWidth || size || 'lg';
  return (
    <div className={styles.container} data-maxwidth={width}>
      {children}
    </div>
  );
};

export default Container;

