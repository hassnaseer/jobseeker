export type UserRole = 'SUPER_ADMIN' | 'CLIENT' | 'SEEKER';

export interface User {
  id: string;
  email: string;
  activeRole: UserRole;
  roles: UserRole[];
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  country: string | null;
  city: string | null;
  timezone: string | null;
  language: string | null;
  preferredCurrency: string;
  emailVerified: boolean;
  twoFaEnabled: boolean;
  isActive: boolean;
  isBanned: boolean;
  createdAt: string;
}
