import { fetchJSON } from './client';
import type { CategoryDTO, ProductDTO, AttributeDTO, AttributeValueDTO } from '../types';

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

export const attributeApi = {
  getAll: (categoryId?: number) => {
    const params = categoryId ? `?categoryId=${categoryId}` : '';
    return fetchJSON<AttributeDTO[]>(`/api/attributes${params}`);
  },
  getById: (id: number) => fetchJSON<AttributeDTO>(`/api/attributes/${id}`),
};

export const facetedSearchApi = {
  getProductAttributes: (productId: number) =>
    fetchJSON<AttributeValueDTO[]>(`/api/products/${productId}/attributes`),
};
