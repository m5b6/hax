import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBrand } from "@/contexts/BrandContext";
import { FloatingImageBubbles } from "@/components/FloatingImageBubbles";
import { useWizardStore } from "@/contexts/WizardStore";
import * as LucideIcons from "lucide-react";
import { ArrowRight } from "lucide-react";

interface WizardLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  title?: string;
  subtitle?: string;
  isAnalyzing?: boolean;
}

// Helper to get icon component by name from lucide-react
const getIconByName = (iconName: string): React.ComponentType<any> => {
  if (!iconName || typeof iconName !== 'string') {
    return LucideIcons.Circle;
  }
  
  const exactMatch = LucideIcons[iconName as keyof typeof LucideIcons];
  if (exactMatch) {
    return exactMatch as React.ComponentType<any>;
  }
  
  const normalizedName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
  const caseMatch = LucideIcons[normalizedName as keyof typeof LucideIcons];
  if (caseMatch) {
    return caseMatch as React.ComponentType<any>;
  }
  
  return LucideIcons.Circle;
};

export const WizardLayout = ({
  children,
  currentStep,
  totalSteps,
  title,
  subtitle,
  isAnalyzing = false,
}: WizardLayoutProps) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const { brandLogoUrl } = useBrand();
  const isInlineSvgLogo = brandLogoUrl?.trim().startsWith("<svg");
  const wizardStore = useWizardStore();
  const selectionStack = wizardStore.getSelectionStack();
  const mcqQuestions = wizardStore.getAgentResponse("mcqQuestions") || [];
  
  // Helper to get question text for an MCQ option
  const getQuestionForOption = (optionId: string): string | null => {
    for (const question of mcqQuestions) {
      if (question.options?.some((opt: any) => opt.id === optionId)) {
        return question.question || null;
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      <FloatingImageBubbles />
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-[3px] bg-black/5 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-[#40C9FF] via-[#E81CFF] to-[#FF9F0A]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ 
            type: "spring", 
            stiffness: 40, 
            damping: 15, 
            mass: 1 
          }}
        />
      </div>

      {/* Ao. Logo - Top Right of App */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 20,
          delay: 0.1
        }}
        className="fixed top-4 right-8 z-50"
      >
        <div className="relative w-12 h-12">
          <motion.div
            className="absolute -inset-1 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, #40C9FF, #E81CFF, #FF9F0A, #FFD60A, #40C9FF)",
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <div className="relative w-full h-full rounded-full bg-black/80 backdrop-blur-md flex items-center justify-center">
            <span 
              className="text-white text-xl font-normal"
              style={{ fontFamily: 'var(--font-instrument-serif), serif' }}
            >
              Ao.
            </span>
          </div>
        </div>
      </motion.div>

      <main className="w-full max-w-2xl mx-auto relative z-10">
        <AnimatePresence mode="wait" custom={currentStep}>
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)", transition: { duration: 0.3 } }}
            transition={{ 
              type: "spring", 
              stiffness: 100, 
              damping: 20,
              mass: 1
            }}
            className="relative"
          >
            {/* Animated Rainbow Glow Border - Slower & More Subtle */}
            <div className="absolute -inset-[2px] rounded-[2.6rem] opacity-40">
              <div 
                className="absolute inset-0 rounded-[2.6rem] blur-lg"
                style={{
                  background: 'linear-gradient(90deg, #40C9FF, #E81CFF, #FF9F0A, #FFD60A, #40C9FF)',
                  backgroundSize: '300% 100%',
                  animation: 'rainbow-shift 20s linear infinite'
                }}
              />
            </div>
            
            <div className="glass-panel rounded-[2.5rem] p-6 sm:p-10 relative">
              {/* Selection Stack - Top Right, aligned with headers */}
              {selectionStack.length > 0 && (
                <div className="absolute top-4 right-8 flex items-center gap-1.5 z-30">
                  <AnimatePresence mode="popLayout">
                    {selectionStack.map((item, idx) => {
                      // Find where to insert arrow (after logo and first pick, before MCQ picks)
                      const isBeforeMcqPicks = idx > 0 && 
                        (selectionStack[idx - 1]?.id === "brand-logo" || selectionStack[idx - 1]?.id === "first-pick") &&
                        item.id !== "brand-logo" && item.id !== "first-pick";
                      
                      // Special handling for brand logo
                      if (item.id === "brand-logo" && brandLogoUrl) {
                        return (
                          <React.Fragment key={`${item.id}-${idx}`}>
                            <motion.div
                              initial={{ opacity: 0, scale: 0, rotate: -180 }}
                              animate={{ opacity: 1, scale: 1, rotate: 0 }}
                              exit={{ opacity: 0, scale: 0 }}
                              transition={{ type: "spring", stiffness: 200, damping: 15 }}
                              className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-white/70 shrink-0 transition-all duration-200 cursor-pointer hover:scale-110 hover:shadow-xl group relative"
                              style={{
                                boxShadow: `0 2px 8px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.1)`,
                              }}
                              title={item.text}
                            >
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                {item.text}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
                              </div>
                              {isInlineSvgLogo ? (
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
                            </motion.div>
                            {isBeforeMcqPicks && (
                              <motion.div
                                initial={{ opacity: 0, scaleX: 0 }}
                                animate={{ opacity: 1, scaleX: 1 }}
                                exit={{ opacity: 0, scaleX: 0 }}
                                transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
                                className="flex items-center mx-1"
                              >
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400" strokeWidth={2.5} />
                              </motion.div>
                            )}
                          </React.Fragment>
                        );
                      }
                      
                      // Regular items (product/service pick and MCQ selections)
                      const Icon = getIconByName(item.icon);
                      const questionText = getQuestionForOption(item.id);
                      const tooltipText = questionText 
                        ? `${questionText}: ${item.text}`
                        : item.text;
                      
                      return (
                        <React.Fragment key={`${item.id}-${idx}`}>
                          {isBeforeMcqPicks && (
                            <motion.div
                              initial={{ opacity: 0, scaleX: 0 }}
                              animate={{ opacity: 1, scaleX: 1 }}
                              exit={{ opacity: 0, scaleX: 0 }}
                              transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
                              className="flex items-center mx-1 mr-3"
                            >
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400" strokeWidth={2.5} />
                            </motion.div>
                          )}
                          <motion.div
                            initial={{ opacity: 0, scale: 0, x: 10, rotate: -180 }}
                            animate={{ opacity: 1, scale: 1, x: 0, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0, x: -10 }}
                            transition={{ 
                              type: "spring", 
                              stiffness: 200, 
                              damping: 15,
                              delay: idx * 0.05
                            }}
                            className="w-8 h-8 rounded-full shadow-lg flex items-center justify-center border-2 shrink-0 relative transition-all duration-200 cursor-pointer hover:scale-110 hover:shadow-xl group"
                            style={{
                              backgroundColor: item.color || "#3B82F6",
                              borderColor: item.color || "#3B82F6",
                              boxShadow: `0 2px 8px ${item.color}30, 0 1px 2px rgba(0,0,0,0.1)`,
                              zIndex: 30 + idx,
                              marginLeft: idx > 0 ? "-12px" : "0",
                            }}
                            title={tooltipText}
                          >
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap text-center">
                              {questionText ? (
                                <>
                                  <span className="font-medium">{questionText.split(':')[0].split('?')[0]}:</span> {item.text}
                                </>
                              ) : (
                                item.text
                              )}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
                            </div>
                            <Icon className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                          </motion.div>
                        </React.Fragment>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
              {title && (
                <header className="mb-8 text-center space-y-2">
                  <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl sm:text-3xl tracking-tight text-slate-900 font-bold"
                    style={{ fontFamily: 'var(--font-instrument-serif), serif' }}
                  >
                    {title}
                  </motion.h1>
                  {subtitle && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-slate-500 text-base font-medium leading-relaxed"
                    >
                      {subtitle}
                    </motion.p>
                  )}
                </header>
              )}

              <div className="w-full relative z-20">{children}</div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>


      <style jsx>{`
        @keyframes rainbow-shift {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
      `}</style>
    </div>
  );
};
