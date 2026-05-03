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
  ClipboardList,
  ArrowRight,
  ArrowLeft,
  Clock,
  Calendar,
  User,
  BookOpen,
  Loader2,
  Scan,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LibrarianPanel } from "./librarian-panel";
import { cn } from "@/lib/utils";

const STRAPI_URL = "http://localhost:1337";

interface ActiveLoansProps {
  initialData?: { mode: "lend" | "return"; barcode: string };
}

export function ActiveLoans({ initialData }: ActiveLoansProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [loans, setLoans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialData ? "action" : "list");

  useEffect(() => {
    if (initialData) {
      setActiveTab("action");
    }
  }, [initialData]);

  useEffect(() => {
    if (activeTab !== "list") return;

    const fetchLoans = async () => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams({
          "populate": "*",
          "filters[status][$eq]": "active",
          "sort": "loan_date:desc",
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
          
          return {
            id: l.id,
            bookTitle: book.title || "Bilinmeyen Kitap",
            userName: user.username || user.fullname || "Bilinmeyen Üye",
            loanDate: attr.loan_date || attr.createdAt,
            dueDate: attr.due_date,
            status: attr.status,
          };
        }) || [];
        
        setLoans(normalized);
      } catch (error) {
        console.error("Error fetching loans:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const t = setTimeout(fetchLoans, searchTerm ? 300 : 0);
    return () => clearTimeout(t);
  }, [searchTerm, activeTab]);

  const getDueDateStatus = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `${Math.abs(diffDays)} Gün Gecikti`, color: "text-red-600 bg-red-50 border-red-100", icon: AlertCircle };
    } else if (diffDays <= 3) {
      return { label: `${diffDays} Gün Kaldı`, color: "text-amber-600 bg-amber-50 border-amber-100", icon: Clock };
    }
    return { label: `${diffDays} Gün Süre`, color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: Calendar };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-3xl border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-white shadow-lg">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Aktif Ödünçler</h1>
            <p className="text-muted-foreground text-sm font-medium">Şu an üyelerde olan kitapların listesi</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted/50 rounded-2xl border">
            <TabsTrigger value="list" className="rounded-xl font-bold text-xs tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-sm">
              LİSTE GÖRÜNÜMÜ
            </TabsTrigger>
            <TabsTrigger value="action" className="rounded-xl font-bold text-xs tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-sm">
              YENİ İŞLEM (TARAYICI)
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === "list" ? (
        <div className="space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input
              placeholder="Kitap veya üye adı ile ara..."
              className="pl-10 h-11 bg-card border rounded-2xl font-medium focus:ring-4 focus:ring-zinc-900/5 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-card rounded-3xl border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30 text-muted-foreground uppercase text-[10px] font-black tracking-widest">
                  <TableRow className="hover:bg-transparent border-b-2">
                    <th className="p-4 pl-8">Kitap ve Üye</th>
                    <th className="p-4 text-center">Veriliş Tarihi</th>
                    <th className="p-4 text-center">İade Tarihi</th>
                    <th className="p-4 text-center">Kalan Süre</th>
                    <th className="p-4 text-right pr-8">İşlem</th>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <Loader2 className="h-10 w-10 animate-spin mx-auto text-zinc-200" />
                      </TableCell>
                    </TableRow>
                  ) : loans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center text-muted-foreground italic">
                        Aktif ödünç kaydı bulunamadı.
                      </TableCell>
                    </TableRow>
                  ) : (
                    loans.map((loan) => {
                      const status = getDueDateStatus(loan.dueDate);
                      return (
                        <TableRow key={loan.id} className="group hover:bg-muted/10 transition-colors border-b last:border-0">
                          <TableCell className="p-4 pl-8">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-3.5 w-3.5 text-zinc-400" />
                                <span className="font-black text-sm tracking-tight">{loan.bookTitle}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3 text-zinc-400" />
                                <span className="text-xs font-bold text-muted-foreground">{loan.userName}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="p-4 text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-xs font-bold text-zinc-700">
                                {new Date(loan.loanDate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                              </span>
                              <span className="text-[9px] font-black text-muted-foreground/50 uppercase">Alındı</span>
                            </div>
                          </TableCell>
                          <TableCell className="p-4 text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-xs font-bold text-zinc-700">
                                {new Date(loan.dueDate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                              </span>
                              <span className="text-[9px] font-black text-muted-foreground/50 uppercase">Son Tarih</span>
                            </div>
                          </TableCell>
                          <TableCell className="p-4 text-center">
                            <div className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider", status.color)}>
                              <status.icon className="h-3.5 w-3.5" />
                              {status.label}
                            </div>
                          </TableCell>
                          <TableCell className="p-4 text-right pr-8">
                            <DropdownMenu>
                              <DropdownMenuTrigger className="h-8 w-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center">
                                <MoreHorizontal className="h-4 w-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-xl border-2 font-bold text-xs">
                                <DropdownMenuItem className="text-blue-600 focus:text-blue-700 focus:bg-blue-50">
                                  <ArrowLeft className="mr-2 h-4 w-4" /> İade Al
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Calendar className="mr-2 h-4 w-4" /> Süreyi Uzat
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      ) : (
        <LibrarianPanel initialData={initialData} />
      )}
    </div>
  );
}
