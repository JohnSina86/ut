/**
 * Typed client for the /api/payments/* and /api/transactions/pay-in-person
 * endpoints. All functions attach the bearer token from localStorage.
 */

const API_BASE =
  (import.meta as any).env?.VITE_API_URL
    ? `${(import.meta as any).env.VITE_API_URL.replace(/\/$/, '')}/api`
    : 'http://localhost:4000/api';

const getAuthToken = () => localStorage.getItem('authToken');

const headers = (): Record<string, string> => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...headers(), ...(init.headers || {}) },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body?.error || message;
    } catch {
      /* body wasn't JSON */
    }
    const err: any = new Error(message);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// ---------- Types ----------

export interface PaypalOrderResponse {
  orderId: string;
  approvalUrl: string | null;
  transactionId: number;
}

export interface PaypalCaptureResponse {
  success: boolean;
  transaction: { id: number; status: string };
  capture: { id: string | null; status: string };
}

export interface GooglePayIntentResponse {
  clientSecret: string | null;
  paymentIntentId: string;
  transactionId: number;
}

export interface GooglePayConfirmResponse {
  success: boolean;
  transaction: { id: number; status: string };
  status: string;
}

export interface DirectDebitRequestResponse {
  authorisationUrl: string;
  billingRequestId: string;
  transactionId: number;
}

export interface PayInPersonResponse {
  transaction: { id: number; status: string; payment_method: string };
  appointment: { id: number; status: string };
}

// ---------- API functions ----------

export const paymentApi = {
  // Amount is intentionally NOT sent — the server derives it from the
  // appointment's service price. Anything we send would be ignored.
  createPaypalOrder: (appointmentId: number) =>
    request<PaypalOrderResponse>('/payments/paypal/create-order', {
      method: 'POST',
      body: JSON.stringify({ appointment_id: appointmentId }),
    }),

  capturePaypalOrder: (orderId: string, appointmentId: number) =>
    request<PaypalCaptureResponse>('/payments/paypal/capture-order', {
      method: 'POST',
      body: JSON.stringify({ orderId, appointmentId }),
    }),

  createGooglePayIntent: (appointmentId: number) =>
    request<GooglePayIntentResponse>('/payments/google-pay/create-intent', {
      method: 'POST',
      body: JSON.stringify({ appointment_id: appointmentId }),
    }),

  confirmGooglePay: (paymentIntentId: string, appointmentId: number) =>
    request<GooglePayConfirmResponse>('/payments/google-pay/confirm', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId, appointmentId }),
    }),

  createDirectDebitRequest: (appointmentId: number) =>
    request<DirectDebitRequestResponse>('/payments/direct-debit/create-request', {
      method: 'POST',
      body: JSON.stringify({ appointment_id: appointmentId }),
    }),

  bookPayInPerson: (appointmentId: number) =>
    request<PayInPersonResponse>('/transactions/pay-in-person', {
      method: 'POST',
      body: JSON.stringify({ appointment_id: appointmentId }),
    }),
};

export default paymentApi;
