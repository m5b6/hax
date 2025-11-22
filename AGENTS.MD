# AGENTS.md  
_Copiloto de Campañas · Dark Apple · Liquid Glass · Chromatic Highlights_

## Project overview
Este proyecto es un **copiloto para campañas marketing, ads, etc**, con una experiencia tipo **Apple Intelligence en dark mode**: superficies de **glass oscuro**, **gradientes cromáticos suaves** y **transiciones fluidas**.

Los agentes (Mastra) trabajan detrás de escena; el foco principal es la **interacción visual y conversacional** usando **Vercel AI SDK UI (Generative UI + streaming)**.  
Todo el contenido visible es en **español**.

---

## Core UX goals
- Sensación de **asistente inteligente**, no formulario.
- Flujo tipo **wizard**: pocos pasos, muy guiados.
- La interfaz **cambia progresivamente** a medida que los agentes responden.
- Siempre mostrar **un solo foco** en pantalla (una pregunta, un bloque de resultado, una decisión).
- El usuario debe sentir: “esto entiende mi negocio y arma la campaña conmigo”.

---

## Input model (lo que el usuario entrega)
Inicio del wizard:

1. **Quién eres**
   - Campo de texto libre para describir el negocio/persona.
   - Tono cercano, instrucciones claras.

2. **Tus URLs**
   - Lista editable de URLs relevantes (sitio, redes, landing).

3. **Qué quieres vender**
   - Selector simple: **Producto** / **Servicio**.
   - Campo para nombre del producto/servicio.

Los agentes usan estos datos como contexto base para todo lo demás.

---

## Output model (lo que el usuario recibe)
Al final del flujo, el usuario ve un **resumen visual y legible** con:

- Mensaje central de la campaña.
- Variantes de **copy para anuncios** (títulos, descripciones, hooks).
- Sugerencias de **segmentación/públicos**.
- Ideas de **creatividades** (conceptos visuales, líneas de texto).
- Parámetros de campaña recomendados (objetivos, enfoque de entrega, etc.), descritos en lenguaje natural.

Los resultados deben estar organizados en secciones claras, con jerarquía visual, listas compactas y texto fácil de copiar.

---

## Interaction & agent streaming
- Toda la interacción clave se modela como **componentes generados con Vercel AI SDK UI**, usando **streaming**.
- Los agentes (Mastra) generan:
  - Preguntas de seguimiento como **múltiple elección**.
  - Bloques de texto explicativos.
  - Opciones que el usuario puede seleccionar con un solo clic.
- Ejemplos de preguntas:
  - “¿A quién quieres vender?” con 3–5 opciones.
  - “¿Dónde quieres enfocarte?” (ciudades, regiones, online).
  - “¿Qué tono prefieres para tus anuncios?” (formal, cercano, divertido, premium).

A medida que el modelo streaméa su respuesta:
- El contenido aparece progresivamente (línea por línea o bloque por bloque).
- El usuario ve claramente que el sistema está “pensando” y afinando la propuesta.

---

## Visual style & motion
**Estilo general:**

- **Dark Apple**:
  - Fondo oscuro suave, no negro puro.
  - Glass panels blancos translúcidos con blur profundo.
- **Liquid glass**:
  - Superficies blancas semitransparentes, bordes suaves, brillo sutil.
- **Chromatic highlights**:
  - Gradientes suaves inspirados en Apple Intelligence (azules, violetas, cian, fucsia), usados solo como acentos.
- **Tipografía**:
  - Pocas jerarquías, mucho espacio, lectura cómoda.

**Comportamiento visual:**

- Cada nueva pregunta o resultado entra con una animación corta, fluida, tipo "fade + scale" o "slide + blur".
- Cuando se analizan URLs, el input obtiene un **ring glow** sutil y el fondo se anima con `ColorBends`
- Cuando los agentes descubren colores de marca, la interfaz se **tintea** dinámicamente con esa identidad:
  - El componente `ColorBends` cambia de cromático a colores de marca específicos
  - Gradiente de fondo totalmente personalizado según la marca del usuario
  - Transición suave entre estados (sin colores → analizando → colores personalizados)
  - Acentos de color en botones y resaltados
- Estados visuales de análisis:
  - **Analizando**: Ring azul-púrpura giratorio con pulsos expandiéndose
  - **Completado**: Checkmark verde en círculo con sombra brillante
  - **Transición**: Suave fade entre estados con AnimatePresence
