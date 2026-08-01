import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchMyNotifications,
  fetchPreferences,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationPreference,
} from '@/features/notifications/actions';
import type { Notification, NotificationEventType } from '@/types/domain';

const EVENT_TYPES: NotificationEventType[] = [
  'PROFILE_APPROVED',
  'PROFILE_REJECTED',
  'APPLICATION_RECEIVED',
  'APPLICATION_ACCEPTED',
  'APPLICATION_REJECTED',
  'ESCROW_FUNDED',
  'DELIVERABLE_SUBMITTED',
  'DELIVERABLE_APPROVED',
  'DELIVERABLE_REVISION_REQUESTED',
  'MILESTONE_RELEASED',
  'TIMESHEET_SUBMITTED',
  'HOURS_DISPUTED',
  'HOURS_APPROVED',
  'CONTRACT_COMPLETED',
  'WITHDRAWAL_STATUS_CHANGED',
  'NEW_MESSAGE',
  'CHAT_UNREAD_DIGEST',
  'DISPUTE_OPENED',
  'DISPUTE_RESOLVED',
  'REVIEW_RECEIVED',
];

export default function NotificationsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, preferences } = useAppSelector((s) => s.notifications);
  const [unreadOnly, setUnreadOnly] = useState(false);

  useEffect(() => {
    void dispatch(fetchMyNotifications(unreadOnly));
  }, [dispatch, unreadOnly]);

  useEffect(() => {
    void dispatch(fetchPreferences());
  }, [dispatch]);

  const handleOpen = async (n: Notification) => {
    if (!n.isRead) await dispatch(markNotificationRead(n.id));
    if (n.link) navigate(n.link);
  };

  const preferenceFor = (eventType: NotificationEventType) =>
    preferences.find((p) => p.eventType === eventType);

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {t('notifications.title')}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Chip
            label={t('notifications.all')}
            color={unreadOnly ? 'default' : 'primary'}
            variant={unreadOnly ? 'outlined' : 'filled'}
            onClick={() => setUnreadOnly(false)}
          />
          <Chip
            label={t('notifications.unreadOnly')}
            color={unreadOnly ? 'primary' : 'default'}
            variant={unreadOnly ? 'filled' : 'outlined'}
            onClick={() => setUnreadOnly(true)}
          />
          <Button size="small" onClick={() => dispatch(markAllNotificationsRead())}>
            {t('notifications.markAllRead')}
          </Button>
        </Stack>
      </Stack>

      {items.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', mb: 4 }}>
          <Typography color="text.secondary">{t('notifications.noNotifications')}</Typography>
        </Paper>
      )}

      <Stack spacing={1} sx={{ mb: 5 }}>
        {items.map((n) => (
          <Paper
            key={n.id}
            onClick={() => void handleOpen(n)}
            sx={{
              p: 2,
              cursor: 'pointer',
              borderLeft: '3px solid',
              borderColor: n.isRead ? 'transparent' : 'primary.main',
              bgcolor: n.isRead ? 'background.paper' : 'rgba(91,95,239,0.04)',
            }}
          >
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography sx={{ fontWeight: 700 }}>{n.title}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(n.createdAt).toLocaleString()}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {n.message}
            </Typography>
          </Paper>
        ))}
      </Stack>

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
        {t('notifications.preferences')}
      </Typography>
      <Paper sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell align="center">{t('notifications.channelEmail')}</TableCell>
              <TableCell align="center">{t('notifications.channelInApp')}</TableCell>
              <TableCell align="center">{t('notifications.channelPush')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {EVENT_TYPES.map((eventType) => {
              const pref = preferenceFor(eventType);
              return (
                <TableRow key={eventType}>
                  <TableCell>{t(`notifications.event.${eventType}`)}</TableCell>
                  {(['emailEnabled', 'inAppEnabled', 'pushEnabled'] as const).map((field) => (
                    <TableCell key={field} align="center">
                      <Checkbox
                        size="small"
                        checked={pref?.[field] ?? false}
                        onChange={(e) =>
                          dispatch(updateNotificationPreference(eventType, { [field]: e.target.checked }))
                        }
                      />
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
