import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// CORS and body parser middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-gemini-key, x-anthropic-key, x-openai-key");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

app.use(express.json({ limit: "5mb" }));

const PORT = 3000;

interface CallAIOptions {
  provider?: "gemini" | "claude" | "openai";
  customKey?: string;
  model?: string;
  systemInstruction?: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

// Multi-provider backend execution helper
async function callAI(options: CallAIOptions): Promise<{ text: string; data?: any }> {
  const provider = options.provider || "gemini";
  const temperature = options.temperature ?? 0.7;

  if (provider === "gemini") {
    const key = options.customKey?.trim() || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error(
        "No Gemini API key found. Enter your Gemini API key in Settings or set GEMINI_API_KEY in your deployment environment variables."
      );
    }

    const ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const modelName = options.model?.trim() || "gemini-3.8-flash";
    const config: any = {
      temperature,
    };
    if (options.systemInstruction) {
      config.systemInstruction = options.systemInstruction;
    }
    if (options.jsonMode) {
      config.responseMimeType = "application/json";
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: options.userPrompt,
      config,
    });

    const text = response.text || "";
    if (options.jsonMode) {
      try {
        const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
        const data = JSON.parse(cleaned);
        return { text, data };
      } catch {
        return { text };
      }
    }
    return { text };
  }

  if (provider === "claude") {
    const key = options.customKey?.trim() || process.env.ANTHROPIC_API_KEY;
    if (!key) {
      throw new Error("No Anthropic API key found. Please configure your Claude API key in Settings or set ANTHROPIC_API_KEY.");
    }

    const modelName = options.model?.trim() || "claude-3-5-sonnet-20241022";
    const body: any = {
      model: modelName,
      max_tokens: options.maxTokens || 4096,
      temperature,
      messages: [{ role: "user", content: options.userPrompt }],
    };
    if (options.systemInstruction) {
      body.system = options.systemInstruction;
    }

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      const msg = errData?.error?.message || `Anthropic API error: ${resp.status} ${resp.statusText}`;
      throw new Error(msg);
    }

    const data: any = await resp.json();
    const text = data?.content?.[0]?.text || "";

    if (options.jsonMode) {
      try {
        const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
        return { text, data: JSON.parse(cleaned) };
      } catch {
        return { text };
      }
    }
    return { text };
  }

  if (provider === "openai") {
    const key = options.customKey?.trim() || process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error("No OpenAI API key found. Please configure your OpenAI API key in Settings or set OPENAI_API_KEY.");
    }

    const modelName = options.model?.trim() || "gpt-4o";
    const messages: any[] = [];
    if (options.systemInstruction) {
      messages.push({ role: "system", content: options.systemInstruction });
    }
    messages.push({ role: "user", content: options.userPrompt });

    const body: any = {
      model: modelName,
      messages,
      temperature,
    };
    if (options.jsonMode) {
      body.response_format = { type: "json_object" };
    }

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      const msg = errData?.error?.message || `OpenAI API error: ${resp.status} ${resp.statusText}`;
      throw new Error(msg);
    }

    const data: any = await resp.json();
    const text = data?.choices?.[0]?.message?.content || "";

    if (options.jsonMode) {
      try {
        const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
        return { text, data: JSON.parse(cleaned) };
      } catch {
        return { text };
      }
    }
    return { text };
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
}

// Health check endpoint
app.get(["/api/health", "/health"], (req, res) => {
  res.json({
    status: "ok",
    runtime: process.env.VERCEL ? "vercel-serverless" : "express-node",
    timestamp: new Date().toISOString()
  });
});

// 1. Connection Ping/Test endpoint (supports both /api/test-connection and /test-connection)
app.post(["/api/test-connection", "/test-connection"], async (req, res) => {
  try {
    const { provider, apiKey, model } = req.body;
    const result = await callAI({
      provider: provider || "gemini",
      customKey: apiKey,
      model,
      userPrompt: "Respond with the word 'READY' and one sentence confirming model identity.",
      temperature: 0.1,
    });
    res.json({
      success: true,
      provider,
      sampleResponse: result.text.trim(),
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || "Failed to establish test connection.",
    });
  }
});

