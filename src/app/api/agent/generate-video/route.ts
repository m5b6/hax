import { mastra } from "@/mastra";

export const runtime = "nodejs";

const MOCK_MODE = true; // Set to false to use real RunwayML API

const MOCK_RESULT = {
  "taskId": "f438d341-0965-40f9-a170-90bd2e9af645",
  "status": "SUCCEEDED",
  "output": [
    "https://dnznrvs05pmza.cloudfront.net/veo3.1/projects/vertex-ai-claude-431722/locations/us-central1/publishers/google/models/veo-3.1-generate-preview/operations/5cab9447-47de-46e9-aa2c-6259477cc597/Un_gato_adorable_movi_ndose_y_jugando_en_un_entorno_natural__mostrando_su_agilidad_y_curiosidad_.mp4?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZjBmNGRmMjA0N2U1MDhmZiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc2Mzk0MjQwMH0.lg0ih_f-e3W8YtofdknOo4cRuglZMC16svI0n1u4uJg"
  ]
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { promptText, imageUrl } = body;

    if (MOCK_MODE) {
      console.log("[Mock Mode] Returning mock video result");
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      return new Response(JSON.stringify(MOCK_RESULT), {
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!promptText) {
      return new Response(JSON.stringify({ error: "promptText is required" }), { status: 400 });
    }

    // Use provided image or fallback
    const validImageUrl = imageUrl || "https://framerusercontent.com/images/0MzDPgY0gtGns3dG82kzQIYHR18.png";

    const agent = mastra.getAgent("runwayVideoAgent");
    if (!agent) throw new Error("Agent not found");

    // Use generate() instead of stream() as requested
    const result = await agent.generate(
      `Genera un video basado en este prompt: "${promptText}" usando la imagen proporcionada.`,
      {
        tools: {
          "runway-video-generator": {
            promptText: promptText,
            promptImage: validImageUrl, // Tool now handles string input and validation
            model: "veo3.1",
            ratio: "9:16", // Will be normalized by tool
            duration: 8
          }
        }
      }
    );

    // Parse the tool result
    console.log("Agent result:", JSON.stringify(result, null, 2));
    
    // Extract the tool output from the agent result
    // The structure depends on how Mastra returns tool outputs in generate()
    // Usually it's in result.toolResults or we parse the text if the agent repeats it.
    // But since we called specific tool, we look for its execution result.
    
    // For now, assuming we want to return what the tool returned.
    // In Mastra, agent.generate returns { text, toolResults, ... }
    const toolResults = result.toolResults;
    const runwayResult = toolResults?.find(t => t.toolName === "runway-video-generator")?.result;

    if (runwayResult) {
        return new Response(JSON.stringify(runwayResult), {
            headers: { "Content-Type": "application/json" }
        });
    }

    // Fallback if tool didn't run or we can't find result (shouldn't happen if instructions are clear)
    return new Response(JSON.stringify({ error: "No video generated", details: result.text }), { status: 500 });

  } catch (error) {
    console.error("Error generating video:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

