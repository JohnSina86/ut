import { Request, Response } from 'express';
import { AppDataSource } from '../../data-source.js';
import { TransactionService } from './transaction.service.js';
import { AuthRequest } from '../../common/middleware/auth.middleware.js';
import { Appointment } from '../appointments/appointment.entity.js';

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
    const list = await service.findByAppointment(+appointmentId);
    res.json(list);
  }

  /**
   * Records the user's intent to pay on the day, confirms the appointment,
   * and creates a pending transaction. No external payment processor is
   * involved — the garage collects cash / card on arrival.
   */
  async payInPerson(req: AuthRequest, res: Response) {
    try {
      const { appointment_id, amount } = req.body ?? {};
      const numericAmount = Number(amount);
      if (!appointment_id || !Number.isFinite(numericAmount) || numericAmount < 0) {
        return res.status(400).json({ error: 'appointment_id and a non-negative amount are required' });
      }

      const apptRepo = AppDataSource.getRepository(Appointment);
      const appointment = await apptRepo.findOne({ where: { id: Number(appointment_id) } });
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      const transaction = await service.create({
        appointment_id: Number(appointment_id),
        amount: numericAmount,
        payment_method: 'pay_in_person',
        status: 'pending',
      });

      await apptRepo.update(Number(appointment_id), { status: 'confirmed' });
      const updatedAppointment = await apptRepo.findOne({ where: { id: Number(appointment_id) } });

      res.status(201).json({ transaction, appointment: updatedAppointment });
    } catch (err: any) {
      console.error('[transactions] payInPerson failed', err?.message ?? err);
      res.status(500).json({ error: 'Unable to record Pay in Person booking' });
    }
  }
}
