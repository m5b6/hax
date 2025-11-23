"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface StartupAnimationProps {
  onComplete: () => void;
}

export function StartupAnimation({ onComplete }: StartupAnimationProps) {
  const [stage, setStage] = useState<"adsombroso" | "ao-center" | "ao-moving" | "complete">("adsombroso");

  useEffect(() => {
    const timer1 = setTimeout(() => setStage("ao-center"), 1200);
    const timer2 = setTimeout(() => setStage("ao-moving"), 2200);
    const timer3 = setTimeout(() => {
      setStage("complete");
      setTimeout(() => onComplete(), 100);
    }, 3400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  const logoContent = (
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
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden">
      <AnimatePresence mode="wait">
        {stage === "adsombroso" && (
          <motion.div
            key="adsombroso"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <h1
              className="text-6xl sm:text-7xl md:text-8xl font-normal tracking-tight text-white"
              style={{ fontFamily: 'var(--font-instrument-serif), serif' }}
            >
              Adsombroso
            </h1>
          </motion.div>
        )}

        {stage === "ao-center" && (
          <motion.div
            key="ao-center"
            layoutId="ao-logo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {logoContent}
          </motion.div>
        )}

        {(stage === "ao-moving" || stage === "complete") && (
          <motion.div
            key="ao-moving"
            layoutId="ao-logo"
            className="fixed z-[101]"
            initial={{ 
              top: "50%",
              left: "50%",
              x: "-50%",
              y: "-50%",
            }}
            animate={{
              top: "1rem",
              right: "2rem",
              left: "auto",
              x: 0,
              y: 0,
            }}
            transition={{
              duration: 1.2,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {logoContent}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
