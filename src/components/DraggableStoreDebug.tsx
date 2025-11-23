"use client";

import { motion } from "framer-motion";
import { useWizardStore } from "@/contexts/WizardStore";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react";

export function DraggableStoreDebug() {
  const store = useWizardStore();
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [copied, setCopied] = useState(false);

  // Load position from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("debug-panel-position");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPosition(parsed);
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  // Save position to localStorage
  const handleDragEnd = (event: any, info: any) => {
    const newPosition = {
      x: info.point.x,
      y: info.point.y,
    };
    setPosition(newPosition);
    localStorage.setItem("debug-panel-position", JSON.stringify(newPosition));
  };

  const formatValue = (value: any, depth = 0): string => {
    if (value === null || value === undefined) return "null";
    if (typeof value === "string") return `"${value}"`;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    if (Array.isArray(value)) {
      if (value.length === 0) return "[]";
      if (depth > 2) return `[${value.length} items]`;
      return `[\n${value.map((item, i) => `  ${i}: ${formatValue(item, depth + 1)}`).join(",\n")}\n]`;
    }
    if (typeof value === "object") {
      if (depth > 2) return "{...}";
      const entries = Object.entries(value);
      if (entries.length === 0) return "{}";
      return `{\n${entries.map(([k, v]) => `  ${k}: ${formatValue(v, depth + 1)}`).join(",\n")}\n}`;
    }
    return String(value);
  };

  const handleCopy = async () => {
    const storeData = {
      inputs: store.getAllInputs(),
      agentResponses: store.getAllAgentResponses(),
      metadata: store.data.metadata,
    };
    
    const jsonString = JSON.stringify(storeData, null, 2);
    
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      initial={{ x: position.x, y: position.y }}
      animate={{ x: position.x, y: position.y }}
      className="fixed z-[9999] pointer-events-auto"
      style={{ top: 0, left: 0, display: 'none' }}
    >
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden w-[400px] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 cursor-grab active:cursor-grabbing">
          <h3 className="text-sm font-semibold text-white/90">Store Debug</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
              title="Copy store data to clipboard"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
            >
              {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-y-auto flex-1"
          >
            <div className="p-4 space-y-4 text-xs font-mono">
              {/* Inputs Section */}
              <div>
                <h4 className="text-white/80 font-semibold mb-2 pb-1 border-b border-white/10">
                  Inputs
                </h4>
                <pre className="text-white/60 whitespace-pre-wrap break-words">
                  {formatValue(store.getAllInputs())}
                </pre>
              </div>

              {/* Agent Responses Section */}
              <div>
                <h4 className="text-white/80 font-semibold mb-2 pb-1 border-b border-white/10">
                  Agent Responses
                </h4>
                <pre className="text-white/60 whitespace-pre-wrap break-words">
                  {formatValue(store.getAllAgentResponses())}
                </pre>
              </div>

              {/* Metadata Section */}
              <div>
                <h4 className="text-white/80 font-semibold mb-2 pb-1 border-b border-white/10">
                  Metadata
                </h4>
                <pre className="text-white/60 whitespace-pre-wrap break-words">
                  {formatValue(store.data.metadata)}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

