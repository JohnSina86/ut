import { Response } from 'express';
import { AppDataSource } from '../../data-source.js';
import { AuthRequest } from '../../common/middleware/auth.middleware.js';
import { Transaction } from './transaction.entity.js';
import { Appointment } from '../appointments/appointment.entity.js';
import { StripeService } from './stripe.service.js';

const stripeService = new StripeService();

export class StripeController {
  async createIntent(req: AuthRequest, res: Response) {
    try {
      const { appointment_id, amount } = req.body ?? {};
      const numericAmount = Number(amount);
      if (!appointment_id || !Number.isFinite(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ error: 'appointment_id and a positive amount are required' });
      }

      const { clientSecret, paymentIntentId } = await stripeService.createPaymentIntent(numericAmount);

      const txRepo = AppDataSource.getRepository(Transaction);
      const tx = txRepo.create({
        appointment_id,
        amount: numericAmount,
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
    const { paymentIntentId, appointmentId } = req.body ?? {};
    if (!paymentIntentId) return res.status(400).json({ error: 'paymentIntentId is required' });

    const txRepo = AppDataSource.getRepository(Transaction);
    const apptRepo = AppDataSource.getRepository(Appointment);

    const transaction = await txRepo.findOne({
      where: { payment_intent_id: paymentIntentId, payment_method: 'google_pay' },
    });

    try {
      const { status, transactionId } = await stripeService.confirmPaymentIntent(paymentIntentId);
      const succeeded = status === 'succeeded';

      if (transaction) {
        transaction.status = succeeded ? 'paid' : 'failed';
        transaction.payment_provider_reference = transactionId ?? undefined;
        await txRepo.save(transaction);
      }

      if (succeeded && appointmentId) {
        await apptRepo.update(Number(appointmentId), { status: 'confirmed' });
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
      if (transaction) {
        transaction.status = 'failed';
        await txRepo.save(transaction);
      }
      res.status(500).json({ error: 'Failed to confirm payment' });
    }
  }
}
