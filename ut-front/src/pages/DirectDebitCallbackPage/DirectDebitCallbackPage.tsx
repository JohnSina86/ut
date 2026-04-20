import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { appointmentsAPI } from '../../services/api';
import styles from './DirectDebitCallbackPage.module.css';

type UiState = 'pending' | 'confirmed' | 'failed';

export const DirectDebitCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const appointmentId = params.get('appointmentId');
  const initialStatus = params.get('status') || 'pending';

  const [uiState, setUiState] = useState<UiState>(
    initialStatus === 'ok'
      ? 'confirmed'
      : initialStatus === 'failed'
      ? 'failed'
      : 'pending',
  );
  const [message, setMessage] = useState<string>('');
  const timer = useRef<number | null>(null);
  const attempts = useRef(0);

  // Jump to confirmation page immediately if GoCardless already told us it's OK.
  useEffect(() => {
    if (uiState === 'confirmed' && appointmentId) {
      navigate(
        `/booking/confirmed?appointmentId=${appointmentId}&method=direct_debit`,
        { replace: true },
      );
    }
  }, [uiState, appointmentId, navigate]);

  // Poll the appointment while pending, up to 30 seconds (10 × 3s).
  useEffect(() => {
    if (uiState !== 'pending' || !appointmentId) return;

    const poll = async () => {
      attempts.current += 1;
      try {
        const appt = await appointmentsAPI.getById(Number(appointmentId));
        const status = String(appt?.status || '').toLowerCase();
        if (status === 'confirmed' || status === 'booked' || status === 'paid') {
          setUiState('confirmed');
          return;
        }
        if (status === 'cancelled' || status === 'failed') {
          setUiState('failed');
          setMessage('Your Direct Debit was cancelled or could not be set up.');
          return;
        }
      } catch {
        // Swallow; will retry.
      }

      if (attempts.current >= 10) {
        // Give up polling but keep the appointment in "pending" state — the
        // webhook may arrive later.
        setMessage(
          "We haven't heard back from your bank yet. We'll email you as soon as the Direct Debit is confirmed.",
        );
        return;
      }
      timer.current = window.setTimeout(poll, 3000);
    };

    timer.current = window.setTimeout(poll, 3000);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [uiState, appointmentId]);

  if (uiState === 'failed') {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>Direct Debit unavailable</h1>
          <p className={styles.subtitle}>
            {message ||
              'We could not set up your Direct Debit. Your slot is still reserved — please choose another payment method.'}
          </p>
          <button
            className={styles.primaryBtn}
            onClick={() => navigate('/appointments')}
          >
            View My Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.spinner} aria-hidden />
        <h1 className={styles.title}>Confirming your Direct Debit…</h1>
        <p className={styles.subtitle}>
          {message ||
            "We're waiting for your bank to confirm the mandate. This usually takes a few seconds."}
        </p>
        <button
          className={styles.secondaryBtn}
          onClick={() => navigate('/appointments')}
        >
          View My Appointments
        </button>
      </div>
    </div>
  );
};

export default DirectDebitCallbackPage;
