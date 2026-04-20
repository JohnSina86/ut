import { Response } from 'express';
import { AppDataSource } from '../../data-source.js';
import { TransactionService } from './transaction.service.js';
import { AuthRequest } from '../../common/middleware/auth.middleware.js';
import { Appointment } from '../appointments/appointment.entity.js';
import { Transaction } from './transaction.entity.js';
import { guardAppointmentForPayment } from './payment.guard.js';

const service = new TransactionService();

export class TransactionController {
  async create(req: AuthRequest, res: Response) {
    try {
      const item = await service.create(req.body);
      res.status(201).json(item);
    } catch (err) {
      res.status(500).json({ error: 'Unable to save transaction' });
    }
  }

  async listForAppointment(req: AuthRequest, res: Response) {
    const { appointmentId } = req.params;
    const id = Number(appointmentId);
    if (!Number.isFinite(id) || !Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid appointment id' });
    }

    // Only the appointment owner (or admin) may see its transactions.
    const apptRepo = AppDataSource.getRepository(Appointment);
    const appointment = await apptRepo.findOne({ where: { id } });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    const isOwner = Number(appointment.user_id) === Number(req.user?.id);
    const isAdmin = req.user?.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const list = await service.findByAppointment(id);
    res.json(list);
  }

  /**
   * Records the user's intent to pay on the day, confirms the appointment,
   * and creates a pending transaction. No external payment processor is
   * involved — the garage collects cash / card on arrival.
   *
   * Amount is derived server-side from the service price. The client-supplied
   * amount is IGNORED.
   */
  async payInPerson(req: AuthRequest, res: Response) {
    try {
      const { appointment_id } = req.body ?? {};
      const guard = await guardAppointmentForPayment(appointment_id, req.user?.id);
      if (!guard.ok) return res.status(guard.status).json({ error: guard.error });

      const { appointment, amount } = guard;

      const txRepo = AppDataSource.getRepository(Transaction);

      // Idempotency: don't let the same appointment be confirmed twice with
      // stacked pending transactions.
      const existing = await txRepo.findOne({
        where: { appointment_id: appointment.id },
      });
      if (existing) {
        // Return the existing record — safe for refresh/back-button.
        const apptRepo = AppDataSource.getRepository(Appointment);
        const appt = await apptRepo.findOne({ where: { id: appointment.id } });
        return res.status(200).json({
          transaction: existing,
          appointment: appt,
          idempotent: true,
        });
      }

      const apptRepo = AppDataSource.getRepository(Appointment);

      const transaction = await service.create({
        appointment_id: appointment.id,
        amount,
        payment_method: 'pay_in_person',
        status: 'pending',
      });

      await apptRepo.update(appointment.id, { status: 'confirmed' });
      const updatedAppointment = await apptRepo.findOne({
        where: { id: appointment.id },
      });

      res.status(201).json({ transaction, appointment: updatedAppointment });
    } catch (err: any) {
      console.error('[transactions] payInPerson failed', err?.message ?? err);
      res.status(500).json({ error: 'Unable to record Pay in Person booking' });
    }
  }
}
