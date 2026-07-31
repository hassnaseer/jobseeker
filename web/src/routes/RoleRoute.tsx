import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import type { UserRole } from '@/types/user';

interface Props {
  allow: UserRole[];
}

export default function RoleRoute({ allow }: Props) {
  const user = useAppSelector((s) => s.auth.user);
  if (!user || !allow.includes(user.activeRole)) {
    return <Navigate to="/app/dashboard" replace />;
  }
  return <Outlet />;
}
