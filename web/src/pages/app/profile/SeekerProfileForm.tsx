import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Button, Divider, Grid, IconButton, Paper, Stack, Typography } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AddIcon from '@mui/icons-material/Add';
import ChipListInput from '@/components/form/ChipListInput';
import FormTextField from '@/components/form/FormTextField';
import FormSelectField from '@/components/form/FormSelectField';
import { useAppDispatch } from '@/app/hooks';
import { saveSeekerProfile } from '@/features/profile/actions';
import { extractErrorMessage } from '@/api/client';
import type { UpdateSeekerProfileInput } from '@/api/profiles';
import type {
  CertificationItem,
  EducationItem,
  PortfolioItem,
  SeekerProfile,
  WorkHistoryItem,
} from '@/types/profile';

interface Props {
  initial: SeekerProfile | null;
  onSaved?: () => void;
}

export default function SeekerProfileForm({ initial, onSaved }: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [title, setTitle] = useState(initial?.title ?? '');
  const [bio, setBio] = useState(initial?.bio ?? '');
  const [skills, setSkills] = useState<string[]>(initial?.skills ?? []);
  const [languages, setLanguages] = useState<string[]>(initial?.languages ?? []);
  const [hourlyRate, setHourlyRate] = useState(initial?.hourlyRate?.toString() ?? '');
  const [currency, setCurrency] = useState(initial?.currency ?? 'USD');
  const [experienceLevel, setExperienceLevel] = useState(initial?.experienceLevel ?? '');
  const [availability, setAvailability] = useState(initial?.availability ?? '');
  const [maxConcurrentContracts, setMaxConcurrentContracts] = useState(
    initial?.maxConcurrentContracts?.toString() ?? '',
  );
  const [education, setEducation] = useState<EducationItem[]>(initial?.education ?? []);
  const [workHistory, setWorkHistory] = useState<WorkHistoryItem[]>(initial?.workHistory ?? []);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(initial?.portfolio ?? []);
  const [certifications, setCertifications] = useState<CertificationItem[]>(initial?.certifications ?? []);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const experienceLevelOptions = [
    { value: 'ENTRY', label: t('profile.experienceEntry') },
    { value: 'INTERMEDIATE', label: t('profile.experienceIntermediate') },
    { value: 'EXPERT', label: t('profile.experienceExpert') },
  ];
  const availabilityOptions = [
    { value: 'FULL_TIME', label: t('profile.availabilityFullTime') },
    { value: 'PART_TIME', label: t('profile.availabilityPartTime') },
    { value: 'AS_NEEDED', label: t('profile.availabilityAsNeeded') },
    { value: 'NOT_AVAILABLE', label: t('profile.availabilityNotAvailable') },
  ];

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const dto: UpdateSeekerProfileInput = {
        title,
        bio,
        skills,
        languages,
        hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
        currency,
        experienceLevel: experienceLevel || undefined,
        availability: availability || undefined,
        maxConcurrentContracts: maxConcurrentContracts ? Number(maxConcurrentContracts) : undefined,
        education,
        workHistory,
        portfolio,
        certifications,
      };
      await dispatch(saveSeekerProfile(dto));
      onSaved?.();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Grid container spacing={2}>
        <Grid size={12}>
          <FormTextField label={t('profile.professionalTitle')} value={title} onChange={setTitle} required />
        </Grid>
        <Grid size={12}>
          <FormTextField label={t('profile.bio')} value={bio} onChange={setBio} required multiline minRows={4} />
        </Grid>
        <Grid size={12}>
          <ChipListInput label={t('profile.skills')} value={skills} onChange={setSkills} />
        </Grid>
        <Grid size={12}>
          <ChipListInput label={t('profile.languages')} value={languages} onChange={setLanguages} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <FormTextField label={t('profile.hourlyRate')} type="number" value={hourlyRate} onChange={setHourlyRate} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <FormTextField label={t('profile.currency')} value={currency} onChange={setCurrency} slotProps={{ htmlInput: { maxLength: 3 } }} />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <FormSelectField label={t('profile.experienceLevel')} value={experienceLevel} onChange={setExperienceLevel} options={experienceLevelOptions} />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <FormSelectField label={t('profile.availability')} value={availability} onChange={setAvailability} options={availabilityOptions} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormTextField
            label={t('profile.maxConcurrentContracts')}
            type="number"
            value={maxConcurrentContracts}
            onChange={setMaxConcurrentContracts}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />
      <EducationEditor items={education} onChange={setEducation} />

      <Divider sx={{ my: 3 }} />
      <WorkHistoryEditor items={workHistory} onChange={setWorkHistory} />

      <Divider sx={{ my: 3 }} />
      <PortfolioEditor items={portfolio} onChange={setPortfolio} />

      <Divider sx={{ my: 3 }} />
      <CertificationsEditor items={certifications} onChange={setCertifications} />

      <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ mt: 3 }}>
        {saving ? t('common.saving') : t('profile.saveProfile')}
      </Button>
    </Box>
  );
}

function SectionHeader({ title, onAdd }: { title: string; onAdd: () => void }) {
  const { t } = useTranslation();
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Button size="small" startIcon={<AddIcon />} onClick={onAdd}>
        {t('common.add')}
      </Button>
    </Stack>
  );
}

