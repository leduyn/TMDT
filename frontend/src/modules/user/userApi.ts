import { fetchJSON } from "@/lib/fetcher";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AgencyLoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phone?: string;
  taxCode?: string;
  role?: string;
}

export interface JwtResponse {
  token: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
  agencyId?: number;
  shippingAddress?: string;
  phone?: string;
  name?: string;
  code?: string;
  agencyStatus?: string;
}

export interface MessageResponse {
  message: string;
}

export interface UserDTO {
  id: number;
  username: string;
  email: string;
  role: string;
  active: boolean;
  organizationName?: string;
  shippingAddress?: string;
  billingAddress?: string;
  taxCode?: string;
  phone?: string;
}

export const authApi = {
  login: (data: LoginRequest) =>
    fetchJSON<JwtResponse>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  agencyLogin: (data: AgencyLoginRequest) =>
    fetchJSON<JwtResponse>('/api/auth/agency/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  register: (data: RegisterRequest) =>
    fetchJSON<MessageResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const userApi = {
  getMe: () => fetchJSON<UserDTO>('/api/users/me'),
  getAll: () => fetchJSON<UserDTO[]>('/api/users/all'),
  delete: (userId: number) => fetchJSON<void>(`/api/users/${userId}`, { method: 'DELETE' }),
};
