import { fetchJSON } from './client';
import type { CategoryDTO, ProductDTO } from '../types';

export const categoryApi = {
  getAll: () => fetchJSON<CategoryDTO[]>('/api/categories'),
  getById: (id: number) => fetchJSON<CategoryDTO>(`/api/categories/${id}`),
};

export const productApi = {
  getAll: (agencyId?: number, customerId?: number) => {
    let params = '';
    if (agencyId) params += `?agencyId=${agencyId}`;
    if (customerId) params += `${params ? '&' : '?'}customerId=${customerId}`;
    return fetchJSON<ProductDTO[]>(`/api/products${params}`);
  },
  getByCategory: (categoryId: number, agencyId?: number, customerId?: number) => {
    let params = `?categoryId=${categoryId}`;
    if (agencyId) params += `&agencyId=${agencyId}`;
    if (customerId) params += `&customerId=${customerId}`;
    return fetchJSON<ProductDTO[]>(`/api/products${params}`);
  },
  getById: (id: number, agencyId?: number, customerId?: number) => {
    let params = '';
    if (agencyId) params += `?agencyId=${agencyId}`;
    if (customerId) params += `${params ? '&' : '?'}customerId=${customerId}`;
    return fetchJSON<ProductDTO>(`/api/products/${id}${params}`);
  },
};
