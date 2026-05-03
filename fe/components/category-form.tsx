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
  Tag, 
  Loader2, 
  CheckCircle2, 
  Sparkles, 
  PencilLine, 
  ArrowRight 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STRAPI_URL = "http://localhost:1337";

const formSchema = z.object({
  name: z.string().min(2, "Kategori adı en az 2 karakter olmalıdır"),
});

interface CategoryFormProps {
  category?: { id: number; name: string };
  onSuccess?: () => void;
}

export function CategoryForm({ category, onSuccess }: CategoryFormProps) {
  const isEditMode = !!category;
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitted(true);
    try {
      const url = isEditMode 
        ? `${STRAPI_URL}/api/categories/${category.id}`
        : `${STRAPI_URL}/api/categories`;
      
      const method = isEditMode ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: values }),
      });

      if (!response.ok) throw new Error("İşlem başarısız");

      setTimeout(() => {
        setIsSubmitted(false);
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (error) {
      console.error("Error saving category:", error);
      setIsSubmitted(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-zinc-50/50">
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800 px-6 py-6 text-white shrink-0">
        <div className="relative flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
            {isEditMode ? <PencilLine className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">{isEditMode ? "Kategori Düzenleme" : "Yeni Kategori"}</p>
            <h2 className="text-xl font-black tracking-tight">{isEditMode ? category.name : "Kategori Ekle"}</h2>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" id="category-form">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70">
                    <Tag className="h-4 w-4" /> Kategori Adı
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Örn: Bilim Kurgu, Tarih..." 
                      {...field} 
                      className="h-14 rounded-2xl border-zinc-200 bg-zinc-50/50 px-5 text-lg font-bold shadow-inner focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10" 
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )} />
            </motion.div>
          </form>
        </Form>
      </div>

      <div className="border-t bg-white/80 p-6 backdrop-blur-xl shrink-0">
        <Button 
          type="submit" 
          form="category-form"
          className="relative h-14 w-full overflow-hidden rounded-2xl bg-zinc-900 text-sm font-black uppercase tracking-[0.2em] transition-all hover:bg-zinc-800 hover:shadow-xl active:scale-[0.98]"
          disabled={isSubmitted}
        >
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2 text-emerald-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                KAYDEDİLİYOR...
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2">
                {isEditMode ? <PencilLine className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {isEditMode ? "KATEGORİYİ GÜNCELLE" : "KATEGORİYİ KAYDET"}
                <ArrowRight className="ml-1 h-4 w-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </div>
  );
}

function Plus(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
  );
}
