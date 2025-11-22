import { NextResponse } from "next/server";
import { mastra } from "@/mastra";
import RunwayML from "@runwayml/sdk";

export const maxDuration = 300;

const runwayClient = new RunwayML({
    apiKey: process.env.RUNWAY_API_KEY,
});

import probe from 'probe-image-size';

async function validateImageUrl(url: string): Promise<string | null> {
    try {
        // Use probe-image-size to get image metadata without downloading the full file
        const result = await probe(url);

        // Check Content-Type (probe returns 'mime')
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(result.mime)) {
            console.warn(`Invalid content type for ${url}: ${result.mime}`);
            return null;
        }

        // Check Content-Length if available (Runway limit is 16MB for URLs)
        // probe might return 'length' if the server sends Content-Length header
        if (result.length) {
            const maxSizeInBytes = 16 * 1024 * 1024; // 16MB
            if (result.length > maxSizeInBytes) {
                console.warn(`Image too large for ${url}: ${result.length} bytes`);
                return null;
            }
        }

        // Check Aspect Ratio
        // Runway limit: width / height ratio must be at most 2.286
        const aspectRatio = result.width / result.height;
        if (aspectRatio > 2.286) {
            console.warn(`Image aspect ratio too wide for ${url}: ${aspectRatio.toFixed(3)} (Max 2.286)`);
            return null;
        }

        // If we got here, the URL is valid and dimensions are safe.
        return result.url; // probe follows redirects and returns the final URL
    } catch (error) {
        console.error(`Error validating image URL ${url}:`, error);
        return null;
    }
}

interface WizardStoreInput {
    inputs: {
        name: string;
        identity: string;
        urls: string[];
        type: string;
        productName: string;
    };
    agentResponses: {
        urlAnalyses: Array<{
            logoUrl?: string;
            images?: string[];
            summary?: string;
            colors?: string[];
            primaryColor?: string;
            secondaryColor?: string;
            [key: string]: any;
        }>;
        selectionStack?: Array<{
            id: string;
            text: string;
            icon: string;
            color: string;
        }>;
        mcqQuestions?: any[];
        mcqAnswers?: {
            "visual-style"?: string;
            "visual-rhythm"?: string;
            "human-presence"?: string;
        };
    };
    metadata: {
        createdAt: string;
        updatedAt: string;
        currentStep: number;
    };
}

interface PostGenerationResult {
    success: boolean;
    posts: Array<{
        id: number;
        description: string;
        caption: string;
        imageUrl?: string;
        imageError?: string;
    }>;
    error?: string;
}

