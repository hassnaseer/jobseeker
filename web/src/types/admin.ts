export type ReportStatus = 'OPEN' | 'REVIEWED' | 'DISMISSED';
export type ReportTargetType = 'MESSAGE' | 'CONVERSATION' | 'REVIEW';

export interface Report {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  status: ReportStatus;
  reviewedBy: string | null;
  createdAt: string;
}

export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED';
export type DisputeResolutionType = 'REFUND_CLIENT' | 'RELEASE_SEEKER' | 'SPLIT';

export interface Dispute {
  id: string;
  contractId: string;
  milestoneId: string | null;
  raisedBy: string;
  reason: string;
  evidence: string[];
  status: DisputeStatus;
  resolutionType: DisputeResolutionType | null;
  resolutionNote: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  ip: string | null;
  createdAt: string;
}

export type AiAutonomyLevel = 'SUGGEST' | 'SHORTLIST' | 'AUTO_HIRE';

export interface PlatformConfig {
  id: string;
  clientCommissionPct: number;
  seekerCommissionPct: number;
  autoApproveHoursDays: number;
  escrowAutoReleaseDays: number;
  minWithdrawal: number;
  supportedCurrencies: string[];
  baseCurrency: string;
  featuredJobPrice: number;
  aiAutonomyLevel: AiAutonomyLevel;
  aiProvider: string | null;
  aiModel: string | null;
  aiMonthlySpendCap: number | null;
  aiEnabledFeatures: string[];
  updatedAt: string;
}

export interface AnalyticsOverview {
  totalUsers: number;
  usersByActiveRole: Array<{ role: string; count: number }>;
  jobsByStatus: Array<{ status: string; count: number }>;
  contractsByStatus: Array<{ status: string; count: number }>;
  grossMerchandiseVolume: Array<{ currency: string; total: number }>;
}

export interface RevenueReport {
  commissionByCurrency: Array<{
    currency: string;
    clientFeeTotal: number;
    seekerFeeTotal: number;
    platformRevenue: number;
  }>;
  transactionsByType: Array<{ type: string; count: number; total: number }>;
}
