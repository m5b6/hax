import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { WizardData } from "@/types/wizard";

const mcqOptionSchema = z.object({
  id: z.string().describe("ID único de la opción (ej: 'moderno', 'natural', 'directo')"),
  text: z.string().describe("Título corto de la opción (ej: 'Moderno', 'Natural', 'Directo')"),
  description: z.string().describe("Descripción contextualizada basada en el negocio del usuario"),
  sensation: z.string().describe("Sensación que transmite esta opción"),
  usefulFor: z.string().describe("Para qué tipo de negocios es útil"),
  howItLooks: z.string().describe("Cómo se ve visualmente"),
  whyItWorks: z.string().describe("Por qué funciona para este negocio específico"),
});

const mcqSchema = z.object({
  id: z.string().describe("ID único de la pregunta"),
  question: z.string().describe("Texto de la pregunta"),
  options: z.array(mcqOptionSchema).length(3).describe("Las 3 opciones de respuesta"),
});

const mcqsResponseSchema = z.object({
  questions: z.array(mcqSchema).length(3).describe("Las 3 preguntas MCQ generadas"),
});

export const mcqGeneratorTool = createTool({
  id: "mcq-generator",
  description: `Genera 3 preguntas de múltiple elección (MCQ) contextualizadas para el segundo paso del wizard.
  
Las preguntas son sobre preferencias visuales y creativas para videos/reels:
1. Estilo visual: Moderno / Natural / Directo
2. Ritmo visual: Rápido / Medio / Lento  
3. Presencia humana: Alta / Media / Cero

Cada pregunta debe estar contextualizada según:
- El tipo de negocio (identity)
- Los productos/servicios que vende
- El público objetivo detectado
- El tono y estilo de la marca
- Los insights extraídos de las URLs analizadas

Las opciones deben ser ricas y específicas, explicando por qué cada opción funciona para este negocio en particular.`,
  inputSchema: z.object({
    wizardData: z.custom<WizardData>().describe("Todos los datos del wizard store incluyendo inputs y agentResponses"),
  }),
  outputSchema: mcqsResponseSchema,
  execute: async ({ context }) => {
    // This tool is a placeholder - the actual generation happens in the agent
    // The agent will use this tool's schema to structure the output
    throw new Error("This tool should not be executed directly. Use the agent instead.");
  },
});

