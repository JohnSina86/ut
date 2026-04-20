import { Response } from 'express';
import { AppDataSource } from '../../data-source.js';
import { AuthRequest } from '../../common/middleware/auth.middleware.js';
import { Transaction } from './transaction.entity.js';
import { Appointment } from '../appointments/appointment.entity.js';
import { PaypalService } from './paypal.service.js';

const paypalService = new PaypalService();

export class PaypalController {
  async createOrder(req: AuthRequest, res: Response) {
    try {
      const { appointment_id, amount } = req.body ?? {};
      const numericAmount = Number(amount);
      if (!appointment_id || !Number.isFinite(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ error: 'appointment_id and a positive amount are required' });
      }

      const { orderId, approvalUrl } = await paypalService.createOrder(numericAmount);

      const txRepo = AppDataSource.getRepository(Transaction);
      const tx = txRepo.create({
        appointment_id,
        amount: numericAmount,
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
    const { orderId, appointmentId } = req.body ?? {};
    if (!orderId) return res.status(400).json({ error: 'orderId is required' });

    const txRepo = AppDataSource.getRepository(Transaction);
    const apptRepo = AppDataSource.getRepository(Appointment);

    // Find the pending transaction we created in step 1.
    const transaction = await txRepo.findOne({
      where: { payment_intent_id: orderId, payment_method: 'paypal' },
    });

    try {
      const capture = await paypalService.captureOrder(orderId);
      const captured = capture.status === 'COMPLETED';

      if (transaction) {
        transaction.status = captured ? 'paid' : 'failed';
        transaction.payment_provider_reference = capture.captureId ?? undefined;
        await txRepo.save(transaction);
      }

      if (captured && appointmentId) {
        await apptRepo.update(Number(appointmentId), { status: 'confirmed' });
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
      if (transaction) {
        transaction.status = 'failed';
        await txRepo.save(transaction);
      }
      res.status(500).json({ error: 'Failed to capture PayPal order' });
    }
  }
}
