import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button, Grid, Stack, Typography } from '@mui/material';
import FormTextField from '@/components/form/FormTextField';
import FormSelectField from '@/components/form/FormSelectField';
import ChipListInput from '@/components/form/ChipListInput';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { createJob, fetchJobDetail, publishJob, updateJob } from '@/features/jobs/actions';
import { getCategoryTree, flattenCategoryTree } from '@/api/categories';
import { extractErrorMessage } from '@/api/client';
import type { CreateJobInput } from '@/api/jobs';

const emptyForm: CreateJobInput = {
  title: '',
  description: '',
  categoryId: '',
  skillsRequired: [],
  jobType: 'FIXED',
  pricingModel: 'LUMP',
  trackingMode: undefined,
  locationType: 'REMOTE',
  address: '',
  currency: 'USD',
  numberOfOpenings: 1,
};

export default function JobFormPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const existing = useAppSelector((s) => s.jobs.detail);

  const [categories, setCategories] = useState<{ id: string; label: string }[]>([]);
  const [form, setForm] = useState<CreateJobInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategoryTree()
      .then((tree) => setCategories(flattenCategoryTree(tree)))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (id) void dispatch(fetchJobDetail(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (isEdit && existing && existing.id === id) {
      setForm({
        title: existing.title,
        description: existing.description,
        categoryId: existing.categoryId,
        skillsRequired: existing.skillsRequired,
        jobType: existing.jobType,
        pricingModel: existing.pricingModel ?? undefined,
        trackingMode: existing.trackingMode ?? undefined,
        locationType: existing.locationType,
        address: existing.address ?? '',
        budgetAmount: existing.budgetAmount ?? undefined,
        currency: existing.currency,
        hourlyRateMin: existing.hourlyRateMin ?? undefined,
        hourlyRateMax: existing.hourlyRateMax ?? undefined,
        estimatedHours: existing.estimatedHours ?? undefined,
        duration: existing.duration ?? undefined,
        experienceLevel: existing.experienceLevel ?? undefined,
        numberOfOpenings: existing.numberOfOpenings,
        deadline: existing.deadline ?? undefined,
        checkinRequired: existing.checkinRequired,
      });
    }
  }, [isEdit, existing, id]);

  const set = <K extends keyof CreateJobInput>(key: K) => (value: CreateJobInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const jobTypeOptions = [
    { value: 'FIXED', label: t('jobs.jobTypeFixed') },
    { value: 'HOURLY', label: t('jobs.jobTypeHourly') },
  ];
  const pricingModelOptions = [
    { value: 'LUMP', label: t('jobs.pricingModelLump') },
    { value: 'MILESTONE', label: t('jobs.pricingModelMilestone') },
  ];
  const trackingModeOptions = [
    { value: 'MANUAL', label: t('jobs.trackingManual') },
    { value: 'TIMER', label: t('jobs.trackingTimer') },
    { value: 'TIMER_WITH_SCREENSHOTS', label: t('jobs.trackingTimerScreenshots') },
  ];
  const locationOptions = [
    { value: 'REMOTE', label: t('jobs.locationRemote') },
    { value: 'PHYSICAL', label: t('jobs.locationPhysical') },
  ];
  const durationOptions = [
    { value: 'LESS_THAN_1_MONTH', label: t('jobs.durationLt1') },
    { value: 'ONE_TO_THREE_MONTHS', label: t('jobs.duration1to3') },
    { value: 'THREE_TO_SIX_MONTHS', label: t('jobs.duration3to6') },
    { value: 'MORE_THAN_SIX_MONTHS', label: t('jobs.durationGt6') },
  ];
  const experienceOptions = [
    { value: 'ENTRY', label: t('profile.experienceEntry') },
    { value: 'INTERMEDIATE', label: t('profile.experienceIntermediate') },
    { value: 'EXPERT', label: t('profile.experienceExpert') },
  ];
  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.label }));

  const handleSave = async (publish: boolean) => {
    setSaving(true);
    setError(null);
    try {
      const dto: CreateJobInput = { ...form, publish };
      if (isEdit && id) {
        await dispatch(updateJob(id, dto));
        if (publish) {
          await dispatch(publishJob(id));
        }
        navigate(`/app/jobs/${id}`);
      } else {
        await dispatch(createJob(dto));
        navigate('/app/jobs');
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {isEdit ? t('jobs.editJobTitle') : t('jobs.newJobTitle')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid size={12}>
          <FormTextField label={t('jobs.title')} value={form.title} onChange={set('title')} required />
        </Grid>
        <Grid size={12}>
          <FormTextField
            label={t('jobs.description')}
            value={form.description}
            onChange={set('description')}
            required
            multiline
            minRows={4}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelectField
            label={t('jobs.category')}
            value={form.categoryId}
            onChange={set('categoryId')}
            options={categoryOptions}
            allowEmpty={false}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelectField
            label={t('jobs.experienceLevel')}
            value={form.experienceLevel ?? ''}
            onChange={(v) => set('experienceLevel')(v || undefined)}
            options={experienceOptions}
          />
        </Grid>
        <Grid size={12}>
          <ChipListInput
            label={t('jobs.skillsRequired')}
            value={form.skillsRequired ?? []}
            onChange={set('skillsRequired')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelectField
            label={t('jobs.jobType')}
            value={form.jobType}
            onChange={set('jobType')}
            options={jobTypeOptions}
            allowEmpty={false}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelectField
            label={t('jobs.locationType')}
            value={form.locationType}
            onChange={set('locationType')}
            options={locationOptions}
            allowEmpty={false}
          />
        </Grid>

        {form.jobType === 'FIXED' && (
          <>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormSelectField
                label={t('jobs.pricingModel')}
                value={form.pricingModel ?? 'LUMP'}
                onChange={set('pricingModel')}
                options={pricingModelOptions}
                allowEmpty={false}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField
                label={t('jobs.budgetAmount')}
                type="number"
                value={form.budgetAmount ?? ''}
                onChange={(v) => set('budgetAmount')(v ? Number(v) : undefined)}
              />
            </Grid>
          </>
        )}

        {form.jobType === 'HOURLY' && (
          <>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormSelectField
                label={t('jobs.trackingMode')}
                value={form.trackingMode ?? ''}
                onChange={set('trackingMode')}
                options={trackingModeOptions}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <FormTextField
                label={t('jobs.hourlyRateMin')}
                type="number"
                value={form.hourlyRateMin ?? ''}
                onChange={(v) => set('hourlyRateMin')(v ? Number(v) : undefined)}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <FormTextField
                label={t('jobs.hourlyRateMax')}
                type="number"
                value={form.hourlyRateMax ?? ''}
                onChange={(v) => set('hourlyRateMax')(v ? Number(v) : undefined)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField
                label={t('jobs.estimatedHours')}
                type="number"
                value={form.estimatedHours ?? ''}
                onChange={(v) => set('estimatedHours')(v ? Number(v) : undefined)}
              />
            </Grid>
          </>
        )}

        {form.locationType === 'PHYSICAL' && (
          <Grid size={12}>
            <FormTextField label={t('jobs.address')} value={form.address ?? ''} onChange={set('address')} />
          </Grid>
        )}

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelectField
            label={t('jobs.duration')}
            value={form.duration ?? ''}
            onChange={set('duration')}
            options={durationOptions}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <FormTextField
            label={t('jobs.numberOfOpenings')}
            type="number"
            value={form.numberOfOpenings ?? 1}
            onChange={(v) => set('numberOfOpenings')(Number(v))}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <FormTextField
            label={t('jobs.deadline')}
            type="date"
            value={form.deadline ?? ''}
            onChange={set('deadline')}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
      </Grid>

      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button variant="outlined" onClick={() => handleSave(false)} disabled={saving}>
          {t('jobs.saveDraft')}
        </Button>
        <Button variant="contained" onClick={() => handleSave(true)} disabled={saving}>
          {t('jobs.saveAndPublish')}
        </Button>
      </Stack>
    </Box>
  );
}