function ItemCard({ onRemove, children }: { onRemove: () => void; children: React.ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 1.5, position: 'relative' }}>
      <IconButton size="small" onClick={onRemove} sx={{ position: 'absolute', top: 8, right: 8 }}>
        <DeleteOutlineIcon fontSize="small" />
      </IconButton>
      {children}
    </Paper>
  );
}

function EducationEditor({ items, onChange }: { items: EducationItem[]; onChange: (v: EducationItem[]) => void }) {
  const { t } = useTranslation();
  const update = (i: number, patch: Partial<EducationItem>) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  return (
    <Box>
      <SectionHeader
        title={t('profile.education')}
        onAdd={() => onChange([...items, { institution: '', degree: '', startYear: new Date().getFullYear() }])}
      />
      {items.map((item, i) => (
        <ItemCard key={i} onRemove={() => onChange(items.filter((_, idx) => idx !== i))}>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField label={t('profile.institution')} value={item.institution} onChange={(v) => update(i, { institution: v })} size="small" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField label={t('profile.degree')} value={item.degree} onChange={(v) => update(i, { degree: v })} size="small" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField label={t('profile.fieldOfStudy')} value={item.fieldOfStudy ?? ''} onChange={(v) => update(i, { fieldOfStudy: v })} size="small" />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <FormTextField label={t('profile.startYear')} type="number" value={item.startYear} onChange={(v) => update(i, { startYear: Number(v) })} size="small" />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <FormTextField label={t('profile.endYear')} type="number" value={item.endYear ?? ''} onChange={(v) => update(i, { endYear: v ? Number(v) : undefined })} size="small" />
            </Grid>
          </Grid>
        </ItemCard>
      ))}
    </Box>
  );
}

function WorkHistoryEditor({ items, onChange }: { items: WorkHistoryItem[]; onChange: (v: WorkHistoryItem[]) => void }) {
  const { t } = useTranslation();
  const update = (i: number, patch: Partial<WorkHistoryItem>) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  return (
    <Box>
      <SectionHeader
        title={t('profile.workHistory')}
        onAdd={() => onChange([...items, { company: '', title: '', startDate: '' }])}
      />
      {items.map((item, i) => (
        <ItemCard key={i} onRemove={() => onChange(items.filter((_, idx) => idx !== i))}>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField label={t('profile.company')} value={item.company} onChange={(v) => update(i, { company: v })} size="small" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField label={t('profile.titleField')} value={item.title} onChange={(v) => update(i, { title: v })} size="small" />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <FormTextField
                label={t('profile.startDate')}
                type="date"
                value={item.startDate}
                onChange={(v) => update(i, { startDate: v })}
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <FormTextField
                label={t('profile.endDate')}
                type="date"
                value={item.endDate ?? ''}
                onChange={(v) => update(i, { endDate: v })}
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
                disabled={item.isCurrent}
              />
            </Grid>
            <Grid size={12}>
              <FormTextField label={t('profile.description')} value={item.description ?? ''} onChange={(v) => update(i, { description: v })} size="small" multiline minRows={2} />
            </Grid>
          </Grid>
        </ItemCard>
      ))}
    </Box>
  );
}

function PortfolioEditor({ items, onChange }: { items: PortfolioItem[]; onChange: (v: PortfolioItem[]) => void }) {
  const { t } = useTranslation();
  const update = (i: number, patch: Partial<PortfolioItem>) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  return (
    <Box>
      <SectionHeader title={t('profile.portfolio')} onAdd={() => onChange([...items, { title: '' }])} />
      {items.map((item, i) => (
        <ItemCard key={i} onRemove={() => onChange(items.filter((_, idx) => idx !== i))}>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField label={t('profile.titleField')} value={item.title} onChange={(v) => update(i, { title: v })} size="small" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField label={t('profile.linkUrl')} value={item.url ?? ''} onChange={(v) => update(i, { url: v })} size="small" />
            </Grid>
            <Grid size={12}>
              <FormTextField label={t('profile.description')} value={item.description ?? ''} onChange={(v) => update(i, { description: v })} size="small" multiline minRows={2} />
            </Grid>
          </Grid>
        </ItemCard>
      ))}
    </Box>
  );
}

function CertificationsEditor({ items, onChange }: { items: CertificationItem[]; onChange: (v: CertificationItem[]) => void }) {
  const { t } = useTranslation();
  const update = (i: number, patch: Partial<CertificationItem>) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  return (
    <Box>
      <SectionHeader title={t('profile.certifications')} onAdd={() => onChange([...items, { name: '', issuer: '' }])} />
      {items.map((item, i) => (
        <ItemCard key={i} onRemove={() => onChange(items.filter((_, idx) => idx !== i))}>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField label={t('profile.certName')} value={item.name} onChange={(v) => update(i, { name: v })} size="small" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField label={t('profile.issuer')} value={item.issuer} onChange={(v) => update(i, { issuer: v })} size="small" />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <FormTextField
                label={t('profile.issueDate')}
                type="date"
                value={item.issueDate ?? ''}
                onChange={(v) => update(i, { issueDate: v })}
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <FormTextField
                label={t('profile.expiryDate')}
                type="date"
                value={item.expiryDate ?? ''}
                onChange={(v) => update(i, { expiryDate: v })}
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={12}>
              <FormTextField label={t('profile.credentialUrl')} value={item.credentialUrl ?? ''} onChange={(v) => update(i, { credentialUrl: v })} size="small" />
            </Grid>
          </Grid>
        </ItemCard>
      ))}
    </Box>
  );
}
