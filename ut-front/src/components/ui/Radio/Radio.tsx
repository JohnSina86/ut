import React from 'react';
import styles from './Radio.module.css';

interface RadioProps {
  label?: string;
  name: string;
  value: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Radio = ({
  label,
  name,
  value,
  checked,
  disabled = false,
  onChange,
}: RadioProps) => {
  return (
    <label className={styles.wrapper}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className={styles.radio}
      />
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
};

export default Radio;

