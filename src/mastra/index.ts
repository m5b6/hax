import { Mastra } from "@mastra/core";
import { urlAnalyzerAgent } from "./agents/url-agent";
import { mcqAgent } from "./agents/mcq-agent";

export const mastra = new Mastra({
  agents: { urlAnalyzerAgent, mcqAgent },
});



