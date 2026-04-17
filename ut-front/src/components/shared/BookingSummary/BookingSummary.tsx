import React from 'react';
import styles from './BookingSummary.module.css';

interface SummaryService {
  name: string;
  duration_minutes?: number;
  duration?: number;
  price?: number;
}

interface SummaryVehicle {
  registration: string;
  make: string;
  model: string;
}

interface BookingSummaryProps {
  service?: SummaryService;
  vehicle?: SummaryVehicle;
  date?: string;
  time?: string;
  notes?: string;
  onConfirm: () => void;
  onEdit?: (step: 'service' | 'vehicle' | 'datetime') => void;
  isLoading?: boolean;
}

const formatDate = (d: string) => {
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-IE', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return d; }
};

const formatTime = (t: string) => {
  try {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
  } catch { return t; }
};

export const BookingSummary = ({
  service, vehicle, date, time, notes,
  onConfirm, onEdit, isLoading = false,
}: BookingSummaryProps) => {
  const duration = service?.duration_minutes ?? service?.duration;
  const canConfirm = !isLoading && !!service && !!vehicle && !!date && !!time;

  return (
    <div className={styles.summary}>

      <div className={styles.header}>
        <h2 className={styles.title}>Booking Summary</h2>
      </div>

      <div className={styles.body}>
        {/* Service */}
        <div className={styles.item}>
          <span className={styles.itemLabel}>Service</span>
          <span className={styles.itemValue}>
            {service ? `${service.name}${duration ? ` · ${duration} min` : ''}` : '—'}
          </span>
          {onEdit && (
            <button
              onClick={() => onEdit('service')}
              style={{ marginLeft: '0.5rem', fontSize: 'var(--font-size-xs)', color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              Edit
            </button>
          )}
        </div>

        <hr className={styles.divider} />

        {/* Vehicle */}
        <div className={styles.item}>
          <span className={styles.itemLabel}>Vehicle</span>
          <span className={styles.itemValue}>
            {vehicle ? `${vehicle.make} ${vehicle.model} · ${vehicle.registration}` : '—'}
          </span>
          {onEdit && (
            <button
              onClick={() => onEdit('vehicle')}
              style={{ marginLeft: '0.5rem', fontSize: 'var(--font-size-xs)', color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              Edit
            </button>
          )}
        </div>

        <hr className={styles.divider} />

        {/* Date & Time */}
        <div className={styles.item}>
          <span className={styles.itemLabel}>Date & Time</span>
          <span className={styles.itemValue}>
            {date && time ? `${formatDate(date)} at ${formatTime(time)}` : '—'}
          </span>
          {onEdit && (
            <button
              onClick={() => onEdit('datetime')}
              style={{ marginLeft: '0.5rem', fontSize: 'var(--font-size-xs)', color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              Edit
            </button>
          )}
        </div>

        {notes && (
          <>
            <hr className={styles.divider} />
            <div className={styles.item}>
              <span className={styles.itemLabel}>Notes</span>
              <span className={styles.itemValue}>{notes}</span>
            </div>
          </>
        )}
      </div>

      <div className={styles.footer}>
        {service?.price !== undefined && (
          <div className={styles.total}>
            <span className={styles.totalLabel}>Total</span>
            <span className={styles.totalValue}>€{Number(service.price).toFixed(2)}</span>
          </div>
        )}
        <p className={styles.note}>
          You'll receive a confirmation once the booking is accepted.
        </p>
        <button
          onClick={onConfirm}
          disabled={!canConfirm}
          style={{
            marginTop:     'var(--spacing-md)',
            width:         '100%',
            padding:       '0.75rem',
            background:    canConfirm ? 'var(--color-accent)' : 'var(--color-border)',
            color:         canConfirm ? '#ffffff' : 'var(--color-text-muted)',
            border:        'none',
            borderRadius:  'var(--border-radius-md)',
            fontWeight:    600,
            fontSize:      'var(--font-size-md)',
            cursor:        canConfirm ? 'pointer' : 'not-allowed',
            transition:    'background 180ms',
          }}
        >
          {isLoading ? 'Confirming…' : 'Confirm Booking'}
        </button>
      </div>

    </div>
  );
};

export default BookingSummary;