export async function POST(req: Request) {
    try {
        const wizardData: WizardStoreInput = await req.json();

        const brandName = wizardData.inputs.name;
        const brandIdentity = wizardData.inputs.identity;
        const productName = wizardData.inputs.productName;
        const productType = wizardData.inputs.type;
        const urlAnalysis = wizardData.agentResponses.urlAnalyses?.[0];
        const logoUrl = urlAnalysis?.logoUrl;
        const images = urlAnalysis?.images || [];
        const summary = urlAnalysis?.summary;
        const brandColors = urlAnalysis?.colors || [];
        const primaryColor = urlAnalysis?.primaryColor;
        const secondaryColor = urlAnalysis?.secondaryColor;
        const mcqAnswers = wizardData.agentResponses.mcqAnswers || {};
        const mcqQuestions = wizardData.agentResponses.mcqQuestions || [];
        const selectionStack = wizardData.agentResponses.selectionStack || [];

        const visualStyleId = mcqAnswers["visual-style"];
        const visualRhythmId = mcqAnswers["visual-rhythm"];
        const humanPresenceId = mcqAnswers["human-presence"];

        const getMcqOptionDetails = (questionId: string, optionId: string | undefined) => {
            if (!optionId) return null;
            const question = mcqQuestions.find((q: any) => q.id === questionId);
            if (!question) return null;
            const option = question.options?.find((opt: any) => opt.id === optionId);
            return option || null;
        };

        const visualStyleOption = getMcqOptionDetails("visual-style", visualStyleId);
        const visualRhythmOption = getMcqOptionDetails("visual-rhythm", visualRhythmId);
        const humanPresenceOption = getMcqOptionDetails("human-presence", humanPresenceId);

        const allBrandColors = [
            primaryColor,
            secondaryColor,
            ...brandColors
        ].filter((color): color is string => Boolean(color) && typeof color === 'string');

        const colorPalette = allBrandColors.length > 0 
            ? allBrandColors.slice(0, 5).join(', ')
            : 'No brand colors detected';

        const selectionStackContext = selectionStack
            .filter(item => item.id !== 'brand-logo' && item.id !== 'first-pick')
            .map(item => `${item.text} (${item.color})`)
            .join(', ');

        const campaignPrompt = `
🎨 BRIEF DE MARCA - GENERACIÓN DE CONTENIDO INSTAGRAM POSTS

═══════════════════════════════════════════════════════════
📌 IDENTIDAD DE MARCA
═══════════════════════════════════════════════════════════

**Nombre de la Marca:** ${brandName}
**Identidad del Negocio:** ${brandIdentity}
**Tipo:** ${productType === 'producto' ? 'Producto' : 'Servicio'}
**Producto/Servicio Principal:** ${productName}

**Resumen del Negocio:**
${summary || 'No disponible'}

═══════════════════════════════════════════════════════════
🎨 IDENTIDAD VISUAL - COLORES DE MARCA
═══════════════════════════════════════════════════════════

**Paleta de Colores de la Marca:**
${colorPalette}

**Color Primario:** ${primaryColor || 'No detectado'}
**Color Secundario:** ${secondaryColor || 'No detectado'}

**INSTRUCCIÓN CRÍTICA:** DEBES usar estos colores de marca como BASE FUNDAMENTAL para todas las imágenes generadas. Los colores de marca NO son sugerencias, son REQUISITOS OBLIGATORIOS. Cada imagen debe incorporar estos colores de manera prominente y visible. Si hay múltiples colores, úsalos en combinación armoniosa. Si solo hay un color, úsalo como color dominante con acentos complementarios.

**Logo de la Marca:** ${logoUrl || 'No disponible'}
${logoUrl ? '**INSTRUCCIÓN:** El logo debe aparecer visiblemente en cada post, integrado de manera elegante y profesional.' : ''}

═══════════════════════════════════════════════════════════
✨ ELECCIONES VISUALES DEL CLIENTE
═══════════════════════════════════════════════════════════

**1. ESTILO VISUAL SELECCIONADO:**
${visualStyleOption ? `
- **Opción Elegida:** "${visualStyleOption.text}"
- **Color Asociado:** ${visualStyleOption.color}
- **Descripción:** ${visualStyleOption.description || 'N/A'}
- **Cómo se ve:** ${visualStyleOption.howItLooks || 'N/A'}
- **Por qué funciona:** ${visualStyleOption.whyItWorks || 'N/A'}
- **Útil para:** ${visualStyleOption.usefulFor || 'N/A'}
` : `- No seleccionado`}

**2. RITMO VISUAL SELECCIONADO:**
${visualRhythmOption ? `
- **Opción Elegida:** "${visualRhythmOption.text}"
- **Color Asociado:** ${visualRhythmOption.color}
- **Descripción:** ${visualRhythmOption.description || 'N/A'}
- **Cómo se ve:** ${visualRhythmOption.howItLooks || 'N/A'}
- **Por qué funciona:** ${visualRhythmOption.whyItWorks || 'N/A'}
- **Útil para:** ${visualRhythmOption.usefulFor || 'N/A'}
` : `- No seleccionado`}

**3. PRESENCIA HUMANA SELECCIONADA:**
${humanPresenceOption ? `
- **Opción Elegida:** "${humanPresenceOption.text}"
- **Color Asociado:** ${humanPresenceOption.color}
- **Descripción:** ${humanPresenceOption.description || 'N/A'}
- **Cómo se ve:** ${humanPresenceOption.howItLooks || 'N/A'}
- **Por qué funciona:** ${humanPresenceOption.whyItWorks || 'N/A'}
- **Útil para:** ${humanPresenceOption.usefulFor || 'N/A'}
` : `- No seleccionado`}

**Contexto de Selecciones Visuales:**
${selectionStackContext || 'No disponible'}

═══════════════════════════════════════════════════════════
🖼️ REFERENCIAS VISUALES DISPONIBLES
═══════════════════════════════════════════════════════════

**Imágenes de Referencia:** ${images.length > 0 ? `${images.length} imágenes disponibles` : 'No hay imágenes de referencia'}
${images.length > 0 ? `**Imagen Principal:** ${images[0]}` : ''}
${images.length > 1 ? `**Imágenes Adicionales:** ${images.slice(1, 4).join(', ')}` : ''}

**INSTRUCCIÓN:** Usa estas imágenes como referencia visual para mantener consistencia con el estilo fotográfico, composición, iluminación y estética general de la marca.

═══════════════════════════════════════════════════════════
📱 REQUISITOS TÉCNICOS
═══════════════════════════════════════════════════════════

- **Formato:** Instagram Post Cuadrado (1:1, ratio 1024:1024)
- **Cantidad:** 3 conceptos distintos y únicos
- **Estilo:** Cada concepto debe ser visualmente distinto pero mantener coherencia de marca
- **CAPTION:** Cada concepto DEBE incluir un caption profesional en ESPAÑOL que sea atractivo, relevante para la marca y optimizado para Instagram

═══════════════════════════════════════════════════════════
🎯 INSTRUCCIONES CRÍTICAS DE GENERACIÓN
═══════════════════════════════════════════════════════════

**OBLIGATORIO - USO DE COLORES DE MARCA:**
1. Los colores de marca (${colorPalette}) DEBEN ser el elemento visual dominante en cada imagen
2. Usa los colores de marca en fondos, acentos, textos, elementos gráficos, y cualquier elemento visual
3. Si hay múltiples colores, crea combinaciones armoniosas que los incorporen todos
4. Los colores de marca NO son opcionales - son la base de la identidad visual

**OBLIGATORIO - INTEGRACIÓN DEL LOGO:**
${logoUrl ? `1. El logo (${logoUrl}) DEBE aparecer visiblemente en cada post
2. Integra el logo de forma elegante, profesional y reconocible
3. El logo puede estar en esquinas, centrado, o integrado creativamente pero SIEMPRE visible` : '1. No hay logo disponible - enfócate en usar los colores de marca de forma prominente'}

**OBLIGATORIO - RESPETO A LAS ELECCIONES VISUALES:**
1. **Estilo Visual "${visualStyleOption?.text || visualStyleId}":** ${visualStyleOption?.howItLooks || 'Aplicar el estilo seleccionado'}
2. **Ritmo Visual "${visualRhythmOption?.text || visualRhythmId}":** ${visualRhythmOption?.howItLooks || 'Aplicar el ritmo seleccionado'}
3. **Presencia Humana "${humanPresenceOption?.text || humanPresenceId}":** ${humanPresenceOption?.howItLooks || 'Aplicar la presencia seleccionada'}

**OBLIGATORIO - DESTACAR EL PRODUCTO/SERVICIO:**
- El ${productType === 'producto' ? 'producto' : 'servicio'} "${productName}" debe ser el protagonista visual de cada post
- Integra "${productName}" de manera prominente y atractiva
- Usa los colores de marca para resaltar "${productName}"

**OBLIGATORIO - COHERENCIA DE MARCA:**
- Mantén consistencia visual entre las 3 posts
- Usa los mismos colores de marca en todas
- Integra el logo de forma consistente
- Respeta el estilo, ritmo y presencia humana seleccionados en todas las historias

**OBLIGATORIO - CAPTIONS EN ESPAÑOL:**
- Cada concepto DEBE incluir un caption profesional en ESPAÑOL
- El caption debe ser atractivo, relevante para la marca "${brandName}" y el producto/servicio "${productName}"
- Optimizado para engagement en Instagram (puede incluir emojis relevantes, llamados a la acción, hashtags sugeridos)
- Debe reflejar el tono y estilo de la marca

═══════════════════════════════════════════════════════════
✨ GENERA 3 CONCEPTOS DISTINTOS QUE:
═══════════════════════════════════════════════════════════

1. **Concepto 1:** Enfocado en ${visualStyleOption?.text || 'el estilo visual seleccionado'}, usando los colores de marca ${allBrandColors[0] || ''} como dominante, con ${humanPresenceOption?.text || 'la presencia humana seleccionada'}, ritmo ${visualRhythmOption?.text || 'seleccionado'}

2. **Concepto 2:** Variación del concepto 1 pero con enfoque diferente en la presentación de "${productName}", manteniendo los colores de marca ${allBrandColors[1] || allBrandColors[0] || ''} como acento principal

3. **Concepto 3:** Enfoque más ${visualRhythmOption?.text === 'rapido' ? 'dinámico y energético' : visualRhythmOption?.text === 'lento' ? 'sereno y cinematográfico' : 'equilibrado y profesional'}, destacando "${productName}" con los colores de marca en combinación completa

**RECUERDA:** Cada concepto debe ser ÚNICO visualmente pero mantener la coherencia de marca a través de los colores, logo, y elecciones visuales del cliente. Cada concepto debe tener un "description" (prompt de imagen en inglés) y un "caption" (caption de Instagram en español).
`;

        // Step 2: Generate campaign descriptions using the campaign visualizer
        console.log("🎨 Generating campaign descriptions...");
        const campaignAgent = mastra.getAgent("campaignVisualizerAgent");
        if (!campaignAgent) {
            return NextResponse.json({ success: false, error: "Campaign visualizer agent not found" }, { status: 500 });
        }
        const campaignResult = await campaignAgent.generate(campaignPrompt);

        console.log("Campaign result:", campaignResult.text);

        // Parse the JSON response
        let campaignDescriptions;
        try {
            // Try to extract JSON from the response
            const jsonMatch = campaignResult.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                campaignDescriptions = JSON.parse(jsonMatch[0]);
            } else {
                campaignDescriptions = JSON.parse(campaignResult.text);
            }
        } catch (parseError) {
            console.error("Error parsing campaign descriptions:", parseError);
            return NextResponse.json({
                success: false,
                error: "Failed to parse campaign descriptions",
                rawResponse: campaignResult.text
            }, { status: 500 });
        }

        console.log("📝 Parsing campaign descriptions...");

        const extractCaption = (item: any): string => {
            if (!item) return "";
            if (typeof item === "string") {
                try {
                    const parsed = JSON.parse(item);
                    if (parsed && typeof parsed.caption === "string") {
                        return parsed.caption;
                    }
                } catch {
                    return item;
                }
                return item;
            }
            if (typeof item.caption === "string") {
                return item.caption;
            }
            if (typeof item === "object" && item.caption) {
                return String(item.caption);
            }
            return "";
        };

        const extractDescription = (item: any): string => {
            if (!item) return "";
            if (typeof item === "string") {
                try {
                    const parsed = JSON.parse(item);
                    if (parsed && typeof parsed.description === "string") {
                        return parsed.description;
                    }
                } catch {
                    return item;
                }
                return item;
            }
            if (typeof item.description === "string") {
                return item.description;
            }
            if (typeof item === "object" && item.description) {
                return String(item.description);
            }
            return "";
        };

        const posts = [
            {
                id: 1,
                description: extractDescription(campaignDescriptions["ID:1"]),
                caption: extractCaption(campaignDescriptions["ID:1"]),
            },
            {
                id: 2,
                description: extractDescription(campaignDescriptions["ID:2"]),
                caption: extractCaption(campaignDescriptions["ID:2"]),
            },
            {
                id: 3,
                description: extractDescription(campaignDescriptions["ID:3"]),
                caption: extractCaption(campaignDescriptions["ID:3"]),
            },
        ];

        console.log("✅ Successfully parsed 3 post concepts with descriptions and captions");

        // Step 4: Generate images for each story using Runway SDK with Gemini 2.5 Flash
        console.log("🎨 Generating images with Runway...");

        // Prepare reference images (validate URLs)
        const referenceImages: Array<{ uri: string }> = [];

        if (logoUrl) {
            const validLogoUrl = await validateImageUrl(logoUrl);
            if (validLogoUrl) {
                referenceImages.push({ uri: validLogoUrl });
            }
        }

        if (images.length > 0 && images[0]) {
            const validMainImageUrl = await validateImageUrl(images[0]);
            if (validMainImageUrl) {
                referenceImages.push({ uri: validMainImageUrl });
            }
        }

        console.log(`Found ${referenceImages.length} valid reference images`);

        const imageGenerationPromises = posts.map(async (post) => {
            try {
                // Clean the description: remove extra quotes and trim
                const cleanDescription = post.description
                    .replace(/^["']|["']$/g, '') // Remove leading/trailing quotes
                    .trim();

                const task = await runwayClient.textToImage.create({
                    promptText: cleanDescription,
                    model: "gemini_2.5_flash",
                    ratio: "1024:1024",
                    referenceImages: referenceImages.length > 0 ? referenceImages.map(img => ({ ...img, tag: "reference" })) : undefined,
                }).waitForTaskOutput();

                // The task output contains the generated image URL
                return {
                    ...post,
                    imageUrl: task.output?.[0] || undefined,
                };
            } catch (error: any) {
                console.error(`Error generating image for post ${post.id}:`, error);
                return {
                    ...post,
                    imageUrl: undefined,
                    imageError: error.message,
                };
            }
        });

        const postsWithImages = await Promise.all(imageGenerationPromises);

        console.log("✅ Successfully generated images for posts");

        // Return the results
        const result: PostGenerationResult = {
            success: true,
            posts: postsWithImages,
        };

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Error in post generation workflow:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Unknown error occurred",
            },
            { status: 500 }
        );
    }
}
