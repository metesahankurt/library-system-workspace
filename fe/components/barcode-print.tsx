"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Search,
  Tag,
  Printer,
  CheckSquare,
  Square,
  Plus,
  Minus,
  Barcode as BarcodeIcon,
  Loader2,
  Trash2,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Barcode from "react-barcode";
import { cn } from "@/lib/utils";

const STRAPI_URL = "http://localhost:1337";

// Tanex TW-2065 Specs (65 labels per A4 page)
// Grid: 5 columns x 13 rows
// Label: 38.1mm x 21.2mm

export function BarcodePrint({ jwt }: { jwt: string }) {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [books, setBooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState<Record<number, number>>({}); // id -> count
  const [isGeneratingPrint, setIsGeneratingPrint] = useState(false);

  // Fetch Categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch(`${STRAPI_URL}/api/categories?pagination[pageSize]=100`);
        const data = await res.json();
        // Ensure unique, trimmed category names to avoid key collisions
        const rawCats: string[] = data.data?.map((c: any) => (c.attributes?.name || c.name || "").toString().trim()) || [];
        const uniqueCats = Array.from(new Set<string>(rawCats))
          .filter((c: string) => c !== "" && c.toLowerCase() !== "all");
        setCategories(uniqueCats);
      } catch (e) { console.error(e); }
    };
    fetchCats();
  }, []);

  // Fetch Books based on filters
  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams({
          "populate": "*",
          "pagination[pageSize]": "100",
        });

        // Try to filter by category name in a relation or direct string field
        if (selectedCategory && selectedCategory !== "all") {
          // Attempting common Strapi filter patterns
          query.append("filters[$or][0][category][name][$containsi]", selectedCategory);
          query.append("filters[$or][1][category][$containsi]", selectedCategory);
        }
        
        if (searchTerm) {
          query.append("filters[title][$containsi]", searchTerm);
        }

        const res = await fetch(`${STRAPI_URL}/api/books?${query.toString()}`);
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();
        
        const normalized = data.data?.map((b: any) => {
          const attr = b.attributes || b;
          return {
            id: b.id,
            title: attr.title || "İsimsiz Kitap",
            author: attr.author || "Bilinmiyor",
            barcode: attr.barcodeNumber || attr.bookCode || "KOD-YOK",
            quantity: attr.quantity || 0,
          };
        }) || [];
        
        setBooks(normalized);
      } catch (e) { 
        console.error("Kitaplar getirilemedi:", e);
        setBooks([]);
      }
      setIsLoading(false);
    };

    const t = setTimeout(fetchBooks, 300);
    return () => clearTimeout(t);
  }, [selectedCategory, searchTerm]);

  const toggleBookSelection = (id: number, qty: number) => {
    setSelectedBooks(prev => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = qty;
      }
      return next;
    });
  };

  const updatePrintQty = (id: number, delta: number, max: number) => {
    setSelectedBooks(prev => {
      const current = prev[id] || 0;
      const nextVal = Math.max(0, Math.min(max, current + delta));
      if (nextVal === 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: nextVal };
    });
  };

  const selectAll = () => {
    const next: Record<number, number> = {};
    books.forEach(b => {
      if (b.quantity > 0) next[b.id] = b.quantity;
    });
    setSelectedBooks(next);
  };

  const clearAll = () => setSelectedBooks({});

  const totalLabels = Object.values(selectedBooks).reduce((a, b) => a + b, 0);

  const handlePrint = () => {
    setIsGeneratingPrint(true);
    // In a real app, we'd open a new window or use a specific print style
    // For this demo, we'll trigger the browser print after a short delay
    setTimeout(() => {
      window.print();
      setIsGeneratingPrint(false);
    }, 500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header & Controls */}
      <div className="bg-card p-6 rounded-3xl border shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-white shadow-lg">
              <Printer className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Barkod İşlemleri</h1>
              <p className="text-muted-foreground text-sm font-medium">Yazdırılacak barkodları seçin ve listeleyin</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button variant="outline" className="rounded-xl border-2 font-bold gap-2" onClick={selectAll}>
              Tümünü Seç (Stok Kadar)
            </Button>
            <Button variant="outline" className="rounded-xl border-2 font-bold text-red-600 hover:text-red-700 hover:bg-red-50 gap-2" onClick={clearAll}>
              Seçimleri Temizle
            </Button>
            <Button 
              disabled={totalLabels === 0}
              className="rounded-xl bg-zinc-900 font-black uppercase tracking-wider px-8 h-11 shadow-xl shadow-zinc-200 gap-2"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4" /> Yazdır ({totalLabels} Etiket)
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input
              placeholder="Kitap ara..."
              className="pl-10 h-11 bg-muted/50 border-0 rounded-2xl font-medium focus:ring-4 focus:ring-primary/5 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val || "all")}>
            <SelectTrigger className="h-11 rounded-2xl border-0 bg-muted/50 px-4 font-bold">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Kategori Seç" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              {categories.map((cat, idx) => (
                <SelectItem key={`${cat}-${idx}`} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center justify-end px-4 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tanex TW-2065 Formatı (5x13)</span>
          </div>
        </div>
      </div>

      {/* Book List for Selection */}
      <div className="bg-card rounded-3xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b-2">
                <th className="p-4 pl-8 w-[50px]"></th>
                <th className="p-4 font-black uppercase text-[10px] tracking-widest text-primary">Kitap Bilgisi</th>
                <th className="p-4 font-black uppercase text-[10px] tracking-widest">Barkod</th>
                <th className="p-4 font-black uppercase text-[10px] tracking-widest text-center">Mevcut Stok</th>
                <th className="p-4 font-black uppercase text-[10px] tracking-widest text-center">Yazdırılacak Adet</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-zinc-300" />
                  </td>
                </tr>
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-muted-foreground font-medium italic">
                    Kitap bulunamadı.
                  </td>
                </tr>
              ) : (
                books.map(book => {
                  const isSelected = !!selectedBooks[book.id];
                  const printQty = selectedBooks[book.id] || 0;
                  
                  return (
                    <tr key={book.id} className={cn("border-b last:border-0 hover:bg-muted/10 transition-colors", isSelected && "bg-primary/5")}>
                      <td className="p-4 pl-8">
                        <button 
                          onClick={() => toggleBookSelection(book.id, book.quantity)}
                          className={cn("h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all", isSelected ? "bg-primary border-primary text-white" : "border-zinc-200 text-transparent")}
                        >
                          <CheckSquare className="h-4 w-4" />
                        </button>
                      </td>
                      <td className="p-4">
                        <p className="font-black text-sm tracking-tight">{book.title}</p>
                        <p className="text-xs font-bold text-muted-foreground">{book.author}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 group">
                          <code className="font-mono text-xs bg-zinc-100 px-2 py-1 rounded-md text-zinc-600 font-bold group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            {book.barcode}
                          </code>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex h-8 w-12 items-center justify-center rounded-xl bg-zinc-100 text-xs font-black">
                          {book.quantity}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-3">
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="h-8 w-8 rounded-lg border-2" 
                            onClick={() => updatePrintQty(book.id, -1, book.quantity)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-black text-sm">{printQty}</span>
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="h-8 w-8 rounded-lg border-2" 
                            onClick={() => updatePrintQty(book.id, 1, book.quantity)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hidden Print Layout (Visible only during print) */}
      <div className="hidden print:block fixed inset-0 bg-white z-[9999]">
        <style dangerouslySetInnerHTML={{ __html: `
          @page {
            size: A4;
            margin: 0;
          }
          @media print {
            body * {
              visibility: hidden;
            }
            .print-layout, .print-layout * {
              visibility: visible;
            }
            .print-layout {
              position: absolute;
              left: 0;
              top: 0;
              width: 210mm;
              height: 297mm;
              padding: 0;
              margin: 0;
              background: white;
            }
            .label-grid {
              display: grid;
              grid-template-columns: repeat(5, 38.1mm);
              grid-template-rows: repeat(13, 21.2mm);
              width: 100%;
              height: 100%;
              /* Tanex TW-2065 offset adjustments */
              padding-top: 10mm; 
              padding-left: 10mm;
              /* Small calibration shift as per KI */
              margin-top: -1mm;
              margin-left: -1mm;
            }
            .label-item {
              width: 38.1mm;
              height: 21.2mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 1mm;
              border: 0.1mm dashed #eee; /* Light border for debugging, can be removed */
              overflow: hidden;
              box-sizing: border-box;
            }
            .label-text {
              font-size: 6pt;
              font-family: sans-serif;
              font-weight: bold;
              text-align: center;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              width: 100%;
              margin-top: 1mm;
            }
          }
        `}} />
        <div className="print-layout">
          {/* Chunking labels into pages of 65 */}
          {(() => {
            const allLabels = Object.entries(selectedBooks).flatMap(([id, qty]) => {
              const book = books.find(b => b.id === Number(id));
              if (!book) return [];
              return Array.from({ length: qty }).map((_, i) => ({ book, key: `${id}-${i}` }));
            });

            const pages = [];
            for (let i = 0; i < allLabels.length; i += 65) {
              pages.push(allLabels.slice(i, i + 65));
            }

            return pages.map((pageLabels, pageIdx) => (
              <div key={pageIdx} className="print-page" style={{ pageBreakAfter: 'always' }}>
                <div className="label-grid">
                  {pageLabels.map(({ book, key }) => (
                    <div key={key} className="label-item">
                      <Barcode 
                        value={book.barcode} 
                        width={1} 
                        height={30} 
                        fontSize={7} 
                        margin={0} 
                        displayValue={false}
                      />
                      <div className="label-text">{book.barcode}</div>
                      <div className="label-text" style={{ fontSize: '5pt', opacity: 0.8 }}>{book.title.substring(0, 20)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
}
