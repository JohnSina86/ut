import { Response } from 'express';
import { AppDataSource } from '../../data-source.js';
import { AuthRequest } from '../../common/middleware/auth.middleware.js';
import { Transaction } from './transaction.entity.js';
import { Appointment } from '../appointments/appointment.entity.js';
import { StripeService } from './stripe.service.js';
import { guardAppointmentForPayment } from './payment.guard.js';

const stripeService = new StripeService();

export class StripeController {
  async createIntent(req: AuthRequest, res: Response) {
    try {
      const { appointment_id } = req.body ?? {};
      const guard = await guardAppointmentForPayment(appointment_id, req.user?.id);
      if (!guard.ok) return res.status(guard.status).json({ error: guard.error });

      const { appointment, amount } = guard;

      const txRepo = AppDataSource.getRepository(Transaction);

      const alreadyPaid = await txRepo.findOne({
        where: { appointment_id: appointment.id, status: 'paid' },
      });
      if (alreadyPaid) {
        return res
          .status(409)
          .json({ error: 'This appointment has already been paid' });
      }

      const { clientSecret, paymentIntentId } =
        await stripeService.createPaymentIntent(amount);

      const tx = txRepo.create({
        appointment_id: appointment.id,
        amount,
        payment_method: 'google_pay',
        status: 'pending',
        payment_intent_id: paymentIntentId,
      });
      await txRepo.save(tx);

      res.status(201).json({ clientSecret, paymentIntentId, transactionId: tx.id });
    } catch (err: any) {
      console.error('[stripe] createIntent failed', err?.message ?? err);
      res.status(500).json({ error: 'Failed to create Google Pay intent' });
    }
  }

  async confirm(req: AuthRequest, res: Response) {
    const { paymentIntentId } = req.body ?? {};
    if (!paymentIntentId || typeof paymentIntentId !== 'string') {
      return res.status(400).json({ error: 'paymentIntentId is required' });
    }

    const txRepo = AppDataSource.getRepository(Transaction);
    const apptRepo = AppDataSource.getRepository(Appointment);

    const transaction = await txRepo.findOne({
      where: { payment_intent_id: paymentIntentId, payment_method: 'google_pay' },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Unknown payment intent' });
    }

    if (transaction.status === 'paid') {
      return res.json({
        success: true,
        transaction,
        status: 'succeeded',
        idempotent: true,
      });
    }

    // Ownership re-check.
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
      const { status, transactionId } =
        await stripeService.confirmPaymentIntent(paymentIntentId);
      const succeeded = status === 'succeeded';

      transaction.status = succeeded ? 'paid' : 'failed';
      transaction.payment_provider_reference = transactionId ?? undefined;
      await txRepo.save(transaction);

      if (succeeded) {
        await apptRepo.update(appointment.id, { status: 'confirmed' });
      }

      if (!succeeded) {
        return res.status(402).json({
          error: 'Payment was not completed. Please try again.',
          status,
        });
      }

      res.json({ success: true, transaction, status });
    } catch (err: any) {
      console.error('[stripe] confirm failed', err?.message ?? err);
      try {
        transaction.status = 'failed';
        await txRepo.save(transaction);
      } catch {
        /* swallow */
      }
      res.status(500).json({ error: 'Failed to confirm payment' });
    }
  }
}
