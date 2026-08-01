import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { useAppSelector } from '@/app/hooks';
import ClientApplicationsView from './ClientApplicationsView';
import SeekerProposalsView from './SeekerProposalsView';

export default function ApplicationsPage() {
  const { t } = useTranslation();
  const user = useAppSelector((s) => s.auth.user);
  const [searchParams] = useSearchParams();
  const [jobId, setJobId] = useState<string | null>(searchParams.get('jobId'));

  useEffect(() => {
    setJobId(searchParams.get('jobId'));
  }, [searchParams]);

  const isClient = user?.activeRole === 'CLIENT';

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {isClient ? t('applications.overviewTitle') : t('applications.myProposalsTitle')}
      </Typography>
      {isClient ? <ClientApplicationsView jobId={jobId} onSelectJob={setJobId} /> : <SeekerProposalsView />}
    </Box>
  );
}
