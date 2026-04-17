import React, { useState } from 'react';
import { Input } from '../../components/ui/Input/Input';
import { Button } from '../../components/ui/Button/Button';
import styles from './PasswordResetPage.module.css';

export const PasswordResetPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.split}>

          {/* Left — brand panel */}
          <div className={styles.brand}>
            <div className={styles.brandLogo}>
              <span className={styles.brandAccent}>United</span>
              <span className={styles.brandMain}>Tyres</span>
            </div>
            <h2 className={styles.brandTitle}>Forgot your password?</h2>
            <p className={styles.brandSub}>
              No worries — it happens to the best of us. Enter your email and we will send you a secure reset link in seconds.
            </p>
            <div className={styles.brandNote}>
              <span className={styles.noteIcon}>&#8987;</span>
              <span>Reset links expire after 30 minutes</span>
            </div>
            <div className={styles.brandNote}>
              <span className={styles.noteIcon}>&#128274;</span>
              <span>Your account stays secure throughout</span>
            </div>
          </div>

          {/* Right — form */}
          <div className={styles.form}>
            {submitted ? (
              <div className={styles.successState}>
                <div className={styles.successIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className={styles.title}>Check your email</h2>
                <p className={styles.subtitle}>
                  We sent a reset link to <strong>{email}</strong>. Check your inbox and follow the instructions.
                </p>
                <a href="/login" className={styles.back}>&#8592; Back to Sign In</a>
              </div>
            ) : (
              <>
                <div className={styles.formHeader}>
                  <div className={styles.iconWrap}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <h2 className={styles.title}>Reset Password</h2>
                  <p className={styles.subtitle}>
                    Enter your email and we&apos;ll send you a reset link.
                  </p>
                </div>
                <form className={styles.fields} onSubmit={handleSubmit}>
                  <Input
                    type="email"
                    label="Email Address"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button type="submit" variant="primary">
                    Send Reset Link
                  </Button>
                </form>
                <a href="/login" className={styles.back}>&#8592; Back to Sign In</a>
              </>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default PasswordResetPage;
