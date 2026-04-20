import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <main className="flex flex-1">
      <LoginForm
        heading="Kütüphane Sistemi"
        logoUrl="/"
        className="flex-1"
      />
    </main>
  );
}
