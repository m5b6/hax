import { Mastra } from "@mastra/core";
import { urlAnalyzerAgent } from "./agents/url-agent";
import { videoPromptAgent } from "../agents/video-prompt-agent";
import { imagePromptAgent } from "../agents/image-prompt-agent";
import { mcqAgent } from "./agents/mcq-agent";
import { campaignVisualizerAgent } from "../agents/campaign-visualizer-agent";
import {
  postExtractor1Agent,
  postExtractor2Agent,
  postExtractor3Agent
} from "../agents/post-extractor-agent";

export const mastra = new Mastra({
  agents: {
    urlAnalyzerAgent,
    videoPromptAgent,
    imagePromptAgent,
    mcqAgent,
    campaignVisualizerAgent,
    postExtractor1Agent,
    postExtractor2Agent,
    postExtractor3Agent
  },
});


