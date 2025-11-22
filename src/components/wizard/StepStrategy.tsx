import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface StepStrategyProps {
  onNext: (data: any) => void;
  previousData: any;
}

const QUESTIONS = [
  {
    id: "audience",
    question: "¿A quién quieres vender?",
    options: ["Mujeres sobre 50 años", "Jóvenes en Santiago", "Gente deportista"],
  },
  {
    id: "location",
    question: "¿Dónde quieres vender?",
    options: ["Santiago", "Rancagua", "Online / Todo Chile"],
  },
  {
    id: "goal",
    question: "¿Cuál es el objetivo principal?",
    options: ["Más ventas", "Más seguidores", "Reconocimiento de marca"],
  },
];

export const StepStrategy = ({ onNext, previousData }: StepStrategyProps) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSelect = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const isComplete = QUESTIONS.every((q) => answers[q.id]);

  const handleNext = () => {
    if (isComplete) {
      onNext({ ...previousData, strategy: answers });
    }
  };

  return (
    <div className="space-y-12">
      <div className="space-y-10">
        {QUESTIONS.map((q, index) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }}
            className="space-y-5"
          >
            <h3 className="text-lg font-medium text-slate-800">{q.question}</h3>
            <div className="flex flex-wrap gap-3">
              {q.options.map((option) => {
                const isSelected = answers[q.id] === option;
                return (
                  <motion.button
                    key={option}
                    onClick={() => handleSelect(q.id, option)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className={`px-6 py-4 rounded-full text-[15px] font-medium transition-all duration-200 border relative overflow-hidden ${
                      isSelected
                        ? "text-white border-transparent"
                        : "bg-white text-slate-600 border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 hover:text-slate-800"
                    }`}
                    style={
                      isSelected
                        ? {
                            background: 'linear-gradient(135deg, #40C9FF 0%, #007AFF 100%)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.08), 0 4px 8px rgba(0,123,255,0.15), inset 0 1px 0 rgba(255,255,255,0.2)'
                          }
                        : {
                            boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.6)'
                          }
                    }
                  >
                    <span className="relative z-10">{option}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="pt-8 flex justify-end">
        <Button
          size="lg"
          onClick={handleNext}
          disabled={!isComplete}
          className="glass-button-primary h-16 rounded-full px-10 text-[17px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Generar Campaña <ArrowRight className="ml-2.5 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
