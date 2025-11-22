import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBrand } from "@/contexts/BrandContext";
import { FloatingImageBubbles } from "@/components/FloatingImageBubbles";

interface WizardLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  title?: string;
  subtitle?: string;
  isAnalyzing?: boolean;
}

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
              {brandLogoUrl && (
                <div className="absolute top-4 left-8 w-16 h-16 rounded-full bg-white shadow-xl shadow-slate-200/60 border border-white/70 flex items-center justify-center overflow-hidden z-30 p-1">
                  {isInlineSvgLogo ? (
                    <div
                      className="w-full h-full text-slate-900 [&_svg]:w-full [&_svg]:h-full [&_svg]:fill-current"
                      dangerouslySetInnerHTML={{ __html: brandLogoUrl }}
                    />
                  ) : (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={brandLogoUrl}
                        alt="Logo"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </>
                  )}
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
