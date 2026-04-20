import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PayPalScriptProvider,
  PayPalButtons,
} from '@paypal/react-paypal-js';
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe, PaymentRequest } from '@stripe/stripe-js';
import { paymentApi } from '../../../services/paymentApi';
import styles from './PaymentMethodSelector.module.css';

type Method = 'paypal' | 'google_pay' | 'direct_debit' | 'pay_in_person';

interface Props {
  appointmentId: number;
  amount: number;
  onBack?: () => void;
}

// Inline SVG replacements for lucide-react icons (lucide isn't installed in
// this project; keeping the two icons inline avoids adding a new dependency).
const IconLandmark: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="22" x2="21" y2="22" />
    <line x1="6" y1="18" x2="6" y2="11" />
    <line x1="10" y1="18" x2="10" y2="11" />
    <line x1="14" y1="18" x2="14" y2="11" />
    <line x1="18" y1="18" x2="18" y2="11" />
    <polygon points="12 2 20 7 4 7" />
  </svg>
);
const IconStore: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 7h20l-2 4H4Z" />
    <path d="M4 11v9h16v-9" />
    <path d="M10 20v-6h4v6" />
  </svg>
);

const PAYPAL_CLIENT_ID =
  (import.meta as any).env?.VITE_PAYPAL_CLIENT_ID ?? '';
