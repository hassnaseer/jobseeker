import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Badge,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout, switchRole } from '@/features/auth/actions';
import { useNavForRole } from './navConfig';
import { fetchUnreadCount } from '@/features/notifications/actions';
import { fetchTotalUnread } from '@/features/chat/actions';
import { useThemeMode } from '@/theme/ThemeModeProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import PageTransition from '@/components/PageTransition';

const SIDEBAR_WIDTH = 236;
const UNREAD_POLL_MS = 20000;

export default function AppLayout() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const { resolvedMode, setMode } = useThemeMode();
  const unreadCount = useAppSelector((s) => s.notifications.unreadCount);
  const chatUnread = useAppSelector((s) => s.chat.totalUnread);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const navItems = useNavForRole(user?.activeRole ?? 'SEEKER');

  useEffect(() => {
    void dispatch(fetchUnreadCount());
    void dispatch(fetchTotalUnread());
    const interval = setInterval(() => {
      void dispatch(fetchUnreadCount());
      void dispatch(fetchTotalUnread());
    }, UNREAD_POLL_MS);
    return () => clearInterval(interval);
  }, [dispatch]);

  if (!user) return null;
  const initials = `${user.firstName?.[0] ?? user.email[0]}${user.lastName?.[0] ?? ''}`.toUpperCase();

  const handleLogout = async () => {
    setMenuAnchor(null);
    await dispatch(logout());
    navigate('/login', { replace: true });
  };

  const otherRole = user.roles.find((r) => r !== user.activeRole);

  const handleSwitchRole = async () => {
    if (!otherRole) return;
    setMenuAnchor(null);
    await dispatch(switchRole(otherRole));
    navigate('/app/dashboard');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box
        className="jl-sidebar"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          bgcolor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          p: '20px 14px',
        }}
      >
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', mb: 3, px: 0.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '9px',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 900,
              fontSize: 16,
            }}
          >
            J
          </Box>
          <Typography
            className="jl-sidebar-label"
            sx={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}
          >
            {t('common.appName')}
          </Typography>
        </Stack>

        <Stack spacing={0.5} sx={{ flex: 1 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.to}
              style={({ isActive }) => ({
                textDecoration: 'none',
                color: isActive ? '#5B5FEF' : '#1B1B21',
              })}
            >
              {({ isActive }) => (
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{
                    alignItems: 'center',
                    px: 1.5,
                    py: 1.1,
                    borderRadius: 2.5,
                    bgcolor: isActive ? 'rgba(91,95,239,0.08)' : 'transparent',
                    transition: 'background-color 160ms ease, transform 120ms ease',
                    '&:hover': {
                      bgcolor: isActive ? 'rgba(91,95,239,0.08)' : 'action.hover',
                      transform: 'translateX(2px)',
                    },
                  }}
                >
                  <item.icon fontSize="small" />
                  <Typography
                    className="jl-sidebar-label"
                    sx={{ fontSize: 14, fontWeight: 600, flex: 1 }}
                  >
                    {item.label}
                  </Typography>
                  {item.key === 'messages' && chatUnread > 0 && (
                    <Badge badgeContent={chatUnread} color="error" />
                  )}
                </Stack>
              )}
            </NavLink>
          ))}
        </Stack>

        <Box
          onClick={handleLogout}
          sx={{
            px: 1.5,
            py: 1.1,
            borderRadius: 2.5,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            color: 'text.secondary',
            transition: 'background-color 160ms ease',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <LogoutOutlinedIcon fontSize="small" />
          <Typography className="jl-sidebar-label" sx={{ fontSize: 14, fontWeight: 600 }}>
            {t('shell.signOut')}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 4,
            py: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Chip
              label={user.activeRole.replace('_', ' ')}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Stack>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <LanguageSwitcher />
            <Tooltip title={t(resolvedMode === 'dark' ? 'shell.switchToLight' : 'shell.switchToDark')}>
              <IconButton onClick={() => setMode(resolvedMode === 'dark' ? 'light' : 'dark')} size="small">
                {resolvedMode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
              </IconButton>
            </Tooltip>
            {otherRole && (
              <Tooltip title={t('shell.switchTo', { role: otherRole })}>
                <IconButton onClick={handleSwitchRole} size="small">
                  <SwapHorizOutlinedIcon />
                </IconButton>
              </Tooltip>
            )}
            <IconButton onClick={() => navigate('/app/notifications')} size="small">
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsOutlinedIcon />
              </Badge>
            </IconButton>
            <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} size="small">
              <Avatar src={user.avatarUrl ?? undefined} sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13 }}>
                {initials}
              </Avatar>
            </IconButton>
            <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
              <MenuItem
                onClick={() => {
                  setMenuAnchor(null);
                  navigate('/app/profile');
                }}
              >
                {t('shell.profileSettings')}
              </MenuItem>
              <MenuItem onClick={handleLogout}>{t('shell.signOut')}</MenuItem>
            </Menu>
          </Stack>
        </Stack>

        <Box className="jl-main" sx={{ flex: 1, overflowY: 'auto', p: '28px 32px 60px' }}>
          <PageTransition />
        </Box>
      </Box>
    </Box>
  );
}
