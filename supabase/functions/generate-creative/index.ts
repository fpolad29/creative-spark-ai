import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    const BYTEZ_API_KEY = Deno.env.get("BYTEZ_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY not configured");
    if (!BYTEZ_API_KEY) throw new Error("BYTEZ_API_KEY not configured");

    const { imageBase64, productDescription, targetAudience, mainBenefit, customInstructions } = await req.json();

    if (!imageBase64 || !productDescription || !targetAudience || !mainBenefit) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // STEP 1: Image Analysis with OpenRouter Vision
    console.log("Step 1: Analyzing image...");
    const analysisResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this advertising creative in detail. Extract:
1. Visual structure (layout hierarchy: where is the headline, image, CTA, etc.)
2. Hook / headline style (what type of hook is used)
3. Marketing angle (what emotional trigger or value proposition)
4. CTA placement and style
5. Design style (colors, typography feel, spacing)
6. Overall conversion strategy

Respond in JSON format with keys: structure, hookStyle, marketingAngle, ctaStyle, designStyle, conversionStrategy`,
              },
              {
                type: "image_url",
                image_url: { url: imageBase64 },
              },
            ],
          },
        ],
      }),
    });

    if (!analysisResponse.ok) {
      const errText = await analysisResponse.text();
      console.error("OpenRouter analysis error:", errText);
      throw new Error("Failed to analyze image");
    }

    const analysisData = await analysisResponse.json();
    const analysis = analysisData.choices?.[0]?.message?.content || "";
    console.log("Analysis complete");

    // STEP 2: Copy Generation with OpenRouter
    console.log("Step 2: Generating ad copy...");
    const copyResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert advertising copywriter specializing in high-converting Meta/Facebook ads. 
You write in French. You create compelling, original ad copy that drives conversions.
Never copy existing ads - only use their structure as inspiration.`,
          },
          {
            role: "user",
            content: `Based on this analysis of a reference ad:
${analysis}

Create HIGH-CONVERTING ad copy for this product:
- Product: ${productDescription}
- Target audience: ${targetAudience}  
- Main benefit: ${mainBenefit}
${customInstructions ? `- Additional instructions: ${customInstructions}` : ""}

Generate:
1. A powerful headline (max 10 words, punchy, hook-driven)
2. Ad copy (3-4 sentences, benefit-focused, creates urgency)
3. CTA text (short, action-oriented)

Respond in JSON with keys: headline, adCopy, cta`,
          },
        ],
      }),
    });

    if (!copyResponse.ok) {
      const errText = await copyResponse.text();
      console.error("OpenRouter copy error:", errText);
      throw new Error("Failed to generate copy");
    }

    const copyData = await copyResponse.json();
    const copyText = copyData.choices?.[0]?.message?.content || "";
    
    // Parse the JSON from the response
    let copyResult = { headline: "", adCopy: "", cta: "" };
    try {
      const jsonMatch = copyText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        copyResult = JSON.parse(jsonMatch[0]);
      }
    } catch {
      copyResult = {
        headline: "Découvrez une solution qui change tout",
        adCopy: copyText.substring(0, 300),
        cta: "Essayer maintenant",
      };
    }
    console.log("Copy generated");

    // STEP 3: Image Generation with Bytez (DALL-E 3)
    console.log("Step 3: Generating image...");
    const dallePrompt = `Create a high-converting social media advertising creative. 

STRUCTURE (inspired by reference analysis):
- Headline at top
- Product visual in center  
- Key benefits around the product
- CTA button at bottom

CONTENT:
- Headline: "${copyResult.headline}"
- Product: ${productDescription}
- Key benefit: ${mainBenefit}
- CTA: "${copyResult.cta}"

STYLE: Modern, clean, premium, high-converting Meta Ads style. Square format 1:1. Professional, polished design with bold typography. NOT AI-looking. Use vibrant but professional colors.

${customInstructions ? `Additional style notes: ${customInstructions}` : ""}

IMPORTANT: This must be a completely ORIGINAL design. Do not copy any existing brand or ad.`;

    const bytezResponse = await fetch("https://api.bytez.com/model/v1/openai/dall-e-3/run", {
      method: "POST",
      headers: {
        Authorization: `Key ${BYTEZ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: dallePrompt,
        n: 1,
        size: "1024x1024",
      }),
    });

    let imageUrl = "";
    if (bytezResponse.ok) {
      const bytezData = await bytezResponse.json();
      imageUrl = bytezData?.output?.[0]?.url || bytezData?.output?.url || bytezData?.data?.[0]?.url || "";
      if (!imageUrl && bytezData?.output) {
        // Try to extract base64 or URL from various response shapes
        if (typeof bytezData.output === "string") {
          imageUrl = bytezData.output;
        }
      }
      console.log("Image generated successfully");
    } else {
      const errText = await bytezResponse.text();
      console.error("Bytez error:", bytezResponse.status, errText);
      // Continue without image - still return copy
    }

    return new Response(
      JSON.stringify({
        headline: copyResult.headline,
        adCopy: copyResult.adCopy,
        cta: copyResult.cta,
        imageUrl,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("generate-creative error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});