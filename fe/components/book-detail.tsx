"use client";

import * as React from "react";
import { useTransition } from "react";
import { 
  BookOpen, 
  Building2, 
  Calendar, 
  Hash, 
  Layers, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Share2,
  BookmarkPlus,
  Info,
  ChevronRight,
  ShieldCheck,
  Star,
  Loader2
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Barcode from "react-barcode";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { createReservation } from "@/app/actions/library";
import { toast } from "sonner";

export interface BookDetailProps {
  jwt?: string;
  book: any;
  similarBooks?: any[];
}

export function BookDetail({ jwt, book, similarBooks = [] }: BookDetailProps) {
  const [isPending, startTransition] = useTransition();
  const isAvailable = book.availableQty > 0;
  const categoryName = book.category?.name ?? "Katalog";
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
  
  const frontCoverUrl = book.frontCover?.url 
    ? `${STRAPI_URL}${book.frontCover.url}`
    : (book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg` : 'https://images.unsplash.com/photo-1543004457-450c09ce9c41?q=80&w=800&auto=format&fit=crop');
    
  const backCoverUrl = book.backCover?.url 
    ? `${STRAPI_URL}${book.backCover.url}`
    : undefined;

  const handleReservation = () => {
    startTransition(async () => {
      const result = await createReservation(book.documentId);
      if (result.success) {
        toast.success("Rezervasyon başarıyla oluşturuldu!");
      } else {
        toast.error(result.error || "Rezervasyon oluşturulurken bir hata oluştu.");
      }
    });
  };

  const [showBack, setShowBack] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-zinc-900 pb-32">
      {/* Navigation Header */}
      <nav className="container pt-8 flex items-center justify-between">
        <Link 
          href="/kutuphane" 
          className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-all"
        >
          <div className="h-8 w-8 rounded-full border border-zinc-100 flex items-center justify-center group-hover:bg-zinc-50 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </div>
          Kütüphaneye Dön
        </Link>
        <div className="flex items-center gap-4">
           <Button variant="ghost" size="icon" className="rounded-full border border-zinc-100"><Share2 className="h-4 w-4" /></Button>
           <Button variant="ghost" size="icon" className="rounded-full border border-zinc-100"><BookmarkPlus className="h-4 w-4" /></Button>
        </div>
      </nav>

      {/* Main Showcase Section */}
      <section className="container pt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        
        {/* Left Side: Staggered Double Covers with Toggle */}
        <div className="relative flex items-center justify-center py-12 lg:sticky lg:top-24">
          <div 
            className="relative w-[320px] md:w-[400px] aspect-[2/3] cursor-pointer"
            style={{ perspective: '2000px' }}
            onClick={() => setShowBack(!showBack)}
          >
            {/* Back Cover */}
            <div 
              className={cn(
                "absolute top-0 right-0 w-[90%] h-[95%] shadow-2xl transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]",
                showBack ? "z-20 opacity-100" : "z-0 opacity-40"
              )}
              style={{ 
                transform: showBack 
                  ? 'translateX(0px) translateY(0px) rotateY(0deg)' 
                  : 'translateX(48px) translateY(-32px) rotateY(-15deg)',
                transformStyle: 'preserve-3d'
              }}
            >
              {backCoverUrl ? (
                <img src={backCoverUrl} className="w-full h-full object-cover rounded-r-2xl border border-zinc-200" alt="Arka Kapak" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-r-2xl border border-zinc-700 flex flex-col items-center justify-center p-12 text-center text-white/20">
                   <div className="h-px w-20 bg-white/10 mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">{book.title}</p>
                </div>
              )}
              {showBack && <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/20 to-transparent rounded-l-md" />}
            </div>

            {/* Front Cover */}
            <div 
              className={cn(
                "absolute top-0 left-0 w-full h-full shadow-[20px_50px_100px_-20px_rgba(0,0,0,0.3)] transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]",
                showBack ? "z-0 opacity-40" : "z-10 opacity-100"
              )}
              style={{ 
                transform: showBack 
                  ? 'translateX(-48px) translateY(32px) rotateY(15deg) scale(0.9)' 
                  : 'rotateY(-5deg)',
                transformStyle: 'preserve-3d'
              }}
            >
              <img src={frontCoverUrl} className="w-full h-full object-cover rounded-r-2xl border border-zinc-200" alt="Ön Kapak" />
              {!showBack && <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/20 to-transparent rounded-l-md" />}
            </div>

            {/* Hint Label */}
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-300">
               <div className="h-px w-12 bg-zinc-100" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em]">Diğer tarafı görmek için tıkla</span>
            </div>

            {/* Floating Badges - Positioned better to avoid overlap */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-zinc-100 flex items-center gap-3 min-w-[180px]">
              <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Durum Bilgisi</p>
                <p className="text-xs font-black text-emerald-600">Arşiv Kayıtlı</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Information Architecture */}
        <div className="space-y-12">
          {/* Header Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Badge className="bg-zinc-100 text-zinc-900 border-none rounded-full px-4 py-1 font-black text-[9px] uppercase tracking-widest">
                {categoryName}
              </Badge>
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="h-3 w-3 fill-current" />
                <Star className="h-3 w-3 fill-current" />
                <Star className="h-3 w-3 fill-current" />
                <Star className="h-3 w-3 fill-current" />
                <Star className="h-3 w-3 fill-current" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[0.9]">
                {book.title}
              </h1>
              <p className="text-2xl font-bold text-zinc-400 font-serif italic">{book.author}</p>
            </div>

            <div className="flex items-center gap-4 pt-4">
               <div className="px-6 py-3 rounded-2xl bg-zinc-50 border border-zinc-100 flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Durum</span>
                  <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full animate-pulse", isAvailable ? "bg-emerald-500" : "bg-amber-500")} />
                    <span className="text-sm font-black">{isAvailable ? "Müsait" : "Dışarıda"}</span>
                  </div>
               </div>
               <div className="px-6 py-3 rounded-2xl bg-zinc-50 border border-zinc-100 flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Raf No</span>
                  <span className="text-sm font-black">{book.bookCode}</span>
               </div>
               <div className="px-6 py-3 rounded-2xl bg-zinc-50 border border-zinc-100 flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Yayın</span>
                  <span className="text-sm font-black">{book.publishYear || "—"}</span>
               </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-6 pt-6 border-t border-zinc-100">
             <div className="flex items-center gap-3">
               <div className="h-px w-8 bg-zinc-200" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300">Kitap Özeti</span>
             </div>
             <p className="text-xl text-zinc-600 leading-relaxed font-medium max-w-2xl">
               {book.description || "Bu kitap için henüz bir özet bulunmuyor. Kütüphanemizin nadide eserlerinden biri olan bu çalışma, okurlarını bekliyor."}
             </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Button 
              size="lg" 
              disabled={isPending} 
              onClick={handleReservation}
              className="rounded-2xl h-16 px-12 bg-zinc-900 text-white font-black uppercase tracking-widest shadow-[0_20px_50px_rgba(0,0,0,0.15)] gap-3 hover:scale-[1.02] transition-all border-none min-w-[240px]"
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <BookOpen className="h-5 w-5" />
              )}
              {isAvailable ? "Hemen Ödünç Al" : "Rezervasyon Yap"}
            </Button>
            <Button size="lg" variant="outline" className="rounded-2xl h-16 px-8 border-2 font-black uppercase tracking-widest gap-3">
              Listeme Ekle
            </Button>
          </div>

          {/* Technical Grid (Modern Mini Cards) */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-10">
            <InfoCard icon={<Building2 className="h-4 w-4" />} label="Yayınevi" value={book.publisher || "Bilinmiyor"} />
            <InfoCard icon={<Layers className="h-4 w-4" />} label="Sayfa" value={book.pageCount ? `${book.pageCount}` : "—"} />
            <InfoCard icon={<Hash className="h-4 w-4" />} label="ISBN" value={book.isbn || "—"} />
          </div>

          {/* Barcode Showcase */}
          <div className="pt-8">
            <div className="p-8 rounded-[32px] bg-white border border-zinc-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 group transition-all hover:shadow-md">
              <div className="space-y-2">
                 <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">Demirbaş Barkodu</span>
                 <p className="text-sm font-bold text-zinc-600">Sistem Kayıt No: <span className="text-black font-black">{book.barcodeNumber}</span></p>
              </div>
              <div className="bg-zinc-50 p-6 rounded-2xl grayscale transition-all group-hover:grayscale-0">
                <Barcode 
                  value={book.barcodeNumber} 
                  height={40} 
                  width={2} 
                  fontSize={10} 
                  margin={0}
                  background="transparent"
                  displayValue={false}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommendations - Gallery Style */}
      {similarBooks.length > 0 && (
        <section className="container mt-32 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <h2 className="text-4xl font-black tracking-tight italic">İlginizi Çekebilir</h2>
              <div className="h-1 w-20 bg-zinc-900" />
            </div>
            <Link href="/kutuphane" className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group border-b-2 border-transparent hover:border-zinc-900 transition-all pb-1">
              Tüm Kataloğu Keşfedin <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
            {similarBooks.map((simBook) => {
              const simCoverUrl = simBook.frontCover?.url 
                ? `${STRAPI_URL}${simBook.frontCover.url}`
                : `https://covers.openlibrary.org/b/isbn/${simBook.isbn}-L.jpg`;
                
              return (
                <Link key={simBook.id} href={`/kutuphane/${simBook.documentId}`} className="group block">
                  <div className="aspect-[0.7] overflow-hidden rounded-[24px] shadow-lg transition-all duration-700 group-hover:shadow-2xl group-hover:-translate-y-3 relative">
                    <img src={simCoverUrl} alt={simBook.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-black">
                          <ArrowRight className="h-6 w-6" />
                       </div>
                    </div>
                  </div>
                  <div className="mt-6 space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                      {simBook.category?.name || categoryName}
                    </p>
                    <p className="text-sm font-black leading-tight group-hover:text-primary transition-colors">{simBook.title}</p>
                    <p className="text-xs font-bold text-zinc-400 font-serif italic">{simBook.author}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="p-6 rounded-2xl border border-zinc-100 bg-white space-y-3 shadow-sm">
      <div className="h-8 w-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400">
        {icon}
      </div>
      <div className="space-y-1">
        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{label}</span>
        <p className="text-xs font-black text-zinc-800 line-clamp-1">{value}</p>
      </div>
    </div>
  );
}
