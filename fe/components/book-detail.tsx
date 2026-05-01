"use client";

import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Book as BookIcon, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  Bookmark,
  Layers,
  Calendar,
  Hash,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BookDetailProps {
  book: {
    id: number;
    title: string;
    author: string;
    publisher: string;
    publishYear: number;
    isbn: string;
    bookCode: string;
    availableQty: number;
    quantity: number;
    pageCount: number;
    shelfCode: string;
    description: string;
    frontCoverUrl: string;
    backCoverUrl: string;
    category: string;
  };
}

export function BookDetail({ book }: BookDetailProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12 bg-background/50 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* 3D Flip Cover Experience */}
        <div className="flex flex-col items-center gap-8">
          <div 
            className="relative w-[320px] h-[480px] cursor-pointer group"
            onClick={() => setIsFlipped(!isFlipped)}
            style={{ perspective: "1500px" }}
          >
            <motion.div
              className="w-full h-full relative transition-all duration-700"
              style={{ transformStyle: "preserve-3d" }}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
              {/* Front Cover */}
              <div 
                className="absolute inset-0 backface-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] rounded-r-2xl overflow-hidden border-y border-r border-white/20"
                style={{ backfaceVisibility: "hidden" }}
              >
                <img 
                  src={book.frontCoverUrl} 
                  alt="Ön Kapak" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none" />
                <div className="absolute left-0 inset-y-0 w-2 bg-gradient-to-r from-black/30 to-transparent" />
              </div>

              {/* Back Cover */}
              <div 
                className="absolute inset-0 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] rounded-l-2xl overflow-hidden border-y border-l border-white/20"
                style={{ 
                  transform: "rotateY(180deg)",
                  backfaceVisibility: "hidden"
                }}
              >
                <img 
                  src={book.backCoverUrl || book.frontCoverUrl} 
                  alt="Arka Kapak" 
                  className="w-full h-full object-cover grayscale-[0.2] brightness-[0.4]"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-white/90 text-sm leading-relaxed italic text-center font-medium">
                  <div className="w-12 h-1 bg-white/30 mb-6 rounded-full" />
                  <p className="line-clamp-[12]">
                    {book.description || "Bu eser için henüz bir açıklama girilmemiştir."}
                  </p>
                  <div className="w-12 h-1 bg-white/30 mt-6 rounded-full" />
                </div>
              </div>
            </motion.div>
            
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 animate-pulse bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
              {isFlipped ? "Kapağı Gör" : "Arka Yüzü Gör"}
            </div>
          </div>

          <div className="flex gap-6 mt-4">
            <div className="p-5 bg-gradient-to-br from-primary/5 to-primary/10 rounded-[1.5rem] flex flex-col items-center w-36 border border-primary/20 shadow-lg shadow-primary/5">
              <span className="text-[9px] uppercase font-black tracking-widest text-primary/60 mb-2">Raf Kodu</span>
              <span className="font-mono text-xl font-black text-primary tracking-tighter">{book.shelfCode}</span>
            </div>
            <div className="p-5 bg-gradient-to-br from-primary/5 to-primary/10 rounded-[1.5rem] flex flex-col items-center w-36 border border-primary/20 shadow-lg shadow-primary/5">
              <span className="text-[9px] uppercase font-black tracking-widest text-primary/60 mb-2">Barkod ID</span>
              <span className="font-mono text-xl font-black text-primary tracking-tighter">{book.bookCode.slice(-4)}</span>
            </div>
          </div>
        </div>

        {/* Info Content */}
        <div className="space-y-10 lg:pl-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
              <Bookmark className="size-3 fill-current" />
              {book.category}
            </div>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tighter leading-none bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              {book.title}
            </h1>
            <p className="text-2xl text-muted-foreground/80 font-bold tracking-tight">
              {book.author}
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className={cn(
              "flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-sm tracking-tight border-2 transition-all shadow-lg",
              book.availableQty > 0 
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-emerald-500/5" 
                : "bg-rose-500/10 text-rose-600 border-rose-500/20 shadow-rose-500/5"
            )}>
              {book.availableQty > 0 ? <CheckCircle2 className="size-5" /> : <Clock className="size-5" />}
              {book.availableQty > 0 ? "ÖDÜNÇ ALINABİLİR" : "ŞU AN KÜTÜPHANEDE YOK"}
            </div>
            <div className="px-6 py-3 rounded-2xl bg-muted/50 font-black text-sm tracking-tight text-muted-foreground border-2 border-white/5">
              {book.availableQty} / {book.quantity} KOPYA MEVCUT
            </div>
          </div>

          <p className="text-muted-foreground/90 leading-relaxed text-lg font-medium">
            {book.description || "Bu muhteşem eser kütüphanemizin nadide parçalarından biridir. Okuyucularımıza zengin bir içerik sunan bu kitabı mutlaka keşfedin."}
          </p>

          <div className="grid grid-cols-2 gap-6 pt-6">
            <Button size="lg" className="h-16 text-lg font-black tracking-tight shadow-2xl shadow-primary/30 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all" disabled={book.availableQty === 0}>
              HEMEN ÖDÜNÇ AL
            </Button>
            <Button size="lg" variant="outline" className="h-16 text-lg font-black tracking-tight rounded-2xl border-2 hover:bg-muted/50 hover:scale-[1.02] active:scale-[0.98] transition-all" disabled={book.availableQty > 0}>
              SIRAYA GİR (REZERVASYON)
            </Button>
          </div>

          {/* Technical Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-8 gap-x-4 p-8 bg-muted/30 rounded-[2rem] border border-white/10 mt-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
               <BookIcon className="size-32" />
            </div>
            
            <div className="space-y-2 relative">
              <span className="text-[10px] uppercase font-black tracking-widest opacity-40 flex items-center gap-1.5">
                <Layers className="size-3 text-primary" /> Yayınevi
              </span>
              <div className="font-bold text-base truncate pr-2">{book.publisher}</div>
            </div>
            <div className="space-y-2 relative">
              <span className="text-[10px] uppercase font-black tracking-widest opacity-40 flex items-center gap-1.5">
                <Calendar className="size-3 text-primary" /> Yayın Yılı
              </span>
              <div className="font-bold text-base">{book.publishYear}</div>
            </div>
            <div className="space-y-2 relative">
              <span className="text-[10px] uppercase font-black tracking-widest opacity-40 flex items-center gap-1.5">
                <Hash className="size-3 text-primary" /> ISBN
              </span>
              <div className="font-bold text-base font-mono tracking-tighter">{book.isbn}</div>
            </div>
            <div className="space-y-2 relative">
              <span className="text-[10px] uppercase font-black tracking-widest opacity-40 flex items-center gap-1.5">
                <FileText className="size-3 text-primary" /> Sayfa
              </span>
              <div className="font-bold text-base">{book.pageCount}</div>
            </div>
            <div className="space-y-2 relative">
              <span className="text-[10px] uppercase font-black tracking-widest opacity-40 flex items-center gap-1.5">
                <Hash className="size-3 text-primary" /> Sistem No
              </span>
              <div className="font-bold text-base font-mono tracking-tighter">{book.bookCode}</div>
            </div>
            <div className="space-y-2 relative">
              <span className="text-[10px] uppercase font-black tracking-widest opacity-40 flex items-center gap-1.5">
                <Layers className="size-3 text-primary" /> Raf Konumu
              </span>
              <div className="font-bold text-base tracking-tight">{book.shelfCode}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <section className="pt-16 border-t border-white/5">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-3xl font-black tracking-tighter uppercase">İLGİNİZİ ÇEKEBİLİR</h3>
          <Button variant="ghost" className="font-black text-primary text-xs tracking-widest hover:bg-primary/5">
            HEPSİNİ KEŞFET <ChevronRight className="ml-1 size-4" />
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="group cursor-pointer space-y-4">
              <div className="aspect-[2/3] bg-muted/30 rounded-2xl overflow-hidden border border-white/5 shadow-xl transition-all duration-500 group-hover:scale-[1.05] group-hover:shadow-primary/10">
                <div className="w-full h-full bg-gradient-to-br from-primary/5 via-primary/10 to-primary/20 flex flex-col items-center justify-center p-6 text-center">
                  <BookIcon className="size-16 opacity-10 group-hover:opacity-20 transition-opacity mb-4" />
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-30">Benzer Eser</div>
                </div>
              </div>
              <div>
                <div className="font-black text-sm group-hover:text-primary transition-colors tracking-tight line-clamp-1">Benzer Kitap İsmi {i}</div>
                <div className="text-xs font-bold text-muted-foreground/60">Yazar Adı</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
