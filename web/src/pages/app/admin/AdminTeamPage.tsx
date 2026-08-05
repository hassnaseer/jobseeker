import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  FormGroup,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Modal from '@/components/feedback/Modal';
import ConfirmDialog from '@/components/feedback/ConfirmDialog';
import FormTextField from '@/components/form/FormTextField';
import { extractErrorMessage } from '@/api/client';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchTeamMembers, inviteTeamMember, removeTeamMember } from '@/features/adminTeam/actions';
import type { AdminPermission, AdminTeamMember } from '@/types/admin';

const ALL_PERMISSIONS: AdminPermission[] = ['KYC', 'DISPUTES', 'CATEGORIES', 'SUPPORT'];

export default function AdminTeamPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { members, status, error } = useAppSelector((s) => s.adminTeam);

  const [inviting, setInviting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<AdminTeamMember | null>(null);

  useEffect(() => {
    void dispatch(fetchTeamMembers());
  }, [dispatch]);

  const openInvite = () => {
    setName('');
    setEmail('');
    setPermissions([]);
    setFormError(null);
    setInviting(true);
  };

  const togglePermission = (perm: AdminPermission) => {
    setPermissions((prev) => (prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]));
  };

  const handleInvite = async () => {
    setFormError(null);
    if (!name.trim() || !email.trim() || permissions.length === 0) {
      setFormError(t('admin.team.formError'));
      return;
    }
    try {
      await dispatch(inviteTeamMember({ name: name.trim(), email: email.trim(), permissions }));
      setInviting(false);
    } catch (err) {
      setFormError(extractErrorMessage(err));
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    await dispatch(removeTeamMember(removeTarget.id));
    setRemoveTarget(null);
  };

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {t('admin.team.title')}
          </Typography>
          <Typography color="text.secondary">{t('admin.team.subtitle')}</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openInvite}>
          {t('admin.team.invite')}
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {status === 'ready' && members.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('admin.team.empty')}</Typography>
        </Paper>
      )}

      <Stack spacing={1.5}>
        {members.map((member) => (
          <Paper key={member.id} sx={{ p: 2.5 }}>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography sx={{ fontWeight: 700 }}>{member.name}</Typography>
                  {member.status === 'PENDING' && (
                    <Chip label={t('admin.team.pending')} size="small" color="warning" variant="outlined" />
                  )}
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {member.email}
                </Typography>
                <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', rowGap: 0.75 }}>
                  {member.permissions.map((perm) => (
                    <Chip key={perm} label={t(`admin.team.permission.${perm}`)} size="small" />
                  ))}
                </Stack>
              </Box>
              <Button color="error" onClick={() => setRemoveTarget(member)}>
                {t('admin.team.remove')}
              </Button>
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Modal
        open={inviting}
        onClose={() => setInviting(false)}
        title={t('admin.team.inviteTitle')}
        actions={
          <>
            <Button onClick={() => setInviting(false)}>{t('common.cancel')}</Button>
            <Button variant="contained" onClick={handleInvite} disabled={status === 'saving'}>
              {status === 'saving' ? t('common.saving') : t('admin.team.sendInvite')}
            </Button>
          </>
        }
      >
        {formError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        )}
        <Stack spacing={2}>
          <FormTextField label={t('admin.name')} value={name} onChange={setName} required />
          <FormTextField label={t('admin.email')} type="email" value={email} onChange={setEmail} required />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              {t('admin.team.permissions')}
            </Typography>
            <FormGroup>
              {ALL_PERMISSIONS.map((perm) => (
                <FormControlLabel
                  key={perm}
                  control={<Checkbox checked={permissions.includes(perm)} onChange={() => togglePermission(perm)} />}
                  label={t(`admin.team.permission.${perm}`)}
                />
              ))}
            </FormGroup>
          </Box>
        </Stack>
      </Modal>

      <ConfirmDialog
        open={!!removeTarget}
        title={t('admin.team.removeConfirmTitle')}
        message={t('admin.team.removeConfirmBody', { name: removeTarget?.name ?? '' })}
        confirmLabel={t('admin.team.remove')}
        destructive
        onConfirm={handleRemove}
        onClose={() => setRemoveTarget(null)}
      />
    </Box>
  );
}
