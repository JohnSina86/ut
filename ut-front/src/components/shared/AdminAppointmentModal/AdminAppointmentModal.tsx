import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from '../../ui/Modal/Modal';
import { adminApi } from '../../../services/adminApi';
import type { AdminAppointment, AppointmentStatus, Customer, Service, Vehicle } from '../../../services/adminApi';
import styles from './AdminAppointmentModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (appointment: AdminAppointment) => void;
  /** If provided, modal opens in edit mode. */
  appointment?: AdminAppointment | null;
}

interface FormState {
  user_id: string;
  vehicle_id: string;
  service_id: string;
  start_time: string; // datetime-local value
  end_time: string;   // datetime-local value
  status: AppointmentStatus;
  notes: string;
  cancellation_reason: string;
}

const DEFAULT_FORM: FormState = {
  user_id: '',
  vehicle_id: '',
  service_id: '',
  start_time: '',
  end_time: '',
  status: 'scheduled',
  notes: '',
  cancellation_reason: '',
};

const STATUS_OPTIONS: AppointmentStatus[] = [
  'scheduled',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
];

// datetime-local wants "YYYY-MM-DDTHH:mm" in local time, no seconds, no TZ.
function toLocalInput(value?: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

function addMinutes(iso: string, minutes: number): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  d.setMinutes(d.getMinutes() + minutes);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export const AdminAppointmentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSaved,
  appointment,
}) => {
  const isEdit = !!appointment;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Load the customer + service dropdowns once the modal opens.
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    Promise.all([adminApi.fetchAllCustomers(), adminApi.fetchAllServices()])
      .then(([c, s]) => {
        if (cancelled) return;
        setCustomers(c);
        setServices(s.filter((svc) => svc.is_active));
      })
      .catch((err) => {
        if (cancelled) return;
        setSubmitError(err.message || 'Failed to load form data');
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // Seed the form when we open in edit mode, or reset when opening for create.
  useEffect(() => {
    if (!isOpen) return;
    if (appointment) {
      setForm({
        user_id: String(appointment.user_id ?? ''),
        vehicle_id: String(appointment.vehicle_id ?? ''),
        service_id: String(appointment.service_id ?? ''),
        start_time: toLocalInput(appointment.start_time),
        end_time: toLocalInput(appointment.end_time),
        status: appointment.status,
        notes: appointment.notes ?? '',
        cancellation_reason: appointment.cancellation_reason ?? '',
      });
    } else {
      setForm(DEFAULT_FORM);
    }
    setErrors({});
    setSubmitError(null);
  }, [isOpen, appointment]);

  // When the selected customer changes, reload their vehicles.
  useEffect(() => {
    if (!form.user_id) {
      setVehicles([]);
      return;
    }
    let cancelled = false;
    setLoadingVehicles(true);
    adminApi
      .fetchVehiclesByCustomer(parseInt(form.user_id, 10))
      .then((list) => {
        if (cancelled) return;
        setVehicles(list);
        // If the current vehicle selection doesn't belong to this user, clear it.
        if (list.length && form.vehicle_id) {
          const stillValid = list.some(
            (v) => String(v.id) === form.vehicle_id,
          );
          if (!stillValid) {
            setForm((prev) => ({ ...prev, vehicle_id: '' }));
          }
        }
      })
      .catch(() => {
        if (!cancelled) setVehicles([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingVehicles(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.user_id]);

  const selectedService = useMemo(
    () => services.find((s) => String(s.id) === form.service_id),
    [services, form.service_id],
  );

  // Auto-compute end_time when service or start_time changes.
  useEffect(() => {
    if (!form.start_time || !selectedService) return;
    const newEnd = addMinutes(
      form.start_time,
      selectedService.duration_minutes,
    );
    setForm((prev) => ({ ...prev, end_time: newEnd }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.start_time, selectedService?.id]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.user_id) next.user_id = 'Please select a customer';
    if (!form.vehicle_id) next.vehicle_id = 'Please select a vehicle';
    if (!form.service_id) next.service_id = 'Please select a service';
    if (!form.start_time) next.start_time = 'Start time is required';
    if (!form.end_time) next.end_time = 'End time is required';
    if (
      form.start_time &&
      form.end_time &&
      new Date(form.end_time) <= new Date(form.start_time)
    ) {
      next.end_time = 'End time must be after start time';
    }
    if (form.status === 'cancelled' && !form.cancellation_reason.trim()) {
      next.cancellation_reason =
        'A cancellation reason is required when status is cancelled';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setSubmitError(null);

    const payload = {
      user_id: parseInt(form.user_id, 10),
      vehicle_id: parseInt(form.vehicle_id, 10),
      service_id: parseInt(form.service_id, 10),
      // Send ISO strings so the server stores them in UTC.
      start_time: new Date(form.start_time).toISOString(),
      end_time: new Date(form.end_time).toISOString(),
      status: form.status,
      notes: form.notes || undefined,
      cancellation_reason:
        form.status === 'cancelled' ? form.cancellation_reason : undefined,
    };

    try {
      const saved = isEdit && appointment
        ? await adminApi.updateAppointment(appointment.id, payload)
        : await adminApi.createAppointment(payload);
      onSaved(saved);
      onClose();
    } catch (err: any) {
      if (err.status === 409) {
        setSubmitError('This time slot is already booked.');
      } else {
        setSubmitError(err.message || 'Failed to save appointment');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit appointment' : 'New appointment'}
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {/* Customer */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="admin-apt-user">
            Customer
          </label>
          <select
            id="admin-apt-user"
            className={styles.select}
            value={form.user_id}
            onChange={(e) => update('user_id', e.target.value)}
          >
            <option value="">Select a customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.email}
              </option>
            ))}
          </select>
          {errors.user_id && <span className={styles.error}>{errors.user_id}</span>}
        </div>

        {/* Vehicle */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="admin-apt-vehicle">
            Vehicle
          </label>
          {form.user_id && !loadingVehicles && vehicles.length === 0 ? (
            <div className={styles.warning}>
              This customer has no vehicles registered.
            </div>
          ) : (
            <select
              id="admin-apt-vehicle"
              className={styles.select}
              value={form.vehicle_id}
              onChange={(e) => update('vehicle_id', e.target.value)}
              disabled={!form.user_id || loadingVehicles}
            >
              <option value="">
                {loadingVehicles ? 'Loading…' : 'Select a vehicle'}
              </option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registration} — {v.make} {v.model}
                  {v.year ? ` (${v.year})` : ''}
                </option>
              ))}
            </select>
          )}
          {errors.vehicle_id && (
            <span className={styles.error}>{errors.vehicle_id}</span>
          )}
        </div>

        {/* Service */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="admin-apt-service">
            Service
          </label>
          <select
            id="admin-apt-service"
            className={styles.select}
            value={form.service_id}
            onChange={(e) => update('service_id', e.target.value)}
          >
            <option value="">Select a service</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.category} · {s.duration_minutes}min
                {s.price != null ? ` · €${s.price}` : ''}
              </option>
            ))}
          </select>
          {errors.service_id && (
            <span className={styles.error}>{errors.service_id}</span>
          )}
        </div>

        {/* Times */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="admin-apt-start">
              Start time
            </label>
            <input
              id="admin-apt-start"
              type="datetime-local"
              className={styles.input}
              value={form.start_time}
              onChange={(e) => update('start_time', e.target.value)}
            />
            {errors.start_time && (
              <span className={styles.error}>{errors.start_time}</span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="admin-apt-end">
              End time
            </label>
            <input
              id="admin-apt-end"
              type="datetime-local"
              className={styles.input}
              value={form.end_time}
              onChange={(e) => update('end_time', e.target.value)}
            />
            {errors.end_time && (
              <span className={styles.error}>{errors.end_time}</span>
            )}
          </div>
        </div>

        {/* Status */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="admin-apt-status">
            Status
          </label>
          <select
            id="admin-apt-status"
            className={styles.select}
            value={form.status}
            onChange={(e) =>
              update('status', e.target.value as AppointmentStatus)
            }
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Cancellation reason — only when cancelled */}
        {form.status === 'cancelled' && (
          <div className={styles.field}>
            <label className={styles.label} htmlFor="admin-apt-reason">
              Cancellation reason
            </label>
            <textarea
              id="admin-apt-reason"
              className={styles.textarea}
              value={form.cancellation_reason}
              onChange={(e) => update('cancellation_reason', e.target.value)}
              rows={2}
            />
            {errors.cancellation_reason && (
              <span className={styles.error}>{errors.cancellation_reason}</span>
            )}
          </div>
        )}

        {/* Notes */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="admin-apt-notes">
            Notes (optional)
          </label>
          <textarea
            id="admin-apt-notes"
            className={styles.textarea}
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            rows={3}
          />
        </div>

        {submitError && <div className={styles.formError}>{submitError}</div>}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.saveBtn}
            disabled={saving}
          >
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create appointment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AdminAppointmentModal;


