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
  geminiModel: "gemini-3.8-flash",
  claudeKey: "",
  claudeModel: "claude-3-5-sonnet-20241022",
  openaiKey: "",
  openaiModel: "gpt-4o",
  temperature: 0.7,
  maxTokens: 3000,
};

export const PROVIDER_MODELS: Record<AIProvider, { id: string; name: string; description: string; badge?: string }[]> = {
  gemini: [
    { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash", description: "High-speed flagship for everyday generation, copy & prompt engineering", badge: "Recommended" },
    { id: "gemini-4-argon", name: "Gemini 4 Argon", description: "Ultra-high reasoning capacity for advanced logic & architecture", badge: "Pro Reasoning" },
    { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash Lite", description: "Fastest response times and minimal token latency" },
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", description: "Stable generation standard" },
  ],
  claude: [
    { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", description: "Industry standard for nuanced writing, XML formatting & code", badge: "Recommended" },
    { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", description: "Fast, concise responses for prompt generation" },
    { id: "claude-3-opus-20240229", name: "Claude 3 Opus", description: "Deep analysis and long-form strategic instruction sets" },
  ],
  openai: [
    { id: "gpt-4o", name: "GPT-4o", description: "Most capable multimodal flagship model", badge: "Recommended" },
    { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Lightweight and cost-efficient" },
    { id: "o1-mini", name: "o1-mini", description: "Advanced reasoning for complex logical constraints" },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "High token capacity legacy engine" },
  ],
};

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
