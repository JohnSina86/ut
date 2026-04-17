import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container }       from '../../components/layout/Container/Container';
import { Spinner }         from '../../components/ui/Spinner/Spinner';
import { appointmentsAPI } from '../../services/api';
import styles from './AppointmentDetailsPage.module.css';

const STATUS_LABELS: Record<string, string> = {
  scheduled:   'Scheduled',
  confirmed:   'Confirmed',
  in_progress: 'In Progress',
  completed:   'Completed',
  cancelled:   'Cancelled',
};

const STATUS_COLORS: Record<string, string> = {
  scheduled:   '#f59e0b',
  confirmed:   '#10b981',
  in_progress: '#3b82f6',
  completed:   '#6b7280',
  cancelled:   '#ef4444',
};

const formatDate = (d: string) => {
  if (!d) return '—';
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-IE', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return d; }
};

const formatTime = (t: string) => {
  if (!t) return '—';
  try {
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  } catch { return t; }
};

const normalizeAppt = (data: any) => {
  let date = data.date || '';
  let time = data.time || '';
  if (!date && data.scheduled_at) {
    const dt = new Date(data.scheduled_at);
    date = dt.toISOString().split('T')[0];
    time = dt.toTimeString().slice(0, 5);
  }
  return {
    id:          String(data.id),
    serviceName: data.service?.name ?? data.service_name ?? 'Service',
    serviceId:   data.service?.id   ?? data.service_id,
    vehicleId:   data.vehicle?.id   ?? data.vehicle_id,
    vehicleInfo: data.vehicle
      ? `${data.vehicle.make} ${data.vehicle.model} · ${data.vehicle.registration}`
      : '—',
    duration:    data.service?.duration_minutes ?? data.service?.duration ?? 0,
    price:       data.service?.price != null ? Number(data.service.price) : data.price,
    date,
    time,
    status:      data.status ?? 'scheduled',
    notes:       data.notes || '',
    mechanic:    data.mechanic || '',
    invoiceRef:  data.invoice_ref || data.invoiceRef || '',
  };
};

export const AppointmentDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appt, setAppt]     = useState<ReturnType<typeof normalizeAppt> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;
    appointmentsAPI.getById(Number(id))
      .then((data) => setAppt(normalizeAppt(data)))
      .catch((err: any) => setError(err.message || 'Failed to load appointment'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}><Spinner /></div>;
  if (error)   return <div style={{ color: '#d32f2f', padding: '2rem' }}>{error}</div>;
  if (!appt)   return <div style={{ padding: '2rem' }}>Appointment not found.</div>;

  const canAction = appt.status === 'scheduled' || appt.status === 'confirmed';

  const handleReschedule = () => {
    const params = new URLSearchParams();
    if (appt.serviceId) params.set('service',  String(appt.serviceId));
    if (appt.vehicleId) params.set('vehicle',  String(appt.vehicleId));
    params.set('reschedule', appt.id);
    navigate(`/booking?${params.toString()}`);
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      setCancelling(true);
      await appointmentsAPI.cancel(Number(id));
      navigate('/appointments');
    } catch (err: any) {
      setError(err.message || 'Failed to cancel appointment');
    } finally {
      setCancelling(false);
    }
  };

  const statusColor = STATUS_COLORS[appt.status] ?? '#6b7280';

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Container maxWidth="md">

          <Link to="/appointments" className={styles.backLink}>← Back to Appointments</Link>

          <div className={styles.detailCard}>

            {/* Header */}
            <div className={styles.detailHeader}>
              <div>
                <h1 className={styles.serviceTitle}>{appt.serviceName}</h1>
                <span className={styles.bookingRef}>Appointment #{appt.id}</span>
              </div>
              <span style={{
                padding: '0.3rem 0.8rem',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: statusColor + '20',
                color: statusColor,
                whiteSpace: 'nowrap',
              }}>
                {STATUS_LABELS[appt.status] ?? appt.status}
              </span>
            </div>

            {/* Detail grid */}
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Date</span>
                <span className={styles.detailValue}>{formatDate(appt.date)}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Time</span>
                <span className={styles.detailValue}>{formatTime(appt.time)}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Vehicle</span>
                <span className={styles.detailValue}>{appt.vehicleInfo}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Duration</span>
                <span className={styles.detailValue}>{appt.duration ? `${appt.duration} min` : '—'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Price</span>
                <span className={styles.detailValue}>{appt.price != null ? `€${Number(appt.price).toFixed(2)}` : '—'}</span>
              </div>
              {appt.mechanic && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Mechanic</span>
                  <span className={styles.detailValue}>{appt.mechanic}</span>
                </div>
              )}
              {appt.invoiceRef && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Invoice Ref</span>
                  <span className={styles.detailValue}>{appt.invoiceRef}</span>
                </div>
              )}
              {appt.notes && (
                <div className={styles.detailItem} style={{ gridColumn: '1 / -1' }}>
                  <span className={styles.detailLabel}>Notes</span>
                  <span className={styles.detailValue}>{appt.notes}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            {canAction && (
              <div className={styles.timeline} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={handleReschedule}
                  style={{ padding: '0.5rem 1.25rem', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-primary, #e87c1e)', background: '#fff', color: 'var(--color-primary, #e87c1e)', fontWeight: 600, cursor: 'pointer', fontSize: 'var(--font-size-sm)' }}
                >
                  Reschedule
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  style={{ padding: '0.5rem 1.25rem', borderRadius: 'var(--border-radius-md)', border: '1px solid #ef4444', background: '#fff', color: '#ef4444', fontWeight: 600, cursor: 'pointer', fontSize: 'var(--font-size-sm)' }}
                >
                  {cancelling ? 'Cancelling…' : 'Cancel Appointment'}
                </button>
              </div>
            )}

          </div>
        </Container>
      </main>
    </div>
  );
};

export default AppointmentDetailsPage;