// 2. Template Studio API (Supports Multi-Provider)
app.post(["/api/generate", "/generate"], async (req, res) => {
  try {
    const { prompt, templateType, colorMotif, brandVoice, action, provider, apiKey, model, temperature } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "Missing required parameter: prompt" });
      return;
    }

    if (action === "copy") {
      const systemInstruction = 
        `You are an expert digital copywriter and UX designer.
        Generate direct, highly engaging website copy for a web application layout of type "${templateType}".
        The brand industry or theme description is: "${prompt}".
        The tone of voice must be: "${brandVoice}".
        The visual color scheme context is: "${colorMotif}".
         
        Your response must strictly be valid JSON fitting the following structure depending on the templateType:
        - For "landing": { "heroTitle": "...", "heroSubtitle": "...", "badge": "...", "features": [ { "title": "...", "desc": "..." }, { "title": "...", "desc": "..." }, { "title": "...", "desc": "..." } ] }
        - For "dashboard": { "metric1": "...", "metric2": "...", "metric3": "...", "subHeading": "...", "transactions": [ { "name": "...", "status": "Paid" | "Pending", "amount": "..." }, { "name": "...", "status": "Paid" | "Pending", "amount": "..." } ] }
        - For "login": { "title": "...", "subtitle": "...", "cta": "..." }
        - For "register": { "title": "...", "subtitle": "...", "cta": "..." }
        - For "reset": { "title": "...", "subtitle": "...", "cta": "..." }
        - For "portfolio": { "title": "...", "subtitle": "...", "item1_badge": "...", "item1_title": "...", "item1_desc": "...", "item2_badge": "...", "item2_title": "...", "item2_desc": "..." }
        
        Do not add any markdown backticks, explanations, or commentary outside the valid JSON object.`;

      const aiResult = await callAI({
        provider: provider || "gemini",
        customKey: apiKey,
        model,
        temperature: temperature ?? 0.7,
        systemInstruction,
        userPrompt: `Generate custom JSON copy for layout template: ${templateType}. Color motif: ${colorMotif}. Brand voice: ${brandVoice}. Prompt details: ${prompt}`,
        jsonMode: true,
      });

      const parsedData = aiResult.data || JSON.parse(aiResult.text.replace(/```json\n?|\n?```/g, "").trim());
      res.json({ action: "copy", data: parsedData, provider: provider || "gemini" });
      return;
    } else {
      // action === "prompt" -> Canva / Midjourney design asset prompt optimization
      const systemInstruction = 
        `You are a master design prompt engineer specializing in Canva AI Magic Media, Midjourney v6, and DALL-E 3 visual assets.
        Your goal is to optimize design input into a single, cinematic, highly vivid visual asset prompt.
        
        The user wants to generate design assets/backgrounds for a "${templateType}" interface.
        Theme/Brand input: "${prompt}"
        Color Motif: "${colorMotif}"
        Brand Voice/Setting: "${brandVoice}"
        
        Make your prompt describe the visual layout, geometric structures, high-contrast values, specific hex-shades or color combinations matching ${colorMotif}, composition, depth, textures (like glassmorphism, matte finish, glowing lines), lighting style, and modern 8k resolution standards.
         
        Avoid generic buzzwords. Produce a clean, copy-friendly block of text prompt directly. Do not include markdown headers or extra conversational commentary.`;

      const aiResult = await callAI({
        provider: provider || "gemini",
        customKey: apiKey,
        model,
        temperature: temperature ?? 0.8,
        systemInstruction,
        userPrompt: `Create an optimized design prompt matching: ${prompt}`,
      });

      res.json({ action: "prompt", text: aiResult.text.trim(), provider: provider || "gemini" });
      return;
    }
  } catch (error: any) {
    console.error("Generate API Failed:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred during copy generation." });
  }
});

