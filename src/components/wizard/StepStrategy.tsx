import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import * as LucideIcons from "lucide-react";
import { ArrowRight, Sparkles, Check, ArrowLeft, Wand2, Search, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWizardStore } from "@/contexts/WizardStore";
import { RotatingLoaderFull } from "./RotatingLoaderFull";

interface StepStrategyProps {
  onNext: () => void;
}

// Helper to get icon component by name from lucide-react
const getIconByName = (iconName: string): React.ComponentType<any> => {
  // @ts-ignore - dynamic icon access
  const Icon = LucideIcons[iconName as keyof typeof LucideIcons] as ComponentType<any>;
  return Icon || Check;
};

// Helper to get icon component based on MCQ option IDs (fallback)
const getIconForOption = (id: string): React.ComponentType<any> => {
  // Visual Style icons
  if (id === "moderno") return LucideIcons.Palette;
  if (id === "natural") return LucideIcons.Heart;
  if (id === "directo") return LucideIcons.Zap;
  
  // Visual Rhythm icons
  if (id === "rapido") return LucideIcons.Zap;
  if (id === "medio") return LucideIcons.Film;
  if (id === "lento") return LucideIcons.Heart;
  
  // Human Presence icons
  if (id === "alta") return LucideIcons.Users;
  if (id === "media") return LucideIcons.Target;
  if (id === "cero") return LucideIcons.Globe;
  
  return Check;
};

