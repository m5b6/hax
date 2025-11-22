import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import RunwayML from "@runwayml/sdk";

export const runwayVideoGeneratorTool = createTool({
  id: "runway-video-generator",
  description: "Generates a video from an image URL and text prompt using RunwayML's image-to-video API",
  inputSchema: z.object({
    promptText: z.string().describe("Text description of what should happen in the video"),
    promptImage: z.array(z.object({
      uri: z.string().url().describe("URL of the input image"),
      position: z.enum(["first", "last"]).optional().describe("Position of the image in the sequence"),
    })).min(1).describe("Array of input images with their URLs"),
    model: z.string().default("veo3.1").describe("Model to use (e.g., 'veo3.1')"),
    ratio: z.string().default("1280:720").describe("Aspect ratio of the video (e.g., '1280:720', '9:16')"),
    duration: z.number().int().min(1).max(10).default(4).describe("Duration of the video in seconds"),
    seed: z.number().int().optional().describe("Optional seed for reproducibility"),
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

      const task = await client.imageToVideo.create({
        promptText: context.promptText,
        promptImage: context.promptImage.map(img => ({
          uri: img.uri,
          position: img.position || "first",
        })),
        model: context.model,
        ratio: context.ratio,
        duration: context.duration,
        seed: context.seed,
      }).waitForTaskOutput();

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

