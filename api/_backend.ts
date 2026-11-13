import type { IncomingMessage, ServerResponse } from "node:http";
import { GoogleGenAI } from "@google/genai";

export type AIProvider = "gemini" | "claude" | "openai";

interface CallAIOptions {
  provider?: AIProvider;
  customKey?: string;
  model?: string;
  systemInstruction?: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

/**
 * Strips accidental quotes, whitespace, non-ASCII / zero-width chars, or "Bearer " prefixes.
 */
export function cleanApiKey(raw?: string | string[]): string {
  if (!raw) return "";
  const str = Array.isArray(raw) ? raw[0] : raw;
  if (typeof str !== "string") return "";
  const cleaned = str
    .replace(/[\r\n\u200B-\u200D\uFEFF]/g, "")
    .trim()
    .replace(/^(GEMINI_API_KEY|OPENAI_API_KEY|ANTHROPIC_API_KEY|CLAUDE_API_KEY|API_KEY)\s*=\s*/i, "")
    .replace(/^["'`“”‘’]+|["'`“”‘’]+$/g, "")
    .replace(/^Bearer\s+/i, "")
    .replace(/[^\x21-\x7E]/g, "")
    .trim();

  if (
    !cleaned ||
    /^(undefined|null|none|placeholder|replace[_-]?me|my[_-]?gemini[_-]?api[_-]?key|your[_-]?api[_-]?key)$/i.test(
      cleaned
    )
  ) {
    return "";
  }
  return cleaned;
}

function resolveRequestKey(
  req: IncomingMessage,
  provider: AIProvider,
  bodyKey?: string
): string {
  const fromBody = cleanApiKey(bodyKey);
  if (fromBody) return fromBody;

  const headers = req.headers || {};
  if (provider === "gemini") return cleanApiKey(headers["x-gemini-key"]);
  if (provider === "claude") return cleanApiKey(headers["x-anthropic-key"]);
  if (provider === "openai") return cleanApiKey(headers["x-openai-key"]);
  return "";
}

function assertKeyMatchesProvider(provider: AIProvider, key: string) {
  if (!key) return;
  if (provider === "gemini") {
    if (key.startsWith("sk-ant-")) {
      throw new Error(
        "Anthropic Claude key (sk-ant-...) provided while Gemini is active. Select Claude in AI Settings or enter a Gemini API key (AIza...)."
      );
    }
    if (key.startsWith("sk-")) {
      throw new Error(
        "OpenAI key (sk-...) provided while Gemini is active. Select OpenAI in AI Settings or enter a Gemini API key (AIza...)."
      );
    }
  } else if (provider === "claude") {
    if (key.startsWith("AIza")) {
      throw new Error(
        "Google Gemini key (AIza...) provided while Claude is active. Select Gemini in AI Settings or enter an Anthropic key (sk-ant-...)."
      );
    }
    if (key.startsWith("sk-") && !key.startsWith("sk-ant-")) {
      throw new Error(
        "OpenAI key (sk-...) provided while Claude is active. Select OpenAI in AI Settings or enter an Anthropic key (sk-ant-...)."
      );
    }
  } else if (provider === "openai") {
    if (key.startsWith("AIza")) {
      throw new Error(
        "Google Gemini key (AIza...) provided while OpenAI is active. Select Gemini in AI Settings or enter an OpenAI key (sk-...)."
      );
    }
    if (key.startsWith("sk-ant-")) {
      throw new Error(
        "Anthropic Claude key (sk-ant-...) provided while OpenAI is active. Select Claude in AI Settings or enter an OpenAI key (sk-...)."
      );
    }
  }
}

function normalizeGeminiModel(model?: string): string {
  const raw = (model || "").trim();
  const validModels = new Set([
    "gemini-4-hydrogen",
    "gemini-4-argon",
    "gemini-4-carbon",
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
  ]);
  if (validModels.has(raw)) return raw;
  if (raw.includes("2.5-flash-lite")) return "gemini-2.5-flash-lite";
  if (raw.includes("2.5-flash")) return "gemini-2.5-flash";
  if (raw.includes("argon")) return "gemini-4-argon";
  if (raw.includes("carbon")) return "gemini-4-carbon";
  if (raw.includes("lite")) return "gemini-3.1-flash-lite";
  return "gemini-4-hydrogen";
}

function safeParseJSON(text: string): any | undefined {
  if (!text) return undefined;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : text)
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
  try {
    return JSON.parse(candidate);
  } catch {
    const firstBrace = candidate.indexOf("{");
    const lastBrace = candidate.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
      } catch {
        return undefined;
      }
    }
    return undefined;
  }
}

