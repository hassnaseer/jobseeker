import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Chip, Divider, Paper, Stack, TextField, Typography } from '@mui/material';
import {
  adminGetTicketDetail,
  adminListTickets,
  adminReopenTicket,
  adminReplyToTicket,
  adminResolveTicket,
  type SupportMessage,
  type SupportTicket,
} from '@/api/support';

function requesterName(ticket: SupportTicket): string {
  const requester = ticket.requester;
  if (!requester) return '—';
  const name = [requester.firstName, requester.lastName].filter(Boolean).join(' ');
  return name || requester.email;
}

export default function AdminSupportPage() {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [reply, setReply] = useState('');
  const [replying, setReplying] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadTickets = useCallback(() => {
    adminListTickets()
      .then((items) => {
        setTickets(items);
        setSelectedId((current) => current ?? items[0]?.id ?? null);
      })
      .catch(() => undefined);
  }, []);

  useEffect(loadTickets, [loadTickets]);

  useEffect(() => {
    if (!selectedId) return;
    adminGetTicketDetail(selectedId)
      .then((detail) => setMessages(detail.messages))
      .catch(() => undefined);
  }, [selectedId]);

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedId) ?? null;

  async function handleReply() {
    if (!selectedId || !reply.trim()) return;
    setReplying(true);
    try {
      const sent = await adminReplyToTicket(selectedId, reply.trim());
      setMessages((prev) => [...prev, sent]);
      setReply('');
      loadTickets();
    } finally {
      setReplying(false);
    }
  }

  async function handleToggleStatus() {
    if (!selectedTicket) return;
    setUpdatingStatus(true);
    try {
      const updated =
        selectedTicket.status === 'OPEN'
          ? await adminResolveTicket(selectedTicket.id)
          : await adminReopenTicket(selectedTicket.id);
      setTickets((prev) => prev.map((ticket) => (ticket.id === updated.id ? updated : ticket)));
    } finally {
      setUpdatingStatus(false);
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {t('adminSupport.title')}
      </Typography>

      <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Paper sx={{ width: 320, flexShrink: 0, overflow: 'hidden' }}>
          {tickets.length === 0 ? (
            <Box sx={{ p: 3 }}>
              <Typography color="text.secondary">{t('adminSupport.empty')}</Typography>
            </Box>
          ) : (
            tickets.map((ticket) => (
              <Box
                key={ticket.id}
                onClick={() => setSelectedId(ticket.id)}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  bgcolor: ticket.id === selectedId ? 'action.selected' : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontWeight: 700 }} noWrap>
                      {requesterName(ticket)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {ticket.requester?.activeRole === 'CLIENT'
                        ? t('adminSupport.client')
                        : t('adminSupport.jobSeeker')}
                    </Typography>
                  </Box>
                  <Chip
                    label={ticket.status === 'OPEN' ? t('support.statusOpen') : t('support.statusResolved')}
                    color={ticket.status === 'OPEN' ? 'warning' : 'success'}
                    size="small"
                    sx={{ flexShrink: 0 }}
                  />
                </Stack>
              </Box>
            ))
          )}
        </Paper>

        <Paper sx={{ flex: 1, minHeight: 400, display: 'flex', flexDirection: 'column' }}>
          {!selectedTicket ? (
            <Box sx={{ p: 4 }}>
              <Typography color="text.secondary">{t('adminSupport.selectTicket')}</Typography>
            </Box>
          ) : (
            <>
              <Stack
                direction="row"
                sx={{ justifyContent: 'space-between', alignItems: 'center', p: 2.5 }}
              >
                <Typography sx={{ fontWeight: 700 }}>{requesterName(selectedTicket)}</Typography>
                <Button size="small" variant="outlined" onClick={handleToggleStatus} disabled={updatingStatus}>
                  {selectedTicket.status === 'OPEN' ? t('adminSupport.resolve') : t('adminSupport.reopen')}
                </Button>
              </Stack>
              <Divider />
              <Stack spacing={1.5} sx={{ p: 2.5, flex: 1 }}>
                {messages.map((msg) => {
                  const isAdmin = msg.senderId !== selectedTicket.requesterId;
                  return (
                    <Box
                      key={msg.id}
                      sx={{
                        alignSelf: isAdmin ? 'flex-end' : 'flex-start',
                        bgcolor: isAdmin ? 'primary.main' : 'action.hover',
                        color: isAdmin ? 'primary.contrastText' : 'text.primary',
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        maxWidth: '70%',
                      }}
                    >
                      <Typography variant="body2">{msg.body}</Typography>
                    </Box>
                  );
                })}
              </Stack>
              <Divider />
              <Stack direction="row" spacing={1} sx={{ p: 2.5 }}>
                <TextField
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder={t('adminSupport.replyPlaceholder')}
                  fullWidth
                  size="small"
                />
                <Button variant="contained" onClick={handleReply} disabled={replying || !reply.trim()}>
                  {t('adminSupport.reply')}
                </Button>
              </Stack>
            </>
          )}
        </Paper>
      </Stack>
    </Box>
  );
}
