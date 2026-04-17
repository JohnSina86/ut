import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../../components/layout/Footer/Footer';
import styles from './NotFoundPage.module.css';

export const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.inner}>
          <p className={styles.code}>404</p>
          <h1 className={styles.title}>Page Not Found</h1>
          <p className={styles.text}>
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className={styles.actions}>
            <button onClick={() => navigate('/')} className={styles.primaryBtn}>
            ← Back to Home
            </button>
            <a href="/contact" className={styles.secondaryBtn}>Contact Support</a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFoundPage;


