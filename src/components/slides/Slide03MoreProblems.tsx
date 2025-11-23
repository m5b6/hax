"use client";

import React from "react";
import { motion } from "framer-motion";
import { AoLogo } from "@/components/AoLogo";

export function Slide03MoreProblems() {
    return (
        <div className="w-full h-full bg-black flex items-center justify-center p-16 relative">
            {/* Logo fixed bottom right */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.5, ease: "backOut" }}
                className="fixed bottom-12 right-12 z-10"
            >
                <AoLogo size={100} animate={true} />
            </motion.div>

            <div className="w-full max-w-5xl">
                {/* Title */}
                <motion.h1
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-[64px] font-bold text-white leading-none mb-32 tracking-tight font-serif"
                >
                    Más Problemas
                </motion.h1>

                {/* Problems List */}
                <div className="space-y-24">
                    {/* Problem 1 */}
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                        className="flex items-center gap-8"
                    >
                        <div className="w-2 h-2 rounded-full bg-white/40 flex-shrink-0"></div>
                        <p className="text-[56px] font-normal text-white leading-tight tracking-tight font-serif">
                            Generación de contenido
                            <span className="block text-white/50 mt-2">es mala</span>
                        </p>
                    </motion.div>

                    {/* Problem 2 */}
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
                        className="flex items-center gap-8"
                    >
                        <div className="w-2 h-2 rounded-full bg-white/40 flex-shrink-0"></div>
                        <p className="text-[56px] font-normal text-white leading-tight tracking-tight font-serif">
                            Administración de campañas
                            <span className="block text-white/50 mt-2">es mala</span>
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
