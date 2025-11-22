import { Mastra } from "@mastra/core";
import { urlAnalyzerAgent } from "./url-agent";
import { videoPromptAgent } from "./video-prompt-agent";
import { imagePromptAgent } from "./image-prompt-agent";

export const mastra = new Mastra({
  agents: { urlAnalyzerAgent, videoPromptAgent, imagePromptAgent },
});


