import { Navbar22 } from '@/components/navbar22';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar22 />
      {children}
    </>
  );
}