function formatProviderError(provider: string, err: any, statusCode?: number): string {
  const label = provider.toUpperCase();
  const rawMsg = typeof err === "string" ? err : err?.message || "Unknown API error";

  if (rawMsg.startsWith(`${label} `) || /provided while .* is active/i.test(rawMsg)) {
    return rawMsg;
  }

  if (/abort|timed out|timeout/i.test(rawMsg)) {
    return `${label} request timed out. Verify network connectivity or try a faster model.`;
  }

  try {
    const firstBrace = rawMsg.indexOf("{");
    if (firstBrace !== -1) {
      const parsed = JSON.parse(rawMsg.slice(firstBrace));
      const innerMsg = parsed?.error?.message || parsed?.message;
      const status = parsed?.error?.status || parsed?.status;
      const code = parsed?.error?.code || statusCode;

      if (code === 401 || status === "UNAUTHENTICATED" || status === "authentication_error") {
        return `${label} authentication failed: API key is invalid or expired. Check your key in AI Settings.`;
      }
      if (code === 403 || status === "PERMISSION_DENIED") {
        return `${label} permission denied: Check API key scopes, billing tier, or use a supported model in AI Settings.`;
      }
      if (code === 429 || status === "RESOURCE_EXHAUSTED" || status === "rate_limit_error") {
        return `${label} quota or rate limit exceeded. Wait briefly, check billing, or switch models in AI Settings.`;
      }
      if (code === 404 || status === "NOT_FOUND" || status === "not_found_error") {
        return `${label} model not found or unavailable on your key tier. Switch models in AI Settings.`;
      }
      if (innerMsg) {
        return `${label} error: ${innerMsg}`;
      }
    }
  } catch {
    // not JSON, fall back to readable checks
  }

  if (statusCode === 401 || /invalid.*api.?key|incorrect api key|authentication_error/i.test(rawMsg)) {
    return `${label} authentication failed: Invalid API key. Double-check your pasted key in AI Settings.`;
  }
  if (statusCode === 403 || /permission_denied/i.test(rawMsg)) {
    return `${label} permission denied: Verify key permissions or billing tier.`;
  }
  if (statusCode === 429 || /quota|rate.?limit|insufficient_quota|billing/i.test(rawMsg)) {
    return `${label} rate limit or quota exceeded. Check provider billing or try another model.`;
  }
  if (/API_KEY_INVALID|API key not valid/i.test(rawMsg)) {
    return "Invalid Gemini API key. Check your key in AI Settings (or environment variables) and try again.";
  }
  if (/ACCESS_TOKEN_TYPE_UNSUPPORTED/i.test(rawMsg)) {
    return "No valid Gemini API key configured. Enter your Gemini API key (AIza...) in AI Settings.";
  }
  return rawMsg;
}

