"use client";

import React from "react";
import { motion } from "framer-motion";
import { AoLogo } from "@/components/AoLogo";
import Image from "next/image";

export function Slide06Adsombroso() {
    const points = [
        { text: "Entiende quién eres", delay: 0.5 },
        { text: "Entiende qué haces", delay: 0.7 },
        { text: "Entiende a tu competencia", delay: 0.9 },
        { text: "¡Entiende las reglas de META!", delay: 1.1 },
    ];

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

            <div className="w-full max-w-7xl h-full flex items-center gap-20">
                {/* Left side - Content */}
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="flex-1"
                >
                    {/* Title */}
                    <motion.h1
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                        className="text-[80px] font-bold text-white leading-none mb-16 tracking-tight font-serif"
                    >
                        <span className="font-black">Ads</span>ombroso
                    </motion.h1>

                    {/* Points List */}
                    <div className="space-y-6">
                        {points.map((point, index) => (
                            <motion.div
                                key={index}
                                initial={{ x: -30, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.7, delay: point.delay, ease: "easeOut" }}
                                className="flex items-center gap-6"
                            >
                                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#40C9FF] via-[#E81CFF] to-[#FF9F0A] flex-shrink-0"></div>
                                <p className="text-[40px] font-normal text-white leading-tight tracking-tight font-serif">
                                    {point.text}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Right side - Image */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                    className="flex-shrink-0"
                >
                    <div className="relative w-[500px] h-[500px] rounded-3xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.6),0_0_80px_rgba(64,201,255,0.15),0_0_120px_rgba(232,28,255,0.1)]">
                        <Image
                            src="/slides/adsombroso.png"
                            alt="Adsombroso"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
