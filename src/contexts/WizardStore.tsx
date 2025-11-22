"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { WizardData, UserInputs, AgentResponse, URLAnalysis } from "@/types/wizard";

interface WizardStoreContextValue {
  // Read operations
  data: WizardData;
  getInput: <K extends keyof UserInputs>(key: K) => UserInputs[K] | undefined;
  getAgentResponse: <K extends keyof AgentResponse>(key: K) => AgentResponse[K] | undefined;
  getAllInputs: () => UserInputs;
  getAllAgentResponses: () => AgentResponse;
  
  // Insert/Update operations
  setInput: <K extends keyof UserInputs>(key: K, value: UserInputs[K]) => void;
  setInputs: (inputs: Partial<UserInputs>) => void;
  setAgentResponse: <K extends keyof AgentResponse>(key: K, value: AgentResponse[K]) => void;
  setAgentResponses: (responses: Partial<AgentResponse>) => void;
  setMetadata: (metadata: Partial<WizardData["metadata"]>) => void;
  
  // Specific helpers for common operations
  addURLAnalysis: (analysis: URLAnalysis) => void;
  updateURLAnalysis: (url: string, updates: Partial<URLAnalysis>) => void;
  removeURLAnalysis: (url: string) => void;
  
  // Reset
  reset: () => void;
  resetInputs: () => void;
  resetAgentResponses: () => void;
}

const WizardStoreContext = createContext<WizardStoreContextValue | undefined>(undefined);

const initialData: WizardData = {
  inputs: {},
  agentResponses: {},
  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentStep: 0,
  },
};

export function WizardStoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<WizardData>(initialData);

  // Read operations
  const getInput = useCallback(<K extends keyof UserInputs>(key: K): UserInputs[K] | undefined => {
    return data.inputs[key];
  }, [data.inputs]);

  const getAgentResponse = useCallback(<K extends keyof AgentResponse>(key: K): AgentResponse[K] | undefined => {
    return data.agentResponses[key];
  }, [data.agentResponses]);

  const getAllInputs = useCallback((): UserInputs => {
    return data.inputs;
  }, [data.inputs]);

  const getAllAgentResponses = useCallback((): AgentResponse => {
    return data.agentResponses;
  }, [data.agentResponses]);

  // Insert/Update operations
  const setInput = useCallback(<K extends keyof UserInputs>(key: K, value: UserInputs[K]): void => {
    setData((prev) => ({
      ...prev,
      inputs: {
        ...prev.inputs,
        [key]: value,
      },
      metadata: {
        ...prev.metadata,
        updatedAt: new Date().toISOString(),
      },
    }));
  }, []);

  const setInputs = useCallback((inputs: Partial<UserInputs>): void => {
    setData((prev) => ({
      ...prev,
      inputs: {
        ...prev.inputs,
        ...inputs,
      },
      metadata: {
        ...prev.metadata,
        updatedAt: new Date().toISOString(),
      },
    }));
  }, []);

  const setAgentResponse = useCallback(<K extends keyof AgentResponse>(key: K, value: AgentResponse[K]): void => {
    setData((prev) => ({
      ...prev,
      agentResponses: {
        ...prev.agentResponses,
        [key]: value,
      },
      metadata: {
        ...prev.metadata,
        updatedAt: new Date().toISOString(),
      },
    }));
  }, []);

  const setAgentResponses = useCallback((responses: Partial<AgentResponse>): void => {
    setData((prev) => ({
      ...prev,
      agentResponses: {
        ...prev.agentResponses,
        ...responses,
      },
      metadata: {
        ...prev.metadata,
        updatedAt: new Date().toISOString(),
      },
    }));
  }, []);

  // Specific helpers for URL analyses
  const addURLAnalysis = useCallback((analysis: URLAnalysis): void => {
    setData((prev) => {
      const existingAnalyses = prev.agentResponses.urlAnalyses || [];
      const updatedAnalyses = [...existingAnalyses, analysis];
      
      return {
        ...prev,
        agentResponses: {
          ...prev.agentResponses,
          urlAnalyses: updatedAnalyses,
        },
        metadata: {
          ...prev.metadata,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const updateURLAnalysis = useCallback((url: string, updates: Partial<URLAnalysis>): void => {
    setData((prev) => {
      const existingAnalyses = prev.agentResponses.urlAnalyses || [];
      const updatedAnalyses = existingAnalyses.map((analysis) =>
        analysis.url === url ? { ...analysis, ...updates } : analysis
      );
      
      return {
        ...prev,
        agentResponses: {
          ...prev.agentResponses,
          urlAnalyses: updatedAnalyses,
        },
        metadata: {
          ...prev.metadata,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const removeURLAnalysis = useCallback((url: string): void => {
    setData((prev) => {
      const existingAnalyses = prev.agentResponses.urlAnalyses || [];
      const updatedAnalyses = existingAnalyses.filter((analysis) => analysis.url !== url);
      
      return {
        ...prev,
        agentResponses: {
          ...prev.agentResponses,
          urlAnalyses: updatedAnalyses,
        },
        metadata: {
          ...prev.metadata,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  // Reset operations
  const reset = useCallback((): void => {
    setData(initialData);
  }, []);

  const resetInputs = useCallback((): void => {
    setData((prev) => ({
      ...prev,
      inputs: {},
      metadata: {
        ...prev.metadata,
        updatedAt: new Date().toISOString(),
      },
    }));
  }, []);

  const resetAgentResponses = useCallback((): void => {
    setData((prev) => ({
      ...prev,
      agentResponses: {},
      metadata: {
        ...prev.metadata,
        updatedAt: new Date().toISOString(),
      },
    }));
  }, []);

  const setMetadata = useCallback((metadata: Partial<WizardData["metadata"]>): void => {
    setData((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        ...metadata,
        updatedAt: new Date().toISOString(),
      },
    }));
  }, []);

  const value = useMemo(
    () => ({
      data,
      getInput,
      getAgentResponse,
      getAllInputs,
      getAllAgentResponses,
      setInput,
      setInputs,
      setAgentResponse,
      setAgentResponses,
      setMetadata,
      addURLAnalysis,
      updateURLAnalysis,
      removeURLAnalysis,
      reset,
      resetInputs,
      resetAgentResponses,
    }),
    [
      data,
      getInput,
      getAgentResponse,
      getAllInputs,
      getAllAgentResponses,
      setInput,
      setInputs,
      setAgentResponse,
      setAgentResponses,
      setMetadata,
      addURLAnalysis,
      updateURLAnalysis,
      removeURLAnalysis,
      reset,
      resetInputs,
      resetAgentResponses,
    ]
  );

  return (
    <WizardStoreContext.Provider value={value}>
      {children}
    </WizardStoreContext.Provider>
  );
}

export function useWizardStore() {
  const context = useContext(WizardStoreContext);
  if (context === undefined) {
    throw new Error("useWizardStore must be used within a WizardStoreProvider");
  }
  return context;
}

