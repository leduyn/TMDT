import { fetchJSON } from './client';
import type { UserDTO } from '../types';

export const agencyApi = {
  getMe: () => fetchJSON<{ id: number; name: string }>('/api/agencies/me'),
  getById: (id: number) =>
    fetchJSON<{ id: number; name: string; creditLimit?: number; totalDebt?: number }>(
      `/api/agencies/${id}`
    ),
};
