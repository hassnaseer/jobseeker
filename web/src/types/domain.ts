export type JobStatus =
  | 'DRAFT'
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED'
  | 'EXPIRED';
export type JobType = 'FIXED' | 'HOURLY';
export type PricingModel = 'LUMP' | 'MILESTONE';
export type LocationType = 'REMOTE' | 'PHYSICAL';
export type ExperienceLevel = 'ENTRY' | 'INTERMEDIATE' | 'EXPERT';

export interface Job {
  id: string;
  clientId: string;
  title: string;
  description: string;
  categoryId: string;
  skillsRequired: string[];
  jobType: JobType;
  pricingModel: PricingModel | null;
  locationType: LocationType;
  budgetAmount: number | null;
  currency: string;
  hourlyRateMin: number | null;
  hourlyRateMax: number | null;
  experienceLevel: ExperienceLevel | null;
  status: JobStatus;
  isPaused: boolean;
  featured: boolean;
  viewsCount: number;
  applicationsCount: number;
  createdAt: string;
}

export type ApplicationStatus = 'PENDING' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export interface Application {
  id: string;
  jobId: string;
  seekerId: string;
  coverLetter: string;
  bidAmount: number | null;
  proposedHourlyRate: number | null;
  currency: string;
  status: ApplicationStatus;
  createdAt: string;
}

export type ContractStatus =
  | 'PENDING_FUNDING'
  | 'ACTIVE'
  | 'SUBMITTED'
  | 'REVISION'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

export interface Contract {
  id: string;
  jobId: string;
  clientId: string;
  seekerId: string;
  applicationId: string;
  type: JobType;
  pricingModel: PricingModel | null;
  agreedAmount: number | null;
  agreedHourlyRate: number | null;
  currency: string;
  status: ContractStatus;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface Milestone {
  id: string;
  contractId: string;
  title: string;
  description: string | null;
  amount: number;
  currency: string;
  sequence: number;
  status: 'PENDING' | 'FUNDED' | 'SUBMITTED' | 'APPROVED' | 'RELEASED' | 'DISPUTED';
  fundedAt: string | null;
  releasedAt: string | null;
}

export interface Deliverable {
  id: string;
  contractId: string;
  milestoneId: string | null;
  description: string;
  attachments: string[];
  status: 'SUBMITTED' | 'APPROVED' | 'REVISION_REQUESTED';
  feedback: string | null;
  submittedAt: string;
  reviewedAt: string | null;
}

export interface Wallet {
  id: string;
  userId: string;
  currency: string;
  balance: number;
  pendingBalance: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  iconUrl: string | null;
  description: string | null;
  isActive: boolean;
}
