import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Check, ArrowLeft, Target, Users, MessageSquare, Zap, TrendingUp, Heart, Globe, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StepStrategyProps {
  onNext: (data: any) => void;
  previousData: any;
}

// Helper to get icon component
const getIconForOption = (id: string) => {
  switch (id) {
    case "conversion": return TrendingUp;
    case "awareness": return Globe;
    case "loyalty": return Heart;
    case "early_adopters": return Zap;
    case "value_seekers": return Target;
    case "luxury": return Sparkles;
    case "bold": return Zap;
    case "empathetic": return Heart;
    case "educational": return Lightbulb;
    default: return Check;
  }
};

// Mock data simulating AI generated questions based on previous context
const MOCK_AI_QUESTIONS = [
  {
    id: "focus",
    question: "¿Cuál es el enfoque principal?",
    reasoning: "Analizando tu marca, veo estas oportunidades estratégicas.",
    options: [
      { id: "conversion", text: "Venta directa / Conversión", description: "Maximizar ROAS inmediato y generar transacciones." },
      { id: "awareness", text: "Reconocimiento de Marca", description: "Llegar a nuevas audiencias y aumentar la visibilidad." },
      { id: "loyalty", text: "Fidelización", description: "Reactivar clientes actuales y fomentar recompra." }
    ]
  },
  {
    id: "audience_segment",
    question: "¿A qué segmento atacaremos?",
    reasoning: "Tus productos resuenan fuerte con estos grupos.",
    options: [
      { id: "early_adopters", text: "Early Adopters", description: "Innovadores que buscan lo nuevo y marcan tendencia." },
      { id: "value_seekers", text: "Buscadores de Valor", description: "Clientes sensibles a la relación precio-calidad." },
      { id: "luxury", text: "Premium / Lujo", description: "Buscan exclusividad, estatus y alta calidad." }
    ]
  },
  {
    id: "tone",
    question: "¿Qué tono prefieres?",
    reasoning: "Para diferenciarte, sugiero estos tonos de voz.",
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
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [historyStack, setHistoryStack] = useState<{id: string, icon: any}[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const currentQuestion = MOCK_AI_QUESTIONS[currentQuestionIndex];
  const totalQuestions = MOCK_AI_QUESTIONS.length;
  
  const handleSelect = (optionId: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: optionId };
    setAnswers(newAnswers);
    
    const Icon = getIconForOption(optionId);
    const newStack = historyStack.filter((_, i) => i < currentQuestionIndex);
    newStack.push({ id: optionId, icon: Icon });
    setHistoryStack(newStack);
    
    setTimeout(() => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    }, 450);
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
        setHistoryStack(prev => prev.slice(0, -1));
    }
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6 min-h-[300px]">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full bg-blue-100 blur-xl opacity-50"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-blue-100"
            style={{ borderTopColor: '#3B82F6', borderRightColor: '#8B5CF6' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <Sparkles className="w-8 h-8 text-blue-500 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <motion.p 
            className="text-lg font-medium text-slate-900"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            Analizando estrategia
          </motion.p>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">
            Conectando puntos clave de {previousData.name}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
        {/* Header with Progress */}
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Paso {currentQuestionIndex + 1} de {totalQuestions}
                </span>
                <div className="h-1 w-16 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* History Stack */}
            <div className="flex -space-x-2">
                <AnimatePresence>
                    {historyStack.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0, x: 10 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            className="w-8 h-8 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-600 z-10"
                        >
                            <item.icon className="w-3.5 h-3.5" />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3, ease: "circOut" }}
          className="space-y-6"
        >
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
              {currentQuestion.question}
            </h2>
            
            <div className="flex items-start gap-2 text-slate-500 text-sm leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-100/50">
                <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p><span className="font-medium text-slate-700">Insight:</span> {currentQuestion.reasoning}</p>
            </div>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = answers[currentQuestion.id] === option.id;
              const OptionIcon = getIconForOption(option.id);
              
              return (
                <motion.button
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    w-full p-4 rounded-2xl border text-left transition-all duration-200 group relative
                    ${isSelected 
                        ? "bg-blue-50/80 border-blue-500/30 shadow-sm" 
                        : "bg-white border-slate-200/60 hover:border-blue-200 hover:bg-slate-50/50 hover:shadow-sm"
                    }
                  `}
                >
                    <div className="flex items-start gap-4">
                        <div className={`
                            w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors
                            ${isSelected ? "bg-blue-500 text-white shadow-blue-500/20 shadow-lg" : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-blue-500 group-hover:shadow-sm"}
                        `}>
                            <OptionIcon className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className={`font-medium text-base mb-0.5 ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                                {option.text}
                            </div>
                            <div className={`text-sm leading-snug ${isSelected ? 'text-blue-700/80' : 'text-slate-500'}`}>
                                {option.description}
                            </div>
                        </div>

                        {isSelected && (
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shrink-0 mt-1"
                            >
                                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            </motion.div>
                        )}
                    </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="pt-8 flex justify-between items-center">
        <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentQuestionIndex === 0}
            className={`
                text-slate-400 hover:text-slate-600 px-0 -ml-2
                ${currentQuestionIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}
            `}
        >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Atrás
        </Button>

        {currentQuestionIndex === totalQuestions - 1 && answers[currentQuestion.id] && (
             <Button
             size="lg"
             onClick={handleNext}
             className="glass-button-primary rounded-full px-8 font-medium bg-slate-900 text-white hover:bg-slate-800 shadow-lg"
           >
             Finalizar <ArrowRight className="ml-2 w-4 h-4" />
           </Button>
        )}
      </div>
    </div>
  );
};
