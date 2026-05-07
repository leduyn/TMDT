const API_BASE = '';

// ─── Auth ──────────────────────────────────────────────────────────────────
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
}

export interface MessageResponse {
  message: string;
}

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
}

// ─── Category ──────────────────────────────────────────────────────────────
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

// ─── Brand ─────────────────────────────────────────────────────────────────
export interface BrandDTO {
  id: number;
  code: string;
  name: string;
  logoUrl?: string;
}

// ─── Agency ────────────────────────────────────────────────────────────────
export interface AgencyDTO {
  id: number;
  name: string;
  phone?: string;
  address?: string;
  userId?: number;
}

// ─── PriceList ─────────────────────────────────────────────────────────────
export interface PriceListDTO {
  id: number;
  name: string;
  description?: string;
  isDefault: boolean;
  active: boolean;
  itemCount: number;
}

export interface BrandRequest {
  code: string;
  name: string;
  logoUrl?: string;
}


// ─── Product ───────────────────────────────────────────────────────────────
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
}


// ─── Helpers ───────────────────────────────────────────────────────────────
async function fetchJSON<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Lỗi kết nối API');
  }
  return res.json();
}

// ─── Auth API ──────────────────────────────────────────────────────────────
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

// ─── Upload API ─────────────────────────────────────────────────────────────
export const uploadApi = {
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/api/upload/image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || 'Upload thất bại');
    }
    return res.json();
  },
  uploadBrandLogo: async (file: File): Promise<{ url: string }> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/api/upload/brand-logo`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || 'Upload logo thất bại');
    }
    return res.json();
  },
};

// ─── Category API ──────────────────────────────────────────────────────────
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

// ─── Product API ───────────────────────────────────────────────────────────
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

// ─── Brand API ─────────────────────────────────────────────────────────────
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

// ─── Agency API ─────────────────────────────────────────────────────────────
export const agencyApi = {
  getAll: () => fetchJSON<AgencyDTO[]>('/api/agencies'),
  getById: (id: number) => fetchJSON<AgencyDTO>(`/api/agencies/${id}`),
  getMe: (userId: number) => fetchJSON<AgencyDTO>(`/api/agencies/me?userId=${userId}`),
  getCustomers: (agencyId: number) => fetchJSON<UserDTO[]>(`/api/agencies/${agencyId}/customers`),
  approveCustomer: (agencyId: number, customerId: number) => fetchJSON<void>(`/api/agencies/${agencyId}/approve/${customerId}`, { method: 'POST' }),
};

// ─── Customer API ───────────────────────────────────────────────────────────
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

// ─── Customer Group API ───────────────────────────────────────────────────
export const customerGroupApi = {
  getAll: () => fetchJSON<{ id: number; name: string }[]>('/api/customer-groups'),
};

// ─── PriceList API ──────────────────────────────────────────────────────────
export const priceListApi = {
  getAll: () => fetchJSON<PriceListDTO[]>('/api/price-lists'),
  getById: (id: number) => fetchJSON<PriceListDTO>(`/api/price-lists/${id}`),
};

// ─── Attribute & Faceted Search ────────────────────────────────────────────

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

export interface PriceAssignmentVoucher {
  id?: number;
  name: string;
  priceListId: number;
  priceListName?: string;
  assignmentType: string;
  rankLevel?: string;
  agencyId?: number;
  agencyName?: string;
  customerGroupId?: number;
  customerGroupName?: string;
  customerId?: number;
  customerName?: string;
  scheduledAt: string;
  status?: string;
  createdAt?: string;
  appliedAt?: string;
}

export interface PriceUpdateVoucherDTO {
  id: number;
  name: string;
  description?: string;
  scheduledAt: string;
  status: string;
  createdAt: string;
  appliedAt?: string;
  priceListIds: number[];
  items: PriceUpdateVoucherItemDTO[];
}

export interface PriceUpdateVoucherItemDTO {
  productId: number;
  productName: string;
  newPrice: number;
  isVisible: boolean;
}

export interface PriceUpdateVoucherRequest {
  name: string;
  description?: string;
  scheduledAt: string;
  priceListIds: number[];
  items: { productId: number; newPrice: number; isVisible: boolean }[];
}

export const priceAssignmentVoucherApi = {
  getAll: () => fetchJSON<PriceAssignmentVoucher[]>('/api/price-assignment-vouchers'),
  create: (data: PriceAssignmentVoucher) => fetchJSON<PriceAssignmentVoucher>('/api/price-assignment-vouchers', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  cancel: (id: number) => fetchJSON<void>(`/api/price-assignment-vouchers/${id}/cancel`, {
    method: 'POST'
  }),
  stop: (id: number) => fetchJSON<void>(`/api/price-assignment-vouchers/${id}/stop`, {
    method: 'POST'
  }),
  reactivate: (id: number, scheduledAt?: string) => fetchJSON<void>(`/api/price-assignment-vouchers/${id}/reactivate`, {
    method: 'POST',
    body: scheduledAt ? JSON.stringify({ scheduledAt }) : undefined
  })
};

export const priceUpdateVoucherApi = {
  getAll: () => fetchJSON<PriceUpdateVoucherDTO[]>('/api/price-vouchers'),
  getById: (id: number) => fetchJSON<PriceUpdateVoucherDTO>(`/api/price-vouchers/${id}`),
  create: (data: PriceUpdateVoucherRequest) => fetchJSON<PriceUpdateVoucherDTO>('/api/price-vouchers', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  cancel: (id: number) => fetchJSON<any>(`/api/price-vouchers/${id}/cancel`, {
    method: 'POST'
  }),
  apply: (id: number) => fetchJSON<any>(`/api/price-vouchers/${id}/apply`, {
    method: 'POST'
  })
};
