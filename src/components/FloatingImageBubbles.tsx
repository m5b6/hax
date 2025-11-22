"use client";

import { useBrand } from "@/contexts/BrandContext";
import { motion } from "framer-motion";
import { useMemo } from "react";

// Generate orbital paths and sizes for each bubble
const generateBubbleConfig = (idx: number) => {
  const baseRadius = 60 + idx * 25; // Varying orbital radius (60-210px)
  const baseSize = 64 + (idx % 3) * 24; // Varying sizes: 64px, 88px, 112px
  const duration = 30 + idx * 5; // Varying speeds (30-55s)
  const rotationSpeed = 25 + idx * 4; // Rotation speed
  const initialAngle = (idx * Math.PI * 2) / 6; // Stagger initial positions

  return {
    baseRadius,
    baseSize,
    duration,
    rotationSpeed,
    initialAngle,
  };
};

const bubblePositions = [
  { top: "10%", left: "10%" },
  { top: "15%", right: "12%" },
  { bottom: "20%", left: "8%" },
  { bottom: "15%", right: "10%" },
  { top: "50%", left: "5%" },
  { top: "55%", right: "8%" },
];

export const FloatingImageBubbles = () => {
  const { brandImages } = useBrand();

  const bubbleConfigs = useMemo(() => {
    return brandImages.slice(0, bubblePositions.length).map((_, idx) => ({
      ...generateBubbleConfig(idx),
      position: bubblePositions[idx],
    }));
  }, [brandImages.length]);

  if (!brandImages.length) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {brandImages.slice(0, bubblePositions.length).map((src, idx) => {
        const config = bubbleConfigs[idx];
        const { position, baseSize, duration, rotationSpeed, baseRadius, initialAngle } = config;
        
        // Size variation animation - pulsing blob effect
        const sizeVariation = [1, 1.25, 0.8, 1.2, 0.9, 1.15, 1, 1.1];

        // Create circular motion using keyframes
        const steps = 16;
        const orbitalX = Array.from({ length: steps + 1 }, (_, i) => {
          const angle = initialAngle + (i / steps) * Math.PI * 2;
          return Math.cos(angle) * baseRadius;
        });
        const orbitalY = Array.from({ length: steps + 1 }, (_, i) => {
          const angle = initialAngle + (i / steps) * Math.PI * 2;
          return Math.sin(angle) * baseRadius;
        });
        const times = Array.from({ length: steps + 1 }, (_, i) => i / steps);

        return (
          <motion.div
            key={`${src}-${idx}`}
            className="absolute"
            style={position}
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{ 
              opacity: [0, 0.4, 0.65, 0.6],
              scale: [0.2, 1, 1.1, 1],
            }}
            transition={{ 
              duration: 2,
              delay: idx * 0.3,
              ease: "easeOut"
            }}
          >
            <motion.div
              animate={{
                x: orbitalX,
                y: orbitalY,
                scale: sizeVariation,
                rotate: [0, 360],
              }}
              transition={{
                x: {
                  duration,
                  repeat: Infinity,
                  ease: "linear",
                  times,
                },
                y: {
                  duration,
                  repeat: Infinity,
                  ease: "linear",
                  times,
                },
                scale: {
                  duration: duration * 0.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1],
                },
                rotate: {
                  duration: rotationSpeed,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
              style={{
                width: baseSize,
                height: baseSize,
              }}
              className="rounded-full bg-white/30 backdrop-blur-[6px] border border-white/40 shadow-lg shadow-slate-900/10 overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt="Brand imagery"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};

