import React, { useState, useEffect } from 'react';
import { useNavigate }    from 'react-router-dom';
import { Footer }         from '../../components/layout/Footer/Footer';
import { Container }      from '../../components/layout/Container/Container';
import { Section }        from '../../components/layout/Section/Section';
import { AppointmentCard } from '../../components/shared/AppointmentCard/AppointmentCard';
import { Spinner }        from '../../components/ui/Spinner/Spinner';
import { appointmentsAPI } from '../../services/api';
import styles from './AppointmentsPage.module.css';

type Tab = 'upcoming' | 'past';

export const AppointmentsPage = () => {
  const navigate = useNavigate();
  const [activeTab,     setActiveTab]     = useState<Tab>('upcoming');
  const [appointments,  setAppointments]  = useState<any[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await appointmentsAPI.list();
        setAppointments(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const normalize = (appt: any) => {
    // Handle both API shapes: start_time field or separate date/time fields
    let date = appt.date || '';
    let time = appt.time || '';
    if (!date && appt.start_time) {
      const dt = new Date(appt.start_time);
      date = dt.toISOString().split('T')[0];
      time = dt.toTimeString().slice(0, 5);
    }
    return {
      id:          String(appt.id),
      serviceName: appt.service?.name  ?? appt.service_name ?? 'Service',
      vehicleInfo: appt.vehicle
        ? `${appt.vehicle.make} ${appt.vehicle.model} · ${appt.vehicle.registration}`
        : appt.vehicle_info ?? '',
      date,
      time,
      duration:    appt.service?.duration_minutes ?? appt.duration ?? 0,
      status:      appt.status ?? 'scheduled',
      price:       appt.service?.price != null ? Number(appt.service.price) : appt.price,
    };
  };

  const shown = appointments
    .map(normalize)
    .filter((a) =>
      activeTab === 'upcoming'
        ? ['scheduled', 'confirmed', 'in_progress'].includes(a.status)
        : ['completed', 'cancelled'].includes(a.status)
    );

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Section title="My Appointments">
          <Container>

            {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === 'upcoming' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'past' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('past')}
              >
                Past
              </button>
            </div>

            {loading ? (
              <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}>
                <Spinner />
              </div>
            ) : shown.length === 0 ? (
              <p className={styles.empty}>
                {activeTab === 'upcoming'
                  ? 'No upcoming appointments. Book one now!'
                  : 'No past appointments found.'}
              </p>
            ) : (
              <div className={styles.list}>
                {shown.map((appt) => (
                  <AppointmentCard
                    key={appt.id}
                    {...appt}
                    onViewDetails={(id) => navigate(`/appointments/${id}`)}
                    onReschedule={(id)  => navigate(`/booking?reschedule=${id}`)}
                    onCancel={async (id) => {
                      if (!confirm('Cancel this appointment?')) return;
                      try {
                        await appointmentsAPI.cancel(id);
                        setAppointments((prev) =>
                          prev.map((a) => String(a.id) === id ? { ...a, status: 'cancelled' } : a)
                        );
                      } catch (err: any) {
                        alert(err.message || 'Failed to cancel');
                      }
                    }}
                  />
                ))}
              </div>
            )}

          </Container>
        </Section>
      </main>
      <Footer copyright="© 2025 United Tyres Dundrum." />
    </div>
  );
};

export default AppointmentsPage;



