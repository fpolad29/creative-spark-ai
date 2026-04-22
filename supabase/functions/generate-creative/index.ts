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
            content: "Tu es un copywriter publicitaire expert en pubs Meta/Facebook haute conversion. Tu écris en français. Tu reproduis FIDÈLEMENT la structure, le ton, la longueur et le style de la pub de référence — seul le produit/sujet change."
          },
          {
            role: "user",
            content: [
              { type: "text", text: `Tu dois DUPLIQUER cette pub en ne changeant QUE le sujet pour l'adapter au nouveau produit. Règles strictes :

1. Respecte EXACTEMENT la même structure (nombre de mots du headline, longueur du texte, emplacement du CTA, style du CTA).
2. Garde le MÊME ton, le MÊME angle marketing, la MÊME émotion.
3. Ne rajoute rien qui n'existe pas dans l'original.
4. Décris en anglais, avec un MAXIMUM de précision, TOUT ce que tu vois sur l'image (palette de couleurs exacte avec codes hex approximatifs, typographie, disposition, éléments visuels, textures, arrière-plan, présence ou NON de personnes, style photo/illustration/flat/3D, etc.) — cette description servira à reproduire l'image à l'identique.
5. Si il n'y a PAS de personne sur l'image originale, n'en rajoute AUCUNE. Si il y en a, garde-les.

Nouveau produit à placer à la place du sujet original :
- Produit : ${productDescription}
- Audience : ${targetAudience}
- Bénéfice principal : ${mainBenefit}
${customInstructions ? `- Instructions additionnelles : ${customInstructions}` : ""}

Génère le headline, le texte publicitaire et le CTA qui remplaceront ceux de l'original (même longueur, même ton), ainsi qu'un visualDescription TRÈS DÉTAILLÉ en anglais de l'image originale pour pouvoir la reproduire.` },
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
                visualDescription: { type: "string", description: "Description EXTRÊMEMENT détaillée en anglais de l'image originale : palette exacte (couleurs + hex), composition, typo, disposition, présence/absence d'humains, style visuel, arrière-plan, textures. Servira à reproduire l'image à l'identique." },
              },
              required: ["headline", "adCopy", "cta", "visualDescription"],
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
    const { headline, adCopy, cta, visualDescription } = JSON.parse(toolCall.function.arguments);
    console.log("Copy generated:", { headline, cta });

    // STEP 3: EDIT the original image — keep same structure, colors, style, only swap subject + text
    console.log("Editing reference image...");
    const editPrompt = `Recreate this exact advertising creative with these STRICT rules:

1. KEEP IDENTICAL: the overall layout, composition, color palette, typography style, background, textures, visual style (photo/illustration/3D/flat), lighting, mood.
2. KEEP IDENTICAL: the EXACT position of every element (headline, subheadline, product area, CTA button, logos, badges, icons).
3. Presence of humans: ${`if the original has NO person, DO NOT add any person. If it has people, keep them with the same style and pose.`}
4. REPLACE the product/subject visually with: ${productDescription}.
5. REPLACE the headline text with EXACTLY: "${headline}"
6. REPLACE the CTA button text with EXACTLY: "${cta}"
7. Any other text (subtitle/benefits) should be adapted to the new product in the SAME LANGUAGE (French) and SAME LENGTH as the original.
8. Do NOT add decorative elements that weren't in the original. Do NOT change the color palette. Do NOT change the style.
9. Output a clean 1:1 square, same resolution feel as original, production-ready Meta Ads creative.

Reference visual description (from the original): ${visualDescription}

Target product: ${productDescription}. Audience: ${targetAudience}. Main benefit: ${mainBenefit}.`;

    let generatedImageUrl = "";
    try {
      const imgResp = await fetch(GATEWAY, {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [{
            role: "user",
            content: [
              { type: "text", text: editPrompt },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          }],
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
