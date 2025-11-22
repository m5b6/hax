import { mastra } from "@/agents";

export const runtime = "nodejs";

type WorkflowStep =
    | { step: "image-prompt"; data: string }
    | { step: "image-url"; data: string }
    | { step: "video-prompt"; data: string }
    | { step: "error"; data: string };

/**
 * Workflow completo para generación de video:
 * 1. Genera prompt de imagen
 * 2. El usuario genera la imagen (o se puede integrar con un servicio)
 * 3. Genera prompt de video usando la imagen generada
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { contentMatrix, designBrief, imageUrl } = body;

        // Validar que al menos contentMatrix esté presente
        if (!contentMatrix) {
            return new Response(
                JSON.stringify({ error: "contentMatrix es requerido" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Preparar el encoder para streaming
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    // PASO 1: Generar prompt de imagen
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({
                                step: "image-prompt",
                                status: "generating"
                            })}\n\n`
                        )
                    );

                    const imagePromptAgent = mastra.getAgent("imagePromptAgent");
                    if (!imagePromptAgent) {
                        throw new Error("Image prompt agent no encontrado");
                    }

                    let imagePromptContent = `MATRIZ DE CONTENIDO:\n${JSON.stringify(contentMatrix, null, 2)}`;
                    if (designBrief) {
                        imagePromptContent += `\n\nBRIEF DE DISEÑO:\n${JSON.stringify(designBrief, null, 2)}`;
                    }
                    imagePromptContent += `\n\nGenera una imagen base versátil que funcione para todo el video, considerando todas las fases de la matriz.`;

                    const imagePromptResult = await imagePromptAgent.generate(imagePromptContent);
                    const imagePrompt = imagePromptResult.text;

                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({
                                step: "image-prompt",
                                status: "complete",
                                data: imagePrompt
                            })}\n\n`
                        )
                    );

                    // PASO 2: Esperar o usar la imagen proporcionada
                    if (!imageUrl) {
                        // Si no hay imagen, indicar que el usuario debe generarla
                        controller.enqueue(
                            encoder.encode(
                                `data: ${JSON.stringify({
                                    step: "image-generation",
                                    status: "waiting",
                                    message: "Usa el prompt anterior para generar la imagen y luego envíala de vuelta"
                                })}\n\n`
                            )
                        );
                        controller.close();
                        return;
                    }

                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({
                                step: "image-url",
                                status: "received",
                                data: imageUrl
                            })}\n\n`
                        )
                    );

                    // PASO 3: Generar prompt de video con la imagen
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({
                                step: "video-prompt",
                                status: "generating"
                            })}\n\n`
                        )
                    );

                    const videoPromptAgent = mastra.getAgent("videoPromptAgent");
                    if (!videoPromptAgent) {
                        throw new Error("Video prompt agent no encontrado");
                    }

                    let videoPromptContent = `MATRIZ DE CONTENIDO:\n${JSON.stringify(contentMatrix, null, 2)}`;
                    if (designBrief) {
                        videoPromptContent += `\n\nBRIEF DE DISEÑO:\n${JSON.stringify(designBrief, null, 2)}`;
                    }
                    videoPromptContent += `\n\nIMAGEN DE ENTRADA:\nSe utilizará la siguiente imagen: ${imageUrl}`;
                    videoPromptContent += `\n\nAsegúrate de describir cómo esta imagen se integra visualmente en el video y cómo evoluciona a través de las diferentes fases.`;

                    const videoPromptResult = await videoPromptAgent.generate(videoPromptContent);
                    const videoPrompt = videoPromptResult.text;

                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({
                                step: "video-prompt",
                                status: "complete",
                                data: videoPrompt
                            })}\n\n`
                        )
                    );

                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({
                                step: "workflow",
                                status: "complete"
                            })}\n\n`
                        )
                    );

                    controller.close();
                } catch (error) {
                    console.error("Error en workflow:", error);
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({
                                step: "error",
                                status: "failed",
                                data: error instanceof Error ? error.message : String(error)
                            })}\n\n`
                        )
                    );
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });
    } catch (error) {
        console.error("Error en workflow de video:", error);
        return new Response(
            JSON.stringify({
                error: "Error en el workflow de generación de video",
                details: error instanceof Error ? error.message : String(error)
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
