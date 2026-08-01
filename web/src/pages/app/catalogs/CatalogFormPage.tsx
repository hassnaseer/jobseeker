import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button, Grid, IconButton, Paper, Stack, Typography } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AddIcon from '@mui/icons-material/Add';
import FormTextField from '@/components/form/FormTextField';
import FormSelectField from '@/components/form/FormSelectField';
import ChipListInput from '@/components/form/ChipListInput';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addTier, createCatalog, fetchCatalogDetail, removeTier, updateCatalog } from '@/features/catalogs/actions';
import { getCategoryTree, flattenCategoryTree } from '@/api/categories';
import { extractErrorMessage } from '@/api/client';
import type { CreateCatalogInput, CreateTierInput } from '@/api/catalogs';
import type { CatalogFaqItem, CatalogTier } from '@/types/domain';

export default function CatalogFormPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const existing = useAppSelector((s) => s.catalogs.detail);

  const [categories, setCategories] = useState<{ id: string; label: string }[]>([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [faq, setFaq] = useState<CatalogFaqItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategoryTree().then((tree) => setCategories(flattenCategoryTree(tree))).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (id) void dispatch(fetchCatalogDetail(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (isEdit && existing && existing.id === id) {
      setTitle(existing.title);
      setCategoryId(existing.categoryId);
      setDescription(existing.description);
      setGallery(existing.gallery);
      setFaq(existing.faq);
    }
  }, [isEdit, existing, id]);

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.label }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const dto: CreateCatalogInput = { title, categoryId, description, gallery, faq };
      if (isEdit && id) {
        await dispatch(updateCatalog(id, dto));
      } else {
        await dispatch(createCatalog(dto));
        navigate('/app/catalogs');
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
        {isEdit ? t('catalogs.editCatalogTitle') : t('catalogs.newCatalogTitle')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid size={12}>
          <FormTextField label={t('catalogs.title')} value={title} onChange={setTitle} required />
        </Grid>
        <Grid size={12}>
          <FormSelectField
            label={t('catalogs.category')}
            value={categoryId}
            onChange={setCategoryId}
            options={categoryOptions}
            allowEmpty={false}
          />
        </Grid>
        <Grid size={12}>
          <FormTextField
            label={t('catalogs.description')}
            value={description}
            onChange={setDescription}
            required
            multiline
            minRows={4}
          />
        </Grid>
        <Grid size={12}>
          <ChipListInput label={t('catalogs.gallery')} value={gallery} onChange={setGallery} />
        </Grid>
      </Grid>

      <FaqEditor items={faq} onChange={setFaq} />

      <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ mt: 3 }}>
        {t('catalogs.save')}
      </Button>

      {isEdit && id && existing && <TiersEditor catalogId={id} tiers={existing.tiers ?? []} />}
    </Box>
  );
}

function FaqEditor({ items, onChange }: { items: CatalogFaqItem[]; onChange: (v: CatalogFaqItem[]) => void }) {
  const { t } = useTranslation();
  const update = (i: number, patch: Partial<CatalogFaqItem>) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  return (
    <Box sx={{ mt: 3 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {t('catalogs.faq')}
        </Typography>
        <Button size="small" startIcon={<AddIcon />} onClick={() => onChange([...items, { question: '', answer: '' }])}>
          {t('common.add')}
        </Button>
      </Stack>
      {items.map((item, i) => (
        <Paper key={i} variant="outlined" sx={{ p: 2, mb: 1.5, position: 'relative' }}>
          <IconButton
            size="small"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
          <Grid container spacing={1.5}>
            <Grid size={12}>
              <FormTextField label={t('catalogs.question')} value={item.question} onChange={(v) => update(i, { question: v })} size="small" />
            </Grid>
            <Grid size={12}>
              <FormTextField label={t('catalogs.answer')} value={item.answer} onChange={(v) => update(i, { answer: v })} size="small" multiline minRows={2} />
            </Grid>
          </Grid>
        </Paper>
      ))}
    </Box>
  );
}

function TiersEditor({ catalogId, tiers }: { catalogId: string; tiers: CatalogTier[] }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [newTier, setNewTier] = useState<CreateTierInput>({ name: '', price: 1, deliveryDays: 1, revisions: 0, features: [] });
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    setSaving(true);
    try {
      await dispatch(addTier(catalogId, newTier));
      setNewTier({ name: '', price: 1, deliveryDays: 1, revisions: 0, features: [] });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
        {t('catalogs.tiers')}
      </Typography>
      <Stack spacing={1.5} sx={{ mb: 2 }}>
        {tiers.map((tier) => (
          <Paper key={tier.id} variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>{tier.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {tier.currency} {tier.price} · {tier.deliveryDays}d · {tier.revisions} revisions
                </Typography>
              </Box>
              <Button size="small" color="error" onClick={() => dispatch(removeTier(catalogId, tier.id))}>
                {t('common.delete')}
              </Button>
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormTextField label={t('catalogs.tierName')} value={newTier.name} onChange={(v) => setNewTier((f) => ({ ...f, name: v }))} size="small" />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <FormTextField
              label={t('catalogs.price')}
              type="number"
              value={newTier.price}
              onChange={(v) => setNewTier((f) => ({ ...f, price: Number(v) }))}
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <FormTextField
              label={t('catalogs.deliveryDays')}
              type="number"
              value={newTier.deliveryDays}
              onChange={(v) => setNewTier((f) => ({ ...f, deliveryDays: Number(v) }))}
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 2 }}>
            <FormTextField
              label={t('catalogs.revisions')}
              type="number"
              value={newTier.revisions ?? 0}
              onChange={(v) => setNewTier((f) => ({ ...f, revisions: Number(v) }))}
              size="small"
            />
          </Grid>
          <Grid size={12}>
            <ChipListInput
              label={t('catalogs.features')}
              value={newTier.features ?? []}
              onChange={(v) => setNewTier((f) => ({ ...f, features: v }))}
            />
          </Grid>
        </Grid>
        <Button size="small" variant="contained" onClick={handleAdd} disabled={saving || !newTier.name} sx={{ mt: 1.5 }}>
          {t('catalogs.addTier')}
        </Button>
      </Paper>
    </Box>
  );
}
