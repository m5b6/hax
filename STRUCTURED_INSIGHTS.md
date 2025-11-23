# Structured URL Insights

## Overview
The URL analyzer now extracts **structured insights** from URLs, categorizing them into up to 10 different types with visual icon representations.

## Insight Categories

| Type | Icon | Description | Example |
|------|------|-------------|---------|
| `style` | 🎨 Palette | Visual aesthetics, colors, typography | "Color principal: #4F46E5" |
| `info` | ℹ️ Info | Business type, industry, model | "Tipo de negocio: SaaS / Software" |
| `products` | 📦 Package | Specific products offered | "Sistema de gestión integral" |
| `services` | 💼 Briefcase | Services provided | "Automatización de reservas" |
| `target_audience` | 👥 Users | Target market, customer segment | "Centros de deporte y salud" |
| `tone` | 💬 MessageCircle | Communication style | "Profesional pero cercano" |
| `pricing` | 💰 DollarSign | Pricing info, plans | "Planes desde $XX/mes" |
| `features` | ⚡ Zap | Key features, functionality | "Automatización con IA" |
| `integrations` | 🔌 Plug | Platform integrations | "Integra con WhatsApp, SII" |
| `tech_stack` | 💻 Code | Technologies used | "Built with React + AI" |

## Data Structure

### Zod Schema
```typescript
const analysisSchema = z.object({
  insights: z.array(z.object({
    type: z.enum([
      "style", "info", "products", "services", 
      "target_audience", "tone", "pricing", 
      "features", "integrations", "tech_stack"
    ]),
    label: z.string(),        
    value: z.string(),        
    confidence: z.enum(["high", "medium", "low"]).optional(),
  })).max(10),
  summary: z.string(),
});
```

### Example Response
```json
{
  "success": true,
  "data": {
    "insights": [
      {
        "type": "info",
        "label": "Tipo de negocio",
        "value": "Plataforma SaaS para gestión de centros deportivos",
        "confidence": "high"
      },
      {
        "type": "features",
        "label": "Automatización",
        "value": "Sistema inteligente con IA para automatizar tareas",
        "confidence": "high"
      },
      {
        "type": "target_audience",
        "label": "Público objetivo",
        "value": "Centros de deporte, salud y bienestar",
        "confidence": "high"
      }
    ],
    "summary": "Vita es una plataforma integral para gestión de centros..."
  }
}
```

## UI Features

### Icon Stack on Input
When a URL is analyzed, up to 5 insight icons appear in a stacked formation on the right side of the input:

- **Loading**: Rotating Sparkles icon while analyzing
- **Success**: Gradient circular icons with category symbols
- **Overflow**: "+N" badge if more than 5 insights

### Insight Cards
Below the URL inputs, detailed cards show all insights with:
- Category icon (gradient background)
- Label (bold)
- Value (description)
- 2-column responsive grid layout

## Agent Configuration

### URL Reader Tool
Extracts raw content + basic categorization from HTML:
```typescript
urlReaderTool.execute({ url }) 
// Returns: { title, description, content, extractedData[] }
```

### URL Analyzer Agent
Uses GPT-4 with structured output to generate categorized insights:
```typescript
urlAnalyzerAgent.generate(prompt, {
  structuredOutput: { schema: analysisSchema }
})
```

## Usage

### Frontend (React)
```typescript
const [urlAnalyses, setUrlAnalyses] = useState<Map<string, URLAnalysis>>(new Map());

const analyzeUrl = async (url: string) => {
  const response = await fetch("/api/agent/analyze-urls", {
    method: "POST",
    body: JSON.stringify({ urls: [url] }),
  });
  const result = await response.json();
  setUrlAnalyses(prev => new Map(prev).set(url, {
    url,
    insights: result.data.insights,
  }));
};
```

### Backend (API Route)
```typescript
const agent = mastra.getAgent("urlAnalyzerAgent");
const result = await agent.generate(prompt, {
  structuredOutput: { schema: analysisSchema }
});
return NextResponse.json({ 
  success: true, 
  data: result.object 
});
```

## Visual Design

- **Icon Stack**: Overlapping circles with -space-x-1
- **Gradient**: from-blue-500 to-purple-500
- **Animation**: Scale + stagger entrance (0.1s delay per icon)
- **Tooltip**: Title attribute shows insight label
- **Border**: 2px white border for separation

## Benefits

1. ✅ **Structured Data**: Machine-readable insights for campaign planning
2. 🎨 **Visual Feedback**: Immediate understanding of what was extracted
3. ⚡ **Fast Scanning**: Icons allow quick identification of insight types
4. 📊 **Consistent Format**: Same structure for all URLs analyzed
5. 🎯 **Marketing-Ready**: Insights organized for ad campaign creation





