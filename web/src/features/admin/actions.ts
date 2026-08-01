import type { Dispatch } from 'redux';
import * as adminApi from '@/api/admin';
import * as categoriesApi from '@/api/categories';
import * as jobsApi from '@/api/jobs';
import * as catalogsApi from '@/api/catalogs';
import { extractErrorMessage, tokenStorage } from '@/api/client';
import type { DisputeStatus, ReportStatus } from '@/types/admin';
import type { UserRole } from '@/types/user';
import {
  ADMIN_ANALYTICS_SUCCESS,
  ADMIN_APPROVALS_SUCCESS,
  ADMIN_APPROVAL_DETAIL_SUCCESS,
  ADMIN_CATEGORIES_SUCCESS,
  ADMIN_CONFIG_SUCCESS,
  ADMIN_DISPUTES_SUCCESS,
  ADMIN_FAILURE,
  ADMIN_MODERATION_CATALOGS_SUCCESS,
  ADMIN_MODERATION_JOBS_SUCCESS,
  ADMIN_MUTATE_REQUEST,
  ADMIN_REPORTS_SUCCESS,
  ADMIN_REQUEST,
  ADMIN_REVENUE_SUCCESS,
  ADMIN_USERS_SUCCESS,
  ADMIN_USER_DETAIL_SUCCESS,
  type AdminAction,
} from './types';

export type AdminThunk = (dispatch: Dispatch<AdminAction>) => Promise<void>;

// ---- Users ----

