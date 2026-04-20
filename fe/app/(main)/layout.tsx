import { Navbar22 } from '@/components/navbar22';
import { Footer50 } from '@/components/footer50';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar22 />
      {children}
      <Footer50 />
    </>
  );
}
