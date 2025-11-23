"use client";

import React from "react";
import { motion } from "framer-motion";
import { AoLogo } from "@/components/AoLogo";
import { User, Store, Briefcase, Building } from "lucide-react";

export function Slide04UniversalProblem() {
    const segments = [
        { icon: User, label: "Profesionales", delay: 0.3 },
        { icon: Store, label: "PYMEs", delay: 0.5 },
        { icon: Briefcase, label: "S&B", delay: 0.7 },
        { icon: Building, label: "Enterprise", delay: 0.9 },
    ];

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

            <div className="w-full max-w-6xl text-center">
                {/* Title */}
                <motion.h1
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-[64px] font-bold text-white leading-none mb-8 tracking-tight font-serif"
                >
                    Problema Universal
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    className="text-[32px] font-normal text-white/60 leading-relaxed mb-24 tracking-tight font-serif"
                >
                    Afecta a todos
                </motion.p>

                {/* Icons Grid */}
                <div className="grid grid-cols-4 gap-16 max-w-5xl mx-auto">
                    {segments.map((segment, index) => {
                        const Icon = segment.icon;
                        return (
                            <motion.div
                                key={segment.label}
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.7, delay: segment.delay, ease: "easeOut" }}
                                className="flex flex-col items-center gap-6"
                            >
                                {/* Icon Circle */}
                                <div className="w-32 h-32 rounded-full border-2 border-white/20 flex items-center justify-center">
                                    <Icon className="w-16 h-16 text-white" strokeWidth={1.5} />
                                </div>
                                {/* Label */}
                                <span className="text-2xl font-normal text-white tracking-tight font-serif">
                                    {segment.label}
                                </span>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