async function callAI(options: CallAIOptions): Promise<{ text: string; data?: any; usedModel?: string }> {
  const provider = options.provider || "gemini";
  const temperature = options.temperature ?? 0.7;

  if (provider === "gemini") {
    const key = cleanApiKey(options.customKey) || cleanApiKey(process.env.GEMINI_API_KEY);
    if (!key) {
      throw new Error(
        "No Gemini API key configured. Enter your Gemini API key in AI Settings or set GEMINI_API_KEY in your environment variables."
      );
    }
    assertKeyMatchesProvider("gemini", key);

    const ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const executeGemini = async (targetModel: string) => {
      const config: Record<string, any> = {};
      if (!targetModel.startsWith("gemini-4") && !targetModel.startsWith("gemini-3")) {
        config.temperature = temperature;
      }
      if (options.systemInstruction) {
        config.systemInstruction = options.systemInstruction;
      }
      if (options.jsonMode) {
        config.responseMimeType = "application/json";
      }
      return ai.models.generateContent({
        model: targetModel,
        contents: options.userPrompt,
        config: Object.keys(config).length > 0 ? config : undefined,
      });
    };

    let modelName = normalizeGeminiModel(options.model);
    try {
      let response;
      try {
        response = await executeGemini(modelName);
      } catch (firstErr: any) {
        const msg = String(firstErr?.message || "");
        const isNotFound =
          firstErr?.status === 404 ||
          /"code"\s*:\s*404|NOT_FOUND|is not found for API version|not supported for generateContent/i.test(msg);
        if (isNotFound && modelName !== "gemini-2.5-flash") {
          modelName = "gemini-2.5-flash";
          response = await executeGemini(modelName);
        } else {
          throw firstErr;
        }
      }

      const text = response.text || "";
      if (!text.trim()) {
        throw new Error("GEMINI returned an empty response. Try rewording your prompt or switching models.");
      }
      if (options.jsonMode) {
        return { text, data: safeParseJSON(text), usedModel: modelName };
      }
      return { text, usedModel: modelName };
    } catch (err: any) {
      throw new Error(formatProviderError("gemini", err));
    }
  }

  if (provider === "claude") {
    const key = cleanApiKey(options.customKey) || cleanApiKey(process.env.ANTHROPIC_API_KEY);
    if (!key) {
      throw new Error(
        "No Anthropic API key found. Enter your Claude API key (sk-ant-...) in AI Settings."
      );
    }
    assertKeyMatchesProvider("claude", key);

    const executeClaude = async (targetModel: string) => {
      const sysPrompt = options.jsonMode
        ? `${options.systemInstruction || ""}\n\nIMPORTANT: Return ONLY a raw valid JSON object with no markdown fences or explanation.`
        : options.systemInstruction;

      const body: Record<string, any> = {
        model: targetModel,
        max_tokens: Math.max(64, Math.min(8192, Number(options.maxTokens) || 4096)),
        temperature: Math.max(0, Math.min(1, temperature)),
        messages: [{ role: "user", content: options.userPrompt }],
      };
      if (sysPrompt?.trim()) {
        body.system = sysPrompt.trim();
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45000);
      try {
        return await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }
    };

    try {
      let modelName = (options.model || "").trim() || "claude-sonnet-4-20250514";
      let resp = await executeClaude(modelName);

      if (resp.status === 404 && modelName !== "claude-sonnet-4-20250514") {
        modelName = "claude-sonnet-4-20250514";
        resp = await executeClaude(modelName);
      }

      if (!resp.ok) {
        const errText = await resp.text().catch(() => "");
        throw new Error(formatProviderError("claude", errText || resp.statusText, resp.status));
      }

      const data: any = await resp.json();
      const textBlocks = Array.isArray(data?.content)
        ? data.content.filter((b: any) => b?.type === "text" && b?.text).map((b: any) => b.text)
        : [];
      const text = textBlocks.join("\n") || data?.content?.[0]?.text || "";
      if (!text.trim()) {
        throw new Error("CLAUDE returned an empty response. Try adjusting max tokens or switching models.");
      }

      if (options.jsonMode) {
        return { text, data: safeParseJSON(text), usedModel: modelName };
      }
      return { text, usedModel: modelName };
    } catch (err: any) {
      throw new Error(formatProviderError("claude", err));
    }
  }

  if (provider === "openai") {
    const key = cleanApiKey(options.customKey) || cleanApiKey(process.env.OPENAI_API_KEY);
    if (!key) {
      throw new Error(
        "No OpenAI API key found. Enter your OpenAI API key (sk-...) in AI Settings."
      );
    }
    assertKeyMatchesProvider("openai", key);

    const executeOpenAI = async (targetModel: string) => {
      const isReasoningModel = /^(o1|o3|o4|gpt-5)/i.test(targetModel);
      const messages: any[] = [];
      let userContent = options.userPrompt;

      if (options.jsonMode && !userContent.toLowerCase().includes("json")) {
        userContent = `${userContent}\n\nRespond strictly with valid JSON.`;
      }

      if (options.systemInstruction) {
        if (isReasoningModel && targetModel.startsWith("o1-mini")) {
          userContent = `${options.systemInstruction}\n\n${userContent}`;
        } else {
          messages.push({
            role: isReasoningModel ? "developer" : "system",
            content: options.systemInstruction,
          });
        }
      }
      messages.push({ role: "user", content: userContent });

      const body: Record<string, any> = {
        model: targetModel,
        messages,
      };

      if (!isReasoningModel) {
        body.temperature = temperature;
        body.max_tokens = Math.max(64, Math.min(8192, Number(options.maxTokens) || 3000));
        if (options.jsonMode) {
          body.response_format = { type: "json_object" };
        }
      } else {
        body.max_completion_tokens = Math.max(1024, Math.min(16384, Number(options.maxTokens) || 4096));
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45000);
      try {
        return await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }
    };

    try {
      let targetModel = (options.model || "").trim() || "gpt-4o";
      let resp = await executeOpenAI(targetModel);

      if (resp.status === 404 && targetModel !== "gpt-4o") {
        targetModel = "gpt-4o";
        resp = await executeOpenAI("gpt-4o");
      }

      if (!resp.ok) {
        const errText = await resp.text().catch(() => "");
        throw new Error(formatProviderError("openai", errText || resp.statusText, resp.status));
      }

      const data: any = await resp.json();
      const text = data?.choices?.[0]?.message?.content || "";
      if (!text.trim()) {
        throw new Error("OPENAI returned an empty response. Try increasing max tokens or selecting GPT-4o.");
      }

      if (options.jsonMode) {
        return { text, data: safeParseJSON(text), usedModel: targetModel };
      }
      return { text, usedModel: targetModel };
    } catch (err: any) {
      throw new Error(formatProviderError("openai", err));
    }
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
}

function sendJson(res: ServerResponse, statusCode: number, payload: unknown) {
  if (res.writableEnded) return;
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req: IncomingMessage): Promise<Record<string, any>> {
  const preParsed = (req as any).body;
  if (preParsed !== undefined) {
    if (typeof preParsed === "string") {
      try {
        return JSON.parse(preParsed);
      } catch {
        return {};
      }
    }
    if (typeof preParsed === "object" && preParsed !== null) {
      return preParsed;
    }
  }

  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return {};
  }

  const chunks: Buffer[] = [];
  let totalBytes = 0;
  const maxBytes = 5 * 1024 * 1024;

  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buf.length;
    if (totalBytes > maxBytes) {
      throw new Error("Request payload exceeds 5MB limit.");
    }
    chunks.push(buf);
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON request body.");
  }
}

