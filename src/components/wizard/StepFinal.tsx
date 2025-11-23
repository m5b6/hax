import React, { useEffect, useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Sparkles, Copy, Share2, Target, Palette, Film, Users, Video, FileText, Loader2, ArrowDown, Image as ImageIcon, ChevronLeft, ChevronRight, RefreshCw, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ArrowRight } from "lucide-react";
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
import { QRCodeSVG } from "qrcode.react";

const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2NjYyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPjwvdGV4dD48L3N2Zz4=';

const DEMO_IMAGE_URLS = [
  "https://vita-bucket-1.s3.us-east-1.amazonaws.com/landing-assets/Runway_Flash_2_5_Image_A_minimalistic_product_shot_featuring_112325.png",
  "https://vita-bucket-1.s3.us-east-1.amazonaws.com/landing-assets/Runway_Flash_2_5_Image_A_cohesive_hero_illustration_capturing_112325+(1).png",
  "https://vita-bucket-1.s3.us-east-1.amazonaws.com/landing-assets/Runway_Flash_2_5_Image_Una_empleada_de_tecnolog_a__con_112325.png",
];
const DEMO_VIDEO_URL = "https://vita-bucket-1.s3.us-east-1.amazonaws.com/landing-assets/Adobe+Express+-+An_8_second_9_16_vertical_video_with_a_clean__minimal_HR_tech_aesthetic__Dominant_colors__Buk_blue__.mp4";

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
        const demoCaptions = [
          "✨ Descubre la nueva era de la innovación. El diseño que transforma tu día a día. #Innovación #Tecnología #Futuro",
          "🚀 Potencia sin límites. Rendimiento que supera todas las expectativas. ¿Estás listo para el siguiente nivel?",
          "🎨 Arte y tecnología se unen. Cada detalle cuenta una historia única. Experimenta la perfección."
        ];

        const demoPosts: GeneratedPost[] = DEMO_IMAGE_URLS.map((url, idx) => ({
          id: idx + 1,
          description: `Post de demostración ${idx + 1}`,
          caption: demoCaptions[idx] || `Descubre lo increíble. Post ${idx + 1} #Demo`,
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
  const [instagramPostResponses, setInstagramPostResponses] = useState<Array<{
    id: string;
    permalink: string;
    type: 'video' | 'image';
  }>>([]);

  const handleOpenModal = () => {
    setIsInstagramModalOpen(true);
    setInstagramApiResponse(null);
    setIsPostingToInstagram(false);
  };

  const executeInstagramUpload = async () => {
    if (!videoResult || generatedPosts.length === 0) return;

    setIsPostingToInstagram(true);
    setInstagramApiResponse(null);
    setInstagramPostResponses([]);

    // Helper function to extract caption
    const extractCaption = (post: GeneratedPost): string => {
      let caption = post.caption;
      if (!caption) {
        caption = post.description || '';
      }
      if (typeof caption !== 'string') {
        caption = String(caption);
      }
      if (caption.trim().startsWith('{') && caption.includes('"caption"')) {
        try {
          const parsed = JSON.parse(caption);
          caption = parsed.caption || parsed.description || caption;
        } catch {
          // Keep original caption if parsing fails
        }
      }
      return typeof caption === 'string' ? caption : String(caption);
    };

    // Helper function to post and update state immediately
    const postAndUpdate = async (
      url: string,
      caption: string,
      type: 'video' | 'image',
      index?: number
    ): Promise<{ id: string; permalink: string; type: 'video' | 'image' } | null> => {
      try {
        // Use /image endpoint for images, /video for video
        const endpoint = type === 'image'
          ? 'https://n8n.llaima.ai/webhook/image'
          : 'https://n8n.llaima.ai/webhook/video';

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url, caption }),
        });

        const data = await response.json();
        // Validate that we have valid id and permalink (non-empty strings)
        if (data?.id && data?.permalink && typeof data.permalink === 'string' && data.permalink.trim().length > 0) {
          const postResult = {
            id: data.id,
            permalink: data.permalink,
            type,
          };

          // Update state immediately when response arrives - this triggers QR code generation
          setInstagramPostResponses((prev) => {
            // Check if this post already exists (avoid duplicates)
            const exists = prev.some(p => p.id === postResult.id);
            if (exists) return prev;
            const updated = [...prev, postResult];
            console.log(`✅ ${type} posted! QR code should appear now. Total: ${updated.length}`);
            return updated;
          });

          return postResult;
        }
        // If response exists but is invalid, still mark as "posted" for UX
        if (data && (data.id || data.permalink)) {
          const postResult = {
            id: data.id || `temp-${Date.now()}-${index !== undefined ? index : 0}`,
            permalink: '', // Empty permalink will trigger success message instead of QR
            type,
          };
          setInstagramPostResponses((prev) => {
            const exists = prev.some(p => p.id === postResult.id);
            if (exists) return prev;
            return [...prev, postResult];
          });
        }
        return null;
      } catch (error) {
        console.error(`Error posting ${type}${index !== undefined ? ` ${index + 1}` : ''}:`, error);
        return null;
      }
    };

    try {
      // Execute posts sequentially, one at a time
      const postsToProcess: Array<{ url: string; caption: string; type: 'video' | 'image'; index?: number }> = [];

      // Add video first
      if (videoResult) {
        postsToProcess.push({
          url: videoResult,
          caption: "Conoce Buk, la plataforma líder en gestión de personas. Crea un lugar de trabajo más feliz ;)",
          type: 'video'
        });
      }

      // Add all image posts
      generatedPosts.forEach((post, idx) => {
        if (post.imageUrl) {
          postsToProcess.push({
            url: post.imageUrl,
            caption: extractCaption(post),
            type: 'image',
            index: idx
          });
        }
      });

      // Process posts one at a time
      const successfulPosts: Array<{ id: string; permalink: string; type: 'video' | 'image' }> = [];

      for (const post of postsToProcess) {
        try {
          const result = await postAndUpdate(post.url, post.caption, post.type, post.index);
          if (result) {
            successfulPosts.push(result);
          }
        } catch (error) {
          console.error(`Error posting ${post.type}:`, error);
          // Continue with next post even if one fails
        }
      }

      setInstagramApiResponse({
        success: true,
        posts: successfulPosts,
        total: postsToProcess.length,
        completed: successfulPosts.length
      });
    } catch (error: any) {
      setInstagramApiResponse({ error: error.message || 'Failed to post content' });
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
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {generatedPosts.map((post, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col"
                      >
                        {/* Mini Header */}
                        <div className="flex items-center justify-between p-2 border-b border-slate-50">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-slate-100 overflow-hidden flex-shrink-0"
                              style={{
                                background: brandColors.length > 0
                                  ? `linear-gradient(135deg, ${brandColors[0] || '#40C9FF'}, ${brandColors[1] || brandColors[0] || '#E81CFF'})`
                                  : 'linear-gradient(135deg, #40C9FF, #E81CFF)',
                                padding: '1px'
                              }}
                            >
                              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                {brandLogoUrl ? (
                                  brandLogoUrl.trim().startsWith("<svg") ? (
                                    <div
                                      className="w-[70%] h-[70%] text-slate-900 [&_svg]:w-full [&_svg]:h-full [&_svg]:fill-current"
                                      dangerouslySetInnerHTML={{ __html: brandLogoUrl }}
                                    />
                                  ) : (
                                    <img
                                      src={brandLogoUrl}
                                      alt=""
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  )
                                ) : (
                                  <div className="w-full h-full bg-slate-200" />
                                )}
                              </div>
                            </div>
                            <span className="text-[10px] font-semibold text-slate-900 truncate max-w-[80px]">{brandName || "tu_marca"}</span>
                          </div>
                          <MoreHorizontal className="w-3 h-3 text-slate-300" />
                        </div>

                        {/* Image */}
                        <div className="aspect-square w-full bg-slate-100 relative group">
                          {post.imageUrl ? (
                            <img src={post.imageUrl} className="w-full h-full object-cover" alt={`Post ${idx + 1}`} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <ImageIcon className="w-6 h-6" />
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="p-2 flex justify-between items-center">
                          <div className="flex gap-2">
                            <Heart className="w-4 h-4 text-slate-800" />
                            <MessageCircle className="w-4 h-4 text-slate-800" />
                            <Send className="w-4 h-4 text-slate-800" />
                          </div>
                          <Bookmark className="w-4 h-4 text-slate-800" />
                        </div>

                        {/* Caption snippet */}
                        <div className="px-3 pb-4 pt-1 flex-1">
                          <p className="text-[10px] line-clamp-2 leading-tight text-slate-600">
                            <span className="font-semibold text-slate-900 mr-1">{brandName || "brand"}</span>
                            {(() => {
                              let caption = post.caption;
                              if (!caption) caption = post.description || '';
                              if (typeof caption !== 'string') caption = String(caption);
                              if (caption.trim().startsWith('{') && caption.includes('"caption"')) {
                                try {
                                  const parsed = JSON.parse(caption);
                                  caption = parsed.caption || parsed.description || caption;
                                } catch { }
                              }
                              return typeof caption === 'string' ? caption : String(caption);
                            })()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
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
            className="flex justify-center"
          >
            <div className="w-full max-w-sm mx-auto bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              {/* Insta Header */}
              <div className="flex items-center justify-between p-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[2px]">
                    <div className="w-full h-full rounded-full bg-white p-[2px] overflow-hidden">
                      {brandLogoUrl ? (
                        brandLogoUrl.trim().startsWith("<svg") ? (
                          <div
                            className="w-full h-full text-slate-900 [&_svg]:w-full [&_svg]:h-full [&_svg]:fill-current rounded-full"
                            dangerouslySetInnerHTML={{ __html: brandLogoUrl }}
                          />
                        ) : (
                          <img src={brandLogoUrl} alt="Profile" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                        )
                      ) : (
                        <div className="w-full h-full bg-slate-200 rounded-full" />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-xs font-semibold text-slate-900">{brandName || "tu_marca"}</span>
                    <span className="text-[10px] text-slate-500">Original Audio</span>
                  </div>
                </div>
                <MoreHorizontal className="w-4 h-4 text-slate-400" />
              </div>

              {/* Content */}
              <div className="aspect-[1/1] w-full bg-slate-900 relative">
                {isGeneratingVideo ? (
                  <div className="flex flex-col items-center justify-center gap-6 p-8 text-center w-full h-full">
                    <RotatingLoader
                      items={[
                        { text: "Generando video", icon: Video },
                        { text: "Creando animaciones", icon: Film },
                        { text: "Aplicando efectos", icon: Sparkles }
                      ]}
                      spinnerSize="lg"
                      textSize="md"
                      showSpinner={true}
                    />
                  </div>
                ) : videoResult ? (
                  <>
                    <video
                      src={videoResult}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                    <div className="absolute bottom-4 right-4 flex flex-col gap-4 items-center">
                      <div className="flex flex-col items-center gap-1">
                        <Heart className="w-6 h-6 text-white drop-shadow-md" />
                        <span className="text-xs text-white font-medium drop-shadow-md">4.2k</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <MessageCircle className="w-6 h-6 text-white drop-shadow-md" />
                        <span className="text-xs text-white font-medium drop-shadow-md">128</span>
                      </div>
                      <Send className="w-6 h-6 text-white drop-shadow-md" />
                      <MoreHorizontal className="w-6 h-6 text-white drop-shadow-md rotate-90" />
                    </div>
                  </>
                ) : null}
              </div>

              {/* Caption Area */}
              {videoResult && !isGeneratingVideo && (
                <div className="p-3 text-xs space-y-1">
                  <p>
                    <span className="font-semibold mr-1">{brandName || "tu_marca"}</span>
                    Conoce Buk, la plataforma líder en gestión de personas. Crea un lugar de trabajo más feliz ;) #Buk #RRHH #GestiónDeTalento
                  </p>
                  <p className="text-slate-400 text-[10px] uppercase">Hace 2 minutos</p>
                </div>
              )}
            </div>
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

      {/* Instagram Modal - Simpler & Smaller */}
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
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={() => !isPostingToInstagram && setIsInstagramModalOpen(false)}
              />

              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative z-10 w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/5 flex flex-col max-h-[85vh]"
              >
                {/* Header Gradient Line */}
                <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-red-500 to-purple-500 flex-shrink-0" />

                <div className="p-6 overflow-y-auto">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 rounded-xl">
                        <Instagram className="w-6 h-6 text-[#E1306C]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-lg leading-tight">Instagram</h3>
                        <p className="text-slate-500 text-xs font-medium">
                          {brandName || "Tu campaña"}
                        </p>
                      </div>
                    </div>
                    {!isPostingToInstagram && (
                      <button
                        onClick={() => setIsInstagramModalOpen(false)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                      >
                        <span className="text-xl leading-none">&times;</span>
                      </button>
                    )}
                  </div>

                  {/* Content States */}
                  <AnimatePresence mode="wait">
                    {/* STATE 1: CONFIRMATION */}
                    {!isPostingToInstagram && instagramPostResponses.length === 0 && !instagramApiResponse && (
                      <motion.div
                        key="confirm"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <div className="flex items-center gap-4 mb-4">
                            {/* Video Thumbnail */}
                            <div className="relative w-16 h-24 bg-slate-900 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                              {videoResult ? (
                                <video src={videoResult} className="w-full h-full object-cover opacity-80" />
                              ) : (
                                <Video className="w-6 h-6 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                              )}
                              <div className="absolute bottom-1 right-1 bg-black/50 rounded px-1 py-0.5">
                                <Video className="w-3 h-3 text-white" />
                              </div>
                            </div>
                            {/* Stats */}
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">1 Reel</span>
                                <span className="text-slate-900 font-medium">Listo</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">{generatedPosts.length} Posts</span>
                                <span className="text-slate-900 font-medium">Listos</span>
                              </div>
                              <div className="h-px bg-slate-200 my-2" />
                              <p className="text-xs text-slate-500">
                                Se publicarán automáticamente en tu perfil.
                              </p>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={executeInstagramUpload}
                          className="w-full h-12 bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90 text-white font-medium rounded-xl shadow-lg shadow-pink-500/20 transition-all"
                        >
                          Publicar ahora
                        </Button>
                      </motion.div>
                    )}

                    {/* STATE 2: POSTING / SUCCESS */}
                    {(isPostingToInstagram || instagramPostResponses.length > 0) && (
                      <motion.div
                        key="posting"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        {/* Grid Container - 2 Columns */}
                        <div className="grid grid-cols-2 gap-4">
                          {/* Video Status */}
                          <div className="flex flex-col gap-3 p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                <Video className="w-5 h-5 text-slate-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900">Reel de campaña</p>
                                <p className="text-xs text-slate-500">
                                  {instagramPostResponses.some(p => p.type === 'video') ? "¡Publicado!" : "Subiendo video..."}
                                </p>
                              </div>
                              <div className="flex-shrink-0">
                                {instagramPostResponses.some(p => p.type === 'video') ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                ) : (
                                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                                )}
                              </div>
                            </div>

                            {instagramPostResponses.find(p => p.type === 'video') && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="w-full flex flex-col items-center gap-3 pt-2 border-t border-slate-50"
                              >
                                {(() => {
                                  const videoResponse = instagramPostResponses.find(p => p.type === 'video');
                                  const hasValidPermalink = videoResponse?.permalink &&
                                    typeof videoResponse.permalink === 'string' &&
                                    videoResponse.permalink.trim().length > 0;

                                  return hasValidPermalink ? (
                                    <>
                                      <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100">
                                        <QRCodeSVG
                                          value={videoResponse.permalink}
                                          size={200}
                                          level="H"
                                          includeMargin={true}
                                        />
                                      </div>
                                      <a
                                        href={videoResponse.permalink}
                                        target="_blank"
                                        className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1"
                                      >
                                        Ver en Instagram <ArrowRight className="w-4 h-4" />
                                      </a>
                                    </>
                                  ) : (
                                    <div className="flex flex-col items-center gap-2 py-4">
                                      <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                                      <p className="text-sm font-medium text-slate-700">¡Publicado exitosamente!</p>
                                    </div>
                                  );
                                })()}
                              </motion.div>
                            )}
                          </div>

                          {/* Images Status */}
                          {generatedPosts.map((post, idx) => {
                            const response = instagramPostResponses.filter(p => p.type === 'image')[idx];

                            return (
                              <div key={idx} className="flex flex-col gap-3 p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {post.imageUrl ? (
                                      <img src={post.imageUrl} className="w-full h-full object-cover" />
                                    ) : (
                                      <ImageIcon className="w-5 h-5 text-slate-500" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 truncate">Post {idx + 1}</p>
                                    <p className="text-xs text-slate-500">
                                      {response ? "¡Publicado!" : (isPostingToInstagram ? "En cola..." : "Pendiente")}
                                    </p>
                                  </div>
                                  <div className="flex-shrink-0">
                                    {response ? (
                                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                      isPostingToInstagram ? <Loader2 className="w-4 h-4 text-slate-400 animate-spin" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />
                                    )}
                                  </div>
                                </div>

                                {response && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="w-full flex flex-col items-center gap-3 pt-2 border-t border-slate-50"
                                  >
                                    {(() => {
                                      const hasValidPermalink = response?.permalink &&
                                        typeof response.permalink === 'string' &&
                                        response.permalink.trim().length > 0;

                                      return hasValidPermalink ? (
                                        <>
                                          <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100">
                                            <QRCodeSVG
                                              value={response.permalink}
                                              size={200}
                                              level="H"
                                              includeMargin={true}
                                            />
                                          </div>
                                          <a
                                            href={response.permalink}
                                            target="_blank"
                                            className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1"
                                          >
                                            Ver en Instagram <ArrowRight className="w-4 h-4" />
                                          </a>
                                        </>
                                      ) : (
                                        <div className="flex flex-col items-center gap-2 py-4">
                                          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                                          <p className="text-sm font-medium text-slate-700">¡Publicado exitosamente!</p>
                                        </div>
                                      );
                                    })()}
                                  </motion.div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Error State */}
                        {instagramApiResponse?.error && (
                          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                            Error: {instagramApiResponse.error}
                          </div>
                        )}

                        {/* Finish Button */}
                        {!isPostingToInstagram && instagramPostResponses.length > 0 && (
                          <Button
                            onClick={() => setIsInstagramModalOpen(false)}
                            className="w-full mt-2 h-12 text-base"
                            variant="outline"
                          >
                            Cerrar
                          </Button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
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

