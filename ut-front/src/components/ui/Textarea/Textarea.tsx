import React from 'react';
import styles from './Textarea.module.css';

interface TextareaProps {
  placeholder?: string;
  value?: string;
  label?: string;
  rows?: number;
  error?: string;
  disabled?: boolean;
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  grow?: boolean;
}

export const Textarea = ({
  placeholder,
  value,
  label,
  rows = 4,
  error,
  disabled = false,
  name,
  onChange,
  required = false,
  grow = false,
}: TextareaProps) => {
  return (
    <div className={styles.wrapper} style={grow ? { flex: 1, display: 'flex', flexDirection: 'column' } : {}}>
      {label && <label className={styles.label}>{label}</label>}
      <textarea
        placeholder={placeholder}
        value={value}
        rows={rows}
        disabled={disabled}
        name={name}
        onChange={onChange}
        required={required}
        className={styles.textarea} style={grow ? { flex: 1, resize: 'none' } : {}}
      />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};

export default Textarea;

