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
  description: "Reads and extracts structured content from a URL including title, description, visual identity clues, and categorized insights",
  inputSchema: z.object({
    url: z.string().describe("The URL to read (e.g., https://example.com)"),
  }),
  outputSchema: z.object({
    url: z.string(),
    title: z.string(),
    description: z.string(),
    content: z.string(),
    stylesheets: z.array(z.string()).describe("URLs of all stylesheets found"),
    images: z.array(z.string()).describe("URLs of all images found (limited to first 20)"),
    scripts: z.array(z.string()).describe("URLs of all external scripts found"),
    fonts: z.array(z.string()).describe("Font URLs found in stylesheets"),
    colors: z.array(z.string()).describe("Color codes extracted from the page"),
    primaryColor: z.string().nullable().describe("Best guess for brand primary color"),
    secondaryColor: z.string().nullable().describe("Best guess for brand secondary color"),
    logoUrl: z.string().nullable().describe("URL to the main brand logo/image"),
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

      const baseUrl = new URL(context.url);
      const resolveUrl = (relativeUrl: string) => {
        try {
          return new URL(relativeUrl, baseUrl.href).href;
        } catch {
          return relativeUrl;
        }
      };

      const stylesheets = $('link[rel="stylesheet"]')
        .map((_, el) => resolveUrl($(el).attr('href') || ''))
        .get()
        .filter(Boolean);

      const images = $('img')
        .map((_, el) => resolveUrl($(el).attr('src') || ''))
        .get()
        .filter(Boolean)
        .slice(0, 20);

      const scripts = $('script[src]')
        .map((_, el) => resolveUrl($(el).attr('src') || ''))
        .get()
        .filter(Boolean);

      const inlineStyles = $('style').text();
      const styleAttributes = $('[style]')
        .map((_, el) => $(el).attr('style'))
        .get()
        .join(' ');
      
      const colorRegex = /#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|rgba?\([^)]+\)/g;
      const allStyles = inlineStyles + ' ' + styleAttributes;
      const colors = [...new Set(allStyles.match(colorRegex) || [])].slice(0, 10);

      const fontRegex = /(?:https?:)?\/\/[^)]+\.(?:woff2?|ttf|eot|otf)/g;
      const fonts = [...new Set(allStyles.match(fontRegex) || [])].map(font => 
        font.startsWith('//') ? 'https:' + font : font
      );

      const themeColor = $('meta[name="theme-color"]').attr('content');
      if (themeColor && !colors.includes(themeColor)) {
        colors.unshift(themeColor);
      }

      const logoCandidates = [
        $('meta[property="og:logo"]').attr('content'),
        $('meta[property="og:image"]').attr('content'),
        $('meta[itemprop="logo"]').attr('content'),
        $('link[rel="icon"]').attr('href'),
        $('link[rel="shortcut icon"]').attr('href'),
        $('img[alt*="logo" i]').attr('src'),
        $('img[src*="logo"]').attr('src'),
        $('svg[role="img"]').parent('a[href]').first().attr('href'),
      ]
        .filter(Boolean)
        .map(src => resolveUrl(src as string));

      const logoUrl = logoCandidates.find(Boolean) || null;

      const primaryColor = colors[0] || themeColor || null;
      const secondaryColor = colors.find((color) => color !== primaryColor) || null;

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
      
      if (colors.length > 0) {
        extractedData.push({
          type: "style" as const,
          label: "Paleta de colores",
          value: `${colors.length} colores principales: ${colors.slice(0, 3).join(', ')}`,
          confidence: "high" as const,
        });
      }

      if (images.length > 0) {
        extractedData.push({
          type: "style" as const,
          label: "Recursos visuales",
          value: `${images.length} imágenes encontradas`,
          confidence: "high" as const,
        });
      }

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

      if (contentLower.includes('saas') || contentLower.includes('software') || contentLower.includes('plataforma')) {
        extractedData.push({
          type: "info" as const,
          label: "Tipo de negocio",
          value: "SaaS / Software",
          confidence: "high" as const,
        });
      }

      const techStack = [];
      if (scripts.some(s => s.includes('react') || s.includes('next'))) {
        techStack.push('React/Next.js');
      }
      if (scripts.some(s => s.includes('vue'))) {
        techStack.push('Vue.js');
      }
      if (scripts.some(s => s.includes('angular'))) {
        techStack.push('Angular');
      }
      if (techStack.length > 0) {
        extractedData.push({
          type: "tech_stack" as const,
          label: "Framework detectado",
          value: techStack.join(', '),
          confidence: "medium" as const,
        });
      }

      return {
        url: context.url,
        title: title.trim(),
        description: description.trim(),
        content: cleanContent,
        stylesheets,
        images,
        scripts,
        fonts,
        colors,
        primaryColor,
        secondaryColor,
        logoUrl,
        extractedData: extractedData.slice(0, 10),
      };
    } catch (error) {
      return {
        url: context.url,
        title: "Error",
        description: "No se pudo leer la URL",
        content: "",
        stylesheets: [],
        images: [],
        scripts: [],
        fonts: [],
        colors: [],
        primaryColor: null,
        secondaryColor: null,
        logoUrl: null,
        extractedData: [],
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  },
});

