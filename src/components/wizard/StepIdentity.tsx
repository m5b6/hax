import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";
import { Plus, Trash2, ArrowRight, Palette, Info, Package, Briefcase, Users, MessageCircle, DollarSign, Zap, Plug, Code, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { InsightsChip } from "./InsightsChip";
import { useBrand } from "@/contexts/BrandContext";

interface StepIdentityProps {
  onNext: (data: any) => void;
  onAnalyzingChange?: (isAnalyzing: boolean) => void;
  onNameChange?: (name: string) => void;
}

interface ProductServiceOption {
  value: string;
  label: string;
  source: string;
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
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  images?: string[];
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
  const { setBrandColors, setBrandLogoUrl: setGlobalBrandLogo, setBrandImages, brandImages } = useBrand();
  const [name, setName] = useState("");
  const [identity, setIdentity] = useState("");
  const [urls, setUrls] = useState<string[]>([""]);
  const [type, setType] = useState<"producto" | "servicio">("producto");
  const [productName, setProductName] = useState("");
  const [urlAnalyses, setUrlAnalyses] = useState<Map<string, URLAnalysis>>(new Map());
  const [analyzingUrls, setAnalyzingUrls] = useState<Set<string>>(new Set());
  const [discoveredProducts, setDiscoveredProducts] = useState<ProductServiceOption[]>([]);
  const [discoveredServices, setDiscoveredServices] = useState<ProductServiceOption[]>([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [brandLogoUrl, setBrandLogoUrl] = useState<string | null>(null);

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

  const formatUrl = (url: string): string => {
    let formatted = url.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = 'https://' + formatted;
    }
    if (!formatted.endsWith('/')) {
      formatted = formatted + '/';
    }
    return formatted;
  };

  const analyzeUrl = async (url: string, index: number) => {
    if (!url || url.trim() === "") return;
    
    const formattedUrl = formatUrl(url);
    const newUrls = [...urls];
    newUrls[index] = formattedUrl;
    setUrls(newUrls);
    
    setAnalyzingUrls((prev) => new Set(prev).add(formattedUrl));
    setUrlAnalyses((prev) => new Map(prev).set(formattedUrl, { url: formattedUrl, insights: [] }));

    try {
      const response = await fetch("/api/agent/analyze-urls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: [formattedUrl] }),
      });

      if (!response.ok) throw new Error("Failed to analyze URL");

      const data = await response.json();
      
      if (data && data.insights && Array.isArray(data.insights)) {
        setUrlAnalyses((prev) => new Map(prev).set(formattedUrl, {
          url: formattedUrl,
          insights: data.insights,
          logoUrl: data.brandLogoUrl ?? null,
          primaryColor: data.primaryColor ?? null,
          secondaryColor: data.secondaryColor ?? null,
          images: Array.isArray(data.images) ? data.images : [],
        }));
      }

      const colorCandidates = [
        data.primaryColor,
        data.secondaryColor,
        ...(Array.isArray(data.colors) ? data.colors : []),
      ].filter((color): color is string => Boolean(color));

      if (colorCandidates.length > 0) {
        setBrandColors(colorCandidates.slice(0, 2));
      }

      if (data.brandLogoUrl) {
        setBrandLogoUrl(data.brandLogoUrl);
        setGlobalBrandLogo(data.brandLogoUrl);
      }

      if (Array.isArray(data.images) && data.images.length > 0) {
        const sanitizedImages = data.images
          .filter((img: string) => typeof img === "string" && img.trim().length > 0)
          .map((img: string) => img.trim());
        if (sanitizedImages.length > 0) {
          setBrandImages((prev) => {
            const merged = [...prev, ...sanitizedImages];
            const unique = merged.filter((img, idx) => merged.indexOf(img) === idx);
            return unique.slice(0, 8);
          });
        }
      }

      if (data.concreteProducts && Array.isArray(data.concreteProducts)) {
        const products: ProductServiceOption[] = data.concreteProducts.map((p: string) => ({
          value: p,
          label: p,
          source: formattedUrl,
        }));
        setDiscoveredProducts((prev) => {
          const combined = [...prev, ...products];
          const unique = combined.filter((item, index, self) => 
            index === self.findIndex((t) => t.value === item.value)
          );
          return unique;
        });
      }

      if (data.concreteServices && Array.isArray(data.concreteServices)) {
        const services: ProductServiceOption[] = data.concreteServices.map((s: string) => ({
          value: s,
          label: s,
          source: formattedUrl,
        }));
        setDiscoveredServices((prev) => {
          const combined = [...prev, ...services];
          const unique = combined.filter((item, index, self) => 
            index === self.findIndex((t) => t.value === item.value)
          );
          return unique;
        });
      }
    } catch (error) {
      console.error("Error analyzing URL:", error);
    } finally {
      setAnalyzingUrls((prev) => {
        const newSet = new Set(prev);
        newSet.delete(formattedUrl);
        return newSet;
      });
    }
  };

  useEffect(() => {
    const validUrlsWithIndex = urls
      .map((u, i) => ({ url: u, index: i }))
      .filter(({ url }) => url && url.trim() !== "" && !urlAnalyses.has(url) && !analyzingUrls.has(url) && !urlAnalyses.has(formatUrl(url)) && !analyzingUrls.has(formatUrl(url)));
    
    if (validUrlsWithIndex.length > 0) {
      const timeoutId = setTimeout(() => {
        validUrlsWithIndex.forEach(({ url, index }) => analyzeUrl(url, index));
      }, 1500);
      return () => clearTimeout(timeoutId);
    }
  }, [urls]);

  useEffect(() => {
    if (discoveredProducts.length > 0 && type === 'producto') {
      setShowProductDropdown(true);
    }
    if (discoveredServices.length > 0 && type === 'servicio') {
      setShowServiceDropdown(true);
    }
  }, [discoveredProducts, discoveredServices, type]);

  const handleNext = () => {
    if (name && identity && productName) {
      onNext({ 
        name,
        identity, 
        urls: urls.filter((u) => u), 
        type, 
        productName, 
        urlAnalyses: Array.from(urlAnalyses.values()),
        brandLogoUrl,
        brandImages,
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <div className="space-y-2.5">
          <Label htmlFor="name" className="text-sm font-medium text-slate-500 ml-1">
            Nombre del negocio o marca
          </Label>
          <Input
            id="name"
            placeholder="Ej: Vita, Mi Gimnasio, etc."
            className="glass-input h-12 text-base rounded-2xl px-4"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="identity" className="text-sm font-medium text-slate-500 ml-1">
            {name ? `Cuéntanos sobre ${name}` : "Cuéntanos sobre tu negocio"}
          </Label>
          <Input
            id="identity"
            placeholder="Describe brevemente qué hace..."
            className="glass-input h-12 text-base rounded-2xl px-4"
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
          />
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-sm font-medium text-slate-500 ml-1">Sus URLs</Label>
            <div className="flex items-center gap-2">
              {Array.from(urlAnalyses.values()).map((analysis) => 
                analysis.insights.length > 0 && (
                  <InsightsChip key={analysis.url} insights={analysis.insights} url={analysis.url} />
                )
              )}
            </div>
          </div>
          <div className="space-y-2">
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
                        className={`glass-input h-12 text-base rounded-2xl px-4 pr-12 transition-all duration-500 ${
                          isAnalyzing ? 'ring-2 ring-blue-400/30 shadow-lg shadow-blue-500/10' : ''
                        }`}
                        value={url}
                        onChange={(e) => updateUrl(index, e.target.value)}
                        disabled={!!isAnalyzing}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6">
                        <AnimatePresence mode="wait">
                          {isAnalyzing && (
                            <motion.div
                              key="analyzing"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="absolute inset-0 flex items-center justify-center"
                            >
                              <div className="relative w-5 h-5">
                                <motion.div
                                  className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 opacity-20"
                                  animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
                                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                />
                                <motion.div
                                  className="absolute inset-0.5 rounded-full border-2 border-blue-500"
                                  style={{ 
                                    borderTopColor: 'transparent',
                                    borderRightColor: 'rgb(147, 51, 234)',
                                  }}
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                />
                                <div className="absolute inset-[6px] rounded-full bg-gradient-to-tr from-blue-400 to-purple-500" />
                              </div>
                            </motion.div>
                          )}
                          {!isAnalyzing && analysis && analysis.insights.length > 0 && (
                            <motion.div
                              key="complete"
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0 }}
                              className="absolute inset-0 flex items-center justify-center"
                            >
                              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-green-400 to-emerald-500 shadow-lg shadow-green-500/30 flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    {urls.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeUrl(index)}
                        className="h-12 w-12 shrink-0 rounded-2xl bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-100 shadow-sm active:shadow-inner active:scale-[0.96]"
                      >
                        <Trash2 className="w-4 h-4" />
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
            className="h-8 px-3 rounded-full text-xs font-medium text-slate-400 hover:text-blue-500 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all active:scale-[0.96]"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Agregar otra URL
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/50 shadow-inner">
          <button
            onClick={() => setType("producto")}
            className={`py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden flex items-center justify-center gap-2 ${
              type === "producto"
                ? "text-slate-900"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {type === "producto" && (
              <motion.div 
                layoutId="activeTab"
                className="absolute inset-0 glass-input rounded-xl shadow-md"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Package className={`w-4 h-4 relative z-10 ${type === "producto" ? "text-slate-900" : "text-slate-400"}`} />
            <span className="relative z-10">Producto</span>
          </button>
          <button
            onClick={() => setType("servicio")}
            className={`py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden flex items-center justify-center gap-2 ${
              type === "servicio"
                ? "text-slate-900"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {type === "servicio" && (
              <motion.div 
                layoutId="activeTab"
                className="absolute inset-0 glass-input rounded-xl shadow-md"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Briefcase className={`w-4 h-4 relative z-10 ${type === "servicio" ? "text-slate-900" : "text-slate-400"}`} />
            <span className="relative z-10">Servicio</span>
          </button>
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="productName" className="text-sm font-medium text-slate-500 ml-1">
            Nombre del {type}
          </Label>
          {type === 'producto' && discoveredProducts.length > 0 && showProductDropdown ? (
            <Select value={productName} onValueChange={(value) => {
              if (value === '__custom__') {
                setShowProductDropdown(false);
                setProductName('');
              } else {
                setProductName(value);
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un producto..." />
              </SelectTrigger>
              <SelectContent>
                {discoveredProducts.map((product, i) => (
                  <SelectItem key={i} value={product.value}>
                    {product.label}
                  </SelectItem>
                ))}
                <SelectSeparator />
                <SelectItem value="__custom__" className="text-blue-500">
                  <div className="flex items-center gap-2">
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Escribir otro...</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          ) : type === 'servicio' && discoveredServices.length > 0 && showServiceDropdown ? (
            <Select value={productName} onValueChange={(value) => {
              if (value === '__custom__') {
                setShowServiceDropdown(false);
                setProductName('');
              } else {
                setProductName(value);
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un servicio..." />
              </SelectTrigger>
              <SelectContent>
                {discoveredServices.map((service, i) => (
                  <SelectItem key={i} value={service.value}>
                    {service.label}
                  </SelectItem>
                ))}
                <SelectSeparator />
                <SelectItem value="__custom__" className="text-blue-500">
                  <div className="flex items-center gap-2">
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Escribir otro...</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="relative">
              <Input
                id="productName"
                placeholder={`Ej: ${type === "producto" ? "Zapatillas Runner X" : "Consultoría Fiscal"}`}
                className="glass-input h-12 text-base rounded-2xl px-4"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
              {((type === 'producto' && discoveredProducts.length > 0) || (type === 'servicio' && discoveredServices.length > 0)) && (
                <button
                  type="button"
                  onClick={() => {
                    if (type === 'producto') setShowProductDropdown(true);
                    else setShowServiceDropdown(true);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors"
                >
                  Ver opciones
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <Button
          size="lg"
          onClick={handleNext}
          disabled={!name || !identity || !productName}
          className="glass-button-primary h-12 rounded-full px-8 text-base font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continuar <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
