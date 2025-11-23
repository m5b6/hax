"use client";

import React from "react";
import { motion } from "framer-motion";
import { AoLogo } from "@/components/AoLogo";
import Image from "next/image";

export function Slide05WhyMeta() {
    return (
        <div className="w-full h-full bg-black flex items-center justify-center p-16 relative">
            {/* Logo fixed bottom right */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.8, ease: "backOut" }}
                className="fixed bottom-12 right-12 z-10"
            >
                <AoLogo size={100} animate={true} />
            </motion.div>

            <div className="w-full max-w-4xl text-center">
                {/* Question */}
                <motion.h1
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-[56px] font-bold text-white/40 leading-none mb-12 tracking-tight font-serif"
                >
                    ¿Por qué?
                </motion.h1>

                {/* Meta Logo - Smaller */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                    className="mb-10 flex justify-center"
                >
                    <div className="relative w-56 h-56">
                        <Image
                            src="/slides/meta-logo.webp"
                            alt="Meta logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </motion.div>

                {/* Main Statement */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
                    className="mb-8"
                >
                    <p className="text-[52px] font-bold text-white leading-tight tracking-tight font-serif">
                        Un mundo legacy
                    </p>
                </motion.div>

                {/* Description */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.1, ease: "easeOut" }}
                    className="space-y-2"
                >
                    <p className="text-[26px] font-normal text-white/60 leading-relaxed tracking-tight font-serif">
                        Herramientas complejas
                    </p>
                    <p className="text-[26px] font-normal text-white/60 leading-relaxed tracking-tight font-serif">
                        Procesos lentos
                    </p>
                    <p className="text-[26px] font-normal text-white/60 leading-relaxed tracking-tight font-serif">
                        Curva de aprendizaje infinita
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
