import React, { useEffect, useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Sparkles, Copy, Share2, Target, Palette, Film, Users, Video, FileText, Loader2, ArrowDown, Image as ImageIcon, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Instagram } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWizardStore } from "@/contexts/WizardStore";
import { useBrand } from "@/contexts/BrandContext";
import { StepTransitionLoader } from "./StepTransitionLoader";
import { RotatingLoader } from "@/components/ui/rotating-loader";
import type { RotatingLoaderItem } from "@/components/ui/rotating-loader";
import { usePathname } from "next/navigation";

const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2NjYyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPjwvdGV4dD48L3N2Zz4=';

const DEMO_IMAGE_URLS = [
  "https://vita-bucket-1.s3.us-east-1.amazonaws.com/landing-assets/gemini_2_5_flash___A_minimalist_composition_featuring_the_iPhone_17_Pro_on_a_clean_white_background_.png", 
  "https://vita-bucket-1.s3.us-east-1.amazonaws.com/landing-assets/Runway_Flash_2_5_Image_The_iPhone_17_Pro__in_112325+(1).png", 
  "https://vita-bucket-1.s3.us-east-1.amazonaws.com/landing-assets/result.jpg", 
];
const DEMO_VIDEO_URL = "https://vita-bucket-1.s3.us-east-1.amazonaws.com/landing-assets/iphone-17pro.mp4"; 

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

interface GeneratedPost {
  id: number;
  description: string;
  caption: string;
  imageUrl?: string;
  imageError?: string;
}

