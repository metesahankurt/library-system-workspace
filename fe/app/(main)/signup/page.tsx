import { Signup4 } from '@/components/signup4';

export default function SignupPage() {
  return (
    <main className="flex flex-1">
      <Signup4
        heading="Hesap Oluştur"
        logo={{
          url: '/',
          src: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg',
          alt: 'Logo',
          title: 'Kütüphane Sistemi',
        }}
        signupText="Hesap Oluştur"
        loginText="Zaten hesabınız var mı?"
        loginUrl="/login"
        className="flex-1"
      />
    </main>
  );
}
