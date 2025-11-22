import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ArrowRight, Brain, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@ai-sdk/react";

interface StepIdentityProps {
  onNext: (data: any) => void;
}

export const StepIdentity = ({ onNext }: StepIdentityProps) => {
  const [identity, setIdentity] = useState("");
  const [urls, setUrls] = useState<string[]>([""]);
  const [type, setType] = useState<"producto" | "servicio">("producto");
  const [productName, setProductName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState("");

  const addUrl = () => setUrls([...urls, ""]);
  const removeUrl = (index: number) => setUrls(urls.filter((_, i) => i !== index));
  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const analyzeUrls = async () => {
    const validUrls = urls.filter((u) => u && u.trim() !== "");
    if (validUrls.length === 0) return;

    setIsAnalyzing(true);
    setAnalysis("");

    try {
      const response = await fetch("/api/agent/analyze-urls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: validUrls }),
      });

      if (!response.ok) throw new Error("Failed to analyze URLs");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response body");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("0:")) {
            const content = line.slice(2).trim();
            if (content) {
              setAnalysis((prev) => prev + content);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error analyzing URLs:", error);
      setAnalysis("Error al analizar las URLs. Por favor, intenta de nuevo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const validUrls = urls.filter((u) => u && u.trim() !== "");
    if (validUrls.length > 0) {
      const timeoutId = setTimeout(() => {
        analyzeUrls();
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [urls]);

  const handleNext = () => {
    if (identity && productName) {
      onNext({ identity, urls: urls.filter((u) => u), type, productName, analysis });
    }
  };

  return (
    <div className="space-y-10">
      <div className="space-y-8">
        <div className="space-y-4">
          <Label htmlFor="identity" className="text-[15px] font-medium text-slate-500 ml-1">
            ¿Quiénes son?
          </Label>
          <Input
            id="identity"
            placeholder="Describe tu negocio brevemente..."
            className="glass-input h-16 text-lg rounded-[1.25rem] px-5"
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
            autoFocus
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Label className="text-[15px] font-medium text-slate-500 ml-1">Sus URLs</Label>
            {isAnalyzing && (
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="flex items-center gap-1.5 text-blue-500"
              >
                <Brain className="w-4 h-4" />
                <span className="text-xs font-medium">Analizando...</span>
              </motion.div>
            )}
          </div>
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {urls.map((url, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="flex gap-3 overflow-hidden"
                >
                  <div className="relative flex-1">
                    <Input
                      placeholder="https://..."
                      className="glass-input h-14 rounded-[1.25rem] px-5 pr-12"
                      value={url}
                      onChange={(e) => updateUrl(index, e.target.value)}
                    />
                    {isAnalyzing && url && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-5 h-5 text-blue-500" />
                        </motion.div>
                      </div>
                    )}
                  </div>
                  {urls.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeUrl(index)}
                      className="h-14 w-14 shrink-0 rounded-[1.25rem] bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-100 shadow-sm active:shadow-inner active:scale-[0.96]"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={addUrl}
            className="mt-1 h-10 px-4 rounded-full text-[13px] font-medium text-slate-400 hover:text-blue-500 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all active:scale-[0.96]"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Agregar otra URL
          </Button>
        </div>

        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-[1.25rem] bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100/50"
          >
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">Análisis del Agente</span>
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {analysis}
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-slate-100/80 rounded-[1.5rem] border border-slate-200/50 shadow-inner">
          <button
            onClick={() => setType("producto")}
            className={`py-4 rounded-[1.25rem] text-[15px] font-medium transition-all duration-300 relative overflow-hidden ${
              type === "producto"
                ? "text-slate-900"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {type === "producto" && (
              <motion.div 
                layoutId="activeTab"
                className="absolute inset-0 bg-white rounded-[1.25rem] border border-slate-200/50"
                style={{
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.8)'
                }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">Producto</span>
          </button>
          <button
            onClick={() => setType("servicio")}
            className={`py-4 rounded-[1.25rem] text-[15px] font-medium transition-all duration-300 relative overflow-hidden ${
              type === "servicio"
                ? "text-slate-900"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {type === "servicio" && (
              <motion.div 
                layoutId="activeTab"
                className="absolute inset-0 bg-white rounded-[1.25rem] border border-slate-200/50"
                style={{
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.8)'
                }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">Servicio</span>
          </button>
        </div>

        <div className="space-y-4">
          <Label htmlFor="productName" className="text-[15px] font-medium text-slate-500 ml-1">
            Nombre del {type}
          </Label>
          <Input
            id="productName"
            placeholder={`Ej: ${type === "producto" ? "Zapatillas Runner X" : "Consultoría Fiscal"}`}
            className="glass-input h-16 text-lg rounded-[1.25rem] px-5"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>
      </div>

      <div className="pt-8 flex justify-end">
        <Button
          size="lg"
          onClick={handleNext}
          disabled={!identity || !productName}
          className="glass-button-primary h-16 rounded-full px-10 text-[17px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continuar <ArrowRight className="ml-2.5 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
