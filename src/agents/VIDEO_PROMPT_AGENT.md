# Agente de Generación de Prompts para Video

## Descripción
Este agente transforma matrices de contenido y briefs de diseño en prompts de alta calidad para modelos de generación de video (Pika, Runway, Veo 3).

## Endpoint
`POST /api/agent/video-prompt`

## Input Schema

```typescript
{
  contentMatrix: {
    // Matriz de contenido con fases del video
    phases: Array<{
      phase: string;        // ej: "GANCHO", "CONTEXTO", "VALOR/DEMO", "CTA FINAL"
      timeRange: string;    // ej: "0-1s", "1-3s", "3-6s", "6-8s"
      action: string;       // Qué se quiere lograr en ese segmento
      instructions?: string; // Instrucciones adicionales (SFX, efectos, etc)
    }>
  };
  designBrief?: {
    // Información de diseño/marca (opcional)
    product?: string;
    service?: string;
    targetAudience?: string;
    mainPain?: string;
    mainBenefit?: string;
    brandColors?: string[];
    mood?: string;
    platform?: string;
    format?: string;
  };
  imageDescription?: string; // Descripción de imagen de entrada (opcional)
}
```

## Output Structure

El agente genera un prompt estructurado en español con las siguientes secciones:

- 🧠 **Prompt de Video IA de Alta Calidad**
- 🎯 **Título del Prompt** - Título descriptivo corto
- 🟡 **Visual** - Descripción de la escena principal
- 📸 **Perspectiva** - Formato de cámara, shots y movimientos
- 💡 **Iluminación** - Dirección, intensidad y mood de la luz
- 🎨 **Estilo** - Estética visual y nivel de detalle
- 🕒 **Estructura (Timeline)** - Descripción detallada por segmento de tiempo
- 🧲 **Gatillo Viral** - Elementos que hacen el video engaging

## Ejemplo de Uso

### Input
```json
{
  "contentMatrix": {
    "phases": [
      {
        "phase": "GANCHO",
        "timeRange": "0-1s",
        "action": "Detener el scroll",
        "instructions": "Fast zoom con efecto glitch, SFX disruptivo"
      },
      {
        "phase": "CONTEXTO",
        "timeRange": "1-3s",
        "action": "Mostrar el dolor/problema",
        "instructions": "Subtítulos claros con palabras clave"
      },
      {
        "phase": "VALOR/DEMO",
        "timeRange": "3-6s",
        "action": "Presentar la solución",
        "instructions": "Antes/después visual, mantener CTA constante al 70% de opacidad"
      },
      {
        "phase": "CTA FINAL",
        "timeRange": "6-8s",
        "action": "Llamado a la acción",
        "instructions": "CTA debe decir: 'Asesoría GRATIS por WA', añadir urgencia"
      }
    ]
  },
  "designBrief": {
    "service": "Asesoría de marketing digital",
    "targetAudience": "Emprendedores y pequeñas empresas",
    "mainPain": "No saben cómo generar ventas online",
    "mainBenefit": "Estrategia clara y personalizada para vender más",
    "brandColors": ["#25D366", "#128C7E"],
    "mood": "Profesional pero cercano",
    "platform": "Instagram Reels",
    "format": "9:16 vertical"
  }
}
```

### Uso desde el frontend

```typescript
async function generateVideoPrompt(data: VideoPromptInput) {
  const response = await fetch('/api/agent/video-prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  // Streaming response
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let prompt = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      if (line.startsWith('0:')) {
        const content = JSON.parse(line.slice(2));
        prompt += content;
      }
    }
  }

  return prompt;
}
```

## Características Clave

1. **Streaming**: La respuesta se genera progresivamente para una mejor UX
2. **Multilingüe**: Acepta input en cualquier idioma, siempre responde en español
3. **Flexible**: Puede trabajar solo con contentMatrix o con información adicional
4. **Cinematográfico**: Transforma instrucciones de marketing en descripciones visuales
5. **Optimizado para IA**: Output diseñado específicamente para modelos de generación de video

## Notas Importantes

- El agente NO genera copy publicitario, solo describe visualmente el video
- Todas las instrucciones de marketing se traducen a elementos visuales concretos
- El output está optimizado para herramientas como Pika, Runway y Veo 3
- Siempre genera en español, independientemente del idioma de entrada
