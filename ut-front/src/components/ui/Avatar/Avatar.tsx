import React from 'react';
import styles from './Avatar.module.css';

interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar = ({
  src,
  alt = 'Avatar',
  initials,
  size = 'md',
}: AvatarProps) => {
  return (
    <div className={styles.avatar}>
      {src ? (
        <img src={src} alt={alt} className={styles.img} />
      ) : (
        <span className={styles.initials}>{initials ?? '?'}</span>
      )}
    </div>
  );
};

export default Avatar;

