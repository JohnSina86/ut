import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: number;
  email: string;
  name?: string;
  phone?: string;
  avatar?: string;
  role?: 'admin' | 'customer';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// Decode the payload portion of a JWT without verifying its signature. Used
// only to surface the role on the client — all trust decisions remain on the
// server, which re-verifies the signature on every request.
function decodeJwt(token: string): { role?: 'admin' | 'customer'; [k: string]: any } | null {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function enrichUserWithRole(user: User | null, token: string | null): User | null {
  if (!user) return null;
  if (user.role) return user;
  if (!token) return user;
  const payload = decodeJwt(token);
  if (payload?.role) return { ...user, role: payload.role };
  return user;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    if (token && userData) {
      try {
        const parsed = JSON.parse(userData) as User;
        const enriched = enrichUserWithRole(parsed, token);
        localStorage.setItem('userData', JSON.stringify(enriched));
        setUser(enriched);
      } catch (err) {
        console.error('Failed to restore user:', err);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user: userData, token } = await authAPI.login(email, password);
      const enriched = enrichUserWithRole(userData, token);
      setUser(enriched);
      localStorage.setItem('userData', JSON.stringify(enriched));
      localStorage.setItem('authToken', token);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, phone?: string) => {
    setIsLoading(true);
    try {
      const { user: userData, token } = await authAPI.register(email, password, name, phone);
      const enriched = enrichUserWithRole(userData, token);
      setUser(enriched);
      localStorage.setItem('userData', JSON.stringify(enriched));
      localStorage.setItem('authToken', token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};



