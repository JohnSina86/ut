import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthForm } from '../../components/shared/AuthForm/AuthForm';
import { SocialLoginButtons } from '../../components/shared/SocialLoginButtons/SocialLoginButtons';
import { useAuth } from '../../context/AuthContext';
import styles from './SignUpPage.module.css';

const API_BASE = 'http://localhost:4000/api';

export const SignUpPage = () => {
  const navigate = useNavigate();
  const { register: authRegister } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setError('');
    setLoading(true);
    try {
      const fullName = data.fullName || data.email.split('@')[0];
      await authRegister(data.email, data.password, fullName, data.phone || undefined);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <Link to="/" className={styles.panelLogo}>
          <span className={styles.logoAccent}>United</span>
          <span className={styles.logoMain}>Tyres</span>
        </Link>
        <h2 className={styles.panelTitle}>Join Us Today</h2>
        <p className={styles.panelSub}>Create an account to book services, manage your vehicles, and track appointments.</p>
        <div className={styles.features}>
          <div className={styles.feature}><span className={styles.featureDot} />24/7 online booking</div>
          <div className={styles.feature}><span className={styles.featureDot} />Expert mechanics at your service</div>
          <div className={styles.feature}><span className={styles.featureDot} />Real-time appointment updates</div>
        </div>
      </div>

      <div className={styles.formPanel}>
        <div className={styles.card}>
          <h1 className={styles.title}>Create an Account</h1>
          <p className={styles.subtitle}>Sign up to manage bookings and vehicles.</p>

          {error && <div className={styles.error}>{error}</div>}

          <SocialLoginButtons
            onGoogleLogin={() => { window.location.href = `${API_BASE}/auth/google`; }}
            dividerLabel="or register with email"
          />

          <AuthForm
            mode="register"
            onSubmit={handleSubmit}
            onToggleMode={() => navigate('/login')}
          />

          <p className={styles.termsText}>
            By signing up, you agree to our{' '}
            <Link to="/terms" className={styles.termsLink}>Terms of Service</Link>{' '}
            and{' '}
            <Link to="/privacy" className={styles.termsLink}>Privacy Policy</Link>.
          </p>

          <span className={styles.switchText}>
            Already have an account?
            <Link to="/login" className={styles.switchLink}>Sign in</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
