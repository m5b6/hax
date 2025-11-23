"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface StartupAnimationProps {
  onComplete: () => void;
  onStartMoving?: () => void;
}

export function StartupAnimation({ onComplete, onStartMoving }: StartupAnimationProps) {
  const [phase, setPhase] = useState<"text" | "logo-center" | "logo-moving" | "complete">("text");

  useEffect(() => {
    // 1. Stay on text for 1.5s, then compress to logo
    const timer1 = setTimeout(() => {
      setPhase("logo-center");
    }, 1500);

    // 2. Stay as logo in center briefly, then trigger UI and move
    const timer2 = setTimeout(() => {
      setPhase("logo-moving");
      onStartMoving?.();
    }, 2200);

    // 3. Finish transition
    const timer3 = setTimeout(() => {
      setPhase("complete");
      setTimeout(() => onComplete(), 200); 
    }, 3600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete, onStartMoving]);

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

  // Determine styles based on phase
  // During "logo-moving" and "complete", we want the logo in the corner
  const isCorner = phase === "logo-moving" || phase === "complete";

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden flex flex-col items-center justify-center">
      {/* Background curtain - fades out when logo starts moving */}
      <motion.div 
        className="absolute inset-0 bg-black"
        initial={{ opacity: 1 }}
        animate={{ opacity: isCorner ? 0 : 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      {/* TEXT: Adsombroso */}
      <AnimatePresence mode="wait">
        {phase === "text" && (
          <motion.div
            key="text-container"
            className="absolute inset-0 flex items-center justify-center z-10"
            exit={{ 
              opacity: 0, 
              scale: 0.5, 
              filter: "blur(10px)",
              transition: { duration: 0.5, ease: "easeInOut" } 
            }}
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-6xl sm:text-7xl md:text-8xl font-normal tracking-tight text-white"
              style={{ fontFamily: 'var(--font-instrument-serif), serif' }}
            >
              Adsombroso
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOGO: Ao. */}
      <AnimatePresence>
        {(phase === "logo-center" || phase === "logo-moving" || phase === "complete") && (
          <motion.div
            key="logo-container"
            className="fixed z-[101]"
            initial={{ 
              top: "50%", 
              left: "50%", 
              x: "-50%", 
              y: "-50%", 
              scale: 1.5, 
              opacity: 0 
            }}
            animate={{
              top: isCorner ? "1rem" : "50%", // 1rem = top-4
              left: isCorner ? "auto" : "50%",
              right: isCorner ? "2rem" : "auto", // 2rem = right-8
              x: isCorner ? 0 : "-50%",
              y: isCorner ? 0 : "-50%",
              scale: 1,
              opacity: 1,
            }}
            transition={{
              top: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
              left: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
              right: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
              x: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
              y: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
              scale: { duration: 0.5 },
              opacity: { duration: 0.4 },
            }}
          >
            {logoContent}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
