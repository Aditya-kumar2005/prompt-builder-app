import React, { useState } from "react";
import { 
  Wand2, 
  Sparkles, 
  Copy, 
  Check, 
  Play, 
  RotateCcw, 
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
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Cpu,
  Image as ImageIcon
} from "lucide-react";
import { AISettings, PromptCategory, CraftedPrompt } from "../types/ai";
import { ImagePromptGeneratorApp } from "./ImagePromptGeneratorApp";

interface PromptBuilderTabProps {
  settings: AISettings;
  triggerToast: (message: string, type?: "success" | "error" | "info") => void;
}

const CATEGORY_ITEMS: { id: PromptCategory; label: string; icon: React.ElementType; description: string }[] = [
  { id: "prompt_doctor", label: "Prompt Doctor", icon: Sparkles, description: "Turns rough ideas or weak prompts into master-level instructions" },
  { id: "canva_image", label: "Visual & Canva", icon: Palette, description: "Visual prompts for Canva Magic Media, Midjourney & DALL-E" },
  { id: "system_role", label: "System & Persona", icon: Layers, description: "Claude & GPT system prompts with XML tags and strict guardrails" },
  { id: "coding", label: "Code & Architecture", icon: Code, description: "Technical prompts for strict TypeScript, clean code, and bug hunting" },
  { id: "reasoning_cot", label: "Chain-of-Thought", icon: BrainCircuit, description: "Multi-step reasoning with thinking scratchpads & self-critique" },
  { id: "copywriting", label: "Marketing & Copy", icon: Megaphone, description: "High-conversion frameworks (AIDA, PAS) and audience targeting" },
];

const PRESET_RECIPES = [
  {
    category: "prompt_doctor" as PromptCategory,
    name: "Doctor: Clarify Weak Vague Request",
    rawGoal: "Make me an app that tracks habits and gives scores.",
    targetAI: "universal",
    framework: "Role-Task-Constraint",
    tone: "Analytical and structured",
  },
  {
    category: "canva_image" as PromptCategory,
    name: "Canva: Dark Mode SaaS Hero 3D",
    rawGoal: "Futuristic digital cryptocurrency vault with floating holographic tokens and glowing charts.",
    targetAI: "canva",
    artStyle: "Glassmorphism 3D render",
    lighting: "Cyberpunk Neon & Volumetric Glow",
    aspectRatio: "16:9",
  },
  {
    category: "system_role" as PromptCategory,
    name: "Claude: Senior Systems Architect",
    rawGoal: "An AI advisor that audits cloud infrastructure architecture diagrams and identifies security vulnerabilities.",
    targetAI: "claude",
    framework: "XML-Structured",
    tone: "Authoritative, strict, zero-fluff",
  },
  {
    category: "coding" as PromptCategory,
    name: "Code: Full-Stack React & Node Auditor",
    rawGoal: "Review full-stack TypeScript code for memory leaks, async race conditions, and Tailwind v4 compliance.",
    targetAI: "openai",
    framework: "Step-by-Step",
    tone: "Senior Staff Engineer",
  },
  {
    category: "copywriting" as PromptCategory,
    name: "Marketing: B2B Landing Page Hero (AIDA)",
    rawGoal: "Landing page hero copy for an AI-powered automated bookkeeping software for freelance designers.",
    targetAI: "gemini",
    framework: "AIDA",
    tone: "Inspiring, persuasive, empathetic",
  },
];

