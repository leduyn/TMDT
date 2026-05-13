import { fetchJSON } from "@/lib/fetcher";

export interface LoginRequest {
  username: string;
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
}

export interface MessageResponse {
  message: string;
}

export interface UserDTO {
  id: number;
  username: string;
  email: string;
  role: string;
  customerGroupId?: number;
  customerGroupName?: string;
  agencyIds?: number[];
  agencyNames?: string[];
  active: boolean;
  organizationName?: string;
  shippingAddress?: string;
  billingAddress?: string;
  taxCode?: string;
  phone?: string;
  approved?: boolean;
  displayName?: string;
  customName?: string;
  customShippingAddress?: string;
  customPhone?: string;
  totalDebt?: number;
}

export const authApi = {
  login: (data: LoginRequest) =>
    fetchJSON<JwtResponse>('/api/auth/signin', {
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
  getMe: (userId: number) => fetchJSON<UserDTO>(`/api/users/${userId}`),
};
