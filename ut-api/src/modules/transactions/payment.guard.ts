import { AppDataSource } from '../../data-source.js';
import { Appointment } from '../appointments/appointment.entity.js';

export interface GuardSuccess {
  ok: true;
  appointment: Appointment;
  amount: number; // server-derived, in major units (EUR)
}

export interface GuardFailure {
  ok: false;
  status: number;
  error: string;
}

/**
 * Centralised money-path guard used by every payment controller.
 *
 * Responsibilities (in order):
 *  1. Validate and coerce `appointment_id` to a positive integer.
 *  2. Load the appointment (with its service relation).
 *  3. Verify it belongs to the authenticated caller.
 *  4. Derive the amount from `service.price` — NEVER trust the client.
 *  5. Refuse work on appointments that are already cancelled or completed.
 *
 * Callers MUST use `result.amount` and `result.appointment.id` instead of any
 * client-supplied values.
 */
export async function guardAppointmentForPayment(
  rawAppointmentId: unknown,
  userId: number | undefined,
): Promise<GuardSuccess | GuardFailure> {
  const appointmentIdNum = Number(rawAppointmentId);
  if (
    !Number.isFinite(appointmentIdNum) ||
    !Number.isInteger(appointmentIdNum) ||
    appointmentIdNum <= 0
  ) {
    return { ok: false, status: 400, error: 'A valid appointment_id is required' };
  }

  if (!userId || !Number.isFinite(Number(userId))) {
    return { ok: false, status: 401, error: 'Not authenticated' };
  }

  const apptRepo = AppDataSource.getRepository(Appointment);
  const appointment = await apptRepo.findOne({
    where: { id: appointmentIdNum },
    relations: ['service'],
  });

  if (!appointment) {
    return { ok: false, status: 404, error: 'Appointment not found' };
  }

  // Ownership check — user can only pay for their own appointment.
  if (Number(appointment.user_id) !== Number(userId)) {
    // 404 rather than 403 — don't leak existence of other users' appointments.
    return { ok: false, status: 404, error: 'Appointment not found' };
  }

  // Don't let anyone pay for a cancelled/completed appointment.
  if (appointment.status === 'cancelled') {
    return { ok: false, status: 409, error: 'This appointment has been cancelled' };
  }
  if (appointment.status === 'completed') {
    return { ok: false, status: 409, error: 'This appointment is already completed' };
  }

  const rawPrice = (appointment as any).service?.price;
  const price = rawPrice == null ? NaN : Number(rawPrice);
  if (!Number.isFinite(price) || price < 0) {
    return { ok: false, status: 500, error: 'Service price is not configured' };
  }

  return { ok: true, appointment, amount: price };
}
