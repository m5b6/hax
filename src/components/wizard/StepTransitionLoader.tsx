"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotatingLoaderItem } from "@/components/ui/rotating-loader";
import { useBrand } from "@/contexts/BrandContext";

interface StepTransitionLoaderProps {
  items: RotatingLoaderItem[];
  title?: string;
  subtitle?: string;
  className?: string;
  gradientColors?: string[];
}

export function StepTransitionLoader({
  items,
  title,
  subtitle,
  className,
  gradientColors: customGradientColors,
}: StepTransitionLoaderProps) {
  const { brandColors } = useBrand();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Use custom colors, brand colors, or default chromatic gradient
  const gradientColors = customGradientColors || (brandColors && brandColors.length >= 2
    ? brandColors
    : ["#40C9FF", "#E81CFF", "#FF9F0A"]);

  // Rotate through items
  useEffect(() => {
    if (items.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [items.length]);

  const currentItem = items[currentIndex];
  const Icon = currentItem?.icon;

  return (
    <div className={`flex flex-col items-center justify-center py-16 space-y-8 min-h-[400px] ${className || ""}`}>
      {/* Subtle liquid glass orb */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Outer subtle glow */}
        <motion.div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{
            background: `radial-gradient(circle, ${gradientColors[0]}20, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Thin rotating ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: `1px solid ${gradientColors[0]}25`,
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        {/* Inner glass circle - very subtle */}
        <motion.div
          className="absolute inset-[25%] rounded-full backdrop-blur-md"
          style={{
            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))`,
            border: `1px solid rgba(255, 255, 255, 0.15)`,
            boxShadow: `
              inset 0 1px 0 rgba(255, 255, 255, 0.2),
              0 0 20px ${gradientColors[0]}10
            `,
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        {/* Small chromatic accent dots - very subtle */}
        {gradientColors.slice(0, 3).map((color, idx) => {
          const angle = (idx * 120 - 90) * (Math.PI / 180);
          const radius = 30;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <motion.div
              key={idx}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: color,
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: "translate(-50%, -50%)",
                opacity: 0.4,
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: idx * 0.4,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </div>
      
      {/* Text content */}
      <div className="text-center space-y-4 max-w-md">
        {title && (
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xl font-semibold text-slate-900 tracking-tight"
            style={{ fontFamily: 'var(--font-instrument-serif), serif' }}
          >
            {title}
          </motion.h3>
        )}
        
        {/* Rotating text items with icon */}
        <div className="relative h-6 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {currentItem && (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="absolute flex items-center gap-2 text-sm font-medium text-slate-600"
              >
                {Icon && (
                  <Icon className="w-4 h-4 text-slate-500" />
                )}
                <span>{currentItem.text}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-500 text-sm font-medium"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </div>
  );
}

