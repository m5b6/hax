/**
 * Type definitions for wizard data structure
 */

export type ProductServiceType = "producto" | "servicio";

export type InsightType =
  | "style"
  | "info"
  | "products"
  | "services"
  | "target_audience"
  | "tone"
  | "pricing"
  | "features"
  | "integrations"
  | "tech_stack";

export interface Insight {
  type: InsightType;
  label: string;
  value: string;
  confidence?: "high" | "medium" | "low";
}

export interface URLAnalysis {
  url: string;
  insights: Insight[];
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  images?: string[];
  summary?: string;
  concreteProducts?: string[];
  concreteServices?: string[];
  colors?: string[];
}

export interface UserInputs {
  name?: string;
  identity?: string;
  urls?: string[];
  type?: ProductServiceType;
  productName?: string;
}

export interface AgentResponse {
  // URL Analysis responses
  urlAnalyses?: URLAnalysis[];
  
  // Strategy responses (from StepStrategy agent)
  strategyQuestions?: Array<{
    id: string;
    question: string;
    reasoning: string;
    options: Array<{
      id: string;
      text: string;
      description: string;
    }>;
  }>;
  strategyAnswers?: Record<string, string>;
  
  // Campaign generation responses (from final step agent)
  campaignCopy?: {
    titles?: string[];
    descriptions?: string[];
    hooks?: string[];
  };
  segmentation?: {
    location?: string;
    interests?: string[];
    age?: string;
    demographics?: Record<string, any>;
  };
  campaignParams?: {
    objective?: string;
    delivery?: string;
    budget?: string;
    [key: string]: any;
  };
  
  // Any other agent responses
  [key: string]: any;
}

export interface WizardData {
  // User inputs
  inputs: UserInputs;
  
  // Agent responses
  agentResponses: AgentResponse;
  
  // Metadata
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
    currentStep?: number;
    [key: string]: any;
  };
}

