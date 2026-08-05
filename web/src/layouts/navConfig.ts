import { useTranslation } from 'react-i18next';
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
import GroupsIcon from '@mui/icons-material/GroupsOutlined';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineOutlined';
import type { SvgIconComponent } from '@mui/icons-material';
import type { UserRole } from '@/types/user';

export interface NavItemConfig {
  key: string;
  labelKey: string;
  to: string;
  icon: SvgIconComponent;
}

export interface NavItem {
  key: string;
  label: string;
  to: string;
  icon: SvgIconComponent;
}

export const CLIENT_NAV: NavItemConfig[] = [
  { key: 'dashboard', labelKey: 'nav.dashboard', to: '/app/dashboard', icon: DashboardIcon },
  { key: 'jobs', labelKey: 'nav.myJobs', to: '/app/jobs', icon: WorkIcon },
  { key: 'applications', labelKey: 'nav.applications', to: '/app/applications', icon: DescriptionIcon },
  { key: 'ai-recruiter', labelKey: 'nav.aiRecruiter', to: '/app/ai-recruiter', icon: AutoAwesomeIcon },
  { key: 'contracts', labelKey: 'nav.contracts', to: '/app/contracts', icon: HandshakeIcon },
  { key: 'messages', labelKey: 'nav.messages', to: '/app/messages', icon: ChatIcon },
  { key: 'payments', labelKey: 'nav.payments', to: '/app/payments', icon: PaymentsIcon },
  { key: 'catalogs', labelKey: 'nav.catalogs', to: '/app/catalogs', icon: StorefrontIcon },
  { key: 'favorites', labelKey: 'nav.savedTalent', to: '/app/saved', icon: FavoriteIcon },
  { key: 'categories', labelKey: 'nav.categories', to: '/app/categories', icon: LabelOutlinedIcon },
  { key: 'support', labelKey: 'nav.support', to: '/app/support', icon: HelpOutlineIcon },
  { key: 'disputes', labelKey: 'nav.disputes', to: '/app/disputes', icon: GavelIcon },
];

export const SEEKER_NAV: NavItemConfig[] = [
  { key: 'dashboard', labelKey: 'nav.dashboard', to: '/app/dashboard', icon: DashboardIcon },
  { key: 'browse', labelKey: 'nav.findWork', to: '/app/browse', icon: SearchIcon },
  { key: 'proposals', labelKey: 'nav.myProposals', to: '/app/applications', icon: DescriptionIcon },
  { key: 'contracts', labelKey: 'nav.contracts', to: '/app/contracts', icon: HandshakeIcon },
  { key: 'messages', labelKey: 'nav.messages', to: '/app/messages', icon: ChatIcon },
  { key: 'payments', labelKey: 'nav.wallet', to: '/app/payments', icon: PaymentsIcon },
  { key: 'catalogs', labelKey: 'nav.myCatalog', to: '/app/catalogs', icon: StorefrontIcon },
  { key: 'favorites', labelKey: 'nav.savedJobs', to: '/app/saved', icon: FavoriteIcon },
  { key: 'categories', labelKey: 'nav.categories', to: '/app/categories', icon: LabelOutlinedIcon },
  { key: 'support', labelKey: 'nav.support', to: '/app/support', icon: HelpOutlineIcon },
  { key: 'disputes', labelKey: 'nav.disputes', to: '/app/disputes', icon: GavelIcon },
];

export const SA_NAV: NavItemConfig[] = [
  { key: 'dashboard', labelKey: 'nav.dashboard', to: '/app/admin', icon: DashboardIcon },
  { key: 'users', labelKey: 'nav.users', to: '/app/admin/users', icon: PeopleIcon },
  { key: 'kyc', labelKey: 'nav.approvalsQueue', to: '/app/admin/approvals', icon: VerifiedUserIcon },
  { key: 'moderation', labelKey: 'nav.moderation', to: '/app/admin/moderation', icon: FlagIcon },
  { key: 'reports', labelKey: 'nav.reports', to: '/app/admin/reports', icon: FlagIcon },
  { key: 'disputes', labelKey: 'nav.disputes', to: '/app/admin/disputes', icon: GavelIcon },
  { key: 'categories', labelKey: 'nav.categories', to: '/app/admin/categories', icon: CategoryIcon },
  { key: 'analytics', labelKey: 'nav.analytics', to: '/app/admin/analytics', icon: BarChartIcon },
  { key: 'config', labelKey: 'nav.config', to: '/app/admin/config', icon: TuneIcon },
  { key: 'team', labelKey: 'nav.team', to: '/app/admin/team', icon: GroupsIcon },
];

function navConfigForRole(role: UserRole): NavItemConfig[] {
  if (role === 'SUPER_ADMIN') return SA_NAV;
  if (role === 'CLIENT') return CLIENT_NAV;
  return SEEKER_NAV;
}

/** Resolves the nav item config for a role into translated display items. */
export function useNavForRole(role: UserRole): NavItem[] {
  const { t } = useTranslation();
  return navConfigForRole(role).map((item) => ({ ...item, label: t(item.labelKey) }));
}
