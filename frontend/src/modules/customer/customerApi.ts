import { fetchJSON } from "@/lib/fetcher";
import { UserDTO } from "../user/userApi";

export interface CustomerRequest {
  username: string;
  email: string;
  password?: string;
  customerGroupId?: number;
  agencyIds?: number[];
  active: boolean;
  organizationName?: string;
  shippingAddress?: string;
  billingAddress?: string;
  taxCode?: string;
  phone?: string;
  customName?: string;
  customShippingAddress?: string;
  customPhone?: string;
}

export const customerApi = {
  getAll: () => fetchJSON<UserDTO[]>('/api/users/customers'),
  getById: (id: number) => fetchJSON<UserDTO>(`/api/users/${id}`),
  create: (data: CustomerRequest) =>
    fetchJSON<UserDTO>('/api/users/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: CustomerRequest) =>
    fetchJSON<UserDTO>(`/api/users/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  activate: (id: number) => fetchJSON<UserDTO>(`/api/users/customers/${id}/activate`, { method: 'PUT' }),
};

export const customerGroupApi = {
  getAll: () => fetchJSON<{ id: number; name: string }[]>('/api/customer-groups'),
};
