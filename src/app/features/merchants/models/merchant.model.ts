import { Status } from '@shared/models/status.model';

export type MerchantStatus = 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';

export const MERCHANT_STATUSES: readonly Status<MerchantStatus>[] = [
  { value: 'DRAFT', label: 'Draft', tone: 'neutral' },
  { value: 'SUBMITTED', label: 'Submitted', tone: 'info' },
  { value: 'IN_REVIEW', label: 'In review', tone: 'info' },
  { value: 'APPROVED', label: 'Approved', tone: 'success', final: true },
  { value: 'REJECTED', label: 'Rejected', tone: 'danger', final: true },
];

export interface MerchantListItem {
  id: string;
  merchantName: string;
  status: MerchantStatus;
  createdBy: string;
  assignedReviewerId: string | null;
  updatedAt: string;
  createdAt: string;
}

export interface RiskEvent {
  id: string;
  at: string;
  actorId: string;
  action: string;
  note: string;
}

export interface Merchant extends MerchantListItem {
  taxId: string;
  bankAccountLast4: string;
  contactEmail: string;
  contactPhone: string;
  businessAddress: string;
  expectedMonthlyVolume: number;
  riskHistory: RiskEvent[];
  draftStep: number;
}

export interface MerchantDraft {
  merchantName: string;
  taxId: string;
  bankAccountLast4: string;
  contactEmail: string;
  contactPhone: string;
  businessAddress: string;
  expectedMonthlyVolume: number;
  draftStep: number;
}

