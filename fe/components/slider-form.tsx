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
  Image as ImageIcon, 
  Loader2, 
  Sparkles, 
  PencilLine, 
  ArrowRight,
  Link as LinkIcon,
  Type
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STRAPI_URL = "http://localhost:1337";

const formSchema = z.object({
  title: z.string().min(2, "Başlık en az 2 karakter olmalıdır"),
  link: z.string().min(1, "Link zorunludur"),
  image: z.any().optional(),
});

interface SliderFormProps {
  slider?: any;
  onSuccess?: () => void;
}

export function SliderForm({ slider, onSuccess }: SliderFormProps) {
  const isEditMode = !!slider;
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: slider?.title || "",
      link: slider?.link || "/",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitted(true);
    try {
      let imageId = slider?.image?.id;

      // 1. Upload image if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("files", selectedFile);
        
        const uploadRes = await fetch(`${STRAPI_URL}/api/upload`, {
          method: "POST",
          body: formData,
        });
        
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData[0]) {
          imageId = uploadData[0].id;
        }
      }

      // 2. Save slider data
      const url = isEditMode 
        ? `${STRAPI_URL}/api/sliders/${slider.id}`
        : `${STRAPI_URL}/api/sliders`;
      
      const method = isEditMode ? "PUT" : "POST";
      
      const payload = {
        data: {
          title: values.title,
          link: values.link,
          image: imageId,
        }
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("İşlem başarısız");

      setTimeout(() => {
        setIsSubmitted(false);
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (error) {
      console.error("Error saving slider:", error);
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
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">{isEditMode ? "Slider Düzenleme" : "Yeni Slider"}</p>
            <h2 className="text-xl font-black tracking-tight">{isEditMode ? slider.title : "Slider Ekle"}</h2>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" id="slider-form">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70">
                    <Type className="h-4 w-4" /> Başlık
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Örn: Yeni Kitaplar Geldi!" 
                      {...field} 
                      className="h-14 rounded-2xl border-zinc-200 bg-zinc-50/50 px-5 text-lg font-bold shadow-inner focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="link" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70">
                    <LinkIcon className="h-4 w-4" /> Link
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="/kutuphane" 
                      {...field} 
                      className="h-14 rounded-2xl border-zinc-200 bg-zinc-50/50 px-5 text-lg font-bold shadow-inner focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="space-y-3">
                <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70">
                  <ImageIcon className="h-4 w-4" /> Görsel
                </label>
                <div className="relative group">
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="h-32 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 px-5 py-10 text-center cursor-pointer hover:border-primary/50 hover:bg-zinc-100/50 transition-all"
                  />
                  {!selectedFile && !slider?.image && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-zinc-400">
                      <ImageIcon className="h-8 w-8 mb-2" />
                      <span className="text-xs font-bold uppercase tracking-widest">Görsel Seçin</span>
                    </div>
                  )}
                  {(selectedFile || slider?.image) && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/5 rounded-2xl">
                       <span className="text-xs font-bold text-primary uppercase tracking-widest">Görsel Hazır</span>
                    </div>
                  )}
                </div>
              </div>

            </motion.div>
          </form>
        </Form>
      </div>

      <div className="border-t bg-white/80 p-6 backdrop-blur-xl shrink-0">
        <Button 
          type="submit" 
          form="slider-form"
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
                <Plus className="h-4 w-4" />
                {isEditMode ? "SLIDERI GÜNCELLE" : "SLIDERI KAYDET"}
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
