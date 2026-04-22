import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { imageBase64, productDescription, targetAudience, mainBenefit, customInstructions } = await req.json();
    if (!imageBase64 || !productDescription || !targetAudience || !mainBenefit) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageUrl = imageBase64.startsWith("data:") || imageBase64.startsWith("http")
      ? imageBase64
      : `data:image/png;base64,${imageBase64.replace(/\s+/g, "")}`;

    // STEP 1 + 2 combined: Analyze image + generate copy via tool calling
    console.log("Analyzing + generating copy...");
    const copyResp = await fetch(GATEWAY, {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "Tu es un copywriter publicitaire expert en pubs Meta/Facebook haute conversion. Tu écris en français. Tu t'inspires de la structure d'une pub de référence pour créer un copywriting 100% original."
          },
          {
            role: "user",
            content: [
              { type: "text", text: `Analyse la structure de cette pub (hook, angle, CTA, style) puis crée une nouvelle pub pour :
- Produit : ${productDescription}
- Audience : ${targetAudience}
- Bénéfice principal : ${mainBenefit}
${customInstructions ? `- Instructions : ${customInstructions}` : ""}

Génère un headline punchy (max 10 mots), un texte publicitaire (3-4 phrases), et un CTA court.` },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_ad",
            description: "Retourne le créatif publicitaire",
            parameters: {
              type: "object",
              properties: {
                headline: { type: "string" },
                adCopy: { type: "string" },
                cta: { type: "string" },
                imagePrompt: { type: "string", description: "Prompt détaillé en anglais pour générer l'image publicitaire, format 1:1, style Meta Ads moderne" },
              },
              required: ["headline", "adCopy", "cta", "imagePrompt"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "generate_ad" } },
      }),
    });

    if (!copyResp.ok) {
      const t = await copyResp.text();
      console.error("Copy gen error:", copyResp.status, t);
      if (copyResp.status === 429) return new Response(JSON.stringify({ error: "Limite de requêtes atteinte, réessaie dans un moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (copyResp.status === 402) return new Response(JSON.stringify({ error: "Crédits IA épuisés. Ajoute des crédits dans Settings > Workspace > Usage." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ error: "Erreur lors de l'analyse" }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const copyData = await copyResp.json();
    const toolCall = copyData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("No tool call in response:", JSON.stringify(copyData));
      return new Response(JSON.stringify({ error: "Réponse IA invalide" }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { headline, adCopy, cta, imagePrompt } = JSON.parse(toolCall.function.arguments);
    console.log("Copy generated:", { headline, cta });

    // STEP 3: Generate image via gemini-2.5-flash-image
    console.log("Generating image...");
    const fullImagePrompt = `${imagePrompt}

Professional Meta Ads creative, 1:1 square format, modern high-converting design, bold typography, vibrant but professional colors, clean layout. Include the headline text "${headline}" prominently. Product: ${productDescription}. CTA: "${cta}". NOT AI-looking, polished and premium.`;

    let generatedImageUrl = "";
    try {
      const imgResp = await fetch(GATEWAY, {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: fullImagePrompt }],
          modalities: ["image", "text"],
        }),
      });
      if (imgResp.ok) {
        const imgData = await imgResp.json();
        const imgB64 = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (imgB64) generatedImageUrl = imgB64;
        else console.error("No image in response:", JSON.stringify(imgData).slice(0, 500));
      } else {
        console.error("Image gen error:", imgResp.status, await imgResp.text());
      }
    } catch (e) {
      console.error("Image gen exception:", e);
    }

    return new Response(JSON.stringify({ headline, adCopy, cta, imageUrl: generatedImageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-creative error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
