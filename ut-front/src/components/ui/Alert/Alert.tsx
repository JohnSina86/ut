import React from 'react';
import styles from './Alert.module.css';

interface AlertProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  onClose?: () => void;
}

export const Alert = ({
  message,
  type = 'info',
  title,
  onClose,
}: AlertProps) => {
  return (
    <div className={styles.alert} role="alert">
      <div className={styles.content}>
        {title && <strong className={styles.title}>{title}</strong>}
        <span>{message}</span>
      </div>
      {onClose && (
        <button className={styles.closeBtn} onClick={onClose} aria-label="Dismiss">
          &times;
        </button>
      )}
    </div>
  );
};

export default Alert;

