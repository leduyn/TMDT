'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { JwtResponse } from '@/lib/api';

interface AuthContextType {
  user: JwtResponse | null;
  token: string | null;
  login: (data: JwtResponse) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<JwtResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (stored && storedToken) {
      setUser(JSON.parse(stored));
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = (data: JwtResponse) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    if (data.agencyId) {
      localStorage.setItem('agencyId', data.agencyId.toString());
    } else {
      localStorage.removeItem('agencyId');
    }
    setToken(data.token);
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('agencyId');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

