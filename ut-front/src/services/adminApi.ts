/**
 * Typed client for the /api/admin/* endpoints.
 *
 * All calls attach the bearer token from localStorage (written by
 * AuthContext on login). Server-side guards (requireAuth + requireAdmin)
 * will reject non-admin requests with 401/403, which callers should
 * surface as a session-expired / access-denied message.
 */

const API_BASE = 'http://localhost:4000/api';

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

  if (res.status === 401) {
    // Token missing / expired — let the caller decide whether to redirect.
    const err: any = new Error('Session expired. Please log in again.');
    err.status = 401;
    throw err;
  }

  if (res.status === 403) {
    const err: any = new Error('Admin access required.');
    err.status = 403;
    throw err;
  }

  if (!res.ok) {
    let message = 'Request failed';
    try {
      const body = await res.json();
      message = body?.error || message;
    } catch {
      /* body was not JSON */
    }
    const err: any = new Error(message);
    err.status = res.status;
    throw err;
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// ---------- Types ----------

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role?: 'admin' | 'customer';
}

export interface Vehicle {
  id: number;
  user_id: number;
  registration: string;
  make: string;
  model: string;
  year?: number | null;
  fuel_type?: string | null;
  engine_size?: string | null;
  colour?: string | null;
}

export interface Service {
  id: number;
  name: string;
  description?: string | null;
  category: 'tyre' | 'maintenance' | 'repair';
  duration_minutes: number;
  price?: number | null;
  is_active: boolean;
}

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface AdminAppointment {
  id: number;
  user_id: number;
  vehicle_id: number;
  service_id: number;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes?: string | null;
  cancellation_reason?: string | null;
  user?: Customer | null;
  vehicle?: Vehicle | null;
  service?: Service | null;
}

export interface AppointmentPayload {
  user_id: number;
  vehicle_id: number;
  service_id: number;
  start_time: string;
  end_time: string;
  status?: AppointmentStatus;
  notes?: string;
  cancellation_reason?: string;
}

// ---------- API functions ----------

export const adminApi = {
  fetchAllAppointments: () =>
    request<AdminAppointment[]>('/admin/appointments'),

  fetchAllCustomers: () =>
    request<Customer[]>('/admin/appointments/users'),

  fetchVehiclesByCustomer: (userId: number) =>
    request<Vehicle[]>(`/admin/appointments/users/${userId}/vehicles`),

  fetchAllServices: () => request<Service[]>('/services'),

  createAppointment: (data: AppointmentPayload) =>
    request<AdminAppointment>('/admin/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateAppointment: (id: number, data: Partial<AppointmentPayload>) =>
    request<AdminAppointment>(`/admin/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteAppointment: (id: number) =>
    request<{ id: number; deleted: boolean }>(
      `/admin/appointments/${id}`,
      { method: 'DELETE' },
    ),
};

export default adminApi;
