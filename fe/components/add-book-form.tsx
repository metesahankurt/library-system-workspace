"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  AlertCircle,
  BookOpen,
  User,
  Building2,
  Hash,
  Tag,
  Package,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  PencilLine,
  Calendar,
  Barcode as BarcodeIcon,
  ShieldCheck,
  LayoutDashboard,
  Box,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Barcode from "react-barcode";

const STRAPI_URL = "http://localhost:1337";

const formSchema = z.object({
  title: z.string().min(2, "Kitap adı en az 2 karakter olmalıdır"),
  author: z.string().min(2, "Yazar adı en az 2 karakter olmalıdır"),
  publisher: z.string().optional(),
  isbn: z.string().optional(),
  category: z.string().min(1, "Kategori seçiniz"),
  column: z.string().min(1, "Sütun (örn: A)").max(2),
  row: z.string().min(1, "Satır (örn: 5)"),
  quantity: z.number().min(1, "En az 1 adet olmalıdır"),
});

interface BookData {
  id?: number;
  title?: string;
  author?: string;
  publisher?: string;
  isbn?: string;
  publishYear?: number;
  category?: { name?: string };
  quantity?: number;
  availableQty?: number;
  bookCode?: string;
  barcodeNumber?: string;
  barcodeImage?: string;
  status?: string;
}

interface SimilarBook {
  id: number;
  title: string;
  author: string;
  availableQty: number;
  quantity: number;
}

interface AddBookFormProps {
  book?: BookData;
  jwt?: string;
}

