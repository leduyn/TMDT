import { fetchJSON } from './client';
import type { LoginRequest, AgencyLoginRequest, RegisterRequest, AgencyRegisterRequest, JwtResponse, UserDTO } from '../types';

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
    fetchJSON<{ message: string }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  registerAgency: (data: AgencyRegisterRequest) =>
    fetchJSON<{ message: string }>('/api/auth/agency/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const userApi = {
  getMe: () => fetchJSON<UserDTO>('/api/users/me'),
  updateProfile: (data: Partial<UserDTO>) =>
    fetchJSON<UserDTO>('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
