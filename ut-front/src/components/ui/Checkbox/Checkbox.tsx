import React from 'react';
import styles from './Checkbox.module.css';

interface CheckboxProps {
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Checkbox = ({
  label,
  checked,
  disabled = false,
  onChange,
}: CheckboxProps) => {
  return (
    <label className={styles.wrapper}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className={styles.checkbox}
      />
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
};

export default Checkbox;

