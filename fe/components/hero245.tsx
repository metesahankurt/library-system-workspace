"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import React from "react";

import { PointerHighlight } from "@/components/ui/pointer-highlight";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface Hero245Props {
  className?: string;
}

const Hero245 = ({ className }: Hero245Props) => {
  const isMobile = useIsMobile();

  return (
    <section
      className={cn("relative w-full overflow-hidden py-32", className)}
    >
      <div className="relative z-10 container mx-auto h-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-10 flex items-center justify-center gap-3 rounded-full bg-muted-foreground/5 p-1 pr-4 text-sm font-medium tracking-tight text-muted-foreground">
            <div className="flex items-center gap-3 rounded-full bg-muted-foreground/10 px-4 py-1.5">
              <span className="inline-block size-2 rounded-full bg-blue-500" />
              <span>We're Hiring</span>
            </div>
            <div className="flex items-center gap-2">
              Join Our Team <ArrowRight className="size-4" />
            </div>
          </div>
          <h1 className="max-w-5xl font-playfair text-6xl font-medium tracking-tight lg:text-9xl">
            Bilginin Kapılarını,
            <PointerHighlight containerClassName="inline-block px-4">
              <span className="italic text-primary">Dijitalle</span>
            </PointerHighlight>
            Aralayın
          </h1>
          <p className="mt-12 max-w-2xl text-xl font-medium text-muted-foreground/80 tracking-tight leading-relaxed">
            Binlerce kitap, sınırsız bilgi ve modern kütüphane deneyimi 
            artık parmaklarınızın ucunda. Keşfetmeye hemen başlayın.
          </p>

          <div className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
            <Button className="rounded-2xl px-8 py-8 text-lg font-black uppercase tracking-widest shadow-2xl transition-all hover:scale-105">
              Kitapları Keşfet
            </Button>
            <Button variant="outline" className="rounded-2xl px-8 py-8 text-lg font-black uppercase tracking-widest border-2 transition-all hover:bg-zinc-50">
              Üye Ol
            </Button>
          </div>
        </div>
        <div className="relative mt-20 flex h-[80vh] w-full items-center justify-center overflow-hidden rounded-[4rem] border-8 border-white shadow-2xl bg-zinc-100">
          <video
            src="https://assets.mixkit.co/videos/preview/mixkit-library-with-many-shelves-and-books-39824-large.mp4"
            poster="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=2000"
            autoPlay
            loop
            muted
            playsInline
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>
      </div>
      <div className="absolute inset-0 flex h-full w-full items-center justify-between">
        {Array.from({ length: isMobile ? 8 : 18 }).map((_, index) => (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            key={index}
            className="h-full w-10 bg-gradient-to-l from-transparent to-muted/50"
          ></motion.div>
        ))}
      </div>
    </section>
  );
};

export { Hero245 };
