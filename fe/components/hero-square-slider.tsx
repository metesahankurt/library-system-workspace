"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SliderItem {
  id: number;
  title: string;
  image: string;
  buttonText: string;
  link?: string;
}

const STRAPI_URL = "http://localhost:1337";

const DEFAULT_ITEMS: SliderItem[] = [
  {
    id: 1,
    title: "Modern Kütüphaneler",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800",
    buttonText: "Keşfet",
    link: "/kutuphane",
  },
  {
    id: 2,
    title: "Klasik Koleksiyonlar",
    image: "https://images.unsplash.com/photo-1461360228754-6e81c478585b?auto=format&fit=crop&q=80&w=800",
    buttonText: "İncele",
    link: "/kutuphane",
  },
  {
    id: 3,
    title: "Dijital Arşivler",
    image: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800",
    buttonText: "Göz At",
    link: "/kutuphane",
  },
];

export function HeroSquareSlider() {
  const [items, setItems] = React.useState<SliderItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchSliders() {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      try {
        setIsLoading(true);
        const res = await fetch(`${STRAPI_URL}/api/sliders?populate=*`, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        const data = await res.json();
        if (data.data && data.data.length > 0) {
          const fetchedItems = data.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            image: item.image?.url ? `${STRAPI_URL}${item.image.url}` : DEFAULT_ITEMS[0].image,
            buttonText: "İncele",
            link: item.link || "/",
          }));
          setItems(fetchedItems);
        } else {
          setItems(DEFAULT_ITEMS);
        }
      } catch (e) {
        console.error("Error fetching sliders:", e);
        setItems(DEFAULT_ITEMS);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSliders();
  }, []);

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center py-32 bg-background">
        <div className="h-96 w-[90vw] animate-pulse rounded-[3rem] bg-zinc-100 md:w-[45rem]" />
      </div>
    );
  }

  // Triple the items to ensure smooth infinite loop
  const doubledItems = items.length > 1 ? [...items, ...items, ...items] : items;
  const isAnimated = items.length > 1;

  return (
    <div className="relative w-full overflow-hidden bg-background py-16">
      <div className="flex select-none justify-center">
        <motion.div
          animate={isAnimated ? {
            x: [0, "-33.3333%"],
          } : {}}
          transition={{
            duration: items.length * 40, // Adjusted for wider cards
            ease: "linear",
            repeat: Infinity,
          }}
          className={cn(
            "flex gap-12 whitespace-nowrap px-6",
            !isAnimated && "justify-center"
          )}
        >
          {doubledItems.map((item, index) => (
            <a
              href={item.link || "#"}
              key={`${item.id}-${index}`}
              className="relative aspect-[16/10] w-[85vw] overflow-hidden rounded-[3.5rem] border-4 border-white shadow-2xl bg-muted group md:w-[45rem] cursor-pointer"
            >
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <h3 className="mb-6 text-lg font-black uppercase tracking-[0.2em] text-white drop-shadow-lg">
                  {item.title}
                </h3>
                <Button 
                  className="rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white hover:text-black font-black text-xs uppercase tracking-widest transition-all duration-300 px-8 py-6 shadow-xl"
                >
                  {item.buttonText} <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            </a>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
