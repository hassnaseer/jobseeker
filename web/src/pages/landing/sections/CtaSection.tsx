import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';

export default function CtaSection() {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg,#5B5FEF 0%,#4347C4 100%)',
        py: 8,
      }}
    >
      <Stack spacing={2.5} sx={{ alignItems: 'center', textAlign: 'center', maxWidth: 640, mx: 'auto', px: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff' }}>
          {t('landing.cta.title')}
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.85)' }}>{t('landing.cta.body')}</Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
          <Button
            component={RouterLink}
            to="/signup"
            variant="contained"
            size="large"
            sx={{ bgcolor: '#fff', color: 'primary.main', '&:hover': { bgcolor: '#F0F0FA' } }}
          >
            {t('landing.getStarted')}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
