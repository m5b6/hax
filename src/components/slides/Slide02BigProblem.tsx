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

            <div className="w-full max-w-7xl mx-auto text-center">
                {/* Title */}
                <motion.h1
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-[56px] font-bold text-white leading-none mb-20 tracking-tight font-serif"
                >
                    Big Problem
                </motion.h1>

                {/* Stats Grid - Full Width Centered */}
                <div className="space-y-16">
                    {/* Mercado Row */}
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                        className="space-y-6"
                    >
                        <span className="text-white/50 text-2xl font-normal font-serif block">Mercado de Publicidad Digital</span>
                        <div className="flex items-baseline justify-center gap-20">
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-white/30 text-sm font-normal">Gasto Global</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-white/60 text-2xl font-normal">$</span>
                                    <span className="text-white text-6xl font-bold font-serif">1</span>
                                    <span className="text-white text-3xl font-bold font-serif">TN</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-white/30 text-sm font-normal">DPP</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-white/60 text-2xl font-normal">$</span>
                                    <span className="text-white text-6xl font-bold font-serif">750</span>
                                    <span className="text-white text-3xl font-bold font-serif">BN</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-white/30 text-sm font-normal">Meta</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-white/60 text-2xl font-normal">$</span>
                                    <span className="text-white text-6xl font-bold font-serif">164</span>
                                    <span className="text-white text-3xl font-bold font-serif">BN</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Agencias Row */}
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                        className="space-y-6"
                    >
                        <span className="text-white/50 text-2xl font-normal font-serif block">Agencias e Influencers</span>
                        <div className="flex items-baseline justify-center gap-3">
                            <span className="text-white/60 text-2xl font-normal">$</span>
                            <span className="text-white text-7xl font-bold font-serif">84</span>
                            <span className="text-white text-3xl font-bold font-serif">BN</span>
                            <span className="text-white/40 text-2xl font-normal ml-2">(TAM)</span>
                        </div>
                    </motion.div>

                    {/* Non Working Media Row */}
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
                        className="space-y-6"
                    >
                        <span className="text-white/50 text-2xl font-normal font-serif block">Dinero que NO llega a tu audiencia</span>
                        <div className="flex items-center justify-center gap-8">
                            <div className="flex items-baseline gap-1">
                                <span className="text-white/60 text-2xl font-normal">$</span>
                                <span className="text-white text-7xl font-bold font-serif">100</span>
                            </div>
                            <span className="text-white/40 text-5xl font-light">→</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-white/60 text-2xl font-normal">$</span>
                                <span className="text-white text-7xl font-bold font-serif">44</span>
                            </div>
                        </div>
                        <span className="text-white/30 text-lg font-normal italic">Por cada $100 invertidos, solo $44 llegan</span>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
