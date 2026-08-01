import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Paper, Stack, Typography } from '@mui/material';
import StatusChip from '@/components/StatusChip';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchMyContracts } from '@/features/contracts/actions';

export default function ContractsListPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { mine, status } = useAppSelector((s) => s.contracts);

  useEffect(() => {
    void dispatch(fetchMyContracts());
  }, [dispatch]);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {t('contracts.title')}
      </Typography>

      {status !== 'loading' && mine.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('contracts.noContracts')}</Typography>
        </Paper>
      )}

      <Stack spacing={1.5}>
        {mine.map((contract) => (
          <Paper
            key={contract.id}
            component={RouterLink}
            to={`/app/contracts/${contract.id}`}
            sx={{
              p: 2.5,
              display: 'block',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'box-shadow 160ms ease',
              '&:hover': { boxShadow: '0 4px 16px rgba(30,20,80,0.08)' },
            }}
          >
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>
                  {contract.type === 'FIXED' ? 'Fixed-price' : 'Hourly'} contract
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {contract.currency}{' '}
                  {contract.type === 'FIXED' ? contract.agreedAmount : `${contract.agreedHourlyRate}/hr`}
                </Typography>
              </Box>
              <StatusChip status={contract.status} />
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
