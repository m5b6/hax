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

            <div className="w-full max-w-7xl">
                {/* Title */}
                <motion.h1
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-[56px] font-bold text-white leading-none mb-12 tracking-tight font-serif text-center"
                >
                    Big Problem
                </motion.h1>

                {/* Three Columns Grid */}
                <div className="grid grid-cols-3 gap-16">
                    {/* Column 1 - Mercado */}
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                        className="flex flex-col items-center text-center space-y-8"
                    >
                        <span className="text-white/50 text-2xl font-normal font-serif">Mercado de Publicidad Digital</span>
                        <div className="space-y-8 w-full">
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-white/30 text-sm font-normal">Gasto Global</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-white/60 text-3xl font-normal">$</span>
                                    <span className="text-white text-8xl font-bold font-serif">1</span>
                                    <span className="text-white text-4xl font-bold font-serif">TN</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-white/30 text-sm font-normal">DPP</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-white/60 text-3xl font-normal">$</span>
                                    <span className="text-white text-8xl font-bold font-serif">750</span>
                                    <span className="text-white text-4xl font-bold font-serif">BN</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-white/30 text-sm font-normal">Meta</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-white/60 text-3xl font-normal">$</span>
                                    <span className="text-white text-8xl font-bold font-serif">164</span>
                                    <span className="text-white text-4xl font-bold font-serif">BN</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Column 2 - Agencias */}
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                        className="flex flex-col items-center justify-center text-center space-y-8"
                    >
                        <span className="text-white/50 text-2xl font-normal font-serif">Agencias e Influencers</span>
                        <div className="flex items-baseline justify-center gap-3">
                            <span className="text-white/60 text-4xl font-normal">$</span>
                            <span className="text-white text-9xl font-bold font-serif">84</span>
                            <span className="text-white text-5xl font-bold font-serif">BN</span>
                        </div>
                        <span className="text-white/40 text-2xl font-normal">(TAM)</span>
                    </motion.div>

                    {/* Column 3 - Non Working Media */}
                    <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
                        className="flex flex-col items-center text-center space-y-8"
                    >
                        <span className="text-white/50 text-2xl font-normal font-serif">Dinero que NO llega a tu audiencia</span>
                        <div className="flex items-center justify-center gap-8">
                            <div className="flex items-baseline gap-2">
                                <span className="text-white/60 text-3xl font-normal">$</span>
                                <span className="text-white text-8xl font-bold font-serif">100</span>
                            </div>
                            <span className="text-white/40 text-6xl font-light">→</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-white/60 text-3xl font-normal">$</span>
                                <span className="text-white text-8xl font-bold font-serif">44</span>
                            </div>
                        </div>
                        <span className="text-white/30 text-base font-normal italic">Por cada $100 invertidos,<br />solo $44 llegan</span>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
