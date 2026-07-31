import DashboardIcon from '@mui/icons-material/SpaceDashboardOutlined';
import WorkIcon from '@mui/icons-material/WorkOutlineOutlined';
import SearchIcon from '@mui/icons-material/SearchOutlined';
import DescriptionIcon from '@mui/icons-material/DescriptionOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeOutlined';
import HandshakeIcon from '@mui/icons-material/HandshakeOutlined';
import ChatIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import PaymentsIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import FavoriteIcon from '@mui/icons-material/FavoriteBorderOutlined';
import CategoryIcon from '@mui/icons-material/CategoryOutlined';
import StorefrontIcon from '@mui/icons-material/StorefrontOutlined';
import GavelIcon from '@mui/icons-material/GavelOutlined';
import PeopleIcon from '@mui/icons-material/PeopleOutlineOutlined';
import FlagIcon from '@mui/icons-material/OutlinedFlag';
import BarChartIcon from '@mui/icons-material/BarChartOutlined';
import TuneIcon from '@mui/icons-material/TuneOutlined';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUserOutlined';
import type { SvgIconComponent } from '@mui/icons-material';
import type { UserRole } from '@/types/user';

export interface NavItem {
  key: string;
  label: string;
  to: string;
  icon: SvgIconComponent;
}

export const CLIENT_NAV: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', to: '/app/dashboard', icon: DashboardIcon },
  { key: 'jobs', label: 'My Jobs', to: '/app/jobs', icon: WorkIcon },
  { key: 'applications', label: 'Applications', to: '/app/applications', icon: DescriptionIcon },
  { key: 'ai-recruiter', label: 'AI Recruiter', to: '/app/ai-recruiter', icon: AutoAwesomeIcon },
  { key: 'contracts', label: 'Contracts', to: '/app/contracts', icon: HandshakeIcon },
  { key: 'messages', label: 'Messages', to: '/app/messages', icon: ChatIcon },
  { key: 'payments', label: 'Payments', to: '/app/payments', icon: PaymentsIcon },
  { key: 'catalogs', label: 'Catalogs', to: '/app/catalogs', icon: StorefrontIcon },
  { key: 'favorites', label: 'Saved Talent', to: '/app/saved', icon: FavoriteIcon },
  { key: 'disputes', label: 'Disputes', to: '/app/disputes', icon: GavelIcon },
];

export const SEEKER_NAV: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', to: '/app/dashboard', icon: DashboardIcon },
  { key: 'browse', label: 'Find Work', to: '/app/browse', icon: SearchIcon },
  { key: 'proposals', label: 'My Proposals', to: '/app/applications', icon: DescriptionIcon },
  { key: 'contracts', label: 'Contracts', to: '/app/contracts', icon: HandshakeIcon },
  { key: 'messages', label: 'Messages', to: '/app/messages', icon: ChatIcon },
  { key: 'payments', label: 'Wallet', to: '/app/payments', icon: PaymentsIcon },
  { key: 'catalogs', label: 'My Catalog', to: '/app/catalogs', icon: StorefrontIcon },
  { key: 'favorites', label: 'Saved Jobs', to: '/app/saved', icon: FavoriteIcon },
  { key: 'disputes', label: 'Disputes', to: '/app/disputes', icon: GavelIcon },
];

export const SA_NAV: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', to: '/app/admin', icon: DashboardIcon },
  { key: 'users', label: 'Users', to: '/app/admin/users', icon: PeopleIcon },
  { key: 'kyc', label: 'Approvals Queue', to: '/app/admin/approvals', icon: VerifiedUserIcon },
  { key: 'moderation', label: 'Moderation', to: '/app/admin/moderation', icon: FlagIcon },
  { key: 'reports', label: 'Reports', to: '/app/admin/reports', icon: FlagIcon },
  { key: 'disputes', label: 'Disputes', to: '/app/admin/disputes', icon: GavelIcon },
  { key: 'categories', label: 'Categories', to: '/app/admin/categories', icon: CategoryIcon },
  { key: 'analytics', label: 'Analytics', to: '/app/admin/analytics', icon: BarChartIcon },
  { key: 'config', label: 'Commission & Config', to: '/app/admin/config', icon: TuneIcon },
];

export function navForRole(role: UserRole): NavItem[] {
  if (role === 'SUPER_ADMIN') return SA_NAV;
  if (role === 'CLIENT') return CLIENT_NAV;
  return SEEKER_NAV;
}
