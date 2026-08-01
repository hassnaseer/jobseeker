import { useTranslation } from 'react-i18next';
import { Box, Paper, Typography } from '@mui/material';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import type { SvgIconComponent } from '@mui/icons-material';

const FEATURES: Array<{ icon: SvgIconComponent; titleKey: string; bodyKey: string }> = [
  { icon: ShieldOutlinedIcon, titleKey: 'landing.features.escrowTitle', bodyKey: 'landing.features.escrowBody' },
  { icon: AutoAwesomeOutlinedIcon, titleKey: 'landing.features.aiTitle', bodyKey: 'landing.features.aiBody' },
  { icon: VerifiedUserOutlinedIcon, titleKey: 'landing.features.verifiedTitle', bodyKey: 'landing.features.verifiedBody' },
  { icon: ChatBubbleOutlineOutlinedIcon, titleKey: 'landing.features.chatTitle', bodyKey: 'landing.features.chatBody' },
  { icon: AccountBalanceWalletOutlinedIcon, titleKey: 'landing.features.walletTitle', bodyKey: 'landing.features.walletBody' },
  { icon: GavelOutlinedIcon, titleKey: 'landing.features.disputeTitle', bodyKey: 'landing.features.disputeBody' },
];

export default function FeaturesSection() {
  const { t } = useTranslation();
  return (
    <Box sx={{ bgcolor: 'background.paper', py: 10 }}>
      <Box sx={{ maxWidth: 1160, mx: 'auto', px: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, textAlign: 'center', mb: 1 }}>
          {t('landing.features.title')}
        </Typography>
        <Typography color="text.secondary" sx={{ textAlign: 'center', mb: 5 }}>
          {t('landing.features.subtitle')}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
            gap: 2.5,
          }}
        >
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Paper key={f.titleKey} sx={{ p: 3 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    bgcolor: 'rgba(91,95,239,0.08)',
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <Icon fontSize="small" />
                </Box>
                <Typography sx={{ fontWeight: 700, mb: 0.75 }}>{t(f.titleKey)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t(f.bodyKey)}
                </Typography>
              </Paper>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
