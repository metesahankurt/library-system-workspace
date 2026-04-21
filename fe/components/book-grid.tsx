"use client";

import { useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

interface Book {
  id: number;
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
}

interface BookGridProps {
  books: Book[];
  page: number;
  totalPages: number;
  total: number;
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
  const coverUrl = `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`;

  return (
    <Card className="group gap-2 rounded-none border-none bg-background p-0 shadow-none">
      <CardHeader className="gap-0 p-0">
        <AspectRatio ratio={0.76984127} className="overflow-hidden">
          <div className="block size-full relative">
            {!imgError ? (
              <img
                src={coverUrl}
                alt={book.title}
                className="block size-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                onError={() => setImgError(true)}
              />
            ) : (
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-b flex flex-col items-center justify-center text-white",
                  gradient,
                )}
              >
                <span className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">
                  {categoryName}
                </span>
                <span className="text-sm font-bold text-center px-4 leading-snug">
                  {book.title}
                </span>
                <span className="text-xs opacity-70 mt-1">{book.author}</span>
              </div>
            )}
          </div>
        </AspectRatio>
      </CardHeader>

      <CardContent className="p-0">
        <div className="text-sm min-h-[1.25rem]">
          {!isAvailable ? (
            <span className="text-muted-foreground">Mevcut değil</span>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400">Mevcut</span>
          )}
        </div>
        <div className={cn("pt-0.5", isAvailable && "mt-5")}>
          <span className="text-sm font-bold">{categoryName}</span>
          <div className="flex flex-wrap items-center gap-2 xl:flex-nowrap">
            <CardTitle className="text-sm font-normal">{book.title}</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
        </div>
      </CardContent>

      <CardFooter className="relative mt-1 flex-col items-start gap-3 p-0 xl:flex-row">
        <div className="transition-opacity duration-400 xl:group-hover:opacity-0">
          <span className="text-sm font-medium text-muted-foreground">
            {book.availableQty}/{book.quantity} kopya
          </span>
        </div>
        <div className="absolute flex items-center gap-3 bg-background opacity-0 transition-opacity duration-400 group-hover:opacity-100">
          <Button variant="link" className="h-fit p-0 underline text-sm">
            Detay
          </Button>
          {isAvailable && (
            <Button
              variant="link"
              className="h-fit p-0 text-muted-foreground underline text-sm"
            >
              Ödünç Al
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
}: {
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const pages = buildPageList(page, totalPages);

  return (
    <Pagination className="mt-12">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={page > 1 ? `/kutuphane?page=${page - 1}` : "#"}
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
                href={`/kutuphane?page=${p}`}
                isActive={p === page}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            href={page < totalPages ? `/kutuphane?page=${page + 1}` : "#"}
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

export function BookGrid({ books, page, totalPages, total }: BookGridProps) {
  return (
    <section className="pt-8 pb-16">
      <div className="container">
        <div className="flex items-end justify-between pb-8">
          <div className="flex flex-wrap items-end gap-2">
            <h2 className="text-lg leading-tight font-black uppercase xl:text-xl">
              Koleksiyonumuz
            </h2>
            <p className="text-sm font-medium text-muted-foreground xl:text-base">
              {total} kitap
            </p>
          </div>
        </div>

        {books.length === 0 ? (
          <p className="text-muted-foreground text-center py-20">
            Henüz kitap bulunmuyor.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}

        <BookPagination page={page} totalPages={totalPages} />
      </div>
    </section>
  );
}
