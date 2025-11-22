import { mastra } from "@/agents";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { contentMatrix, designBrief } = body;

        // Validar que al menos contentMatrix esté presente
        if (!contentMatrix) {
            return new Response(
                JSON.stringify({ error: "contentMatrix es requerido" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Construir el prompt base
        let prompt = `MATRIZ DE CONTENIDO:\n${JSON.stringify(contentMatrix, null, 2)}`;

        if (designBrief) {
            prompt += `\n\nBRIEF DE DISEÑO:\n${JSON.stringify(designBrief, null, 2)}`;
        }

        prompt += `\n\nGenera una imagen base versátil que funcione para todo el video, considerando todas las fases de la matriz.`;

        // Generar el prompt usando streaming
        const agent = mastra.getAgent("imagePromptAgent");

        if (!agent) {
            return new Response(
                JSON.stringify({ error: "Agente no encontrado" }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        const stream = await agent.stream(prompt, {
            format: "aisdk",
        });

        return stream.toTextStreamResponse();
    } catch (error) {
        console.error("Error en image-prompt agent:", error);
        return new Response(
            JSON.stringify({
                error: "Error al generar el prompt de imagen",
                details: error instanceof Error ? error.message : String(error)
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
