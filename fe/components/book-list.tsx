"use client";

import * as React from "react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Edit,
  Trash2,
  Book as BookIcon,
  Filter
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { AddBookForm } from "./add-book-form";
import { Loader2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const STRAPI_URL = "http://localhost:1337";

export function BookList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [books, setBooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  React.useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams({
          "populate": "*",
          "pagination[page]": page.toString(),
          "pagination[pageSize]": pageSize.toString(),
          "filters[title][$containsi]": searchTerm,
        });

        const response = await fetch(`${STRAPI_URL}/api/books?${query.toString()}`);
        const data = await response.json();
        setBooks(data.data || []);
        if (data.meta?.pagination) {
          setTotalPages(data.meta.pagination.pageCount);
          setTotalItems(data.meta.pagination.total);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchBooks();
    }, searchTerm ? 300 : 0);

    return () => clearTimeout(delayDebounceFn);
  }, [page, searchTerm, pageSize]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };



  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-3xl border shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            placeholder="Kitap adı veya yazar ile ara..."
            className="pl-10 h-10 bg-muted border rounded-xl font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl border-2 font-bold">
            <Filter className="mr-2 size-4" /> Filtrele
          </Button>
          <Sheet>
            <SheetTrigger className="inline-flex items-center justify-center rounded-xl shadow-lg shadow-primary/20 font-bold px-6 h-10 bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors">
              Yeni Kitap Ekle
            </SheetTrigger>
            <SheetContent className="w-[480px] max-w-[95vw] overflow-y-auto p-0">
              <AddBookForm />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="bg-card rounded-3xl border shadow-xl overflow-hidden">
        <Table className="table-fixed w-full">
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-b">
              <TableHead className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground pl-6" style={{ width: '80px' }}>Kapak</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Kitap Bilgileri</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground" style={{ width: '140px' }}>Kategori / Raf</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground" style={{ width: '160px' }}>Stok Durumu</TableHead>
              <TableHead className="text-right pr-6 font-bold text-[10px] uppercase tracking-widest text-muted-foreground" style={{ width: '100px' }}>İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-60 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="size-10 animate-spin text-primary opacity-20" />
                    <p className="text-xs font-black opacity-30 uppercase tracking-widest">Kitaplar Yükleniyor...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : books.map((book) => (
              <TableRow key={book.id} className="group hover:bg-muted/30 transition-colors border-b last:border-0 h-24">
                <TableCell className="pl-6" style={{ width: '80px', minWidth: '80px' }}>
                  <div
                    style={{ width: '48px', height: '64px' }}
                    className="rounded-lg bg-muted overflow-hidden border shadow-sm group-hover:scale-105 transition-transform flex-shrink-0"
                  >
                    {book.frontCover?.url ? (
                      <img
                        src={`${STRAPI_URL}${book.frontCover.url}`}
                        alt={book.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <BookIcon className="size-4 opacity-20" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-black text-base tracking-tight">{book.title}</div>
                  <div className="text-sm text-muted-foreground font-bold">{book.author}</div>
                  <div className="text-[10px] font-mono text-primary/60 mt-1">{book.bookCode}</div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="inline-flex w-fit px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                      {book.category?.name || "Kategorisiz"}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                      Raf: {book.shelfCode || "-"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden border">
                        <div
                          className={`h-full rounded-full ${book.availableQty > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                          style={{ width: `${(book.availableQty / book.quantity) * 100 || 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-black">{book.availableQty || 0} / {book.quantity || 0}</span>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${book.availableQty > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {book.availableQty > 0 ? "ÖDÜNÇ ALINABİLİR" : "TÜKENDİ / REZERVASYON"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex justify-end gap-2">
                    <Sheet>
                      <SheetTrigger className="inline-flex items-center justify-center h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all bg-transparent border-0 cursor-pointer">
                        <Edit className="size-4" />
                      </SheetTrigger>
                      <SheetContent className="w-[480px] max-w-[95vw] overflow-y-auto p-0">
                        <AddBookForm book={book} />
                      </SheetContent>
                    </Sheet>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all">
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {books.length === 0 && !isLoading && (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <div className="p-6 bg-muted/50 rounded-[2rem]">
              <BookIcon className="size-16 text-muted-foreground/20" />
            </div>
            <div>
              <div className="text-xl font-black opacity-40 uppercase tracking-tighter">KİTAP BULUNAMADI</div>
              <p className="text-sm text-muted-foreground font-bold mt-1">Arama kriterlerine uygun sonuç bulunamadı.</p>
            </div>
            <Button variant="outline" className="rounded-xl border-2 font-bold" onClick={() => setSearchTerm("")}>Aramayı Temizle</Button>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="p-6 bg-muted/20 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
            TOPLAM {totalItems} KİTAP • SAYFA {page} / {totalPages}
          </div>

          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  text="Geri"
                  className={`cursor-pointer hover:bg-primary/10 hover:text-primary transition-all rounded-xl ${page === 1 || isLoading ? 'pointer-events-none opacity-50' : ''}`}
                  onClick={() => handlePageChange(page - 1)}
                  aria-disabled={page === 1 || isLoading}
                />
              </PaginationItem>

              {/* Desktop pagination items */}
              <div className="hidden md:flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(i => i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1))
                  .map((i, idx, arr) => {
                    const elements = [];
                    if (idx > 0 && i !== arr[idx - 1] + 1) {
                      elements.push(
                        <PaginationItem key={`ellipsis-${i}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    elements.push(
                      <PaginationItem key={i}>
                        <PaginationLink
                          isActive={page === i}
                          onClick={() => handlePageChange(i)}
                          className="cursor-pointer rounded-xl"
                        >
                          {i}
                        </PaginationLink>
                      </PaginationItem>
                    );
                    return elements;
                  })}
              </div>

              <PaginationItem>
                <PaginationNext
                  text="İleri"
                  className={`cursor-pointer hover:bg-primary/10 hover:text-primary transition-all rounded-xl ${page === totalPages || isLoading ? 'pointer-events-none opacity-50' : ''}`}
                  onClick={() => handlePageChange(page + 1)}
                  aria-disabled={page === totalPages || isLoading}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
