import { useTranslation } from 'react-i18next';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';

const FAQ_KEYS = ['getPaid', 'escrow', 'disputes', 'switchRole'] as const;

export default function SupportPage() {
  const { t } = useTranslation();

  return (
    <Box sx={{ maxWidth: 700 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        {t('support.title')}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {t('support.subtitle')}
      </Typography>

      <Button
        variant="contained"
        startIcon={<EmailOutlinedIcon />}
        href="mailto:support@joblinxs.com"
        sx={{ mb: 3 }}
      >
        {t('support.emailSupport')}
      </Button>

      <Stack spacing={1.5}>
        {FAQ_KEYS.map((key) => (
          <Paper key={key} sx={{ p: 2.5 }}>
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{t(`support.faq.${key}.q`)}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t(`support.faq.${key}.a`)}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
