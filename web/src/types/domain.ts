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
export type TrackingMode = 'MANUAL' | 'TIMER' | 'TIMER_WITH_SCREENSHOTS';
export type LocationType = 'REMOTE' | 'PHYSICAL';
export type ExperienceLevel = 'ENTRY' | 'INTERMEDIATE' | 'EXPERT';
export type JobDuration =
  | 'LESS_THAN_1_MONTH'
  | 'ONE_TO_THREE_MONTHS'
  | 'THREE_TO_SIX_MONTHS'
  | 'MORE_THAN_SIX_MONTHS';

export interface Job {
  id: string;
  clientId: string;
  title: string;
  description: string;
  categoryId: string;
  skillsRequired: string[];
  jobType: JobType;
  pricingModel: PricingModel | null;
  trackingMode: TrackingMode | null;
  locationType: LocationType;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  radiusKm: number | null;
  checkinRequired: boolean;
  budgetAmount: number | null;
  currency: string;
  hourlyRateMin: number | null;
  hourlyRateMax: number | null;
  estimatedHours: number | null;
  duration: JobDuration | null;
  experienceLevel: ExperienceLevel | null;
  attachments: string[];
  numberOfOpenings: number;
  status: JobStatus;
  isPaused: boolean;
  featured: boolean;
  viewsCount: number;
  applicationsCount: number;
  deadline: string | null;
  createdAt: string;
}

export type ApplicationStatus = 'PENDING' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
export type ApplicationSource = 'JOB_PAGE' | 'CHAT' | 'CATALOG_ORDER';

export interface Application {
  id: string;
  jobId: string;
  job?: Job;
  seekerId: string;
  coverLetter: string;
  bidAmount: number | null;
  proposedHourlyRate: number | null;
  currency: string;
  estimatedDuration: JobDuration | null;
  attachments: string[];
  source: ApplicationSource;
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
  children?: Category[];
}

export type CatalogStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED';

export interface CatalogFaqItem {
  question: string;
  answer: string;
}

export interface CatalogTier {
  id: string;
  catalogId: string;
  name: string;
  price: number;
  currency: string;
  deliveryDays: number;
  revisions: number;
  features: string[];
}

export interface ProjectCatalog {
  id: string;
  seekerId: string;
  title: string;
  categoryId: string;
  description: string;
  gallery: string[];
  faq: CatalogFaqItem[];
  status: CatalogStatus;
  tiers?: CatalogTier[];
  createdAt: string;
}

export type SavedTargetType = 'JOB' | 'SEEKER';

export interface SavedItem {
  id: string;
  userId: string;
  targetType: SavedTargetType;
  targetId: string;
  createdAt: string;
}
