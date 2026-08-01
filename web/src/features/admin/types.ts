import type { Job, ProjectCatalog, Category } from '@/types/domain';
import type { AnalyticsOverview, Dispute, PlatformConfig, Report, RevenueReport } from '@/types/admin';
import type { MyProfile, RoleProfileStatusInfo } from '@/types/profile';
import type { User } from '@/types/user';
import type { PaginatedUsers } from '@/api/admin';

export interface AdminState {
  users: PaginatedUsers;
  userDetail: User | null;
  approvals: RoleProfileStatusInfo[];
  approvalDetail: MyProfile | null;
  moderationJobs: Job[];
  moderationCatalogs: ProjectCatalog[];
  reports: Report[];
  disputes: Dispute[];
  categories: Category[];
  analytics: AnalyticsOverview | null;
  revenue: RevenueReport | null;
  config: PlatformConfig | null;
  status: 'idle' | 'loading' | 'saving' | 'ready' | 'error';
  error: string | null;
}

export const ADMIN_REQUEST = 'admin/REQUEST';
export const ADMIN_MUTATE_REQUEST = 'admin/MUTATE_REQUEST';
export const ADMIN_USERS_SUCCESS = 'admin/USERS_SUCCESS';
export const ADMIN_USER_DETAIL_SUCCESS = 'admin/USER_DETAIL_SUCCESS';
export const ADMIN_APPROVALS_SUCCESS = 'admin/APPROVALS_SUCCESS';
export const ADMIN_APPROVAL_DETAIL_SUCCESS = 'admin/APPROVAL_DETAIL_SUCCESS';
export const ADMIN_MODERATION_JOBS_SUCCESS = 'admin/MODERATION_JOBS_SUCCESS';
export const ADMIN_MODERATION_CATALOGS_SUCCESS = 'admin/MODERATION_CATALOGS_SUCCESS';
export const ADMIN_REPORTS_SUCCESS = 'admin/REPORTS_SUCCESS';
export const ADMIN_DISPUTES_SUCCESS = 'admin/DISPUTES_SUCCESS';
export const ADMIN_CATEGORIES_SUCCESS = 'admin/CATEGORIES_SUCCESS';
export const ADMIN_ANALYTICS_SUCCESS = 'admin/ANALYTICS_SUCCESS';
export const ADMIN_REVENUE_SUCCESS = 'admin/REVENUE_SUCCESS';
export const ADMIN_CONFIG_SUCCESS = 'admin/CONFIG_SUCCESS';
export const ADMIN_FAILURE = 'admin/FAILURE';

interface RequestAction {
  type: typeof ADMIN_REQUEST;
}
interface MutateRequestAction {
  type: typeof ADMIN_MUTATE_REQUEST;
}
interface UsersSuccessAction {
  type: typeof ADMIN_USERS_SUCCESS;
  payload: PaginatedUsers;
}
interface UserDetailSuccessAction {
  type: typeof ADMIN_USER_DETAIL_SUCCESS;
  payload: User;
}
interface ApprovalsSuccessAction {
  type: typeof ADMIN_APPROVALS_SUCCESS;
  payload: RoleProfileStatusInfo[];
}
interface ApprovalDetailSuccessAction {
  type: typeof ADMIN_APPROVAL_DETAIL_SUCCESS;
  payload: MyProfile | null;
}
interface ModerationJobsSuccessAction {
  type: typeof ADMIN_MODERATION_JOBS_SUCCESS;
  payload: Job[];
}
interface ModerationCatalogsSuccessAction {
  type: typeof ADMIN_MODERATION_CATALOGS_SUCCESS;
  payload: ProjectCatalog[];
}
interface ReportsSuccessAction {
  type: typeof ADMIN_REPORTS_SUCCESS;
  payload: Report[];
}
interface DisputesSuccessAction {
  type: typeof ADMIN_DISPUTES_SUCCESS;
  payload: Dispute[];
}
interface CategoriesSuccessAction {
  type: typeof ADMIN_CATEGORIES_SUCCESS;
  payload: Category[];
}
interface AnalyticsSuccessAction {
  type: typeof ADMIN_ANALYTICS_SUCCESS;
  payload: AnalyticsOverview;
}
interface RevenueSuccessAction {
  type: typeof ADMIN_REVENUE_SUCCESS;
  payload: RevenueReport;
}
interface ConfigSuccessAction {
  type: typeof ADMIN_CONFIG_SUCCESS;
  payload: PlatformConfig;
}
interface FailureAction {
  type: typeof ADMIN_FAILURE;
  payload: string;
}

export type AdminAction =
  | RequestAction
  | MutateRequestAction
  | UsersSuccessAction
  | UserDetailSuccessAction
  | ApprovalsSuccessAction
  | ApprovalDetailSuccessAction
  | ModerationJobsSuccessAction
  | ModerationCatalogsSuccessAction
  | ReportsSuccessAction
  | DisputesSuccessAction
  | CategoriesSuccessAction
  | AnalyticsSuccessAction
  | RevenueSuccessAction
  | ConfigSuccessAction
  | FailureAction;
