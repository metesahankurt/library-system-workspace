import { redirect } from 'next/navigation';
import { getSession, canAccessDashboard } from '@/lib/auth';
import { Dashboard11 } from '@/components/dashboard11';

export default async function DashboardPage() {
  const session = await getSession();

  if (!canAccessDashboard(session)) {
    redirect('/login');
  }

  const user = session!.user;

  return (
    <Dashboard11
      className="w-full h-full"
      user={{
        name: user.username,
        email: user.email,
      }}
    />
  );
}
