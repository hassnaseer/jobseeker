import type { AdminTeamMember } from '@/types/admin';

export interface AdminTeamState {
  members: AdminTeamMember[];
  status: 'idle' | 'loading' | 'saving' | 'ready' | 'error';
  error: string | null;
}

export const ADMIN_TEAM_REQUEST = 'adminTeam/REQUEST';
export const ADMIN_TEAM_MUTATE_REQUEST = 'adminTeam/MUTATE_REQUEST';
export const ADMIN_TEAM_LIST_SUCCESS = 'adminTeam/LIST_SUCCESS';
export const ADMIN_TEAM_FAILURE = 'adminTeam/FAILURE';

interface RequestAction {
  type: typeof ADMIN_TEAM_REQUEST;
}
interface MutateRequestAction {
  type: typeof ADMIN_TEAM_MUTATE_REQUEST;
}
interface ListSuccessAction {
  type: typeof ADMIN_TEAM_LIST_SUCCESS;
  payload: AdminTeamMember[];
}
interface FailureAction {
  type: typeof ADMIN_TEAM_FAILURE;
  payload: string;
}

export type AdminTeamAction = RequestAction | MutateRequestAction | ListSuccessAction | FailureAction;
