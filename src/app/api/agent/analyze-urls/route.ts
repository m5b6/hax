import { mastra } from "@/agents";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { urls } = await req.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return new Response(
        JSON.stringify({ error: "URLs array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const validUrls = urls.filter((url) => url && url.trim() !== "");

    if (validUrls.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid URLs provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const agent = mastra.getAgent("urlAnalyzerAgent");

    const prompt = `Analiza las siguientes URLs y proporciona un resumen de lo que encuentres:

${validUrls.map((url, i) => `${i + 1}. ${url}`).join("\n")}

Para cada URL, identifica:
- Tipo de negocio o proyecto
- Productos/servicios principales
- Tono y estilo de comunicación
- Público objetivo aparente

Usa el urlReaderTool para leer cada URL.`;

    const stream = await agent.stream(prompt, {
      format: "aisdk",
    });

    return stream.toDataStreamResponse();
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

