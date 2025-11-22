# Post Generation System - Complete Flow

## Overview
Sistema completo para generar 3 posts de redes sociales con imágenes a partir de datos del wizardStore.

## Architecture

```
wizardStore Input
       ↓
Campaign Visualizer Agent (GPT-4)
       ↓
JSON con 3 descripciones
{"ID:1": "...", "ID:2": "...", "ID:3": "..."}
       ↓
    ┌──────┴──────┐
    ↓      ↓      ↓
Extractor1 Extractor2 Extractor3
(GPT-4o-mini)
    ↓      ↓      ↓
  Desc1   Desc2   Desc3
    ↓      ↓      ↓
Runway SDK - Gemini 2.5 Flash
(Image Generation)
    ↓      ↓      ↓
  Post1   Post2   Post3
(with images)
```

## API Endpoint

**POST** `/api/workflow/post-generation`

### Request Body
```json
{
  "inputs": {
    "name": "Platanus",
    "identity": "Aceleradora de startups",
    "urls": ["https://platan.us/"],
    "type": "servicio",
    "productName": "Programa de Aceleración"
  },
  "agentResponses": {
    "urlAnalyses": [{
      "logoUrl": "...",
      "images": ["..."],
      "summary": "..."
    }],
    "mcqAnswers": {
      "visual-style": "moderno",
      "visual-rhythm": "lento",
      "human-presence": "media"
    }
  }
}
```

### Response
```json
{
  "success": true,
  "posts": [
    {
      "id": 1,
      "description": "A sleek silver sports car speeds along...",
      "imageUrl": "https://storage.runwayml.com/..."
    },
    {
      "id": 2,
      "description": "The silver sports car is parked on a cliff...",
      "imageUrl": "https://storage.runwayml.com/..."
    },
    {
      "id": 3,
      "description": "An aerial view captures the silver sports car...",
      "imageUrl": "https://storage.runwayml.com/..."
    }
  ]
}
```

## Environment Variables

```bash
RUNWAY_API_KEY=your_runway_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

## Usage Example

```typescript
const wizardData = {
  inputs: {
    name: "Mi Marca",
    identity: "Empresa de tecnología",
    urls: ["https://example.com"],
    type: "servicio",
    productName: "App Móvil"
  },
  agentResponses: {
    urlAnalyses: [{
      logoUrl: "https://example.com/logo.png",
      images: ["https://example.com/hero.jpg"],
      summary: "Empresa innovadora..."
    }],
    mcqAnswers: {
      "visual-style": "moderno",
      "visual-rhythm": "rapido",
      "human-presence": "alta"
    }
  }
};

const response = await fetch('/api/workflow/post-generation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(wizardData)
});

const result = await response.json();
console.log(result.posts); // 3 posts con descripciones e imágenes
```

## Components

### 1. Campaign Visualizer Agent
- **Model**: GPT-4
- **Purpose**: Genera 3 conceptos visuales coherentes basados en brand imagery
- **Output**: JSON con 3 descripciones detalladas

### 2. Post Extractor Agents (x3)
- **Model**: GPT-4o-mini
- **Purpose**: Extrae individualmente cada descripción del JSON
- **Output**: Texto plano de cada descripción

### 3. Runway Image Generation
- **Model**: Gemini 2.5 Flash
- **Purpose**: Genera imágenes a partir de las descripciones
- **Ratio**: 1344:768 (optimizado para redes sociales)
- **Output**: URLs de imágenes generadas

## Error Handling

Si la generación de imagen falla para algún post, el sistema retorna:
```json
{
  "id": 1,
  "description": "...",
  "imageUrl": undefined,
  "imageError": "Error message here"
}
```

## Performance

- **Timeout**: 300 segundos (5 minutos)
- **Parallel Processing**: Las 3 imágenes se generan en paralelo
- **Average Time**: ~30-60 segundos para el flujo completo
