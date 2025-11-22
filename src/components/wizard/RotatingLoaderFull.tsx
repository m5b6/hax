"use client";

import React from "react";
import { RotatingLoader, RotatingLoaderItem } from "@/components/ui/rotating-loader";
import { Sparkles, Search, Wand2, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useBrand } from "@/contexts/BrandContext";

interface RotatingLoaderFullProps {
  items: RotatingLoaderItem[];
  title?: string;
  subtitle?: string;
  className?: string;
  gradientColors?: string[]; // Optional custom gradient colors
}

export function RotatingLoaderFull({
  items,
  title,
  subtitle,
  className,
  gradientColors,
}: RotatingLoaderFullProps) {
  const { brandLogoUrl } = useBrand();
  const isInlineSvgLogo = brandLogoUrl?.trim().startsWith("<svg");
  
  // Use custom gradient colors if provided, otherwise default
  const colors = gradientColors || ["#3B82F6", "#8B5CF6"];
  const color1 = colors[0] || "#3B82F6";
  const color2 = colors[1] || "#8B5CF6";
  const color3 = colors[2] || color1;

  return (
    <div className={`flex flex-col items-center justify-center py-12 space-y-6 min-h-[300px] ${className || ""}`}>
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 rounded-full blur-xl opacity-40"
          style={{
            background: `radial-gradient(circle, ${color1}40, ${color2}40, ${color3}40)`,
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Rotating ring with gradient colors */}
        <motion.div
          className="absolute inset-0 rounded-full border-2"
          style={{
            borderTopColor: color1,
            borderRightColor: color2,
            borderBottomColor: color3,
            borderLeftColor: 'transparent',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Logo or fallback icon */}
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 w-12 h-12 flex items-center justify-center"
        >
          {brandLogoUrl ? (
            <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-white/80 backdrop-blur-sm">
              {isInlineSvgLogo ? (
                <div
                  className="w-full h-full text-slate-900 [&_svg]:w-full [&_svg]:h-full [&_svg]:fill-current [&_svg]:p-1"
                  dangerouslySetInnerHTML={{ __html: brandLogoUrl }}
                />
              ) : (
                <img
                  src={brandLogoUrl}
                  alt="Logo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
          ) : (
            <Sparkles className="w-8 h-8" style={{ color: color1 }} />
          )}
        </motion.div>
      </div>
      
      <div className="text-center space-y-3">
        {title && (
          <motion.p
            className="text-lg font-medium text-slate-500"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {title}
          </motion.p>
        )}
        
        <RotatingLoader
          items={items}
          spinnerSize="sm"
          textSize="sm"
          interval={2000}
          showSpinner={false}
          className="justify-center"
        />
        
        {subtitle && (
          <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

