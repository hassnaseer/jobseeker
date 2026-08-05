import { apiClient } from '@/api/client';
import type {
  ClientProfile,
  Identity,
  MyProfile,
  RoleProfileStatusInfo,
  SeekerProfile,
} from '@/types/profile';

export type ReviewableRole = 'CLIENT' | 'SEEKER';

export interface UpdateBasicInfoInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  city?: string;
  timezone?: string;
  language?: string;
  avatarUrl?: string;
}

export interface SubmitKycInput {
  documentType: string;
  documentNumber: string;
  frontUrl: string;
  backUrl?: string;
  selfieUrl: string;
  dob: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode: string;
}

export interface UpdateClientProfileInput {
  companyName: string;
  companyType?: string;
  registrationNumber?: string;
  taxId?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  companyAddress?: string;
  companyLogoUrl?: string;
  about?: string;
}

export interface UpdateSeekerProfileInput {
  title: string;
  bio: string;
  skills?: string[];
  hourlyRate?: number;
  currency?: string;
  experienceLevel?: string;
  languages?: string[];
  education?: SeekerProfile['education'];
  workHistory?: SeekerProfile['workHistory'];
  portfolio?: SeekerProfile['portfolio'];
  certifications?: SeekerProfile['certifications'];
  availability?: string;
  maxConcurrentContracts?: number;
}

export async function getMyProfile(role: ReviewableRole): Promise<MyProfile> {
  const { data } = await apiClient.get<MyProfile>('/profiles/me', { params: { role } });
  return data;
}

export async function updateBasicInfo(dto: UpdateBasicInfoInput) {
  const { data } = await apiClient.patch('/profiles/me/basic', dto);
  return data;
}

export async function upsertKyc(dto: SubmitKycInput): Promise<Identity> {
  const { data } = await apiClient.put<Identity>('/profiles/me/kyc', dto);
  return data;
}

export async function upsertClientProfile(dto: UpdateClientProfileInput): Promise<ClientProfile> {
  const { data } = await apiClient.put<ClientProfile>('/profiles/me/client', dto);
  return data;
}

export async function upsertSeekerProfile(dto: UpdateSeekerProfileInput): Promise<SeekerProfile> {
  const { data } = await apiClient.put<SeekerProfile>('/profiles/me/seeker', dto);
  return data;
}

export async function submitForReview(role: ReviewableRole): Promise<RoleProfileStatusInfo> {
  const { data } = await apiClient.post<RoleProfileStatusInfo>('/profiles/me/submit', { role });
  return data;
}

export type SeekerSortBy = 'RATING' | 'RATE' | 'JOBS';

export interface SeekerCard {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  title: string;
  skills: string[];
  hourlyRate: number | null;
  currency: string;
  avgRating: number;
  totalReviews: number;
  totalJobs: number;
}

export async function browseSeekers(params: { sortBy?: SeekerSortBy; limit?: number }): Promise<SeekerCard[]> {
  const { data } = await apiClient.get<SeekerCard[]>('/profiles/seekers', { params });
  return data;
}
