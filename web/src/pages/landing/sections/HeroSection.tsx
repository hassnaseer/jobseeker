import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Fade, Stack, Typography } from '@mui/material';

export default function HeroSection() {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg,#F6F6FB 0%,#EEEDF9 100%)',
        p: 3,
      }}
    >
      <Fade in timeout={320}>
        <Stack spacing={3} sx={{ alignItems: 'center', textAlign: 'center', maxWidth: 560 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '14px',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 900,
              fontSize: 24,
            }}
          >
            J
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>
            {t('common.appName')}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
            {t('landing.tagline')}
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button component={RouterLink} to="/signup" variant="contained" size="large">
              {t('landing.getStarted')}
            </Button>
            <Button component={RouterLink} to="/login" variant="outlined" size="large">
              {t('landing.signIn')}
            </Button>
          </Stack>
        </Stack>
      </Fade>
    </Box>
  );
}
