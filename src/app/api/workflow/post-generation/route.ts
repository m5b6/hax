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
        imageUrl?: string;
        imageError?: string;
    }>;
    error?: string;
}

export async function POST(req: Request) {
    try {
        const wizardData: WizardStoreInput = await req.json();

        // Step 1: Extract relevant information for the campaign visualizer
        const brandName = wizardData.inputs.name;
        const brandIdentity = wizardData.inputs.identity;
        const productName = wizardData.inputs.productName;
        const logoUrl = wizardData.agentResponses.urlAnalyses[0]?.logoUrl;
        const images = wizardData.agentResponses.urlAnalyses[0]?.images || [];
        const summary = wizardData.agentResponses.urlAnalyses[0]?.summary;
        const visualStyle = wizardData.agentResponses.mcqAnswers?.["visual-style"];
        const visualRhythm = wizardData.agentResponses.mcqAnswers?.["visual-rhythm"];
        const humanPresence = wizardData.agentResponses.mcqAnswers?.["human-presence"];

        // Create the campaign prompt
        const campaignPrompt = `
Brand: ${brandName}
Identity: ${brandIdentity}
Product/Service: ${productName}

Summary: ${summary}

Visual Style Selected: ${visualStyle}
Visual Rhythm Selected: ${visualRhythm}
Human Presence Selected: ${humanPresence}

Reference Images Available: ${images.length > 0 ? 'Yes' : 'No'}
${images.length > 0 ? `Primary Reference Image: ${images[0]}` : ''}

Generate 3 distinct Instagram story concepts that:
1. Align with the brand identity and visual style preferences
2. Highlight the ${productName}
3. Maintain consistency with the chosen aesthetic
4. Are optimized for Instagram stories (9:16 vertical format)
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

        // Step 3: Extract individual story descriptions using the extractor agents
        console.log("📝 Extracting individual story descriptions...");
        const extractor1 = mastra.getAgent("postExtractor1Agent");
        const extractor2 = mastra.getAgent("postExtractor2Agent");
        const extractor3 = mastra.getAgent("postExtractor3Agent");

        if (!extractor1 || !extractor2 || !extractor3) {
            return NextResponse.json({ success: false, error: "Extractor agents not found" }, { status: 500 });
        }

        const [post1Result, post2Result, post3Result] = await Promise.all([
            extractor1.generate(JSON.stringify(campaignDescriptions)),
            extractor2.generate(JSON.stringify(campaignDescriptions)),
            extractor3.generate(JSON.stringify(campaignDescriptions)),
        ]);

        const posts = [
            {
                id: 1,
                description: post1Result.text,
            },
            {
                id: 2,
                description: post2Result.text,
            },
            {
                id: 3,
                description: post3Result.text,
            },
        ];

        console.log("✅ Successfully generated 3 story descriptions");

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
                    ratio: "768:1344", // 9:16 vertical format for Instagram stories
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

        console.log("✅ Successfully generated images for stories");

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
