import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Button, IconButton, Paper, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import Modal from '@/components/feedback/Modal';
import ConfirmDialog from '@/components/feedback/ConfirmDialog';
import FormTextField from '@/components/form/FormTextField';
import FormSelectField from '@/components/form/FormSelectField';
import { extractErrorMessage } from '@/api/client';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { createCategory, deleteCategory, fetchAdminCategories, updateCategory } from '@/features/admin/actions';
import type { Category } from '@/types/domain';

export default function AdminCategoriesPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { categories } = useAppSelector((s) => s.admin);
  const [editing, setEditing] = useState<Category | 'new' | null>(null);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void dispatch(fetchAdminCategories());
  }, [dispatch]);

  const openNew = () => {
    setName('');
    setParentId('');
    setEditing('new');
  };

  const openEdit = (cat: Category) => {
    setName(cat.name);
    setParentId(cat.parentId ?? '');
    setEditing(cat);
  };

  const handleSave = async () => {
    setError(null);
    try {
      if (editing === 'new') {
        await dispatch(createCategory({ name, parentId: parentId || undefined }));
      } else if (editing) {
        await dispatch(updateCategory(editing.id, { name, parentId: parentId || undefined }));
      }
      setEditing(null);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const parentOptions = categories
    .filter((c) => editing === 'new' || (editing && c.id !== editing.id))
    .map((c) => ({ value: c.id, label: c.name }));

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {t('admin.categoriesTitle')}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>
          {t('admin.addCategory')}
        </Button>
      </Stack>

      <Stack spacing={1}>
        {categories.map((cat) => (
          <Paper key={cat.id} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontWeight: cat.parentId ? 400 : 700, pl: cat.parentId ? 3 : 0 }}>
              {cat.name}
            </Typography>
            <Stack direction="row" spacing={0.5}>
              <IconButton size="small" onClick={() => openEdit(cat)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => setDeleteTarget(cat)}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? t('admin.addCategory') : t('admin.editCategory')}
        actions={
          <Button variant="contained" onClick={() => void handleSave()} disabled={!name.trim()}>
            {t('common.save')}
          </Button>
        }
      >
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <FormTextField label={t('admin.categoryName')} value={name} onChange={setName} />
          <FormSelectField
            label={t('admin.parentCategory')}
            value={parentId}
            onChange={setParentId}
            options={parentOptions}
            emptyLabel={t('admin.topLevel')}
          />
        </Stack>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('admin.deleteCategoryConfirmTitle')}
        message={t('admin.deleteCategoryConfirmBody')}
        confirmLabel={t('common.delete')}
        destructive
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) await dispatch(deleteCategory(deleteTarget.id));
          setDeleteTarget(null);
        }}
      />
    </Box>
  );
}
