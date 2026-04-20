import { getSession, canAccessDashboard } from '@/lib/auth';
import { NavbarClient } from '@/components/navbar-client';

export async function Navbar22({ className }: { className?: string }) {
  const session = await getSession();
  const showDashboard = canAccessDashboard(session);

  return (
    <NavbarClient
      className={className}
      isLoggedIn={!!session}
      username={session?.user?.username}
      showDashboard={showDashboard}
    />
  );
}
