import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Sparkles, Copy, Share2, Target, Palette, Film, Users } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import CircularGallery from "./CircularGallery";
import { useWizardStore } from "@/contexts/WizardStore";
import { StepTransitionLoader } from "./StepTransitionLoader";
import type { RotatingLoaderItem } from "@/components/ui/rotating-loader";

// Helper to get icon component by name from lucide-react
const getIconByName = (iconName: string): LucideIcon => {
  if (!iconName || typeof iconName !== 'string') {
    return Sparkles;
  }

  const exactMatch = LucideIcons[iconName as keyof typeof LucideIcons];
  if (exactMatch && typeof exactMatch === 'function') {
    return exactMatch as LucideIcon;
  }

  const normalizedName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
  const caseMatch = LucideIcons[normalizedName as keyof typeof LucideIcons];
  if (caseMatch && typeof caseMatch === 'function') {
    return caseMatch as LucideIcon;
  }

  return Sparkles;
};

export const StepFinal = () => {
  const wizardStore = useWizardStore();

  // Get all data from store
  const data = {
    name: wizardStore.getInput("name"),
    identity: wizardStore.getInput("identity"),
    urls: wizardStore.getInput("urls"),
    type: wizardStore.getInput("type"),
    productName: wizardStore.getInput("productName"),
    strategy: wizardStore.getAgentResponse("strategyAnswers"),
    urlAnalyses: wizardStore.getAgentResponse("urlAnalyses"),
  };

  // Get MCQ data for contextual loading
  const mcqAnswers = wizardStore.getAgentResponse("mcqAnswers") || {};
  const mcqQuestions = wizardStore.getAgentResponse("mcqQuestions") || [];

  // Extract selected options with their colors and icons
  const selectedOptions = useMemo(() => {
    const options: Array<{ text: string; color: string; icon: LucideIcon }> = [];

    mcqQuestions.forEach((question: any) => {
      const selectedId = mcqAnswers[question.id];
      if (selectedId && question.options) {
        const option = question.options.find((opt: any) => opt.id === selectedId);
        if (option) {
          options.push({
            text: option.text || option.id,
            color: option.color || "#3B82F6",
            icon: option.icon ? getIconByName(option.icon) : Sparkles,
          });
        }
      }
    });

    return options;
  }, [mcqAnswers, mcqQuestions]);

  // Create loading items based on selected options
  const loadingItems = useMemo((): RotatingLoaderItem[] => {
    const defaultItems: RotatingLoaderItem[] = [
      { text: "Redactando anuncios", icon: Sparkles },
      { text: "Seleccionando públicos", icon: Target },
      { text: "Optimizando creatividades", icon: Palette },
    ];

    // If we have selected options, use their colors/icons for contextual messages
    if (selectedOptions.length > 0) {
      return [
        { text: `Aplicando estilo ${selectedOptions[0]?.text || ""}`, icon: selectedOptions[0]?.icon || Sparkles },
        { text: `Definiendo ritmo visual`, icon: selectedOptions[1]?.icon || Film },
        { text: `Ajustando presencia humana`, icon: selectedOptions[2]?.icon || Users },
        { text: "Generando copy final", icon: Sparkles },
      ];
    }

    return defaultItems;
  }, [selectedOptions]);

  // Get colors for gradient (use selected option colors or defaults)
  const gradientColors = useMemo(() => {
    if (selectedOptions.length >= 2) {
      return [
        selectedOptions[0]?.color || "#3B82F6",
        selectedOptions[1]?.color || "#8B5CF6",
        selectedOptions[2]?.color || selectedOptions[0]?.color || "#FF0080",
      ];
    }
    return ["#3B82F6", "#8B5CF6", "#FF0080"];
  }, [selectedOptions]);

  const [isGenerating, setIsGenerating] = useState(true);
  const [generatedPosts, setGeneratedPosts] = useState<Array<{
    id: number;
    description: string;
    imageUrl?: string;
    imageError?: string;
  }> | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const hasGenerated = React.useRef(false);

  useEffect(() => {
    const generateImages = async () => {
      if (hasGenerated.current) return;
      hasGenerated.current = true;

      try {
        // Get all wizard data
        const wizardData = {
          inputs: wizardStore.getAllInputs(),
          agentResponses: wizardStore.getAllAgentResponses(),
          metadata: wizardStore.data.metadata,
        };

        console.log("🎨 Calling post-generation endpoint...", wizardData);

        const response = await fetch('/api/workflow/post-generation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(wizardData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.posts) {
          console.log("✅ Posts generated successfully:", result.posts);
          setGeneratedPosts(result.posts);
        } else {
          throw new Error(result.error || "Failed to generate posts");
        }
      } catch (error) {
        console.error("Error generating posts:", error);
        setGenerationError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setIsGenerating(false);
      }
    };

    generateImages();
  }, [wizardStore]);

  if (isGenerating) {
    return (
      <StepTransitionLoader
        items={[
          { text: "Generando conceptos creativos", icon: Sparkles },
          { text: "Creando imágenes con IA", icon: Palette },
          { text: "Optimizando para historias", icon: Film },
        ]}
        title="Generando tus historias..."
        gradientColors={gradientColors}
      />
    );
  }

  // Show error state if generation failed
  if (generationError) {
    return (
      <div className="text-center space-y-6">
        <div className="text-red-500 text-xl">❌ Error al generar las imágenes</div>
        <p className="text-slate-600">{generationError}</p>
        <Button onClick={() => window.location.reload()}>
          Intentar de nuevo
        </Button>
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
                <span className="text-2xl">🎨</span> Imágenes Generadas
              </CardTitle>
            </CardHeader>
            <div className="w-full h-[600px] bg-white relative overflow-hidden">
              {generatedPosts && generatedPosts.length > 0 && generatedPosts.some(p => p.imageUrl) ? (
                <CircularGallery
                  items={generatedPosts
                    .filter(post => post.imageUrl)
                    .map(post => ({
                      image: post.imageUrl!,
                      text: `Historia ${post.id}`
                    }))}
                  bend={3}
                  textColor="#1e293b"
                  borderRadius={0.05}
                  scrollEase={0.02}
                  scrollSpeed={2}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  {generationError ? "Error al generar imágenes" : "Cargando imágenes..."}
                </div>
              )}
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
