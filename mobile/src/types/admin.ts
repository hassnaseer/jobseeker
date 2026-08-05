import type { Dispute, DisputeResolutionType, DisputeStatus } from '@/types/domain';

export type { Dispute, DisputeResolutionType, DisputeStatus };

export type ReportStatus = 'OPEN' | 'REVIEWED' | 'DISMISSED';
export type AdminReportTargetType = 'MESSAGE' | 'CONVERSATION' | 'REVIEW';

export interface Report {
  id: string;
  reporterId: string;
  targetType: AdminReportTargetType;
  targetId: string;
  reason: string;
  status: ReportStatus;
  reviewedBy: string | null;
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
