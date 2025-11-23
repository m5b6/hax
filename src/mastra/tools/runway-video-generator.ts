import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import RunwayML from "@runwayml/sdk";

// Helper function to normalize ratio values
const normalizeRatio = (ratio: string, model: string): string => {
  // Map common ratios to valid API values
  const ratioMap: Record<string, Record<string, string>> = {
    "veo3.1": {
      "9:16": "720:1280",
      "16:9": "1280:720",
      "1:1": "1080:1920", // Closest to square
    },
  };

  const modelMap = ratioMap[model] || {};
  return modelMap[ratio] || ratio;
};

export const runwayVideoGeneratorTool = createTool({
  id: "runway-video-generator",
  description: "Generates a video from an image URL and text prompt using RunwayML's image-to-video API",
  inputSchema: z.object({
    promptText: z.string().describe("Text description of what should happen in the video"),
    promptImage: z.union([
      z.string().url().describe("Single image URL as a string"),
      z.array(z.object({
        uri: z.string().url().describe("URL of the input image"),
        position: z.enum(["first", "last"]).describe("Position of the image in the sequence"),
      })).min(1).max(2).describe("Array of input images with their URLs (max 2 for veo3.1)"),
    ]).describe("Image URL(s) - can be a single URL string or array of image objects"),
    model: z.enum(["veo3.1", "veo3.1_fast", "veo3", "gen4_turbo", "gen3a_turbo"]).default("veo3.1").describe("Model to use"),
    ratio: z.string().describe("Aspect ratio of the video. For veo3.1: '1280:720', '720:1280', '1080:1920', or '1920:1080'. Common ratios like '9:16' will be automatically converted."),
    duration: z.number().int().optional().describe("Duration of the video in seconds. For veo3.1: 4, 6, or 8"),
    seed: z.number().int().optional().describe("Optional seed for reproducibility"),
    imageStrength: z.number().min(0).max(1).optional().describe("Strength of the image influence (0.0 to 1.0). Higher values mean the video will look more like the image."),
  }),
  outputSchema: z.object({
    taskId: z.string().describe("ID of the RunwayML task"),
    status: z.string().describe("Status of the task"),
    output: z.array(z.string().url()).optional().describe("Array of output video URLs when complete"),
    error: z.string().optional().describe("Error message if the task failed"),
  }),
  execute: async ({ context }) => {
    try {
      // Check both RUNWAY_API_KEY (existing convention) and RUNWAYML_API_SECRET (SDK default)
      const apiKey = process.env.RUNWAY_API_KEY || process.env.RUNWAYML_API_SECRET;

      if (!apiKey) {
        throw new Error("RUNWAY_API_KEY o RUNWAYML_API_SECRET debe estar configurada en las variables de entorno");
      }

      const client = new RunwayML({
        apiKey: apiKey,
      });

      // Helper to ensure image URL is valid for RunwayML (has Content-Length)
      // If not, downloads and uploads it to RunwayML as ephemeral asset
      const getStableImageUrl = async (url: string): Promise<string> => {
        try {
          // 1. Try HEAD request to check for Content-Length
          const head = await fetch(url, { method: "HEAD" });
          if (head.ok && head.headers.get("content-length")) {
            return url; // URL is valid
          }
        } catch (e) {
          // Ignore error and proceed to upload
        }

        console.log(`[RunwayTool] Uploading image to Runway: ${url}`);

        try {
          // 2. Download image
          const imageRes = await fetch(url);
          if (!imageRes.ok) throw new Error(`Failed to download image: ${imageRes.statusText}`);

          const blob = await imageRes.blob();

          // 3. Upload to RunwayML
          // Note: createEphemeral expects 'file' which can be a Blob in Node environment with appropriate polyfills/types
          // casting to any to avoid strict type issues with Node Blob vs Web Blob
          const upload = await client.uploads.createEphemeral({
            file: blob as any,
            fileMetadata: JSON.stringify({ name: "input_image" }),
          });

          return upload.uri;
        } catch (e) {
          console.warn(`[RunwayTool] Failed to upload image, trying original URL fallback: ${e instanceof Error ? e.message : String(e)}`);
          return url; // Fallback to original URL if upload fails
        }
      };

      // Normalize ratio based on model
      const normalizedRatio = normalizeRatio(context.ratio, context.model);

      // Validate ratio for veo3.1 model
      const validRatios = ["1280:720", "720:1280", "1080:1920", "1920:1080"];
      if (context.model === "veo3.1" || context.model === "veo3.1_fast" || context.model === "veo3") {
        if (!validRatios.includes(normalizedRatio)) {
          throw new Error(`Invalid ratio for ${context.model}. Must be one of: ${validRatios.join(", ")}`);
        }
      }

      // Normalize promptImage according to SDK types and ensuring valid URLs
      // For veo3.1: string | Array<{ uri: string, position: 'first' | 'last' }>
      let promptImage: string | Array<{ uri: string; position: "first" | "last" }>;

      if (typeof context.promptImage === "string") {
        promptImage = await getStableImageUrl(context.promptImage);
      } else if (Array.isArray(context.promptImage)) {
        if (context.promptImage.length === 0) {
          throw new Error("promptImage array must contain at least one image");
        }
        // Process all images in parallel
        promptImage = await Promise.all(context.promptImage.map(async (img) => ({
          uri: await getStableImageUrl(img.uri),
          position: (img.position || "first") as "first" | "last",
        })));
      } else {
        throw new Error("promptImage must be either a string URL or an array of image objects");
      }

      // Validate duration for veo3.1
      if (context.model === "veo3.1" || context.model === "veo3.1_fast") {
        const validDurations = [4, 6, 8];
        if (context.duration && !validDurations.includes(context.duration)) {
          throw new Error(`Invalid duration for ${context.model}. Must be one of: ${validDurations.join(", ")}`);
        }
      }

      const task = await client.imageToVideo.create({
        promptText: context.promptText,
        promptImage: promptImage,
        model: context.model,
        ratio: normalizedRatio as any,
        duration: context.duration,
        seed: context.seed,
        // @ts-ignore - imageDescriptionStrength might not be in types yet or named differently
        imageDescriptionStrength: context.imageStrength,
      } as any).waitForTaskOutput();

      return {
        taskId: task.id || "",
        status: task.status || "SUCCEEDED",
        output: task.output || [],
        error: task.failure || undefined,
      };
    } catch (error) {
      return {
        taskId: "",
        status: "FAILED",
        output: undefined,
        error: error instanceof Error ? error.message : "Error desconocido al generar el video",
      };
    }
  },
});