// 3. Universal Prompt Builder & Prompt Doctor API
app.post(["/api/prompt-craft", "/prompt-craft"], async (req, res) => {
  try {
    const {
      promptType,
      rawGoal,
      targetAI,
      aspectRatio,
      artStyle,
      lighting,
      framework,
      tone,
      variables,
      additionalRules,
      provider,
      apiKey,
      model,
      temperature,
    } = req.body;

    if (!rawGoal) {
      res.status(400).json({ error: "Missing required parameter: rawGoal" });
      return;
    }

    const systemInstruction = 
      `You are an elite Prompt Engineer and AI Alignment Architect with deep mastery across Gemini, Claude (Anthropic), OpenAI GPT-4, and visual engines (Canva, Midjourney).
      Your mission is to take user specifications and construct world-class, production-ready prompts that eliminate hallucination, guarantee adherence, and elicit the highest quality outputs.

      CRITICAL FORMAT REQUIREMENT:
      You must respond strictly with a valid JSON object matching this schema:
      {
        "masterPrompt": "The complete, polished, copy-paste ready prompt text (can use markdown or XML tags if suitable)",
        "promptTitle": "A concise, professional title for this crafted prompt",
        "category": "${promptType}",
        "architecture": "Brief summary of the engineering technique used (e.g., 'Few-Shot with XML Delimiters', 'Parametric Photographic Formula', 'Role-Task-Constraint Guardrails')",
        "variables": [
          { "name": "variable_name", "description": "What value goes here", "defaultValue": "Example value" }
        ],
        "whyItWorks": [
          "Key advantage 1",
          "Key advantage 2",
          "Key advantage 3"
        ],
        "proTips": [
          "Tip on optimal temperature or model choice",
          "Tip on token count or format handling"
        ]
      }
      Do not output any markdown code blocks outside of the valid JSON string.`;

    const userPrompt = `
    Please craft a world-class prompt with the following specifications:
    - Prompt Category / Type: ${promptType}
    - Primary Objective / Raw Idea: "${rawGoal}"
    - Target Engine / Model: ${targetAI || "universal"}
    - Framework / Structure: ${framework || "best-fit"}
    - Tone / Persona: ${tone || "Professional, authoritative"}
    - Visual Details (if applicable): Style="${artStyle || 'N/A'}", Lighting="${lighting || 'N/A'}", Aspect Ratio="${aspectRatio || 'N/A'}"
    - Additional Constraints / Rules: "${additionalRules || 'Ensure zero ambiguity and clean formatting'}"
    - Included Variable Fields: ${JSON.stringify(variables || [])}
    `;

    const aiResult = await callAI({
      provider: provider || "gemini",
      customKey: apiKey,
      model,
      temperature: temperature ?? 0.6,
      systemInstruction,
      userPrompt,
      jsonMode: true,
    });

    let crafted: any;
    try {
      crafted = aiResult.data || JSON.parse(aiResult.text.replace(/```json\n?|\n?```/g, "").trim());
    } catch {
      crafted = {
        masterPrompt: aiResult.text,
        promptTitle: "Generated Master Prompt",
        category: promptType,
        architecture: "Direct High-Fidelity Prompt",
        variables: [],
        whyItWorks: ["Crafted for maximum adherence and semantic density"],
        proTips: ["Use temperature 0.6-0.7 for optimal balance"],
      };
    }

    res.json({
      success: true,
      crafted,
      provider: provider || "gemini",
    });
  } catch (error: any) {
    console.error("Prompt Craft API Failed:", error);
    res.status(500).json({ error: error.message || "Failed to craft prompt." });
  }
});

// 4. Prompt Execution / Playground API
app.post(["/api/prompt-execute", "/prompt-execute"], async (req, res) => {
  try {
    const { prompt, systemInstruction, provider, apiKey, model, temperature, maxTokens } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "Missing required parameter: prompt" });
      return;
    }

    const aiResult = await callAI({
      provider: provider || "gemini",
      customKey: apiKey,
      model,
      systemInstruction,
      userPrompt: prompt,
      temperature: temperature ?? 0.7,
      maxTokens: maxTokens ?? 2048,
    });

    res.json({
      success: true,
      output: aiResult.text,
      provider: provider || "gemini",
    });
  } catch (error: any) {
    console.error("Prompt Execution Failed:", error);
    res.status(500).json({ error: error.message || "Failed to execute prompt." });
  }
});

