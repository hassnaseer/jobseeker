export interface SnackbarMessage {
  id: number;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

export interface UiState {
  snackbars: SnackbarMessage[];
}

export const SHOW_SNACKBAR = 'ui/SHOW_SNACKBAR';
export const DISMISS_SNACKBAR = 'ui/DISMISS_SNACKBAR';

interface ShowSnackbarAction {
  type: typeof SHOW_SNACKBAR;
  payload: SnackbarMessage;
}
interface DismissSnackbarAction {
  type: typeof DISMISS_SNACKBAR;
  payload: number;
}

export type UiAction = ShowSnackbarAction | DismissSnackbarAction;
