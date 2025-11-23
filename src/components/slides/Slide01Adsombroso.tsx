"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { AoLogo } from "@/components/AoLogo";

export function Slide01Adsombroso() {
    return (
        <div className="w-full h-full bg-black flex items-center justify-center p-16 relative">
            {/* Logo fixed bottom right */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.2, ease: "backOut" }}
                className="fixed bottom-12 right-12 z-10"
            >
                <AoLogo size={100} animate={true} />
            </motion.div>

            <div className="w-full max-w-7xl h-full flex items-center gap-20">
                {/* Left side - Image */}
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="flex-shrink-0"
                >
                    <div className="relative w-[500px] h-[500px] rounded-3xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.6),0_0_80px_rgba(64,201,255,0.15),0_0_120px_rgba(232,28,255,0.1)]">
                        <Image
                            src="/slides/slide-1-adsombroso.png"
                            alt="Frustrated people with Meta ads"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                </motion.div>

                {/* Right side - Text content */}
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                    className="flex-1 flex flex-col justify-center"
                >
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="text-[96px] font-bold text-white leading-none mb-8 tracking-tight font-serif"
                    >
                        <span className="font-black">ADS</span>OMBROSO!
                    </motion.h1>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.7 }}
                        className="text-[40px] font-normal text-white/80 leading-relaxed tracking-tight font-serif max-w-2xl"
                    >
                        Hacemos que las campañas trabajen por ti y no tú por ellas
                    </motion.p>
                </motion.div>
            </div>
        </div>
    );
}
