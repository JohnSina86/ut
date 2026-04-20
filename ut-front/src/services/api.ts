// API Base URL (adjust for your backend)
const API_BASE = 'http://localhost:4000/api';

// Auth token management
export const getAuthToken = () => localStorage.getItem('authToken');
export const setAuthToken = (token: string) => localStorage.setItem('authToken', token);
export const clearAuthToken = () => localStorage.removeItem('authToken');

const headers = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// ============ AUTH ============
export const authAPI = {
  register: async (email: string, password: string, name: string, phone?: string) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ email, password, name, phone }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    if (data.token) setAuthToken(data.token);
    return data;
  },

  logout: () => {
    clearAuthToken();
  },

  updateProfile: async (fullName: string, phone?: string) => {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ fullName, phone }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  updatePassword: async (current: string, newPassword: string) => {
    const res = await fetch(`${API_BASE}/auth/password`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ current, newPassword }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  deleteAccount: async () => {
    const res = await fetch(`${API_BASE}/auth/delete`, {
      method: 'DELETE',
      headers: headers(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

// ============ VEHICLES ============
export const vehiclesAPI = {
  list: async () => {
    const res = await fetch(`${API_BASE}/vehicles`, { headers: headers() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  create: async (data: {
    registration: string;
    make: string;
    model: string;
    fuel_type?: string;
    engine_size?: string;
    year?: number;
    colour?: string;
    notes?: string;
  }) => {
    const res = await fetch(`${API_BASE}/vehicles`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Tier 1: Vehicle lookup by registration
  lookup: async (registration: string) => {
    const res = await fetch(`${API_BASE}/vehicles/lookup?reg=${encodeURIComponent(registration)}`, {
      headers: headers(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Tier 2: Get vehicle specs
  getSpecs: async (make: string, model: string, year?: number, engine?: string) => {
    const params = new URLSearchParams();
    params.set('make', make);
    params.set('model', model);
    if (year) params.set('year', year.toString());
    if (engine) params.set('engine', engine);
    const res = await fetch(`${API_BASE}/vehicles/specs?${params}`, { headers: headers() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  update: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/vehicles/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetch(`${API_BASE}/vehicles/${id}`, {
      method: 'DELETE',
      headers: headers(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

// ============ SERVICES ============
export const servicesAPI = {
  list: async () => {
    const res = await fetch(`${API_BASE}/services`, { headers: headers() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  create: async (data: {
    name: string;
    description?: string;
    category: 'tyre' | 'maintenance' | 'repair';
    duration_minutes: number;
    price?: number;
  }) => {
    const res = await fetch(`${API_BASE}/services`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};// ============ APPOINTMENTS ============
export const appointmentsAPI = {
  getBookedSlots: async (date: string, durationMinutes: number = 60): Promise<string[]> => {
    const res = await fetch(`${API_BASE}/appointments`, { headers: headers() });
    if (!res.ok) return [];
    const all = await res.json();
    const toMins = (t: string) => { const [h, m] = t.slice(0, 5).split(':').map(Number); return h * 60 + m; };
    const booked = (all || [])
      .filter((a: any) => (a.start_time || a.date || '').slice(0, 10) === date && a.status !== 'cancelled')
      .map((a: any) => {
        const d = new Date(a.start_time || `${a.date}T${a.time}`);
        const start = d.getHours() * 60 + d.getMinutes();
        return { start, end: start + (a.duration_minutes || 60) };
      });
    const allSlots = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];
    return allSlots.filter(slot => {
      const s = toMins(slot);
      return booked.some(b => s < b.end && (s + durationMinutes) > b.start);
    });
  },
  list: async () => {
    const res = await fetch(`${API_BASE}/appointments`, { headers: headers() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  create: async (data: {
    serviceId: number;
    vehicleId: number;
    date: string;
    time: string;
    duration?: number;
    notes?: string;
  } | {
    vehicle_id: number;
    service_id: number;
    start_time: string;
    end_time: string;
    notes?: string;
  }) => {
    let payload: any;

    if ('serviceId' in data) {
      const start = new Date(`${data.date}T${data.time}`);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + (data.duration ?? 60));

      payload = {
        service_id: data.serviceId,
        vehicle_id: data.vehicleId,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        notes: data.notes,
      };
    } else {
      payload = data;
    }

    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getById: async (id: number) => {
    const res = await fetch(`${API_BASE}/appointments/${id}`, { headers: headers() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  update: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE}/appointments/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  cancel: async (id: number) => {
    const res = await fetch(`${API_BASE}/appointments/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ status: 'cancelled' }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};
// ============ TRANSACTIONS ============
export const transactionsAPI = {
  create: async (data: {
    appointment_id: number;
    amount: number;
    payment_method?: 'cash' | 'card' | 'online' | 'other';
    notes?: string;
  }) => {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  listForAppointment: async (appointmentId: number) => {
    const res = await fetch(`${API_BASE}/transactions/${appointmentId}`, { headers: headers() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

// ============ BUSINESS SETTINGS ============
export const settingsAPI = {
  get: async (key: string) => {
    const res = await fetch(`${API_BASE}/settings/${key}`, { headers: headers() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  set: async (key: string, value: string) => {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ key, value }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

// ============ CONTACT ============
export const contactAPI = {
  send: async (data: { name: string; email: string; phone?: string; message: string }) => {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};








