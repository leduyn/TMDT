import { fetchJSON } from "@/lib/fetcher";

export interface CategoryDTO {
  id: number;
  name: string;
  imageUrl?: string;
  parentId?: number;
  parentName?: string;
}

export interface CategoryRequest {
  name: string;
  imageUrl?: string;
  parentId?: number;
}

export interface BrandDTO {
  id: number;
  code: string;
  name: string;
  logoUrl?: string;
}

export interface BrandRequest {
  code: string;
  name: string;
  logoUrl?: string;
}

export interface ProductDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId?: number;
  categoryName?: string;
  basePrice?: number;
  dropshipPrice?: number;
  stockQuantity?: number;
  isDropship?: boolean;
  imageUrl?: string;
  imageUrls?: string[];
  brand?: BrandDTO;
  isAppVisible?: boolean;
  isWebVisible?: boolean;
  tags?: string;
  bravoOrder?: number;
  unit?: string;
  innerPackaging?: string;
  outerPackaging?: string;
  minPurchaseQuantity?: number;
  quantityStep?: number;
  userManual?: string;
  appliedPrice?: number;
  appliedPriceListName?: string;
  appliedPriceListId?: number;
  showDiscount?: boolean;
  oldAppliedPrice?: number;
  priceChangeRatio?: number;
}

export interface ProductRequest {
  name: string;
  description?: string;
  categoryId: number;
  basePrice: number;
  dropshipPrice?: number;
  stockQuantity: number;
  isDropship?: boolean;
  imageUrl?: string;
  imageUrls?: string[];
  brandId?: number;
  attributeValueIds?: number[];
  isAppVisible?: boolean;
  isWebVisible?: boolean;
  tags?: string;
  bravoOrder?: number;
  unit?: string;
  innerPackaging?: string;
  outerPackaging?: string;
  minPurchaseQuantity?: number;
  quantityStep?: number;
  userManual?: string;
  showDiscount?: boolean;
}

export interface AttributeValueDTO {
  id: number;
  value: string;
  attributeId: number;
}

export interface AttributeDTO {
  id: number;
  name: string;
  displayName: string;
  categoryId?: number;
  categoryName?: string;
  isVariant?: boolean;
  values: AttributeValueDTO[];
}

export interface FacetValueDTO {
  valueId: number;
  value: string;
  count: number;
}

export interface FacetGroupDTO {
  attributeId: number;
  attributeName: string;
  displayName: string;
  values: FacetValueDTO[];
}

export interface FacetedSearchRequest {
  categoryId?: number;
  selectedValueIds?: number[];
  page?: number;
  size?: number;
  agencyId?: number;
  customerId?: number;
}

export interface FacetedSearchResponse {
  products: ProductDTO[];
  facets: FacetGroupDTO[];
  totalCount: number;
  page: number;
  size: number;
}

export const categoryApi = {
  getAll: () => fetchJSON<CategoryDTO[]>('/api/categories'),
  getById: (id: number) => fetchJSON<CategoryDTO>(`/api/categories/${id}`),
  create: (data: CategoryRequest) =>
    fetchJSON<CategoryDTO>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: CategoryRequest) =>
    fetchJSON<CategoryDTO>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    fetchJSON<any>(`/api/categories/${id}`, {
      method: 'DELETE',
    }),
};

export const productApi = {
  getAll: (agencyId?: number, customerId?: number) => {
    let params = '';
    if (agencyId) params += `?agencyId=${agencyId}`;
    if (customerId) params += `${params ? '&' : '?'}customerId=${customerId}`;
    return fetchJSON<ProductDTO[]>(`/api/products${params}`);
  },
  getById: (id: number, agencyId?: number, customerId?: number) => {
    let params = '';
    if (agencyId) params += `?agencyId=${agencyId}`;
    if (customerId) params += `${params ? '&' : '?'}customerId=${customerId}`;
    return fetchJSON<ProductDTO>(`/api/products/${id}${params}`);
  },
  create: (data: ProductRequest) =>
    fetchJSON<ProductDTO>('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: ProductRequest) =>
    fetchJSON<ProductDTO>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    fetchJSON<any>(`/api/products/${id}`, {
      method: 'DELETE',
    }),
};

export const brandApi = {
  getAll: () => fetchJSON<BrandDTO[]>('/api/brands'),
  getById: (id: number) => fetchJSON<BrandDTO>(`/api/brands/${id}`),
  create: (data: BrandRequest) =>
    fetchJSON<BrandDTO>('/api/brands', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: BrandRequest) =>
    fetchJSON<BrandDTO>(`/api/brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    fetchJSON<any>(`/api/brands/${id}`, {
      method: 'DELETE',
    }),
};

export const attributeApi = {
  getAll: (categoryId?: number) => {
    const params = categoryId ? `?categoryId=${categoryId}` : '';
    return fetchJSON<AttributeDTO[]>(`/api/attributes${params}`);
  },
  getById: (id: number) => fetchJSON<AttributeDTO>(`/api/attributes/${id}`),
  create: (data: { name: string; displayName: string; categoryId?: number; isVariant?: boolean }) =>
    fetchJSON<AttributeDTO>('/api/attributes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: { name: string; displayName: string; categoryId?: number; isVariant?: boolean }) =>
    fetchJSON<AttributeDTO>(`/api/attributes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    fetchJSON<any>(`/api/attributes/${id}`, {
      method: 'DELETE',
    }),
  getValues: (attributeId: number) =>
    fetchJSON<AttributeValueDTO[]>(`/api/attributes/${attributeId}/values`),
  addValue: (attributeId: number, value: string) =>
    fetchJSON<AttributeValueDTO>(`/api/attributes/${attributeId}/values`, {
      method: 'POST',
      body: JSON.stringify({ value }),
    }),
  deleteValue: (valueId: number) =>
    fetchJSON<any>(`/api/attributes/values/${valueId}`, {
      method: 'DELETE',
    }),
};

export const facetedSearchApi = {
  search: (request: FacetedSearchRequest) =>
    fetchJSON<FacetedSearchResponse>('/api/products/search/faceted', {
      method: 'POST',
      body: JSON.stringify(request),
    }),
  getProductAttributes: (productId: number) =>
    fetchJSON<AttributeValueDTO[]>(`/api/products/${productId}/attributes`),
  assignProductAttributes: (productId: number, attributeValueIds: number[]) =>
    fetchJSON<AttributeValueDTO[]>(`/api/products/${productId}/attributes`, {
      method: 'POST',
      body: JSON.stringify({ attributeValueIds }),
    }),
};
