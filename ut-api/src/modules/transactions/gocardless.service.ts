import gocardless, {
  Environments,
  parse,
  InvalidSignatureError,
} from 'gocardless-nodejs';

/**
 * GoCardless wrapper covering the Billing Request flow (the modern,
 * hosted Direct Debit authorisation experience), mandate-backed payment
 * collection, and webhook parsing.
 */

function getClient() {
  const token = process.env.GOCARDLESS_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      'GoCardless is not configured. Set GOCARDLESS_ACCESS_TOKEN in ut-api/.env.',
    );
  }

  const env =
    process.env.GOCARDLESS_ENVIRONMENT === 'live'
      ? Environments.Live
      : Environments.Sandbox;

  return gocardless(token, env);
}

export interface CreateBillingRequestResult {
  billingRequestId: string;
  billingRequestFlowId: string;
  authorisationUrl: string;
}

export class GocardlessService {
  async createBillingRequest(
    amount: number,
    description: string,
    metadata: Record<string, string> = {},
  ): Promise<CreateBillingRequestResult> {
    const client = getClient();

    // Amount is the major unit; GoCardless expects the minor unit (cents).
    const amountInCents = Math.round(Number(amount) * 100);

    const br = await client.billingRequests.create({
      payment_request: {
        description,
        amount: amountInCents,
        currency: 'EUR',
      },
      mandate_request: {
        currency: 'EUR',
      },
      metadata,
    } as any);

    const redirectUrl =
      process.env.GOCARDLESS_REDIRECT_URL ||
      (process.env.FRONTEND_URL
        ? `${process.env.FRONTEND_URL}/booking/direct-debit/callback`
        : 'http://localhost:5173/booking/direct-debit/callback');

    const flow = await client.billingRequestFlows.create({
      redirect_uri: redirectUrl,
      exit_uri: redirectUrl,
      links: { billing_request: (br as any).id },
    } as any);

    return {
      billingRequestId: (br as any).id,
      billingRequestFlowId: (flow as any).id,
      authorisationUrl: (flow as any).authorisation_url,
    };
  }

  async fulfilBillingRequest(billingRequestId: string): Promise<{
    mandateId: string | null;
    paymentId: string | null;
    status: string;
  }> {
    const client = getClient();

    // First, fetch the billing request to know its state.
    const br: any = await client.billingRequests.find(billingRequestId);

    // If the customer has completed the flow the BR will be `fulfilled`
    // (or in the process of being fulfilled). Explicitly fulfil if needed.
    if (br?.status && br.status !== 'fulfilled') {
      try {
        await client.billingRequests.fulfil(billingRequestId, {} as any);
      } catch {
        // If it can't be fulfilled yet (e.g. awaiting bank authorisation),
        // return the current state so the caller can retry or poll.
      }
    }

    const refreshed: any = await client.billingRequests.find(billingRequestId);
    const mandateId: string | null = refreshed?.links?.mandate_request_mandate ?? null;
    const paymentId: string | null = refreshed?.links?.payment_request_payment ?? null;

    return {
      mandateId,
      paymentId,
      status: refreshed?.status ?? 'unknown',
    };
  }

  async createPayment(
    mandateId: string,
    amount: number,
    description: string,
  ): Promise<{ paymentId: string; status: string }> {
    const client = getClient();

    const payment: any = await client.payments.create({
      amount: Math.round(Number(amount) * 100),
      currency: 'EUR',
      description,
      links: { mandate: mandateId },
    } as any);

    return { paymentId: payment.id, status: payment.status };
  }

  /**
   * Verifies the `Webhook-Signature` header and returns the parsed events.
   * Throws `InvalidSignatureError` on mismatch — callers must 498/400 the
   * request in that case.
   */
  parseWebhook(body: Buffer | string, signature: string): any[] {
    const secret = process.env.GOCARDLESS_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error('GOCARDLESS_WEBHOOK_SECRET is not configured');
    }
    return parse(body, secret, signature);
  }

  static isInvalidSignatureError(err: unknown): boolean {
    // The SDK exports an error constructor; instanceof works.
    return err instanceof (InvalidSignatureError as any);
  }
}
