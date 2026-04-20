"use client";

import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface Navbar22Props {
  className?: string;
}

const Navbar22 = ({ className }: Navbar22Props) => {
  const [currentTime, setCurrentTime] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { name: "Home", href: "#" },
    { name: "About", href: "#about" },
    { name: "Pricing", href: "#pricing" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header className={cn("border-b border-border py-2", className)}>
      <nav className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg"
                  className="max-h-8 dark:invert"
                  alt="shadcnblocks.com"
                />
                <span className="text-lg font-semibold tracking-tighter">
                  Shadcnblocks.com
                </span>
              </div>
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
              <div className="hidden items-center space-x-2 text-sm text-muted-foreground lg:flex">
                <span className="font-medium">Erzurum</span>
                <span className="text-muted-foreground">/</span>

                <span className="font-medium">
                  {currentTime ? currentTime : "Loading"}
                </span>
              </div>
              <div className="md:hidden">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger render={<Button variant="outline" size="icon" className="text-muted-foreground hover:bg-muted hover:text-foreground" />}><Menu className="h-5 w-5" /><span className="sr-only">Open menu</span></SheetTrigger>
                  <SheetContent side="top" className="h-screen">
                    <SheetTitle></SheetTitle>
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
                            alt="shadcnblocks.com"
                          />
                          <span className="text-lg font-semibold tracking-tighter">
                            Shadcnblocks.com
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
                      </div>
                      <div className="border-t border-border pt-6">
                        <div className="text-center text-sm text-muted-foreground">
                          <div className="font-medium">Erzurum</div>
                          <div className="mt-1">
                            {currentTime ? currentTime : "Loading"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
      </nav>
    </header>
  );
};

export { Navbar22 };
