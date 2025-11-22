import { Mastra } from "@mastra/core";
import { urlAnalyzerAgent } from "./agents/url-agent";
import { videoPromptAgent } from "../agents/video-prompt-agent";
import { imagePromptAgent } from "../agents/image-prompt-agent";
import { mcqAgent } from "./agents/mcq-agent";


export const mastra = new Mastra({
  agents: { urlAnalyzerAgent, videoPromptAgent, imagePromptAgent, mcqAgent },
});


