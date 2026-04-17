import React from 'react';
import styles from './AuthForm.module.css';

interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (data: any) => void;
  onToggleMode: () => void;
}

export const AuthForm = ({ mode, onSubmit, onToggleMode }: AuthFormProps) => {
  const [formData, setFormData] = React.useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {mode === 'register' && (
        <div className={styles.field}>
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />
        </div>
      )}

      {mode === 'register' && (
        <div className={styles.field}>
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+353 87 123 4567"
          />
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
        />
      </div>

      {mode === 'register' && (
        <div className={styles.field}>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
        </div>
      )}

      {/* Removed any "Already have an account?" link from here */}

      <button type="submit" className={styles.submit}>
        {mode === 'login' ? 'Sign In' : 'Create Account'}
      </button>

      {/* Optionally add a toggle link at the bottom (styled) – but we already have it in footer, so keep only one */}
      {/* <div className={styles.toggle}>
        {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
        <button type="button" onClick={onToggleMode} className={styles.toggleLink}>
          {mode === 'login' ? 'Sign up' : 'Sign in'}
        </button>
      </div> */}
    </form>
  );
};