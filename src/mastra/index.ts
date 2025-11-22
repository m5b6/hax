import { Mastra } from "@mastra/core";
import { urlAnalyzerAgent } from "./agents/url-agent";

export const mastra = new Mastra({
  agents: { urlAnalyzerAgent },
});