// 5. Dedicated Image Prompt Generator App API
app.post(["/api/image-prompt-craft", "/image-prompt-craft"], async (req, res) => {
  try {
    const {
      subject,
      targetEngine,
      artStyle,
      camera,
      lighting,
      colorMood,
      aspectRatio,
      qualityFlags,
      negativePrompts,
      provider,
      apiKey,
      model,
      temperature,
    } = req.body;

    const coreSubject = subject?.trim() || "Futuristic architectural oasis floating in a nebulous cosmos";
    const engine = targetEngine || "midjourney";
    const style = artStyle || "Photorealistic Cinematic 35mm";
    const cam = camera || "85mm f/1.4 Lens, Shallow Depth of Field";
    const light = lighting || "Volumetric Golden Hour Rays & Soft Ambient Bloom";
    const mood = colorMood || "Teal and Warm Amber Cinema Grade";
    const ar = aspectRatio || "16:9";
    const flags = qualityFlags || ["8k UHD", "photorealistic", "raytraced reflections", "hyper-detailed textures"];
    const negatives = negativePrompts || ["blurry", "extra limbs", "distorted anatomy", "watermark", "oversaturated", "lowres"];

    const systemInstruction = `You are a world-class Visual AI Concept Director and Prompt Architect specializing in Midjourney v6.1, DALL-E 3, Flux.1 Schnell, Canva Magic Media, and Google Imagen 3.
Your task is to take visual parameters and output strictly valid JSON containing 4 diverse, production-ready image prompts:
1. "Photorealistic Cinematic" (emphasis on optical lens characteristics, photoreal tactile textures, naturalistic light falloff)
2. "Stylized 3D Octane / Unreal 5" (volumetric raytracing, subsurface scattering, architectural precision)
3. "Editorial Fine Art" (avant-garde framing, painterly or analog grain, mood and narrative depth)
4. "Commercial Clean & Modern" (crisp product or hero subject, graphic punch, Canva / marketing asset ready)

CRITICAL: Return strictly a valid JSON object matching:
{
  "variations": [
    {
      "id": "var_1",
      "styleLabel": "Photorealistic Cinematic",
      "fullPrompt": "Full ready-to-run prompt text with all keywords and model flags (e.g. --ar 16:9 --v 6.1 --style raw for Midjourney)",
      "negativePrompt": "...",
      "engineParameters": "--ar 16:9 --v 6.1 --style raw --s 250",
      "breakdown": {
        "subject": "...",
        "composition": "...",
        "lighting": "...",
        "camera": "...",
        "colorPalette": "..."
      },
      "rationale": "Why this prompt generates exceptional results"
    }
  ],
  "creativeTips": [
    "Tip 1",
    "Tip 2"
  ]
}`;

    const userPrompt = `Generate 4 distinctive image prompt variations:
- Subject: "${coreSubject}"
- Target Engine: ${engine}
- Preferred Art Style: ${style}
- Camera Optics: ${cam}
- Lighting: ${light}
- Color Palette / Mood: ${mood}
- Aspect Ratio: ${ar}
- Quality Tags: ${flags.join(", ")}
- Negative Constraints: ${negatives.join(", ")}
Format full prompt with engine-specific syntax (e.g. Midjourney flags --ar ${ar} --v 6.1, or Flux natural language directives).`;

    let resultData: any;
    try {
      const aiResult = await callAI({
        provider: provider || "gemini",
        customKey: apiKey,
        model: model || "gemini-3.8-flash",
        temperature: temperature ?? 0.7,
        systemInstruction,
        userPrompt,
        jsonMode: true,
      });

      resultData = aiResult.data || JSON.parse(aiResult.text.replace(/```json\n?|\n?```/g, "").trim());
    } catch (err: any) {
      console.warn("AI generation note in image-prompt-craft:", err.message);

      // Robust domain fallback
      const arFlag = ar === "1:1" ? "1:1" : ar === "9:16" ? "9:16" : ar === "4:5" ? "4:5" : ar === "21:9" ? "21:9" : "16:9";
      resultData = {
        variations: [
          {
            id: "var_1",
            styleLabel: "Photorealistic Cinematic",
            fullPrompt: `${coreSubject}, captured with ${cam}, ${light}, ${mood}, natural film grain, fine tactile surface textures, volumetric atmosphere, hyper-detailed optical depth of field, award-winning cinematography --ar ${arFlag} --v 6.1 --style raw --s 250`,
            negativePrompt: negatives.join(", "),
            engineParameters: `--ar ${arFlag} --v 6.1 --style raw --s 250`,
            breakdown: {
              subject: coreSubject,
              composition: "Rule of thirds with dynamic leading lines and generous negative space",
              lighting: light,
              camera: cam,
              colorPalette: mood,
            },
            rationale: "Balances photographic camera realism with subtle film grain and natural light dispersion."
          },
          {
            id: "var_2",
            styleLabel: "Stylized 3D Octane / Unreal 5",
            fullPrompt: `${coreSubject}, futuristic ${style}, 3D digital sculpture rendered in Octane Render and Unreal Engine 5.4, subsurface scattering, emissive accents, ${light}, ${mood}, raytraced specular highlights, pristine geometric detail --ar ${arFlag} --v 6.1 --s 400`,
            negativePrompt: negatives.join(", "),
            engineParameters: `--ar ${arFlag} --v 6.1 --s 400`,
            breakdown: {
              subject: `Sculptural ${coreSubject}`,
              composition: "Centered isometric hero composition with floating elements",
              lighting: "Volumetric rim lighting and soft ambient occlusion",
              camera: "50mm Prime Orthographic perspective",
              colorPalette: mood,
            },
            rationale: "Optimized for stunning 3D CGI visual punch with glossy materials and luminescence."
          },
          {
            id: "var_3",
            styleLabel: "Editorial Fine Art",
            fullPrompt: `Avant-garde fine art editorial photograph of ${coreSubject}, ${style}, expressive composition, painterly textures, ${light}, rich ${mood}, medium format Hasselblad 100MP, emotional depth, gallery exhibition piece --ar ${arFlag} --v 6.1 --stylize 600`,
            negativePrompt: negatives.join(", "),
            engineParameters: `--ar ${arFlag} --v 6.1 --stylize 600`,
            breakdown: {
              subject: coreSubject,
              composition: "Asymmetrical artistic framing with high visual tension",
              lighting: "Dramatic directional chiaroscuro and atmospheric haze",
              camera: "Hasselblad H6D-100c medium format",
              colorPalette: mood,
            },
            rationale: "Creates an evocative, magazine-cover editorial aura with rich emotional depth."
          },
          {
            id: "var_4",
            styleLabel: "Commercial Clean & Modern",
            fullPrompt: `Clean commercial hero shot of ${coreSubject}, studio gradient backdrop, ${light}, ${mood}, sharp edge definition, professional graphic design and advertising aesthetic, high commercial appeal, Canva Magic Media ready, pristine quality --ar ${arFlag} --v 6.1`,
            negativePrompt: negatives.join(", "),
            engineParameters: `--ar ${arFlag} --v 6.1`,
            breakdown: {
              subject: coreSubject,
              composition: "Centered subject with clean negative space for typography and overlays",
              lighting: "Soft three-point commercial studio illumination",
              camera: "Studio Macro / 70mm sharp focus",
              colorPalette: mood,
            },
            rationale: "Perfect for website hero banners, social ads, and Canva marketing collateral."
          }
        ],
        creativeTips: [
          `For Midjourney, adjust '--s' (stylize) between 50 (strict prompt adherence) and 750 (maximum artistic liberty).`,
          `When using DALL-E 3 or Flux.1, remove the '--ar' flags and specify the resolution in natural language or pixel dimensions.`
        ]
      };
    }

    res.json({
      success: true,
      data: resultData,
      provider: provider || "gemini",
    });
  } catch (error: any) {
    console.error("Image Prompt Craft Failed:", error);
    res.status(500).json({ error: error.message || "Failed to craft image prompts." });
  }
});

