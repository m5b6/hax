import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";

interface StepBrandProps {
  onNext: (data: any) => void;
  previousData: any;
}

const MOCK_PALETTES = [
  {
    name: "Clean & Minimal",
    colors: ["#F8FAFC", "#E2E8F0", "#94A3B8", "#475569"],
  },
  {
    name: "Warm & Inviting",
    colors: ["#FFFBEB", "#FEF3C7", "#F59E0B", "#B45309"],
  },
  {
    name: "Bold & Professional",
    colors: ["#EFF6FF", "#BFDBFE", "#3B82F6", "#1E40AF"],
  },
];

export const StepBrand = ({ onNext, previousData }: StepBrandProps) => {
  const [selectedPalette, setSelectedPalette] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    if (selectedPalette !== null) {
      onNext({
        ...previousData,
        brandColors: MOCK_PALETTES[selectedPalette].colors,
        brandStyle: MOCK_PALETTES[selectedPalette].name,
      });
    }
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-10">
        <div className="relative w-24 h-24">
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#40C9FF]/20 via-[#E81CFF]/20 to-[#FF9F0A]/20 blur-2xl"
            animate={{ 
              scale: [0.9, 1.1, 0.9], 
              opacity: [0.3, 0.5, 0.3],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <svg className="animate-spin w-full h-full text-slate-900" viewBox="0 0 24 24">
            <circle className="opacity-10" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <div className="text-center space-y-3">
          <p className="text-xl font-medium ai-text-gradient tracking-tight">
            Analizando identidad...
          </p>
          <p className="text-slate-400 text-[15px]">
            Extrayendo colores y estilo de {previousData.urls?.[0] || "tu marca"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {MOCK_PALETTES.map((palette, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 300, damping: 25 }}
            onClick={() => setSelectedPalette(index)}
            className={`clickable-card group relative p-6 rounded-[1.75rem] border transition-all duration-300 ${
              selectedPalette === index
                ? "bg-white border-blue-200 ring-4 ring-blue-50 scale-[1.02]"
                : "bg-slate-50/50 border-slate-100 hover:border-slate-200 hover:bg-white"
            }`}
          >
            <div className="space-y-5">
              <div className="flex gap-[-8px] justify-center">
                {palette.colors.map((color, i) => (
                  <motion.div
                    key={i}
                    className="w-12 h-12 rounded-full ring-4 ring-white z-10 first:ml-0 -ml-4"
                    style={{ 
                      backgroundColor: color,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.3)'
                    }}
                    whileHover={{ y: -4, scale: 1.1, zIndex: 20 }}
                  />
                ))}
              </div>
              <p className={`text-[15px] font-medium text-center transition-colors duration-300 ${
                selectedPalette === index ? "text-slate-900" : "text-slate-500 group-hover:text-slate-700"
              }`}>
                {palette.name}
              </p>
            </div>
            {selectedPalette === index && (
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="absolute -top-2 -right-2 bg-slate-900 text-white p-2 rounded-full"
                style={{
                  boxShadow: '0 4px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}
              >
                <Check className="w-4 h-4 stroke-[3px]" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      <div className="pt-6 flex justify-end">
        <Button
          size="lg"
          onClick={handleNext}
          disabled={selectedPalette === null}
          className="glass-button-primary h-16 rounded-full px-10 text-[17px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Confirmar Estilo <ArrowRight className="ml-2.5 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
