import { fetchJSON } from './client';
import type { CategoryDTO, ProductDTO, AttributeDTO, AttributeValueDTO, PageDTO, BrandDTO } from '../types';

export const categoryApi = {
  getAll: () => fetchJSON<CategoryDTO[]>('/api/categories'),
  getById: (id: number) => fetchJSON<CategoryDTO>(`/api/categories/${id}`),
  getLevelNames: () => fetchJSON<Record<number, string>>('/api/categories/levels'),
  getByLevel: (level: number) => fetchJSON<CategoryDTO[]>(`/api/categories/level/${level}`),
  getChildren: (parentId: number) => fetchJSON<CategoryDTO[]>(`/api/categories/${parentId}/children`),
  getForAgency: (agencyId: number) => fetchJSON<CategoryDTO[]>(`/api/categories/for-agency/${agencyId}`),
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
  getByParentCategory: async (parentId: number, agencyId?: number, customerId?: number) => {
    try {
      const children = await categoryApi.getChildren(parentId);
      if (children && children.length > 0) {
        const productPromises = children.map(child =>
          productApi.getByCategory(child.id, agencyId, customerId).catch(() => [] as ProductDTO[])
        );
        const productsArrays = await Promise.all(productPromises);
        return productsArrays.flat();
      }
      return productApi.getByCategory(parentId, agencyId, customerId);
    } catch (err) {
      console.error('Error in getByParentCategory:', err);
      return [];
    }
  },
  getByCategoryPaged: (categoryId: number, agencyId?: number, page: number = 0, size: number = 2) => {
    let params = `?categoryId=${categoryId}&page=${page}&size=${size}`;
    if (agencyId) params += `&agencyId=${agencyId}`;
    return fetchJSON<PageDTO<ProductDTO>>(`/api/products/page${params}`);
  },
  getByBrandPaged: (brandId: number, agencyId?: number, page: number = 0, size: number = 10) => {
    let params = `?brandId=${brandId}&page=${page}&size=${size}`;
    if (agencyId) params += `&agencyId=${agencyId}`;
    return fetchJSON<PageDTO<ProductDTO>>(`/api/products/page${params}`);
  },
  getById: (id: number, agencyId?: number, customerId?: number) => {
    let params = '';
    if (agencyId) params += `?agencyId=${agencyId}`;
    if (customerId) params += `${params ? '&' : '?'}customerId=${customerId}`;
    return fetchJSON<ProductDTO>(`/api/products/${id}${params}`);
  },
};

export const brandApi = {
  getAll: () => fetchJSON<BrandDTO[]>('/api/brands'),
  getById: (id: number) => fetchJSON<BrandDTO>(`/api/brands/${id}`),
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
