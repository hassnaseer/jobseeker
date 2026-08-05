export type ProfileStatus = 'INCOMPLETE' | 'PENDING' | 'APPROVED' | 'REJECTED';
export type DocumentType = 'PASSPORT' | 'NATIONAL_ID' | 'DRIVERS_LICENSE';
export type ProfileExperienceLevel = 'ENTRY' | 'INTERMEDIATE' | 'EXPERT';
export type SeekerAvailability = 'FULL_TIME' | 'PART_TIME' | 'AS_NEEDED' | 'NOT_AVAILABLE';

export interface BasicInfo {
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  timezone: string | null;
  language: string | null;
  avatarUrl: string | null;
}

export interface Identity {
  id: string;
  userId: string;
  documentType: DocumentType;
  documentNumber: string;
  frontUrl: string;
  backUrl: string | null;
  selfieUrl: string;
  dob: string;
  addressLine1: string;
  addressLine2: string | null;
  postalCode: string;
  kycStatus: ProfileStatus;
}

export interface EducationItem {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startYear: number;
  endYear?: number;
  description?: string;
}

export interface WorkHistoryItem {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}

export interface PortfolioItem {
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
}

export interface CertificationItem {
  name: string;
  issuer: string;
  issueDate?: string;
  expiryDate?: string;
  credentialUrl?: string;
}

export interface ClientProfile {
  userId: string;
  companyName: string;
  companyType: string | null;
  registrationNumber: string | null;
  taxId: string | null;
  website: string | null;
  industry: string | null;
  companySize: string | null;
  companyAddress: string | null;
  companyLogoUrl: string | null;
  about: string | null;
  avgRating: number;
  totalReviews: number;
}

export interface SeekerProfile {
  userId: string;
  title: string;
  bio: string;
  skills: string[];
  hourlyRate: number | null;
  currency: string;
  experienceLevel: ProfileExperienceLevel | null;
  languages: string[];
  education: EducationItem[];
  workHistory: WorkHistoryItem[];
  portfolio: PortfolioItem[];
  certifications: CertificationItem[];
  availability: SeekerAvailability | null;
  maxConcurrentContracts: number | null;
  avgRating: number;
  totalReviews: number;
  totalJobs: number;
  totalEarnings: number;
  isAvailable: boolean;
}

export interface RoleProfileStatusInfo {
  id: string;
  userId: string;
  role: 'CLIENT' | 'SEEKER';
  profileStatus: ProfileStatus;
  rejectionReason: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
}

export interface MyProfile {
  basic: BasicInfo;
  identity: Identity | null;
  roleProfile: ClientProfile | SeekerProfile | null;
  roleStatus: RoleProfileStatusInfo | null;
}
