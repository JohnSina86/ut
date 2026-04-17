import React from 'react';
import styles from './AppointmentCard.module.css';

type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

interface AppointmentCardProps {
  id: string;
  serviceName: string;
  vehicleInfo: string;
  date: string;
  time: string;
  duration: number;
  status: AppointmentStatus;
  price?: number;
  onReschedule?: (id: string) => void;
  onCancel?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled:   'Scheduled',
  confirmed:   'Confirmed',
  in_progress: 'In Progress',
  completed:   'Completed',
  cancelled:   'Cancelled',
};

const STATUS_CLASS: Record<AppointmentStatus, string> = {
  scheduled:   'statusScheduled',
  confirmed:   'statusConfirmed',
  in_progress: 'statusInProgress',
  completed:   'statusCompleted',
  cancelled:   'statusCancelled',
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IE', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch { return dateStr; }
};

const formatTime = (timeStr: string) => {
  if (!timeStr) return '—';
  try {
    const [h, m] = timeStr.split(':').map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  } catch { return timeStr; }
};

export const AppointmentCard = ({
  id, serviceName, vehicleInfo, date, time, duration, status, price,
  onReschedule, onCancel, onViewDetails,
}: AppointmentCardProps) => {
  const canAction = status === 'scheduled' || status === 'confirmed';
  return (
    <div className={`${styles.card} ${styles[STATUS_CLASS[status]] ?? ''}`}>

      <div className={styles.header}>
        <div className={styles.info}>
          <h3 className={styles.service}>{serviceName}</h3>
          <p className={styles.vehicle}>{vehicleInfo}</p>
        </div>
        <span className={`${styles.badge} ${styles[`badge_${status}`] ?? ''}`}>
          {STATUS_LABELS[status]}
        </span>
      </div>

      <div className={styles.body}>
        <div className={styles.detail}>
          <span className={styles.detailLabel}>Date</span>
          <span className={styles.detailValue}>{formatDate(date)}</span>
        </div>
        <div className={styles.detail}>
          <span className={styles.detailLabel}>Time</span>
          <span className={styles.detailValue}>{formatTime(time)}</span>
        </div>
        <div className={styles.detail}>
          <span className={styles.detailLabel}>Duration</span>
          <span className={styles.detailValue}>{duration ? `${duration} min` : '—'}</span>
        </div>
        {price !== undefined && (
          <div className={styles.detail}>
            <span className={styles.detailLabel}>Price</span>
            <span className={styles.detailValue}>€{Number(price).toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.actions}>
          {onViewDetails && (
            <button className={styles.detailsBtn} onClick={() => onViewDetails(id)}>
              View Details
            </button>
          )}
          {onReschedule && canAction && (
            <button className={styles.rescheduleBtn} onClick={() => onReschedule(id)}>
              Reschedule
            </button>
          )}
          {onCancel && canAction && (
            <button className={styles.cancelBtn} onClick={() => onCancel(id)}>
              Cancel
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

export default AppointmentCard;
