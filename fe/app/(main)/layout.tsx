import { getSession, canAccessDashboard } from '@/lib/auth';
import { Navbar8 } from '@/components/navbar8';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const showDashboard = canAccessDashboard(session);

  return (
    <>
      <Navbar8
        isLoggedIn={!!session}
        username={session?.user?.username}
        showDashboard={showDashboard}
      />
      <div className="pt-16">{children}</div>
    </>
  );
}
