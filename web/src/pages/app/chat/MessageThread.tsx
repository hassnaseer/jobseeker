import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, IconButton, Stack, TextField, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { deleteChatMessage, editChatMessage, sendChatMessage } from '@/features/chat/actions';
import { extractErrorMessage } from '@/api/client';

interface Props {
  conversationId: string;
  isBlocked: boolean;
}

export default function MessageThread({ conversationId, isBlocked }: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const messages = useAppSelector((s) => s.chat.messages);
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const handleSend = async () => {
    if (!draft.trim()) return;
    setError(null);
    try {
      await dispatch(sendChatMessage(conversationId, { content: draft.trim() }));
      setDraft('');
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleSaveEdit = async (messageId: string) => {
    if (!editDraft.trim()) return;
    setError(null);
    try {
      await dispatch(editChatMessage(conversationId, messageId, editDraft.trim()));
      setEditingId(null);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleDelete = async (messageId: string) => {
    setError(null);
    try {
      await dispatch(deleteChatMessage(conversationId, messageId));
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
        <Stack spacing={1.5}>
          {messages.map((m) => {
            const mine = m.senderId === user?.id;
            const isEditing = editingId === m.id;
            return (
              <Stack key={m.id} sx={{ alignItems: mine ? 'flex-end' : 'flex-start' }}>
                <Box
                  sx={{
                    maxWidth: '70%',
                    bgcolor: mine ? 'primary.main' : 'action.hover',
                    color: mine ? '#fff' : 'text.primary',
                    borderRadius: 2.5,
                    px: 1.75,
                    py: 1,
                  }}
                >
                  {isEditing ? (
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <TextField
                        size="small"
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        autoFocus
                        sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                      />
                      <IconButton size="small" onClick={() => setEditingId(null)}>
                        <CloseIcon fontSize="small" sx={{ color: mine ? '#fff' : undefined }} />
                      </IconButton>
                      <IconButton size="small" onClick={() => void handleSaveEdit(m.id)}>
                        <SendIcon fontSize="small" sx={{ color: mine ? '#fff' : undefined }} />
                      </IconButton>
                    </Stack>
                  ) : (
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {m.isDeleted ? t('chat.deletedMessage') : m.content}
                    </Typography>
                  )}
                </Box>
                <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mt: 0.25 }}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {m.isEdited && !m.isDeleted && ` · ${t('chat.edited')}`}
                  </Typography>
                  {mine && !m.isDeleted && !isEditing && (
                    <>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditingId(m.id);
                          setEditDraft(m.content ?? '');
                        }}
                      >
                        <EditIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                      <IconButton size="small" onClick={() => void handleDelete(m.id)}>
                        <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </>
                  )}
                </Stack>
              </Stack>
            );
          })}
          <div ref={bottomRef} />
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mx: 2.5, mb: 1 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {isBlocked ? (
        <Alert severity="warning" sx={{ m: 2.5, mt: 0 }}>
          {t('chat.blocked')}
        </Alert>
      ) : (
        <Stack direction="row" spacing={1} sx={{ p: 2.5, pt: 1.5 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t('chat.typeMessage')}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
          />
          <IconButton color="primary" onClick={() => void handleSend()} disabled={!draft.trim()}>
            <SendIcon />
          </IconButton>
        </Stack>
      )}
    </Box>
  );
}
