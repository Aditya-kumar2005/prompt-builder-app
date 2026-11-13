import React, { useState } from "react";
import {
  Wand2,
  Sparkles,
  Copy,
  Check,
  Play,
  Layers,
  Code,
  BrainCircuit,
  Megaphone,
  Palette,
  Sliders,
  Bookmark,
  BookmarkCheck,
  Terminal,
  Download,
  Lightbulb,
  RefreshCw,
  Cpu,
  AlertCircle,
} from "lucide-react";
import { AISettings, PromptCategory, CraftedPrompt, getActiveCredential, safeFetchJson } from "../types/ai";
import { ImagePromptGeneratorApp } from "./ImagePromptGeneratorApp";

interface PromptBuilderTabProps {
  settings: AISettings;
  triggerToast: (message: string, type?: "success" | "error" | "info") => void;
  onOpenSettings?: () => void;
}

const CATEGORY_ITEMS: { id: PromptCategory; label: string; icon: React.ElementType; description: string }[] = [
  { id: "prompt_doctor", label: "Prompt Doctor", icon: Sparkles, description: "Turn rough ideas into structured instructions" },
  { id: "canva_image", label: "Visual & Canva", icon: Palette, description: "Image specs for Midjourney, Flux, and Canva" },
  { id: "system_role", label: "System Role", icon: Layers, description: "Claude & GPT system instructions with rules" },
  { id: "coding", label: "Code & Review", icon: Code, description: "Technical prompts for architecture and audits" },
  { id: "reasoning_cot", label: "Reasoning", icon: BrainCircuit, description: "Step-by-step decomposition and verification" },
  { id: "copywriting", label: "Marketing Copy", icon: Megaphone, description: "AIDA/PAS conversion and product messaging" },
];

const PRESET_RECIPES = [
  {
    category: "prompt_doctor" as PromptCategory,
    name: "Clarify Vague Idea",
    rawGoal: "Make me an app that tracks habits and gives scores.",
    targetAI: "universal",
    framework: "Role-Task-Constraint",
    tone: "Analytical and structured",
  },
  {
    category: "canva_image" as PromptCategory,
    name: "SaaS Product Photography",
    rawGoal: "Studio photograph of an anodized aluminum hardware interface dial sitting beside a dark glass monitor.",
    targetAI: "canva",
    artStyle: "Photorealistic 8K",
    lighting: "Soft overhead studio softbox with crisp specular highlights",
    aspectRatio: "16:9",
  },
  {
    category: "system_role" as PromptCategory,
    name: "Systems Architect Auditor",
    rawGoal: "An AI advisor that audits cloud infrastructure diagrams and identifies security vulnerabilities.",
    targetAI: "claude",
    framework: "XML-Structured",
    tone: "Authoritative, direct, concrete",
  },
  {
    category: "coding" as PromptCategory,
    name: "TypeScript Code Auditor",
    rawGoal: "Review full-stack TypeScript code for memory leaks, async race conditions, and Tailwind v4 compliance.",
    targetAI: "openai",
    framework: "Step-by-Step",
    tone: "Principal Systems Engineer",
  },
  {
    category: "copywriting" as PromptCategory,
    name: "B2B Landing Copy (AIDA)",
    rawGoal: "Landing page hero copy for automated bookkeeping software built for independent design studios.",
    targetAI: "gemini",
    framework: "AIDA",
    tone: "Clear, grounded, persuasive",
  },
];

