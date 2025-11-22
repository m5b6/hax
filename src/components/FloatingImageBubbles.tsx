"use client";

import { useBrand } from "@/contexts/BrandContext";
import { motion } from "framer-motion";

const bubblePositions = [
  { top: "12%", left: "8%" },
  { top: "20%", right: "8%" },
  { bottom: "18%", left: "6%" },
  { bottom: "14%", right: "12%" },
  { top: "45%", left: "4%" },
  { top: "50%", right: "6%" },
];

export const FloatingImageBubbles = () => {
  const { brandImages } = useBrand();

  if (!brandImages.length) return null;

  return (
    <div className="absolute inset-0 pointer-events-none -z-10">
      {brandImages.slice(0, bubblePositions.length).map((src, idx) => {
        const position = bubblePositions[idx];
        return (
          <motion.div
            key={`${src}-${idx}`}
            className="absolute"
            style={position}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 0.65, scale: 1, y: 0 }}
            transition={{ delay: idx * 0.15 }}
          >
            <motion.div
              animate={{ y: ["0%", "-10%", "0%"] }}
              transition={{ duration: 8 + idx, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/30 backdrop-blur-[6px] border border-white/40 shadow-lg shadow-slate-900/10 overflow-hidden"
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

