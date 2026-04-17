import React, { useState, useEffect } from 'react';
import { Link, useNavigate }                from 'react-router-dom';
import { Container }           from '../../components/layout/Container/Container';
import { Spinner }             from '../../components/ui/Spinner/Spinner';
import { AppointmentCard }     from '../../components/shared/AppointmentCard/AppointmentCard';
import { useAuth }             from '../../context/AuthContext';
import { appointmentsAPI, vehiclesAPI }     from '../../services/api';
import styles from './DashboardPage.module.css';

const QUICK_ACTIONS = [
  { href: '/booking',          icon: '📅', label: 'Book a Service' },
  { href: '/vehicles',         icon: '🚗', label: 'My Vehicles'    },
  { href: '/appointments',     icon: '📋', label: 'Appointments'   },
  { href: '/account-settings', icon: '⚙️', label: 'Settings'       },
];

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  useEffect(() => {
    Promise.all([appointmentsAPI.list(), vehiclesAPI.list()])
      .then(([appts, vehs]) => { setAppointments(appts || []); setVehicles(vehs || []); })
      .catch((err: any) => setError(err.message || 'Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = appointments.filter((a) => ['scheduled','confirmed','in_progress'].includes(a.status)).length;

  const normalize = (appt: any) => {
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
  const stats = [
    { icon: '📦', label: 'Total Bookings', value: appointments.length },
    { icon: '⏳', label: 'Upcoming',       value: upcoming            },
    { icon: '🚗', label: 'Vehicles Saved', value: vehicles.length },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className={styles.page}>
      <main className={styles.main}>

        {/* Welcome banner */}
        <div className={styles.welcomeBanner}>
          <Container>
            <div className={styles.bannerInner}>
              <div>
                <p className={styles.greetingEyebrow}>{greeting}</p>
                <h1 className={styles.greeting}>{user?.name || 'User'} 👋</h1>
                <p className={styles.greetingSub}>Here's an overview of your account.</p>
              </div>
              <Link to="/booking" className={styles.bannerCta}>Book Appointment</Link>
            </div>
          </Container>
        </div>

        <Container>
          {error && <div className={styles.errorBanner}>{error}</div>}

          {/* Stats */}
          <div className={styles.statsRow}>
            {stats.map((stat) => (
              <div key={stat.label} className={styles.statCard}>
                <span className={styles.statIcon}>{stat.icon}</span>
                <div>
                  <span className={styles.statValue}>{stat.value}</span>
                  <span className={styles.statLabel}>{stat.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Upcoming appointments */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Upcoming Appointments</h2>
              <Link to="/appointments" className={styles.sectionLink}>View all →</Link>
            </div>

            {loading ? (
              <div className={styles.spinnerWrap}><Spinner /></div>
            ) : appointments.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📭</span>
                <p className={styles.emptyText}>No upcoming appointments.</p>
                <Link to="/booking" className={styles.emptyLink}>Book one now →</Link>
              </div>
            ) : (
              <div className={styles.appointmentList}>
                {appointments.map((appt) => {
                    const n = normalize(appt);
                    return (
                      <AppointmentCard
                        key={n.id}
                        {...n}
                        onViewDetails={(id: string) => window.location.href = `/appointments/${id}`}
                        onReschedule={(id: string)  => navigate(`/booking?reschedule=${id}`)}
                        onCancel={async (id: string) => { try { await appointmentsAPI.cancel(id); setAppointments(prev => prev.filter(a => String(a.id) !== id)); } catch(e: any) { setError(e.message); } }}
                      />
                    );
                  })}
              </div>
            )}
          </section>

          {/* Quick actions */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Quick Actions</h2>
            <div className={styles.quickActions}>
              {QUICK_ACTIONS.map((action) => (
                <Link key={action.href} to={action.href} className={styles.actionCard}>
                  <span className={styles.actionCardIcon}>{action.icon}</span>
                  <span className={styles.actionCardLabel}>{action.label}</span>
                </Link>
              ))}
            </div>
          </section>

        </Container>
      </main>
    </div>
  );
};

export default DashboardPage;







