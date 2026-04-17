import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input/Input';
import { Button } from '../../components/ui/Button/Button';
import { SocialLoginButtons } from '../../components/shared/SocialLoginButtons/SocialLoginButtons';
import styles from './LoginPage.module.css';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const API_BASE = 'http://localhost:4000/api';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  return (
    <div className={styles.page}>
      <div className={styles.split}>

        {/* Left panel - brand */}
        <div className={styles.brand}>
          <div className={styles.brandLogo}>
            <span className={styles.brandAccent}>United</span>
            <span className={styles.brandMain}>Tyres</span>
          </div>
          <h2 className={styles.brandTitle}>Welcome Back</h2>
          <p className={styles.brandSub}>
            Sign in to manage your bookings, vehicles, and appointments.
          </p>
          <div className={styles.brandFeatures}>
            <div className={styles.brandFeature}>
              <span className={styles.featureIcon}>&#10003;</span>
              <span>24/7 online booking</span>
            </div>
            <div className={styles.brandFeature}>
              <span className={styles.featureIcon}>&#10003;</span>
              <span>Expert mechanics at your service</span>
            </div>
            <div className={styles.brandFeature}>
              <span className={styles.featureIcon}>&#10003;</span>
              <span>Real-time appointment updates</span>
            </div>
          </div>
        </div>

        {/* Right panel - form */}
        <div className={styles.form}>
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>Login</h1>
            <p className={styles.formSub}>
              Enter your credentials to access your account.
            </p>
          </div>

          <SocialLoginButtons
            onGoogleLogin={handleGoogleLogin}
          />

          <div className={styles.divider}>
            <span className={styles.dividerText}>or</span>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className={styles.fields}>
            <Input
              label="Email"
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              error={errors.password?.message}
              {...register('password')}
            />
            <div className={styles.forgotRow}>
              <Link to="/reset-password" className={styles.forgotLink}>
                Forgot password?
              </Link>
            </div>
            <div className={styles.submitBtnWrapper}>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isSubmitting}
              >
                Login
              </Button>
            </div>
          </form>

          <div className={styles.footer}>
            Don&apos;t have an account?{' '}
            <Link to="/signup" className={styles.footerLink}>
              Sign up
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
