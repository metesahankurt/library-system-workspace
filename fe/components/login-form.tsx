'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { loginAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface LoginFormProps {
  heading?: string;
  logoSrc?: string;
  logoAlt?: string;
  logoTitle?: string;
  logoUrl?: string;
  className?: string;
}

export function LoginForm({
  heading = 'Kütüphane Girişi',
  logoSrc = 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg',
  logoAlt = 'Logo',
  logoTitle = 'Kütüphane Sistemi',
  logoUrl = '/',
  className,
}: LoginFormProps) {
  const [state, action, isPending] = useActionState(loginAction, undefined as { error: string } | undefined);

  return (
    <section
      className={cn(
        'flex flex-1 items-center justify-center bg-background px-4 py-12',
        className,
      )}
    >
      <div className="flex w-full flex-col items-center gap-6">
        <form action={action} className="w-full max-w-sm">
          <div className="flex w-full flex-col items-center gap-y-4 rounded-xl border border-border bg-card px-8 py-10 shadow-sm">
            <a href={logoUrl}>
              <img src={logoSrc} alt={logoAlt} title={logoTitle} className="h-10 dark:invert" />
            </a>

            {heading && <h1 className="text-2xl font-semibold">{heading}</h1>}

            {state?.error && (
              <div className="w-full rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
                {state.error}
              </div>
            )}

            <div className="flex w-full flex-col gap-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="ornek@email.com"
                className="text-sm"
                required
                autoComplete="email"
              />
            </div>

            <div className="flex w-full flex-col gap-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="text-sm"
                required
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Giriş yapılıyor…' : 'Giriş Yap'}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
