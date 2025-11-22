"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RotatingLoaderItem {
  text: string;
  icon?: LucideIcon;
}

interface RotatingLoaderProps {
  items: RotatingLoaderItem[];
  className?: string;
  spinnerSize?: "sm" | "md" | "lg";
  textSize?: "sm" | "md" | "lg";
  interval?: number; // milliseconds between rotations
  showSpinner?: boolean;
}

const sizeClasses = {
  spinner: {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  },
  icon: {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  },
  text: {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  },
};

export function RotatingLoader({
  items,
  className,
  spinnerSize = "md",
  textSize = "md",
  interval = 2000,
  showSpinner = true,
}: RotatingLoaderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, interval);

    return () => clearInterval(timer);
  }, [items.length, interval]);

  if (items.length === 0) return null;

  const currentItem = items[currentIndex];
  const Icon = currentItem.icon;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {showSpinner && (
        <div className={cn("relative", sizeClasses.spinner[spinnerSize])}>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-slate-200"
            style={{
              borderTopColor: "transparent",
              borderRightColor: "#3B82F6",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-[2px] rounded-full bg-gradient-to-tr from-blue-400/20 to-purple-500/20" />
        </div>
      )}

      <div className="relative overflow-hidden" style={{ minHeight: textSize === "sm" ? "1.5rem" : textSize === "md" ? "1.75rem" : "2rem" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap",
              sizeClasses.text[textSize],
              "font-medium text-slate-800"
            )}
          >
            {Icon && <Icon className={cn("shrink-0 text-current", sizeClasses.icon[spinnerSize])} />}
            <span>{currentItem.text}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