export const PromptBuilderTab: React.FC<PromptBuilderTabProps> = ({
  settings,
  triggerToast,
  onOpenSettings,
}) => {
  const [studioMode, setStudioMode] = useState<"universal" | "image_generator">("universal");
  const [activeCategory, setActiveCategory] = useState<PromptCategory>("prompt_doctor");

  const [rawGoal, setRawGoal] = useState(
    "A structured prompt to design and audit a full-stack telemetry dashboard with clean API error handling."
  );
  const [targetAI, setTargetAI] = useState<string>("universal");
  const [framework, setFramework] = useState<string>("XML-Structured");
  const [tone, setTone] = useState<string>("Direct, concrete, and structured");

  const [artStyle, setArtStyle] = useState<string>("Photorealistic 8K");
  const [lighting, setLighting] = useState<string>("Soft three-point studio key light");
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");

  const [additionalRules, setAdditionalRules] = useState<string>(
    "Avoid generic hype words. Provide explicit formatting constraints and clear examples."
  );

  const [crafting, setCrafting] = useState(false);
  const [craftError, setCraftError] = useState<string | null>(null);
  const [craftedResult, setCraftedResult] = useState<CraftedPrompt | null>(null);

  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  const [executing, setExecuting] = useState(false);
  const [execError, setExecError] = useState<string | null>(null);
  const [executionOutput, setExecutionOutput] = useState<string | null>(null);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);

  const [savedPrompts, setSavedPrompts] = useState<CraftedPrompt[]>(() => {
    try {
      const stored = localStorage.getItem("template_studio_saved_prompts");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [copied, setCopied] = useState(false);

  const cred = getActiveCredential(settings);
  const missingCustomKey = cred.provider !== "gemini" && !cred.apiKey;

  const handleLoadRecipe = (recipe: typeof PRESET_RECIPES[0]) => {
    setActiveCategory(recipe.category);
    setRawGoal(recipe.rawGoal);
    setTargetAI(recipe.targetAI);
    if (recipe.framework) setFramework(recipe.framework);
    if (recipe.tone) setTone(recipe.tone);
    if (recipe.artStyle) setArtStyle(recipe.artStyle);
    if (recipe.lighting) setLighting(recipe.lighting);
    if (recipe.aspectRatio) setAspectRatio(recipe.aspectRatio);
    triggerToast(`Loaded preset: ${recipe.name}`, "info");
  };

  const handleCraftPrompt = async () => {
    if (!rawGoal.trim()) {
      triggerToast("Enter a goal or rough prompt first.", "error");
      return;
    }
    if (missingCustomKey) {
      const msg = `Add your ${cred.provider.toUpperCase()} API key in AI Settings before generating.`;
      setCraftError(msg);
      triggerToast(msg, "error");
      return;
    }

    setCrafting(true);
    setCraftError(null);
    setExecError(null);
    setExecutionOutput(null);

    try {
      const { ok, data } = await safeFetchJson("/api/prompt-craft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptType: activeCategory,
          rawGoal,
          targetAI,
          aspectRatio: activeCategory === "canva_image" ? aspectRatio : undefined,
          artStyle: activeCategory === "canva_image" ? artStyle : undefined,
          lighting: activeCategory === "canva_image" ? lighting : undefined,
          framework,
          tone,
          additionalRules,
          provider: cred.provider,
          apiKey: cred.apiKey,
          model: cred.model,
          temperature: settings.temperature,
        }),
      });

      if (!ok || !data?.success) {
        throw new Error(data?.error || "Failed to craft prompt.");
      }

      setCraftedResult(data.crafted);

      const initialVars: Record<string, string> = {};
      data.crafted.variables?.forEach((v: any) => {
        initialVars[v.name] = v.defaultValue || "";
      });
      setVariableValues(initialVars);

      triggerToast("Master prompt ready", "success");
    } catch (err: any) {
      const msg = err.message || "Failed to craft prompt.";
      setCraftError(msg);
      triggerToast(msg, "error");
    } finally {
      setCrafting(false);
    }
  };

  const getRenderedPrompt = () => {
    if (!craftedResult) return "";
    let text = craftedResult.masterPrompt;
    Object.entries(variableValues).forEach(([k, v]) => {
      text = text.replaceAll(`{{${k}}}`, v || `{{${k}}}`);
    });
    return text;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    triggerToast("Prompt copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestRunPrompt = async () => {
    const rendered = getRenderedPrompt();
    if (!rendered) return;

    setExecuting(true);
    setExecError(null);
    setExecutionOutput(null);
    const startTime = Date.now();

    try {
      const { ok, data } = await safeFetchJson("/api/prompt-execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: rendered,
          provider: cred.provider,
          apiKey: cred.apiKey,
          model: cred.model,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
        }),
      });

      setExecutionTimeMs(Date.now() - startTime);

      if (!ok || !data?.success) {
        throw new Error(data?.error || "Model execution failed.");
      }

      setExecutionOutput(data.output);
      triggerToast("Execution completed", "success");
    } catch (err: any) {
      const msg = err.message || "Execution failed.";
      setExecError(msg);
      triggerToast(msg, "error");
    } finally {
      setExecuting(false);
    }
  };

  const handleSavePrompt = () => {
    if (!craftedResult) return;
    const updated = [craftedResult, ...savedPrompts.filter(p => p.promptTitle !== craftedResult.promptTitle)];
    setSavedPrompts(updated);
    localStorage.setItem("template_studio_saved_prompts", JSON.stringify(updated));
    triggerToast("Saved to Prompt Library", "success");
  };

  const handleDownload = () => {
    const rendered = getRenderedPrompt();
    if (!rendered) return;
    const blob = new Blob([rendered], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${craftedResult?.promptTitle.replace(/\s+/g, "_").toLowerCase() || "prompt"}.md`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast("Markdown file downloaded", "success");
  };

  const isSaved = craftedResult && savedPrompts.some(p => p.promptTitle === craftedResult.promptTitle);

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-2">
      {/* Top Banner */}
      <div className="border-b border-zinc-900 pb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-white flex items-center gap-2.5">
            <Wand2 className="w-5 h-5 text-blue-400" />
            <span>Prompt Engineering Studio</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Structure, parameterize, benchmark, and export prompts across text and image synthesis models.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-md text-xs font-mono">
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-zinc-400">Engine:</span>
          <span className="font-medium text-white capitalize">{cred.provider}</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-300">{cred.model}</span>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setStudioMode("universal")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              studioMode === "universal"
                ? "bg-blue-600 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Universal Prompt Studio</span>
          </button>

          <button
            type="button"
            onClick={() => setStudioMode("image_generator")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              studioMode === "image_generator"
                ? "bg-blue-600 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Image Prompt Generator</span>
          </button>
        </div>

        <div className="text-[11px] text-zinc-400 font-mono hidden sm:block px-2">
          {studioMode === "universal"
            ? "System Prompts · Reasoning · Code Audits"
            : "Midjourney v6.1 · DALL-E 3 · Flux.1 · Canva"}
        </div>
      </div>

      {studioMode === "image_generator" ? (
        <ImagePromptGeneratorApp
          settings={settings}
          triggerToast={triggerToast}
          onOpenSettings={onOpenSettings}
        />
      ) : (
        <>
          {missingCustomKey && (
            <div className="p-3.5 rounded-lg border border-amber-500/40 bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-200">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-100 block">
                    {cred.provider === "claude" ? "Anthropic Claude" : "OpenAI"} API key required
                  </span>
                  <span className="text-[11px] text-amber-200/80">
                    Your active provider has no saved key in localStorage. Add a key in Settings or switch to Gemini.
                  </span>
                </div>
              </div>
              {onOpenSettings && (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="px-3 py-1.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-100 font-medium text-xs transition-colors cursor-pointer whitespace-nowrap self-start sm:self-center"
                >
                  Open AI Settings
                </button>
              )}
            </div>
          )}
          {/* Quick Presets */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
              <Lightbulb className="w-3.5 h-3.5 text-zinc-400" />
              <span>Quick Presets</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_RECIPES.map((recipe, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleLoadRecipe(recipe)}
                  className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                >
                  {recipe.name}
                </button>
              ))}
            </div>
          </div>

          {/* Architecture Categories */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {CATEGORY_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeCategory === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveCategory(item.id)}
                  className={`p-3 rounded-lg border text-left transition-colors flex flex-col justify-between cursor-pointer ${
                    isActive
                      ? "bg-zinc-900 border-blue-500 text-white"
                      : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-zinc-500"}`} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold block">{item.label}</span>
                    <span className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">{item.description}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main Workstation Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Specification Form */}
            <div className="lg:col-span-5 bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  <h3 className="font-semibold text-xs text-zinc-200">
                    Prompt Specification
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-zinc-500 uppercase">
                  {activeCategory.replace("_", " ")}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-zinc-300">
                    Core Goal / Draft
                  </label>
                  <span className="text-[11px] text-zinc-500 font-mono">Plain language input</span>
                </div>
                <textarea
                  value={rawGoal}
                  onChange={(e) => setRawGoal(e.target.value)}
                  placeholder="Describe what you want the AI model to accomplish..."
                  className="w-full h-28 bg-zinc-950 border border-zinc-800 rounded-md p-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400">Target Model</label>
                  <select
                    value={targetAI}
                    onChange={(e) => setTargetAI(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-md p-2 text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="universal">Universal (All Models)</option>
                    <option value="claude">Anthropic Claude</option>
                    <option value="gemini">Google Gemini</option>
                    <option value="openai">OpenAI GPT</option>
                    <option value="canva">Canva Magic Media</option>
                    <option value="midjourney">Midjourney v6.1</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400">Structure</label>
                  <select
                    value={framework}
                    onChange={(e) => setFramework(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-md p-2 text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="XML-Structured">XML Tags Schema</option>
                    <option value="Role-Task-Constraint">Role-Task-Constraint</option>
                    <option value="Few-Shot-CoT">Few-Shot + Reasoning</option>
                    <option value="AIDA">AIDA (Marketing)</option>
                    <option value="PAS">PAS (Problem-Agitate-Solve)</option>
                    <option value="Photographic-Formula">Photographic Formula</option>
                  </select>
                </div>
              </div>

              {activeCategory === "canva_image" && (
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-md space-y-3">
                  <span className="text-[11px] font-medium text-zinc-300 block">
                    Visual Parameters
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] text-zinc-400">Style</label>
                      <select
                        value={artStyle}
                        onChange={(e) => setArtStyle(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 text-xs rounded p-2 text-zinc-200 focus:outline-none cursor-pointer"
                      >
                        <option value="Photorealistic 8K">Photorealistic 8K</option>
                        <option value="Glassmorphism 3D">Editorial 3D Render</option>
                        <option value="Minimal Flat Vector">Minimal Flat Vector</option>
                        <option value="Isometric 3D Room">Isometric Architecture</option>
                        <option value="Matte Painting">Concept Illustration</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-zinc-400">Aspect Ratio</label>
                      <select
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 text-xs rounded p-2 text-zinc-200 focus:outline-none cursor-pointer"
                      >
                        <option value="16:9">16:9 Landscape</option>
                        <option value="1:1">1:1 Square</option>
                        <option value="9:16">9:16 Vertical</option>
                        <option value="4:3">4:3 Grid</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400">Lighting</label>
                    <input
                      type="text"
                      value={lighting}
                      onChange={(e) => setLighting(e.target.value)}
                      placeholder="e.g. Soft studio key light"
                      className="w-full bg-zinc-900 border border-zinc-800 text-xs rounded p-2 text-zinc-200 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-400">Tone &amp; Persona</label>
                <input
                  type="text"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  placeholder="e.g. Direct, technical, concise"
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-md p-2 text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-400">Guardrails &amp; Constraints</label>
                <input
                  type="text"
                  value={additionalRules}
                  onChange={(e) => setAdditionalRules(e.target.value)}
                  placeholder="e.g. Strict JSON output, cite sources"
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-md p-2 text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              {craftError && (
                <div className="p-3 rounded-md border border-rose-500/40 bg-rose-950/20 flex items-start gap-2 text-xs text-rose-200">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="font-mono text-[11px] leading-relaxed">{craftError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleCraftPrompt}
                disabled={crafting}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {crafting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Crafting via {cred.provider.toUpperCase()}...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Craft Master Prompt</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Output Canvas */}
            <div className="lg:col-span-7 space-y-4">
              {craftedResult ? (
                <div className="space-y-4">
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-zinc-800 pb-4">
                      <div>
                        <span className="text-[11px] font-mono text-blue-400 font-medium">
                          {craftedResult.architecture}
                        </span>
                        <h3 className="text-base font-semibold text-white mt-0.5">
                          {craftedResult.promptTitle}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSavePrompt}
                          className={`text-xs px-3 py-1.5 rounded-md border transition-colors flex items-center gap-1.5 cursor-pointer ${
                            isSaved
                              ? "bg-zinc-800 border-blue-500 text-blue-300"
                              : "bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300"
                          }`}
                        >
                          {isSaved ? <BookmarkCheck className="w-3.5 h-3.5 text-blue-400" /> : <Bookmark className="w-3.5 h-3.5" />}
                          <span>{isSaved ? "Saved" : "Save"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleDownload}
                          className="text-xs bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>.MD</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopy(getRenderedPrompt())}
                          className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium px-3.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[11px] text-zinc-500 font-mono">
                        <span>Prompt Output</span>
                        <span className="tabular-nums">
                          {getRenderedPrompt().split(/\s+/).filter(Boolean).length} words
                        </span>
                      </div>
                      <pre className="p-4 bg-zinc-950 rounded-md border border-zinc-800 text-xs text-zinc-200 font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                        {getRenderedPrompt()}
                      </pre>
                    </div>

                    {craftedResult.variables && craftedResult.variables.length > 0 && (
                      <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-md space-y-3">
                        <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
                          <Sliders className="w-3.5 h-3.5 text-blue-400" />
                          <span>Prompt Variables</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {craftedResult.variables.map((variable, idx) => (
                            <div key={idx} className="space-y-1">
                              <label className="text-[11px] font-mono text-zinc-400 block truncate">
                                {`{{${variable.name}}}`}
                              </label>
                              <input
                                type="text"
                                value={variableValues[variable.name] || ""}
                                onChange={(e) =>
                                  setVariableValues({
                                    ...variableValues,
                                    [variable.name]: e.target.value,
                                  })
                                }
                                placeholder={variable.defaultValue || variable.description}
                                className="w-full bg-zinc-900 border border-zinc-800 text-xs rounded p-2 text-zinc-200 focus:outline-none focus:border-blue-500 font-mono"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-3 bg-zinc-950/60 rounded-md border border-zinc-800 space-y-2">
                        <span className="text-[11px] font-semibold text-emerald-400 block">
                          Design Rationale
                        </span>
                        <ul className="space-y-1 text-xs text-zinc-400">
                          {craftedResult.whyItWorks?.map((item, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-zinc-950/60 rounded-md border border-zinc-800 space-y-2">
                        <span className="text-[11px] font-semibold text-zinc-300 block">
                          Usage Notes
                        </span>
                        <ul className="space-y-1 text-xs text-zinc-400">
                          {craftedResult.proTips?.map((tip, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="font-mono text-zinc-500 shrink-0">&mdash;</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {execError && (
                      <div className="p-3 rounded-md border border-rose-500/40 bg-rose-950/20 flex items-start gap-2 text-xs text-rose-200">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <span className="font-mono text-[11px]">{execError}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="text-xs text-zinc-400">
                        Benchmark directly against <strong className="text-white capitalize">{cred.provider}</strong> ({cred.model})
                      </div>

                      <button
                        type="button"
                        onClick={handleTestRunPrompt}
                        disabled={executing}
                        className="text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-md transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        {executing ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Executing...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Test Prompt Live</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {executionOutput && (
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-5 space-y-3">
                      <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-semibold text-white font-mono">
                            Model Output
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500 tabular-nums">
                          {executionTimeMs !== null && <span>{executionTimeMs} ms</span>}
                          <span className="capitalize text-emerald-400">{cred.provider}</span>
                        </div>
                      </div>

                      <pre className="p-3 bg-zinc-900 rounded-md text-xs text-zinc-200 font-mono whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                        {executionOutput}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-12 text-center flex flex-col items-center justify-center min-h-[420px] space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-blue-400">
                    <Wand2 className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <h4 className="font-semibold text-sm text-white">Prompt Output Canvas</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Choose a template category and click <strong className="text-zinc-200">Craft Master Prompt</strong> to compile structured instructions and interactive variables.
                    </p>
                  </div>
                  <div className="text-[11px] font-mono text-zinc-500 pt-1">
                    {cred.provider} / {cred.model}
                  </div>
                </div>
              )}
            </div>
          </div>

          {savedPrompts.length > 0 && (
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-5 space-y-3">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-blue-400" />
                  <h3 className="font-semibold text-xs text-zinc-300 tabular-nums">
                    Saved Prompts ({savedPrompts.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSavedPrompts([]);
                    localStorage.removeItem("template_studio_saved_prompts");
                    triggerToast("Cleared saved prompt library", "info");
                  }}
                  className="text-xs text-zinc-500 hover:text-rose-400 font-mono transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {savedPrompts.map((prompt, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCraftedResult(prompt)}
                    className="p-3 bg-zinc-950 border border-zinc-800 hover:border-blue-500/60 rounded-md transition-colors cursor-pointer space-y-1"
                  >
                    <span className="text-[10px] font-mono text-blue-400 uppercase font-medium">
                      {prompt.category}
                    </span>
                    <h5 className="font-semibold text-xs text-white truncate">{prompt.promptTitle}</h5>
                    <p className="text-[11px] text-zinc-500 line-clamp-2 font-mono">
                      {prompt.masterPrompt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
