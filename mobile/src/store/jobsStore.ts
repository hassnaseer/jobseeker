import { create } from 'zustand';
import {
  closeJob as apiCloseJob,
  createJob as apiCreateJob,
  duplicateJob as apiDuplicateJob,
  getJobDetail,
  listMyJobs,
  listPublicJobs,
  pauseJob as apiPauseJob,
  publishJob as apiPublishJob,
  resumeJob as apiResumeJob,
  updateJob as apiUpdateJob,
  type CreateJobInput,
  type PaginatedJobs,
  type QueryJobsParams,
  type UpdateJobInput,
} from '@/api/jobs';
import { extractErrorMessage } from '@/api/client';
import type { Job } from '@/types/domain';

interface JobsState {
  list: Job[];
  listMeta: { total: number; page: number; limit: number };
  mine: Job[];
  detail: Job | null;
  status: 'idle' | 'loading' | 'saving' | 'ready' | 'error';
  error: string | null;

  fetchList: (params: QueryJobsParams) => Promise<PaginatedJobs>;
  fetchMine: () => Promise<void>;
  fetchDetail: (id: string) => Promise<Job>;
  create: (dto: CreateJobInput) => Promise<Job>;
  update: (id: string, dto: UpdateJobInput) => Promise<Job>;
  publish: (id: string) => Promise<Job>;
  pause: (id: string) => Promise<Job>;
  resume: (id: string) => Promise<Job>;
  close: (id: string) => Promise<Job>;
  duplicate: (id: string) => Promise<Job>;
  clearDetail: () => void;
}

function upsertMine(mine: Job[], job: Job): Job[] {
  const idx = mine.findIndex((j) => j.id === job.id);
  if (idx === -1) return [job, ...mine];
  const next = [...mine];
  next[idx] = job;
  return next;
}

export const useJobsStore = create<JobsState>((set, get) => ({
  list: [],
  listMeta: { total: 0, page: 1, limit: 20 },
  mine: [],
  detail: null,
  status: 'idle',
  error: null,

  fetchList: async (params) => {
    set({ status: 'loading', error: null });
    try {
      const data = await listPublicJobs(params);
      const isFirstPage = !params.page || params.page === 1;
      set({
        list: isFirstPage ? data.items : [...get().list, ...data.items],
        listMeta: { total: data.total, page: data.page, limit: data.limit },
        status: 'ready',
      });
      return data;
    } catch (error) {
      set({ status: 'error', error: extractErrorMessage(error) });
      throw error;
    }
  },

  fetchMine: async () => {
    set({ status: 'loading', error: null });
    try {
      const mine = await listMyJobs();
      set({ mine, status: 'ready' });
    } catch (error) {
      set({ status: 'error', error: extractErrorMessage(error) });
      throw error;
    }
  },

  fetchDetail: async (id) => {
    set({ status: 'loading', error: null });
    try {
      const detail = await getJobDetail(id);
      set({ detail, status: 'ready' });
      return detail;
    } catch (error) {
      set({ status: 'error', error: extractErrorMessage(error) });
      throw error;
    }
  },

  create: async (dto) => {
    set({ status: 'saving', error: null });
    try {
      const job = await apiCreateJob(dto);
      set({ mine: upsertMine(get().mine, job), status: 'ready' });
      return job;
    } catch (error) {
      set({ status: 'error', error: extractErrorMessage(error) });
      throw error;
    }
  },

  update: async (id, dto) => {
    set({ status: 'saving', error: null });
    try {
      const job = await apiUpdateJob(id, dto);
      set({ mine: upsertMine(get().mine, job), detail: job, status: 'ready' });
      return job;
    } catch (error) {
      set({ status: 'error', error: extractErrorMessage(error) });
      throw error;
    }
  },

  publish: async (id) => mutateJobAction(set, get, () => apiPublishJob(id)),
  pause: async (id) => mutateJobAction(set, get, () => apiPauseJob(id)),
  resume: async (id) => mutateJobAction(set, get, () => apiResumeJob(id)),
  close: async (id) => mutateJobAction(set, get, () => apiCloseJob(id)),
  duplicate: async (id) => mutateJobAction(set, get, () => apiDuplicateJob(id)),

  clearDetail: () => set({ detail: null }),
}));

async function mutateJobAction(
  set: (partial: Partial<JobsState>) => void,
  get: () => JobsState,
  action: () => Promise<Job>,
): Promise<Job> {
  set({ status: 'saving', error: null });
  try {
    const job = await action();
    set({
      mine: upsertMine(get().mine, job),
      detail: get().detail?.id === job.id ? job : get().detail,
      status: 'ready',
    });
    return job;
  } catch (error) {
    set({ status: 'error', error: extractErrorMessage(error) });
    throw error;
  }
}
