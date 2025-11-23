"use client";

import React from "react";
import { motion } from "framer-motion";

interface AoLogoProps {
    size?: number;
    animate?: boolean;
    className?: string;
}

export function AoLogo({ size = 48, animate = true, className = "" }: AoLogoProps) {
    return (
        <div className={`relative ${className}`} style={{ width: size, height: size }}>
            <motion.div
                className="absolute -inset-1 rounded-full"
                style={{
                    background: "conic-gradient(from 0deg, #40C9FF, #E81CFF, #FF9F0A, #FFD60A, #40C9FF)",
                }}
                animate={animate ? { rotate: 360 } : {}}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
            <div className="relative w-full h-full rounded-full bg-black/80 backdrop-blur-md flex items-center justify-center">
                <span
                    className="text-white font-normal"
                    style={{
                        fontFamily: 'var(--font-instrument-serif), serif',
                        fontSize: `${size * 0.42}px`
                    }}
                >
                    Ao.
                </span>
            </div>
        </div>
    );
}
