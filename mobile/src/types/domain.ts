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
  country: string | null;
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
  hiredCount: number;
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
  seekerId: string;
  coverLetter: string;
  bidAmount: number | null;
  proposedHourlyRate: number | null;
  currency: string;
  estimatedDuration: string | null;
  attachments: string[];
  status: ApplicationStatus;
  source: ApplicationSource;
  createdAt: string;
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
