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
  concreteProducts: z.array(z.object({
    name: z.string().describe("Nombre específico del producto"),
    icon: z.string().optional().describe("Nombre del icono de lucide-react que mejor representa el producto (ej: 'Package', 'Smartphone', 'Laptop')"),
    color: z.string().optional().describe("Color hex que mejor representa el producto (ej: '#3B82F6', '#8B5CF6')"),
  })).max(10).describe("Lista de productos específicos con nombre, icono opcional y color opcional"),
  concreteServices: z.array(z.object({
    name: z.string().describe("Nombre específico del servicio"),
    icon: z.string().optional().describe("Nombre del icono de lucide-react que mejor representa el servicio (ej: 'Briefcase', 'Code', 'Users')"),
    color: z.string().optional().describe("Color hex que mejor representa el servicio (ej: '#10B981', '#F59E0B')"),
  })).max(10).describe("Lista de servicios específicos con nombre, icono opcional y color opcional"),
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

IDENTIDAD VISUAL (PRIORIDAD MÁXIMA):
- **primaryColor** y **secondaryColor**: SIEMPRE identifica los dos colores principales de la marca. Prioriza detectar combinaciones hex/RGB reales usadas en el sitio (botones, fondos, gradientes, theme-color). Evita colores blancos o casi blancos (#fff, #ffffff, #fefefe) salvo que sea literalmente la identidad oficial; si ves mucho blanco busca el siguiente color predominante en CTAs o acentos. Si no los encuentras, vuelve a intentar con otros estilos. Solo responde null como último recurso.
- **brandLogoUrl**: Debes localizar el LOGO principal (no cualquier imagen). Busca meta og:logo, og:image, itemprop=logo, imágenes con alt o nombre que contenga “logo”, SVGs de logotipos, favicons de alta resolución. Evita mockups, fotos o ilustraciones. Si hay varios, elige el más representativo de la marca. Solo si no existe, devuelve null.

EXTRACCIÓN DE PRODUCTOS Y SERVICIOS CONCRETOS:
- **concreteProducts**: Busca nombres ESPECÍFICOS de productos (ej: "iPhone 15 Pro", "Zapatillas Nike Air Max", "Plan Premium")
  - Para cada producto, asigna un **icon** (nombre de icono de lucide-react como 'Package', 'Smartphone', 'Laptop', 'Headphones', etc.)
  - Asigna un **color** hex que represente visualmente el producto (usa colores vibrantes pero apropiados)
- **concreteServices**: Busca nombres ESPECÍFICOS de servicios (ej: "Consultoría Fiscal", "Diseño Web Corporativo", "Coaching Ejecutivo")
  - Para cada servicio, asigna un **icon** (nombre de icono de lucide-react como 'Briefcase', 'Code', 'Users', 'GraduationCap', etc.)
  - Asigna un **color** hex que represente visualmente el servicio
- Extrae hasta 10 de cada uno
- Deben ser nombres reales encontrados en el sitio, NO categorías genéricas
- Los iconos y colores son opcionales pero muy recomendados para mejorar la UI
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
- Arrays de concreteProducts y concreteServices con objetos que incluyen name, icon (opcional) y color (opcional)
- primaryColor, secondaryColor y brandLogoUrl (usa null solo si realmente no existen tras buscar exhaustivamente)
- Prioriza información concreta y útil para campañas de marketing

Responde SOLO con el objeto JSON estructurado según el schema, sin texto adicional.`,
  model: openai("gpt-4o"),
  tools: { urlReaderTool },
});

