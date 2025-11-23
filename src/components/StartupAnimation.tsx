"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface StartupAnimationProps {
  onComplete: () => void;
  onStartMoving?: () => void;
}

export function StartupAnimation({ onComplete, onStartMoving }: StartupAnimationProps) {
  // Phases:
  // 1. "text": Show "Adsombroso"
  // 2. "logo-center": "Adsombroso" compresses into "Ao." at center
  // 3. "logo-moving": "Ao." moves to top-right
  // 4. "complete": Animation done
  const [phase, setPhase] = useState<"text" | "logo-center" | "logo-moving" | "complete">("text");

  useEffect(() => {
    // 1. Stay on text for 1.5s, then compress to logo
    const timer1 = setTimeout(() => {
      setPhase("logo-center");
    }, 1500);

    // 2. Stay as logo in center for 1s, then move to corner
    const timer2 = setTimeout(() => {
      setPhase("logo-moving");
      onStartMoving?.();
    }, 2500);

    // 3. Finish transition
    const timer3 = setTimeout(() => {
      setPhase("complete");
      // Give the move animation time to finish before unmounting
      setTimeout(() => onComplete(), 100); 
    }, 3800);

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

  return (
    <div className="fixed inset-0 z-[100] bg-black pointer-events-none overflow-hidden">
      {/* TEXT: Adsombroso */}
      <AnimatePresence mode="wait">
        {phase === "text" && (
          <motion.div
            key="text-container"
            className="absolute inset-0 flex items-center justify-center"
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
            layoutId="ao-logo-container"
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
              // If moving, go to corner. If center, stay center.
              top: phase === "logo-moving" || phase === "complete" ? "2rem" : "50%",
              left: phase === "logo-moving" || phase === "complete" ? "auto" : "50%",
              right: phase === "logo-moving" || phase === "complete" ? "2rem" : "auto",
              x: phase === "logo-moving" || phase === "complete" ? 0 : "-50%",
              y: phase === "logo-moving" || phase === "complete" ? 0 : "-50%",
              scale: 1,
              opacity: 1,
            }}
            transition={{
              // Distinct transitions for moving vs appearing
              top: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
              left: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
              right: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
              x: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
              y: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
              scale: { duration: 0.5 }, // Faster scale for the "pop" effect
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
