import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const NAV_ANCHORS = [
  { href: '#how-it-works', labelKey: 'landing.nav.howItWorks' },
  { href: '#categories', labelKey: 'landing.nav.categories' },
  { href: '#jobs', labelKey: 'landing.nav.findWork' },
];

export default function NavBar() {
  const { t } = useTranslation();
  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        bgcolor: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: 1160,
          mx: 'auto',
          px: 3,
          py: 1.75,
        }}
      >
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '9px',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 900,
              fontSize: 16,
            }}
          >
            J
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>
            {t('common.appName')}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={3} sx={{ alignItems: 'center', display: { xs: 'none', md: 'flex' } }}>
          {NAV_ANCHORS.map((item) => (
            <Typography
              key={item.href}
              component="a"
              href={item.href}
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: 'text.secondary',
                textDecoration: 'none',
                '&:hover': { color: 'text.primary' },
              }}
            >
              {t(item.labelKey)}
            </Typography>
          ))}
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <LanguageSwitcher />
          <Button component={RouterLink} to="/login" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
            {t('landing.signIn')}
          </Button>
          <Button component={RouterLink} to="/signup" variant="contained">
            {t('landing.getStarted')}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
