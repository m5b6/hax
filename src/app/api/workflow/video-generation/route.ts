import { mastra } from "@/agents";
import { generateMultipleImages } from "@/lib/runway";

export const runtime = "nodejs";

type WorkflowStep =
    | { step: "image-prompt"; data: string }
    | { step: "image-url"; data: string }
    | { step: "video-prompt"; data: string }
    | { step: "error"; data: string };

/**
 * Workflow completo para generación de video:
 * 1. Genera 3 prompts de imagen con diferentes estilos
 * 2. Genera 3 imágenes usando Runway ML
 * 3. Usuario selecciona su imagen favorita
 * 4. Genera prompt de video usando la imagen seleccionada
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { contentMatrix, designBrief, selectedImageIndex } = body;

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
                    // PASO 1: Generar 3 variaciones de prompts de imagen
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({
                                step: "image-prompts",
                                status: "generating",
                                message: "Generando 3 variaciones de prompts de imagen..."
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

                    // Generar 3 variaciones
                    const variations = [];
                    const variationStyles = [
                        "Genera una imagen base versátil con énfasis en un ESTILO CINEMATOGRÁFICO Y PROFESIONAL que funcione para todo el video.",
                        "Genera una imagen base versátil con énfasis en un ESTILO ENERGÉTICO Y VIBRANTE que funcione para todo el video.",
                        "Genera una imagen base versátil con énfasis en un ESTILO MINIMALISTA Y LIMPIO que funcione para todo el video."
                    ];

                    for (let i = 0; i < 3; i++) {
                        controller.enqueue(
                            encoder.encode(
                                `data: ${JSON.stringify({
                                    step: "image-prompt-variation",
                                    status: "generating",
                                    variation: i + 1
                                })}\n\n`
                            )
                        );

                        const variantPrompt = imagePromptContent + `\n\n${variationStyles[i]}`;
                        const result = await imagePromptAgent.generate(variantPrompt);

                        // Extraer solo el prompt principal del output estructurado
                        const promptMatch = result.text.match(/📝 Prompt Principal:\s*\n([^\n]+(?:\n(?!🎨|⚡|💡|📐)[^\n]+)*)/);
                        const cleanPrompt = promptMatch ? promptMatch[1].trim() : result.text;

                        variations.push({
                            id: i + 1,
                            fullPrompt: result.text,
                            cleanPrompt: cleanPrompt,
                            style: variationStyles[i]
                        });

                        controller.enqueue(
                            encoder.encode(
                                `data: ${JSON.stringify({
                                    step: "image-prompt-variation",
                                    status: "complete",
                                    variation: i + 1,
                                    data: result.text
                                })}\n\n`
                            )
                        );
                    }

                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({
                                step: "image-prompts",
                                status: "complete",
                                data: variations
                            })}\n\n`
                        )
                    );

                    // PASO 2: Generar las 3 imágenes con Runway
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({
                                step: "image-generation",
                                status: "generating",
                                message: "Generando 3 imágenes con Runway ML..."
                            })}\n\n`
                        )
                    );

                    const prompts = variations.map(v => v.cleanPrompt);
                    const imageResults = await generateMultipleImages(prompts);

                    // Combinar variaciones con URLs de imágenes
                    const imagesWithUrls = variations.map((variation, index) => ({
                        ...variation,
                        imageUrl: imageResults[index].url,
                        error: imageResults[index].error
                    }));

                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({
                                step: "image-generation",
                                status: "complete",
                                data: imagesWithUrls
                            })}\n\n`
                        )
                    );

                    // PASO 3: Esperar selección del usuario
                    if (selectedImageIndex === undefined || selectedImageIndex === null) {
                        controller.enqueue(
                            encoder.encode(
                                `data: ${JSON.stringify({
                                    step: "user-selection",
                                    status: "waiting",
                                    message: "Elige una de las 3 imágenes generadas (0, 1 o 2)"
                                })}\n\n`
                            )
                        );
                        controller.close();
                        return;
                    }

                    // Validar índice de selección
                    if (selectedImageIndex < 0 || selectedImageIndex > 2) {
                        throw new Error("selectedImageIndex debe ser 0, 1 o 2");
                    }

                    const selectedImage = imagesWithUrls[selectedImageIndex];
                    if (!selectedImage.imageUrl) {
                        throw new Error(`La imagen ${selectedImageIndex + 1} no se generó correctamente: ${selectedImage.error}`);
                    }

                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({
                                step: "image-selected",
                                status: "confirmed",
                                data: selectedImage
                            })}\n\n`
                        )
                    );

                    // PASO 4: Generar prompt de video con la imagen seleccionada
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
                    videoPromptContent += `\n\nIMAGEN DE ENTRADA:\nSe utilizará la siguiente imagen: ${selectedImage.imageUrl}`;
                    videoPromptContent += `\n\nEstilo de la imagen: ${selectedImage.style}`;
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