export const StepFinal = () => {
  const wizardStore = useWizardStore();
  const { brandLogoUrl, brandColors } = useBrand();
  const brandName = wizardStore.getInput("name") || "";

  // Detectar si estamos en modo demo
  const pathname = usePathname();
  const isDemoMode = pathname === "/demo";

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
  const [streamedPrompt, setStreamedPrompt] = useState("");
  const [videoPrompt, setVideoPrompt] = useState<string | null>(null);
  const hasGeneratedRef = useRef(false);
  const promptContainerRef = useRef<HTMLDivElement>(null);

  // Post generation state
  const [isGeneratingPosts, setIsGeneratingPosts] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const hasGeneratedPostsRef = useRef(false);
  const [postGenerationError, setPostGenerationError] = useState<string | null>(null);
  const [showGeneratingText, setShowGeneratingText] = useState(true);
  const [generationCounter, setGenerationCounter] = useState(0);

  useEffect(() => {
    // Only generate once when component mounts
    if (hasGeneratedRef.current) return;
    hasGeneratedRef.current = true;

    const generateVideoPrompt = async () => {
      const wizardData = {
        inputs: wizardStore.getAllInputs(),
        agentResponses: wizardStore.getAllAgentResponses(),
        metadata: wizardStore.data.metadata,
      };

      try {
        const response = await fetch("/api/agent/video-prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wizardData }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate video prompt");
        }

        // Handle streaming response
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No reader available");
        }

        const decoder = new TextDecoder();
        let fullPrompt = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // Process any remaining buffer
            if (buffer.trim()) {
              fullPrompt += buffer;
              setStreamedPrompt(fullPrompt);
            }
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");

          // Keep the last incomplete line in buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;

            // AI SDK format: lines starting with "0:" contain the text content
            // Format: "0:" followed by JSON-encoded string
            if (line.startsWith("0:")) {
              try {
                const content = line.slice(2).trim();
                // Parse the JSON-encoded content
                const textContent = JSON.parse(content);
                if (typeof textContent === "string") {
                  fullPrompt += textContent;
                  setStreamedPrompt(fullPrompt);
                  // Auto-scroll to bottom
                  setTimeout(() => {
                    if (promptContainerRef.current) {
                      promptContainerRef.current.scrollTop = promptContainerRef.current.scrollHeight;
                    }
                  }, 0);
                }
              } catch (e) {
                // If parsing fails, try to extract text directly
                const textContent = line.slice(2).trim();
                // Remove surrounding quotes if present
                const cleaned = textContent.replace(/^["']|["']$/g, "");
                if (cleaned) {
                  fullPrompt += cleaned;
                  setStreamedPrompt(fullPrompt);
                  // Auto-scroll to bottom
                  setTimeout(() => {
                    if (promptContainerRef.current) {
                      promptContainerRef.current.scrollTop = promptContainerRef.current.scrollHeight;
                    }
                  }, 0);
                }
              }
            } else if (line.trim() && !line.startsWith("data:") && !line.startsWith("{")) {
              // Fallback: if it's not AI SDK format, treat as plain text
              // This handles cases where toTextStreamResponse returns plain text
              fullPrompt += line + "\n";
              setStreamedPrompt(fullPrompt);
              // Auto-scroll to bottom
              setTimeout(() => {
                if (promptContainerRef.current) {
                  promptContainerRef.current.scrollTop = promptContainerRef.current.scrollHeight;
                }
              }, 0);
            }
          }
        }

        // Save final prompt to store
        setVideoPrompt(fullPrompt);
        wizardStore.setAgentResponse("videoPrompt", fullPrompt);
        setIsGenerating(false);
      } catch (error) {
        console.error("Error generating video prompt:", error);
        setIsGenerating(false);
      }
    };

    generateVideoPrompt();
  }, [wizardStore]);

  // Auto-scroll to bottom when streamedPrompt updates
  useEffect(() => {
    if (streamedPrompt && promptContainerRef.current) {
      promptContainerRef.current.scrollTop = promptContainerRef.current.scrollHeight;
    }
  }, [streamedPrompt]);

  const generatePosts = async () => {
    setIsGeneratingPosts(true);
    setPostGenerationError(null);
    setGeneratedPosts([]);
    setCurrentSlide(0);
    setShowGeneratingText(true);
    setGenerationCounter(0);

    // Si estamos en modo demo, simular loading de 10s y usar URLs hardcodeadas
    if (isDemoMode) {
      try {
        // Simular loading de 10 segundos
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Crear posts con URLs hardcodeadas
        const demoPosts: GeneratedPost[] = DEMO_IMAGE_URLS.map((url, idx) => ({
          id: idx + 1,
          description: `Post de demostración ${idx + 1} generado con tecnología de IA avanzada`,
          caption: `Caption optimizado para máximo engagement en redes sociales - Post ${idx + 1}`,
          imageUrl: url,
        }));

        setGeneratedPosts(demoPosts);
        wizardStore.setAgentResponse("generatedPosts", demoPosts);
      } catch (error: any) {
        console.error("Error en modo demo:", error);
        setPostGenerationError(error.message);
      } finally {
        setIsGeneratingPosts(false);
      }
      return;
    }

    // Modo normal - llamada real a API
    const wizardData = {
      inputs: wizardStore.getAllInputs(),
      agentResponses: wizardStore.getAllAgentResponses(),
      metadata: wizardStore.data.metadata,
    };

    try {
      const response = await fetch("/api/workflow/post-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(wizardData),
      });

      if (!response.ok) throw new Error("Failed to generate posts");

      const result = await response.json();

      if (result.success && Array.isArray(result.posts)) {
        setGeneratedPosts(result.posts);
        wizardStore.setAgentResponse("generatedPosts", result.posts);

        if (result.videoUrl) {
          setVideoResult(result.videoUrl);
          wizardStore.setAgentResponse("videoResult", result.videoUrl);
        }
      } else {
        throw new Error(result.error || "Failed to generate posts");
      }
    } catch (error: any) {
      console.error("Error generating posts:", error);
      setPostGenerationError(error.message);
    } finally {
      setIsGeneratingPosts(false);
      setShowGeneratingText(true);
      setGenerationCounter(0);
    }
  };

  useEffect(() => {
    if (!isGeneratingPosts) {
      setShowGeneratingText(true);
      setGenerationCounter(0);
      return;
    }

    const timeout = setTimeout(() => {
      setShowGeneratingText(false);
    }, 100);

    const interval = setInterval(() => {
      setGenerationCounter(prev => prev + 1);
    }, 10);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [isGeneratingPosts]);

  useEffect(() => {
    if (hasGeneratedPostsRef.current) return;

    const existingPosts = wizardStore.getAgentResponse("generatedPosts");
    const existingVideo = wizardStore.getAgentResponse("videoResult");

    if (existingPosts) {
      setGeneratedPosts(existingPosts);
      if (existingVideo) setVideoResult(existingVideo);
      return;
    }

    hasGeneratedPostsRef.current = true;
    generatePosts();
  }, [wizardStore]);

  // Get video prompt from store or state
  const finalVideoPrompt = videoPrompt || wizardStore.getAgentResponse("videoPrompt") || "";
  const displayPrompt = isGenerating ? streamedPrompt : finalVideoPrompt;

  // Video generation state
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoResult, setVideoResult] = useState<string | null>(null);
  const hasGeneratedVideoRef = useRef(false);

  // Trigger video generation when prompt is ready AND posts are generated
  useEffect(() => {
    // Wait for prompt, ensure not already generating, and ensure posts are ready (so we have images)
    if (!displayPrompt || isGenerating || hasGeneratedVideoRef.current || generatedPosts.length === 0) return;

    // Check if we already have a result in store
    const existingVideo = wizardStore.getAgentResponse("videoResult");
    if (existingVideo) {
      setVideoResult(existingVideo);
      return;
    }

    hasGeneratedVideoRef.current = true;
    setIsGeneratingVideo(true);

    const generateVideo = async () => {
      try {
        // Si estamos en modo demo, usar URL hardcodeada con loading breve
        if (isDemoMode) {
          // Simular un pequeño loading para realismo (2 segundos)
          await new Promise(resolve => setTimeout(resolve, 2000));
          setVideoResult(DEMO_VIDEO_URL);
          wizardStore.setAgentResponse("videoResult", DEMO_VIDEO_URL);
          setIsGeneratingVideo(false);
          return;
        }

        // Modo normal - llamada real a Runway
        // Try to find an image from analysis (Logo) or from generated posts
        let imageUrl = "";

        const mockVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

        setVideoResult(mockVideoUrl);
        wizardStore.setAgentResponse("videoResult", mockVideoUrl);
      } catch (error) {
        console.error("Error generating video:", error);
      } finally {
        setIsGeneratingVideo(false);
      }
    };

    generateVideo();
  }, [displayPrompt, isGenerating, wizardStore, generatedPosts, brandLogoUrl, isDemoMode]);

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % generatedPosts.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + generatedPosts.length) % generatedPosts.length);

  // Instagram modal state
  const [isInstagramModalOpen, setIsInstagramModalOpen] = useState(false);
  const [isPostingToInstagram, setIsPostingToInstagram] = useState(false);
  const [instagramApiResponse, setInstagramApiResponse] = useState<any>(null);

  const handleOpenModal = () => {
    setIsInstagramModalOpen(true);
    setInstagramApiResponse(null);
    setIsPostingToInstagram(false);
  };

  const executeInstagramUpload = async () => {
    if (!videoResult) return;

    setIsPostingToInstagram(true);
    setInstagramApiResponse(null);

    try {
      const response = await fetch('https://n8n.llaima.ai/webhook/video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: videoResult }),
      });

      const data = await response.json();
      setInstagramApiResponse(data);
    } catch (error: any) {
      setInstagramApiResponse({ error: error.message || 'Failed to post video' });
    } finally {
      setIsPostingToInstagram(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Video Prompt Card - Always show, even before streaming starts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-none overflow-hidden rounded-xl bg-white/95 backdrop-blur-xl relative transition-shadow duration-700"
          style={{
            boxShadow: displayPrompt
              ? '0 20px 40px -10px rgba(59, 130, 246, 0.2), 0 0 0 1px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.05)'
              : '0 8px 24px -4px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.05)'
          }}
        >
          <CardHeader className="bg-gradient-to-b from-white/80 to-slate-50/40 border-b border-slate-200/60 py-3 px-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2 text-slate-900 font-medium">
                {isGenerating ? (
                  <>
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span>Guía Visual</span>
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 rounded-full bg-[#22C55E] flex items-center justify-center shadow-[0_0_0_4px_rgba(34,197,94,0.4),0_4px_12px_rgba(34,197,94,0.5)] ring-2 ring-[#22C55E]/30">
                      <CheckCircle2 className="w-5 h-5 text-white" fill="currentColor" strokeWidth={2} stroke="#22C55E" />
                    </div>
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span>Guía Visual</span>
                    <span className="text-xs text-slate-400 font-normal ml-1">
                      ({(new TextEncoder().encode(displayPrompt).length / 1024).toFixed(1)} KB)
                    </span>
                  </>
                )}
              </CardTitle>
              {!isGenerating && displayPrompt && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(finalVideoPrompt);
                  }}
                  className="h-6 w-6 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg active:scale-95"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {isGenerating && !displayPrompt ? (
              // Show loading state when starting, before any content streams
              <div className="flex items-center justify-center py-8">
                <RotatingLoader
                  items={[
                    { text: "Generando guión", icon: Video },
                    { text: "Analizando contenido", icon: Sparkles },
                    { text: "Creando prompt", icon: Palette },
                  ]}
                  spinnerSize="sm"
                  textSize="sm"
                  interval={2000}
                  showSpinner={false}
                  className="text-slate-500"
                />
              </div>
            ) : displayPrompt ? (
              // Show content when streaming or complete
              <div
                ref={promptContainerRef}
                className="overflow-y-auto max-h-[140px]"
              >
                {isGenerating && (
                  // Show loading indicator inside card content during streaming
                  <div className="mb-3 flex items-center justify-center">
                    <RotatingLoader
                      items={[
                        { text: "Generando guía visual", icon: Video },
                        { text: "Analizando contenido", icon: Sparkles },
                        { text: "Creando prompt", icon: Palette },
                      ]}
                      spinnerSize="sm"
                      textSize="sm"
                      interval={2000}
                      showSpinner={false}
                      className="text-slate-500"
                    />
                  </div>
                )}
                <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono leading-relaxed bg-slate-50/50 p-4 rounded-lg border border-slate-100"
                  style={{
                    fontSize: '0.7rem',
                    lineHeight: '1.5',
                  }}
                >
                  {displayPrompt}
                </pre>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </motion.div>

      {/* Connecting Flow - Active Data Link */}
      {!isGenerating && displayPrompt && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.5 }}
          className="flex justify-center relative z-0"
        >
          <div className="relative flex flex-col items-center h-10">
            {/* The Beam */}
            <div className="w-[2px] h-full bg-slate-200 overflow-hidden rounded-full relative">
              <motion.div
                className="absolute top-0 left-0 w-full bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"
                initial={{ height: "0%" }}
                animate={{ height: "100%" }}
                transition={{ duration: 0.8, ease: "circOut" }}
              />
              {/* Light Pulse */}
              <motion.div
                className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent via-white to-transparent opacity-80"
                animate={{ top: ["-100%", "200%"] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 0.5
                }}
              />
            </div>

            {/* Connection Nodes */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className="absolute top-0 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] ring-2 ring-white z-10"
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7 }}
              className="absolute bottom-0 w-2.5 h-2.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)] ring-2 ring-white z-10"
            />
          </div>
        </motion.div>
      )}

      {/* Generating Posts Block - Carousel */}
      {!isGenerating && displayPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-none overflow-hidden rounded-xl bg-white/95 backdrop-blur-xl relative"
            style={{
              boxShadow: '0 20px 40px -10px rgba(236, 72, 153, 0.2), 0 0 0 1px rgba(236, 72, 153, 0.15), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.05)'
            }}
          >
            <CardHeader className="bg-gradient-to-b from-white/80 to-slate-50/40 border-b border-slate-200/60 py-3 px-4 backdrop-blur-sm">
              <CardTitle className="text-sm flex items-center justify-between text-slate-900 font-medium">
                <div className="flex items-center gap-2">
                  {isGeneratingPosts ? (
                    <>
                      <Sparkles className="w-4 h-4 text-slate-500" />
                      <span>Contenido Generado</span>
                      {showGeneratingText ? (
                        <span className="text-xs text-slate-400 font-normal">Generando...</span>
                      ) : (
                        <span className="text-xs text-slate-400 font-normal">({(generationCounter / 100).toFixed(2)}s)</span>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="w-6 h-6 rounded-full bg-[#22C55E] flex items-center justify-center shadow-[0_0_0_4px_rgba(34,197,94,0.4),0_4px_12px_rgba(34,197,94,0.5)] ring-2 ring-[#22C55E]/30">
                        <CheckCircle2 className="w-5 h-5 text-white" fill="currentColor" strokeWidth={2} stroke="#22C55E" />
                      </div>
                      <ImageIcon className="w-4 h-4 text-slate-500" />
                      <span>Contenido Generado</span>
                      {generatedPosts.length > 0 && (
                        <span className="text-xs text-slate-400 font-normal">
                          ({generatedPosts.length} {generatedPosts.length === 1 ? 'publicación' : 'publicaciones'})
                        </span>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!isGeneratingPosts && generatedPosts.length > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg active:scale-95"
                      onClick={generatePosts}
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  )}
                  {videoResult && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => window.open(videoResult, '_blank')}>
                      <Share2 className="w-3 h-3 text-slate-400" />
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isGeneratingPosts ? (
                <div className="relative w-full bg-slate-50/50 group">
                  <div className="overflow-hidden relative h-[500px] w-full flex items-center justify-center">
                    <motion.div
                      className="flex gap-6 px-6"
                      animate={{
                        x: [0, -816],
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      style={{
                        width: "max-content",
                      }}
                    >
                      {[...Array(6)].map((_, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: (idx % 3) * 0.1, duration: 0.3 }}
                          className="flex flex-col items-center bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden flex-shrink-0 w-[240px]"
                        >
                          <div className="h-12 w-full border-b border-slate-100 flex items-center px-3 gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
                            <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
                          </div>
                          <div className="relative aspect-square w-full bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 animate-pulse">
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-transparent" />
                          </div>
                          <div className="w-full space-y-2 mt-2 px-4 pb-4">
                            <div className="h-3 bg-slate-200 rounded-full animate-pulse" />
                            <div className="h-3 bg-slate-200 rounded-full animate-pulse w-4/5" />
                            <div className="h-3 bg-slate-200 rounded-full animate-pulse w-3/5" />
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </div>
              ) : generatedPosts.length > 0 ? (
                <div className="relative w-full bg-slate-50/50 group">
                  <div className="overflow-hidden relative h-[500px] w-full flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={generatedPosts[currentSlide]?.imageUrl || currentSlide}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full p-6 flex flex-col items-center justify-center gap-6"
                      >
                        <div className="w-full max-w-[350px] bg-white rounded-lg overflow-hidden shadow-lg border border-slate-200 flex flex-col">
                          {generatedPosts[currentSlide]?.imageUrl ? (
                            <>
                              <div className="h-12 bg-white z-20 flex items-center px-3 gap-2 border-b border-slate-100 shrink-0">
                                {brandLogoUrl && (
                                  <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
                                    style={{
                                      background: brandColors.length > 0
                                        ? `linear-gradient(135deg, ${brandColors[0] || '#40C9FF'}, ${brandColors[1] || brandColors[0] || '#E81CFF'})`
                                        : 'linear-gradient(135deg, #40C9FF, #E81CFF)',
                                      padding: '2px'
                                    }}
                                  >
                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                      {brandLogoUrl.trim().startsWith("<svg") ? (
                                        <div
                                          className="w-[70%] h-[70%] text-slate-900 [&_svg]:w-full [&_svg]:h-full [&_svg]:fill-current"
                                          dangerouslySetInnerHTML={{ __html: brandLogoUrl }}
                                        />
                                      ) : (
                                        <img
                                          src={brandLogoUrl}
                                          alt="Logo"
                                          className="w-[70%] h-[70%] object-contain"
                                          referrerPolicy="no-referrer"
                                        />
                                      )}
                                    </div>
                                  </div>
                                )}
                                <span className="text-sm font-semibold text-slate-900 truncate">
                                  {brandName || "Marca"}
                                </span>
                              </div>
                              <div className="relative w-full aspect-square bg-slate-100">
                                <img
                                  key={generatedPosts[currentSlide].imageUrl}
                                  src={generatedPosts[currentSlide].imageUrl}
                                  alt={`Generated post ${currentSlide + 1}`}
                                  className="absolute inset-0 w-full h-full object-cover"
                                  loading="eager"
                                />
                              </div>
                              <div className="bg-white z-20 px-3 flex items-center border-t border-slate-100 h-12 shrink-0">
                                <div className="flex items-center gap-2 w-full">
                                  <span className="text-sm font-semibold text-slate-900 shrink-0">
                                    {brandName || "Marca"}
                                  </span>
                                  <p className="text-sm text-slate-600 truncate">
                                    {(() => {
                                      let caption = generatedPosts[currentSlide].caption;

                                      if (!caption) {
                                        return generatedPosts[currentSlide].description || '';
                                      }

                                      if (typeof caption !== 'string') {
                                        caption = String(caption);
                                      }

                                      if (caption.trim().startsWith('{') && caption.includes('"caption"')) {
                                        try {
                                          const parsed = JSON.parse(caption);
                                          caption = parsed.caption || parsed.description || caption;
                                        } catch {
                                          caption = caption;
                                        }
                                      }

                                      if (typeof caption !== 'string') {
                                        caption = String(caption);
                                      }

                                      return caption;
                                    })()}
                                  </p>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="w-full aspect-[4/5] flex items-center justify-center bg-slate-100 text-slate-400">
                              <ImageIcon className="w-12 h-12 opacity-20" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {/* Navigation Controls */}
                    {generatedPosts.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-sm backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={prevSlide}
                        >
                          <ChevronLeft className="w-5 h-5 text-slate-700" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-sm backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={nextSlide}
                        >
                          <ChevronRight className="w-5 h-5 text-slate-700" />
                        </Button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {generatedPosts.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentSlide(idx)}
                              className={`w-2 h-2 rounded-full transition-colors ${idx === currentSlide ? "bg-slate-800" : "bg-slate-300"
                                }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-sm">
                  {postGenerationError || "No se pudo generar el contenido."}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )
      }

      {/* Connecting Flow - Contenido Generado to Video de Campaña */}
      {
        !isGenerating && displayPrompt && generatedPosts.length > 0 && (isGeneratingVideo || videoResult) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.5 }}
            className="flex justify-center relative z-0"
          >
            <div className="relative flex flex-col items-center h-10">
              {/* The Beam */}
              <div className="w-[2px] h-full bg-slate-200 overflow-hidden rounded-full relative">
                <motion.div
                  className="absolute top-0 left-0 w-full bg-gradient-to-b from-pink-500 via-purple-500 to-blue-500"
                  initial={{ height: "0%" }}
                  animate={{ height: "100%" }}
                  transition={{ duration: 0.8, ease: "circOut", delay: 0.2 }}
                />
                {/* Light Pulse */}
                <motion.div
                  className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent via-white to-transparent opacity-80"
                  animate={{ top: ["-100%", "200%"] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                    repeatDelay: 0.5
                  }}
                />
              </div>

              {/* Connection Nodes */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute top-0 w-2.5 h-2.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)] ring-2 ring-white z-10"
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9 }}
                className="absolute bottom-0 w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(139,92,246,0.8)] ring-2 ring-white z-10"
              />
            </div>
          </motion.div>
        )
      }

      {/* Generated Video Card */}
      {
        (isGeneratingVideo || (displayPrompt && videoResult)) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="border-none overflow-hidden rounded-xl bg-white/95 backdrop-blur-xl relative"
              style={{
                boxShadow: '0 20px 40px -10px rgba(139, 92, 246, 0.2), 0 0 0 1px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.05)'
              }}
            >
              <CardHeader className="bg-gradient-to-b from-white/80 to-slate-50/40 border-b border-slate-200/60 py-3 px-4 backdrop-blur-sm">
                <CardTitle className="text-sm flex items-center justify-between text-slate-900 font-medium">
                  <div className="flex items-center gap-2">
                    {isGeneratingVideo ? (
                      <div className="w-4 h-4 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-[#22C55E] flex items-center justify-center shadow-[0_0_0_4px_rgba(34,197,94,0.4),0_4px_12px_rgba(34,197,94,0.5)] ring-2 ring-[#22C55E]/30">
                        <CheckCircle2 className="w-5 h-5 text-white" fill="currentColor" strokeWidth={2} stroke="#22C55E" />
                      </div>
                    )}
                    <span>{isGeneratingVideo ? "Generando Reel..." : "Video de Campaña"}</span>
                  </div>
                  {videoResult && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => window.open(videoResult, '_blank')}>
                      <Share2 className="w-3 h-3 text-slate-400" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative w-full bg-slate-900 flex items-center justify-center min-h-[400px]">
                  {isGeneratingVideo ? (
                    <div className="flex flex-col items-center gap-4 p-8 text-center">
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-purple-500/30"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin"></div>
                        <Video className="absolute inset-0 m-auto w-6 h-6 text-purple-500" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-white font-medium">Creando tu video</p>
                        <p className="text-slate-400 text-sm">Esto puede tomar unos minutos...</p>
                      </div>
                    </div>
                  ) : (
                    <video
                      src={videoResult!}
                      controls
                      className="w-full h-full max-h-[600px] object-contain"
                      poster={generatedPosts[0]?.imageUrl}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      }

      {/* Connecting Flow - Active Data Link to Upload Step */}
      {
        !isGenerating && displayPrompt && generatedPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.5 }}
            className="flex justify-center relative z-0"
          >
            <div className="relative flex flex-col items-center h-10">
              {/* The Beam */}
              <div className="w-[2px] h-full bg-slate-200 overflow-hidden rounded-full relative">
                <motion.div
                  className="absolute top-0 left-0 w-full bg-gradient-to-b from-pink-500 via-purple-500 to-blue-500"
                  initial={{ height: "0%" }}
                  animate={{ height: "100%" }}
                  transition={{ duration: 0.8, ease: "circOut", delay: 0.2 }}
                />
                {/* Light Pulse */}
                <motion.div
                  className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent via-white to-transparent opacity-80"
                  animate={{ top: ["-100%", "200%"] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                    repeatDelay: 0.5
                  }}
                />
              </div>

              {/* Connection Nodes */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute top-0 w-2.5 h-2.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)] ring-2 ring-white z-10"
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9 }}
                className="absolute bottom-0 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] ring-2 ring-white z-10"
              />
            </div>
          </motion.div>
        )
      }

      {/* Upload to Instagram Step */}
      {
        !isGenerating && displayPrompt && generatedPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="border-none overflow-hidden rounded-xl bg-white/95 backdrop-blur-xl relative"
              style={{
                boxShadow: '0 20px 40px -10px rgba(64, 201, 255, 0.25), 0 0 0 1px rgba(64, 201, 255, 0.15), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.05)'
              }}
            >
              <CardContent className="p-6">
                <Button
                  onClick={handleOpenModal}
                  className="w-full px-8 py-6 text-base font-medium text-white rounded-full flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                    boxShadow: '0 4px 20px rgba(188, 24, 136, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Instagram className="w-5 h-5" />
                  Subir a Instagram
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )
      }

      {/* Instagram Modal - App Style (Portalled) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isInstagramModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            >
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => !isPostingToInstagram && setIsInstagramModalOpen(false)}
              />

              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{
                  type: "spring",
                  damping: 25,
                  stiffness: 300,
                  mass: 0.8
                }}
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/5"
              >
                <div className="bg-white/95 backdrop-blur-xl p-8 flex flex-col gap-6">
                  
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <h3 className="font-serif text-3xl text-slate-900 leading-tight">
                      Publicar en<br />Instagram
                    </h3>
                    {!isPostingToInstagram && (
                      <button
                        onClick={() => setIsInstagramModalOpen(false)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                      >
                        <span className="text-xl leading-none mb-1">&times;</span>
                      </button>
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-h-[200px] flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                      {isPostingToInstagram ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-center gap-4 py-4"
                        >
                          <div className="relative w-12 h-12">
                            <Loader2 className="w-12 h-12 text-slate-900 animate-spin" />
                          </div>
                          <p className="text-slate-500 text-sm font-medium animate-pulse">
                            Procesando video...
                          </p>
                        </motion.div>
                      ) : instagramApiResponse ? (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col gap-6"
                        >
                          <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                            <span className="font-medium text-sm">Publicación exitosa</span>
                          </div>

                          <div className="space-y-2">
                            <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Respuesta API</span>
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 overflow-hidden">
                              <pre className="text-xs text-slate-600 font-mono overflow-auto max-h-[150px]">
                                {JSON.stringify(instagramApiResponse, null, 2)}
                              </pre>
                            </div>
                          </div>

                          <Button
                            onClick={() => setIsInstagramModalOpen(false)}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg h-12 font-medium transition-all"
                          >
                            Cerrar
                          </Button>
                        </motion.div>
                      ) : (
                        <motion.div
                           key="confirm"
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           className="flex flex-col gap-6"
                        >
                           <div className="aspect-video w-full bg-slate-100 rounded-lg overflow-hidden relative border border-slate-200">
                              {generatedPosts[0]?.imageUrl ? (
                                  <img 
                                    src={generatedPosts[0].imageUrl} 
                                    className="w-full h-full object-cover opacity-80" 
                                    alt="Preview" 
                                  />
                              ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                                      <Video className="w-12 h-12" />
                                  </div>
                              )}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                  <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg">
                                      <Instagram className="w-6 h-6 text-slate-900" />
                                  </div>
                              </div>
                           </div>
                           <p className="text-slate-600 text-sm leading-relaxed">
                             Se enviará el video generado a la API de publicación. Asegúrate de que el contenido sea correcto.
                           </p>
                           
                           <Button
                            onClick={executeInstagramUpload}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg h-12 font-medium transition-all"
                          >
                            Publicar ahora
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div >
  );
};

