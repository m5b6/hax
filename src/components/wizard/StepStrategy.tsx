import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Check, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StepStrategyProps {
  onNext: (data: any) => void;
  previousData: any;
}

// Mock data simulating AI generated questions based on previous context
const MOCK_AI_QUESTIONS = [
  {
    id: "focus",
    question: "¿Cuál es el enfoque principal de esta campaña?",
    reasoning: "Analizando tu marca, veo oportunidades en estos ángulos estratégicos.",
    options: [
      { id: "conversion", text: "Venta directa / Conversión", description: "Maximizar ROAS inmediato y generar transacciones." },
      { id: "awareness", text: "Reconocimiento de Marca", description: "Llegar a nuevas audiencias y aumentar la visibilidad." },
      { id: "loyalty", text: "Fidelización", description: "Reactivar clientes actuales y fomentar recompra." }
    ]
  },
  {
    id: "audience_segment",
    question: "¿A qué segmento específico atacaremos?",
    reasoning: "Tus productos tienen fuerte resonancia en estos grupos demográficos.",
    options: [
      { id: "early_adopters", text: "Early Adopters", description: "Innovadores que buscan lo nuevo y marcan tendencia." },
      { id: "value_seekers", text: "Buscadores de Valor", description: "Clientes sensibles a la relación precio-calidad." },
      { id: "luxury", text: "Premium / Lujo", description: "Buscan exclusividad, estatus y alta calidad." }
    ]
  },
  {
    id: "tone",
    question: "¿Qué tono debe tener la comunicación?",
    reasoning: "Para diferenciarte en el mercado actual, sugiero estos tonos de voz.",
    options: [
      { id: "bold", text: "Atrevido y desafiante", description: "Romper el molde, ser provocador y memorable." },
      { id: "empathetic", text: "Empático y cercano", description: "Conectar emocionalmente y generar confianza." },
      { id: "educational", text: "Educativo y experto", description: "Aportar valor y demostrar autoridad en el nicho." }
    ]
  }
];

export const StepStrategy = ({ onNext, previousData }: StepStrategyProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentQuestion = MOCK_AI_QUESTIONS[currentQuestionIndex];
  const totalQuestions = MOCK_AI_QUESTIONS.length;
  // Progress is calculated based on completed steps (index) out of total
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleSelect = (optionId: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      onNext({ ...previousData, strategy: answers });
    }
  };
  
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-10">
            <div className="flex justify-between text-xs font-medium text-slate-500 mb-3 px-1">
                <span>Progreso de estrategia</span>
                <span>Paso {currentQuestionIndex + 1} de {totalQuestions}</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                    className="h-full bg-gradient-to-r from-[#40C9FF] to-[#007AFF]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />
            </div>
        </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="space-y-5">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
              {currentQuestion.question}
            </h2>
            
            <div className="flex items-start gap-3 bg-blue-50/60 p-4 rounded-2xl border border-blue-100/50 text-slate-600 text-sm sm:text-base leading-relaxed backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p><span className="font-medium text-blue-700">Insight de IA:</span> {currentQuestion.reasoning}</p>
            </div>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = answers[currentQuestion.id] === option.id;
              return (
                <motion.button
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 group relative overflow-hidden ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/40 shadow-sm"
                      : "border-slate-100 hover:border-blue-200 hover:bg-slate-50 bg-white/50"
                  }`}
                >
                    <div className="flex justify-between items-start relative z-10 gap-4">
                        <div className="flex-1">
                            <div className={`font-semibold text-base sm:text-lg mb-1.5 ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                                {option.text}
                            </div>
                            <div className={`text-sm leading-relaxed ${isSelected ? 'text-blue-600/90' : 'text-slate-500'}`}>
                                {option.description}
                            </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 transition-colors ${
                            isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-200 text-transparent group-hover:border-blue-300'
                        }`}>
                            <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        </div>
                    </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="pt-8 flex justify-between items-center mt-4">
        <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentQuestionIndex === 0}
            className={`text-slate-400 hover:text-slate-600 hover:bg-slate-100 px-4 -ml-4 ${currentQuestionIndex === 0 ? 'invisible' : ''}`}
        >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
        </Button>

        <Button
          size="lg"
          onClick={handleNext}
          disabled={!answers[currentQuestion.id]}
          className="glass-button-primary h-14 rounded-full px-8 text-[16px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
        >
          {currentQuestionIndex === totalQuestions - 1 ? (
            <>Finalizar Estrategia <ArrowRight className="ml-2 w-4 h-4" /></>
          ) : (
            <>Siguiente <ArrowRight className="ml-2 w-4 h-4" /></>
          )}
        </Button>
      </div>
    </div>
  );
};
