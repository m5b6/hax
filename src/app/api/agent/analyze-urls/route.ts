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
    
    console.log('[API] Tool results count:', toolResults.length);
    console.log('[API] Full result structure:', JSON.stringify(result, null, 2).substring(0, 500));
    
    for (const toolResult of toolResults) {
      let resultObj: any = null;
      
      if (toolResult.result) {
        if (typeof toolResult.result === 'string') {
          try {
            resultObj = JSON.parse(toolResult.result);
          } catch {
            resultObj = toolResult.result;
          }
        } else if (typeof toolResult.result === 'object') {
          resultObj = toolResult.result;
        }
      }
      
      if (!resultObj && toolResult.output) {
        resultObj = typeof toolResult.output === 'string' ? JSON.parse(toolResult.output) : toolResult.output;
      }
      
      if (!resultObj && typeof toolResult === 'object' && 'images' in toolResult) {
        resultObj = toolResult;
      }
      
      if (resultObj) {
        console.log('[API] Tool result keys:', Object.keys(resultObj));
        console.log('[API] Images in tool result:', Array.isArray(resultObj.images) ? resultObj.images.length : 'not an array', typeof resultObj.images);
        
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
        if (Array.isArray(resultObj.images) && resultObj.images.length > 0) {
          console.log('[API] Adding images:', resultObj.images.length);
          images = images.concat(resultObj.images.filter((img: any) => typeof img === 'string' && img.trim().length > 0));
        }
      }
    }
    
    console.log('[API] Final images count:', images.length);

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

