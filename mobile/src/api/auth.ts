import { fetchJSON, API_BASE } from './client';
import type { LoginRequest, AgencyLoginRequest, RegisterRequest, AgencyRegisterRequest, JwtResponse, UserDTO, SurveyQuestion, CategoryDTO } from '../types';

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
    fetchJSON<JwtResponse>('/api/auth/agency/signup', {
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

export const registerApi = {
  getCategoryLevel: () =>
    fetchJSON<number>('/api/config/registration-category-level'),
  getCategoriesByLevel: (level: number) =>
    fetchJSON<CategoryDTO[]>('/api/categories/level/' + level),
  getActiveSurveyQuestions: () =>
    fetchJSON<SurveyQuestion[]>('/api/survey/questions/active'),
  saveAgencyCategories: (agencyId: number, categoryIds: number[]) =>
    fetchJSON<{ message: string }>('/api/agencies/' + agencyId + '/categories', {
      method: 'POST',
      body: JSON.stringify({ categoryIds }),
    }),
  submitSurveyAnswers: (agencyId: number, answers: { questionId: number; answer: string }[]) =>
    fetchJSON<{ message: string }>('/api/survey/agency/' + agencyId + '/answers', {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),
};
