import type { MyProfile, RoleProfileStatusInfo } from '@/types/profile';
import type { ReviewableRole } from '@/api/profiles';

export interface ProfileState {
  role: ReviewableRole | null;
  data: MyProfile | null;
  status: 'idle' | 'loading' | 'saving' | 'ready' | 'error';
  error: string | null;
}

export const PROFILE_FETCH_REQUEST = 'profile/FETCH_REQUEST';
export const PROFILE_FETCH_SUCCESS = 'profile/FETCH_SUCCESS';
export const PROFILE_FETCH_FAILURE = 'profile/FETCH_FAILURE';
export const PROFILE_SAVE_REQUEST = 'profile/SAVE_REQUEST';
export const PROFILE_SAVE_SUCCESS = 'profile/SAVE_SUCCESS';
export const PROFILE_SAVE_FAILURE = 'profile/SAVE_FAILURE';
export const PROFILE_RESET = 'profile/RESET';

interface ProfileFetchRequestAction {
  type: typeof PROFILE_FETCH_REQUEST;
  role: ReviewableRole;
}
interface ProfileFetchSuccessAction {
  type: typeof PROFILE_FETCH_SUCCESS;
  payload: MyProfile;
}
interface ProfileFetchFailureAction {
  type: typeof PROFILE_FETCH_FAILURE;
  payload: string;
}
interface ProfileSaveRequestAction {
  type: typeof PROFILE_SAVE_REQUEST;
}
interface ProfileSaveSuccessAction {
  type: typeof PROFILE_SAVE_SUCCESS;
  payload: Partial<MyProfile> & { roleStatus?: RoleProfileStatusInfo };
}
interface ProfileSaveFailureAction {
  type: typeof PROFILE_SAVE_FAILURE;
  payload: string;
}
interface ProfileResetAction {
  type: typeof PROFILE_RESET;
}

export type ProfileAction =
  | ProfileFetchRequestAction
  | ProfileFetchSuccessAction
  | ProfileFetchFailureAction
  | ProfileSaveRequestAction
  | ProfileSaveSuccessAction
  | ProfileSaveFailureAction
  | ProfileResetAction;
