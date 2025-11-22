import { mastra } from "@/mastra";
import { NextRequest } from "next/server";
import { z } from "zod";

const analysisSchema = z.object({
  insights: z.array(z.object({
    type: z.enum([
      "style",
      "info",
      "products",
      "services",
      "target_audience",
      "tone",
      "pricing",
      "features",
      "integrations",
      "tech_stack"
    ]),
    label: z.string(),
    value: z.string(),
    confidence: z.enum(["high", "medium", "low"]),
  })).max(10),
  summary: z.string(),
  concreteProducts: z.array(z.string()).max(10),
  concreteServices: z.array(z.string()).max(10),
  primaryColor: z.string().nullable(),
  secondaryColor: z.string().nullable(),
  brandLogoUrl: z.string().nullable(),
  images: z.array(z.string()).max(50).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { urls } = await req.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return new Response(
        JSON.stringify({ error: "URLs array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const validUrls = urls.filter((url: string) => url && url.trim() !== "");

    if (validUrls.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid URLs provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const agent = mastra.getAgent("urlAnalyzerAgent");

    const prompt = `Analiza la siguiente URL y extrae insights estructurados: ${validUrls[0]}

Usa el urlReaderTool para leer la URL y luego proporciona insights categorizados.`;

    const result = await agent.generate(prompt, {
      output: analysisSchema,
    });

    const parsedOutput = typeof result.text === 'string' 
      ? JSON.parse(result.text) 
      : result.text;

    const toolResults = result.toolResults || [];
    let colors: string[] = [];
    let images: string[] = [];
    let primaryColor: string | null = parsedOutput.primaryColor ?? null;
    let secondaryColor: string | null = parsedOutput.secondaryColor ?? null;
    let brandLogoUrl: string | null = parsedOutput.brandLogoUrl ?? null;
    
    for (const toolResult of toolResults) {
      if (toolResult.result && typeof toolResult.result === 'object') {
        const resultObj = toolResult.result as any;
        const extractedColors = resultObj.colors;
        if (Array.isArray(extractedColors) && extractedColors.length > 0) {
          colors = extractedColors;
        }
        if (!primaryColor && typeof resultObj.primaryColor === 'string') {
          primaryColor = resultObj.primaryColor;
        }
        if (!secondaryColor && typeof resultObj.secondaryColor === 'string') {
          secondaryColor = resultObj.secondaryColor;
        }
        if (!brandLogoUrl && typeof resultObj.logoUrl === 'string') {
          brandLogoUrl = resultObj.logoUrl;
        }
        if (Array.isArray(resultObj.images)) {
          images = images.concat(resultObj.images);
        }
      }
    }

    if (!primaryColor && colors.length > 0) {
      primaryColor = colors[0];
    }
    if (!secondaryColor && colors.length > 1) {
      secondaryColor = colors[1];
    }

    return new Response(
      JSON.stringify({
        ...parsedOutput,
        colors: colors.slice(0, 2),
        primaryColor,
        secondaryColor,
        brandLogoUrl,
        images: Array.from(new Set(images)).slice(0, 12),
        concreteProducts: parsedOutput.concreteProducts || [],
        concreteServices: parsedOutput.concreteServices || [],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error analyzing URLs:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

