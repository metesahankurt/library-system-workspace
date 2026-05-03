"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { X, Camera, ScanLine, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BarcodeScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    const startScanner = async () => {
      setIsInitializing(true);
      setError(null);
      
      try {
        // Ensure the element is empty before starting
        const container = document.getElementById("reader");
        if (container) container.innerHTML = "";

        html5QrCode = new Html5Qrcode("reader");
        html5QrCodeRef.current = html5QrCode;

        const scannerConfig = {
          fps: 15,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.0,
        };

        const onScanSuccess = (decodedText: string) => {
          onScan(decodedText);
          if (html5QrCode) {
            html5QrCode.stop().catch(() => {});
          }
          onClose();
        };

        try {
          // Attempt to start with environment camera
          await html5QrCode.start(
            { facingMode: "environment" },
            scannerConfig,
            onScanSuccess,
            () => {}
          );
        } catch (e) {
          console.warn("Environment camera failed, trying any available camera", e);
          const cameras = await Html5Qrcode.getCameras();
          if (cameras && cameras.length > 0) {
            await html5QrCode.start(
              cameras[0].id,
              scannerConfig,
              onScanSuccess,
              () => {}
            );
          } else {
            throw new Error("No cameras found");
          }
        }
        setIsInitializing(false);
      } catch (err: any) {
        console.error("Scanner Error:", err);
        setError("Kamera başlatılamadı. İzinleri kontrol edip tekrar deneyin.");
        setIsInitializing(false);
      }
    };

    startScanner();

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(e => console.error("Cleanup error", e));
      }
    };
  }, [onScan, onClose]);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10">
        {/* Header */}
        <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-xl shadow-lg">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-black text-sm tracking-tight">Kamera Tarayıcı</h3>
              <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Barkodu Hizalayın</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Scanner Viewport */}
        <div className="aspect-square w-full bg-zinc-800 flex items-center justify-center relative overflow-hidden">
          <div id="reader" className="w-full h-full [&_video]:object-cover"></div>
          
          {isInitializing && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 gap-3 z-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Kamera Başlatılıyor...</p>
            </div>
          )}

          {/* Scanning Overlay UI */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
            <div className="w-[250px] h-[150px] border-2 border-white/20 rounded-2xl relative">
              {/* Dimmed Background Outside Scanner Area */}
              <div className="absolute -inset-[1000px] shadow-[0_0_0_1000px_rgba(0,0,0,0.5)]" />
              
              {/* Corner Accents */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
              
              {/* Animated Laser Line */}
              {!isInitializing && (
                <div className="absolute inset-x-0 h-0.5 bg-primary shadow-[0_0_15px_rgba(var(--primary),1)] animate-scan-line" />
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-3 text-white/40">
            <ScanLine className="h-5 w-5" />
            <p className="text-xs font-bold tracking-tight">Desteklenen: CODE128, EAN, QR</p>
          </div>
          {error && (
            <div className="space-y-4">
              <p className="text-red-400 text-xs font-bold bg-red-400/10 p-3 rounded-xl border border-red-400/20">{error}</p>
              <Button 
                onClick={handleRetry}
                className="w-full h-11 rounded-xl bg-white text-zinc-900 font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all"
              >
                TEKRAR DENE
              </Button>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        #reader__dashboard_section_csr button {
          display: none !important;
        }
        #reader__status_span {
          display: none !important;
        }
        #reader {
          border: none !important;
        }
        @keyframes scan-line {
          0% { top: 0% }
          50% { top: 100% }
          100% { top: 0% }
        }
        .animate-scan-line {
          animation: scan-line 3s infinite linear;
        }
      `}</style>
    </div>
  );
}
