import { useTranslation } from 'react-i18next';
import { Box, Paper, Stack, Typography } from '@mui/material';
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import type { SvgIconComponent } from '@mui/icons-material';

interface Step {
  icon: SvgIconComponent;
  titleKey: string;
  bodyKey: string;
}

const CLIENT_STEPS: Step[] = [
  { icon: PostAddOutlinedIcon, titleKey: 'landing.howItWorks.client1Title', bodyKey: 'landing.howItWorks.client1Body' },
  { icon: PeopleAltOutlinedIcon, titleKey: 'landing.howItWorks.client2Title', bodyKey: 'landing.howItWorks.client2Body' },
  { icon: VerifiedOutlinedIcon, titleKey: 'landing.howItWorks.client3Title', bodyKey: 'landing.howItWorks.client3Body' },
];

const SEEKER_STEPS: Step[] = [
  { icon: SearchOutlinedIcon, titleKey: 'landing.howItWorks.seeker1Title', bodyKey: 'landing.howItWorks.seeker1Body' },
  { icon: DescriptionOutlinedIcon, titleKey: 'landing.howItWorks.seeker2Title', bodyKey: 'landing.howItWorks.seeker2Body' },
  { icon: PaidOutlinedIcon, titleKey: 'landing.howItWorks.seeker3Title', bodyKey: 'landing.howItWorks.seeker3Body' },
];

function StepColumn({ heading, steps }: { heading: string; steps: Step[] }) {
  return (
    <Box sx={{ flex: 1, minWidth: 280 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>
        {heading}
      </Typography>
      <Stack spacing={2}>
        {steps.map((step, i) => (
          <StepCard key={i} step={step} index={i + 1} />
        ))}
      </Stack>
    </Box>
  );
}

function StepCard({ step, index }: { step: Step; index: number }) {
  const { t } = useTranslation();
  const Icon = step.icon;
  return (
    <Paper sx={{ p: 2.5, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          flexShrink: 0,
          borderRadius: '10px',
          bgcolor: 'rgba(91,95,239,0.08)',
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon fontSize="small" />
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 700, mb: 0.25 }}>
          {index}. {t(step.titleKey)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t(step.bodyKey)}
        </Typography>
      </Box>
    </Paper>
  );
}

export default function HowItWorksSection() {
  const { t } = useTranslation();
  return (
    <Box id="how-it-works" sx={{ maxWidth: 1160, mx: 'auto', px: 3, py: 10 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, textAlign: 'center', mb: 1 }}>
        {t('landing.howItWorks.title')}
      </Typography>
      <Typography color="text.secondary" sx={{ textAlign: 'center', mb: 5 }}>
        {t('landing.howItWorks.subtitle')}
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
        <StepColumn heading={t('landing.howItWorks.forClients')} steps={CLIENT_STEPS} />
        <StepColumn heading={t('landing.howItWorks.forTalent')} steps={SEEKER_STEPS} />
      </Stack>
    </Box>
  );
}
