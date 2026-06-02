import { fetchJSON } from "@/lib/fetcher";

export interface DashboardDTO {
  role: string;
  stats: {
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    totalAgencies: number;
    totalCustomers: number;
    loyaltyPoints: number;
    averageRating: number;
  };
  recentOrders: {
    id: number;
    customerName: string;
    totalAmount: number;
    status: string;
    orderDate: string;
  }[];
  orderStatusCounts: {
    status: string;
    count: number;
  }[];
}

export function getDashboard(): Promise<DashboardDTO> {
  return fetchJSON<DashboardDTO>('/api/dashboard');
}