export const StepStrategy = ({ onNext }: StepStrategyProps) => {
  const wizardStore = useWizardStore();
  const storedMCQAnswers = wizardStore.getAgentResponse("mcqAnswers") || {};
  const storedMCQQuestions = wizardStore.getAgentResponse("mcqQuestions") || [];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(storedMCQAnswers as Record<string, string>);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [historyStack, setHistoryStack] = useState<{id: string, icon: any, color: string}[]>([]);
  
  // Get previous data for display
  const previousData = {
    name: wizardStore.getInput("name"),
    type: wizardStore.getInput("type"),
    productName: wizardStore.getInput("productName"),
  };

  // Use stored MCQs or show loading/error state
  const mcqQuestions = storedMCQQuestions.length > 0 ? storedMCQQuestions : null;
  const currentQuestion = mcqQuestions?.[currentQuestionIndex];
  const totalQuestions = mcqQuestions?.length || 0;

  useEffect(() => {
    // If MCQs are not loaded, trigger generation and show loading state
    if (!mcqQuestions) {
      setIsAnalyzing(true);
      
      const wizardData = {
        inputs: wizardStore.getAllInputs(),
        agentResponses: wizardStore.getAllAgentResponses(),
        metadata: wizardStore.data.metadata,
      };

      fetch("/api/agent/generate-mcqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wizardData }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to generate MCQs");
          }
          return response.json();
        })
        .then(({ questions }) => {
          wizardStore.setAgentResponse("mcqQuestions", questions);
          setIsAnalyzing(false);
        })
        .catch((error) => {
          console.error("Error generating MCQs:", error);
          setIsAnalyzing(false);
        });
    }
  }, [mcqQuestions, wizardStore]);
  
  const handleSelect = (optionId: string, optionColor: string, optionIcon: string) => {
    if (!currentQuestion) return;
    
    const newAnswers = { ...answers, [currentQuestion.id]: optionId };
    setAnswers(newAnswers);
    wizardStore.setAgentResponse("mcqAnswers", newAnswers);
    
    const Icon = optionIcon ? getIconByName(optionIcon) : getIconForOption(optionId);
    const newStack = historyStack.filter((_, i) => i < currentQuestionIndex);
    newStack.push({ id: optionId, icon: Icon, color: optionColor });
    setHistoryStack(newStack);
    
    setTimeout(() => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    }, 450);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Answers are already synced to store via handleSelect
      onNext();
    }
  };
  
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex((prev) => prev - 1);
        setHistoryStack(prev => prev.slice(0, -1));
    }
  };

  if (isAnalyzing || !mcqQuestions || !currentQuestion) {
    return (
      <RotatingLoaderFull
        items={[
          { text: "Cargando preguntas", icon: Search },
          { text: "Generando opciones", icon: Wand2 },
          { text: "Personalizando contenido", icon: Sparkles },
          { text: "Analizando tu negocio", icon: Zap },
        ]}
        title="Preparando tu estrategia"
        subtitle={previousData.name ? `Personalizando para ${previousData.name}` : "Analizando tu negocio..."}
      />
    );
  }

  return (
    <div className="w-full relative">
        {/* Header with Progress */}
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Paso {currentQuestionIndex + 1} de {totalQuestions}
                </span>
                <div className="h-1 w-16 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* History Stack */}
            <div className="flex -space-x-2">
                <AnimatePresence>
                    {historyStack.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0, x: 10, rotate: -180 }}
                            animate={{ opacity: 1, scale: 1, x: 0, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0, x: -10 }}
                            className="w-9 h-9 rounded-full shadow-md flex items-center justify-center z-10 border-2"
                            style={{
                              backgroundColor: item.color || "#3B82F6",
                              borderColor: item.color || "#3B82F6",
                            }}
                        >
                            <item.icon className="w-4 h-4 text-white" />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3, ease: "circOut" }}
          className="space-y-6"
        >
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight font-instrument-sans">
              {currentQuestion.question}
            </h2>
            
            {/* Show description from first option's whyItWorks as insight if available */}
            {currentQuestion.options?.[0]?.whyItWorks && (
              <div className="flex items-start gap-2 text-slate-500 text-sm leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-100/50">
                <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p><span className="font-medium text-slate-700">Contexto:</span> Estas opciones están personalizadas para tu negocio.</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = answers[currentQuestion.id] === option.id;
              const OptionIcon = option.icon ? getIconByName(option.icon) : getIconForOption(option.id);
              const optionColor = option.color || "#3B82F6";
              
              // Convert hex to RGB for opacity
              const hexToRgb = (hex: string) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                  r: parseInt(result[1], 16),
                  g: parseInt(result[2], 16),
                  b: parseInt(result[3], 16)
                } : { r: 59, g: 130, b: 246 };
              };
              
              // Helper to darken a color
              const darkenColor = (hex: string, amount: number): string => {
                const rgb = hexToRgb(hex);
                const r = Math.max(0, Math.floor(rgb.r * (1 - amount)));
                const g = Math.max(0, Math.floor(rgb.g * (1 - amount)));
                const b = Math.max(0, Math.floor(rgb.b * (1 - amount)));
                return `rgb(${r}, ${g}, ${b})`;
              };
              
              const rgb = hexToRgb(optionColor);
              const bgColorOpaque = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.06)`;
              const bgColorFull = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`;
              const borderColorOpaque = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`;
              const borderColorFull = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
              
              return (
                <motion.button
                  key={option.id}
                  onClick={() => handleSelect(option.id, optionColor, option.icon)}
                  whileHover={{ scale: 1.005, y: -1 }}
                  whileTap={{ scale: 0.995 }}
                  className={`
                    w-full p-4 rounded-xl text-left transition-all duration-300 group relative overflow-hidden
                    backdrop-blur-sm
                    ${isSelected ? "" : ""}
                  `}
                  style={{
                    backgroundColor: isSelected ? bgColorFull : bgColorOpaque,
                    border: `1px solid ${isSelected ? borderColorFull : borderColorOpaque}`,
                    boxShadow: isSelected 
                      ? `
                        0 1px 2px rgba(0, 0, 0, 0.04),
                        0 2px 4px rgba(0, 0, 0, 0.02),
                        inset 0 1px 0 rgba(255, 255, 255, 0.7),
                        inset 0 -1px 0 rgba(0, 0, 0, 0.02),
                        0 0 0 1px ${borderColorFull}
                      `
                      : `
                        0 1px 1px rgba(0, 0, 0, 0.02),
                        0 2px 4px rgba(0, 0, 0, 0.01),
                        inset 0 1px 0 rgba(255, 255, 255, 0.6),
                        inset 0 -1px 0 rgba(0, 0, 0, 0.01)
                      `,
                  }}
                >
                    {/* Bevel highlight top */}
                    <div 
                      className="absolute inset-x-0 top-0 h-[1px] opacity-60 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${optionColor}40, transparent)`,
                        opacity: isSelected ? 0.8 : 0.4,
                      }}
                    />
                    
                    {/* Subtle color glow on hover/select */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `radial-gradient(circle at center, ${optionColor}08 0%, transparent 70%)`
                      }}
                    />
                    
                    <div className="relative flex items-start gap-3.5">
                        <div 
                          className={`
                            w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300
                            ${isSelected ? "scale-105" : "group-hover:scale-105"}
                          `}
                          style={{
                            backgroundColor: isSelected ? optionColor : `${optionColor}15`,
                            color: isSelected ? "white" : optionColor,
                            boxShadow: isSelected
                              ? `
                                0 2px 4px ${optionColor}30,
                                inset 0 1px 0 rgba(255, 255, 255, 0.3),
                                inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                              `
                              : `
                                0 1px 2px rgba(0, 0, 0, 0.05),
                                inset 0 1px 0 rgba(255, 255, 255, 0.5),
                                inset 0 -1px 0 rgba(0, 0, 0, 0.05)
                              `,
                          }}
                        >
                            <OptionIcon className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0 space-y-1">
                            <div 
                              className="font-bold text-base leading-tight"
                              style={{ 
                                color: isSelected ? darkenColor(optionColor, 0.3) : darkenColor(optionColor, 0.5),
                                fontFamily: 'var(--font-instrument-serif), serif'
                              }}
                            >
                                {option.text}
                            </div>
                            <div className={`text-sm leading-snug ${isSelected ? 'text-slate-700' : 'text-slate-600'}`}>
                                {option.description}
                            </div>
                            {option.whyItWorks && (
                              <div 
                                className="text-xs leading-relaxed mt-2 pt-2 border-t font-medium"
                                style={{
                                  borderColor: isSelected ? `${optionColor}30` : "#E2E8F0",
                                  color: isSelected ? `${optionColor}CC` : "#64748B"
                                }}
                              >
                                <span className="font-semibold">{option.sensation}</span> • {option.whyItWorks}
                              </div>
                            )}
                        </div>

                        {isSelected && (
                            <motion.div 
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                                style={{ 
                                  backgroundColor: optionColor,
                                  boxShadow: `
                                    0 2px 4px ${optionColor}40,
                                    inset 0 1px 0 rgba(255, 255, 255, 0.3),
                                    inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                                  `
                                }}
                            >
                                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            </motion.div>
                        )}
                    </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="pt-8 flex justify-between items-center">
        <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentQuestionIndex === 0}
            className={`
                text-slate-400 hover:text-slate-600 px-0 -ml-2
                ${currentQuestionIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}
            `}
        >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Atrás
        </Button>

        {currentQuestionIndex === totalQuestions - 1 && answers[currentQuestion.id] && (
             <Button
             size="lg"
             onClick={handleNext}
             className="glass-button-primary rounded-full px-8 font-medium bg-slate-900 text-white hover:bg-slate-800 shadow-lg"
           >
             Finalizar <ArrowRight className="ml-2 w-4 h-4" />
           </Button>
        )}
      </div>
    </div>
  );
};
