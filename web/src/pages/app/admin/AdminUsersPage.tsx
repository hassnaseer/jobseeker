import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Chip, Menu, MenuItem, Stack, Typography } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DataTable, { type DataTableColumn } from '@/components/data/DataTable';
import FormSelectField from '@/components/form/FormSelectField';
import FormTextField from '@/components/form/FormTextField';
import ConfirmDialog from '@/components/feedback/ConfirmDialog';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  banUser,
  fetchUsers,
  impersonateUser,
  reactivateUser,
  suspendUser,
  verifyUserEmail,
} from '@/features/admin/actions';
import type { User, UserRole } from '@/types/user';

type ConfirmKind = 'suspend' | 'ban' | 'impersonate';

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { users, status } = useAppSelector((s) => s.admin);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; user: User } | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{ kind: ConfirmKind; user: User } | null>(null);

  useEffect(() => {
    void dispatch(fetchUsers({ q: q || undefined, role: (role || undefined) as UserRole | undefined, page: page + 1, limit: 25 }));
  }, [dispatch, q, role, page]);

  const columns: DataTableColumn<User>[] = [
    {
      key: 'name',
      header: t('admin.name'),
      render: (u) => `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || '—',
    },
    { key: 'email', header: t('admin.email'), render: (u) => u.email },
    {
      key: 'roles',
      header: t('admin.roles'),
      render: (u) => (
        <Stack direction="row" spacing={0.5}>
          {u.roles.map((r) => (
            <Chip key={r} label={r} size="small" variant="outlined" />
          ))}
        </Stack>
      ),
    },
    {
      key: 'status',
      header: t('admin.status'),
      render: (u) => (
        <Chip
          label={u.isBanned ? t('admin.banned') : u.isActive ? t('admin.active') : t('admin.suspended')}
          size="small"
          color={u.isBanned ? 'error' : u.isActive ? 'success' : 'warning'}
        />
      ),
    },
    { key: 'joined', header: t('admin.joined'), render: (u) => new Date(u.createdAt).toLocaleDateString() },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (u) => (
        <Button size="small" onClick={(e) => setMenuAnchor({ el: e.currentTarget, user: u })}>
          <MoreVertIcon fontSize="small" />
        </Button>
      ),
    },
  ];

  const closeMenu = () => setMenuAnchor(null);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {t('admin.usersTitle')}
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Box sx={{ maxWidth: 320, flex: 1 }}>
          <FormTextField label={t('admin.searchUsers')} value={q} onChange={setQ} />
        </Box>
        <Box sx={{ maxWidth: 200 }}>
          <FormSelectField
            label={t('admin.allRoles')}
            value={role}
            onChange={setRole}
            options={[
              { value: 'CLIENT', label: 'CLIENT' },
              { value: 'SEEKER', label: 'SEEKER' },
              { value: 'SUPER_ADMIN', label: 'SUPER_ADMIN' },
            ]}
          />
        </Box>
      </Stack>

      <DataTable
        columns={columns}
        rows={users.items}
        getRowKey={(u) => u.id}
        loading={status === 'loading'}
        page={page}
        rowsPerPage={users.limit}
        totalCount={users.total}
        onPageChange={setPage}
      />

      <Menu anchorEl={menuAnchor?.el} open={!!menuAnchor} onClose={closeMenu}>
        {menuAnchor?.user.isBanned === false && menuAnchor.user.isActive && (
          <MenuItem
            onClick={() => {
              setConfirmTarget({ kind: 'suspend', user: menuAnchor.user });
              closeMenu();
            }}
          >
            {t('admin.suspend')}
          </MenuItem>
        )}
        {menuAnchor?.user.isActive === false && !menuAnchor.user.isBanned && (
          <MenuItem
            onClick={() => {
              void dispatch(reactivateUser(menuAnchor.user.id));
              closeMenu();
            }}
          >
            {t('admin.reactivate')}
          </MenuItem>
        )}
        {menuAnchor?.user.isBanned === false && (
          <MenuItem
            onClick={() => {
              setConfirmTarget({ kind: 'ban', user: menuAnchor.user });
              closeMenu();
            }}
          >
            {t('admin.ban')}
          </MenuItem>
        )}
        {menuAnchor && !menuAnchor.user.emailVerified && (
          <MenuItem
            onClick={() => {
              void dispatch(verifyUserEmail(menuAnchor.user.id));
              closeMenu();
            }}
          >
            {t('admin.verifyEmail')}
          </MenuItem>
        )}
        {menuAnchor && (
          <MenuItem
            onClick={() => {
              setConfirmTarget({ kind: 'impersonate', user: menuAnchor.user });
              closeMenu();
            }}
          >
            {t('admin.impersonate')}
          </MenuItem>
        )}
      </Menu>

      <ConfirmDialog
        open={!!confirmTarget}
        title={
          confirmTarget?.kind === 'suspend'
            ? t('admin.suspendConfirmTitle')
            : confirmTarget?.kind === 'ban'
              ? t('admin.banConfirmTitle')
              : t('admin.impersonateConfirmTitle')
        }
        message={
          confirmTarget?.kind === 'suspend'
            ? t('admin.suspendConfirmBody')
            : confirmTarget?.kind === 'ban'
              ? t('admin.banConfirmBody')
              : t('admin.impersonateConfirmBody')
        }
        confirmLabel={
          confirmTarget?.kind === 'suspend'
            ? t('admin.suspend')
            : confirmTarget?.kind === 'ban'
              ? t('admin.ban')
              : t('admin.impersonate')
        }
        destructive={confirmTarget?.kind === 'ban'}
        onClose={() => setConfirmTarget(null)}
        onConfirm={async () => {
          if (!confirmTarget) return;
          const { kind, user } = confirmTarget;
          if (kind === 'suspend') await dispatch(suspendUser(user.id));
          else if (kind === 'ban') await dispatch(banUser(user.id));
          else await dispatch(impersonateUser(user.id));
          setConfirmTarget(null);
          if (kind !== 'impersonate') void dispatch(fetchUsers({ q: q || undefined, page: page + 1, limit: 25 }));
        }}
      />
    </Box>
  );
}
