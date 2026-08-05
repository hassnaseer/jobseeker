import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAppSelector } from '@/app/hooks';
import { addMyCategory, getCategoryTree, getMyCategories, removeMyCategory } from '@/api/categories';
import { extractErrorMessage } from '@/api/client';
import type { Category } from '@/types/domain';

export default function CategoriesPage() {
  const { t } = useTranslation();
  const user = useAppSelector((s) => s.auth.user);
  const role = user?.activeRole === 'CLIENT' ? 'CLIENT' : 'SEEKER';

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lockedIds, setLockedIds] = useState<Set<string>>(new Set());
  const [initialIds, setInitialIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [tree, mine] = await Promise.all([getCategoryTree(), getMyCategories(role)]);
      setCategories(tree);
      const ids = new Set(mine.map((m) => m.categoryId));
      setSelectedIds(ids);
      setInitialIds(ids);
      setLockedIds(new Set(mine.filter((m) => m.locked).map((m) => m.categoryId)));
    }
    void load();
  }, [role]);

  function toggle(categoryId: string) {
    if (lockedIds.has(categoryId)) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const toAdd = [...selectedIds].filter((id) => !initialIds.has(id));
      const toRemove = [...initialIds].filter((id) => !selectedIds.has(id));
      await Promise.all([
        ...toAdd.map((id) => addMyCategory(role, id)),
        ...toRemove.map((id) => removeMyCategory(role, id)),
      ]);
      setInitialIds(new Set(selectedIds));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const dirty = selectedIds.size !== initialIds.size || [...selectedIds].some((id) => !initialIds.has(id));

  return (
    <Box sx={{ maxWidth: 700 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {t('categories.title')}
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{t('categories.yourCategories')}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('categories.subtitle')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1, mb: 3 }}>
          {categories.map((cat) => {
            const selected = selectedIds.has(cat.id);
            const locked = lockedIds.has(cat.id);
            return (
              <Chip
                key={cat.id}
                label={cat.name}
                icon={locked ? <LockOutlinedIcon fontSize="small" /> : undefined}
                onClick={() => toggle(cat.id)}
                color={selected ? 'primary' : 'default'}
                variant={selected ? 'filled' : 'outlined'}
                sx={{ cursor: locked ? 'not-allowed' : 'pointer' }}
              />
            );
          })}
        </Stack>

        <Button variant="contained" onClick={handleSave} disabled={saving || !dirty}>
          {saving ? t('common.saving') : t('categories.save')}
        </Button>
      </Paper>
    </Box>
  );
}
