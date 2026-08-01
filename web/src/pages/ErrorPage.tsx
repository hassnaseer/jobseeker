import { useTranslation } from 'react-i18next';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { Link as RouterLink, useRouteError } from 'react-router-dom';

/** Route-level error page, used as errorElement for React Router routes (distinct from the render-time ErrorBoundary). */
export default function ErrorPage() {
  const { t } = useTranslation();
  const error = useRouteError();
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error && 'statusText' in error
        ? String((error as { statusText?: string }).statusText)
        : t('errors.unexpected');

  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {t('errors.somethingWrong')}
          </Typography>
          <Typography color="text.secondary">{message}</Typography>
          <Button component={RouterLink} to="/" variant="contained">
            {t('errors.backHome')}
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
