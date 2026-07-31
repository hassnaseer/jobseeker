import { DISMISS_SNACKBAR, SHOW_SNACKBAR, type SnackbarMessage, type UiAction } from './types';

let nextId = 1;

export function showSnackbar(
  message: string,
  severity: SnackbarMessage['severity'] = 'info',
): UiAction {
  return { type: SHOW_SNACKBAR, payload: { id: nextId++, message, severity } };
}

export function dismissSnackbar(id: number): UiAction {
  return { type: DISMISS_SNACKBAR, payload: id };
}
