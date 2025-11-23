import { mastra } from "@/mastra";
import { NextRequest } from "next/server";
import { z } from "zod";
import { WizardData } from "@/types/wizard";

export const runtime = "nodejs";

const mcqOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  description: z.string(),
  sensation: z.string(),
  usefulFor: z.string(),
  howItLooks: z.string(),
  whyItWorks: z.string(),
  color: z.string(),
  icon: z.string(),
});

const mcqSchema = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(mcqOptionSchema).length(3),
});

const mcqsResponseSchema = z.object({
  questions: z.array(mcqSchema).length(3),
});

export async function POST(req: NextRequest) {
  try {
    const { wizardData } = await req.json();

    if (!wizardData) {
      return new Response(
        JSON.stringify({ error: "wizardData is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate wizardData structure
    const validatedData = wizardData as WizardData;

    const agent = mastra.getAgent("mcqAgent");

    // Build context prompt from wizard data
    const contextParts: string[] = [];

    if (validatedData.inputs.identity) {
      contextParts.push(`IDENTIDAD DEL NEGOCIO: ${validatedData.inputs.identity}`);
    }

    if (validatedData.inputs.type) {
      contextParts.push(`TIPO: ${validatedData.inputs.type === "producto" ? "Producto" : "Servicio"}`);
    }

    if (validatedData.inputs.productName) {
      contextParts.push(`NOMBRE DEL PRODUCTO/SERVICIO: ${validatedData.inputs.productName}`);
    }

    if (validatedData.agentResponses.urlAnalyses && validatedData.agentResponses.urlAnalyses.length > 0) {
      contextParts.push("\n=== ANÁLISIS DE URLs ===");
      validatedData.agentResponses.urlAnalyses.forEach((analysis, idx) => {
        contextParts.push(`\nURL ${idx + 1}: ${analysis.url}`);
        if (analysis.summary) {
          contextParts.push(`Resumen: ${analysis.summary}`);
        }
        if (analysis.insights && analysis.insights.length > 0) {
          contextParts.push("Insights:");
          analysis.insights.forEach((insight) => {
            contextParts.push(`- [${insight.type}] ${insight.label}: ${insight.value}`);
          });
        }
        if (analysis.concreteProducts && analysis.concreteProducts.length > 0) {
          contextParts.push(`Productos: ${analysis.concreteProducts.join(", ")}`);
        }
        if (analysis.concreteServices && analysis.concreteServices.length > 0) {
          contextParts.push(`Servicios: ${analysis.concreteServices.join(", ")}`);
        }
        if (analysis.primaryColor || analysis.secondaryColor) {
          contextParts.push(`Colores de marca: ${analysis.primaryColor || "N/A"}, ${analysis.secondaryColor || "N/A"}`);
        }
      });
    }

    const contextPrompt = contextParts.join("\n");

    const prompt = `Genera las 3 preguntas MCQ contextualizadas basándote en la siguiente información del negocio:

${contextPrompt}

⚠️ IMPORTANTE: Cada header/título (campo "text") debe ser ÚNICO y específico para este negocio. NUNCA uses headers genéricos como "Digital Pro", "Cálido Humano", "Acción Ya", "Moderno", "Natural", "Directo", "Rápido", "Medio", "Lento", "Alta", "Media", "Cero". 

En su lugar, crea headers contextuales que reflejen la identidad única de este negocio específico. Analiza su tipo de negocio, productos/servicios, público objetivo y estilo de comunicación para generar headers que realmente capturen su esencia.

Usa toda esta información para hacer las preguntas y opciones específicas y relevantes para este negocio en particular. Cada opción debe explicar por qué funciona para SU negocio específico.`;

    const result = await agent.generate(prompt, {
      output: mcqsResponseSchema,
    });

    const parsedOutput = typeof result.text === 'string'
      ? JSON.parse(result.text)
      : result.text;

    return new Response(
      JSON.stringify(parsedOutput),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating MCQs:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

