import { fetchJSON } from './client';
import type { OrderDTO, OrderRequest } from '../types';

export const orderApi = {
  getMyOrders: () => fetchJSON<OrderDTO[]>('/api/orders/my-orders'),
  getById: (id: number) => fetchJSON<OrderDTO>(`/api/orders/${id}`),
  getByAgency: (agencyId: number) =>
    fetchJSON<OrderDTO[]>(`/api/orders/agency/${agencyId}`),
  create: (data: OrderRequest) =>
    fetchJSON<{ message: string; orderId?: number }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  createByAgency: (data: OrderRequest) =>
    fetchJSON<{ message: string; orderId?: number }>('/api/orders/by-agency', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  confirmPayment: (id: number) =>
    fetchJSON<{ message: string }>(`/api/orders/${id}/confirm-payment`, {
      method: 'POST',
    }),
};
