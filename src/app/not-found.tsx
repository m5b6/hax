"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(64,201,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(232,28,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,159,10,0.05),transparent_50%)]" />
      </div>

      <main className="w-full max-w-2xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            mass: 1,
          }}
          className="relative"
        >
          <div className="absolute -inset-[2px] rounded-[2.6rem] opacity-40">
            <div
              className="absolute inset-0 rounded-[2.6rem] blur-lg"
              style={{
                background:
                  "linear-gradient(135deg, rgba(64,201,255,0.3) 0%, rgba(232,28,255,0.3) 50%, rgba(255,159,10,0.3) 100%)",
              }}
            />
          </div>

          <div className="relative bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-8 sm:p-12 shadow-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.3,
                }}
                className="inline-block mb-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#40C9FF] via-[#E81CFF] to-[#FF9F0A] rounded-full blur-xl opacity-50" />
                  <div className="relative text-8xl sm:text-9xl font-bold bg-gradient-to-r from-[#40C9FF] via-[#E81CFF] to-[#FF9F0A] bg-clip-text text-transparent">
                    404
                  </div>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-2xl sm:text-3xl font-semibold text-white mb-4"
              >
                Página no encontrada
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-slate-400 text-lg mb-8 max-w-md mx-auto"
              >
                Lo sentimos, la página que buscas no existe o ha sido movida.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Link href="/">
                  <Button
                    className="group relative overflow-hidden bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-xl transition-all duration-300 backdrop-blur-sm"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Volver al inicio
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