function FieldGroup({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}

export function AddBookForm({ book, jwt }: AddBookFormProps) {
  const isEditMode = !!book;

  const [bookCode, setBookCode] = React.useState(book?.bookCode ?? "");
  const [barcodeValue, setBarcodeValue] = React.useState(book?.barcodeNumber ?? "");
  const [similarBooks, setSimilarBooks] = React.useState<SimilarBook[]>([]);
  const [categories, setCategories] = React.useState<{ id: number; name: string }[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = React.useState(true);
  const [isSearching, setIsSearching] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  React.useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await fetch(`${STRAPI_URL}/api/categories?pagination[pageSize]=100`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        if (data && Array.isArray(data.data)) {
          const fetchedCats = data.data.map((c: any) => {
            // Handle Strapi v4 (c.attributes) and v5 (flat) formats
            const name = c.attributes?.name || c.name || "İsimsiz Kategori";
            return { id: c.id, name };
          });
          setCategories(fetchedCats);
        } else {
          throw new Error("Beklenmedik veri yapısı");
        }
      } catch (error) {
        console.error("Kategoriler yüklenemedi:", error);
        // Fallback using actual categories from SQL
        setCategories([
          { id: 9, name: "Ansiklopedi" },
          { id: 13, name: "Roman" },
          { id: 14, name: "Sosyal Hizmet" },
          { id: 15, name: "Tarih" },
          { id: 16, name: "Coğrafya" },
          { id: 17, name: "Edebiyat" },
          { id: 18, name: "Din" },
          { id: 19, name: "Bilim" },
          { id: 20, name: "Dil ve Akademi" },
          { id: 21, name: "Sanat" },
          { id: 22, name: "Genel Kültür" },
          { id: 23, name: "Sağlık" },
          { id: 26, name: "Akademik" },
          { id: 27, name: "İş Dünyası" },
          { id: 28, name: "Sempozyum" },
          { id: 31, name: "Toplumsal Bilimler" },
          { id: 24, name: "Diğer" }
        ]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
    if (!isEditMode) generateNewCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: book?.title ?? "",
      author: book?.author ?? "",
      publisher: book?.publisher ?? "",
      isbn: book?.isbn ?? "",
      category: book?.category?.name ?? "",
      column: book?.bookCode?.split('0')[1] || "A",
      row: book?.bookCode?.split('0')[2] || "1",
      quantity: book?.quantity ?? 1,
    },
  });

  const title = form.watch("title");
  const watchedQuantity = form.watch("quantity");
  const watchedCategory = form.watch("category");
  const watchedColumn = form.watch("column");
  const watchedRow = form.watch("row");

  // Automated Code Generation Logic
  React.useEffect(() => {
    if (watchedCategory && watchedColumn && watchedRow) {
      const catPrefix = watchedCategory.substring(0, 3).toUpperCase();
      // Only generate new random suffix if we don't have one or if it's a new book
      const currentSuffix = bookCode.length > 9 ? bookCode.split('0').pop() : Math.floor(10000 + Math.random() * 90000).toString();

      const newCode = `${catPrefix}0${watchedColumn.toUpperCase()}0${watchedRow}0${currentSuffix}`;
      setBookCode(newCode);
      setBarcodeValue(newCode); // Using the same for barcode as per user description
    }
  }, [watchedCategory, watchedColumn, watchedRow, isEditMode]);

  const generateNewCodes = () => {
    const cat = form.getValues("category") || "KIT";
    const col = form.getValues("column") || "A";
    const row = form.getValues("row") || "1";
    const catPrefix = cat.substring(0, 3).toUpperCase();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000).toString();
    const code = `${catPrefix}0${col.toUpperCase()}0${row}0${randomSuffix}`;
    setBookCode(code);
    setBarcodeValue(code);
  };

  React.useEffect(() => {
    if (title.length > 3) {
      const t = setTimeout(async () => {
        setIsSearching(true);
        setTimeout(() => {
          if (title.toLowerCase().includes("nutuk") || title.toLowerCase().includes("ataturk")) {
            setSimilarBooks([{ id: 1, title: "Nutuk", author: "Mustafa Kemal Atatürk", availableQty: 5, quantity: 5 }]);
          } else {
            setSimilarBooks([]);
          }
          setIsSearching(false);
        }, 500);
      }, 300);
      return () => clearTimeout(t);
    } else {
      setSimilarBooks([]);
    }
  }, [title]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log({ ...values, bookCode, barcodeNumber: barcodeValue });
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      if (!isEditMode) { form.reset(); generateNewCodes(); }
    }, 2000);
  }

  const statusColor = book?.status === "active"
    ? "text-emerald-600 bg-emerald-50 border-emerald-200"
    : book?.status === "damaged"
      ? "text-red-600 bg-red-50 border-red-200"
      : "text-zinc-500 bg-zinc-50 border-zinc-200";

  const statusLabel = book?.status === "active" ? "Aktif" : book?.status === "damaged" ? "Hasarlı" : "Arşivlendi";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ─── Top Header ─────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 px-6 py-6 text-primary-foreground shrink-0 border-b border-white/10">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-20 w-40 -translate-x-1/2 rounded-full bg-white/5 blur-2xl" />

        <div className="relative flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-md ring-1 ring-white/30 transition-transform hover:scale-105">
            {isEditMode ? <PencilLine className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
          </div>

          <div className="flex-1 min-w-0 pr-8">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 leading-none">
              {isEditMode ? "Kitap Düzenleme" : "Yeni Kitap"}
            </p>
            <h2 className="mt-1.5 truncate text-xl font-black tracking-tight leading-none">
              {isEditMode ? (book?.title ?? "Kitap Düzenle") : "Sisteme Kitap Ekle"}
            </h2>
            {isEditMode && book?.author && (
              <p className="mt-1 text-sm font-bold text-white/70 leading-none">{book.author}</p>
            )}
          </div>

          {isEditMode && (
            <div className="absolute right-0 top-0">
              <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${statusColor} backdrop-blur-sm shadow-sm`}>
                {statusLabel}
              </span>
            </div>
          )}
        </div>

        {/* Stats row (edit mode only) */}
        {isEditMode && (
          <div className="relative mt-5 grid grid-cols-3 gap-3">
            {[
              { label: "Toplam", value: book?.quantity ?? 0 },
              { label: "Müsait", value: book?.availableQty ?? 0 },
              { label: "Ödünçte", value: (book?.quantity ?? 0) - (book?.availableQty ?? 0) },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-white/10 px-3 py-2 backdrop-blur-sm ring-1 ring-white/20">
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/50">{label}</p>
                <p className="text-2xl font-black leading-none mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Body: Single-column layout ────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" id="book-form">

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Temel Bilgiler</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Title */}
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70">
                  <BookOpen className="h-3 w-3" /> Kitap Adı
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Kitap adını giriniz..."
                      {...field}
                      className="h-12 rounded-xl border-2 bg-background pl-4 pr-10 text-sm font-semibold shadow-sm transition-all focus-visible:border-primary focus-visible:ring-0 focus-visible:shadow-md"
                    />
                    {isSearching && <Loader2 className="absolute right-3 top-3.5 h-5 w-5 animate-spin text-primary" />}
                  </div>
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )} />

            {/* Author + Category */}
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="author" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70">
                    <User className="h-3 w-3" /> Yazar
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Yazar adı..." {...field} className="h-12 rounded-xl border-2 bg-background text-sm font-semibold shadow-sm transition-all focus-visible:border-primary focus-visible:ring-0" />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )} />
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70">
                    <Tag className="h-3 w-3" /> Kategori
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 w-full rounded-xl border-2 bg-background px-4 text-sm font-semibold shadow-sm transition-all focus-visible:border-primary focus-visible:ring-0">
                        <SelectValue placeholder={isLoadingCategories ? "Yükleniyor..." : "Kategori seçiniz..."} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingCategories ? (
                        <SelectItem disabled value="loading">Yükleniyor...</SelectItem>
                      ) : categories.length === 0 ? (
                        <SelectItem disabled value="none">Kategori bulunamadı</SelectItem>
                      ) : (
                        categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )} />
            </div>

            {/* Publisher + ISBN */}
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="publisher" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70">
                    <Building2 className="h-3 w-3" /> Yayınevi
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Yayınevi..." {...field} className="h-12 rounded-xl border-2 bg-background text-sm font-semibold shadow-sm transition-all focus-visible:border-primary focus-visible:ring-0" />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )} />
              <FormField control={form.control} name="isbn" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70">
                    <Hash className="h-3 w-3" /> ISBN
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="978-..." {...field} className="h-12 rounded-xl border-2 bg-background font-mono text-sm shadow-sm transition-all focus-visible:border-primary focus-visible:ring-0" />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )} />
            </div>

            {/* Shelf Location Info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="column" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70">
                    <LayoutDashboard className="h-3 w-3" /> Sütun
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="A, B, C..." {...field} className="h-12 rounded-xl border-2 bg-background text-sm font-bold shadow-sm transition-all focus-visible:border-primary focus-visible:ring-0" />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )} />
              <FormField control={form.control} name="row" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70">
                    <Box className="h-3 w-3" /> Satır
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="1, 2, 3..." {...field} className="h-12 rounded-xl border-2 bg-background text-sm font-bold shadow-sm transition-all focus-visible:border-primary focus-visible:ring-0" />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )} />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 pt-1">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Stok Bilgileri</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Quantity */}
            <FormField control={form.control} name="quantity" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                  <Package className="h-3 w-3" /> Stok Adedi
                </FormLabel>
                <FormControl>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number" min={1}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      className="h-11 w-24 rounded-xl border-2 bg-background text-center text-lg font-black shadow-sm transition-all focus-visible:border-primary focus-visible:ring-0"
                    />
                    {isEditMode && (
                      <div className="flex-1">
                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground mb-1.5">
                          <span>Müsait: {book?.availableQty ?? 0}</span>
                          <span>Toplam: {watchedQuantity}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all"
                            style={{ width: `${((book?.availableQty ?? 0) / (watchedQuantity || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )} />

            {/* Similar books warning */}
            {similarBooks.length > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-xl border-2 border-amber-300/50 bg-amber-50/80 dark:bg-amber-950/20 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-black uppercase tracking-wider text-amber-700">Benzer Kayıt Tespit Edildi</span>
                </div>
                <div className="space-y-2">
                  {similarBooks.map((b) => (
                    <div key={b.id} className="flex items-center justify-between rounded-lg bg-white dark:bg-background border border-amber-200 px-3 py-2.5">
                      <div>
                        <div className="text-sm font-bold">{b.title}</div>
                        <div className="text-[11px] text-muted-foreground">{b.author} · Stok: {b.availableQty}/{b.quantity}</div>
                      </div>
                      <button type="button" className="text-[10px] font-bold uppercase tracking-wider text-amber-700 hover:text-amber-900 transition-colors"
                        onClick={() => alert("Stok artırma sayfasına yönlendiriliyor...")}>
                        Güncelle →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 pt-1">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Sistem & Kod</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Barcode Section (Formerly Sidebar) */}
            <div className="space-y-4 rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/5 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarcodeIcon className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-primary">Sistem Takip Kodu</span>
                </div>
                {!isEditMode ? (
                  <button type="button" onClick={generateNewCodes}
                    className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary hover:bg-primary/20 transition-all active:scale-95">
                    <RefreshCw className="h-3 w-3" /> Yenile
                  </button>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                    <ShieldCheck className="h-3 w-3" /> Veritabanı
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <div className="rounded-xl border-2 border-primary/15 bg-background px-4 py-3 shadow-sm">
                  <div className="flex justify-between items-end mb-1">
                    <p className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-wider">İç Takip Kodu</p>
                    <p className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-wider">ID: {book?.id || "YENİ"}</p>
                  </div>
                  <p className="font-mono text-lg font-black text-primary tracking-[0.12em] leading-none truncate">
                    {bookCode || "—"}
                  </p>
                </div>

                <div className="rounded-xl border bg-white flex flex-col items-center p-3 shadow-sm">
                  {barcodeValue ? (
                    <Barcode
                      value={barcodeValue}
                      width={1.2}
                      height={40}
                      fontSize={10}
                      background="transparent"
                      margin={0}
                      displayValue={true}
                    />
                  ) : (
                    <div className="h-10 flex items-center justify-center text-[10px] text-muted-foreground italic">
                      Üretiliyor...
                    </div>
                  )}
                </div>
              </div>

              {isEditMode && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-muted-foreground/10">
                  <div className="flex justify-between items-center bg-background/50 rounded-lg px-2.5 py-1.5 ring-1 ring-border">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Yayın Yılı</span>
                    <span className="text-xs font-black">{book?.publishYear ?? "—"}</span>
                  </div>
                  <div className="flex justify-between items-center bg-background/50 rounded-lg px-2.5 py-1.5 ring-1 ring-border">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Durum</span>
                    <span className="text-[9px] font-black uppercase text-primary tracking-widest">{book?.status ?? "Aktif"}</span>
                  </div>
                </div>
              )}
            </div>

          </form>
        </Form>
      </div>

      {/* ─── Sticky Footer ──────────────────────────── */}
      <div className="shrink-0 border-t bg-background/95 backdrop-blur-md px-6 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        <Button
          type="submit"
          form="book-form"
          disabled={isSubmitted}
          className="w-full h-12 rounded-xl text-sm font-black uppercase tracking-wider shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-100"
        >
          {isSubmitted ? (
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Kaydedildi!</span>
          ) : isEditMode ? (
            <span className="flex items-center gap-2"><PencilLine className="h-4 w-4" /> Değişiklikleri Kaydet</span>
          ) : (
            <span className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Kitabı Sisteme Kaydet</span>
          )}
        </Button>
      </div>
    </div>
  );
}
