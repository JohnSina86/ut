import React from 'react';
import styles from './Rating.module.css';

interface RatingProps {
  children?: React.ReactNode;
}

export const Rating = ({ children }: RatingProps) => {
  return (
    <div className={styles.root}>
      {children}
    </div>
  );
};

export default Rating;
