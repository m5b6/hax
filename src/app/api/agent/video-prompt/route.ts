import { mastra } from "@/agents";
import { WizardData } from "@/types/wizard";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { wizardData, contentMatrix, designBrief, imageDescription } = body;

        let prompt = "";

        // Si viene wizardData completo, construir el prompt desde ahí
        if (wizardData) {
            const data = wizardData as WizardData;
            
            // Construir MATRIZ DE CONTENIDO desde los datos del wizard
            const contentMatrixFromWizard = {
                phases: [
                    {
                        phase: "GANCHO",
                        timeRange: "0-1s",
                        action: `Detener el scroll con un gancho visual relacionado con ${data.inputs.productName || "el producto/servicio"}`,
                        improvements: "Fast Zoom/Glitch Effect, SFX disruptivo"
                    },
                    {
                        phase: "CONTEXTO",
                        timeRange: "1-3s",
                        action: `Introducir el problema o necesidad que resuelve ${data.inputs.productName || "el producto/servicio"}`,
                        improvements: "Subtítulos con palabras clave"
                    },
                    {
                        phase: "VALOR/DEMO",
                        timeRange: "3-6s",
                        action: `Mostrar cómo ${data.inputs.productName || "el producto/servicio"} resuelve el problema`,
                        improvements: "CTA constante en 70% de opacidad"
                    },
                    {
                        phase: "CTA FINAL",
                        timeRange: "6-8s",
                        action: "Inducir acción (presionar WhatsApp, comprar, etc.)",
                        improvements: "CTA visual fuerte, urgencia si aplica"
                    }
                ]
            };

            prompt = `MATRIZ DE CONTENIDO:\n${JSON.stringify(contentMatrixFromWizard, null, 2)}`;

            // Construir BRIEF DE DISEÑO desde wizardData
            const designBriefFromWizard: any = {};

            if (data.inputs.identity) {
                designBriefFromWizard.negocio = data.inputs.identity;
            }

            if (data.inputs.name) {
                designBriefFromWizard.marca = data.inputs.name;
            }

            if (data.inputs.type) {
                designBriefFromWizard.tipo = data.inputs.type === "producto" ? "Producto" : "Servicio";
            }

            if (data.inputs.productName) {
                designBriefFromWizard.productoServicio = data.inputs.productName;
            }

            // Extraer información de URL analyses
            if (data.agentResponses.urlAnalyses && data.agentResponses.urlAnalyses.length > 0) {
                const firstAnalysis = data.agentResponses.urlAnalyses[0];
                
                if (firstAnalysis.primaryColor || firstAnalysis.secondaryColor) {
                    designBriefFromWizard.colores = [
                        firstAnalysis.primaryColor,
                        firstAnalysis.secondaryColor,
                        ...(firstAnalysis.colors || [])
                    ].filter(Boolean);
                }

                if (firstAnalysis.summary) {
                    designBriefFromWizard.resumen = firstAnalysis.summary;
                }

                // Extraer insights relevantes
                if (firstAnalysis.insights && firstAnalysis.insights.length > 0) {
                    const audienceInsight = firstAnalysis.insights.find(i => i.type === "target_audience");
                    if (audienceInsight) {
                        designBriefFromWizard.audiencia = audienceInsight.value;
                    }

                    const toneInsight = firstAnalysis.insights.find(i => i.type === "tone");
                    if (toneInsight) {
                        designBriefFromWizard.tono = toneInsight.value;
                    }
                }
            }

            // Extraer respuestas de MCQs para contexto adicional
            if (data.agentResponses.mcqAnswers) {
                designBriefFromWizard.preferencias = data.agentResponses.mcqAnswers;
            }

            if (Object.keys(designBriefFromWizard).length > 0) {
                prompt += `\n\nBRIEF DE DISEÑO:\n${JSON.stringify(designBriefFromWizard, null, 2)}`;
            }

        } else if (contentMatrix) {
            // Formato anterior (backward compatibility)
            prompt = `MATRIZ DE CONTENIDO:\n${JSON.stringify(contentMatrix, null, 2)}`;

            if (designBrief) {
                prompt += `\n\nBRIEF DE DISEÑO:\n${JSON.stringify(designBrief, null, 2)}`;
            }

            if (imageDescription) {
                prompt += `\n\nDESCRIPCIÓN DE LA IMAGEN:\n${imageDescription}`;
            }
        } else {
            return new Response(
                JSON.stringify({ error: "wizardData o contentMatrix es requerido" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Generar el prompt usando streaming
        const agent = mastra.getAgent("videoPromptAgent");

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
        console.error("Error en video-prompt agent:", error);
        return new Response(
            JSON.stringify({
                error: "Error al generar el prompt de video",
                details: error instanceof Error ? error.message : String(error)
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