export async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-gemini-key, x-anthropic-key, x-openai-key"
  );

  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }

  try {
    const rawUrl = (req as any).originalUrl || req.url || "/";
    const parsedUrl = new URL(rawUrl, "http://localhost");
    const routeParam = parsedUrl.searchParams.get("__route");
    let pathname = parsedUrl.pathname || "/";
    if (routeParam) {
      pathname = `/api/${routeParam.replace(/^\/+/, "")}`;
    }

    // Normalize route tail so /api/foo, /api/index/foo, and /foo all resolve cleanly
    const cleanPath = pathname
      .replace(/^\/api\/index(?=\/|$)/, "")
      .replace(/^\/api(?=\/|$)/, "")
      .replace(/\/+$/, "") || "/";

    // 0. Health Check
    if (cleanPath === "/health" || (req.method === "GET" && cleanPath === "/")) {
      sendJson(res, 200, {
        status: "ok",
        runtime: process.env.VERCEL ? "vercel-serverless" : "express-node",
        envProviders: {
          gemini: Boolean(cleanApiKey(process.env.GEMINI_API_KEY)),
          claude: Boolean(cleanApiKey(process.env.ANTHROPIC_API_KEY)),
          openai: Boolean(cleanApiKey(process.env.OPENAI_API_KEY)),
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (req.method !== "POST") {
      sendJson(res, 405, {
        success: false,
        error: `Method ${req.method} not allowed for ${pathname}.`,
      });
      return;
    }

    const body = await readJsonBody(req);

    // 1. Connection Test
    if (cleanPath === "/test-connection") {
      try {
        const { provider = "gemini", apiKey, model } = body;
        const resolvedKey = resolveRequestKey(req, provider, apiKey);
        const activeModel = provider === "gemini" ? normalizeGeminiModel(model) : model;

        const result = await callAI({
          provider,
          customKey: resolvedKey,
          model: activeModel,
          userPrompt: "Respond with 'READY' followed by one short sentence confirming the active model.",
          temperature: 0.1,
          maxTokens: 120,
        });

        sendJson(res, 200, {
          success: true,
          provider,
          model: result.usedModel || activeModel,
          sampleResponse: result.text.trim(),
        });
      } catch (error: any) {
        sendJson(res, 400, {
          success: false,
          error: error?.message || "Failed to establish test connection.",
        });
      }
      return;
    }

    // 2. Universal Prompt Builder & Prompt Doctor
    if (cleanPath === "/prompt-craft") {
      try {
        const {
          promptType,
          rawGoal,
          task,
          targetAI,
          aspectRatio,
          artStyle,
          lighting,
          framework,
          tone,
          variables,
          additionalRules,
          provider = "gemini",
          apiKey,
          model,
          temperature,
        } = body;

        const coreGoal = String(rawGoal || task || "").trim();
        if (!coreGoal) {
          sendJson(res, 400, { error: "Missing required parameter: rawGoal" });
          return;
        }

        const resolvedKey = resolveRequestKey(req, provider, apiKey);
        const systemInstruction = `You are a Principal Prompt Engineer and AI Systems Architect with deep mastery across Gemini, Claude, OpenAI, and visual engines (Midjourney, Flux, Canva).
Construct a clean, production-ready prompt tailored to the user's goal.

CRITICAL FORMAT REQUIREMENT:
Respond strictly with a valid JSON object matching this exact schema:
{
  "masterPrompt": "The complete, copy-paste ready prompt text",
  "promptTitle": "A concise title for this crafted prompt",
  "category": "${promptType || "prompt_doctor"}",
  "architecture": "Engineering pattern used (e.g., 'XML Delimited Specification', 'Role-Task-Constraint')",
  "variables": [
    { "name": "variable_name", "description": "What goes here", "defaultValue": "Example value" }
  ],
  "whyItWorks": ["Advantage 1", "Advantage 2", "Advantage 3"],
  "proTips": ["Model/temperature tip 1", "Formatting tip 2"]
}`;

        const userPrompt = `Craft a structured prompt with these specifications:
- Category: ${promptType || "prompt_doctor"}
- Core Goal: "${coreGoal}"
- Target Model: ${targetAI || "universal"}
- Framework: ${framework || "best-fit"}
- Tone / Persona: ${tone || "Clear, direct, authoritative"}
- Visual Specs: Style="${artStyle || "N/A"}", Lighting="${lighting || "N/A"}", Aspect Ratio="${aspectRatio || "N/A"}"
- Constraints / Rules: "${additionalRules || "Zero ambiguity, clean output format"}"
- Variables: ${JSON.stringify(variables || [])}`;

        const aiResult = await callAI({
          provider,
          customKey: resolvedKey,
          model,
          temperature: temperature ?? 0.6,
          systemInstruction,
          userPrompt,
          jsonMode: true,
        });

        const crafted = aiResult.data || {
          masterPrompt: aiResult.text,
          promptTitle: "Crafted Master Prompt",
          category: promptType || "prompt_doctor",
          architecture: "Structured Direct Prompt",
          variables: [],
          whyItWorks: ["Clear constraints and unambiguous output framing"],
          proTips: ["Run against a real sample input to validate formatting"],
        };

        sendJson(res, 200, { success: true, crafted, provider });
      } catch (error: any) {
        sendJson(res, 400, { error: error?.message || "Failed to craft prompt." });
      }
      return;
    }

    // 3. Prompt Execution / Playground
    if (cleanPath === "/prompt-execute") {
      try {
        const {
          prompt,
          systemInstruction,
          provider = "gemini",
          apiKey,
          model,
          temperature,
          maxTokens,
        } = body;

        if (!String(prompt || "").trim()) {
          sendJson(res, 400, { error: "Missing required parameter: prompt" });
          return;
        }

        const resolvedKey = resolveRequestKey(req, provider, apiKey);
        const aiResult = await callAI({
          provider,
          customKey: resolvedKey,
          model,
          systemInstruction,
          userPrompt: prompt,
          temperature: temperature ?? 0.7,
          maxTokens: maxTokens ?? 2048,
        });

        sendJson(res, 200, { success: true, output: aiResult.text, provider });
      } catch (error: any) {
        sendJson(res, 400, { error: error?.message || "Failed to execute prompt." });
      }
      return;
    }

    // 4. Image Prompt Generator App
    if (cleanPath === "/image-prompt-craft") {
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
          provider = "gemini",
          apiKey,
          model,
          temperature,
        } = body;

        const coreSubject = String(
          subject?.trim() || "Minimalist concrete architectural pavilion over misty coastal cliffs at dawn"
        );
        const engine = targetEngine || "midjourney";
        const style = artStyle || "35mm Analog Film (Kodak Portra 400)";
        const cam = camera || "85mm f/1.4 Lens, Creamy Bokeh Depth";
        const light = lighting || "Volumetric Golden Hour Sunburst Rays";
        const mood = colorMood || "Teal & Orange Hollywood Cinema";
        const ar = aspectRatio || "16:9";
        const flags = Array.isArray(qualityFlags) ? qualityFlags : ["8k UHD", "photorealistic tactile textures"];
        const negatives = Array.isArray(negativePrompts)
          ? negativePrompts
          : ["blurry", "extra limbs", "distorted anatomy", "watermark", "lowres"];

        const resolvedKey = resolveRequestKey(req, provider, apiKey);
        const systemInstruction = `You are a Principal Visual Concept Director specializing in Midjourney v6.1, DALL-E 3, Flux.1, Canva Magic Media, and Google Imagen 3.
Return strictly valid JSON containing 4 distinct, production-ready image prompts:
1. "Photorealistic Cinematic"
2. "Stylized 3D Octane / Unreal 5"
3. "Editorial Fine Art"
4. "Commercial Clean & Modern"

JSON schema:
{
  "variations": [
    {
      "id": "var_1",
      "styleLabel": "Photorealistic Cinematic",
      "fullPrompt": "Complete copy-ready prompt text",
      "negativePrompt": "...",
      "engineParameters": "--ar ${ar} --v 6.1 --style raw --s 250",
      "breakdown": {
        "subject": "...",
        "composition": "...",
        "lighting": "...",
        "camera": "...",
        "colorPalette": "..."
      },
      "rationale": "Why this framing works"
    }
  ],
  "creativeTips": ["Tip 1", "Tip 2"]
}`;

        const userPrompt = `Generate 4 distinctive image prompt variations as JSON:
- Subject: "${coreSubject}"
- Target Engine: ${engine}
- Art Style: ${style}
- Camera Optics: ${cam}
- Lighting: ${light}
- Color Mood: ${mood}
- Aspect Ratio: ${ar}
- Quality Tags: ${flags.join(", ")}
- Negative Constraints: ${negatives.join(", ")}`;

        const aiResult = await callAI({
          provider,
          customKey: resolvedKey,
          model,
          temperature: temperature ?? 0.7,
          systemInstruction,
          userPrompt,
          jsonMode: true,
        });

        if (!aiResult.data?.variations?.length) {
          throw new Error(
            "The AI model did not return valid structured prompt variations. Try switching model or regenerating."
          );
        }

        sendJson(res, 200, { success: true, data: aiResult.data, provider });
      } catch (error: any) {
        sendJson(res, 400, { error: error?.message || "Failed to craft image prompts." });
      }
      return;
    }

    // 5. Brand Kit Generator
    if (cleanPath === "/brand-generator") {
      try {
        const {
          brandName,
          industry,
          vibe,
          provider = "gemini",
          apiKey,
          model,
          temperature,
        } = body;

        const brand = String(brandName || "").trim() || "Atelier North";
        const ind = String(industry || "").trim() || "Software Engineering & Design Systems";
        const aesthetic = String(vibe || "").trim() || "Minimalist Neo-Grotesque";
        const resolvedKey = resolveRequestKey(req, provider, apiKey);

        const systemInstruction = `You are a Principal Brand Director and Three.js Technical Artist.
Generate a cohesive brand identity kit with:
1. A WCAG AA compliant 7-color palette.
2. A Google Fonts pairing (Display + Body) from: Plus Jakarta Sans, Outfit, Bricolage Grotesque, Sora, Syne, Playfair Display, DM Sans, Manrope, JetBrains Mono, Archivo, Lora.
3. Three (3) procedural Three.js 3D logo concepts using archetypes: "polyhedral_core", "orbital_rings", "geometric_torus_prism", "faceted_gem", "cyber_monolith".

Respond strictly with valid JSON:
{
  "brandName": "${brand}",
  "palette": {
    "name": "Palette Name",
    "harmony": "Monochromatic / Complementary / Triadic / Analogous",
    "rationale": "Why these colors fit",
    "primary": "#HEX",
    "accent": "#HEX",
    "bg": "#HEX",
    "surface": "#HEX",
    "text": "#HEX",
    "muted": "#HEX",
    "border": "#HEX"
  },
  "typography": {
    "fontH": "Plus Jakarta Sans",
    "fontB": "DM Sans",
    "pairingName": "Pairing style title",
    "weights": "Display 700 / Body 400",
    "rationale": "Typography rationale"
  },
  "logoConcepts": [
    {
      "id": "concept_1",
      "name": "Concept Title",
      "tagline": "Short descriptor",
      "archetype": "polyhedral_core",
      "proceduralDetails": {
        "partCount": 5,
        "primaryColor": "#HEX",
        "secondaryColor": "#HEX",
        "accentColor": "#HEX",
        "metalness": 0.85,
        "roughness": 0.18,
        "wireframe": false,
        "rotationSpeed": 0.8,
        "description": "3D structural notes"
      },
      "svgGlyph": "<svg viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='20' cy='20' r='14' stroke='currentColor' stroke-width='2'/></svg>",
      "rationale": "Conceptual alignment"
    }
  ]
}`;

        const userPrompt = `Generate a brand kit JSON for:
- Brand Name: "${brand}"
- Domain / Role: "${ind}"
- Aesthetic Vibe: "${aesthetic}"
Ensure exact 6-character HEX codes and 3 distinct 3D logo concepts.`;

        const aiResult = await callAI({
          provider,
          customKey: resolvedKey,
          model,
          temperature: temperature ?? 0.7,
          systemInstruction,
          userPrompt,
          jsonMode: true,
        });

        const kit = aiResult.data;
        if (!kit || !kit.palette || !kit.logoConcepts?.length) {
          throw new Error("The AI model returned an incomplete brand kit schema. Try again.");
        }

        sendJson(res, 200, { success: true, brandKit: kit, provider });
      } catch (error: any) {
        sendJson(res, 400, { error: error?.message || "Failed to generate brand kit." });
      }
      return;
    }

    // 6. Live Section Polish
    if (cleanPath === "/section-polish") {
      try {
        const {
          sectionType,
          sectionData,
          brandName,
          role,
          provider = "gemini",
          apiKey,
          model,
          temperature,
        } = body;

        if (!sectionType || !sectionData) {
          sendJson(res, 400, { error: "Missing sectionType or sectionData." });
          return;
        }

        const resolvedKey = resolveRequestKey(req, provider, apiKey);
        const systemInstruction = `You are a sharp editorial website copywriter.
Rewrite the text values inside the provided website section JSON for "${brandName || "the brand"}" (${role || "Digital Studio"}).
CRITICAL RULES:
1. Preserve the EXACT JSON keys, arrays, array lengths, URLs, and structure of the input JSON.
2. Replace generic clichés ("supercharge", "empower", "unlock", "next-gen", "elevate") with concrete, direct, authentic human prose.
3. Return ONLY the updated JSON object matching the exact shape of the input data.`;

        const userPrompt = `Polish this "${sectionType}" section data and return valid JSON with identical keys:\n${JSON.stringify(sectionData, null, 2)}`;

        const aiResult = await callAI({
          provider,
          customKey: resolvedKey,
          model,
          temperature: temperature ?? 0.65,
          systemInstruction,
          userPrompt,
          jsonMode: true,
        });

        if (!aiResult.data || typeof aiResult.data !== "object") {
          throw new Error("Could not parse polished section JSON from model response.");
        }

        let updatedData = aiResult.data;
        if (
          updatedData &&
          typeof updatedData === "object" &&
          !Array.isArray(updatedData) &&
          Object.keys(updatedData).length === 1
        ) {
          const onlyKey = Object.keys(updatedData)[0];
          if (
            (onlyKey === sectionType || onlyKey === "updatedData" || onlyKey === "data") &&
            typeof updatedData[onlyKey] === "object" &&
            updatedData[onlyKey] !== null
          ) {
            updatedData = updatedData[onlyKey];
          }
        }

        sendJson(res, 200, { success: true, updatedData, provider });
      } catch (error: any) {
        sendJson(res, 400, { error: error?.message || "Failed to polish section." });
      }
      return;
    }

    // 7. Full AI Site Copy Generator
    if (cleanPath === "/site-generate") {
      try {
        const {
          name,
          role,
          goal,
          vibe,
          provider = "gemini",
          apiKey,
          model,
          temperature,
        } = body;

        const resolvedKey = resolveRequestKey(req, provider, apiKey);
        const systemInstruction = `You are a senior product designer and web copywriter.
Generate tailored website section copy as valid JSON. Avoid generic AI hype or buzzwords; write grounded, confident, concrete copy.

Return strictly valid JSON matching:
{
  "hero": { "eyebrow": "...", "title": "...", "subtitle": "...", "cta": "...", "cta2": "..." },
  "about": {
    "title": "...",
    "text": "...",
    "stats": [
      { "value": "...", "label": "..." },
      { "value": "...", "label": "..." },
      { "value": "...", "label": "..." }
    ]
  },
  "services": {
    "title": "...",
    "subtitle": "...",
    "items": [
      { "icon": "01", "title": "...", "text": "..." },
      { "icon": "02", "title": "...", "text": "..." },
      { "icon": "03", "title": "...", "text": "..." }
    ]
  },
  "contact": { "title": "...", "text": "...", "cta": "..." }
}`;

        const userPrompt = `Create complete website copy JSON for:
- Name / Brand: "${name || "Alex Morgan"}"
- Discipline / Role: "${role || "Frontend Engineer"}"
- Goal: "${goal || "Portfolio"}"
- Aesthetic Vibe: "${vibe || "editorial"}"`;

        const aiResult = await callAI({
          provider,
          customKey: resolvedKey,
          model,
          temperature: temperature ?? 0.7,
          systemInstruction,
          userPrompt,
          jsonMode: true,
        });

        if (!aiResult.data || !aiResult.data.hero) {
          throw new Error("Could not parse site copy JSON from model response.");
        }

        sendJson(res, 200, { success: true, siteCopy: aiResult.data, provider });
      } catch (error: any) {
        sendJson(res, 400, { error: error?.message || "Failed to generate custom site copy." });
      }
      return;
    }

    sendJson(res, 404, { success: false, error: `Unknown API endpoint: ${pathname}` });
  } catch (err: any) {
    console.error("Unhandled API handler error:", err);
    sendJson(res, 500, {
      success: false,
      error: err?.message || "Internal server error while processing API request.",
    });
  }
}
