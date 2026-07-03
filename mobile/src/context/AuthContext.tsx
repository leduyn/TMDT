import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, userApi } from '../api/auth';
import type { LoginRequest, AgencyLoginRequest, RegisterRequest, JwtResponse, UserDTO } from '../types';

interface AuthContextType {
  user: UserDTO | null;
  token: string | null;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  agencyLogin: (data: AgencyLoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  userRole: string | null;
  agencyId: number | null;
  storedAgencyId: number | null;
  agencyType: string | null;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [storedAgencyId, setStoredAgencyId] = useState<number | null>(null);
  const [agencyType, setAgencyType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedAgency = await AsyncStorage.getItem('agencyId');
      const storedAgencyType = await AsyncStorage.getItem('agencyType');
      if (storedToken) {
        setToken(storedToken);
        if (storedAgency) setStoredAgencyId(Number(storedAgency));
        if (storedAgencyType) setAgencyType(storedAgencyType);
        try {
          const fullUser = await userApi.getMe();
          await AsyncStorage.setItem('user', JSON.stringify(fullUser));
          setUser(fullUser);
        } catch {
          const storedUser = await AsyncStorage.getItem('user');
          if (storedUser) setUser(JSON.parse(storedUser));
        }
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
    if (res.agencyId) {
      await AsyncStorage.setItem('agencyId', String(res.agencyId));
    }
    let fullUser: UserDTO;
    try {
      fullUser = await userApi.getMe();
    } catch {
      fullUser = {
        id: res.id,
        username: res.username,
        email: res.email,
        role: res.roles?.[0] || '',
        agencyId: res.agencyId,
        shippingAddress: res.shippingAddress,
      } as UserDTO;
    }
    await AsyncStorage.setItem('user', JSON.stringify(fullUser));
    setToken(res.token);
    setUser(fullUser);
  }, []);

  const agencyLogin = useCallback(async (data: AgencyLoginRequest) => {
    const res: JwtResponse = await authApi.agencyLogin(data);
    await AsyncStorage.setItem('token', res.token);
    if (res.agencyId) {
      await AsyncStorage.setItem('agencyId', String(res.agencyId));
    }
    if (res.agencyType) {
      await AsyncStorage.setItem('agencyType', res.agencyType);
      setAgencyType(res.agencyType);
    }
    const fullUser: UserDTO = {
      id: res.id,
      username: res.username,
      email: res.email || '',
      role: 'AGENCY',
      agencyId: res.agencyId,
      displayName: res.name || res.username,
      phone: res.phone || data.phone,
    };
    await AsyncStorage.setItem('user', JSON.stringify(fullUser));
    setToken(res.token);
    setUser(fullUser);
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    await authApi.register(data);
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'user', 'agencyId', 'agencyType']);
    } catch (e) {
      console.error('Logout failed', e);
    }
    setToken(null);
    setUser(null);
    setAgencyType(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        agencyLogin,
        register,
        logout,
        isAuthenticated: !!token,
        userRole: user?.role ?? null,
        agencyId: user?.agencyId ?? null,
        storedAgencyId,
        agencyType,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
