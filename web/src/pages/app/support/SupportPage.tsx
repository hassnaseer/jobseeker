import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import {
  addMyTicketMessage,
  createTicket,
  getMyTicketDetail,
  listMyTickets,
  type SupportMessage,
  type SupportTicket,
} from '@/api/support';
import { useAppSelector } from '@/app/hooks';

const FAQ_KEYS = ['getPaid', 'escrow', 'disputes', 'switchRole'] as const;

export default function SupportPage() {
  const { t } = useTranslation();
  const currentUserId = useAppSelector((s) => s.auth.user?.id);

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdNotice, setCreatedNotice] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [reply, setReply] = useState('');
  const [replying, setReplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTickets = useCallback(() => {
    setLoadingTickets(true);
    listMyTickets()
      .then(setTickets)
      .catch(() => undefined)
      .finally(() => setLoadingTickets(false));
  }, []);

  useEffect(loadTickets, [loadTickets]);

  useEffect(() => {
    if (!selectedId) return;
    getMyTicketDetail(selectedId)
      .then((detail) => setMessages(detail.messages))
      .catch(() => undefined);
  }, [selectedId]);

  async function handleSubmitTicket() {
    if (!subject.trim() || !message.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await createTicket(subject.trim(), message.trim());
      setSubject('');
      setMessage('');
      setCreatedNotice(true);
      loadTickets();
    } catch {
      setError(t('errors.somethingWrong'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReply() {
    if (!selectedId || !reply.trim()) return;
    setReplying(true);
    try {
      const sent = await addMyTicketMessage(selectedId, reply.trim());
      setMessages((prev) => [...prev, sent]);
      setReply('');
      loadTickets();
    } catch {
      setError(t('errors.somethingWrong'));
    } finally {
      setReplying(false);
    }
  }

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedId) ?? null;

  return (
    <Box sx={{ maxWidth: 700 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        {t('support.title')}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {t('support.subtitle')}
      </Typography>

      <Button
        variant="contained"
        startIcon={<EmailOutlinedIcon />}
        href="mailto:support@joblinxs.com"
        sx={{ mb: 3 }}
      >
        {t('support.emailSupport')}
      </Button>

      <Stack spacing={1.5} sx={{ mb: 4 }}>
        {FAQ_KEYS.map((key) => (
          <Paper key={key} sx={{ p: 2.5 }}>
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{t(`support.faq.${key}.q`)}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t(`support.faq.${key}.a`)}
            </Typography>
          </Paper>
        ))}
      </Stack>

      {!selectedTicket ? (
        <>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            {t('support.contactTitle')}
          </Typography>
          <Paper sx={{ p: 2.5, mb: 4 }}>
            {createdNotice ? (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setCreatedNotice(false)}>
                {t('support.ticketCreated')}
              </Alert>
            ) : null}
            {error ? (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            ) : null}
            <Stack spacing={2}>
              <TextField
                label={t('support.subject')}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                fullWidth
              />
              <TextField
                label={t('support.message')}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                multiline
                minRows={3}
                fullWidth
              />
              <Button
                variant="contained"
                onClick={handleSubmitTicket}
                disabled={submitting || !subject.trim() || !message.trim()}
                sx={{ alignSelf: 'flex-start' }}
              >
                {t('support.submit')}
              </Button>
            </Stack>
          </Paper>

          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            {t('support.myTickets')}
          </Typography>
          {!loadingTickets && tickets.length === 0 ? (
            <Typography color="text.secondary">{t('support.noTickets')}</Typography>
          ) : (
            <Stack spacing={1}>
              {tickets.map((ticket) => (
                <Paper
                  key={ticket.id}
                  sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  onClick={() => setSelectedId(ticket.id)}
                >
                  <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontWeight: 600 }}>{ticket.subject}</Typography>
                    <Chip
                      label={
                        ticket.status === 'OPEN' ? t('support.statusOpen') : t('support.statusResolved')
                      }
                      color={ticket.status === 'OPEN' ? 'warning' : 'success'}
                      size="small"
                    />
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </>
      ) : (
        <Box>
          <Button size="small" onClick={() => setSelectedId(null)} sx={{ mb: 1.5 }}>
            {t('support.backToTickets')}
          </Button>
          <Paper sx={{ p: 2.5 }}>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography sx={{ fontWeight: 700 }}>{selectedTicket.subject}</Typography>
              <Chip
                label={
                  selectedTicket.status === 'OPEN' ? t('support.statusOpen') : t('support.statusResolved')
                }
                color={selectedTicket.status === 'OPEN' ? 'warning' : 'success'}
                size="small"
              />
            </Stack>
            <Divider sx={{ mb: 1.5 }} />
            <Stack spacing={1.5} sx={{ mb: 2 }}>
              {messages.map((msg) => {
                const isMine = msg.senderId === currentUserId;
                return (
                  <Box
                    key={msg.id}
                    sx={{
                      alignSelf: isMine ? 'flex-end' : 'flex-start',
                      bgcolor: isMine ? 'primary.main' : 'action.hover',
                      color: isMine ? 'primary.contrastText' : 'text.primary',
                      borderRadius: 2,
                      px: 2,
                      py: 1,
                      maxWidth: '80%',
                      ml: isMine ? 'auto' : 0,
                    }}
                  >
                    <Typography variant="body2">{msg.body}</Typography>
                  </Box>
                );
              })}
            </Stack>
            <Stack direction="row" spacing={1}>
              <TextField
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder={t('support.replyPlaceholder')}
                fullWidth
                size="small"
              />
              <Button variant="contained" onClick={handleReply} disabled={replying || !reply.trim()}>
                {t('support.reply')}
              </Button>
            </Stack>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
