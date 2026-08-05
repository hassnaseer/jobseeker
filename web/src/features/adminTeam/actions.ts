import type { Dispatch } from 'redux';
import * as adminTeamApi from '@/api/adminTeam';
import { extractErrorMessage } from '@/api/client';
import type { AdminPermission } from '@/types/admin';
import {
  ADMIN_TEAM_FAILURE,
  ADMIN_TEAM_LIST_SUCCESS,
  ADMIN_TEAM_MUTATE_REQUEST,
  ADMIN_TEAM_REQUEST,
  type AdminTeamAction,
} from './types';

export type AdminTeamThunk = (dispatch: Dispatch<AdminTeamAction>) => Promise<void>;

export function fetchTeamMembers(): AdminTeamThunk {
  return async (dispatch) => {
    dispatch({ type: ADMIN_TEAM_REQUEST });
    try {
      const members = await adminTeamApi.listTeamMembers();
      dispatch({ type: ADMIN_TEAM_LIST_SUCCESS, payload: members });
    } catch (error) {
      dispatch({ type: ADMIN_TEAM_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

async function refetchAfterMutation(dispatch: Dispatch<AdminTeamAction>): Promise<void> {
  try {
    const members = await adminTeamApi.listTeamMembers();
    dispatch({ type: ADMIN_TEAM_LIST_SUCCESS, payload: members });
  } catch (error) {
    dispatch({ type: ADMIN_TEAM_FAILURE, payload: extractErrorMessage(error) });
  }
}

export function inviteTeamMember(dto: { name: string; email: string; permissions: AdminPermission[] }): AdminTeamThunk {
  return async (dispatch) => {
    dispatch({ type: ADMIN_TEAM_MUTATE_REQUEST });
    try {
      await adminTeamApi.inviteTeamMember(dto);
      await refetchAfterMutation(dispatch);
    } catch (error) {
      dispatch({ type: ADMIN_TEAM_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}

export function updateTeamMemberPermissions(id: string, permissions: AdminPermission[]): AdminTeamThunk {
  return async (dispatch) => {
    dispatch({ type: ADMIN_TEAM_MUTATE_REQUEST });
    try {
      await adminTeamApi.updateTeamMemberPermissions(id, permissions);
      await refetchAfterMutation(dispatch);
    } catch (error) {
      dispatch({ type: ADMIN_TEAM_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}

export function removeTeamMember(id: string): AdminTeamThunk {
  return async (dispatch) => {
    dispatch({ type: ADMIN_TEAM_MUTATE_REQUEST });
    try {
      await adminTeamApi.removeTeamMember(id);
      await refetchAfterMutation(dispatch);
    } catch (error) {
      dispatch({ type: ADMIN_TEAM_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}