- Evitar saturación: máximo 1–2 gradientes relevantes por pantalla, mucho negro/oscuro y aire.

---

## Flow overview (wizard)
1. **Paso 1 — Identidad**
   - Inputs: quién eres, URLs, qué vendes.
   - UI muy limpia, pocas decisiones.

2. **Paso 2 — Profundización**
   - Agentes generan preguntas de múltiple elección.
   - Usuario responde haciendo clic; la UI se adapta a las elecciones.

3. **Paso 3 — Ajuste de estrategia**
   - Más preguntas específicas sobre público, tono, objetivo (ventas, leads, awareness).
   - Mostrar breves resúmenes intermedios para que el usuario vea el “perfil de su campaña” formarse.

4. **Paso 4 — Resultado final**
   - Pantalla tipo “documento vivo” con:
     - resumen de la campaña,
     - copys,
     - públicos,
     - recomendaciones.
   - Todo presentado dentro de un gran panel de glass blanco, con un gradiente sutil y sensación de "entrega final".

---

## Guidelines for agents
- Mantener siempre el **contexto del usuario** visible o fácilmente accesible (resumen corto de quién es y qué vende).
- Generar **pocas opciones, muy claras** (3–5 por pregunta).
- Preguntas y resultados siempre en **español neutro**, tono profesional pero cercano.
- No abrumar con tecnicismos de marketing: explicar conceptos con claridad.
- Priorizar respuestas que se puedan **usar tal cual** en campañas reales, sin mucha edición manual.

## Agent streaming guidelines
**Usa streaming para agentes conversacionales** — es fundamental para la experiencia interactiva:

### Cuándo usar streaming vs. generate:
- **Streaming (`agent.stream()`)**: Ideal para conversaciones interactivas, contenido largo, o cuando se necesita retroalimentación progresiva
- **Generate (`agent.generate()`)**: Para análisis de datos estructurados, extracción de información, o cuando se necesita la respuesta completa antes de procesarla (ej: análisis de URLs)

### Para agentes con streaming:

1. **Configuración del agente**:
   - Usar `agent.stream()` con `format: "aisdk"` para compatibilidad con AI SDK v5
   - Retornar `stream.toDataStreamResponse()` desde API routes

2. **API Routes**:
   - Usar Node.js runtime (no edge) ya que Mastra requiere Node.js streams
   - Validar inputs antes de llamar al agente
   - Manejar errores gracefully con respuestas JSON apropiadas

3. **Client-side handling**:
   - Usar `fetch` con `ReadableStream` para procesar chunks
   - Decodificar con `TextDecoder` y parsear líneas que empiezan con `"0:"`
   - Mostrar contenido progresivamente a medida que llega
   - Agregar indicadores visuales elegantes (anillos giratorios con gradientes, pulsos de luz)

4. **UX durante streaming/analyzing**:
   - **Indicadores de estado elegantes**:
     - Anillos animados con gradientes (blue-purple) para loading
     - Checkmark en círculo verde con sombra para completado
     - Rings con pulsos expandiéndose para estado activo
     - Transiciones de input: ring glow sutil cuando está analizando
   - **EVITAR**: Iconos literales (Brain, Sparkles, etc) que se ven fuera de lugar
   - **USAR**: Formas geométricas abstractas con gradientes cromáticos
   - Texto apareciendo progresivamente en tiempo real
   - Deshabilitar inputs durante el streaming para evitar llamadas duplicadas
   - Mostrar resultados en contenedores con gradientes suaves (glass panels)

### Para agentes con generate:

1. **Configuración**:
   - Usar `agent.generate()` con schema de salida (`output: schema`)
   - Retornar JSON estructurado

2. **Ejemplo**:
```typescript
const result = await agent.generate(prompt, { output: schema });
const parsed = typeof result.text === 'string' ? JSON.parse(result.text) : result.text;
return new Response(JSON.stringify(parsed));
```

---

## Experience goal
El objetivo principal para todos los agentes:

Crear una experiencia que se sienta como:

> “Un asistente oscuro, elegante, líquido y cromático, que conversa conmigo, entiende mi negocio y me entrega una campaña lista para lanzar.”

Todo lo que los agentes diseñen, generen o ajusten debe empujar hacia esa sensación.
