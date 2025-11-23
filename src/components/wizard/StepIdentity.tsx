import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";
import { Trash2, ArrowRight, Palette, Info, Package, Briefcase, Users, MessageCircle, DollarSign, Zap, Plug, Code, Pencil, Sparkles, Search, Eye } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { InsightsChip } from "./InsightsChip";
import { useBrand } from "@/contexts/BrandContext";
import { useWizardStore } from "@/contexts/WizardStore";
import { URLAnalysis, Insight } from "@/types/wizard";
import { RotatingLoader } from "@/components/ui/rotating-loader";

interface StepIdentityProps {
  onNext: () => void;
  onAnalyzingChange?: (isAnalyzing: boolean) => void;
}

interface ProductServiceOption {
  value: string;
  label: string;
  source: string;
  icon?: string;
  color?: string;
}

const insightIcons: Record<Insight["type"], React.ComponentType<any>> = {
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

const insightColors: Record<Insight["type"], string> = {
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

// Helper to get icon component by name from lucide-react
const getIconByName = (iconName: string): React.ComponentType<any> => {
  if (!iconName || typeof iconName !== 'string') {
    return Package; // Default icon
  }
  
  // Try exact match first
  const exactMatch = LucideIcons[iconName as keyof typeof LucideIcons];
  if (exactMatch) {
    return exactMatch as React.ComponentType<any>;
  }
  
  // Try case-insensitive match
  const normalizedName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
  const caseMatch = LucideIcons[normalizedName as keyof typeof LucideIcons];
  if (caseMatch) {
    return caseMatch as React.ComponentType<any>;
  }
  
  return Package; // Fallback
};

export const StepIdentity = ({ onNext, onAnalyzingChange }: StepIdentityProps) => {
  const wizardStore = useWizardStore();
  const { setBrandColors, setBrandLogoUrl: setGlobalBrandLogo, setBrandImages, brandImages } = useBrand();
  
  // Get initial values from store
  const storedName = wizardStore.getInput("name") || "";
  const storedIdentity = wizardStore.getInput("identity") || "";
  const storedUrls = wizardStore.getInput("urls") || [""];
  const storedType = wizardStore.getInput("type") || "producto";
  const storedProductName = wizardStore.getInput("productName") || "";
  const storedUrlAnalyses = wizardStore.getAgentResponse("urlAnalyses") || [];
  
  const [name, setName] = useState(storedName);
  const [identity, setIdentity] = useState(storedIdentity);
  const [urls, setUrls] = useState<string[]>(storedUrls.length > 0 ? storedUrls : [""]);
  const [type, setType] = useState<"producto" | "servicio">(storedType as "producto" | "servicio");
  const [productName, setProductName] = useState(storedProductName);
  const [analyzingUrls, setAnalyzingUrls] = useState<Set<string>>(new Set());
  const [discoveredProducts, setDiscoveredProducts] = useState<ProductServiceOption[]>([]);
  const [discoveredServices, setDiscoveredServices] = useState<ProductServiceOption[]>([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  
  // Create a Map from stored analyses for easier lookup
  const urlAnalysesMap = new Map<string, URLAnalysis>(
    storedUrlAnalyses.map((analysis: URLAnalysis) => [analysis.url, analysis])
  );
  const [urlAnalyses, setUrlAnalyses] = useState<Map<string, URLAnalysis>>(urlAnalysesMap);

  // Sync local state to store
  useEffect(() => {
    wizardStore.setInput("name", name);
  }, [name]);

  useEffect(() => {
    wizardStore.setInput("identity", identity);
  }, [identity]);

  useEffect(() => {
    wizardStore.setInput("urls", urls.filter((u) => u));
  }, [urls]);

  useEffect(() => {
    wizardStore.setInput("type", type);
  }, [type]);

  useEffect(() => {
    wizardStore.setInput("productName", productName);
    
    // Add or update first pick to selection stack when productName is set
    if (productName && productName.trim() !== "") {
      const stack = wizardStore.getSelectionStack();
      const firstPickIndex = stack.findIndex(item => item.id === "first-pick");
      
      // Determine icon and color based on type
      const icon = type === "producto" ? "Package" : "Briefcase";
      const color = type === "producto" ? "#3B82F6" : "#10B981";
      const text = type === "producto" ? "Producto" : "Servicio";
      const firstPickItem = {
        id: "first-pick",
        text: `${text}: ${productName}`,
        icon: icon,
        color: color,
      };
      
      // Preserve brand logo at the beginning
      const brandLogo = stack.find(item => item.id === "brand-logo");
      const otherItems = stack.filter(item => item.id !== "first-pick" && item.id !== "brand-logo");
      
      if (firstPickIndex === -1) {
        // Add first pick after brand logo
        const updatedStack = brandLogo 
          ? [brandLogo, firstPickItem, ...otherItems]
          : [firstPickItem, ...otherItems];
        wizardStore.setAgentResponse("selectionStack", updatedStack);
      } else {
        // Update existing first pick, keeping brand logo first
        const updatedStack = brandLogo
          ? [brandLogo, firstPickItem, ...otherItems]
          : [firstPickItem, ...otherItems];
        wizardStore.setAgentResponse("selectionStack", updatedStack);
      }
    } else {
      // Remove first pick if productName is cleared
      const stack = wizardStore.getSelectionStack();
      const updatedStack = stack.filter(item => item.id !== "first-pick");
      if (updatedStack.length !== stack.length) {
        wizardStore.setAgentResponse("selectionStack", updatedStack);
      }
    }
  }, [productName, type]);

  useEffect(() => {
    onAnalyzingChange?.(analyzingUrls.size > 0);
  }, [analyzingUrls.size, onAnalyzingChange]);

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

  const removeUrl = (index: number) => {
    const removedUrl = urls[index];
    const formattedUrl = removedUrl ? formatUrl(removedUrl) : null;
    setUrls(urls.filter((_, i) => i !== index));
    if (formattedUrl) {
      const newAnalyses = new Map(urlAnalyses);
      newAnalyses.delete(formattedUrl);
      setUrlAnalyses(newAnalyses);
      wizardStore.removeURLAnalysis(formattedUrl);
    }
  };
  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
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
        const analysis: URLAnalysis = {
          url: formattedUrl,
          insights: data.insights,
          logoUrl: data.brandLogoUrl ?? null,
          primaryColor: data.primaryColor ?? null,
          secondaryColor: data.secondaryColor ?? null,
          images: Array.isArray(data.images) ? data.images : [],
          summary: data.summary,
          concreteProducts: data.concreteProducts,
          concreteServices: data.concreteServices,
          colors: data.colors,
        };
        
        setUrlAnalyses((prev) => new Map(prev).set(formattedUrl, analysis));
        wizardStore.addURLAnalysis(analysis);
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
        setGlobalBrandLogo(data.brandLogoUrl);
        
        // Add brand logo to selection stack as first item
        const currentStack = wizardStore.getSelectionStack();
        const logoExists = currentStack.some(item => item.id === "brand-logo");
        
        if (!logoExists) {
          const logoItem = {
            id: "brand-logo",
            text: "Marca",
            icon: "Image", // Fallback icon, but we'll render the actual logo
            color: "#6366F1", // Default indigo color
          };
          // Add logo at the very beginning of the stack
          wizardStore.setAgentResponse("selectionStack", [logoItem, ...currentStack]);
        }
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
        const products: ProductServiceOption[] = data.concreteProducts.map((p: any) => {
          // Handle both old format (string) and new format (object)
          if (typeof p === 'string') {
            return {
              value: p,
              label: p,
              source: formattedUrl,
            };
          }
          return {
            value: p.name || p,
            label: p.name || p,
            source: formattedUrl,
            icon: p.icon,
            color: p.color,
          };
        });
        setDiscoveredProducts((prev) => {
          const combined = [...prev, ...products];
          const unique = combined.filter((item, index, self) => 
            index === self.findIndex((t) => t.value === item.value)
          );
          return unique;
        });
      }

      if (data.concreteServices && Array.isArray(data.concreteServices)) {
        const services: ProductServiceOption[] = data.concreteServices.map((s: any) => {
          // Handle both old format (string) and new format (object)
          if (typeof s === 'string') {
            return {
              value: s,
              label: s,
              source: formattedUrl,
            };
          }
          return {
            value: s.name || s,
            label: s.name || s,
            source: formattedUrl,
            icon: s.icon,
            color: s.color,
          };
        });
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

  const handleNext = async () => {
    if (!name || !identity || !productName) return;
    
    // All data is already synced to store via useEffect hooks
    // StepStrategy will handle MCQ generation when it mounts
    onNext();
  };

  const shouldShowProductSection = urlAnalyses.size > 0 && analyzingUrls.size === 0;

  return (
    <div className="space-y-8">
      <div className="space-y-5">
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
                        className={`glass-input h-12 text-base rounded-2xl px-4 transition-all duration-500 ${
                          isAnalyzing ? 'ring-2 ring-blue-400/30 shadow-lg shadow-blue-500/10 pr-32' : 'pr-12'
                        }`}
                        value={url}
                        onChange={(e) => updateUrl(index, e.target.value)}
                        disabled={!!isAnalyzing}
                        autoFocus
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                          {isAnalyzing && (
                            <motion.div
                              key="analyzing"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                            >
                              <RotatingLoader
                                items={[
                                  { text: "Analizando...", icon: Sparkles },
                                  { text: "Extrayendo insights...", icon: Search },
                                  { text: "Detectando colores...", icon: Palette },
                                  { text: "Buscando productos...", icon: Package },
                                ]}
                                spinnerSize="sm"
                                textSize="sm"
                                interval={2000}
                                showSpinner={false}
                                className="text-slate-800"
                              />
                            </motion.div>
                          )}
                          {!isAnalyzing && analysis && analysis.insights.length > 0 && (
                            <motion.div
                              key="complete"
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0 }}
                              className="flex items-center justify-center"
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
        </div>

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

        <AnimatePresence>
          {shouldShowProductSection && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: 20 }}
              className="space-y-5 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/50 shadow-inner">
                <button
                  onClick={() => setType("producto")}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden flex items-center justify-center gap-2 ${
                    type === "producto"
                      ? "text-slate-900 glass-input shadow-md"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Package className={`w-4 h-4 ${type === "producto" ? "text-slate-900" : "text-slate-400"}`} />
                  <span>
                    Productos
                    {discoveredProducts.length > 0 && (
                      <span className="font-bold"> ({discoveredProducts.length})</span>
                    )}
                  </span>
                </button>
                <button
                  onClick={() => setType("servicio")}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden flex items-center justify-center gap-2 ${
                    type === "servicio"
                      ? "text-slate-900 glass-input shadow-md"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Briefcase className={`w-4 h-4 ${type === "servicio" ? "text-slate-900" : "text-slate-400"}`} />
                  <span>
                    Servicios
                    {discoveredServices.length > 0 && (
                      <span className="font-bold"> ({discoveredServices.length})</span>
                    )}
                  </span>
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
                      {productName ? (() => {
                        const selected = discoveredProducts.find(p => p.value === productName);
                        if (selected) {
                          const ProductIcon = selected.icon ? getIconByName(selected.icon) : Package;
                          const productColor = selected.color || "#3B82F6";
                          return (
                            <div className="flex items-center gap-2.5">
                              <div 
                                className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                                style={{
                                  backgroundColor: `${productColor}15`,
                                  color: productColor,
                                }}
                              >
                                <ProductIcon className="w-3 h-3" />
                              </div>
                              <span>{selected.label}</span>
                            </div>
                          );
                        }
                        return <SelectValue placeholder="Selecciona un producto..." />;
                      })() : <SelectValue placeholder="Selecciona un producto..." />}
                    </SelectTrigger>
                    <SelectContent>
                      {discoveredProducts.map((product, i) => {
                        const ProductIcon = product.icon ? getIconByName(product.icon) : Package;
                        const productColor = product.color || "#3B82F6";
                        return (
                          <SelectItem key={i} value={product.value}>
                            <div className="flex items-center gap-2.5">
                              <div 
                                className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                                style={{
                                  backgroundColor: `${productColor}15`,
                                  color: productColor,
                                }}
                              >
                                <ProductIcon className="w-3.5 h-3.5" />
                              </div>
                              <span>{product.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
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
                      {productName ? (() => {
                        const selected = discoveredServices.find(s => s.value === productName);
                        if (selected) {
                          const ServiceIcon = selected.icon ? getIconByName(selected.icon) : Briefcase;
                          const serviceColor = selected.color || "#10B981";
                          return (
                            <div className="flex items-center gap-2.5">
                              <div 
                                className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                                style={{
                                  backgroundColor: `${serviceColor}15`,
                                  color: serviceColor,
                                }}
                              >
                                <ServiceIcon className="w-3 h-3" />
                              </div>
                              <span>{selected.label}</span>
                            </div>
                          );
                        }
                        return <SelectValue placeholder="Selecciona un servicio..." />;
                      })() : <SelectValue placeholder="Selecciona un servicio..." />}
                    </SelectTrigger>
                    <SelectContent>
                      {discoveredServices.map((service, i) => {
                        const ServiceIcon = service.icon ? getIconByName(service.icon) : Briefcase;
                        const serviceColor = service.color || "#10B981";
                        return (
                          <SelectItem key={i} value={service.value}>
                            <div className="flex items-center gap-2.5">
                              <div 
                                className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                                style={{
                                  backgroundColor: `${serviceColor}15`,
                                  color: serviceColor,
                                }}
                              >
                                <ServiceIcon className="w-3.5 h-3.5" />
                              </div>
                              <span>{service.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
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
            </motion.div>
          )}
        </AnimatePresence>
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
