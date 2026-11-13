export type AIProvider = "gemini" | "claude" | "openai";

export interface AISettings {
  activeProvider: AIProvider;
  geminiKey: string; // custom key or empty for server default
  geminiModel: string;
  claudeKey: string;
  claudeModel: string;
  openaiKey: string;
  openaiModel: string;
  temperature: number;
  maxTokens: number;
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  activeProvider: "gemini",
  geminiKey: "",
  geminiModel: "gemini-4-hydrogen",
  claudeKey: "",
  claudeModel: "claude-sonnet-4-20250514",
  openaiKey: "",
  openaiModel: "gpt-4o",
  temperature: 0.7,
  maxTokens: 3000,
};

export const PROVIDER_MODELS: Record<AIProvider, { id: string; name: string; description: string; badge?: string }[]> = {
  gemini: [
    { id: "gemini-4-hydrogen", name: "Gemini 4 Hydrogen", description: "High-speed flagship for general generation, copywriting & JSON workflows", badge: "Recommended" },
    { id: "gemini-4-argon", name: "Gemini 4 Argon", description: "Complex reasoning, architecture & code generation", badge: "Pro" },
    { id: "gemini-4-carbon", name: "Gemini 4 Carbon", description: "Deep multi-step architectural reasoning", badge: "Deep" },
    { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash Lite", description: "Lowest latency for rapid iterations" },
  ],
  claude: [
    { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", description: "Balanced reasoning, XML scaffolding, and precision instruction adherence", badge: "Recommended" },
    { id: "claude-3-7-sonnet-20250219", name: "Claude 3.7 Sonnet", description: "Structured engineering copy and code synthesis" },
    { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", description: "Fast responses for prompt refinement" },
  ],
  openai: [
    { id: "gpt-4o", name: "GPT-4o", description: "Multimodal flagship for JSON schemas and prompt craft", badge: "Recommended" },
    { id: "gpt-4.1", name: "GPT-4.1", description: "High-precision instruction following and code", badge: "Latest" },
    { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Fast and cost-efficient" },
    { id: "o3-mini", name: "o3-mini", description: "Dedicated reasoning model for complex constraints" },
  ],
};

const VALID_GEMINI_IDS = new Set(PROVIDER_MODELS.gemini.map((m) => m.id));
const VALID_CLAUDE_IDS = new Set(PROVIDER_MODELS.claude.map((m) => m.id));
const VALID_OPENAI_IDS = new Set(PROVIDER_MODELS.openai.map((m) => m.id));

export function cleanClientApiKey(raw?: string): string {
  if (!raw || typeof raw !== "string") return "";
  return raw
    .replace(/[\r\n\u200B-\u200D\uFEFF]/g, "")
    .trim()
    .replace(/^(GEMINI_API_KEY|OPENAI_API_KEY|ANTHROPIC_API_KEY|CLAUDE_API_KEY|API_KEY)\s*=\s*/i, "")
    .replace(/^["'`“”‘’]+|["'`“”‘’]+$/g, "")
    .replace(/^Bearer\s+/i, "")
    .replace(/[^\x21-\x7E]/g, "")
    .trim();
}

/**
 * Normalizes persisted localStorage settings so stale/retired model IDs
 * from previous builds never trigger 404 Model Not Found API errors.
 */
export function sanitizeAISettings(raw: Partial<AISettings>): AISettings {
  const merged = { ...DEFAULT_AI_SETTINGS, ...raw };

  merged.geminiKey = cleanClientApiKey(merged.geminiKey);
  merged.claudeKey = cleanClientApiKey(merged.claudeKey);
  merged.openaiKey = cleanClientApiKey(merged.openaiKey);

  if (!VALID_GEMINI_IDS.has(merged.geminiModel)) {
    merged.geminiModel = DEFAULT_AI_SETTINGS.geminiModel;
  }
  if (!VALID_CLAUDE_IDS.has(merged.claudeModel)) {
    merged.claudeModel = DEFAULT_AI_SETTINGS.claudeModel;
  }
  if (!VALID_OPENAI_IDS.has(merged.openaiModel)) {
    merged.openaiModel = DEFAULT_AI_SETTINGS.openaiModel;
  }
  if (!["gemini", "claude", "openai"].includes(merged.activeProvider)) {
    merged.activeProvider = "gemini";
  }

  return merged;
}

export function getActiveCredential(settings: AISettings): {
  provider: AIProvider;
  apiKey: string;
  model: string;
} {
  if (settings.activeProvider === "claude") {
    return {
      provider: "claude",
      apiKey: settings.claudeKey,
      model: settings.claudeModel,
    };
  }
  if (settings.activeProvider === "openai") {
    return {
      provider: "openai",
      apiKey: settings.openaiKey,
      model: settings.openaiModel,
    };
  }
  return {
    provider: "gemini",
    apiKey: settings.geminiKey,
    model: settings.geminiModel,
  };
}

export type PromptCategory =
  | "prompt_doctor"
  | "canva_image"
  | "system_role"
  | "coding"
  | "reasoning_cot"
  | "copywriting";

export interface PromptVariable {
  name: string;
  description: string;
  defaultValue: string;
}

export interface CraftedPrompt {
  masterPrompt: string;
  promptTitle: string;
  category: PromptCategory;
  architecture: string;
  variables: PromptVariable[];
  whyItWorks: string[];
  proTips: string[];
}
