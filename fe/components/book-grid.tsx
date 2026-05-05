"use client";

import { useState } from "react";
import Link from "next/link";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface Book {
  id: number;
  documentId: string;
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  bookCode: string;
  availableQty: number;
  quantity: number;
  status: string;
  pageCount?: number;
  category?: { name: string };
  frontCover?: { url: string };
}

interface BookGridProps {
  books: Book[];
  page: number;
  totalPages: number;
  total: number;
  categories: { id: number; name: string }[];
  currentCategory?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Roman: "from-amber-900/80 to-amber-700/80",
  Tarih: "from-stone-700/80 to-stone-500/80",
  Bilim: "from-blue-900/80 to-blue-700/80",
  Felsefe: "from-violet-900/80 to-violet-700/80",
  Teknoloji: "from-slate-800/80 to-slate-600/80",
  Sanat: "from-rose-800/80 to-rose-600/80",
  Psikoloji: "from-teal-800/80 to-teal-600/80",
  Çocuk: "from-orange-700/80 to-orange-500/80",
  Hukuk: "from-zinc-800/80 to-zinc-600/80",
  Ekonomi: "from-emerald-900/80 to-emerald-700/80",
};

function BookCard({ book }: { book: Book }) {
  const [imgError, setImgError] = useState(false);
  const isAvailable = book.availableQty > 0;
  const categoryName = book.category?.name ?? "Kitap";
  const gradient = CATEGORY_COLORS[categoryName] ?? "from-neutral-800/80 to-neutral-600/80";
  
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
  const coverUrl = book.frontCover?.url 
    ? `${STRAPI_URL}${book.frontCover.url}`
    : `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`;

  return (
    <Card className="group h-full flex flex-col overflow-hidden border-zinc-200/60 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-2xl">
      <Link href={`/kutuphane/${book.documentId}`} className="flex-1 flex flex-col">
        <CardHeader className="p-0 relative">
          <AspectRatio ratio={0.75} className="overflow-hidden">
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {!imgError ? (
              <img
                src={coverUrl}
                alt={book.title}
                className="block size-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                onError={() => setImgError(true)}
              />
            ) : (
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br flex flex-col items-center justify-center text-white",
                  gradient,
                )}
              >
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-2 text-center">
                  {categoryName}
                </span>
                <span className="text-sm font-black text-center px-4 leading-tight">
                  {book.title}
                </span>
              </div>
            )}
            
            <div className="absolute top-3 left-3 z-20">
              <div className={cn(
                "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md border shadow-sm",
                isAvailable 
                  ? "bg-emerald-500/90 text-white border-emerald-400" 
                  : "bg-zinc-500/90 text-white border-zinc-400"
              )}>
                {isAvailable ? "Mevcut" : "Dışarıda"}
              </div>
            </div>
          </AspectRatio>
        </CardHeader>

        <CardContent className="flex-1 p-4 flex flex-col">
          <div className="mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">
              {categoryName}
            </span>
          </div>
          <CardTitle className="text-sm font-bold leading-snug line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {book.title}
          </CardTitle>
          <p className="text-xs font-medium text-muted-foreground line-clamp-1">
            {book.author}
          </p>
        </CardContent>
      </Link>

      <CardFooter className="p-4 pt-0 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Kopya</span>
          <span className="text-xs font-black">{book.availableQty}/{book.quantity}</span>
        </div>
        <div className="flex gap-1.5">
          <Link 
            href={`/kutuphane/${book.documentId}`}
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "h-8 rounded-lg text-[11px] font-black uppercase tracking-tighter")}
          >
            Detay
          </Link>
          {isAvailable && (
            <Button size="sm" className="h-8 rounded-lg bg-zinc-900 text-white text-[11px] font-black uppercase tracking-tighter shadow-md shadow-zinc-200">
              Ödünç
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

function BookPagination({
  page,
  totalPages,
  currentCategory,
}: {
  page: number;
  totalPages: number;
  currentCategory?: string;
}) {
  if (totalPages <= 1) return null;

  const pages = buildPageList(page, totalPages);
  const getUrl = (p: number) => {
    let url = `/kutuphane?page=${p}`;
    if (currentCategory) url += `&category=${currentCategory}`;
    return url;
  };

  return (
    <Pagination className="mt-12">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={page > 1 ? getUrl(page - 1) : "#"}
            text="Önceki"
            aria-disabled={page <= 1}
            className={cn(page <= 1 && "pointer-events-none opacity-40")}
          />
        </PaginationItem>

        {pages.map((p, i) =>
          p === "..." ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink
                href={getUrl(p)}
                isActive={p === page}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            href={page < totalPages ? getUrl(page + 1) : "#"}
            text="Sonraki"
            aria-disabled={page >= totalPages}
            className={cn(page >= totalPages && "pointer-events-none opacity-40")}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function buildPageList(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [];
  pages.push(1);
  if (current > 3) pages.push("...");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

export function BookGrid({ books, page, totalPages, total, categories, currentCategory }: BookGridProps) {
  return (
    <section className="bg-white pb-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Professional Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="sticky top-24 flex flex-col gap-8 max-h-[calc(100vh-8rem)]">
              <div className="flex flex-col h-full overflow-hidden">
                <h3 className="mb-6 text-[11px] font-black uppercase tracking-[0.2em] text-primary/40 border-b pb-4">
                  Kategoriler
                </h3>
                
                {/* Scrollable Category List */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <nav className="flex flex-col gap-1 pb-4">
                    <Link
                      href="/kutuphane"
                      className={cn(
                        "group flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-all",
                        !currentCategory
                          ? "bg-zinc-900 text-white shadow-xl shadow-zinc-200 font-bold"
                          : "text-zinc-500 hover:bg-zinc-50 hover:text-primary font-medium"
                      )}
                    >
                      <span>Tüm Koleksiyon</span>
                      {!currentCategory && <div className="size-1.5 rounded-full bg-white" />}
                    </Link>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/kutuphane?category=${cat.id}`}
                        className={cn(
                          "group flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-all",
                          currentCategory === String(cat.id)
                            ? "bg-zinc-900 text-white shadow-xl shadow-zinc-200 font-bold"
                            : "text-zinc-500 hover:bg-zinc-50 hover:text-primary font-medium"
                        )}
                      >
                        <span className="truncate">{cat.name}</span>
                        {currentCategory === String(cat.id) && <div className="size-1.5 rounded-full bg-white" />}
                      </Link>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Sidebar Info Card */}
              <div className="rounded-[2rem] bg-zinc-50 p-6 border border-zinc-100 mt-auto">
                <h4 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest mb-3">Kütüphane Bilgisi</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                  {total} kitap arasından seçim yapıyorsunuz.
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-100 pb-8">
              <div>
                <h2 className="font-playfair text-4xl lg:text-5xl font-medium tracking-tight text-zinc-900">
                  {currentCategory 
                    ? categories.find(c => String(c.id) === currentCategory)?.name 
                    : "Tüm Koleksiyon"}
                </h2>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <span>Kütüphane</span>
                  <span className="size-1 rounded-full bg-zinc-300" />
                  <span>{total} Kitap Bulundu</span>
                </div>
              </div>
            </div>

            {books.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center bg-zinc-50/50 rounded-[3rem] border border-dashed border-zinc-200">
                <div className="size-16 rounded-full bg-zinc-100 flex items-center justify-center mb-6">
                  <Menu className="size-8 text-zinc-300" />
                </div>
                <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm mb-4">
                  Bu kategoride henüz kitap bulunmuyor
                </p>
                <Link href="/kutuphane">
                  <Button variant="outline" className="rounded-xl font-bold uppercase text-[10px] tracking-widest">
                    Tüm Koleksiyona Dön
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            )}

            <div className="mt-16 pt-8 border-t border-zinc-100">
              <BookPagination page={page} totalPages={totalPages} currentCategory={currentCategory} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
