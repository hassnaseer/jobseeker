import { Alert, Snackbar, Stack } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { dismissSnackbar } from '@/features/ui/actions';

export default function GlobalSnackbar() {
  const snackbars = useAppSelector((s) => s.ui.snackbars);
  const dispatch = useAppDispatch();

  return (
    <Stack sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2000 }} spacing={1}>
      {snackbars.map((s) => (
        <Snackbar key={s.id} open sx={{ position: 'static' }}>
          <Alert severity={s.severity} onClose={() => dispatch(dismissSnackbar(s.id))} variant="filled">
            {s.message}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  );
}
