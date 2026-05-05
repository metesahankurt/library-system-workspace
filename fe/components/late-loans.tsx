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
  RotateCcw,
  AlertCircle,
  Clock,
  User,
  BookOpen,
  Loader2,
  Phone,
  Mail,
  MoreHorizontal,
  ArrowLeft,
  DollarSign
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const STRAPI_URL = "http://localhost:1337";

export function LateLoans({ jwt }: { jwt: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [loans, setLoans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLateLoans = async () => {
      setIsLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];
        const query = new URLSearchParams({
          "populate": "*",
          "filters[status][$eq]": "active",
          "filters[due_date][$lt]": today,
          "sort": "due_date:asc",
        });

        if (searchTerm) {
          query.append("filters[$or][0][book][title][$containsi]", searchTerm);
          query.append("filters[$or][1][user][username][$containsi]", searchTerm);
        }

        const response = await fetch(`${STRAPI_URL}/api/loans?${query.toString()}`);
        const data = await response.json();
        
        const normalized = data.data?.map((l: any) => {
          const attr = l.attributes || l;
          const book = attr.book?.data?.attributes || attr.book || {};
          const user = attr.user?.data?.attributes || attr.user || {};
          
          const dueDate = new Date(attr.due_date);
          const diffTime = new Date().getTime() - dueDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          const fine = diffDays * 5; // Example: 5 TL per day

          return {
            id: l.id,
            bookTitle: book.title || "Bilinmeyen Kitap",
            userName: user.username || user.fullname || "Bilinmeyen Üye",
            userEmail: user.email,
            userPhone: user.phone || "No Phone",
            loanDate: attr.loan_date,
            dueDate: attr.due_date,
            lateDays: diffDays,
            fine: fine,
          };
        }) || [];
        
        setLoans(normalized);
      } catch (error) {
        console.error("Error fetching late loans:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const t = setTimeout(fetchLateLoans, searchTerm ? 300 : 0);
    return () => clearTimeout(t);
  }, [searchTerm]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-3xl border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-600 shadow-sm border border-red-500/20">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Geciken İadeler</h1>
            <p className="text-muted-foreground text-sm font-medium">Teslim tarihi geçmiş kritik emanetler</p>
          </div>
        </div>

        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            placeholder="Kitap veya üye adı ile ara..."
            className="pl-10 h-11 bg-muted/50 border rounded-2xl font-medium focus:ring-4 focus:ring-red-500/5 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card rounded-3xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-red-50/50 text-red-900/40 uppercase text-[10px] font-black tracking-widest">
              <TableRow className="hover:bg-transparent border-b-2">
                <th className="p-4 pl-8">Üye ve İletişim</th>
                <th className="p-4">Geciken Kitap</th>
                <th className="p-4 text-center">Gecikme</th>
                <th className="p-4 text-center">Tahmini Ceza</th>
                <th className="p-4 text-right pr-8">İşlemler</th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto text-red-500/20" />
                  </TableCell>
                </TableRow>
              ) : loans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Clock className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-bold text-muted-foreground">Şu an geciken herhangi bir kitap bulunmuyor.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                loans.map((loan) => (
                  <TableRow key={loan.id} className="group hover:bg-red-50/30 transition-colors border-b last:border-0 border-red-100/20">
                    <TableCell className="p-4 pl-8">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-zinc-400" />
                          <span className="font-black text-sm tracking-tight">{loan.userName}</span>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground">
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {loan.userPhone}</span>
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {loan.userEmail}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="font-bold text-sm line-clamp-1">{loan.bookTitle}</span>
                          <span className="text-[10px] font-black text-muted-foreground/50 uppercase">
                            Teslim Tarihi: {new Date(loan.dueDate).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="p-4 text-center">
                      <span className="inline-flex px-3 py-1 rounded-xl bg-red-100 text-red-700 text-xs font-black uppercase tracking-wider">
                        {loan.lateDays} GÜN
                      </span>
                    </TableCell>
                    <TableCell className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-black text-red-600">{loan.fine} ₺</span>
                        <span className="text-[9px] font-black text-red-500/50 uppercase">Günlük 5₺</span>
                      </div>
                    </TableCell>
                    <TableCell className="p-4 text-right pr-8">
                      <div className="flex justify-end gap-2">
                        <Button className="h-9 px-4 rounded-xl bg-zinc-900 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-zinc-200">
                          UYAR
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-muted/50">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl border-2 font-bold text-xs">
                            <DropdownMenuItem className="text-blue-600">
                              <ArrowLeft className="mr-2 h-4 w-4" /> İade Al
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <DollarSign className="mr-2 h-4 w-4" /> Ceza Tahsil Et
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
