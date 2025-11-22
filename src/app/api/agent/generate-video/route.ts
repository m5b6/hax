import { NextResponse } from "next/server";
import RunwayML from "@runwayml/sdk";
import { mastra } from "@/mastra";

export const maxDuration = 300; // 5 minutes timeout

const runwayClient = new RunwayML({
  apiKey: process.env.RUNWAY_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { promptText, imageUrl } = await req.json();

    if (!promptText) {
      return NextResponse.json(
        { error: "promptText is required" },
        { status: 400 }
      );
    }

    console.log("🎥 Generating video with Gen-3 Alpha Turbo...");

    // 1. Generate Audio Script (Spanish)
    console.log("🔊 Generating audio script...");
    let audioScript = "";
    try {
      const agent = mastra.getAgent("campaignVisualizerAgent"); // Reusing an existing agent for text gen
      if (agent) {
        const audioPrompt = `Escribe un guion de voz en off MUY BREVE (1 frase) para un video comercial.
                Debe ser inspirador y profesional.
                
                Contexto visual: "${promptText.substring(0, 300)}..."
                
                Solo devuelve el texto del guion. Nada más.`;

        const result = await agent.generate(audioPrompt);
        audioScript = result.text.replace(/["']/g, "").trim();

        // If agent refuses, just don't use audio
        if (audioScript.toLowerCase().includes("lo siento") || audioScript.toLowerCase().includes("no puedo")) {
          audioScript = "";
        }

        console.log("📝 Audio Script:", audioScript);
      }
    } catch (e) {
      console.warn("Failed to generate audio script, proceeding without audio:", e);
    }

    // Truncate prompt to 1000 characters (Runway limit)
    // Append instruction to minimize text and ensure script adherence
    const textMinimizationInstruction = " . Cinematic style, high quality, clean visual, no text overlay, no typography. Follow the action described exactly.";
    const maxPromptLength = 1000 - textMinimizationInstruction.length;

    let truncatedPrompt = promptText.length > maxPromptLength ? promptText.substring(0, maxPromptLength) : promptText;
    truncatedPrompt += textMinimizationInstruction;

    console.log("Prompt (truncated + modified):", truncatedPrompt.substring(0, 50) + "...");

    let videoUrl: string | undefined;

    // User Instruction: ALWAYS use textToVideo endpoint, but add promptImage if available.
    // Also ensure prompt is max 1000 chars.

    try {
      const params: any = {
        promptText: truncatedPrompt,
        model: "veo3.1_fast", // User insisted on Veo supporting audio
        ratio: "720:1280", // 9:16 for Reels
      };

      // Add Audio if script generated
      if (audioScript) {
        params.textToSpeech = {
          text: audioScript,
          voice: "ontario", // Generic pleasant voice
        };
      }

      if (imageUrl) {
        console.log("Adding reference image to textToVideo request:", imageUrl);
        params.promptImage = [{ uri: imageUrl }];

        params.imageDescriptionStrength = 0.3;
      }

      const videoTask = await runwayClient.textToVideo.create(params).waitForTaskOutput();
      videoUrl = videoTask.output?.[0];

    } catch (error: any) {
      console.error("❌ Video generation failed:", error);
      throw error;
    }

    if (!videoUrl) {
      throw new Error("No video URL returned from Runway");
    }

    console.log("✅ Video generated successfully:", videoUrl);

    return NextResponse.json({
      success: true,
      output: [videoUrl] // Maintain compatibility with previous array format if needed, or just url
    });

  } catch (error: any) {
    console.error("Error generating video:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
