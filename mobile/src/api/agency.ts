import { fetchJSON } from './client';
import { API_BASE } from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserDTO } from '../types';

export type AgencyDTO = {
  id: number;
  name: string;
  phone?: string;
  code?: string;
  taxCode?: string;
  billingAddress?: string;
  shippingAddress?: string;
  creditLimit?: number;
  totalDebt?: number;
  avatarUrl?: string;
};

export const agencyApi = {
  getMe: () => fetchJSON<AgencyDTO>('/api/agencies/me'),
  getById: (id: number) =>
    fetchJSON<AgencyDTO>(`/api/agencies/${id}`),
  getCustomers: (agencyId: number) =>
    fetchJSON<UserDTO[]>(`/api/agencies/${agencyId}/customers`),
  getOpenedCategories: (id: number) =>
    fetchJSON<number[]>(`/api/agencies/${id}/opened-categories`),
  saveOpenedCategories: (id: number, categoryIds: number[]) =>
    fetchJSON<{ message: string }>(`/api/agencies/${id}/opened-categories`, {
      method: 'PUT',
      body: JSON.stringify({ categoryIds }),
    }),
  update: async (id: number, data: Partial<{ name: string; phone: string; avatarUrl: string }>) => {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`${API_BASE}/api/agencies/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => 'Update failed');
      throw new Error(err);
    }
    return res.json() as Promise<AgencyDTO>;
  },
};
