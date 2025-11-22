import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import * as cheerio from "cheerio";

const extractedDataSchema = z.object({
  type: z.enum([
    "style",
    "info",
    "products",
    "services",
    "target_audience",
    "tone",
    "pricing",
    "features",
    "integrations",
    "tech_stack"
  ]),
  label: z.string(),
  value: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
});

export const urlReaderTool = createTool({
  id: "url-reader",
  description: "Reads and extracts structured content from a URL including title, description, and categorized insights",
  inputSchema: z.object({
    url: z.string().describe("The URL to read (e.g., https://example.com)"),
  }),
  outputSchema: z.object({
    url: z.string(),
    title: z.string(),
    description: z.string(),
    content: z.string(),
    extractedData: z.array(extractedDataSchema).max(10),
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

      const extractedData = [];
      const contentLower = cleanContent.toLowerCase();
      
      if (contentLower.includes('automatiza') || contentLower.includes('inteligente') || contentLower.includes('ai')) {
        extractedData.push({
          type: "features" as const,
          label: "Automatización",
          value: "Plataforma con automatización e IA",
          confidence: "high" as const,
        });
      }

      if (contentLower.match(/\$|precio|plan|desde|mensual|anual/)) {
        extractedData.push({
          type: "pricing" as const,
          label: "Precios",
          value: "Información de precios disponible",
          confidence: "medium" as const,
        });
      }

      const colors = $('meta[name="theme-color"]').attr('content') || 
                    $('style, link[rel="stylesheet"]').first().text().match(/#[0-9A-Fa-f]{6}/g)?.[0];
      if (colors) {
        extractedData.push({
          type: "style" as const,
          label: "Color principal",
          value: colors,
          confidence: "high" as const,
        });
      }

      if (contentLower.includes('saas') || contentLower.includes('software') || contentLower.includes('plataforma')) {
        extractedData.push({
          type: "info" as const,
          label: "Tipo de negocio",
          value: "SaaS / Software",
          confidence: "high" as const,
        });
      }

      return {
        url: context.url,
        title: title.trim(),
        description: description.trim(),
        content: cleanContent,
        extractedData: extractedData.slice(0, 10),
      };
    } catch (error) {
      return {
        url: context.url,
        title: "Error",
        description: "No se pudo leer la URL",
        content: "",
        extractedData: [],
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  },
});

