"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface BookCover3DProps {
  frontUrl: string;
  backUrl?: string;
  title: string;
  categoryGradient?: string;
}

export function BookCover3D({ frontUrl, backUrl, title, categoryGradient }: BookCover3DProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative w-full aspect-[0.7] cursor-pointer perspective-1000 group"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className={cn(
          "relative w-full h-full transition-transform duration-700 preserve-3d shadow-2xl rounded-r-lg overflow-hidden",
          isFlipped ? "rotate-y-180" : ""
        )}
      >
        {/* Front Cover */}
        <div className="absolute inset-0 backface-hidden z-20">
          <img 
            src={frontUrl} 
            alt={`${title} Front`} 
            className="w-full h-full object-cover rounded-r-lg"
          />
          {/* Spine Highlight */}
          <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/20 to-transparent z-30" />
        </div>

        {/* Back Cover */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 z-10">
          {backUrl ? (
            <img 
              src={backUrl} 
              alt={`${title} Back`} 
              className="w-full h-full object-cover rounded-l-lg"
            />
          ) : (
            <div className={cn("w-full h-full bg-gradient-to-br flex items-center justify-center p-6 text-white text-center rounded-l-lg", categoryGradient || "from-zinc-800 to-zinc-600")}>
              <div className="space-y-4">
                <div className="h-1 w-12 bg-white/30 mx-auto rounded-full" />
                <p className="text-xs font-medium opacity-80 uppercase tracking-widest">{title}</p>
                <div className="h-20 w-px bg-white/10 mx-auto" />
                <p className="text-[10px] opacity-60">Arka kapak görseli bulunmuyor</p>
              </div>
            </div>
          )}
          {/* Spine Highlight (inverted for back) */}
          <div className="absolute inset-y-0 right-0 w-2 bg-gradient-to-l from-black/20 to-transparent z-30" />
        </div>
      </div>

      {/* Shadow/Reflection */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-4/5 h-4 bg-black/20 blur-xl rounded-full scale-x-150 opacity-50 group-hover:opacity-100 transition-opacity" />
      
      {/* Interaction Hint */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black uppercase tracking-widest text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
        Çevirmek için tıklayın
      </div>
    </div>
  );
}
