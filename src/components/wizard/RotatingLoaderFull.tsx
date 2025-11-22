"use client";

import React from "react";
import { RotatingLoader, RotatingLoaderItem } from "@/components/ui/rotating-loader";
import { Sparkles, Search, Wand2, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface RotatingLoaderFullProps {
  items: RotatingLoaderItem[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export function RotatingLoaderFull({
  items,
  title,
  subtitle,
  className,
}: RotatingLoaderFullProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 space-y-6 min-h-[300px] ${className || ""}`}>
      <div className="relative w-20 h-20 flex items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full bg-blue-100 blur-xl opacity-50"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-blue-100"
          style={{ borderTopColor: '#3B82F6', borderRightColor: '#8B5CF6' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <Sparkles className="w-8 h-8 text-blue-500 animate-pulse relative z-10" />
      </div>
      
      <div className="text-center space-y-3">
        {title && (
          <motion.p
            className="text-lg font-medium text-slate-900"
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

