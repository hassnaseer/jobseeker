import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Typography } from '@mui/material';
import DataTable, { type DataTableColumn } from '@/components/data/DataTable';
import StatusChip from '@/components/StatusChip';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchModerationCatalogs,
  fetchModerationJobs,
  pauseModerationCatalog,
  pauseModerationJob,
} from '@/features/admin/actions';
import type { Job, ProjectCatalog } from '@/types/domain';

export default function AdminModerationPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { moderationJobs, moderationCatalogs, status } = useAppSelector((s) => s.admin);

  useEffect(() => {
    void dispatch(fetchModerationJobs());
    void dispatch(fetchModerationCatalogs());
  }, [dispatch]);

  const jobColumns: DataTableColumn<Job>[] = [
    { key: 'title', header: t('jobs.title'), render: (j) => j.title },
    { key: 'status', header: t('admin.status'), render: (j) => <StatusChip status={j.status} /> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (j) =>
        j.status === 'OPEN' &&
        !j.isPaused && (
          <Button size="small" onClick={() => void dispatch(pauseModerationJob(j.id))}>
            {t('admin.pause')}
          </Button>
        ),
    },
  ];

  const catalogColumns: DataTableColumn<ProjectCatalog>[] = [
    { key: 'title', header: t('catalogs.title'), render: (c) => c.title },
    { key: 'status', header: t('admin.status'), render: (c) => <StatusChip status={c.status} /> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (c) =>
        c.status === 'ACTIVE' && (
          <Button size="small" onClick={() => void dispatch(pauseModerationCatalog(c.id))}>
            {t('admin.pause')}
          </Button>
        ),
    },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {t('admin.moderationTitle')}
      </Typography>

      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
        {t('admin.moderationJobs')}
      </Typography>
      <DataTable
        columns={jobColumns}
        rows={moderationJobs}
        getRowKey={(j) => j.id}
        loading={status === 'loading'}
      />

      <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 4, mb: 1.5 }}>
        {t('admin.moderationCatalogs')}
      </Typography>
      <DataTable
        columns={catalogColumns}
        rows={moderationCatalogs}
        getRowKey={(c) => c.id}
        loading={status === 'loading'}
      />
    </Box>
  );
}
