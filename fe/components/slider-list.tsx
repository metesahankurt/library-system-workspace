"use client";

import * as React from "react";
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Layout, 
  ExternalLink,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const STRAPI_URL = "http://localhost:1337";

interface Slider {
  id: number;
  title: string;
  link: string;
  image: {
    url: string;
  };
}

interface SliderListProps {
  onAdd: () => void;
  onEdit: (slider: Slider) => void;
}

export function SliderList({ onAdd, onEdit }: SliderListProps) {
  const [sliders, setSliders] = React.useState<Slider[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchSliders = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${STRAPI_URL}/api/sliders?populate=*`);
      const data = await response.json();
      
      if (data.data) {
        setSliders(data.data.map((item: any) => ({
          id: item.id,
          ...item,
        })));
      }
    } catch (err) {
      setError("Sliderlar yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSliders();
  }, [fetchSliders]);

  const handleDelete = async (id: number) => {
    if (!confirm("Bu slider'ı silmek istediğinize emin misiniz?")) return;
    
    try {
      const response = await fetch(`${STRAPI_URL}/api/sliders/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setSliders(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      alert("Silme işlemi sırasında bir hata oluştu.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-zinc-900">SLIDER YÖNETİMİ</h2>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Anasayfa en üst kısım akışını yönetin</p>
        </div>
        <Button 
          onClick={onAdd}
          className="h-12 px-6 rounded-2xl bg-zinc-900 text-white font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all gap-2 shadow-xl shadow-zinc-200"
        >
          <Plus className="h-4 w-4" /> YENİ SLIDER EKLE
        </Button>
      </div>

      {sliders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-zinc-200 bg-zinc-50/50 py-20 text-center">
          <Layout className="mb-4 h-12 w-12 text-zinc-300" />
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Henüz hiç slider eklenmemiş</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {sliders.map((slider, index) => (
              <motion.div
                key={slider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-[2.5rem] border bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
              >
                <div className="aspect-square w-full overflow-hidden bg-zinc-100">
                  {slider.image?.url ? (
                    <img 
                      src={`${STRAPI_URL}${slider.image.url}`} 
                      alt={slider.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-300">
                      <Layout className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="mb-1 text-lg font-black text-white uppercase tracking-tight">{slider.title}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/70 uppercase tracking-widest">
                      <ExternalLink className="h-3 w-3" /> {slider.link}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t p-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(slider)}
                    className="h-10 w-10 rounded-xl border-zinc-200 hover:bg-zinc-50 hover:text-primary transition-all"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(slider.id)}
                    className="h-10 w-10 rounded-xl border-zinc-200 hover:bg-zinc-50 hover:text-destructive transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
