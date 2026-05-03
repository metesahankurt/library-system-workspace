"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { 
  Scan, 
  Search, 
  User, 
  Book as BookIcon, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle,
  History,
  Loader2,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { BarcodeScanner } from "./barcode-scanner";

interface ScannedBook {
  id: number;
  title: string;
  author: string;
  availableQty: number;
  barcode: string;
}

const STRAPI_URL = "http://localhost:1337";

interface LibrarianPanelProps {
  initialData?: { mode: "lend" | "return"; barcode: string };
}

export function LibrarianPanel({ initialData }: LibrarianPanelProps) {
  const [barcode, setBarcode] = useState(initialData?.barcode || "");
  const [userId, setUserId] = useState("");
  const [scannedBook, setScannedBook] = useState<ScannedBook | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<string>(initialData?.mode || "lend");

  useEffect(() => {
    if (initialData?.barcode) {
      setBarcode(initialData.barcode);
      triggerSearch(initialData.barcode);
    }
    if (initialData?.mode) {
      setActiveMode(initialData.mode);
    }
  }, [initialData]);

  const handleScanResult = (decodedText: string) => {
    setBarcode(decodedText);
    triggerSearch(decodedText);
  };

  const triggerSearch = (code: string) => {
    if (!code) return;
    setIsProcessing(true);
    // Simulate API call to find book by barcode
    setTimeout(() => {
      setScannedBook({
        id: 1,
        title: "Nutuk",
        author: "Mustafa Kemal Atatürk",
        availableQty: 5,
        barcode: code
      });
      setIsProcessing(false);
    }, 600);
  };

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSearch(barcode);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">EMANET YÖNETİMİ</h1>
          <p className="text-muted-foreground font-bold tracking-tight mt-1 uppercase text-xs opacity-60">Operasyonel Kütüphane İşlemleri</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-12 px-6 font-black tracking-tight border-2 rounded-2xl hover:bg-muted/50 transition-all">
            <History className="mr-2 size-5" /> GEÇMİŞ
          </Button>
          <Button 
            className="h-12 px-6 font-black tracking-tight shadow-2xl shadow-primary/30 rounded-2xl hover:scale-[1.02] transition-all"
            onClick={() => setIsScannerOpen(true)}
          >
            <Scan className="mr-2 size-5" /> KAMERA TARAYICI
          </Button>
        </div>
      </div>

      {isScannerOpen && (
        <BarcodeScanner 
          onScan={handleScanResult} 
          onClose={() => setIsScannerOpen(false)} 
        />
      )}

      <Tabs value={activeMode} onValueChange={setActiveMode} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-16 p-1.5 bg-muted rounded-[1.5rem] border border-border/50">
          <TabsTrigger value="lend" className="rounded-2xl font-black text-sm tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-xl data-[state=active]:text-emerald-600 transition-all">
            <ArrowRight className="mr-2 size-4" /> ÖDÜNÇ VER
          </TabsTrigger>
          <TabsTrigger value="return" className="rounded-2xl font-black text-sm tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-xl data-[state=active]:text-blue-600 transition-all">
            <ArrowLeft className="mr-2 size-4" /> İADE AL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lend" className="mt-10 space-y-10">
          <div className="grid md:grid-cols-2 gap-10">
            {/* Step 1: Scan Book */}
            <Card className="border shadow-xl bg-card overflow-hidden rounded-[2rem]">
              <div className="h-2 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]" />
              <CardHeader className="pt-8 px-8">
                <CardTitle className="flex items-center gap-3 text-2xl font-black tracking-tighter">
                  <div className="p-2 bg-emerald-500/10 rounded-xl">
                    <BookIcon className="size-6 text-emerald-500" />
                  </div>
                  Kitap Tanımla
                </CardTitle>
                <CardDescription className="font-bold opacity-60">Barkod okutun veya kod giriniz.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-8">
                <form onSubmit={handleScan} className="flex gap-3">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-4 size-5 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                    <Input 
                      placeholder="Barkod Numarası..." 
                      className="pl-12 h-14 bg-muted border rounded-2xl font-bold tracking-tight focus-visible:ring-emerald-500/50" 
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                    />
                  </div>
                  <Button type="submit" size="lg" className="h-14 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-black shadow-lg shadow-emerald-500/20" disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="size-5 animate-spin" /> : "SORGULA"}
                  </Button>
                </form>

                {scannedBook ? (
                  <div className="p-6 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-[1.5rem] border border-emerald-500/20 animate-in zoom-in-95 duration-500 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-[0.05] group-hover:rotate-12 transition-transform duration-700">
                      <BookIcon className="size-24" />
                    </div>
                    <div className="font-black text-2xl tracking-tighter">{scannedBook.title}</div>
                    <div className="text-sm text-emerald-700/70 font-black uppercase tracking-widest mt-1">{scannedBook.author}</div>
                    <div className="mt-8 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">Katalog Durumu</span>
                        <span className="text-sm font-black text-emerald-600">{scannedBook.availableQty} Müsait Kopya</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">Referans No</span>
                        <span className="text-sm font-mono font-bold">{scannedBook.barcode}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                   <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-[1.5rem] bg-muted/20">
                      <BookIcon className="size-12 opacity-10 mb-2" />
                      <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">Kitap Bekleniyor</p>
                   </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Select Member */}
            <Card className="border shadow-xl bg-card overflow-hidden rounded-[2rem]">
              <div className="h-2 bg-primary shadow-[0_0_20px_rgba(var(--primary),0.4)]" />
              <CardHeader className="pt-8 px-8">
                <CardTitle className="flex items-center gap-3 text-2xl font-black tracking-tighter">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <User className="size-6 text-primary" />
                  </div>
                  Üye Seçimi
                </CardTitle>
                <CardDescription className="font-bold opacity-60">Teslim alacak üyeyi seçiniz.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-8">
                <div className="relative group">
                  <Search className="absolute left-4 top-4 size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    placeholder="TC No, Üye No veya İsim..." 
                    className="pl-12 h-14 bg-muted border rounded-2xl font-bold tracking-tight focus-visible:ring-primary/50" 
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <div 
                    className={cn(
                      "p-4 rounded-2xl flex items-center justify-between border-2 transition-all cursor-pointer group/item",
                      userId === "2024-001" ? "bg-primary/5 border-primary shadow-lg shadow-primary/5" : "bg-muted/20 border-transparent hover:border-border"
                    )}
                    onClick={() => setUserId("2024-001")}
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center font-black text-sm shadow-lg shadow-primary/20">TK</div>
                      <div>
                        <div className="text-base font-black tracking-tight">Taha Kurt</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Üye No: 2024-001</div>
                      </div>
                    </div>
                    <div className={cn(
                      "size-6 rounded-full border-2 flex items-center justify-center transition-all",
                      userId === "2024-001" ? "bg-primary border-primary" : "border-border group-hover/item:border-muted-foreground"
                    )}>
                      {userId === "2024-001" && <CheckCircle2 className="size-4 text-white" />}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border shadow-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent rounded-[2.5rem] relative overflow-hidden">
             <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
            <CardContent className="p-10 flex flex-col lg:flex-row items-center justify-between gap-10 relative">
              <div className="flex items-center gap-8">
                <div className="p-6 bg-emerald-500 text-white rounded-[2rem] shadow-2xl shadow-emerald-500/40 animate-bounce-subtle">
                  <ArrowRight className="size-10" />
                </div>
                <div>
                  <div className="text-3xl font-black tracking-tighter leading-none">İŞLEMİ ONAYLA</div>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">15 GÜN SÜRE</span>
                    <span className="text-sm text-emerald-700/60 font-black uppercase tracking-widest">Geri İade: 11 MAYIS 2026</span>
                  </div>
                </div>
              </div>
              <Button size="lg" className="h-16 px-16 text-lg font-black tracking-tight rounded-2xl bg-emerald-500 hover:bg-emerald-600 shadow-[0_15px_40px_rgba(16,185,129,0.3)] hover:scale-[1.03] active:scale-[0.97] transition-all" disabled={!scannedBook || !userId}>
                EMANET TESLİM ET
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="return" className="mt-10 animate-in fade-in zoom-in-95 duration-500">
           <Card className="border shadow-3xl bg-card overflow-hidden max-w-2xl mx-auto rounded-[3rem]">
              <div className="h-3 bg-gradient-to-r from-blue-600 to-primary shadow-xl" />
              <CardHeader className="text-center pt-12 pb-6">
                <CardTitle className="text-4xl font-black flex flex-col items-center gap-4">
                  <div className="p-5 bg-blue-500/10 rounded-[2rem] mb-2">
                    <ArrowLeft className="size-10 text-blue-500" />
                  </div>
                  İADE İŞLEMİ
                </CardTitle>
                <CardDescription className="text-lg font-bold opacity-60">İade edilecek kitabın barkodunu okutun.</CardDescription>
              </CardHeader>
              <CardContent className="p-12 pt-0 space-y-10">
                 <div className="relative group">
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-primary rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <Input 
                      placeholder="Barkodu Buraya Okutun..." 
                      className="relative h-20 text-3xl font-black text-center tracking-[0.3em] bg-background border-2 border-blue-500/30 rounded-[2rem] focus-visible:ring-blue-500 transition-all placeholder:tracking-normal placeholder:text-xl placeholder:opacity-20"
                      autoFocus
                    />
                 </div>
                 
                 <div className="grid grid-cols-3 gap-4 py-10 border-y border-border/50">
                    <div className="flex flex-col items-center gap-2">
                       <CheckCircle2 className="size-8 text-emerald-500/40" />
                       <span className="text-[8px] font-black opacity-30 uppercase tracking-widest">Durum Kontrolü</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 border-x border-border/50">
                       <Clock className="size-8 text-blue-500/40" />
                       <span className="text-[8px] font-black opacity-30 uppercase tracking-widest">Gecikme Analizi</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                       <AlertTriangle className="size-8 text-amber-500/40" />
                       <span className="text-[8px] font-black opacity-30 uppercase tracking-widest">Rezervasyon Kontrol</span>
                    </div>
                 </div>
                 
                 <Button className="w-full h-16 text-xl font-black tracking-tight rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    İADE GİRİŞİNİ YAP
                 </Button>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
