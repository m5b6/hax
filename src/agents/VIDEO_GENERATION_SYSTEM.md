# Sistema Completo de Generación de Video con IA

## 🎯 Visión General

Este sistema implementa un flujo completo de generación de contenido para video usando múltiples agentes de IA que trabajan en coordinación:

1. **Agente de Prompt de Imagen** → Genera un prompt optimizado para crear la imagen inicial
2. **Generación de Imagen** → Se usa el prompt para generar la imagen (DALL-E, Midjourney, etc.)
3. **Agente de Prompt de Video** → Recibe la imagen y genera el prompt para el video completo

---

## 🤖 Agentes Disponibles

### 1. Image Prompt Agent
**Archivo:** [`image-prompt-agent.ts`](file:///Users/ianfryastorga/hax/src/agents/image-prompt-agent.ts)  
**Endpoint:** `POST /api/agent/image-prompt`  
**Propósito:** Generar prompts optimizados para modelos de generación de imágenes

**Input:**
```typescript
{
  contentMatrix: {
    phases: Array<{
      phase: string;
      timeRange: string;
      action: string;
      instructions?: string;
    }>
  };
  designBrief?: { ... };
  targetPhase?: string; // "GANCHO", "CONTEXTO", "VALOR/DEMO", "CTA FINAL"
}
```

**Output Structure:**
- 🖼️ Prompt de Imagen para Generación de Video
- 🎯 Propósito de la Imagen
- 📝 Prompt Principal
- 🎨 Estilo Visual
- 🎨 Paleta de Colores
- 📐 Composición
- ⚡ Elementos Clave
- 💡 Palabras Clave Técnicas

### 2. Video Prompt Agent
**Archivo:** [`video-prompt-agent.ts`](file:///Users/ianfryastorga/hax/src/agents/video-prompt-agent.ts)  
**Endpoint:** `POST /api/agent/video-prompt`  
**Propósito:** Generar prompts de video para Pika, Runway, Veo 3

**Input:**
```typescript
{
  contentMatrix: { ... };
  designBrief?: { ... };
  imageDescription?: string;
}
```

**Output Structure:**
- 🧠 Prompt de Video IA de Alta Calidad
- 🎯 Título del Prompt
- 🟡 Visual
- 📸 Perspectiva
- 💡 Iluminación
- 🎨 Estilo
- 🕒 Estructura (Timeline)
- 🧲 Gatillo Viral

---

## 🔄 Workflow Orquestado

### Video Generation Workflow
**Archivo:** [`workflow/video-generation/route.ts`](file:///Users/ianfryastorga/hax/src/app/api/workflow/video-generation/route.ts)  
**Endpoint:** `POST /api/workflow/video-generation`

Este endpoint coordina el flujo completo y maneja dos escenarios:

#### Escenario 1: Generar Todo (Sin Imagen)
```typescript
// Request
{
  contentMatrix: { ... },
  designBrief: { ... },
  targetPhase: "GANCHO" // opcional
}

// Response Stream:
// 1. { step: "image-prompt", status: "generating" }
// 2. { step: "image-prompt", status: "complete", data: "..." }
// 3. { step: "image-generation", status: "waiting", message: "..." }
// Se detiene aquí - el usuario debe generar la imagen
```

#### Escenario 2: Continuar con Imagen (Con imageUrl)
```typescript
// Request
{
  contentMatrix: { ... },
  designBrief: { ... },
  imageUrl: "https://..." // URL de la imagen generada
}

// Response Stream:
// 1. { step: "image-prompt", status: "generating" }
// 2. { step: "image-prompt", status: "complete", data: "..." }
// 3. { step: "image-url", status: "received", data: "https://..." }
// 4. { step: "video-prompt", status: "generating" }
// 5. { step: "video-prompt", status: "complete", data: "..." }
// 6. { step: "workflow", status: "complete" }
```

---

## 💻 Ejemplos de Uso

### Uso Individual de Agentes

#### Generar Solo Prompt de Imagen
```typescript
const response = await fetch('/api/agent/image-prompt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contentMatrix: {
      phases: [
        {
          phase: "GANCHO",
          timeRange: "0-1s",
          action: "Detener el scroll",
          instructions: "Fast zoom con efecto glitch"
        }
      ]
    },
    targetPhase: "GANCHO"
  })
});

// Streaming response...
```

#### Generar Solo Prompt de Video
```typescript
const response = await fetch('/api/agent/video-prompt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contentMatrix: { ... },
    imageDescription: "Imagen de emprendedor frustrado mirando laptop..."
  })
});
```

### Uso del Workflow Completo

```typescript
async function generateVideoContent(contentMatrix, designBrief) {
  // PASO 1: Iniciar workflow
  const response = await fetch('/api/workflow/video-generation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentMatrix, designBrief })
  });

  // Procesar stream
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let imagePrompt = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const event = JSON.parse(line.slice(6));
        
        if (event.step === 'image-prompt' && event.status === 'complete') {
          imagePrompt = event.data;
          console.log('Prompt de imagen generado:', imagePrompt);
        }
        
        if (event.step === 'image-generation' && event.status === 'waiting') {
          // El workflow se detiene aquí
          break;
        }
      }
    }
  }

  // PASO 2: Usuario genera la imagen usando imagePrompt
  const imageUrl = await generateImageWithExternalService(imagePrompt);

  // PASO 3: Continuar workflow con imagen
  const response2 = await fetch('/api/workflow/video-generation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      contentMatrix, 
      designBrief,
      imageUrl // Ahora incluimos la URL de la imagen
    })
  });

  // Procesar stream para obtener el prompt de video
  const reader2 = response2.body.getReader();
  let videoPrompt = '';

  while (true) {
    const { done, value } = await reader2.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const event = JSON.parse(line.slice(6));
        
        if (event.step === 'video-prompt' && event.status === 'complete') {
          videoPrompt = event.data;
          console.log('Prompt de video generado:', videoPrompt);
        }
      }
    }
  }

  return { imageUrl, videoPrompt };
}
```

---

## 🎨 Ejemplo Completo

### Input
```json
{
  "contentMatrix": {
    "phases": [
      {
        "phase": "GANCHO",
        "timeRange": "0-1s",
        "action": "Detener el scroll",
        "instructions": "Fast zoom con glitch, SFX disruptivo"
      },
      {
        "phase": "CONTEXTO",
        "timeRange": "1-3s",
        "action": "Mostrar el dolor",
        "instructions": "Subtítulos con palabras clave"
      },
      {
        "phase": "VALOR/DEMO",
        "timeRange": "3-6s",
        "action": "Presentar solución",
        "instructions": "Antes/después, CTA constante al 70% opacidad"
      },
      {
        "phase": "CTA FINAL",
        "timeRange": "6-8s",
        "action": "Llamado a acción",
        "instructions": "CTA: 'Asesoría GRATIS por WA', urgencia"
      }
    ]
  },
  "designBrief": {
    "service": "Asesoría de marketing digital",
    "targetAudience": "Emprendedores",
    "mainPain": "No saben generar ventas online",
    "mainBenefit": "Estrategia clara para vender más",
    "brandColors": ["#25D366", "#128C7E"],
    "mood": "Profesional pero cercano"
  }
}
```

### Output del Image Prompt Agent
```
🖼️ Prompt de Imagen para Generación de Video

🎯 Propósito de la Imagen:
Esta imagen es para la fase GANCHO del video, diseñada para detener el scroll inmediatamente.

📝 Prompt Principal:
Primer plano cinematográfico vertical 9:16 de un emprendedor joven frustrado mirando intensamente una laptop con gráficas de ventas en declive en pantalla roja, expresión genuina de preocupación, lighting dramático con luz azul-verde de la pantalla en oficina moderna oscura, composición que permite zoom rápido, alta calidad 8K, estilo fotorrealista profesional, tonos oscuros con acentos en verde WhatsApp (#25D366).

[...]
```

### Output del Video Prompt Agent
```
🧠 Prompt de Video IA de Alta Calidad

🎯 Título del Prompt:
Emprendedor Descubre Estrategia de Marketing

🟡 Visual:
Video vertical 9:16 que inicia con un emprendedor frustrado frente a laptop mostrando métricas en rojo...

[...]
```

---

## 📁 Estructura de Archivos

```
src/
├── agents/
│   ├── index.ts                    # Registro de agentes en Mastra
│   ├── image-prompt-agent.ts      # ✨ Agente de prompts de imagen
│   ├── video-prompt-agent.ts      # ✨ Agente de prompts de video
│   └── url-agent.ts               # Agente de análisis de URLs
│
└── app/api/
    ├── agent/
    │   ├── image-prompt/
    │   │   └── route.ts           # API del agente de imagen
    │   └── video-prompt/
    │       └── route.ts           # API del agente de video
    │
    └── workflow/
        └── video-generation/
            └── route.ts           # ✨ Orquestador del flujo completo
```

---

## 🚀 Próximos Pasos

1. **Integración con generador de imágenes**: Conectar con DALL-E, Midjourney API, o Stable Diffusion
2. **UI Components**: Crear componentes React para el wizard de generación
3. **Caché**: Implementar caché para prompts generados
4. **Validación**: Añadir validación de schemas con Zod
5. **Testing**: Tests unitarios y de integración

---

## 📚 Recursos Adicionales

- [Documentación Video Prompt Agent](file:///Users/ianfryastorga/hax/src/agents/VIDEO_PROMPT_AGENT.md)
- [Guías del Proyecto](file:///Users/ianfryastorga/hax/AGENTS.MD)