export function fetchUsers(
  params: { q?: string; role?: UserRole; page?: number; limit?: number } = {},
): AdminThunk {
  return async (dispatch) => {
    dispatch({ type: ADMIN_REQUEST });
    try {
      const result = await adminApi.listUsers(params);
      dispatch({ type: ADMIN_USERS_SUCCESS, payload: result });
    } catch (error) {
      dispatch({ type: ADMIN_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

function userMutateThunk(id: string, run: () => Promise<unknown>): AdminThunk {
  return async (dispatch) => {
    dispatch({ type: ADMIN_MUTATE_REQUEST });
    try {
      await run();
      const user = await adminApi.getUserDetail(id);
      dispatch({ type: ADMIN_USER_DETAIL_SUCCESS, payload: user });
    } catch (error) {
      dispatch({ type: ADMIN_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}

export const suspendUser = (id: string) => userMutateThunk(id, () => adminApi.suspendUser(id));
export const reactivateUser = (id: string) => userMutateThunk(id, () => adminApi.reactivateUser(id));
export const banUser = (id: string) => userMutateThunk(id, () => adminApi.banUser(id));
export const verifyUserEmail = (id: string) => userMutateThunk(id, () => adminApi.verifyUserEmail(id));

export function impersonateUser(id: string): AdminThunk {
  return async (dispatch) => {
    dispatch({ type: ADMIN_MUTATE_REQUEST });
    try {
      const result = await adminApi.impersonateUser(id);
      tokenStorage.setTokens(result.accessToken, result.refreshToken);
      window.location.href = '/app/dashboard';
    } catch (error) {
      dispatch({ type: ADMIN_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}

// ---- Approvals ----

export function fetchPendingApprovals(role?: 'CLIENT' | 'SEEKER'): AdminThunk {
  return async (dispatch) => {
    dispatch({ type: ADMIN_REQUEST });
    try {
      const items = await adminApi.listPendingApprovals(role);
      dispatch({ type: ADMIN_APPROVALS_SUCCESS, payload: items });
    } catch (error) {
      dispatch({ type: ADMIN_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

export function fetchApprovalDetail(userId: string, role: 'CLIENT' | 'SEEKER'): AdminThunk {
  return async (dispatch) => {
    dispatch({ type: ADMIN_REQUEST });
    try {
      const detail = await adminApi.getApprovalDetail(userId, role);
      dispatch({ type: ADMIN_APPROVAL_DETAIL_SUCCESS, payload: detail });
    } catch (error) {
      dispatch({ type: ADMIN_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

function approvalMutateThunk(role: 'CLIENT' | 'SEEKER', run: () => Promise<unknown>): AdminThunk {
  return async (dispatch) => {
    dispatch({ type: ADMIN_MUTATE_REQUEST });
    try {
      await run();
      const items = await adminApi.listPendingApprovals(role);
      dispatch({ type: ADMIN_APPROVALS_SUCCESS, payload: items });
      dispatch({ type: ADMIN_APPROVAL_DETAIL_SUCCESS, payload: null });
    } catch (error) {
      dispatch({ type: ADMIN_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}

export const approveProfile = (userId: string, role: 'CLIENT' | 'SEEKER') =>
  approvalMutateThunk(role, () => adminApi.approveProfile(userId, role));
export const rejectProfile = (userId: string, role: 'CLIENT' | 'SEEKER', reason: string, rejectKyc?: boolean) =>
  approvalMutateThunk(role, () => adminApi.rejectProfile(userId, role, reason, rejectKyc));

// ---- Moderation ----

export function fetchModerationJobs(status?: string): AdminThunk {
  return async (dispatch) => {
    dispatch({ type: ADMIN_REQUEST });
    try {
      const items = await adminApi.listModerationJobs(status);
      dispatch({ type: ADMIN_MODERATION_JOBS_SUCCESS, payload: items });
    } catch (error) {
      dispatch({ type: ADMIN_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

export function fetchModerationCatalogs(status?: string): AdminThunk {
  return async (dispatch) => {
    dispatch({ type: ADMIN_REQUEST });
    try {
      const items = await adminApi.listModerationCatalogs(status);
      dispatch({ type: ADMIN_MODERATION_CATALOGS_SUCCESS, payload: items });
    } catch (error) {
      dispatch({ type: ADMIN_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

export function pauseModerationJob(id: string): AdminThunk {
  return async (dispatch) => {
    dispatch({ type: ADMIN_MUTATE_REQUEST });
    try {
      await jobsApi.pauseJob(id);
      const items = await adminApi.listModerationJobs();
      dispatch({ type: ADMIN_MODERATION_JOBS_SUCCESS, payload: items });
    } catch (error) {
      dispatch({ type: ADMIN_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}

export function pauseModerationCatalog(id: string): AdminThunk {
  return async (dispatch) => {
    dispatch({ type: ADMIN_MUTATE_REQUEST });
    try {
      await catalogsApi.pauseCatalog(id);
      const items = await adminApi.listModerationCatalogs();
      dispatch({ type: ADMIN_MODERATION_CATALOGS_SUCCESS, payload: items });
    } catch (error) {
      dispatch({ type: ADMIN_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}

// ---- Reports ----

export function fetchReports(status?: ReportStatus): AdminThunk {
  return async (dispatch) => {
    dispatch({ type: ADMIN_REQUEST });
    try {
      const items = await adminApi.listReports(status);
      dispatch({ type: ADMIN_REPORTS_SUCCESS, payload: items });
    } catch (error) {
      dispatch({ type: ADMIN_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

export function resolveReport(id: string, status: 'REVIEWED' | 'DISMISSED'): AdminThunk {
  return async (dispatch) => {
    dispatch({ type: ADMIN_MUTATE_REQUEST });
    try {
      await adminApi.resolveReport(id, status);
      const items = await adminApi.listReports();
      dispatch({ type: ADMIN_REPORTS_SUCCESS, payload: items });
    } catch (error) {
      dispatch({ type: ADMIN_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}

// ---- Disputes ----

export function fetchDisputesQueue(status?: DisputeStatus): AdminThunk {
  return async (dispatch) => {
    dispatch({ type: ADMIN_REQUEST });
    try {
      const items = await adminApi.listDisputesQueue(status);
      dispatch({ type: ADMIN_DISPUTES_SUCCESS, payload: items });
    } catch (error) {
      dispatch({ type: ADMIN_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

function disputeMutateThunk(run: () => Promise<unknown>): AdminThunk {
  return async (dispatch) => {
    dispatch({ type: ADMIN_MUTATE_REQUEST });
    try {
      await run();
      const items = await adminApi.listDisputesQueue();
      dispatch({ type: ADMIN_DISPUTES_SUCCESS, payload: items });
    } catch (error) {
      dispatch({ type: ADMIN_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}

export const markDisputeUnderReview = (id: string) =>
  disputeMutateThunk(() => adminApi.markDisputeUnderReview(id));
export const resolveDispute = (id: string, dto: adminApi.ResolveDisputeInput) =>
  disputeMutateThunk(() => adminApi.resolveDispute(id, dto));

// ---- Categories ----

export function fetchAdminCategories(): AdminThunk {
  return async (dispatch) => {
    dispatch({ type: ADMIN_REQUEST });
    try {
      const items = await categoriesApi.listAllCategoriesAdmin();
      dispatch({ type: ADMIN_CATEGORIES_SUCCESS, payload: items });
    } catch (error) {
      dispatch({ type: ADMIN_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

function categoryMutateThunk(run: () => Promise<unknown>): AdminThunk {
  return async (dispatch) => {
    dispatch({ type: ADMIN_MUTATE_REQUEST });
    try {
      await run();
      const items = await categoriesApi.listAllCategoriesAdmin();
      dispatch({ type: ADMIN_CATEGORIES_SUCCESS, payload: items });
    } catch (error) {
      dispatch({ type: ADMIN_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}

export const createCategory = (dto: categoriesApi.CreateCategoryInput) =>
  categoryMutateThunk(() => categoriesApi.createCategory(dto));
export const updateCategory = (id: string, dto: categoriesApi.UpdateCategoryInput) =>
  categoryMutateThunk(() => categoriesApi.updateCategory(id, dto));
export const deleteCategory = (id: string) => categoryMutateThunk(() => categoriesApi.deleteCategory(id));

// ---- Analytics ----

export function fetchAnalyticsOverview(): AdminThunk {
  return async (dispatch) => {
    dispatch({ type: ADMIN_REQUEST });
    try {
      const overview = await adminApi.getAnalyticsOverview();
      dispatch({ type: ADMIN_ANALYTICS_SUCCESS, payload: overview });
    } catch (error) {
      dispatch({ type: ADMIN_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

export function fetchRevenueReport(from?: string, to?: string): AdminThunk {
  return async (dispatch) => {
    dispatch({ type: ADMIN_REQUEST });
    try {
      const report = await adminApi.getRevenueReport(from, to);
      dispatch({ type: ADMIN_REVENUE_SUCCESS, payload: report });
    } catch (error) {
      dispatch({ type: ADMIN_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

// ---- Platform config ----

export function fetchPlatformConfig(): AdminThunk {
  return async (dispatch) => {
    dispatch({ type: ADMIN_REQUEST });
    try {
      const config = await adminApi.getPlatformConfig();
      dispatch({ type: ADMIN_CONFIG_SUCCESS, payload: config });
    } catch (error) {
      dispatch({ type: ADMIN_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

export function updatePlatformConfig(dto: Parameters<typeof adminApi.updatePlatformConfig>[0]): AdminThunk {
  return async (dispatch) => {
    dispatch({ type: ADMIN_MUTATE_REQUEST });
    try {
      const config = await adminApi.updatePlatformConfig(dto);
      dispatch({ type: ADMIN_CONFIG_SUCCESS, payload: config });
    } catch (error) {
      dispatch({ type: ADMIN_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}
