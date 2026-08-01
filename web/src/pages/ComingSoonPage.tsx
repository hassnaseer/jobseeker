import { useTranslation } from 'react-i18next';
import { Box, Fade, Paper, Typography } from '@mui/material';
import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined';

interface Props {
  title: string;
}

export default function ComingSoonPage({ title }: Props) {
  const { t } = useTranslation();
  return (
    <Fade in timeout={220}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          {title}
        </Typography>
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <ConstructionOutlinedIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1.5 }} />
          <Typography color="text.secondary">{t('comingSoon.body')}</Typography>
        </Paper>
      </Box>
    </Fade>
  );
}
