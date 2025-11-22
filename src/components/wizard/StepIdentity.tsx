import { processDataStream } from "@ai-sdk/ui-utils";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ArrowRight, Brain, Sparkles, Palette, Info, Package, Briefcase, Users, MessageCircle, DollarSign, Zap, Plug, Code } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ShinyText from "./ShinyText";

interface StepIdentityProps {
  onNext: (data: any) => void;
  onAnalyzingChange?: (isAnalyzing: boolean) => void;
  onNameChange?: (name: string) => void;
}

type InsightType = "style" | "info" | "products" | "services" | "target_audience" | "tone" | "pricing" | "features" | "integrations" | "tech_stack";

interface Insight {
  type: InsightType;
  label: string;
  value: string;
  confidence?: "high" | "medium" | "low";
}

interface URLAnalysis {
  url: string;
  insights: Insight[];
}

const insightIcons: Record<InsightType, React.ComponentType<any>> = {
  style: Palette,
  info: Info,
  products: Package,
  services: Briefcase,
  target_audience: Users,
  tone: MessageCircle,
  pricing: DollarSign,
  features: Zap,
  integrations: Plug,
  tech_stack: Code,
};

const insightColors: Record<InsightType, string> = {
  style: "from-pink-500 to-rose-500",
  info: "from-blue-500 to-cyan-500",
  products: "from-purple-500 to-indigo-500",
  services: "from-green-500 to-emerald-500",
  target_audience: "from-orange-500 to-amber-500",
  tone: "from-violet-500 to-purple-500",
  pricing: "from-emerald-500 to-teal-500",
  features: "from-yellow-500 to-orange-500",
  integrations: "from-cyan-500 to-blue-500",
  tech_stack: "from-slate-500 to-gray-600",
};

