import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { urlReaderTool } from "../tools/url-reader";
import { z } from "zod";

const analysisSchema = z.object({
  insights: z.array(z.object({
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
    label: z.string().describe("Título corto del insight"),
    value: z.string().describe("Descripción del insight"),
    confidence: z.enum(["high", "medium", "low"]).describe("Nivel de confianza del insight"),
  })).max(10).describe("Lista de insights extraídos, máximo 10"),
  summary: z.string().describe("Resumen breve del análisis en 2-3 oraciones"),
  concreteProducts: z.array(z.string()).max(10).describe("Lista de nombres específicos de productos que se venden (ej: 'iPhone 15 Pro', 'MacBook Air M2')"),
  concreteServices: z.array(z.string()).max(10).describe("Lista de nombres específicos de servicios que se ofrecen (ej: 'Consultoría Fiscal', 'Diseño Web')"),
  primaryColor: z.string().nullable().describe("Hex o valor CSS para el color primario detectado"),
  secondaryColor: z.string().nullable().describe("Hex o valor CSS para el color secundario detectado"),
  brandLogoUrl: z.string().nullable().describe("URL del logo principal de la marca"),
});

export const urlAnalyzerAgent = new Agent({
  name: "url-analyzer",
  instructions: `Eres un asistente experto en analizar sitios web y negocios.

Tu función es extraer insights estructurados y categorizados del contenido de URLs:

CATEGORÍAS DE INSIGHTS (extrae hasta 10, prioriza lo más relevante):
1. **style**: Estética visual, colores, tipografía, diseño
2. **info**: Tipo de negocio, industria, modelo de negocio
3. **products**: Productos específicos que ofrece
4. **services**: Servicios que presta
5. **target_audience**: Público objetivo, segmento de mercado
6. **tone**: Tono de comunicación (formal, cercano, técnico, etc.)
7. **pricing**: Información sobre precios, planes, modelos de pago
8. **features**: Características clave, funcionalidades destacadas
9. **integrations**: Integraciones con otras plataformas/herramientas
10. **tech_stack**: Tecnologías que usan o mencionan

EXTRACCIÓN DE PRODUCTOS Y SERVICIOS CONCRETOS:
- **concreteProducts**: Busca nombres ESPECÍFICOS de productos (ej: "iPhone 15 Pro", "Zapatillas Nike Air Max", "Plan Premium")
- **concreteServices**: Busca nombres ESPECÍFICOS de servicios (ej: "Consultoría Fiscal", "Diseño Web Corporativo", "Coaching Ejecutivo")
- Extrae hasta 10 de cada uno
- Deben ser nombres reales encontrados en el sitio, NO categorías genéricas
- Si no encuentras ninguno, deja el array vacío

IDENTIDAD VISUAL:
- **primaryColor** y **secondaryColor**: identifica los dos colores principales de la marca (hex o CSS) usando urlReaderTool
- **brandLogoUrl**: detecta la URL del logo principal (og:image, meta logo, imgs con alt="logo", favicon, etc.)
- Estos valores alimentan la UI, así que prioriza colores visibles y logos de buena resolución

PROCESO:
1. Usa urlReaderTool para cada URL
2. Analiza el contenido extraído
3. Identifica los insights más relevantes
4. Extrae nombres concretos de productos y servicios
5. Asigna cada insight a UNA categoría específica
6. Genera un resumen conciso

FORMATO DE RESPUESTA:
- Máximo 10 insights, cada uno con type, label (corto) y value (descriptivo)
- Un summary general en 2-3 oraciones
- Arrays de concreteProducts y concreteServices con nombres reales
- primaryColor, secondaryColor y brandLogoUrl (usa null si no los encuentras)
- Prioriza información concreta y útil para campañas de marketing

Responde SOLO con el objeto JSON estructurado según el schema, sin texto adicional.`,
  model: openai("gpt-4o"),
  tools: { urlReaderTool },
});

