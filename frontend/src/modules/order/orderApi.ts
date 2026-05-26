import { fetchJSON } from "@/lib/fetcher";

export interface OrderItemDTO {
  id: number;
  productId: number;
  productName: string;
  productImageUrl?: string;
  quantity: number;
  price: number;
}

export interface OrderDTO {
  id: number;
  customerId: number;
  customerName: string;
  agencyId?: number;
  agencyName?: string;
  totalAmount: number;
  discountAmount: number;
  deliveryFee: number;
  status: 'NEW' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  orderType?: string;
  shippingAddress?: string;
  promotionCode?: string;
  pointsRedeemed?: number;
  orderDate: string;
  items: OrderItemDTO[];
  priceListId?: number;
  receiverType?: string;
  createdByName?: string;
  updatedDate?: string;
}

export interface OrderRequest {
  agencyId?: number;
  customerId?: number;
  newCustomerInfo?: {
    name: string;
    phone: string;
    shippingAddress: string;
    invoiceName?: string;
    invoiceTaxCode?: string;
    invoiceAddress?: string;
  };
  shippingAddress?: string;
  items: { productId: number; quantity: number }[];
  orderType?: 'DROPSHIP' | 'MARKETPLACE';
  promotionCode?: string;
  pointsToRedeem?: number;
  deliveryFee?: number;
}

export const orderApi = {
  getAll: () => fetchJSON<OrderDTO[]>('/api/orders'),
  getMyOrders: () => fetchJSON<OrderDTO[]>('/api/orders/my-orders'),
  getByCustomerId: (customerId: number) => fetchJSON<OrderDTO[]>(`/api/orders/customer/${customerId}`),
  getByAgencyId: (agencyId: number) => fetchJSON<OrderDTO[]>(`/api/orders/agency/${agencyId}`),
  getById: (id: number) => fetchJSON<OrderDTO>(`/api/orders/${id}`),
  create: (data: OrderRequest) => fetchJSON<{ message: string }>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  createByAgency: (data: OrderRequest) => fetchJSON<{ message: string }>('/api/orders/by-agency', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  createByEmployee: (data: OrderRequest) => fetchJSON<{ message: string }>('/api/orders/by-employee', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateStatus: (id: number, status: string) => fetchJSON<OrderDTO>(`/api/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(status)
  }),
};
