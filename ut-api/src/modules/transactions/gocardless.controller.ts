import { Request, Response } from 'express';
import { AppDataSource } from '../../data-source.js';
import { AuthRequest } from '../../common/middleware/auth.middleware.js';
import { Transaction } from './transaction.entity.js';
import { Appointment } from '../appointments/appointment.entity.js';
import { GocardlessService } from './gocardless.service.js';
import { guardAppointmentForPayment } from './payment.guard.js';

const gcService = new GocardlessService();

/**
 * In-memory set of GoCardless webhook event ids we've already handled.
 * Prevents replay of the same event body (e.g. if the signature/body is
 * captured and re-POSTed). For production this should be backed by a table,
 * but the single-instance deployment + idempotent state transitions below
 * make this sufficient for now.
 */
const processedWebhookEventIds = new Set<string>();
const MAX_DEDUP_ENTRIES = 10_000;

export class GocardlessController {
  async createRequest(req: AuthRequest, res: Response) {
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

      const result = await gcService.createBillingRequest(
        amount,
        'United Tyres booking payment',
        { appointment_id: String(appointment.id) },
      );

      const tx = txRepo.create({
        appointment_id: appointment.id,
        amount,
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
   *
   * The `billing_request_id` is treated as an opaque bearer token that ties
   * back to exactly one transaction/appointment we created. We don't trust any
   * other query-string input.
   */
  async callback(req: Request, res: Response) {
    const rawBillingRequestId =
      (req.query.billing_request_id as string | undefined) ||
      (req.query.br as string | undefined);

    const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Sanity-check the token shape: GoCardless IDs are `BRQ000...` style —
    // safe alphanumerics + hyphen + underscore, bounded length.
    const billingRequestId = typeof rawBillingRequestId === 'string'
      ? rawBillingRequestId.trim()
      : '';
    if (
      !billingRequestId ||
      billingRequestId.length > 128 ||
      !/^[A-Za-z0-9_-]+$/.test(billingRequestId)
    ) {
      return res.redirect(
        `${frontend}/booking/direct-debit/callback?error=missing_billing_request`,
      );
    }

    const txRepo = AppDataSource.getRepository(Transaction);
    const apptRepo = AppDataSource.getRepository(Appointment);

    let transaction;
    try {
      transaction = await txRepo.findOne({
        where: { payment_intent_id: billingRequestId, payment_method: 'direct_debit' },
      });
    } catch (err: any) {
      console.error('[gocardless] callback lookup failed', err?.message ?? err);
      return res.redirect(
        `${frontend}/booking/direct-debit/callback?error=lookup_failed`,
      );
    }

    if (!transaction) {
      return res.redirect(
        `${frontend}/booking/direct-debit/callback?error=unknown_transaction`,
      );
    }

    // Idempotent re-entry: the user may refresh the callback page or click
    // back/forward. Don't re-fulfil, don't double-charge.
    if (transaction.status === 'paid' || transaction.status === 'failed') {
      const status = transaction.status === 'paid' ? 'ok' : 'failed';
      return res.redirect(
        `${frontend}/booking/direct-debit/callback?appointmentId=${transaction.appointment_id}&status=${status}`,
      );
    }

    try {
      const fulfilled = await gcService.fulfilBillingRequest(billingRequestId);

      // Prefer payment_id if the BR already produced one; otherwise, if we
      // have a mandate, kick a payment off now — using the stored transaction
      // amount (server-derived at createRequest time), never a client input.
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
      try {
        transaction.status = 'failed';
        await txRepo.save(transaction);
      } catch {
        /* already in a failure branch — avoid masking the user-visible redirect */
      }
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

    try {
      const txRepo = AppDataSource.getRepository(Transaction);
      let processed = 0;
      let skipped = 0;

      for (const event of events) {
        const eventId: string | undefined = event?.id;

        // Replay protection — once we've seen an event id, never process it
        // again even if the signature verifies.
        if (eventId && processedWebhookEventIds.has(eventId)) {
          skipped++;
          continue;
        }

        const resource = event.resource_type;
        const action = event.action;
        const links = event.links ?? {};

        if (resource === 'payments' && links.payment) {
          const tx = await txRepo.findOne({
            where: { payment_provider_reference: links.payment },
          });
          if (!tx) {
            if (eventId) processedWebhookEventIds.add(eventId);
            continue;
          }

          // Idempotent state transitions: only move pending → paid / failed.
          // Don't rewrite a refunded transaction from a stale event.
          if (action === 'confirmed' || action === 'paid_out') {
            if (tx.status !== 'refunded') tx.status = 'paid';
          } else if (
            action === 'failed' ||
            action === 'cancelled' ||
            action === 'charged_back'
          ) {
            if (tx.status !== 'refunded' && tx.status !== 'paid') {
              tx.status = 'failed';
            }
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
              .andWhere('status = :pending', { pending: 'pending' })
              .execute();
          }
        }

        if (eventId) {
          processedWebhookEventIds.add(eventId);
          // Bound memory — drop oldest entries once we cross the cap.
          if (processedWebhookEventIds.size > MAX_DEDUP_ENTRIES) {
            const first = processedWebhookEventIds.values().next().value;
            if (first) processedWebhookEventIds.delete(first);
          }
        }
        processed++;
      }

      res.json({ received: events.length, processed, skipped });
    } catch (err: any) {
      console.error('[gocardless] webhook processing failed', err?.message ?? err);
      res.status(500).json({ error: 'webhook_processing_failed' });
    }
  }
}
