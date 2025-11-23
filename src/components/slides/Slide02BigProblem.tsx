"use client";

import React from "react";
import { motion } from "framer-motion";
import { AoLogo } from "@/components/AoLogo";

export function Slide02BigProblem() {
    return (
        <div className="w-full h-full bg-black flex items-center justify-center p-16 relative">
            {/* Logo fixed bottom right */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 2, ease: "backOut" }}
                className="fixed bottom-12 right-12 z-10"
            >
                <AoLogo size={100} animate={true} />
            </motion.div>

            <div className="w-full max-w-6xl">
                {/* Title */}
                <motion.h1
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-[64px] font-bold text-white leading-none mb-24 tracking-tight font-serif"
                >
                    Big Problem
                </motion.h1>

                {/* Stats Grid - More Spaced and Elegant */}
                <div className="space-y-16">
                    {/* Mercado Row */}
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                        className="flex items-baseline gap-12"
                    >
                        <span className="text-white/50 text-3xl font-normal font-serif min-w-[280px]">Mercado</span>
                        <div className="flex items-baseline gap-16">
                            <div className="flex items-baseline gap-4">
                                <span className="text-white/60 text-xl font-normal">Gasto</span>
                                <span className="text-white text-7xl font-bold font-serif">1TN</span>
                            </div>
                            <div className="flex items-baseline gap-4">
                                <span className="text-white/60 text-xl font-normal">DPP</span>
                                <span className="text-white text-7xl font-bold font-serif">750BN</span>
                            </div>
                            <div className="flex items-baseline gap-4">
                                <span className="text-white/60 text-xl font-normal">Meta</span>
                                <span className="text-white text-7xl font-bold font-serif">164BN</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Agencias Row */}
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                        className="flex items-baseline gap-12"
                    >
                        <span className="text-white/50 text-3xl font-normal font-serif min-w-[280px]">Agencias e Influencers</span>
                        <span className="text-white text-8xl font-bold font-serif">84BN</span>
                        <span className="text-white/40 text-2xl font-normal">(TAM)</span>
                    </motion.div>

                    {/* Non Working Media Row */}
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
                        className="flex items-baseline gap-12"
                    >
                        <span className="text-white/50 text-3xl font-normal font-serif min-w-[280px]">Non Working Media</span>
                        <div className="flex items-center gap-8">
                            <span className="text-white text-8xl font-bold font-serif">100</span>
                            <span className="text-white/40 text-6xl font-light">→</span>
                            <span className="text-white text-8xl font-bold font-serif">44</span>
                            <span className="text-white/60 text-3xl font-normal">USD</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
