'use client';

import { Menu, UserCircle, LayoutDashboard, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { logoutAction } from '@/app/actions/auth';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface NavbarClientProps {
  className?: string;
  isLoggedIn: boolean;
  username?: string;
  showDashboard: boolean;
}

const navLinks = [
  { name: 'Ana Sayfa', href: '/' },
  { name: 'Kütüphane', href: '/kutuphane' },
  { name: 'Hakkında', href: '/about' },
  { name: 'İletişim', href: '/contact' },
];

export function NavbarClient({
  className,
  isLoggedIn,
  username,
  showDashboard,
}: NavbarClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await logoutAction();
  }

  return (
    <header className={cn('border-b border-border py-2', className)}>
      <nav className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img
              src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg"
              className="max-h-8 dark:invert"
              alt="Kütüphane"
            />
            <span className="text-lg font-semibold tracking-tighter">
              Kütüphane Sistemi
            </span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden items-center space-x-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="group relative inline-block h-6 overflow-hidden text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <span className="block transition-transform duration-300 group-hover:-translate-y-full">
                  {link.name}
                </span>
                <span className="absolute left-0 block w-full border-border border-primary transition-transform duration-300 group-hover:translate-y-[-100%] group-hover:border-b">
                  {link.name}
                </span>
              </a>
            ))}
          </div>

          {/* Desktop right: user icon or login */}
          <div className="hidden lg:flex items-center gap-2">
            {showDashboard && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/dashboard')}
                title="Yönetim Paneli"
              >
                <LayoutDashboard className="h-5 w-5" />
                <span className="sr-only">Yönetim Paneli</span>
              </Button>
            )}

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      title={username}
                    />
                  }
                >
                  <UserCircle className="h-6 w-6" />
                  <span className="sr-only">Hesap menüsü</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 min-w-[12rem]">
                  <div className="px-2 py-1.5 text-sm font-medium text-foreground">
                    {username}
                  </div>
                  <DropdownMenuSeparator />
                  {showDashboard && (
                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Yönetim Paneli
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => router.push('/login')}>Giriş Yap</Button>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-muted-foreground hover:bg-muted hover:text-foreground"
                  />
                }
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menüyü aç</span>
              </SheetTrigger>
              <SheetContent side="top" className="h-screen">
                <SheetTitle />
                <div className="m-4 flex flex-col space-y-6">
                  <div className="ml-3">
                    <a
                      href="/"
                      className="flex items-center justify-start gap-2 text-2xl font-bold text-foreground"
                      onClick={() => setIsOpen(false)}
                    >
                      <img
                        src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg"
                        className="max-h-8 dark:invert"
                        alt="Kütüphane"
                      />
                      <span className="text-lg font-semibold tracking-tighter">
                        Kütüphane Sistemi
                      </span>
                    </a>
                  </div>

                  <div className="flex flex-col space-y-4">
                    {navLinks.map((link) => (
                      <a
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="rounded-lg px-4 py-2 text-lg font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        {link.name}
                      </a>
                    ))}
                    {showDashboard && (
                      <a
                        href="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 text-lg font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <LayoutDashboard className="h-5 w-5" />
                        Yönetim Paneli
                      </a>
                    )}
                  </div>

                  <div className="border-t border-border pt-6">
                    {isLoggedIn ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 px-4 text-sm text-muted-foreground">
                          <UserCircle className="h-5 w-5" />
                          {username}
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setIsOpen(false);
                            handleLogout();
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Çıkış Yap
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => {
                          setIsOpen(false);
                          router.push('/login');
                        }}
                      >
                        Giriş Yap
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
