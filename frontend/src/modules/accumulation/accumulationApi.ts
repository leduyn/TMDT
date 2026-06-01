import { fetchJSON } from "@/lib/fetcher";

export interface TierDTO {
  id?: number;
  tierIndex: number;
  thresholdValue: number;
  rebateRate: number;
}

export interface AgencyRefDTO {
  id: number;
  name: string;
}

export interface PaymentDTO {
  id: number;
  programId: number;
  agencyId: number;
  paymentStage: number;
  accumulatedValue: number;
  collectedValue: number;
  rebateRate: number;
  amount: number;
  status: string;
  calculatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  notes?: string;
}

export interface AccumulationProgramDTO {
  id: number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  rebateCalculationType: string;
  status: string;
  active: boolean;
  unlimited?: boolean;
  createdAt: string;
  updatedAt: string;
  tiers: TierDTO[];
  agencies: AgencyRefDTO[];
  payments: PaymentDTO[];
}

export interface AccumulationProgramRequest {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  rebateCalculationType: string;
  active: boolean;
  unlimited?: boolean;
  tiers: { tierIndex: number; thresholdValue: number; rebateRate: number }[];
  agencyIds: number[];
}

export interface TierProgressDTO {
  tierIndex: number;
  thresholdValue: number;
  previousThreshold: number;
  rebateRate: number;
  valueInTier: number;
  commissionFromTier: number;
  progress: number;
  isReached: boolean;
  isCurrentTier: boolean;
}

export interface AccumulationSummaryDTO {
  agencyId: number;
  agencyName: string;
  programId: number;
  programName: string;
  totalAccumulatedValue: number;
  totalCollectedValue: number;
  totalRemainingDebt: number;
  currentTierRate: number;
  currentTierLabel: string;
  nextTierThreshold?: number;
  nextTierDistance?: number;
  estimatedCommission: number;
  estimatedStage1: number;
  estimatedStage2: number;
  paidStage1?: number;
  stage1Status?: string;
  paidStage2?: number;
  stage2Status?: string;
  calculationType?: string;
  tierProgress?: TierProgressDTO[];
  totalCommissionFromTiers?: number;
}

export interface AccumulationDebtDetailDTO {
  debtId: number;
  debtCode: string;
  orderId?: number;
  agencyId: number;
  agencyName: string;
  customerName: string;
  debtType: string;
  value: number;
  paidValue: number;
  remainingToCollect: number;
  debtTermDays: number;
  recordingDate: string;
  dueDate: string;
  paymentDate?: string;
}

export interface PerAgencyStats {
  agencyId: number;
  agencyName: string;
  totalValue: number;
  totalPaid: number;
  totalRemaining: number;
  orderCount: number;
}

export interface AccumulationDebtStatsDTO {
  programId: number;
  programName: string;
  startDate: string;
  endDate: string;
  totalDebtValue: number;
  totalCollectedValue: number;
  totalRemainingValue: number;
  totalOrders: number;
  fullyPaidOrders: number;
  unpaidOrders: number;
  collectionRate: number;
  perAgencyStats: PerAgencyStats[];
}

export const accumulationApi = {
  getAll: () => fetchJSON<AccumulationProgramDTO[]>('/api/accumulation-programs'),

  getById: (id: number) => fetchJSON<AccumulationProgramDTO>(`/api/accumulation-programs/${id}`),

  create: (data: AccumulationProgramRequest) =>
    fetchJSON<AccumulationProgramDTO>('/api/accumulation-programs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: AccumulationProgramRequest) =>
    fetchJSON<AccumulationProgramDTO>(`/api/accumulation-programs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetchJSON<void>(`/api/accumulation-programs/${id}`, { method: 'DELETE' }),

  activate: (id: number) =>
    fetchJSON<AccumulationProgramDTO>(`/api/accumulation-programs/${id}/activate`, {
      method: 'POST',
    }),

  getAllSummaries: (programId: number) =>
    fetchJSON<AccumulationSummaryDTO[]>(`/api/accumulation-programs/${programId}/summaries`),

  getAgencySummary: (programId: number, agencyId: number) =>
    fetchJSON<AccumulationSummaryDTO>(`/api/accumulation-programs/${programId}/agencies/${agencyId}/summary`),

  calculateStage1: (programId: number) =>
    fetchJSON<AccumulationProgramDTO>(`/api/accumulation-programs/${programId}/stage1/calculate`, {
      method: 'POST',
    }),

  approveAllStage1: (programId: number) =>
    fetchJSON<AccumulationProgramDTO>(`/api/accumulation-programs/${programId}/stage1/approve-all`, {
      method: 'POST',
    }),

  approveStage1: (programId: number, agencyId: number) =>
    fetchJSON<PaymentDTO>(`/api/accumulation-programs/${programId}/agencies/${agencyId}/stage1/approve`, {
      method: 'POST',
    }),

  rejectStage1: (programId: number, agencyId: number, notes?: string) =>
    fetchJSON<PaymentDTO>(
      `/api/accumulation-programs/${programId}/agencies/${agencyId}/stage1/reject${notes ? `?notes=${encodeURIComponent(notes)}` : ''}`,
      { method: 'POST' }
    ),

  calculateStage2: (programId: number, agencyId: number) =>
    fetchJSON<PaymentDTO>(`/api/accumulation-programs/${programId}/agencies/${agencyId}/stage2/calculate`, {
      method: 'POST',
    }),

  getProgramDebts: (programId: number) =>
    fetchJSON<AccumulationDebtDetailDTO[]>(`/api/accumulation-programs/${programId}/debts`),

  getProgramDebtStats: (programId: number) =>
    fetchJSON<AccumulationDebtStatsDTO>(`/api/accumulation-programs/${programId}/debts/stats`),

  getProgramDebtsByAgency: (programId: number, agencyId: number) =>
    fetchJSON<AccumulationDebtDetailDTO[]>(`/api/accumulation-programs/${programId}/agencies/${agencyId}/debts`),
};