// 6. Brand Kit Studio Generator API (Gemini-powered Palette, Typography & 3D Logo Concepts)
app.post(["/api/brand-generator", "/brand-generator"], async (req, res) => {
  try {
    const { brandName, industry, vibe, provider, apiKey, model, temperature } = req.body;

    const brand = brandName?.trim() || "Nova Innovations";
    const ind = industry?.trim() || "Next-gen Software & AI Solutions";
    const aesthetic = vibe?.trim() || "Futuristic High-Tech";

    const systemInstruction = `You are a world-renowned creative brand director, generative 3D visual designer, and typography master.
Your goal is to invent an ultra-cohesive, high-converting brand identity kit for the given company or portfolio.

The brand kit must include:
1. A refined, harmonically sound 7-color palette conforming to WCAG AA contrast standards.
2. A high-character typography pairing selected from Google Fonts (Display/Heading font and Body font) with rationale.
3. Exactly three (3) distinct, highly imaginative 3D logo concepts crafted for interactive Three.js procedural rendering. Each concept must specify archetype, 3-12 part procedural geometry metadata, physical PBR material values (metalness, roughness, clearcoat), and an SVG glyph.

You MUST respond strictly with a valid JSON object matching this structure (no markdown wrappers):
{
  "brandName": "${brand}",
  "palette": {
    "name": "Distinctive Palette Title",
    "harmony": "Complementary / Analogous / Neo-Brutalist / Triadic / Monochromatic",
    "rationale": "Why these colors convey the brand's identity and visual authority",
    "primary": "#HEX (Vibrant focal accent for CTAs)",
    "accent": "#HEX (Secondary vivid highlight)",
    "bg": "#HEX (Deep canvas background or crisp paper)",
    "surface": "#HEX (Subtle card container surface)",
    "text": "#HEX (High contrast text, readable)",
    "muted": "#HEX (Subdued secondary text)",
    "border": "#HEX (Hairline divider tone)"
  },
  "typography": {
    "fontH": "Space Grotesk" | "Plus Jakarta Sans" | "Outfit" | "Sora" | "Syne" | "Playfair Display" | "DM Sans" | "Manrope" | "JetBrains Mono" | "Poppins" | "Lora",
    "fontB": "Inter" | "DM Sans" | "Manrope" | "Plus Jakarta Sans" | "Outfit",
    "pairingName": "Name of typographic aesthetic",
    "weights": "Display 700 / Body 400",
    "rationale": "Why this font pair balances character and reading rhythm"
  },
  "logoConcepts": [
    {
      "id": "concept_1",
      "name": "Concept Title",
      "tagline": "Short evocative aesthetic descriptor",
      "archetype": "polyhedral_core" | "orbital_rings" | "geometric_torus_prism" | "faceted_gem" | "cyber_monolith" | "helix_lattice",
      "proceduralDetails": {
        "partCount": 5,
        "primaryColor": "#HEX",
        "secondaryColor": "#HEX",
        "accentColor": "#HEX",
        "metalness": 0.85,
        "roughness": 0.18,
        "wireframe": false,
        "rotationSpeed": 0.8,
        "description": "Composite structure with central faceted core enclosed in dual gyroscopic bevel rings and satellite pins"
      },
      "svgGlyph": "<svg viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='20' cy='20' r='14' stroke='currentColor' stroke-width='2'/><polygon points='20,10 28,26 12,26' fill='currentColor'/></svg>",
      "rationale": "Conceptual alignment with brand values"
    },
    {
      "id": "concept_2",
      "name": "Concept Title 2",
      "tagline": "Short evocative descriptor",
      "archetype": "orbital_rings",
      "proceduralDetails": {
        "partCount": 6,
        "primaryColor": "#HEX",
        "secondaryColor": "#HEX",
        "accentColor": "#HEX",
        "metalness": 0.9,
        "roughness": 0.12,
        "wireframe": false,
        "rotationSpeed": 1.0,
        "description": "Three nested gimbal rings rotating at offset harmonic ratios around a radiant core"
      },
      "svgGlyph": "<svg viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'><ellipse cx='20' cy='20' rx='16' ry='6' stroke='currentColor' stroke-width='2'/><ellipse cx='20' cy='20' rx='6' ry='16' stroke='currentColor' stroke-width='2'/><circle cx='20' cy='20' r='4' fill='currentColor'/></svg>",
      "rationale": "Dynamic motion and continuous technical evolution"
    },
    {
      "id": "concept_3",
      "name": "Concept Title 3",
      "tagline": "Short descriptor",
      "archetype": "cyber_monolith",
      "proceduralDetails": {
        "partCount": 7,
        "primaryColor": "#HEX",
        "secondaryColor": "#HEX",
        "accentColor": "#HEX",
        "metalness": 0.95,
        "roughness": 0.15,
        "wireframe": false,
        "rotationSpeed": 0.6,
        "description": "Ascending crystalline monolith with chamfered edges, floating crown segment, and metallic pedestal"
      },
      "svgGlyph": "<svg viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'><rect x='13' y='8' width='14' height='24' rx='3' stroke='currentColor' stroke-width='2'/><line x1='13' y1='16' x2='27' y2='16' stroke='currentColor' stroke-width='1.5'/></svg>",
      "rationale": "Monumental stability, structural precision, and architectural elegance"
    }
  ]
}`;

    const userPrompt = `Generate a brand kit for:
- Brand Name: "${brand}"
- Domain / Role: "${ind}"
- Aesthetic Vibe: "${aesthetic}"
Ensure rich 3D procedural construction parameters for Three.js and exact HEX colors.`;

    let kit: any;
    let aiError: string | null = null;

    try {
      const aiResult = await callAI({
        provider: provider || "gemini",
        customKey: apiKey,
        model: model || "gemini-3.8-flash",
        temperature: temperature ?? 0.7,
        systemInstruction,
        userPrompt,
        jsonMode: true,
      });

      kit = aiResult.data || JSON.parse(aiResult.text.replace(/```json\n?|\n?```/g, "").trim());
    } catch (err: any) {
      console.warn("AI generation note in brand-generator:", err.message);
      aiError = err.message;

      // Dynamic curated brand kit based on aesthetic and domain
      const isMinimalist = aesthetic.toLowerCase().includes("minimal");
      const isNeon = aesthetic.toLowerCase().includes("neon") || aesthetic.toLowerCase().includes("vibrant");
      const isLuxury = aesthetic.toLowerCase().includes("luxury") || aesthetic.toLowerCase().includes("editorial");
      const isOrganic = aesthetic.toLowerCase().includes("organic") || aesthetic.toLowerCase().includes("nordic");

      const primary = isNeon ? "#06b6d4" : isLuxury ? "#d97706" : isOrganic ? "#10b981" : isMinimalist ? "#38bdf8" : "#6366f1";
      const secondary = isNeon ? "#ec4899" : isLuxury ? "#fbbf24" : isOrganic ? "#059669" : isMinimalist ? "#64748b" : "#8b5cf6";
      const accent = isNeon ? "#facc15" : isLuxury ? "#fef3c7" : isOrganic ? "#34d399" : isMinimalist ? "#0284c7" : "#06b6d4";

      kit = {
        brandName: brand,
        palette: {
          name: `${aesthetic} Luminary`,
          harmony: isMinimalist ? "Monochromatic Precision" : "Complementary High-Contrast",
          rationale: `Precision tuned palette balancing ${brand}'s focus in ${ind} with WCAG AA compliance.`,
          primary,
          accent,
          bg: isMinimalist ? "#020617" : "#090d16",
          surface: isMinimalist ? "#0f172a" : "#111827",
          text: "#f8fafc",
          muted: "#94a3b8",
          border: "#1e293b",
        },
        typography: {
          fontH: isLuxury ? "Playfair Display" : isOrganic ? "Outfit" : isMinimalist ? "Plus Jakarta Sans" : "Space Grotesk",
          fontB: isLuxury ? "Cinzel" : isOrganic ? "Work Sans" : "Inter",
          pairingName: isLuxury ? "Editorial Serif Elegance" : isOrganic ? "Nordic Geometric Balance" : "Neo-Grotesque Precision",
          weights: "Display 700 / Body 400",
          rationale: `Carefully paired Google Fonts reflecting the ${aesthetic.toLowerCase()} mood of ${brand}.`,
        },
        logoConcepts: [
          {
            id: "concept_1",
            name: `${brand} Nucleus`,
            tagline: "Faceted core inside gyroscopic orbit",
            archetype: "polyhedral_core",
            proceduralDetails: {
              partCount: 5,
              primaryColor: primary,
              secondaryColor: secondary,
              accentColor: accent,
              metalness: 0.88,
              roughness: 0.16,
              wireframe: false,
              rotationSpeed: 0.8,
              description: "Beveled core dodecahedron flanked by dual counter-rotating elliptical rings and floating satellite gems."
            },
            svgGlyph: `<svg viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='20' cy='20' r='14' stroke='${primary}' stroke-width='2'/><polygon points='20,10 28,26 12,26' fill='${secondary}'/></svg>`,
            rationale: "Symbolizes central intelligence surrounded by kinetic agility."
          },
          {
            id: "concept_2",
            name: "Orbital Harmonic",
            tagline: "Nested orthogonal gimbal rings",
            archetype: "orbital_rings",
            proceduralDetails: {
              partCount: 6,
              primaryColor: secondary,
              secondaryColor: accent,
              accentColor: primary,
              metalness: 0.92,
              roughness: 0.12,
              wireframe: false,
              rotationSpeed: 1.1,
              description: "Three nested torus rings rotating along orthogonal axes around a radiant spherical beacon."
            },
            svgGlyph: `<svg viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'><ellipse cx='20' cy='20' rx='16' ry='6' stroke='${secondary}' stroke-width='2'/><ellipse cx='20' cy='20' rx='6' ry='16' stroke='${primary}' stroke-width='2'/><circle cx='20' cy='20' r='4' fill='${accent}'/></svg>`,
            rationale: "Represents multi-dimensional systems orchestration."
          },
          {
            id: "concept_3",
            name: "Crown Monolith",
            tagline: "Ascending crystalline tower",
            archetype: "cyber_monolith",
            proceduralDetails: {
              partCount: 7,
              primaryColor: primary,
              secondaryColor: accent,
              accentColor: "#ffffff",
              metalness: 0.95,
              roughness: 0.14,
              wireframe: false,
              rotationSpeed: 0.6,
              description: "A hexagonal beveled pillar supporting a floating levitating prism crown with soft contact shadow grounding."
            },
            svgGlyph: `<svg viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'><rect x='13' y='8' width='14' height='24' rx='3' stroke='${primary}' stroke-width='2'/><line x1='13' y1='16' x2='27' y2='16' stroke='${accent}' stroke-width='1.5'/></svg>`,
            rationale: "Solid architectural durability and progressive growth."
          }
        ]
      };
    }

    res.json({
      success: true,
      brandKit: kit,
      provider: provider || "gemini",
      aiError: aiError || undefined,
    });
  } catch (error: any) {
    console.error("Brand Generator API Fatal Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate brand kit." });
  }
});

// Vite server configuration & hydration for non-serverless environments
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] App running on http://0.0.0.0:${PORT}`);
  });
}

// Only launch standalone listener when not in Vercel Serverless environment
if (!process.env.VERCEL) {
  startServer();
}

export default app;
export { app, startServer };
