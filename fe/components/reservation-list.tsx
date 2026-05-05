"use client";

import * as React from "react";
import { useState, useEffect } from "react";
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
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  User,
  BookOpen,
  Loader2,
  Filter,
  ArrowRight
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

const STRAPI_URL = "http://localhost:1337";

import { lendBookFromReservation } from "@/app/actions/library";
import { toast } from "sonner";

export function ReservationList({ jwt }: { jwt: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchReservations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        "populate[user][fields][0]": "username",
        "populate[user][fields][1]": "email",
        "populate[user][fields][2]": "documentId",
        "populate[book][populate]": "*",
        "pagination[page]": page.toString(),
        "pagination[pageSize]": pageSize.toString(),
        "sort": "createdAt:desc",
      });

      if (searchTerm) {
        query.append("filters[$or][0][book][title][$containsi]", searchTerm);
        query.append("filters[$or][1][user][username][$containsi]", searchTerm);
      }

      const response = await fetch(`${STRAPI_URL}/api/reservations?${query.toString()}`, {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `Sunucu hatası: ${response.status}`);
      }

      const data = await response.json();
      
      // Strapi v5 can return flat data or nested in attributes
      const rawData = data.data || [];
      const normalized = rawData.map((r: any) => {
        const id = r.documentId || r.id; // Prefer documentId for API calls in v5
        const attr = r.attributes || r;
        
        // Handle relations which might be nested or flat
        const bookData = attr.book?.data?.attributes || attr.book || {};
        const userData = attr.user?.data?.attributes || attr.user || {};
        
        // Strapi v5 Users might have username directly or in attributes
        const userName = userData.username || userData.fullname || userData.email || "Bilinmeyen Üye";
        
        return {
          id: id,
          bookTitle: bookData.title || "Bilinmeyen Kitap",
          userName: userName,
          status: attr.status || "waiting",
          reservedAt: attr.reservedAt || attr.createdAt,
          expiresAt: attr.expiresAt,
        };
      });
      
      setReservations(normalized);
      if (data.meta?.pagination) {
        setTotalPages(data.meta.pagination.pageCount);
        setTotalItems(data.meta.pagination.total);
      }
    } catch (err: any) {
      console.error("Error fetching reservations:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(fetchReservations, searchTerm ? 300 : 0);
    return () => clearTimeout(delayDebounceFn);
  }, [page, searchTerm, pageSize]);

  const handleLend = async (id: string | number) => {
    setProcessingId(id);
    try {
      const result = await lendBookFromReservation(id.toString());
      if (result.success) {
        toast.success("Kitap başarıyla ödünç verildi!");
        fetchReservations(); // Refresh list
      } else {
        toast.error(result.error || "İşlem başarısız.");
      }
    } catch (err: any) {
      toast.error(err.message || "Bir hata oluştu.");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "fulfilled":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider"><CheckCircle2 className="h-3 w-3" /> Teslim Edildi</span>;
      case "cancelled":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-wider"><XCircle className="h-3 w-3" /> İptal Edildi</span>;
      case "expired":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-black uppercase tracking-wider"><Clock className="h-3 w-3" /> Süresi Doldu</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider"><Clock className="h-3 w-3" /> Bekliyor</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-3xl border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-sm border border-amber-500/20">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Rezervasyonlar</h1>
            <p className="text-muted-foreground text-sm font-medium">Kitap ayırtan kullanıcıların listesi</p>
          </div>
        </div>

        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            placeholder="Kitap veya üye adı ile ara..."
            className="pl-10 h-11 bg-muted/50 border rounded-2xl font-medium focus:ring-4 focus:ring-amber-500/5 transition-all"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="bg-card rounded-3xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30 text-muted-foreground uppercase text-[10px] font-black tracking-widest">
              <TableRow className="hover:bg-transparent border-b-2">
                <th className="p-4 pl-8">Üye Bilgisi</th>
                <th className="p-4">Kitap Bilgisi</th>
                <th className="p-4 text-center">Durum</th>
                <th className="p-4 text-center">Tarih</th>
                <th className="p-4 text-right pr-8">İşlem</th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto text-amber-500/20" />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-2 text-red-500">
                      <XCircle className="h-10 w-10 opacity-20" />
                      <p className="font-bold">Hata: {error}</p>
                      <Button variant="outline" size="sm" onClick={() => fetchReservations()} className="mt-4">Tekrar Dene</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : reservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center text-muted-foreground italic">
                    Henüz bir rezervasyon kaydı bulunmuyor.
                  </TableCell>
                </TableRow>
              ) : (
                reservations.map((res) => (
                  <TableRow key={res.id} className="group hover:bg-muted/10 transition-colors border-b last:border-0">
                    <TableCell className="p-4 pl-8">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-sm">{res.userName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold text-sm line-clamp-1">{res.bookTitle}</span>
                      </div>
                    </TableCell>
                    <TableCell className="p-4 text-center">
                      {getStatusBadge(res.status)}
                    </TableCell>
                    <TableCell className="p-4 text-center font-mono text-xs text-muted-foreground">
                      {new Date(res.reservedAt).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell className="p-4 text-right pr-8">
                      {res.status === 'pending' || res.status === 'waiting' ? (
                        <Button 
                          size="sm" 
                          disabled={processingId === res.id}
                          onClick={() => handleLend(res.id)}
                          className="h-8 rounded-xl bg-zinc-900 text-white font-black text-[10px] uppercase tracking-wider hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-100 gap-2"
                        >
                          {processingId === res.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <ArrowRight className="h-3 w-3" />
                          )}
                          Ödünç Ver
                        </Button>
                      ) : (
                        <span className="text-[9px] font-black uppercase text-muted-foreground">Tamamlandı</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t bg-muted/10">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink isActive={p === page} onClick={() => setPage(p)} className="cursor-pointer font-bold">
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
