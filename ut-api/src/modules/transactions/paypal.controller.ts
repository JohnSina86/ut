import { Response } from 'express';
import { AppDataSource } from '../../data-source.js';
import { AuthRequest } from '../../common/middleware/auth.middleware.js';
import { Transaction } from './transaction.entity.js';
import { Appointment } from '../appointments/appointment.entity.js';
import { PaypalService } from './paypal.service.js';
import { guardAppointmentForPayment } from './payment.guard.js';

const paypalService = new PaypalService();

export class PaypalController {
  async createOrder(req: AuthRequest, res: Response) {
    try {
      const { appointment_id } = req.body ?? {};
      const guard = await guardAppointmentForPayment(appointment_id, req.user?.id);
      if (!guard.ok) return res.status(guard.status).json({ error: guard.error });

      const { appointment, amount } = guard;

      const txRepo = AppDataSource.getRepository(Transaction);

      // Idempotency: if the appointment is already paid (any successful
      // payment method), refuse to create another order.
      const alreadyPaid = await txRepo.findOne({
        where: { appointment_id: appointment.id, status: 'paid' },
      });
      if (alreadyPaid) {
        return res
          .status(409)
          .json({ error: 'This appointment has already been paid' });
      }

      const { orderId, approvalUrl } = await paypalService.createOrder(amount);

      const tx = txRepo.create({
        appointment_id: appointment.id,
        amount,
        payment_method: 'paypal',
        status: 'pending',
        payment_intent_id: orderId,
      });
      await txRepo.save(tx);

      res.status(201).json({ orderId, approvalUrl, transactionId: tx.id });
    } catch (err: any) {
      console.error('[paypal] createOrder failed', err?.message ?? err);
      res.status(500).json({ error: 'Failed to create PayPal order' });
    }
  }

  async captureOrder(req: AuthRequest, res: Response) {
    const { orderId } = req.body ?? {};
    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({ error: 'orderId is required' });
    }

    const txRepo = AppDataSource.getRepository(Transaction);
    const apptRepo = AppDataSource.getRepository(Appointment);

    // Find the pending transaction we created in step 1.
    const transaction = await txRepo.findOne({
      where: { payment_intent_id: orderId, payment_method: 'paypal' },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Unknown PayPal order' });
    }

    // Idempotent re-entry: if we've already recorded this as paid, return the
    // existing result — don't double-charge or flip state.
    if (transaction.status === 'paid') {
      return res.json({
        success: true,
        transaction,
        capture: {
          id: transaction.payment_provider_reference ?? null,
          status: 'COMPLETED',
        },
        idempotent: true,
      });
    }

    // Ownership + appointment re-verification. The appointment may have been
    // cancelled while the user was on the PayPal popup.
    const appointment = await apptRepo.findOne({
      where: { id: transaction.appointment_id },
    });
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    if (Number(appointment.user_id) !== Number(req.user?.id)) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    try {
      const capture = await paypalService.captureOrder(orderId);
      const captured = capture.status === 'COMPLETED';

      transaction.status = captured ? 'paid' : 'failed';
      transaction.payment_provider_reference = capture.captureId ?? undefined;
      await txRepo.save(transaction);

      if (captured) {
        await apptRepo.update(appointment.id, { status: 'confirmed' });
      }

      if (!captured) {
        return res.status(402).json({
          error: 'PayPal payment was not completed. Please try again.',
          status: capture.status,
        });
      }

      res.json({
        success: true,
        transaction,
        capture: { id: capture.captureId, status: capture.status },
      });
    } catch (err: any) {
      console.error('[paypal] captureOrder failed', err?.message ?? err);
      try {
        transaction.status = 'failed';
        await txRepo.save(transaction);
      } catch {
        /* swallow — we still want to return the 500 below */
      }
      res.status(500).json({ error: 'Failed to capture PayPal order' });
    }
  }
}
