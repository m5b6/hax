import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Sparkles, Copy, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import CircularGallery from "./CircularGallery";

interface StepFinalProps {
  data: any;
}

export const StepFinal = ({ data }: StepFinalProps) => {
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsGenerating(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-28 space-y-10">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#40C9FF]/15 via-[#E81CFF]/15 to-[#FF9F0A]/15 blur-3xl rounded-full" />
          <Sparkles className="w-24 h-24 text-[#40C9FF] animate-pulse relative z-10" strokeWidth={1.5} />
        </div>
        <div className="text-center space-y-4">
          <h3 className="text-3xl font-semibold text-slate-900 tracking-tight">
            Creando tu campaña...
          </h3>
          <p className="text-slate-500 max-w-sm mx-auto text-lg font-light leading-relaxed">
            Redactando anuncios, seleccionando públicos y optimizando creatividades.
          </p>
        </div>
        <div className="flex gap-4 pt-6">
          <span className="w-3 h-3 bg-[#40C9FF] rounded-full animate-[bounce_1.4s_infinite] [animation-delay:-0.32s]" />
          <span className="w-3 h-3 bg-[#E81CFF] rounded-full animate-[bounce_1.4s_infinite] [animation-delay:-0.16s]" />
          <span className="w-3 h-3 bg-[#FF9F0A] rounded-full animate-[bounce_1.4s_infinite]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="text-center mb-12">
        <motion.div 
          initial={{ scale: 0, rotate: -20 }} 
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="inline-flex items-center justify-center w-24 h-24 bg-[#30D158]/10 text-[#30D158] rounded-full mb-8 ring-1 ring-[#30D158]/20 backdrop-blur-xl"
          style={{
            boxShadow: '0 4px 12px rgba(48,209,88,0.15), inset 0 1px 0 rgba(255,255,255,0.3)'
          }}
        >
          <CheckCircle2 className="w-12 h-12 stroke-[1.5]" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">¡Tu campaña está lista!</h2>
          <p className="text-slate-500 text-xl font-light">
            Todo listo para lanzar en Meta Ads.
          </p>
        </motion.div>
      </div>

      <div className="grid gap-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Card className="border-none overflow-hidden rounded-[2rem] bg-white relative"
            style={{
              boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 8px rgba(0,0,0,0.03), 0 8px 16px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.8)'
            }}
          >
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-6 px-8 relative z-10">
              <CardTitle className="text-xl flex items-center gap-3 text-slate-900 font-medium">
                <span className="text-2xl">🎨</span> Creatividades Generadas
              </CardTitle>
            </CardHeader>
            <div className="w-full h-[600px] bg-white relative">
               <CircularGallery bend={3} textColor="#1e293b" borderRadius={0.05} scrollEase={0.02} />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Card className="border-none overflow-hidden rounded-[2rem] bg-white relative"
            style={{
              boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 8px rgba(0,0,0,0.03), 0 8px 16px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.8)'
            }}
          >
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-6 px-8">
              <CardTitle className="text-xl flex items-center gap-3 text-slate-900 font-medium">
                <span className="text-2xl">✍️</span> Copy Sugerido
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-xs text-[#007AFF] uppercase tracking-[0.2em]">Opción 1: Directa</p>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg active:scale-95"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-slate-600 leading-relaxed bg-slate-50/50 p-8 rounded-[1.5rem] border border-slate-100 font-light text-[17px]"
                  style={{
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                  }}
                >
                  <p>¿Buscas <span className="text-slate-900 font-semibold">{data.productName}</span>? 🚀</p>
                  <br />
                  <p>Descubre la solución perfecta para <span className="text-slate-900">{data.strategy?.audience || "ti"}</span>. 
                  Calidad garantizada y resultados inmediatos.</p>
                  <br />
                  <p className="text-[#007AFF] font-medium">👉 Compra aquí: {data.urls?.[0]}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Card className="border-none overflow-hidden rounded-[2rem] bg-white relative"
            style={{
              boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 8px rgba(0,0,0,0.03), 0 8px 16px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.8)'
            }}
          >
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-6 px-8">
              <CardTitle className="text-xl flex items-center gap-3 text-slate-900 font-medium">
                <span className="text-2xl">🎯</span> Segmentación
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { label: "Ubicación", value: data.strategy?.location },
                { label: "Intereses", value: data.type === "producto" ? "Compras online, Lujo" : "Negocios, Emprendimiento" },
                { label: "Edad", value: "25 - 45 años" },
                { label: "Objetivo", value: data.strategy?.goal },
              ].map((item, i) => (
                <div 
                  key={i} 
                  className="bg-slate-50/50 p-6 rounded-[1.5rem] border border-slate-100 hover:bg-white transition-all group"
                  style={{
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                  }}
                >
                  <p className="text-[11px] text-slate-400 uppercase tracking-widest mb-3 font-medium group-hover:text-slate-500 transition-colors">{item.label}</p>
                  <p className="font-medium text-lg text-slate-900 tracking-wide">{item.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="pt-12 pb-8 flex justify-center gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => window.location.reload()}
          className="glass-button-secondary h-14 rounded-full px-8 text-[15px]"
        >
          Comenzar de nuevo
        </Button>
        <Button
          size="lg"
          className="glass-button-primary h-14 rounded-full px-8 text-[15px] font-semibold"
        >
          <Share2 className="w-4 h-4 mr-2" /> Exportar PDF
        </Button>
      </div>
    </div>
  );
};
