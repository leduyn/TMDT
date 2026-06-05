import { fetchJSON } from './client';
import type { LoginRequest, RegisterRequest, JwtResponse, UserDTO } from '../types';

export const authApi = {
  login: (data: LoginRequest) =>
    fetchJSON<JwtResponse>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  register: (data: RegisterRequest) =>
    fetchJSON<{ message: string }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const userApi = {
  getMe: (userId: number) => fetchJSON<UserDTO>(`/api/users/${userId}`),
  updateProfile: (data: Partial<UserDTO>) =>
    fetchJSON<UserDTO>('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
