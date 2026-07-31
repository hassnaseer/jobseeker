import { DISMISS_SNACKBAR, SHOW_SNACKBAR, type UiAction, type UiState } from './types';

const initialState: UiState = { snackbars: [] };

export function uiReducer(state = initialState, action: UiAction): UiState {
  switch (action.type) {
    case SHOW_SNACKBAR:
      return { snackbars: [...state.snackbars, action.payload] };
    case DISMISS_SNACKBAR:
      return { snackbars: state.snackbars.filter((s) => s.id !== action.payload) };
    default:
      return state;
  }
}
