import Stripe from 'stripe';

/**
 * Lazy Stripe client. We don't instantiate at module-load time so the app
 * can still boot when STRIPE_SECRET_KEY is not configured (Stripe endpoints
 * will simply 500 if called in that state).
 */
function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      'Stripe is not configured. Set STRIPE_SECRET_KEY in ut-api/.env.',
    );
  }
  // apiVersion pinned to a stable date; safe to bump later.
  return new Stripe(key, { apiVersion: '2024-06-20' as any });
}

export class StripeService {
  /**
   * Creates a PaymentIntent that the frontend can confirm with the Google Pay
   * payment sheet. Amount is in the major unit (e.g. EUR) — Stripe expects
   * the minor unit (cents), so we multiply by 100.
   */
  async createPaymentIntent(amount: number, currency: string = 'eur'): Promise<{
    clientSecret: string | null;
    paymentIntentId: string;
  }> {
    const stripe = getStripe();
    const pi = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100),
      currency,
      automatic_payment_methods: { enabled: true },
      description: 'United Tyres booking payment',
    });

    return { clientSecret: pi.client_secret, paymentIntentId: pi.id };
  }

  async confirmPaymentIntent(paymentIntentId: string): Promise<{
    status: string;
    transactionId: string | null;
  }> {
    const stripe = getStripe();
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    const charge = (pi as any).latest_charge
      ? typeof (pi as any).latest_charge === 'string'
        ? (pi as any).latest_charge
        : (pi as any).latest_charge?.id ?? null
      : null;
    return { status: pi.status, transactionId: charge };
  }

  /**
   * Verify a Stripe webhook signature. Callers must pass the raw request
   * body (Buffer), not a parsed JSON object.
   */
  verifyWebhook(payload: Buffer, signature: string | string[] | undefined): Stripe.Event {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }
    const stripe = getStripe();
    return stripe.webhooks.constructEvent(
      payload,
      (signature ?? '') as string,
      secret,
    );
  }
}
