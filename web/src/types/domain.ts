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
  job?: Job;
  clientId: string;
  seekerId: string;
  applicationId: string;
  type: JobType;
  pricingModel: PricingModel | null;
  agreedAmount: number | null;
  agreedHourlyRate: number | null;
  currency: string;
  trackingMode: TrackingMode | null;
  weeklyHourLimit: number | null;
  checkinRequired: boolean;
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

export type TimeLogEntryType = 'MANUAL' | 'TIMER';
export type TimeLogEntryStatus = 'PENDING' | 'APPROVED' | 'DISPUTED';

export interface TimeLogEntry {
  id: string;
  timesheetId: string;
  contractId: string;
  entryType: TimeLogEntryType;
  startTime: string | null;
  endTime: string | null;
  hours: number | null;
  description: string | null;
  screenshotUrls: string[];
  status: TimeLogEntryStatus;
  createdAt: string;
}

export type TimesheetPeriodStatus = 'OPEN' | 'CLOSED' | 'APPROVED' | 'DISPUTED';

export interface TimesheetPeriod {
  id: string;
  contractId: string;
  periodStart: string;
  periodEnd: string;
  totalHours: number;
  totalAmount: number;
  currency: string;
  status: TimesheetPeriodStatus;
  approvedAt: string | null;
}

export type CheckInType = 'IN' | 'OUT';

export interface CheckIn {
  id: string;
  contractId: string;
  type: CheckInType;
  latitude: number;
  longitude: number;
  createdAt: string;
}

export type PayoutMethodType = 'STRIPE_CONNECT' | 'BANK' | 'WALLET';
export type ConnectStatus = 'NOT_STARTED' | 'PENDING' | 'ACTIVE' | 'RESTRICTED';

export interface PayoutMethod {
  id: string;
  userId: string;
  type: PayoutMethodType;
  stripeAccountId: string | null;
  connectStatus: ConnectStatus | null;
  bankName: string | null;
  accountHolder: string | null;
  accountNumber: string | null;
  swiftOrRouting: string | null;
  currency: string | null;
  isDefault: boolean;
  createdAt: string;
}

export type WithdrawalStatus = 'REQUESTED' | 'PROCESSING' | 'PAID' | 'FAILED';

export interface WithdrawalRequest {
  id: string;
  userId: string;
  walletId: string;
  amount: number;
  currency: string;
  payoutMethodId: string;
  status: WithdrawalStatus;
  failureReason: string | null;
  requestedAt: string;
  processedAt: string | null;
}

export type TransactionType =
  | 'ESCROW_FUND'
  | 'ESCROW_RELEASE'
  | 'HOURLY_CHARGE'
  | 'CATALOG_ORDER'
  | 'REFUND'
  | 'PARTIAL_REFUND'
  | 'WITHDRAWAL'
  | 'COMMISSION';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Transaction {
  id: string;
  contractId: string | null;
  milestoneId: string | null;
  payerId: string | null;
  payeeId: string | null;
  type: TransactionType;
  amount: number;
  clientFee: number;
  seekerFee: number;
  netAmount: number;
  currency: string;
  status: TransactionStatus;
  failureReason: string | null;
  createdAt: string;
}

export interface Invoice {
  id: string;
  contractId: string;
  transactionId: string;
  partyId: string;
  number: string;
  amount: number;
  taxAmount: number;
  currency: string;
  pdfUrl: string | null;
  issuedAt: string;
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

export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';

export interface Conversation {
  id: string;
  jobId: string | null;
  contractId: string | null;
  clientId: string;
  seekerId: string;
  initiatedBy: string;
  isBlocked: boolean;
  blockedBy: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string | null;
  content: string | null;
  type: MessageType;
  attachments: string[];
  isRead: boolean;
  readAt: string | null;
  isEdited: boolean;
  isDeleted: boolean;
  replyToId: string | null;
  createdAt: string;
}

export type ReportTargetType = 'MESSAGE' | 'CONVERSATION' | 'REVIEW';

export type NotificationEventType =
  | 'PROFILE_APPROVED'
  | 'PROFILE_REJECTED'
  | 'APPLICATION_RECEIVED'
  | 'APPLICATION_ACCEPTED'
  | 'APPLICATION_REJECTED'
  | 'ESCROW_FUNDED'
  | 'DELIVERABLE_SUBMITTED'
  | 'DELIVERABLE_APPROVED'
  | 'DELIVERABLE_REVISION_REQUESTED'
  | 'MILESTONE_RELEASED'
  | 'TIMESHEET_SUBMITTED'
  | 'HOURS_DISPUTED'
  | 'HOURS_APPROVED'
  | 'CONTRACT_COMPLETED'
  | 'WITHDRAWAL_STATUS_CHANGED'
  | 'NEW_MESSAGE'
  | 'CHAT_UNREAD_DIGEST'
  | 'DISPUTE_OPENED'
  | 'DISPUTE_RESOLVED'
  | 'REVIEW_RECEIVED';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationEventType;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  eventType: NotificationEventType;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  pushEnabled: boolean;
}

export interface RecommendedJob {
  job: Job;
  score: number;
  reasons: string[];
}

export interface ScoredApplicant {
  applicationId: string;
  seekerId: string;
  score: number;
  reasons: string[];
  autoShortlisted: boolean;
}

export interface AiMatchScore {
  id: string;
  seekerId: string;
  jobId: string;
  score: number;
  reasons: string[];
  modelVersion: string;
  computedAt: string;
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
