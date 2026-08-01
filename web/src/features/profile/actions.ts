import type { Dispatch } from 'redux';
import {
  getMyProfile,
  submitForReview,
  upsertClientProfile,
  upsertKyc,
  upsertSeekerProfile,
  updateBasicInfo,
  type ReviewableRole,
  type SubmitKycInput,
  type UpdateBasicInfoInput,
  type UpdateClientProfileInput,
  type UpdateSeekerProfileInput,
} from '@/api/profiles';
import { extractErrorMessage } from '@/api/client';
import {
  PROFILE_FETCH_FAILURE,
  PROFILE_FETCH_REQUEST,
  PROFILE_FETCH_SUCCESS,
  PROFILE_SAVE_FAILURE,
  PROFILE_SAVE_REQUEST,
  PROFILE_SAVE_SUCCESS,
  type ProfileAction,
} from './types';

export type ProfileThunk = (dispatch: Dispatch<ProfileAction>) => Promise<void>;

export function fetchMyProfile(role: ReviewableRole): ProfileThunk {
  return async (dispatch) => {
    dispatch({ type: PROFILE_FETCH_REQUEST, role });
    try {
      const data = await getMyProfile(role);
      dispatch({ type: PROFILE_FETCH_SUCCESS, payload: data });
    } catch (error) {
      dispatch({ type: PROFILE_FETCH_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

export function saveBasicInfo(dto: UpdateBasicInfoInput): ProfileThunk {
  return async (dispatch) => {
    dispatch({ type: PROFILE_SAVE_REQUEST });
    try {
      const basic = await updateBasicInfo(dto);
      dispatch({ type: PROFILE_SAVE_SUCCESS, payload: { basic } });
    } catch (error) {
      dispatch({ type: PROFILE_SAVE_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}

export function saveKyc(dto: SubmitKycInput): ProfileThunk {
  return async (dispatch) => {
    dispatch({ type: PROFILE_SAVE_REQUEST });
    try {
      const identity = await upsertKyc(dto);
      dispatch({ type: PROFILE_SAVE_SUCCESS, payload: { identity } });
    } catch (error) {
      dispatch({ type: PROFILE_SAVE_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}

export function saveClientProfile(dto: UpdateClientProfileInput): ProfileThunk {
  return async (dispatch) => {
    dispatch({ type: PROFILE_SAVE_REQUEST });
    try {
      const roleProfile = await upsertClientProfile(dto);
      dispatch({ type: PROFILE_SAVE_SUCCESS, payload: { roleProfile } });
    } catch (error) {
      dispatch({ type: PROFILE_SAVE_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}

export function saveSeekerProfile(dto: UpdateSeekerProfileInput): ProfileThunk {
  return async (dispatch) => {
    dispatch({ type: PROFILE_SAVE_REQUEST });
    try {
      const roleProfile = await upsertSeekerProfile(dto);
      dispatch({ type: PROFILE_SAVE_SUCCESS, payload: { roleProfile } });
    } catch (error) {
      dispatch({ type: PROFILE_SAVE_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}

export function submitProfileForReview(role: ReviewableRole): ProfileThunk {
  return async (dispatch) => {
    dispatch({ type: PROFILE_SAVE_REQUEST });
    try {
      const roleStatus = await submitForReview(role);
      dispatch({ type: PROFILE_SAVE_SUCCESS, payload: { roleStatus } });
    } catch (error) {
      dispatch({ type: PROFILE_SAVE_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}
