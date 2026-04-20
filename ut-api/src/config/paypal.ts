// @ts-ignore - @paypal/checkout-server-sdk ships CJS without first-class ESM types
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

/**
 * Returns a PayPal HTTP client configured for the current environment.
 *
 * Set `PAYPAL_MODE=live` in production, `PAYPAL_MODE=sandbox` (default)
 * for development and testing.
 */
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'PayPal is not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in ut-api/.env.',
    );
  }

  if (process.env.PAYPAL_MODE === 'live') {
    return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
  }
  return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}

export const paypalClient = () =>
  new checkoutNodeJssdk.core.PayPalHttpClient(environment());

// Re-export the SDK so service files can build order requests without
// re-importing the ignored type.
export { checkoutNodeJssdk };
