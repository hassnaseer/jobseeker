import type { Dispatch } from 'redux';
import * as applicationsApi from '@/api/applications';
import type { CreateApplicationInput } from '@/api/applications';
import { extractErrorMessage } from '@/api/client';
import type { Application, ApplicationStatus } from '@/types/domain';
import {
  APPLICATIONS_DETAIL_REQUEST,
  APPLICATIONS_DETAIL_SUCCESS,
  APPLICATIONS_FAILURE,
  APPLICATIONS_FOR_JOB_REQUEST,
  APPLICATIONS_FOR_JOB_SUCCESS,
  APPLICATIONS_MINE_REQUEST,
  APPLICATIONS_MINE_SUCCESS,
  APPLICATIONS_MUTATE_REQUEST,
  APPLICATIONS_MUTATE_SUCCESS,
  type ApplicationsAction,
} from './types';

export type ApplicationsThunk = (dispatch: Dispatch<ApplicationsAction>) => Promise<void>;

export function fetchApplicationsForJob(jobId: string, status?: ApplicationStatus): ApplicationsThunk {
  return async (dispatch) => {
    dispatch({ type: APPLICATIONS_FOR_JOB_REQUEST });
    try {
      const items = await applicationsApi.listApplicationsForJob(jobId, status);
      dispatch({ type: APPLICATIONS_FOR_JOB_SUCCESS, payload: items });
    } catch (error) {
      dispatch({ type: APPLICATIONS_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

export function fetchMyApplications(): ApplicationsThunk {
  return async (dispatch) => {
    dispatch({ type: APPLICATIONS_MINE_REQUEST });
    try {
      const items = await applicationsApi.listMyApplications();
      dispatch({ type: APPLICATIONS_MINE_SUCCESS, payload: items });
    } catch (error) {
      dispatch({ type: APPLICATIONS_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

export function fetchApplicationDetail(id: string): ApplicationsThunk {
  return async (dispatch) => {
    dispatch({ type: APPLICATIONS_DETAIL_REQUEST });
    try {
      const item = await applicationsApi.getApplicationDetail(id);
      dispatch({ type: APPLICATIONS_DETAIL_SUCCESS, payload: item });
    } catch (error) {
      dispatch({ type: APPLICATIONS_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

function mutateThunk(run: () => Promise<Application>): ApplicationsThunk {
  return async (dispatch) => {
    dispatch({ type: APPLICATIONS_MUTATE_REQUEST });
    try {
      const item = await run();
      dispatch({ type: APPLICATIONS_MUTATE_SUCCESS, payload: item });
    } catch (error) {
      dispatch({ type: APPLICATIONS_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}

export const applyToJob = (jobId: string, dto: CreateApplicationInput) =>
  mutateThunk(() => applicationsApi.applyToJob(jobId, dto));
export const shortlistApplication = (id: string) => mutateThunk(() => applicationsApi.shortlistApplication(id));
export const acceptApplication = (id: string) => mutateThunk(() => applicationsApi.acceptApplication(id));
export const rejectApplication = (id: string) => mutateThunk(() => applicationsApi.rejectApplication(id));
export const withdrawApplication = (id: string) => mutateThunk(() => applicationsApi.withdrawApplication(id));
