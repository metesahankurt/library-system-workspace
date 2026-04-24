"use client";
import { LayoutDashboard, LogOut, Menu, UserCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const LOGO = {
  url: "/",
  src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg",
  alt: "Kütüphane",
  title: "Kütüphane Sistemi",
};

const NAV_LINKS = [
  { name: "Ana Sayfa", href: "/" },
  { name: "Kütüphane", href: "/kutuphane" },
  { name: "Hakkında", href: "/about" },
  { name: "İletişim", href: "/contact" },
];

const NAV_BUTTONS: {
  label: string;
  url: string;
  variant: "ghost" | "default" | "link" | "destructive" | "outline" | "secondary";
}[] = [
    { label: "Giriş Yap", url: "/login", variant: "ghost" },
    { label: "Kayıt Ol", url: "/register", variant: "default" },
  ];

const MOBILE_BREAKPOINT = 1024;

interface Navbar8Props {
  className?: string;
  isLoggedIn: boolean;
  username?: string;
  showDashboard: boolean;
}

const Navbar8 = ({ className, isLoggedIn, username, showDashboard }: Navbar8Props) => {
  const [open, setOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await logoutAction();
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > MOBILE_BREAKPOINT) {
        setOpen(false);
      }
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    handleResize();
    handleScroll();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  return (
    <section className={cn("", className)}>
      <div
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-500",
          scrolled ? "bg-background/95 shadow-sm backdrop-blur-sm" : "bg-transparent",
        )}
      >
        <div className="mx-auto w-full max-w-7xl border-b px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <a
              href={LOGO.url}
              className="flex shrink-0 items-center gap-2 text-lg font-semibold tracking-tighter"
            >
              <img
                src={LOGO.src}
                alt={LOGO.alt}
                className="inline-block max-h-8 dark:invert"
              />
              <span className="hidden sm:inline-block">{LOGO.title}</span>
            </a>

            {/* Desktop nav links */}
            <NavigationMenu className="hidden lg:flex [&>div:nth-child(2)]:left-1/2 [&>div:nth-child(2)]:-translate-x-1/2">
              <NavigationMenuList>
                {NAV_LINKS.map((link, index) => (
                  <NavigationMenuItem
                    key={`desktop-link-${index}`}
                    value={`${index}`}
                    className={`${navigationMenuTriggerStyle()} bg-transparent`}
                  >
                    <NavigationMenuLink href={link.href}>{link.name}</NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            {/* Desktop right: auth actions */}
            <div className="hidden lg:flex items-center gap-2">
              {showDashboard && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/dashboard")}
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
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5 text-sm font-medium text-foreground">
                      {username}
                    </div>
                    <DropdownMenuSeparator />
                    {showDashboard && (
                      <DropdownMenuItem onClick={() => router.push("/dashboard")}>
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
                <>
                  {NAV_BUTTONS.map((button, index) => (
                    <Button
                      key={`nav-button-${index}`}
                      variant={button.variant}
                      render={<a href={button.url} />}
                      nativeButton={false}
                    >
                      {button.label}
                    </Button>
                  ))}
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <div className="lg:hidden">
              <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile fullscreen menu */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          aria-describedby={undefined}
          side="top"
          className="inset-0 z-[600] h-dvh w-full bg-primary text-primary-foreground [&>button]:hidden"
        >
          <div className="flex h-full flex-col overflow-y-auto">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
              <div className="absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0">
                <SheetTitle className="text-primary">Mobil Menü</SheetTitle>
              </div>

              {/* Close button */}
              <div className="flex justify-end pt-5">
                <SheetClose
                  render={
                    <Button
                      size="icon"
                      className="size-9 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30"
                    />
                  }
                >
                  <X className="h-5 w-5" />
                </SheetClose>
              </div>

              {/* Nav links */}
              <div className="flex flex-col justify-between gap-12 pt-16 pb-12">
                <ul className="flex flex-col gap-6">
                  {NAV_LINKS.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="text-2xl font-medium leading-normal text-primary-foreground hover:opacity-80 transition-opacity"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                  {showDashboard && (
                    <li>
                      <a
                        href="/dashboard"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 text-2xl font-medium leading-normal text-primary-foreground hover:opacity-80 transition-opacity"
                      >
                        <LayoutDashboard className="h-6 w-6" />
                        Yönetim Paneli
                      </a>
                    </li>
                  )}
                </ul>

                {/* Auth section */}
                <div className="border-t border-primary-foreground/20 pt-6">
                  {isLoggedIn ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2 text-primary-foreground/70">
                        <UserCircle className="h-5 w-5" />
                        <span className="text-base">{username}</span>
                      </div>
                      <button
                        onClick={() => {
                          setOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="text-base font-medium">Çıkış Yap</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {NAV_BUTTONS.map((button, index) => (
                        <a
                          key={`mobile-auth-${index}`}
                          href={button.url}
                          onClick={() => setOpen(false)}
                          className="text-2xl font-medium leading-normal text-primary-foreground hover:opacity-80 transition-opacity"
                        >
                          {button.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
};

export { Navbar8 };
