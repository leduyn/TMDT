import { fetchJSON } from './client';
import type { NotificationDTO, DashboardDTO } from '../types';

export const dashboardApi = {
  getDashboard: () => fetchJSON<DashboardDTO>('/api/dashboard'),
};

export const notificationApi = {
  getAll: () => fetchJSON<NotificationDTO[]>('/api/notifications'),
  markRead: (id: number) =>
    fetchJSON<void>(`/api/notifications/${id}/read`, { method: 'PUT' }),
};
