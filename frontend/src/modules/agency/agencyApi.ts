import { fetchJSON } from "@/lib/fetcher";
import { UserDTO } from "../user/userApi";

export interface AgencyDTO {
  id: number;
  name: string;
  phone?: string;
  address?: string;
  userId?: number;
  username?: string;
  email?: string;
  status?: string;
  active: boolean;
  organizationName?: string;
  taxCode?: string;
  billingAddress?: string;
  defaultCommissionRate?: number;
  latitude?: number;
  longitude?: number;
}

export const agencyApi = {
  getAll: () => fetchJSON<AgencyDTO[]>('/api/agencies'),
  getById: (id: number) => fetchJSON<AgencyDTO>(`/api/agencies/${id}`),
  getMe: (userId: number) => fetchJSON<AgencyDTO>(`/api/agencies/me?userId=${userId}`),
  getCustomers: (agencyId: number) => fetchJSON<UserDTO[]>(`/api/agencies/${agencyId}/customers`),
  approveCustomer: (agencyId: number, customerId: number) => fetchJSON<void>(`/api/agencies/${agencyId}/approve/${customerId}`, { method: 'POST' }),
  approve: (id: number, data: Partial<AgencyDTO> & { defaultCommissionRate?: number }) => fetchJSON<AgencyDTO>(`/api/agencies/${id}/approve`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  createWithAccount: (data: any) => fetchJSON<AgencyDTO>('/api/agencies/with-account', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  convertFromUser: (userId: number, data: any) => fetchJSON<AgencyDTO>(`/api/agencies/convert-from-user/${userId}`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id: number, data: any) => fetchJSON<AgencyDTO>(`/api/agencies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
};
