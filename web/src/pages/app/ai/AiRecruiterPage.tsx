import { useAppSelector } from '@/app/hooks';
import SeekerAiView from './SeekerAiView';
import ClientAiView from './ClientAiView';

export default function AiRecruiterPage() {
  const user = useAppSelector((s) => s.auth.user);
  return user?.activeRole === 'CLIENT' ? <ClientAiView /> : <SeekerAiView />;
}
