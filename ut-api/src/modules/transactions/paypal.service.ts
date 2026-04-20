import { paypalClient, checkoutNodeJssdk } from '../../config/paypal.js';

/**
 * Thin wrapper around the PayPal Orders API.
 *
 * Flow:
 *   1. Backend calls `createOrder` → returns orderId + approval URL
 *   2. Frontend sends the user through PayPal's checkout (popup or redirect)
 *   3. After approval, frontend calls `captureOrder(orderId)`
 *   4. Backend marks the Transaction as paid and confirms the Appointment
 */
export class PaypalService {
  async createOrder(amount: number, currency: string = 'EUR'): Promise<{
    orderId: string;
    approvalUrl: string | null;
    raw: any;
  }> {
    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: Number(amount).toFixed(2),
          },
          description: 'United Tyres booking payment',
        },
      ],
      application_context: {
        brand_name: 'United Tyres',
        user_action: 'PAY_NOW',
      },
    });

    const client = paypalClient();
    const response = await client.execute(request);
    const order: any = response.result ?? {};

    const approvalLink = (order.links || []).find(
      (l: any) => l.rel === 'approve' || l.rel === 'payer-action',
    );

    return {
      orderId: order.id,
      approvalUrl: approvalLink ? approvalLink.href : null,
      raw: order,
    };
  }

  async captureOrder(orderId: string): Promise<{
    captureId: string | null;
    status: string;
    raw: any;
  }> {
    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
    // The SDK's TS types require a body; an empty object is acceptable per
    // PayPal's REST docs (and cast to any to satisfy the strict d.ts).
    request.requestBody({} as any);

    const client = paypalClient();
    const response = await client.execute(request);
    const result: any = response.result ?? {};

    // The capture id lives a few layers deep in PayPal's response.
    const capture = result?.purchase_units?.[0]?.payments?.captures?.[0];

    return {
      captureId: capture?.id ?? null,
      status: capture?.status ?? result.status ?? 'UNKNOWN',
      raw: result,
    };
  }
}
