import { fetchJSON } from './client';
import type { CustomerDTO } from '../types';

export const customerApi = {
  getCustomers: (agencyId: number) =>
    fetchJSON<CustomerDTO[]>(`/api/customers?agencyId=${agencyId}`),

  checkByTaxCode: (taxCode: string, agencyId: number) =>
    fetchJSON<CustomerDTO | null>(`/api/customers/check?taxCode=${encodeURIComponent(taxCode)}&agencyId=${agencyId}`),

  getById: (id: number) =>
    fetchJSON<CustomerDTO>(`/api/customers/${id}`),

  create: (data: {
    agencyId: number;
    organizationName?: string;
    taxCode?: string;
    shippingAddress?: string;
    billingAddress?: string;
    receiverName?: string;
    receiverPhone?: string;
  }) =>
    fetchJSON<CustomerDTO>('/api/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
