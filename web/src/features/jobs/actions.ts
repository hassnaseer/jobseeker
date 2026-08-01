import type { Dispatch } from 'redux';
import * as jobsApi from '@/api/jobs';
import type { QueryJobsParams, CreateJobInput, UpdateJobInput } from '@/api/jobs';
import { extractErrorMessage } from '@/api/client';
import {
  JOBS_DETAIL_REQUEST,
  JOBS_DETAIL_SUCCESS,
  JOBS_FAILURE,
  JOBS_LIST_REQUEST,
  JOBS_LIST_SUCCESS,
  JOBS_MINE_REQUEST,
  JOBS_MINE_SUCCESS,
  JOBS_MUTATE_REQUEST,
  JOBS_MUTATE_SUCCESS,
  type JobsAction,
} from './types';

export type JobsThunk = (dispatch: Dispatch<JobsAction>) => Promise<void>;

export function fetchPublicJobs(params: QueryJobsParams = {}): JobsThunk {
  return async (dispatch) => {
    dispatch({ type: JOBS_LIST_REQUEST });
    try {
      const { items } = await jobsApi.listPublicJobs(params);
      dispatch({ type: JOBS_LIST_SUCCESS, payload: items });
    } catch (error) {
      dispatch({ type: JOBS_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

export function fetchMyJobs(): JobsThunk {
  return async (dispatch) => {
    dispatch({ type: JOBS_MINE_REQUEST });
    try {
      const jobs = await jobsApi.listMyJobs();
      dispatch({ type: JOBS_MINE_SUCCESS, payload: jobs });
    } catch (error) {
      dispatch({ type: JOBS_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

export function fetchJobDetail(id: string): JobsThunk {
  return async (dispatch) => {
    dispatch({ type: JOBS_DETAIL_REQUEST });
    try {
      const job = await jobsApi.getJobDetail(id);
      dispatch({ type: JOBS_DETAIL_SUCCESS, payload: job });
    } catch (error) {
      dispatch({ type: JOBS_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

function mutateThunk(run: () => Promise<import('@/types/domain').Job>): JobsThunk {
  return async (dispatch) => {
    dispatch({ type: JOBS_MUTATE_REQUEST });
    try {
      const job = await run();
      dispatch({ type: JOBS_MUTATE_SUCCESS, payload: job });
    } catch (error) {
      dispatch({ type: JOBS_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}

export const createJob = (dto: CreateJobInput) => mutateThunk(() => jobsApi.createJob(dto));
export const updateJob = (id: string, dto: UpdateJobInput) =>
  mutateThunk(() => jobsApi.updateJob(id, dto));
export const publishJob = (id: string) => mutateThunk(() => jobsApi.publishJob(id));
export const pauseJob = (id: string) => mutateThunk(() => jobsApi.pauseJob(id));
export const resumeJob = (id: string) => mutateThunk(() => jobsApi.resumeJob(id));
export const closeJob = (id: string) => mutateThunk(() => jobsApi.closeJob(id));
export const duplicateJob = (id: string) => mutateThunk(() => jobsApi.duplicateJob(id));