export const PromptBuilderTab: React.FC<PromptBuilderTabProps> = ({
  settings,
  triggerToast,
}) => {
  const [studioMode, setStudioMode] = useState<"universal" | "image_generator">("universal");
  const [activeCategory, setActiveCategory] = useState<PromptCategory>("prompt_doctor");

  // Form Fields
  const [rawGoal, setRawGoal] = useState("A comprehensive prompt to build a production-grade full-stack dashboard with real-time analytics.");
  const [targetAI, setTargetAI] = useState<string>("universal");
  const [framework, setFramework] = useState<string>("XML-Structured");
  const [tone, setTone] = useState<string>("Professional, authoritative, and direct");
  
  // Visual specific
  const [artStyle, setArtStyle] = useState<string>("Glassmorphism 3D");
  const [lighting, setLighting] = useState<string>("Cinematic Neon Rim Light");
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  
  // Custom rules
  const [additionalRules, setAdditionalRules] = useState<string>("Avoid generic fluff. Provide explicit step-by-step guidance and structured schemas.");

  // Generation status & result
  const [crafting, setCrafting] = useState(false);
  const [craftedResult, setCraftedResult] = useState<CraftedPrompt | null>(null);
  
  // Dynamic variables inspector
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  
  // Live execution playground
  const [executing, setExecuting] = useState(false);
  const [executionOutput, setExecutionOutput] = useState<string | null>(null);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);

  // Saved prompts
  const [savedPrompts, setSavedPrompts] = useState<CraftedPrompt[]>(() => {
    try {
      const stored = localStorage.getItem("template_studio_saved_prompts");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [copied, setCopied] = useState(false);

  // Load a preset recipe
  const handleLoadRecipe = (recipe: typeof PRESET_RECIPES[0]) => {
    setActiveCategory(recipe.category);
    setRawGoal(recipe.rawGoal);
    setTargetAI(recipe.targetAI);
    if (recipe.framework) setFramework(recipe.framework);
    if (recipe.tone) setTone(recipe.tone);
    if (recipe.artStyle) setArtStyle(recipe.artStyle);
    if (recipe.lighting) setLighting(recipe.lighting);
    if (recipe.aspectRatio) setAspectRatio(recipe.aspectRatio);
    triggerToast(`Loaded recipe: ${recipe.name}`, "info");
  };

  // Generate crafted prompt
  const handleCraftPrompt = async () => {
    if (!rawGoal.trim()) {
      triggerToast("Please input your core goal or rough prompt draft.", "error");
      return;
    }

    setCrafting(true);
    setExecutionOutput(null);

    let activeKey = "";
    let activeModel = "";

    if (settings.activeProvider === "gemini") {
      activeKey = settings.geminiKey;
      activeModel = settings.geminiModel;
    } else if (settings.activeProvider === "claude") {
      activeKey = settings.claudeKey;
      activeModel = settings.claudeModel;
    } else if (settings.activeProvider === "openai") {
      activeKey = settings.openaiKey;
      activeModel = settings.openaiModel;
    }

    try {
      const resp = await fetch("/api/prompt-craft", {
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
          provider: settings.activeProvider,
          apiKey: activeKey,
          model: activeModel,
          temperature: settings.temperature,
        }),
      });

      const data = await resp.json();

      if (!resp.ok || !data.success) {
        throw new Error(data.error || "Failed to craft prompt.");
      }

      setCraftedResult(data.crafted);

      // Initialize variable values with default values
      const initialVars: Record<string, string> = {};
      data.crafted.variables?.forEach((v: any) => {
        initialVars[v.name] = v.defaultValue || "";
      });
      setVariableValues(initialVars);

      triggerToast("✨ Master Prompt crafted successfully!", "success");
    } catch (err: any) {
      console.error(err);
      triggerToast(err.message || "Failed to craft prompt.", "error");
    } finally {
      setCrafting(false);
    }
  };

  // Get final rendered prompt text with filled variables
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
    triggerToast("Copied prompt to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  // Run test against active AI
  const handleTestRunPrompt = async () => {
    const rendered = getRenderedPrompt();
    if (!rendered) return;

    setExecuting(true);
    setExecutionOutput(null);
    const startTime = Date.now();

    let activeKey = "";
    let activeModel = "";

    if (settings.activeProvider === "gemini") {
      activeKey = settings.geminiKey;
      activeModel = settings.geminiModel;
    } else if (settings.activeProvider === "claude") {
      activeKey = settings.claudeKey;
      activeModel = settings.claudeModel;
    } else if (settings.activeProvider === "openai") {
      activeKey = settings.openaiKey;
      activeModel = settings.openaiModel;
    }

    try {
      const resp = await fetch("/api/prompt-execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: rendered,
          provider: settings.activeProvider,
          apiKey: activeKey,
          model: activeModel,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
        }),
      });

      const data = await resp.json();
      setExecutionTimeMs(Date.now() - startTime);

      if (!resp.ok || !data.success) {
        throw new Error(data.error || "Model execution failed.");
      }

      setExecutionOutput(data.output);
      triggerToast("Prompt executed successfully!", "success");
    } catch (err: any) {
      console.error(err);
      triggerToast(err.message || "Execution failed.", "error");
    } finally {
      setExecuting(false);
    }
  };

  // Save prompt to local bookmarks
  const handleSavePrompt = () => {
    if (!craftedResult) return;
    const updated = [craftedResult, ...savedPrompts.filter(p => p.promptTitle !== craftedResult.promptTitle)];
    setSavedPrompts(updated);
    localStorage.setItem("template_studio_saved_prompts", JSON.stringify(updated));
    triggerToast("Saved to your Prompt Library!", "success");
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
    triggerToast("Downloaded markdown file!", "success");
  };

  const isSaved = craftedResult && savedPrompts.some(p => p.promptTitle === craftedResult.promptTitle);

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      
      {/* Top Banner & Header */}
      <div className="border-b border-slate-900 pb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Wand2 className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white">Universal Prompt Engineering Studio</h2>
            <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-mono uppercase">
              Any Architecture
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Engineer, optimize, parameterize, and test world-class prompts for Canva, Claude, Gemini, OpenAI, Midjourney, and autonomous AI agents.
          </p>
        </div>

        {/* Active Provider Indicator badge */}
        <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-850 px-3 py-1.5 rounded-lg text-xs font-mono">
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-slate-400">Active Engine:</span>
          <span className="font-bold text-white capitalize">{settings.activeProvider}</span>
        </div>
      </div>

      {/* Studio Sub-Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 p-1.5 rounded-2xl border border-slate-850 shadow-md">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStudioMode("universal")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              studioMode === "universal"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Universal Prompt Studio</span>
          </button>

          <button
            type="button"
            onClick={() => setStudioMode("image_generator")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              studioMode === "image_generator"
                ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-purple-400" />
            <span>Image Prompt Generator App</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Visual AI
            </span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 font-mono hidden sm:block px-2">
          {studioMode === "universal" ? "Doctor • System Roles • Chain-of-Thought" : "Midjourney • DALL-E 3 • Flux.1 • Canva"}
        </div>
      </div>

      {/* Conditional Studio View */}
      {studioMode === "image_generator" ? (
        <ImagePromptGeneratorApp settings={settings} triggerToast={triggerToast} />
      ) : (
        <>
          {/* Quick Recipes Showcase */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Curated Prompt Recipes</span>
            </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_RECIPES.map((recipe, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleLoadRecipe(recipe)}
              className="text-xs bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800/80 hover:border-purple-500/40 px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>{recipe.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Primary Builder Architecture Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {CATEGORY_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeCategory === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveCategory(item.id)}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                isActive
                  ? "bg-purple-950/20 border-purple-500 text-white shadow-lg shadow-purple-900/20 ring-1 ring-purple-500/30"
                  : "bg-slate-900/40 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-4 h-4 ${isActive ? "text-purple-400" : "text-slate-500"}`} />
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>}
              </div>
              <div>
                <span className="text-xs font-bold block">{item.label}</span>
                <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{item.description}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Studio Workstation Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Specification Form (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-slate-900/40 border border-slate-900 rounded-xl p-5 space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                Specification Matrix
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              Category: {activeCategory.replace("_", " ").toUpperCase()}
            </span>
          </div>

          {/* Raw Goal / Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Core Intent / Rough Draft
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Accepts messy text</span>
            </div>
            <textarea
              value={rawGoal}
              onChange={(e) => setRawGoal(e.target.value)}
              placeholder="Describe what you want the AI to do, or paste a rough prompt you want to optimize and elevate..."
              className="w-full h-28 bg-slate-950 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 resize-none font-sans leading-relaxed"
            />
          </div>

          {/* Target Engine & Architecture */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Target Engine
              </label>
              <select
                value={targetAI}
                onChange={(e) => setTargetAI(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="universal">Universal (All Models)</option>
                <option value="claude">Anthropic Claude</option>
                <option value="gemini">Google Gemini</option>
                <option value="openai">OpenAI GPT-4o</option>
                <option value="canva">Canva Magic Media</option>
                <option value="midjourney">Midjourney v6</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Framework
              </label>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
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

          {/* Visual parameters if Canva / Visual Category */}
          {activeCategory === "canva_image" && (
            <div className="p-3 bg-purple-950/10 border border-purple-500/20 rounded-lg space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block">
                Visual Composition Controls
              </span>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase">Art Style</label>
                  <select
                    value={artStyle}
                    onChange={(e) => setArtStyle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 text-xs rounded p-2 text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="Glassmorphism 3D">Glassmorphism 3D</option>
                    <option value="Photorealistic 8K">Photorealistic 8K</option>
                    <option value="Minimal Flat Vector">Minimal Flat Vector</option>
                    <option value="Cyberpunk Neon">Cyberpunk Neon</option>
                    <option value="Isometric 3D Room">Isometric 3D Room</option>
                    <option value="Matte Painting">Matte Painting</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase">Aspect Ratio</label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 text-xs rounded p-2 text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="16:9">16:9 (Landscape / Banner)</option>
                    <option value="1:1">1:1 (Square / Card)</option>
                    <option value="9:16">9:16 (Story / Mobile)</option>
                    <option value="4:3">4:3 (Classic Grid)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase">Lighting</label>
                <input
                  type="text"
                  value={lighting}
                  onChange={(e) => setLighting(e.target.value)}
                  placeholder="e.g. Volumetric neon rim light, softbox reflections"
                  className="w-full bg-slate-950 border border-slate-850 text-xs rounded p-2 text-slate-200 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Tone of Voice */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tone & Persona
            </label>
            <input
              type="text"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              placeholder="e.g. Authoritative, direct, zero apologies, highly technical"
              className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Additional constraints */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Hard Guardrails & Strict Rules
            </label>
            <input
              type="text"
              value={additionalRules}
              onChange={(e) => setAdditionalRules(e.target.value)}
              placeholder="e.g. Must include error codes, never use markdown headers in code"
              className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Action Trigger Button */}
          <button
            type="button"
            onClick={handleCraftPrompt}
            disabled={crafting}
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 cursor-pointer"
          >
            {crafting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Crafting Master Prompt via {settings.activeProvider.toUpperCase()}...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 text-purple-200" />
                <span>Craft Master Prompt</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output & Interactive Testing Canvas (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          
          {craftedResult ? (
            <div className="space-y-4">
              
              {/* Output Header Card */}
              <div className="bg-slate-900/50 border border-slate-850 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-900 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">
                      {craftedResult.architecture}
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      {craftedResult.promptTitle}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSavePrompt}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 cursor-pointer ${
                        isSaved
                          ? "bg-purple-950/40 border-purple-500/40 text-purple-300"
                          : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300"
                      }`}
                    >
                      {isSaved ? <BookmarkCheck className="w-3.5 h-3.5 text-purple-400" /> : <Bookmark className="w-3.5 h-3.5" />}
                      <span>{isSaved ? "Saved" : "Bookmark"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownload}
                      className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Markdown</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopy(getRenderedPrompt())}
                      className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                {/* Master Prompt Rendered Block */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                    <span>Master Prompt Body</span>
                    <span>~{getRenderedPrompt().split(/\s+/).length} words</span>
                  </div>
                  <pre className="p-4 bg-slate-950 rounded-lg border border-slate-900 text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto selection:bg-purple-500/40">
                    {getRenderedPrompt()}
                  </pre>
                </div>

                {/* Dynamic Variables Form (if any) */}
                {craftedResult.variables && craftedResult.variables.length > 0 && (
                  <div className="p-4 bg-slate-950/80 border border-slate-900 rounded-lg space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
                      <Sliders className="w-3.5 h-3.5 text-purple-400" />
                      <span>Interactive Variables (Fill in to test)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {craftedResult.variables.map((variable, idx) => (
                        <div key={idx} className="space-y-1">
                          <label className="text-[10px] font-mono font-semibold text-slate-400 block truncate">
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
                            className="w-full bg-slate-900 border border-slate-800 text-xs rounded p-2 text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Why It Works & Pro Tips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-900 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                      Why This Prompt Works
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-400">
                      {craftedResult.whyItWorks?.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-900 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                      Prompt Engineering Pro Tips
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-400">
                      {craftedResult.proTips?.map((tip, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Sparkles className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Test Run Live Trigger */}
                <div className="pt-2 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="text-xs text-slate-400">
                    Run this prompt directly with <strong className="text-white capitalize">{settings.activeProvider}</strong> to verify responses live.
                  </div>

                  <button
                    type="button"
                    onClick={handleTestRunPrompt}
                    disabled={executing}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-900/20"
                  >
                    {executing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Streaming Execution...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Test Run Prompt Live</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Live Execution Output Terminal */}
              {executionOutput && (
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 space-y-3 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white font-mono">
                        Live Model Response Terminal
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                      {executionTimeMs && <span>Latency: {executionTimeMs}ms</span>}
                      <span className="capitalize text-emerald-400 font-bold">{settings.activeProvider}</span>
                    </div>
                  </div>

                  <pre className="p-3 bg-slate-900/60 rounded-lg text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                    {executionOutput}
                  </pre>
                </div>
              )}

            </div>
          ) : (
            /* Empty State Placeholder */
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[420px] space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Wand2 className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h4 className="font-bold text-sm text-white">Prompt Canvas Standby</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Select a category or prompt recipe on the left, then click <strong className="text-purple-400">Craft Master Prompt</strong> to generate structured prompt blueprints.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <span className="text-[10px] bg-slate-900 text-slate-400 px-3 py-1 rounded-full border border-slate-850 font-mono">
                  Engine Ready: {settings.activeProvider.toUpperCase()}
                </span>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Bookmarked / Saved Prompts Drawer (if any) */}
      {savedPrompts.length > 0 && (
        <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-900 pb-3">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                Saved Prompt Library ({savedPrompts.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setSavedPrompts([]);
                localStorage.removeItem("template_studio_saved_prompts");
                triggerToast("Cleared saved prompt library", "info");
              }}
              className="text-[10px] text-slate-500 hover:text-rose-400 font-mono transition cursor-pointer"
            >
              Clear Library
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {savedPrompts.map((prompt, idx) => (
              <div
                key={idx}
                onClick={() => setCraftedResult(prompt)}
                className="p-3 bg-slate-950/60 border border-slate-900 hover:border-purple-500/40 rounded-lg transition cursor-pointer space-y-1"
              >
                <span className="text-[9px] font-mono text-purple-400 uppercase font-semibold">
                  {prompt.category}
                </span>
                <h5 className="font-bold text-xs text-white truncate">{prompt.promptTitle}</h5>
                <p className="text-[10px] text-slate-500 line-clamp-2 font-mono">
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

