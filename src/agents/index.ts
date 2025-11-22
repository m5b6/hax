import { Mastra } from "@mastra/core";
import { urlAnalyzerAgent } from "./url-agent";

export const mastra = new Mastra({
  agents: { urlAnalyzerAgent },
});