export const StepIdentity = ({ onNext, onAnalyzingChange, onNameChange }: StepIdentityProps) => {
  const [name, setName] = useState("");
  const [identity, setIdentity] = useState("");
  const [urls, setUrls] = useState<string[]>([""]);
  const [type, setType] = useState<"producto" | "servicio">("producto");
  const [productName, setProductName] = useState("");
  const [urlAnalyses, setUrlAnalyses] = useState<Map<string, URLAnalysis>>(new Map());
  const [analyzingUrls, setAnalyzingUrls] = useState<Set<string>>(new Set());
  const [toolStatus, setToolStatus] = useState<Map<string, { toolName?: string; status: "calling" | "executing" | "complete" }>>(new Map());

  useEffect(() => {
    onNameChange?.(name);
  }, [name, onNameChange]);

  useEffect(() => {
    onAnalyzingChange?.(analyzingUrls.size > 0);
  }, [analyzingUrls.size, onAnalyzingChange]);

  const addUrl = () => setUrls([...urls, ""]);
  const removeUrl = (index: number) => {
    const removedUrl = urls[index];
    setUrls(urls.filter((_, i) => i !== index));
    if (removedUrl) {
      const newAnalyses = new Map(urlAnalyses);
      newAnalyses.delete(removedUrl);
      setUrlAnalyses(newAnalyses);
    }
  };
  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const analyzeUrl = async (url: string) => {
    if (!url || url.trim() === "") return;
    
    setAnalyzingUrls((prev) => {
      const newSet = new Set(prev).add(url);
      return newSet;
    });
    setUrlAnalyses((prev) => new Map(prev).set(url, { url, insights: [] }));
    const urlToolStatus = new Map<string, { toolName?: string; status: "calling" | "executing" | "complete" }>();

    try {
      const response = await fetch("/api/agent/analyze-urls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: [url] }),
      });

      if (!response.ok) throw new Error("Failed to analyze URL");
      if (!response.body) throw new Error("No response body");

      let fullJson = "";
      await processDataStream({
        stream: response.body,
        onTextPart: (text) => { 
          fullJson += text;
        },
        onToolCallStreamingStartPart: ({ toolCallId, toolName }) => {
          console.log("[Stream] Tool call start:", toolName);
          urlToolStatus.set(toolCallId, {
            toolName: toolName || "tool",
            status: "calling",
          });
          setToolStatus(new Map(urlToolStatus));
        },
        onToolCallPart: ({ toolCallId, toolName }) => {
          console.log("[Stream] Tool call:", toolName);
          urlToolStatus.set(toolCallId, {
            toolName: toolName || "tool",
            status: "calling",
          });
          setToolStatus(new Map(urlToolStatus));
        },
        onToolResultPart: ({ toolCallId, result }) => {
          console.log("[Stream] Tool result:", result);
          const existing = urlToolStatus.get(toolCallId);
          if (existing) {
            urlToolStatus.set(toolCallId, {
              ...existing,
              status: "complete",
            });
            setToolStatus(new Map(urlToolStatus));
          }
        },
        onMessageAnnotationsPart: (annotations) => {
          console.log("[Stream] Annotations:", annotations);
          const parsed = annotations[0] as any;
          if (parsed && parsed.insights && Array.isArray(parsed.insights)) {
            console.log("[Stream] Updating insights:", parsed.insights);
            setUrlAnalyses((prev) => {
              return new Map(prev).set(url, {
                url,
                insights: parsed.insights,
              });
            });
          }
        },
      });
    } catch (error) {
      console.error("Error analyzing URL:", error);
    } finally {
      setAnalyzingUrls((prev) => {
        const newSet = new Set(prev);
        newSet.delete(url);
        return newSet;
      });
    }
  };

  useEffect(() => {
    const validUrls = urls.filter((u) => u && u.trim() !== "" && !urlAnalyses.has(u) && !analyzingUrls.has(u));
    
    if (validUrls.length > 0) {
      const timeoutId = setTimeout(() => {
        validUrls.forEach(url => analyzeUrl(url));
      }, 1500);
      return () => clearTimeout(timeoutId);
    }
  }, [urls]);

  const handleNext = () => {
    if (name && identity && productName) {
      onNext({ 
        name,
        identity, 
        urls: urls.filter((u) => u), 
        type, 
        productName, 
        urlAnalyses: Array.from(urlAnalyses.values())
      });
    }
  };

  return (
    <div className="space-y-10">
      <div className="space-y-8">
        <div className="space-y-4">
          <Label htmlFor="name" className="text-[15px] font-medium text-slate-500 ml-1">
            Nombre del negocio o marca
          </Label>
          <Input
            id="name"
            placeholder="Ej: Vita, Mi Gimnasio, etc."
            className="glass-input h-16 text-lg rounded-[1.25rem] px-5"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="space-y-4">
          <Label htmlFor="identity" className="text-[15px] font-medium text-slate-500 ml-1">
            {name ? `Cuéntanos sobre ${name}` : "Cuéntanos sobre tu negocio"}
          </Label>
          <Input
            id="identity"
            placeholder="Describe brevemente qué hace..."
            className="glass-input h-16 text-lg rounded-[1.25rem] px-5"
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Label className="text-[15px] font-medium text-slate-500 ml-1">Sus URLs</Label>
            {analyzingUrls.size > 0 && (
              <div className="flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-blue-500" />
                <ShinyText 
                  text="Analizando..." 
                  disabled={false} 
                  speed={3} 
                  className="text-xs font-medium"
                />
              </div>
            )}
          </div>
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {urls.map((url, index) => {
                const analysis = url ? urlAnalyses.get(url) : null;
                const isAnalyzing = url && analyzingUrls.has(url);
                
                return (
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
                        className="glass-input h-16 text-lg rounded-[1.25rem] px-5 pr-32"
                        value={url}
                        onChange={(e) => updateUrl(index, e.target.value)}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        {isAnalyzing && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <Sparkles className="w-5 h-5 text-blue-500" />
                          </motion.div>
                        )}
                        {analysis && analysis.insights.length > 0 && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center -space-x-2"
                          >
                            {analysis.insights.slice(0, 5).map((insight, i) => {
                              const Icon = insightIcons[insight.type];
                              const colorClass = insightColors[insight.type];
                              return (
                                <motion.div
                                  key={i}
                                  initial={{ scale: 0, x: -10 }}
                                  animate={{ scale: 1, x: 0 }}
                                  transition={{ delay: i * 0.1 }}
                                  className={`w-7 h-7 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white shadow-lg border-2 border-white`}
                                  title={insight.label}
                                >
                                  <Icon className="w-3.5 h-3.5" />
                                </motion.div>
                              );
                            })}
                            {analysis.insights.length > 5 && (
                              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-[10px] font-semibold shadow-lg border-2 border-white">
                                +{analysis.insights.length - 5}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
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
                );
              })}
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

        <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-slate-100/80 rounded-[1.5rem] border border-slate-200/50 shadow-inner">
          <button
            onClick={() => setType("producto")}
            className={`py-4 rounded-[1.25rem] text-lg font-medium transition-all duration-300 relative overflow-hidden ${
              type === "producto"
                ? "text-slate-900"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {type === "producto" && (
              <motion.div 
                layoutId="activeTab"
                className="absolute inset-0 glass-input rounded-[1.25rem]"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">Producto</span>
          </button>
          <button
            onClick={() => setType("servicio")}
            className={`py-4 rounded-[1.25rem] text-lg font-medium transition-all duration-300 relative overflow-hidden ${
              type === "servicio"
                ? "text-slate-900"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {type === "servicio" && (
              <motion.div 
                layoutId="activeTab"
                className="absolute inset-0 glass-input rounded-[1.25rem]"
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
          disabled={!name || !identity || !productName}
          className="glass-button-primary h-16 rounded-full px-10 text-[17px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continuar <ArrowRight className="ml-2.5 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
