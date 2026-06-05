import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/auth';
import type { LoginRequest, RegisterRequest, JwtResponse, UserDTO } from '../types';

interface AuthContextType {
  user: UserDTO | null;
  token: string | null;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  userRole: string | null;
  agencyId: number | null;
  storedAgencyId: number | null;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [storedAgencyId, setStoredAgencyId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (data: LoginRequest) => {
    const res: JwtResponse = await authApi.login(data);
    await AsyncStorage.setItem('token', res.token);
    await AsyncStorage.setItem('user', JSON.stringify({
      id: res.id,
      username: res.username,
      email: res.email,
      roles: res.roles,
      agencyId: res.agencyId,
      shippingAddress: res.shippingAddress,
    }));
    if (res.agencyId) {
      await AsyncStorage.setItem('agencyId', String(res.agencyId));
    }
    setToken(res.token);
    setUser({
      id: res.id,
      username: res.username,
      email: res.email,
      role: res.roles?.[0] || '',
      agencyId: res.agencyId,
      shippingAddress: res.shippingAddress,
    } as UserDTO);
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    await authApi.register(data);
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'user', 'agencyId']);
    } catch (e) {
      console.error('Logout failed', e);
    }
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        userRole: user?.role ?? null,
        agencyId: user?.agencyId ?? null,
        storedAgencyId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
