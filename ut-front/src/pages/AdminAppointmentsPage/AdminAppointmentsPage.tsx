import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { adminApi, AdminAppointment, AppointmentStatus } from '../../services/adminApi';
import { AdminAppointmentModal } from '../../components/shared/AdminAppointmentModal/AdminAppointmentModal';
import styles from './AdminAppointmentsPage.module.css';

interface Filters {
  search: string;
  status: '' | AppointmentStatus;
  from: string;
  to: string;
}

const EMPTY_FILTERS: Filters = { search: '', status: '', from: '', to: '' };

function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function vehicleLabel(a: AdminAppointment): string {
  if (!a.vehicle) return '—';
  const { registration, make, model } = a.vehicle;
  const parts = [registration, [make, model].filter(Boolean).join(' ')].filter(Boolean);
  return parts.join(' · ') || '—';
}

function customerLabel(a: AdminAppointment): string {
  if (!a.user) return 'Unknown customer';
  return a.user.name || a.user.email || 'Unknown customer';
}

export const AdminAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminAppointment | null>(null);

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.fetchAllAppointments();
      setAppointments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    const from = filters.from ? new Date(filters.from) : null;
    const to = filters.to ? new Date(filters.to + 'T23:59:59') : null;

    return appointments.filter((a) => {
      if (filters.status && a.status !== filters.status) return false;
      if (q) {
        const haystack = [
          a.user?.name,
          a.user?.email,
          a.vehicle?.registration,
          a.service?.name,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (from || to) {
        const start = new Date(a.start_time);
        if (from && start < from) return false;
        if (to && start > to) return false;
      }
      return true;
    });
  }, [appointments, filters]);

  const handleNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (a: AdminAppointment) => {
    setEditing(a);
    setModalOpen(true);
  };

  const handleDelete = async (a: AdminAppointment) => {
    const ok = window.confirm(
      'Are you sure you want to delete this appointment? This cannot be undone.',
    );
    if (!ok) return;
    try {
      await adminApi.deleteAppointment(a.id);
      setAppointments((prev) => prev.filter((x) => x.id !== a.id));
      showToast('Appointment deleted');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete appointment');
    }
  };

  const handleSaved = (saved: AdminAppointment) => {
    setAppointments((prev) => {
      const exists = prev.some((p) => p.id === saved.id);
      if (exists) {
        return prev.map((p) => (p.id === saved.id ? { ...p, ...saved } : p));
      }
      return [saved, ...prev];
    });
    showToast(editing ? 'Appointment updated' : 'Appointment created');
    // The create/update response may not include joined relations; reload to
    // ensure customer / vehicle / service names render in the table.
    load();
  };

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Appointments</h1>
        <button className={styles.newBtn} onClick={handleNew}>
          + New appointment
        </button>
      </div>

      <div className={styles.filters}>
        <input
          type="text"
          className={styles.filterInput}
          placeholder="Search by customer, vehicle or service…"
          value={filters.search}
          onChange={(e) =>
            setFilters((f) => ({ ...f, search: e.target.value }))
          }
        />
        <select
          className={styles.filterSelect}
          value={filters.status}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              status: e.target.value as Filters['status'],
            }))
          }
        >
          <option value="">All statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          type="date"
          className={styles.filterInput}
          value={filters.from}
          onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
        />
        <input
          type="date"
          className={styles.filterInput}
          value={filters.to}
          onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
        />
      </div>

      {error && <div className={styles.errorBox}>{error}</div>}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Service</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className={styles.loading}>
                  Loading appointments…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className={styles.empty}>
                  No appointments match the current filters.
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{customerLabel(a)}</td>
                  <td>{vehicleLabel(a)}</td>
                  <td>{a.service?.name ?? '—'}</td>
                  <td>{formatDateTime(a.start_time)}</td>
                  <td>{formatDateTime(a.end_time)}</td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${styles[a.status] || ''}`}
                    >
                      {a.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{a.notes || '—'}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => handleEdit(a)}
                      >
                        Edit
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        onClick={() => handleDelete(a)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AdminAppointmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        appointment={editing}
      />

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
};

export default AdminAppointmentsPage;
