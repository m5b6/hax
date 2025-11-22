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
  const { brandColors, brandLogoUrl } = useBrand();
  const [currentIndex, setCurrentIndex] = useState(0);
  const isInlineSvgLogo = brandLogoUrl?.trim().startsWith("<svg");
  
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
      {/* Brand Logo Spinner */}
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
        
        {/* Spinning ring around logo */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: `2px solid ${gradientColors[0]}30`,
            borderTopColor: gradientColors[0],
            borderRightColor: gradientColors[1] || gradientColors[0],
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        {/* Spinning logo container */}
        <motion.div
          className="w-16 h-16 rounded-full bg-white flex items-center justify-center overflow-hidden relative z-10"
          style={{
            boxShadow: `
              0 8px 24px rgba(0, 0, 0, 0.15),
              0 4px 12px rgba(0, 0, 0, 0.1),
              0 2px 6px rgba(0, 0, 0, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.9)
            `,
            border: "1px solid rgba(255, 255, 255, 0.7)",
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {brandLogoUrl ? (
            isInlineSvgLogo ? (
              <div
                className="w-[85%] h-[85%] text-slate-900 [&_svg]:w-full [&_svg]:h-full [&_svg]:fill-current"
                dangerouslySetInnerHTML={{ __html: brandLogoUrl }}
              />
            ) : (
              <img
                src={brandLogoUrl}
                alt="Logo"
                className="w-[85%] h-[85%] object-contain"
                referrerPolicy="no-referrer"
              />
            )
          ) : (
            /* Fallback: Thin rotating ring if no logo */
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                border: `2px solid ${gradientColors[0]}40`,
              }}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          )}
        </motion.div>
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

