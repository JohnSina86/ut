import { Request, Response } from 'express';
import { AppDataSource } from '../../data-source.js';
import { AuthRequest } from '../../common/middleware/auth.middleware.js';
import { Transaction } from './transaction.entity.js';
import { Appointment } from '../appointments/appointment.entity.js';
import { GocardlessService } from './gocardless.service.js';

const gcService = new GocardlessService();

export class GocardlessController {
  async createRequest(req: AuthRequest, res: Response) {
    try {
      const { appointment_id, amount } = req.body ?? {};
      const numericAmount = Number(amount);
      if (!appointment_id || !Number.isFinite(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ error: 'appointment_id and a positive amount are required' });
      }

      const result = await gcService.createBillingRequest(
        numericAmount,
        'United Tyres booking payment',
        { appointment_id: String(appointment_id) },
      );

      const txRepo = AppDataSource.getRepository(Transaction);
      const tx = txRepo.create({
        appointment_id,
        amount: numericAmount,
        payment_method: 'direct_debit',
        status: 'pending',
        payment_intent_id: result.billingRequestId,
      });
      await txRepo.save(tx);

      res.status(201).json({
        authorisationUrl: result.authorisationUrl,
        billingRequestId: result.billingRequestId,
        transactionId: tx.id,
      });
    } catch (err: any) {
      console.error('[gocardless] createRequest failed', err?.message ?? err);
      res.status(500).json({ error: 'Failed to create Direct Debit request' });
    }
  }

  /**
   * Public callback — the user lands here after completing the GoCardless flow.
   * We look the transaction up by the stored billing_request_id, confirm the
   * mandate, optionally kick off a payment, then bounce the browser to the
   * booking-confirmed page.
   */
  async callback(req: Request, res: Response) {
    const billingRequestId =
      (req.query.billing_request_id as string | undefined) ||
      (req.query.br as string | undefined);

    const frontend =
      process.env.FRONTEND_URL || 'http://localhost:5173';

    if (!billingRequestId) {
      return res.redirect(`${frontend}/booking/direct-debit/callback?error=missing_billing_request`);
    }

    const txRepo = AppDataSource.getRepository(Transaction);
    const apptRepo = AppDataSource.getRepository(Appointment);

    const transaction = await txRepo.findOne({
      where: { payment_intent_id: billingRequestId, payment_method: 'direct_debit' },
    });

    if (!transaction) {
      return res.redirect(`${frontend}/booking/direct-debit/callback?error=unknown_transaction`);
    }

    try {
      const fulfilled = await gcService.fulfilBillingRequest(billingRequestId);

      // Prefer payment_id if the BR already produced one; otherwise, if we
      // have a mandate, kick a payment off now.
      let providerRef = fulfilled.paymentId ?? null;

      if (!providerRef && fulfilled.mandateId) {
        try {
          const payment = await gcService.createPayment(
            fulfilled.mandateId,
            Number(transaction.amount),
            'United Tyres booking payment',
          );
          providerRef = payment.paymentId;
        } catch (paymentErr: any) {
          console.error('[gocardless] createPayment failed', paymentErr?.message ?? paymentErr);
        }
      }

      const confirmed =
        fulfilled.status === 'fulfilled' ||
        !!providerRef ||
        !!fulfilled.mandateId;

      if (confirmed) {
        transaction.status = providerRef ? 'paid' : 'pending';
        transaction.payment_provider_reference = providerRef ?? undefined;
        await txRepo.save(transaction);

        await apptRepo.update(transaction.appointment_id, { status: 'confirmed' });

        return res.redirect(
          `${frontend}/booking/direct-debit/callback?appointmentId=${transaction.appointment_id}&status=ok`,
        );
      }

      // Not yet confirmed — let the frontend page poll.
      return res.redirect(
        `${frontend}/booking/direct-debit/callback?appointmentId=${transaction.appointment_id}&status=pending`,
      );
    } catch (err: any) {
      console.error('[gocardless] callback failed', err?.message ?? err);
      transaction.status = 'failed';
      await txRepo.save(transaction);
      return res.redirect(
        `${frontend}/booking/direct-debit/callback?appointmentId=${transaction.appointment_id}&status=failed`,
      );
    }
  }

  /**
   * Raw-body webhook endpoint. Router must mount this with
   * express.raw({ type: 'application/json' }) so req.body is a Buffer.
   */
  async webhook(req: Request, res: Response) {
    const signature = req.header('Webhook-Signature') ?? '';
    const body: Buffer = Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(JSON.stringify(req.body ?? ''));

    let events: any[] = [];
    try {
      events = gcService.parseWebhook(body, signature);
    } catch (err: any) {
      console.warn('[gocardless] webhook signature invalid');
      return res.status(498).json({ error: 'Invalid webhook signature' });
    }

    const txRepo = AppDataSource.getRepository(Transaction);

    for (const event of events) {
      const resource = event.resource_type;
      const action = event.action;
      const links = event.links ?? {};

      if (resource === 'payments' && links.payment) {
        const tx = await txRepo.findOne({
          where: { payment_provider_reference: links.payment },
        });
        if (!tx) continue;

        if (action === 'confirmed' || action === 'paid_out') {
          tx.status = 'paid';
        } else if (action === 'failed' || action === 'cancelled' || action === 'charged_back') {
          tx.status = 'failed';
        }
        await txRepo.save(tx);
      }

      if (resource === 'mandates' && links.mandate) {
        // Mandate cancelled → any dependent pending transactions become failed.
        if (action === 'cancelled' || action === 'failed' || action === 'expired') {
          await txRepo
            .createQueryBuilder()
            .update(Transaction)
            .set({ status: 'failed' })
            .where('payment_method = :pm', { pm: 'direct_debit' })
            .andWhere('payment_intent_id = :id', { id: links.mandate })
            .execute();
        }
      }
    }

    res.json({ received: events.length });
  }
}
