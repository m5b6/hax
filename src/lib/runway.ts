/**
 * Helper para interactuar con la API de Runway Gen-4 Image
 * Documentación oficial: https://docs.runwayml.com/
 */

const RUNWAY_API_URL = "https://api.dev.runwayml.com/v1";

interface RunwayImageGenerationParams {
    promptText: string;
    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
    resolution?: "720p" | "1080p" | "4k";
    seed?: number;
    referenceImages?: string[]; // URLs of reference images
}

interface RunwayTask {
    id: string;
    status: "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED";
    output?: string[]; // Array of image URLs
    failure?: string;
    failureCode?: string;
}

/**
 * Genera una imagen usando la API de Runway Gen-4 Image
 */
export async function generateImageWithRunway(
    params: RunwayImageGenerationParams
): Promise<string> {
    const apiKey = process.env.RUNWAY_API_KEY;

    if (!apiKey) {
        throw new Error("RUNWAY_API_KEY no está configurada en las variables de entorno");
    }

    try {
        // Iniciar la generación de imagen con Gen-4 Image
        const response = await fetch(`${RUNWAY_API_URL}/image/generate`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "X-Runway-Version": "2024-11-06",
            },
            body: JSON.stringify({
                model: "gen4",
                promptText: params.promptText,
                aspectRatio: params.aspectRatio || "9:16", // 9:16 para video vertical
                resolution: params.resolution || "1080p",
                seed: params.seed,
                referenceImages: params.referenceImages || [],
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Runway API error: ${response.status} - ${error}`);
        }

        const data: RunwayTask = await response.json();
        const taskId = data.id;

        // Polling para esperar a que la imagen esté lista
        let imageUrl: string | undefined;
        let attempts = 0;
        const maxAttempts = 120; // 120 intentos = ~10 minutos máximo

        while (!imageUrl && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5 segundos

            const statusResponse = await fetch(`${RUNWAY_API_URL}/tasks/${taskId}`, {
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "X-Runway-Version": "2024-11-06",
                },
            });

            if (!statusResponse.ok) {
                throw new Error(`Error checking image status: ${statusResponse.status}`);
            }

            const statusData: RunwayTask = await statusResponse.json();

            if (statusData.status === "SUCCEEDED" && statusData.output && statusData.output.length > 0) {
                imageUrl = statusData.output[0];
                break;
            } else if (statusData.status === "FAILED") {
                throw new Error(
                    `Image generation failed: ${statusData.failure || "Unknown error"} (${statusData.failureCode || "NO_CODE"})`
                );
            } else if (statusData.status === "CANCELLED") {
                throw new Error("Image generation was cancelled");
            }

            attempts++;
        }

        if (!imageUrl) {
            throw new Error("Image generation timed out after 10 minutes");
        }

        return imageUrl;
    } catch (error) {
        console.error("Error generating image with Runway:", error);
        throw error;
    }
}

/**
 * Genera múltiples imágenes en paralelo con diferentes prompts
 * Útil para generar variaciones
 */
export async function generateMultipleImages(
    prompts: string[],
    options?: Omit<RunwayImageGenerationParams, "promptText">
): Promise<Array<{ prompt: string; url: string; error?: string }>> {
    const results = await Promise.allSettled(
        prompts.map(async (prompt) => {
            const url = await generateImageWithRunway({
                ...options,
                promptText: prompt,
            });
            return { prompt, url };
        })
    );

    return results.map((result, index) => {
        if (result.status === "fulfilled") {
            return result.value;
        } else {
            return {
                prompt: prompts[index],
                url: "",
                error: result.reason instanceof Error ? result.reason.message : String(result.reason),
            };
        }
    });
}
