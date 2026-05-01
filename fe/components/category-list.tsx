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
  Tag as TagIcon,
  Plus,
  Loader2
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { CategoryForm } from "./category-form";

const STRAPI_URL = "http://localhost:1337";

export function CategoryList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  React.useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams({
          "pagination[page]": page.toString(),
          "pagination[pageSize]": pageSize.toString(),
          "filters[name][$containsi]": searchTerm,
          "sort": "name:asc"
        });

        const response = await fetch(`${STRAPI_URL}/api/categories?${query.toString()}`);
        const data = await response.json();
        
        // Function to fix common UTF-8 mangling for Turkish characters
        const fixEncoding = (str: string) => {
          try {
            return decodeURIComponent(escape(str));
          } catch (e) {
            // Fallback: manual replacement for common mangled pairs if auto-fix fails
            return str
              .replace(/Ã¼/g, "ü").replace(/Ãœ/g, "Ü")
              .replace(/Ã¶/g, "ö").replace(/Ã–/g, "Ö")
              .replace(/ÄŸ/g, "ğ").replace(/Äž/g, "Ğ")
              .replace(/ÅŸ/g, "ş").replace(/Åž/g, "Ş")
              .replace(/Ä±/g, "ı").replace(/Ä°/g, "İ")
              .replace(/Ã§/g, "ç").replace(/Ã‡/g, "Ç");
          }
        };

        // Handle Strapi v4/v5 data structure
        const rawData = data.data?.map((item: any) => {
          const name = item.attributes?.name || item.name || "İsimsiz Kategori";
          return {
            id: item.id,
            name: fixEncoding(name).trim(),
            createdAt: item.attributes?.createdAt || item.createdAt,
          };
        }) || [];

        // Filter for unique names and sort alphabetically
        const uniqueMap = new Map();
        rawData.forEach((item: any) => {
          if (!uniqueMap.has(item.name)) {
            uniqueMap.set(item.name, item);
          }
        });

        const finalData = Array.from(uniqueMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'tr'));
        
        setCategories(finalData);
        
        if (data.meta?.pagination) {
          setTotalPages(data.meta.pagination.pageCount);
          setTotalItems(finalData.length); // Use unique count
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchCategories();
    }, searchTerm ? 300 : 0);

    return () => clearTimeout(delayDebounceFn);
  }, [page, searchTerm, pageSize, refreshKey]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-3xl border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <TagIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Kategoriler</h1>
            <p className="text-muted-foreground text-sm font-medium">Toplam {totalItems} kategori tanımlı</p>
          </div>
        </div>

        <div className="flex flex-1 w-full max-w-md items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input
              placeholder="Kategori adı ile ara..."
              className="pl-10 h-11 bg-muted/50 border rounded-2xl font-medium focus:ring-4 focus:ring-primary/5 transition-all"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Button 
            className="h-11 px-6 rounded-2xl font-bold gap-2 shadow-lg shadow-primary/20"
            onClick={() => {
              setEditingCategory(null);
              setIsSheetOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Yeni Ekle
          </Button>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-card rounded-3xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-b-2">
                <TableHead className="w-[80px] font-black uppercase text-[10px] tracking-widest pl-6">ID</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest text-primary">Kategori Adı</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest">Oluşturulma</TableHead>
                <TableHead className="text-right font-black uppercase text-[10px] tracking-widest pr-6">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Yükleniyor...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <TagIcon className="h-10 w-10 text-muted-foreground/30" />
                      <span className="text-sm font-medium text-muted-foreground">Kategori bulunamadı.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat) => (
                  <TableRow key={cat.id} className="group hover:bg-muted/20 transition-colors border-b last:border-0">
                    <TableCell className="font-mono text-xs font-bold text-muted-foreground pl-6">
                      #{cat.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <TagIcon className="h-4 w-4" />
                        </div>
                        <span className="font-black text-sm tracking-tight text-zinc-800">{cat.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-muted-foreground">
                      {cat.createdAt ? new Date(cat.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }) : "—"}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-9 w-9 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition-all"
                          onClick={() => {
                            setEditingCategory(cat);
                            setIsSheetOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-9 w-9 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
                          onClick={async () => {
                            if (confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) {
                              try {
                                await fetch(`${STRAPI_URL}/api/categories/${cat.id}`, { method: "DELETE" });
                                setRefreshKey(k => k + 1);
                              } catch (e) { console.error(e); }
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t bg-muted/10">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(page - 1)}
                    className={page === 1 ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p} className="hidden md:inline-block">
                    <PaginationLink
                      isActive={p === page}
                      onClick={() => setPage(p)}
                      className="cursor-pointer rounded-xl font-bold"
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(page + 1)}
                    className={page === totalPages ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* Add/Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="p-0 border-l-0 w-full sm:max-w-[480px]">
          <CategoryForm 
            category={editingCategory} 
            onSuccess={() => {
              setIsSheetOpen(false);
              setRefreshKey(k => k + 1);
            }} 
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
