import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  fullWidth?: boolean;
  isLoading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  isLoading = false,
  type = 'button',
  onClick,
  children,
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={[
        styles.button,
        styles[variant],
        styles[size],
        fullWidth ? styles.fullWidth : '',
        isLoading ? styles.loading  : '',
      ].filter(Boolean).join(' ')}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? <span className={styles.spinner} /> : children}
    </button>
  );
};

export default Button;
