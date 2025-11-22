import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import * as cheerio from "cheerio";

const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((c) => c + c).join("")
    : normalized;
  const int = parseInt(value, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
};

const isNearWhite = (color: string) => {
  if (!color || !color.startsWith("#")) return false;
  const hex = color.length === 4
    ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
    : color;
  try {
    const { r, g, b } = hexToRgb(hex);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.9;
  } catch {
    return false;
  }
};

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

      const allImageElements = $('img')
        .map((_, el) => {
          const src = $(el).attr('src');
          const srcset = $(el).attr('srcset');
          
          if (!src) return null;
          
          const resolvedSrc = resolveUrl(src);
          
          return {
            url: resolvedSrc,
            srcset: srcset ? srcset.split(',').map(s => resolveUrl(s.trim().split(' ')[0])).filter(Boolean) : [],
          };
        })
        .get()
        .filter(Boolean);

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

      const backgroundImageRegex = /url\(['"]?([^'")]+)['"]?\)/g;
      const backgroundImages: string[] = [];
      let match;
      while ((match = backgroundImageRegex.exec(allStyles)) !== null) {
        const url = match[1].trim();
        if (url && !url.startsWith('data:') && !url.includes('gradient') && !url.includes('linear-gradient')) {
          try {
            const resolved = resolveUrl(url);
            backgroundImages.push(resolved);
          } catch {}
        }
      }

      const allImageUrls = [
        ...allImageElements.map((img: any) => img.url),
        ...allImageElements.flatMap((img: any) => img.srcset || []),
        ...backgroundImages,
      ]
        .filter((url, idx, arr) => arr.indexOf(url) === idx);
      const rawColors = [...new Set(allStyles.match(colorRegex) || [])].slice(0, 20);

      const fontRegex = /(?:https?:)?\/\/[^)]+\.(?:woff2?|ttf|eot|otf)/g;
      const fonts = [...new Set(allStyles.match(fontRegex) || [])].map(font => 
        font.startsWith('//') ? 'https:' + font : font
      );

      const themeColor = $('meta[name="theme-color"]').attr('content');
      if (themeColor && !rawColors.includes(themeColor)) {
        rawColors.unshift(themeColor);
      }

      const vividColors = rawColors.filter((color) => !(color.startsWith("#") && isNearWhite(color)));
      const prioritizedColors = vividColors.length > 0 ? vividColors : rawColors;

      const selectSecondaryColor = (list: string[], primary: string | null) => {
        return list.find((color) => color !== primary && !(color.startsWith("#") && isNearWhite(color))) ||
               list.find((color) => color !== primary) ||
               null;
      };

      let primaryColor = prioritizedColors[0] || null;
      if (primaryColor && primaryColor.startsWith("#") && isNearWhite(primaryColor)) {
        primaryColor = prioritizedColors.find((color) => !(color.startsWith("#") && isNearWhite(color))) || null;
      }
      if ((!primaryColor || (primaryColor.startsWith("#") && isNearWhite(primaryColor))) && themeColor && !(themeColor.startsWith("#") && isNearWhite(themeColor))) {
        primaryColor = themeColor;
      }
      const secondaryColor = selectSecondaryColor(prioritizedColors, primaryColor);

      const inlineSvgLogo = $('svg[aria-label*="logo" i], svg[id*="logo" i], svg[class*="logo" i]').first();
      const svgTitleLogo = $('svg title:contains("logo")').first().parent('svg');
      let svgLogoElement = inlineSvgLogo.length ? inlineSvgLogo : svgTitleLogo;
      if (!svgLogoElement || !svgLogoElement.length) {
        svgLogoElement = $('svg').filter((_, el) => {
          const attr = (
            ($(el).attr('aria-label') || '') +
            ($(el).attr('id') || '') +
            ($(el).attr('class') || '')
          ).toLowerCase();
          return attr.includes('logo');
        }).first();
      }
      const inlineSvgMarkup = svgLogoElement.length ? $.html(svgLogoElement) : null;

      const logoImageCandidates = [
        $('meta[property="og:logo"]').attr('content'),
        $('meta[property="og:image"]').attr('content'),
        $('meta[itemprop="logo"]').attr('content'),
        $('link[rel="icon"][sizes*="192"]').attr('href'),
        $('link[rel="icon"][sizes*="180"]').attr('href'),
        $('link[rel="icon"]').attr('href'),
        $('link[rel="shortcut icon"]').attr('href'),
        $('img[alt*="logo" i]').attr('src'),
        $('img[src*="logo"]').attr('src'),
      ]
        .filter(Boolean)
        .map(src => resolveUrl(src as string));

      const heroKeywords = ["hero", "banner", "bg", "background", "cover", "slider", "header"];
      const logoKeywords = ["logo", "logotipo", "isologo", "isotipo", "imagotipo"];

      const scoredLogoCandidates = logoImageCandidates.map((candidate) => {
        const lower = candidate.toLowerCase();
        let score = 0;
        logoKeywords.forEach((kw) => {
          if (lower.includes(kw)) score += 3;
        });
        heroKeywords.forEach((kw) => {
          if (lower.includes(kw)) score -= 2;
        });
        if (lower.includes("icon")) score += 1;
        return { url: candidate, score };
      });

      const bestLogo = scoredLogoCandidates
        .sort((a, b) => b.score - a.score)
        .find((candidate) => candidate.score > 0)?.url;

      const logoUrl = bestLogo || inlineSvgMarkup || null;

      const logoUrlString = typeof logoUrl === 'string' ? logoUrl.toLowerCase() : '';
      const logoCandidatesLower = logoImageCandidates.map(l => l.toLowerCase());
      
      let finalImageUrls = allImageUrls.filter((url) => {
        if (!url || typeof url !== 'string') return false;
        
        const urlLower = url.toLowerCase();
        
        if (logoUrlString && urlLower === logoUrlString) return false;
        if (logoCandidatesLower.some(logo => urlLower === logo)) return false;
        
        const isFavicon = urlLower.includes('/favicon') || urlLower.includes('favicon.');
        const isTinyIcon = urlLower.match(/icon-?\d+x\d+\.(png|jpg|svg)/i);
        const isAppleTouchIcon = urlLower.includes('apple-touch-icon');
        const isDataUri = url.startsWith('data:');
        
        if (isFavicon || isTinyIcon || isAppleTouchIcon || isDataUri) return false;
        
        return true;
      });

      if (finalImageUrls.length === 0 && allImageUrls.length > 0) {
        finalImageUrls = allImageUrls
          .filter(url => url && typeof url === 'string' && !url.startsWith('data:'))
          .filter(url => {
            const urlLower = url.toLowerCase();
            return !urlLower.includes('favicon') && 
                   !urlLower.includes('apple-touch-icon') &&
                   (!logoUrlString || urlLower !== logoUrlString);
          })
          .slice(0, 30);
      } else {
        finalImageUrls = finalImageUrls.slice(0, 30);
      }

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
      
      if (prioritizedColors.length > 0) {
        extractedData.push({
          type: "style" as const,
          label: "Paleta de colores",
          value: `${prioritizedColors.length} colores principales: ${prioritizedColors.slice(0, 3).join(', ')}`,
          confidence: "high" as const,
        });
      }

      if (finalImageUrls.length > 0) {
        extractedData.push({
          type: "style" as const,
          label: "Recursos visuales",
          value: `${finalImageUrls.length} imágenes encontradas`,
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
        images: finalImageUrls,
        scripts,
        fonts,
        colors: prioritizedColors.slice(0, 10),
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

