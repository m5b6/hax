import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";

// Agent for extracting ID:1
export const postExtractor1Agent = new Agent({
    name: "post-extractor-1",
    instructions: `Extract only the information from "ID:1" only and output it as your response, verbatim. 
    
Do not add any additional commentary, explanation, or formatting. Simply output the exact text content from "ID:1" as is.`,
    model: openai("gpt-4o-mini"),
});

// Agent for extracting ID:2
export const postExtractor2Agent = new Agent({
    name: "post-extractor-2",
    instructions: `Extract only the information from "ID:2" only and output it as your response, verbatim. 
    
Do not add any additional commentary, explanation, or formatting. Simply output the exact text content from "ID:2" as is.`,
    model: openai("gpt-4o-mini"),
});

// Agent for extracting ID:3
export const postExtractor3Agent = new Agent({
    name: "post-extractor-3",
    instructions: `Extract only the information from "ID:3" only and output it as your response, verbatim. 
    
Do not add any additional commentary, explanation, or formatting. Simply output the exact text content from "ID:3" as is.`,
    model: openai("gpt-4o-mini"),
});
