import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Stack, Typography } from '@mui/material';

export default function FooterSection() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  return (
    <Box component="footer" sx={{ borderTop: '1px solid', borderColor: 'divider', py: 4 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ maxWidth: 1160, mx: 'auto', px: 3, alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '7px',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 900,
              fontSize: 12,
            }}
          >
            J
          </Box>
          <Typography variant="body2" color="text.secondary">
            © {year} {t('common.appName')}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={3}>
          <Typography
            component={RouterLink}
            to="/login"
            variant="body2"
            sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'text.primary' } }}
          >
            {t('landing.signIn')}
          </Typography>
          <Typography
            component={RouterLink}
            to="/signup"
            variant="body2"
            sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'text.primary' } }}
          >
            {t('landing.getStarted')}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
