import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import * as cheerio from "cheerio";

export const urlReaderTool = createTool({
  id: "url-reader",
  description: "Reads and extracts content from a URL including title, description, and main text content",
  inputSchema: z.object({
    url: z.string().url().describe("The URL to read"),
  }),
  outputSchema: z.object({
    url: z.string(),
    title: z.string(),
    description: z.string(),
    content: z.string(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const response = await fetch(context.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; URLReaderBot/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      $('script, style, nav, footer, header').remove();

      const title = $('title').text() || 
                   $('meta[property="og:title"]').attr('content') || 
                   $('h1').first().text() || 
                   'Sin título';

      const description = $('meta[name="description"]').attr('content') || 
                         $('meta[property="og:description"]').attr('content') || 
                         $('p').first().text().slice(0, 200) || 
                         'Sin descripción';

      const mainContent = $('article, main, .content, .post-content, #content')
        .first()
        .text()
        .trim() || 
        $('body').text().trim();

      const cleanContent = mainContent
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n')
        .slice(0, 5000);

      return {
        url: context.url,
        title: title.trim(),
        description: description.trim(),
        content: cleanContent,
      };
    } catch (error) {
      return {
        url: context.url,
        title: "Error",
        description: "No se pudo leer la URL",
        content: "",
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  },
});

