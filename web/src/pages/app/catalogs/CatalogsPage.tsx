import { useAppSelector } from '@/app/hooks';
import MyCatalogsView from './MyCatalogsView';
import BrowseCatalogsView from './BrowseCatalogsView';

export default function CatalogsPage() {
  const user = useAppSelector((s) => s.auth.user);
  return user?.activeRole === 'SEEKER' ? <MyCatalogsView /> : <BrowseCatalogsView />;
}
