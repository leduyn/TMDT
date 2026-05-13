import { fetchJSON } from "@/lib/fetcher";

export interface OverdueDebtInfo {
  id: number;
  orderId: number;
  customerId?: number;
  customerName?: string;
  principalAmount: number;
  interestAccrued: number;
  status: 'ACTIVE' | 'CLOSED';
  startDate: string;
  lastCalculatedAt?: string;
}

export interface LedgerEntry {
  id: number;
  type: 'DEBT' | 'PAYMENT' | 'INTEREST' | 'HOLD' | 'REFUND';
  amount: number;
  referenceId?: string;
  receiverType?: string;
  createdAt: string;
}

export interface AgencyDebtDTO {
  id: number;
  agencyId: number;
  orderId: number;
  agencyCode?: string;
  agencyName?: string;
  customerCode?: string;
  customerName?: string;
  customerLevel?: string;
  debtCode: string;
  debtType: string;
  jobCategory?: string;
  debtTermDays: number;
  value: number;
  paidValue: number;
  paymentDate?: string;
  recordingDate: string;
  dueDate: string;
  remainingToCollect: number;
  aCoin: number;
}

export interface CustomerDebtInfo {
  customerId: number;
  customerName: string;
  totalDebt: number;
}

export interface CreditDetail {
  agencyId: number;
  creditLimit: number;
  totalDebt: number;
  guaranteeDebt: number;
  vtcAvailable: number;
  vtcHold: number;
  hmkd: number;
  debtTermDays: number;
  updatedAt: string;
  overdueDebts: OverdueDebtInfo[];
  ledgerHistory: LedgerEntry[];
  customerDebts: CustomerDebtInfo[];
}

export interface AgencyCreditSummary {
  agencyId: number;
  agencyName: string;
  agencyPhone?: string;
  agencyAddress?: string;
  creditLimit: number;
  totalDebt: number;
  vtcAvailable: number;
  vtcHold: number;
  hmkd: number;
  debtTermDays: number;
  activeOverdueCount: number;
  updatedAt?: string;
  creditInitialized: boolean;
}

export const creditApi = {
  getHmkd: (agencyId: number) =>
    fetchJSON<{ agencyId: number; hmkd: number }>(`/api/credit/agents/${agencyId}/hmkd`),

  getDetail: (agencyId: number) =>
    fetchJSON<CreditDetail>(`/api/credit/agents/${agencyId}/detail`),

  getAllSummaries: () =>
    fetchJSON<AgencyCreditSummary[]>('/api/credit/admin/summaries'),

  updateTerms: (agencyId: number, data: { creditLimit?: number; debtTermDays?: number; initialVtc?: number }) =>
    fetchJSON<{ message: string }>(`/api/credit/agents/${agencyId}/terms`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateLimit: (agencyId: number, creditLimit: number) =>
    fetchJSON<{ message: string; creditLimit: number }>(`/api/credit/agents/${agencyId}/limit`, {
      method: 'PUT',
      body: JSON.stringify({ creditLimit }),
    }),

  depositVtc: (agencyId: number, amount: number) =>
    fetchJSON<{ message: string; amount: number }>(`/api/credit/agents/${agencyId}/deposit`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),
  recalculate: (agencyId: number) =>
    fetchJSON<{ message: string }>(`/api/credit/admin/recalculate/${agencyId}`, { method: 'POST' }),

  payDebt: (agentId: number, amount: number, orderId?: number) =>
    fetchJSON<{ message: string }>('/api/credit/payments', {
      method: 'POST',
      body: JSON.stringify({ agentId, amount, orderId }),
    }),

  triggerInterest: () =>
    fetchJSON<{ message: string }>('/api/credit/admin/trigger-interest', { method: 'POST' }),
  triggerOverdue: () =>
    fetchJSON<{ message: string }>('/api/credit/admin/trigger-overdue', { method: 'POST' }),
};

export const agencyDebtApi = {
  getAll: () =>
    fetchJSON<AgencyDebtDTO[]>('/api/agency-debts'),
  getByAgencyId: (agencyId: number) =>
    fetchJSON<AgencyDebtDTO[]>(`/api/agency-debts/agency/${agencyId}`),
  getByOrderId: (orderId: number) =>
    fetchJSON<AgencyDebtDTO[]>(`/api/agency-debts/order/${orderId}`),
  payDebt: (debtId: number, amount: number) =>
    fetchJSON<AgencyDebtDTO>(`/api/agency-debts/${debtId}/pay?amount=${amount}`, {
      method: 'POST'
    }),
};
