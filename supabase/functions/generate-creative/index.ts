import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Bytez from "npm:bytez.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const BYTEZ_API_KEY = Deno.env.get("BYTEZ_API_KEY");
    if (!BYTEZ_API_KEY) {
      return new Response(
        JSON.stringify({
          ok: false,
          step: "config",
          error: "BYTEZ_API_KEY not configured",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { imageBase64, productDescription, targetAudience, mainBenefit, customInstructions } = await req.json();

    if (!imageBase64 || !productDescription || !targetAudience || !mainBenefit) {
      return new Response(JSON.stringify({ ok: false, step: "validation", error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizeImageInput = (rawImage: string): string => {
      const trimmed = rawImage.trim();
      const isPublicUrl = /^https?:\/\/.+/i.test(trimmed);
      const isDataUrl = /^data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=\s]+$/.test(trimmed);
      const isRawBase64 = /^[A-Za-z0-9+/=\s]+$/.test(trimmed) && trimmed.length > 100;

      if (isPublicUrl || isDataUrl) return trimmed;
      if (isRawBase64) return `data:image/png;base64,${trimmed.replace(/\s+/g, "")}`;

      throw new Error("Invalid image format: expected public URL or base64");
    };

    const imageUrl = normalizeImageInput(imageBase64);
    console.log("Vision input image:", {
      kind: imageUrl.startsWith("http") ? "public_url" : "base64_data_url",
      preview: imageUrl.slice(0, 120),
      length: imageUrl.length,
    });

    const sdk = new Bytez(BYTEZ_API_KEY);
    const model = sdk.model("openai/gpt-4o");

    // STEP 1: Image analysis with GPT-4o vision
    console.log("Step 1: Analyzing image...");
    let analysis = "";
    try {
      const analysisResponse = await model.chat.completions.create({
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
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
      });

      console.log("Vision API response:", analysisResponse);
      analysis = analysisResponse.choices?.[0]?.message?.content || "";
      if (!analysis) {
        return new Response(
          JSON.stringify({
            ok: false,
            step: "vision_analysis",
            error: "Failed to analyze image",
            details: "Empty response from GPT-4o vision",
          }),
          {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    } catch (err) {
      console.error("Vision analysis error:", err);
      return new Response(
        JSON.stringify({
          ok: false,
          step: "vision_analysis",
          error: "Failed to analyze image",
          details: err instanceof Error ? err.message : String(err),
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("Analysis complete");

    // STEP 2: Copy generation with GPT-4o
    console.log("Step 2: Generating ad copy...");
    let copyText = "";
    try {
      const copyResponse = await model.chat.completions.create({
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
      });

      console.log("Copy API response:", copyResponse);
      copyText = copyResponse.choices?.[0]?.message?.content || "";
      if (!copyText) {
        return new Response(
          JSON.stringify({
            ok: false,
            step: "copy_generation",
            error: "Failed to generate copy",
            details: "Empty response from GPT-4o",
          }),
          {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    } catch (err) {
      console.error("Copy generation error:", err);
      return new Response(
        JSON.stringify({
          ok: false,
          step: "copy_generation",
          error: "Failed to generate copy",
          details: err instanceof Error ? err.message : String(err),
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    
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

    let generatedImageUrl = "";
    if (bytezResponse.ok) {
      const bytezData = await bytezResponse.json();
      console.log("DALL-E API response:", bytezData);
      generatedImageUrl = bytezData?.output?.[0]?.url || bytezData?.output?.url || bytezData?.data?.[0]?.url || "";
      if (!generatedImageUrl && bytezData?.output) {
        // Try to extract base64 or URL from various response shapes
        if (typeof bytezData.output === "string") {
          generatedImageUrl = bytezData.output;
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
        imageUrl: generatedImageUrl,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("generate-creative error:", error);
    return new Response(
      JSON.stringify({
        ok: false,
        step: "unexpected",
        error: "Unexpected backend error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});