const STRIPE_PUBLISHABLE_KEY =
  (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY ?? '';

// Load Stripe once at module level.
const stripePromise: Promise<Stripe | null> = STRIPE_PUBLISHABLE_KEY
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : Promise.resolve(null);

export const PaymentMethodSelector: React.FC<Props> = ({
  appointmentId,
  amount,
  onBack,
}) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Method | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google Pay availability check.
  const [googlePaySupported, setGooglePaySupported] = useState<boolean | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stripe = await stripePromise;
      if (!stripe) {
        if (!cancelled) setGooglePaySupported(false);
        return;
      }

      const pr = stripe.paymentRequest({
        country: 'IE',
        currency: 'eur',
        total: {
          label: 'United Tyres booking',
          amount: Math.round(Number(amount) * 100),
        },
        requestPayerName: false,
        requestPayerEmail: false,
      });

      const result = await pr.canMakePayment();
      if (cancelled) return;
      setPaymentRequest(pr);
      // `googlePay` is set on Chrome/Android when Google Pay is available.
      setGooglePaySupported(!!result && !!(result as any).googlePay);
    })();
    return () => {
      cancelled = true;
    };
  }, [amount]);

  const paypalOptions = useMemo(
    () => ({
      clientId: PAYPAL_CLIENT_ID || 'test',
      currency: 'EUR',
      intent: 'capture',
    }),
    [],
  );

  const confirmedPath = (method: string) =>
    `/booking/confirmed?appointmentId=${appointmentId}&method=${encodeURIComponent(method)}`;

  const handleConfirm = async () => {
    if (!selected) return;
    if (submitting) return; // double-click guard
    setError(null);
    setSubmitting(true);

    try {
      if (selected === 'pay_in_person') {
        await paymentApi.bookPayInPerson(appointmentId);
        navigate(confirmedPath('pay_in_person'));
        return;
      }

      if (selected === 'direct_debit') {
        const { authorisationUrl } =
          await paymentApi.createDirectDebitRequest(appointmentId);
        // Full-page redirect to GoCardless hosted flow.
        window.location.href = authorisationUrl;
        return;
      }

      if (selected === 'google_pay') {
        if (!paymentRequest) {
          setError('Google Pay is not available on this device.');
          return;
        }
        const { clientSecret, paymentIntentId } =
          await paymentApi.createGooglePayIntent(appointmentId);
        if (!clientSecret) {
          setError('Could not initialise Google Pay. Please try another method.');
          return;
        }
        const stripe = await stripePromise;
        if (!stripe) {
          setError('Payment provider failed to load. Please refresh and try again.');
          return;
        }

        // Wire the payment request to the client secret and show the sheet.
        paymentRequest.on('paymentmethod', async (ev) => {
          const { error: confirmErr } = await stripe.confirmCardPayment(
            clientSecret,
            { payment_method: ev.paymentMethod.id },
            { handleActions: false },
          );
          if (confirmErr) {
            ev.complete('fail');
            setError('Payment was declined. Please try a different method.');
            setSubmitting(false);
            return;
          }
          ev.complete('success');
          try {
            await paymentApi.confirmGooglePay(paymentIntentId, appointmentId);
            navigate(confirmedPath('google_pay'));
          } catch (e: any) {
            setError(e.message || 'Failed to confirm payment.');
            setSubmitting(false);
          }
        });

        paymentRequest.show();
        return;
      }

      // PayPal is handled inline by PayPalButtons below. Clicking
      // "Confirm Payment" while PayPal is selected simply scrolls to the
      // PayPal button area; the real flow runs inside the SDK callbacks.
      setError('Please complete your payment using the PayPal button above.');
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again or choose a different method.');
    } finally {
      if (selected !== 'direct_debit') setSubmitting(false);
    }
  };

  const renderCard = (
    id: Method,
    title: string,
    description: string,
    icon: React.ReactNode,
    opts?: { disabled?: boolean; disabledNote?: string },
  ) => (
    <button
      type="button"
      className={[
        styles.card,
        selected === id ? styles.cardSelected : '',
        opts?.disabled ? styles.cardDisabled : '',
      ].join(' ')}
      onClick={() => !opts?.disabled && setSelected(id)}
      aria-pressed={selected === id}
      disabled={opts?.disabled}
    >
      <span className={styles.cardIconRow}>
        <span className={styles.cardIcon}>{icon}</span>
        <span className={styles.cardLabel}>{title}</span>
      </span>
      <p className={styles.cardDescription}>{description}</p>
      {opts?.disabled && opts.disabledNote && (
        <span className={styles.unsupported}>{opts.disabledNote}</span>
      )}
    </button>
  );

  return (
    <div className={styles.wrap}>
      <h3 className={styles.heading}>Choose a payment method</h3>

      <div className={styles.cards}>
        {renderCard(
          'paypal',
          'PayPal',
          'Pay securely via your PayPal account or saved card',
          <img
            src="https://cdn.simpleicons.org/paypal"
            alt=""
            width={22}
            height={22}
          />,
        )}

        {renderCard(
          'google_pay',
          'Google Pay',
          'Pay instantly with your saved Google Pay card',
          <img
            src="https://cdn.simpleicons.org/googlepay"
            alt=""
            width={22}
            height={22}
          />,
          {
            disabled: googlePaySupported === false,
            disabledNote:
              googlePaySupported === false
                ? 'Google Pay is not available on this device'
                : undefined,
          },
        )}

        {renderCard(
          'direct_debit',
          'Direct Debit',
          'Authorise a one-off Direct Debit from your bank account',
          <IconLandmark />,
        )}

        {renderCard(
          'pay_in_person',
          'Pay in Person',
          'Your appointment will be confirmed — pay when you arrive at the garage',
          <IconStore />,
        )}
      </div>

      {/* PayPal flow is mounted inline once PayPal is selected. */}
      {selected === 'paypal' && PAYPAL_CLIENT_ID && (
        <div className={styles.paypalSlot}>
          <PayPalScriptProvider options={paypalOptions}>
            <PayPalButtons
              style={{ layout: 'horizontal', tagline: false, height: 40 }}
              createOrder={async () => {
                const { orderId } = await paymentApi.createPaypalOrder(
                  appointmentId,
                );
                return orderId;
              }}
              onApprove={async (data) => {
                try {
                  await paymentApi.capturePaypalOrder(
                    data.orderID,
                    appointmentId,
                  );
                  navigate(confirmedPath('paypal'));
                } catch (err: any) {
                  setError(
                    err.message ||
                      'PayPal capture failed. Please try a different method.',
                  );
                }
              }}
              onError={() => {
                setError('Something went wrong with PayPal. Please try again.');
              }}
              onCancel={() => {
                setSelected(null);
              }}
            />
          </PayPalScriptProvider>
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        {onBack ? (
          <button type="button" className={styles.back} onClick={onBack}>
            ← Back to summary
          </button>
        ) : <span />}

        <button
          type="button"
          className={styles.confirm}
          onClick={handleConfirm}
          disabled={!selected || submitting || selected === 'paypal'}
        >
          {submitting ? 'Processing…' : 'Confirm payment'}
        </button>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
