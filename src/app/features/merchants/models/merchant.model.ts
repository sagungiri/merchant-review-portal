export type MerchantStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

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
