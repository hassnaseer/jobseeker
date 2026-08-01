import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge, Box, Chip, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import BlockIcon from '@mui/icons-material/BlockOutlined';
import FlagIcon from '@mui/icons-material/OutlinedFlag';
import ConfirmDialog from '@/components/feedback/ConfirmDialog';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  blockConversation,
  fetchMyConversations,
  openConversation,
  refreshMessages,
  unblockConversation,
} from '@/features/chat/actions';
import MessageThread from './MessageThread';
import ReportConversationModal from './ReportConversationModal';

const POLL_MS = 4000;

export default function ChatPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  const user = useAppSelector((s) => s.auth.user);
  const { conversations, current } = useAppSelector((s) => s.chat);
  const [blockTarget, setBlockTarget] = useState<'block' | 'unblock' | null>(null);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    void dispatch(fetchMyConversations());
  }, [dispatch]);

  useEffect(() => {
    if (id) void dispatch(openConversation(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (!id) return;
    const interval = setInterval(() => void dispatch(refreshMessages(id)), POLL_MS);
    return () => clearInterval(interval);
  }, [dispatch, id]);

  const counterpartLabel = (clientId: string, seekerId: string) => {
    if (!user) return '';
    const isClientSide = user.id === clientId;
    const otherId = isClientSide ? seekerId : clientId;
    const otherLabel = isClientSide ? t('chat.seeker') : t('chat.client');
    return `${otherLabel} #${otherId.slice(0, 8)}`;
  };

  return (
    <Box sx={{ display: 'flex', gap: 2.5, height: 'calc(100vh - 160px)' }}>
      <Paper sx={{ width: 320, flexShrink: 0, overflowY: 'auto', p: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, px: 1.5, py: 1 }}>
          {t('chat.title')}
        </Typography>
        {conversations.length === 0 && (
          <Typography color="text.secondary" sx={{ px: 1.5, py: 2 }}>
            {t('chat.noConversations')}
          </Typography>
        )}
        <Stack spacing={0.5}>
          {conversations.map((c) => (
            <Box
              key={c.id}
              onClick={() => navigate(`/app/messages/${c.id}`)}
              sx={{
                px: 1.5,
                py: 1.2,
                borderRadius: 2,
                cursor: 'pointer',
                bgcolor: c.id === id ? 'rgba(91,95,239,0.08)' : 'transparent',
                '&:hover': { bgcolor: c.id === id ? 'rgba(91,95,239,0.08)' : 'action.hover' },
              }}
            >
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                  {counterpartLabel(c.clientId, c.seekerId)}
                </Typography>
                {c.unreadCount > 0 && <Badge badgeContent={c.unreadCount} color="error" />}
              </Stack>
              {c.contractId && (
                <Chip label={t('chat.workroom')} size="small" variant="outlined" sx={{ mt: 0.5 }} />
              )}
            </Box>
          ))}
        </Stack>
      </Paper>

      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {!current && (
          <Box sx={{ m: 'auto', textAlign: 'center' }}>
            <Typography color="text.secondary">{t('chat.selectConversation')}</Typography>
          </Box>
        )}
        {current && (
          <>
            <Stack
              direction="row"
              sx={{
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 2.5,
                py: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography sx={{ fontWeight: 700 }}>
                {counterpartLabel(current.clientId, current.seekerId)}
              </Typography>
              <Stack direction="row" spacing={0.5}>
                <Tooltip title={t('chat.report')}>
                  <IconButton size="small" onClick={() => setReportOpen(true)}>
                    <FlagIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={current.isBlocked ? t('chat.unblock') : t('chat.block')}>
                  <IconButton
                    size="small"
                    color={current.isBlocked ? 'error' : 'default'}
                    onClick={() => setBlockTarget(current.isBlocked ? 'unblock' : 'block')}
                  >
                    <BlockIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
            <MessageThread conversationId={current.id} isBlocked={current.isBlocked} />
          </>
        )}
      </Paper>

      <ConfirmDialog
        open={!!blockTarget}
        title={blockTarget === 'block' ? t('chat.blockConfirmTitle') : t('chat.unblock')}
        message={blockTarget === 'block' ? t('chat.blockConfirmBody') : ''}
        confirmLabel={blockTarget === 'block' ? t('chat.block') : t('chat.unblock')}
        destructive={blockTarget === 'block'}
        onClose={() => setBlockTarget(null)}
        onConfirm={async () => {
          if (current) {
            if (blockTarget === 'block') await dispatch(blockConversation(current.id));
            else await dispatch(unblockConversation(current.id));
          }
          setBlockTarget(null);
        }}
      />

      {current && (
        <ReportConversationModal
          conversationId={current.id}
          open={reportOpen}
          onClose={() => setReportOpen(false)}
        />
      )}
    </Box>
  );
}
