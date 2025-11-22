import React, { useEffect, useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Sparkles, Copy, Share2, Target, Palette, Film, Users, Video, FileText, Loader2, ArrowDown, Image as ImageIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CircularGallery from "./CircularGallery";
import { useWizardStore } from "@/contexts/WizardStore";
import { StepTransitionLoader } from "./StepTransitionLoader";
import { RotatingLoader } from "@/components/ui/rotating-loader";
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
  const [streamedPrompt, setStreamedPrompt] = useState("");
  const [videoPrompt, setVideoPrompt] = useState<string | null>(null);
  const hasGeneratedRef = useRef(false);
  const promptContainerRef = useRef<HTMLDivElement>(null);

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

  // Get video prompt from store or state
  const finalVideoPrompt = videoPrompt || wizardStore.getAgentResponse("videoPrompt") || "";
  const displayPrompt = isGenerating ? streamedPrompt : finalVideoPrompt;

  return (
    <div className="space-y-0">
      {/* Video Prompt Card - Always show, even before streaming starts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-none overflow-hidden rounded-xl bg-white relative transition-shadow duration-700"
          style={{
            boxShadow: displayPrompt 
              ? '0 10px 30px -5px rgba(59, 130, 246, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.1)' 
              : '0 1px 2px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.8)'
          }}
        >
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2 text-slate-900 font-medium">
                {isGenerating ? (
                  <>
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span>Guía Visual</span>
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 rounded-full bg-[#30D158] flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-white" fill="currentColor" strokeWidth={0} />
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
          className="flex justify-center -my-1 relative z-0"
        >
          <div className="relative flex flex-col items-center h-16">
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

      {/* Generating Posts Block - Show when first card is complete */}
      {!isGenerating && displayPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-none overflow-hidden rounded-xl bg-white relative"
            style={{
              boxShadow: '0 -10px 30px -5px rgba(236, 72, 153, 0.15), 0 0 0 1px rgba(236, 72, 153, 0.1)'
            }}
          >
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2 text-slate-900 font-medium">
                <ImageIcon className="w-4 h-4 text-slate-500" />
                <span>Imágenes y Videos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center justify-center py-8">
                <RotatingLoader
                  items={[
                    { text: "Redactando copy", icon: Sparkles },
                    { text: "Optimizando mensajes", icon: Target },
                    { text: "Ajustando tono", icon: Palette },
                  ]}
                  spinnerSize="sm"
                  textSize="sm"
                  interval={2000}
                  showSpinner={false}
                  className="text-slate-500"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
