import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { appointmentsAPI } from '../../services/api';
import styles from './BookingConfirmedPage.module.css';

const METHOD_LABELS: Record<string, string> = {
  paypal: 'PayPal',
  google_pay: 'Google Pay',
  direct_debit: 'Direct Debit',
  pay_in_person: 'Pay in Person',
  card: 'Card',
  cash: 'Cash',
};

const formatDateTime = (iso?: string) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-IE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

export const BookingConfirmedPage: React.FC = () => {
  const [params] = useSearchParams();
  const appointmentId = params.get('appointmentId');
  const method = params.get('method') || '';

  const [appointment, setAppointment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!appointmentId) {
        setLoading(false);
        return;
      }
      try {
        const data = await appointmentsAPI.getById(Number(appointmentId));
        if (!cancelled) setAppointment(data);
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Failed to load appointment.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [appointmentId]);

  const methodLabel = METHOD_LABELS[method] || 'Selected method';
  const isPayInPerson = method === 'pay_in_person';

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.tickWrap} aria-hidden>
          <svg viewBox="0 0 64 64" width={64} height={64} className={styles.tick}>
            <circle cx="32" cy="32" r="30" fill="#dcfce7" />
            <path
              d="M20 33 L29 42 L45 24"
              fill="none"
              stroke="#16a34a"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className={styles.title}>Booking Confirmed</h1>
        <p className={styles.subtitle}>
          Thanks — we've booked your appointment.
        </p>

        {loading && <p className={styles.muted}>Loading your booking…</p>}
        {error && <p className={styles.error}>{error}</p>}

        {appointment && (
          <div className={styles.summary}>
            <div className={styles.row}>
              <span className={styles.label}>Service</span>
              <span className={styles.value}>
                {appointment.service?.name || appointment.service_name || 'Service'}
              </span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Vehicle</span>
              <span className={styles.value}>
                {appointment.vehicle
                  ? `${appointment.vehicle.make} ${appointment.vehicle.model} · ${appointment.vehicle.registration}`
                  : '—'}
              </span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>When</span>
              <span className={styles.value}>
                {formatDateTime(appointment.start_time)}
              </span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Payment</span>
              <span className={styles.value}>{methodLabel}</span>
            </div>
          </div>
        )}

        {isPayInPerson && (
          <div className={styles.notice}>
            Please pay at the garage when you arrive for your appointment. We'll
            see you then.
          </div>
        )}

        <Link to="/appointments" className={styles.primaryBtn}>
          View My Appointments
        </Link>
        <Link to="/dashboard" className={styles.secondaryBtn}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default BookingConfirmedPage;
