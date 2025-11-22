import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Palette, Info, Package, Briefcase, Users, MessageCircle, DollarSign, Zap, Plug, Code } from "lucide-react";

type InsightType = "style" | "info" | "products" | "services" | "target_audience" | "tone" | "pricing" | "features" | "integrations" | "tech_stack";

interface Insight {
  type: InsightType;
  label: string;
  value: string;
  confidence?: "high" | "medium" | "low";
}

interface InsightsChipProps {
  insights: Insight[];
  url: string;
}

const insightIcons: Record<InsightType, React.ComponentType<any>> = {
  style: Palette,
  info: Info,
  products: Package,
  services: Briefcase,
  target_audience: Users,
  tone: MessageCircle,
  pricing: DollarSign,
  features: Zap,
  integrations: Plug,
  tech_stack: Code,
};

export const InsightsChip = ({ insights, url }: InsightsChipProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (insights.length === 0) return null;

  let displayUrl = url;
  try {
    displayUrl = new URL(url).hostname.replace('www.', '');
  } catch {
    displayUrl = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/50 transition-all text-xs font-medium text-slate-600 hover:text-slate-900"
      >
        <div className="flex items-center -space-x-1">
          {insights.slice(0, 3).map((insight, i) => {
            const Icon = insightIcons[insight.type];
            return (
              <div
                key={i}
                className="w-4 h-4 rounded-full bg-white border border-slate-200 flex items-center justify-center"
              >
                <Icon className="w-2.5 h-2.5 text-slate-600" />
              </div>
            );
          })}
        </div>
        <span>{displayUrl}</span>
        <span className="text-slate-400">·</span>
        <span>{insights.length}</span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 right-0 glass-panel rounded-xl p-3 shadow-xl z-50 min-w-[280px]"
          >
            <div className="space-y-2">
              {insights.map((insight, i) => {
                const Icon = insightIcons[insight.type];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-2 text-xs"
                  >
                    <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-700">{insight.label}</div>
                      <div className="text-slate-500 leading-snug">{insight.value}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

