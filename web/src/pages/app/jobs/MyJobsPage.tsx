import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Button, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import DataTable, { type DataTableColumn } from '@/components/data/DataTable';
import StatusChip from '@/components/StatusChip';
import ConfirmDialog from '@/components/feedback/ConfirmDialog';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { closeJob, duplicateJob, fetchMyJobs, pauseJob, publishJob, resumeJob } from '@/features/jobs/actions';
import type { Job } from '@/types/domain';

export default function MyJobsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { mine, status } = useAppSelector((s) => s.jobs);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuJob, setMenuJob] = useState<Job | null>(null);
  const [closeTarget, setCloseTarget] = useState<Job | null>(null);

  useEffect(() => {
    void dispatch(fetchMyJobs());
  }, [dispatch]);

  const openMenu = (e: React.MouseEvent<HTMLElement>, job: Job) => {
    setMenuAnchor(e.currentTarget);
    setMenuJob(job);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuJob(null);
  };

  const columns: DataTableColumn<Job>[] = [
    {
      key: 'title',
      header: t('jobs.title'),
      render: (job) => (
        <Typography
          component={RouterLink}
          to={`/app/jobs/${job.id}`}
          sx={{ fontWeight: 600, color: 'text.primary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
        >
          {job.title}
        </Typography>
      ),
    },
    { key: 'status', header: t('jobs.status'), render: (job) => <StatusChip status={job.status} /> },
    {
      key: 'budget',
      header: t('jobs.budget'),
      render: (job) =>
        job.jobType === 'FIXED'
          ? job.budgetAmount != null
            ? `${job.currency} ${job.budgetAmount}`
            : '—'
          : `${job.currency} ${job.hourlyRateMin ?? 0}-${job.hourlyRateMax ?? 0}/hr`,
    },
    { key: 'applicants', header: t('jobs.applicants'), render: (job) => job.applicationsCount },
    {
      key: 'posted',
      header: t('jobs.posted'),
      render: (job) => new Date(job.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (job) => (
        <IconButton size="small" onClick={(e) => openMenu(e, job)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  const runAction = async (action: () => Promise<void>) => {
    closeMenu();
    await action();
    void dispatch(fetchMyJobs());
  };

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {t('jobs.myJobsTitle')}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/app/jobs/new')}>
          {t('jobs.postJob')}
        </Button>
      </Stack>

      <DataTable
        columns={columns}
        rows={mine}
        getRowKey={(job) => job.id}
        loading={status === 'loading'}
        emptyMessage={t('jobs.noJobs')}
      />

      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu}>
        {menuJob && (
          <Stack key={menuJob.id}>
            <MenuItem onClick={() => navigate(`/app/jobs/${menuJob.id}`)}>{t('jobs.view')}</MenuItem>
            <MenuItem onClick={() => navigate(`/app/jobs/${menuJob.id}/edit`)}>{t('jobs.edit')}</MenuItem>
            {menuJob.status === 'DRAFT' && (
              <MenuItem onClick={() => runAction(async () => { await dispatch(publishJob(menuJob.id)); })}>
                {t('jobs.publish')}
              </MenuItem>
            )}
            {menuJob.status === 'OPEN' && !menuJob.isPaused && (
              <MenuItem onClick={() => runAction(async () => { await dispatch(pauseJob(menuJob.id)); })}>
                {t('jobs.pause')}
              </MenuItem>
            )}
            {menuJob.status === 'OPEN' && menuJob.isPaused && (
              <MenuItem onClick={() => runAction(async () => { await dispatch(resumeJob(menuJob.id)); })}>
                {t('jobs.resume')}
              </MenuItem>
            )}
            <MenuItem onClick={() => runAction(async () => { await dispatch(duplicateJob(menuJob.id)); })}>
              {t('jobs.duplicate')}
            </MenuItem>
            {(menuJob.status === 'OPEN' || menuJob.status === 'DRAFT') && (
              <MenuItem
                onClick={() => {
                  setCloseTarget(menuJob);
                  closeMenu();
                }}
              >
                {t('jobs.close')}
              </MenuItem>
            )}
          </Stack>
        )}
      </Menu>

      <ConfirmDialog
        open={!!closeTarget}
        title={t('jobs.closeConfirmTitle')}
        message={t('jobs.closeConfirmBody')}
        confirmLabel={t('jobs.close')}
        destructive
        onClose={() => setCloseTarget(null)}
        onConfirm={async () => {
          if (closeTarget) {
            await dispatch(closeJob(closeTarget.id));
            void dispatch(fetchMyJobs());
          }
          setCloseTarget(null);
        }}
      />
    </Box>
  );
}
