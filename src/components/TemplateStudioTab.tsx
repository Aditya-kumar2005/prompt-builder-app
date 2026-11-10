import React, { useState } from "react";
import { 
  Sparkle, 
  Monitor, 
  Layers, 
  Wand2, 
  Copy, 
  Check, 
  RotateCcw, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Activity, 
  KeyRound, 
  Send, 
  ArrowLeft, 
  Wallet, 
  ShoppingBag,
  Sliders,
  ChevronRight,
  Info,
  ChevronDown,
  Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AISettings } from "../types/ai";

export type TemplateType = "landing" | "dashboard" | "login" | "register" | "reset" | "portfolio";

export interface Feature {
  title: string;
  desc: string;
}

export interface Transaction {
  name: string;
  status: "Paid" | "Pending";
  amount: string;
}

export interface CopyData {
  heroTitle?: string;
  heroSubtitle?: string;
  badge?: string;
  features?: Feature[];
  metric1?: string;
  metric2?: string;
  metric3?: string;
  subHeading?: string;
  transactions?: Transaction[];
  title?: string;
  subtitle?: string;
  cta?: string;
  item1_badge?: string;
  item1_title?: string;
  item1_desc?: string;
  item2_badge?: string;
  item2_title?: string;
  item2_desc?: string;
}

export const DEFAULT_TEMPLATES_DATA: Record<TemplateType, CopyData> = {
  landing: {
    badge: "🚀 RELEASE VERSION v2.4",
    heroTitle: "Build your visual systems without manual friction.",
    heroSubtitle: "Our high-performance engine allows product teams to map user metrics, optimize asset coordinates, and synchronize beautiful assets instantly.",
    features: [
      { title: "Dynamic Integration", desc: "Seamless pipeline setup designed to automate routine configurations without local overhead." },
      { title: "Grid System Layouts", desc: "Enjoy spacious, mobile-first layouts designed to scale beautifully from cellular preview structures to big screens." },
      { title: "Secured Credentials", desc: "Proxy high-level credentials safely through Node environments, shielding vital keys." }
    ]
  },
  dashboard: {
    metric1: "$148,259.80",
    metric2: "12,492 Users",
    metric3: "3.14% CTR",
    subHeading: "Recent Business Transactions",
    transactions: [
      { name: "Acme Enterprise", status: "Paid", amount: "$1,200.00" },
      { name: "Jane Doe Portfolio", status: "Pending", amount: "$350.00" },
      { name: "Velo Headless LLC", status: "Paid", amount: "$890.00" }
    ]
  },
  login: {
    title: "Welcome Back",
    subtitle: "Input your credential key elements to enter your creative dashboard.",
    cta: "Sign In Securely"
  },
  register: {
    title: "Configure Workspace",
    subtitle: "Establish a high-fidelity environment configured for instant prompt optimization.",
    cta: "Initialize Dashboard"
  },
  reset: {
    title: "Password Recovery",
    subtitle: "Specify your email of record to trigger a verification route key directly.",
    cta: "Send Reset Verification"
  },
  portfolio: {
    title: "Blueprint Exhibition",
    subtitle: "An editorial grid displaying modular prototypes and creative design blueprints optimized with fluid metrics.",
    item1_badge: "FINTECH CORE",
    item1_title: "AeroWallet Crypto Application",
    item1_desc: "A beautiful desktop-first financial sandbox capturing live telemetry trends.",
    item2_badge: "E-COMMERCE FLOW",
    item2_title: "Velo Premium Storefront",
    item2_desc: "Headless responsive experience containing custom color matrices and layouts."
  }
};

export const INITIAL_CANVA_PROMPTS: Record<TemplateType, string> = {
  landing: "Modern B2B SaaS landing page template, dark theme with vibrant neon purple and cyan accents. Hero section with a bold minimalist headline, placeholder for a high-tech 3D glassmorphism abstract illustration, glowing CTA buttons, trust badges row, feature grid with clean card layouts, responsive navigation header, 8k resolution, UI/UX presentation style.",
  dashboard: "SaaS analytics dashboard app template, dark interface grid system. Left sidebar navigation with modern icons, main content area displaying a balance metrics graph, recent activity table, custom financial charts, geometric glass cards, neon green accent indicators, clean typography, high fidelity dashboard UI mockup.",
  login: "Clean digital login screen app template, split screen layout. Left side showcasing a dark abstract wave background, right side a pristine slate card layout. Features sleek input fields for email and password, 'Remember me' checkbox, micro-interactions, minimalist aesthetic, professional corporate login page design UI.",
  register: "Modern user registration signup application form, centered card glassmorphic style. Input blocks with small labels for full name, business email, custom password setup. Includes explicit validation indicator icons, signup confirmation action button, ultra-clean typography, subtle slate purple gradients backdrop.",
  reset: "Minimalist password recovery reset screen template app interface. Center card orientation with illustrative key/lock secure asset, single primary input line element for account email lookup, prominent primary action verification button, clean text directions, dark soothing UI aesthetic.",
  portfolio: "Creative portfolio gallery app page template layout grid, visual arts presentation showcase card style. Dark minimal layout structure featuring rich media masonry blocks preview layouts, clean metadata labels underneath, creative filters selector header menu, sleek professional portfolio design profile ui template."
};

export const COLOR_MOTIFS = [
  { id: "cosmic", name: "Cosmic Slate & Purple", primary: "bg-purple-600 hover:bg-purple-700 text-purple-400 border-purple-500/20 text-purple-300", accent: "text-purple-400", bgAccent: "bg-purple-500/10", glow: "shadow-purple-500/20" },
  { id: "sunset", name: "Sunset Crimson & Amber", primary: "bg-rose-600 hover:bg-rose-700 text-rose-400 border-rose-500/20 text-rose-300", accent: "text-rose-400", bgAccent: "bg-rose-500/10", glow: "shadow-rose-500/20" },
  { id: "emerald", name: "Ethereal Mint & Teal", primary: "bg-emerald-600 hover:bg-emerald-700 text-emerald-400 border-emerald-500/20 text-emerald-300", accent: "text-emerald-400", bgAccent: "bg-emerald-500/10", glow: "shadow-emerald-500/20" },
  { id: "cyan", name: "Oceanic Cyan & Indigo", primary: "bg-cyan-600 hover:bg-cyan-700 text-cyan-400 border-cyan-500/20 text-cyan-300", accent: "text-cyan-400", bgAccent: "bg-cyan-500/10", glow: "shadow-cyan-500/20" },
  { id: "mono", name: "Monochrome Platinum", primary: "bg-slate-300 hover:bg-slate-400 text-white border-slate-500/20 text-slate-300", accent: "text-slate-200", bgAccent: "bg-slate-200/10", glow: "shadow-slate-200/20" }
];

export const BRAND_VOICES = [
  { id: "bold", name: "Bold & Inspired" },
  { id: "minimal", name: "Minimalist & Absolute" },
  { id: "serious", name: "Serious & Corporate" },
  { id: "cyber", name: "Cyberpunk & High-tech" },
  { id: "playful", name: "Friendly & Creative" }
];

interface TemplateStudioTabProps {
  settings: AISettings;
  triggerToast: (message: string, type?: "success" | "error" | "info") => void;
  onNavigateToSettings: () => void;
}

export const TemplateStudioTab: React.FC<TemplateStudioTabProps> = ({
  settings,
  triggerToast,
  onNavigateToSettings,
}) => {
  const [activeTab, setActiveTab] = useState<TemplateType>("landing");
  const [promptInput, setPromptInput] = useState("A secure digital vault application designed to track and guard cryptography assets with real-time status monitors.");
  const [selectedColor, setSelectedColor] = useState(COLOR_MOTIFS[0]);
  const [selectedVoice, setSelectedVoice] = useState(BRAND_VOICES[0]);

  const [customTemplates, setCustomTemplates] = useState<Record<TemplateType, CopyData>>({ ...DEFAULT_TEMPLATES_DATA });
  const [canvaPrompts, setCanvaPrompts] = useState<Record<TemplateType, string>>({ ...INITIAL_CANVA_PROMPTS });

  const [loading, setLoading] = useState<"prompt" | "copy" | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(identifier);
    triggerToast("Copied to your clipboard!", "success");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleResetToDefault = () => {
    setCustomTemplates({ ...DEFAULT_TEMPLATES_DATA });
    setCanvaPrompts({ ...INITIAL_CANVA_PROMPTS });
    triggerToast("Templates reset to defaults.", "info");
  };

  const handleLoadThemePreset = (preset: string) => {
    setPromptInput(preset);
    triggerToast("Theme concept loaded.", "info");
  };

  const handleAIGenerate = async (action: "prompt" | "copy") => {
    if (!promptInput.trim()) {
      triggerToast("Please input custom theme context first.", "error");
      return;
    }
    
    setLoading(action);

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
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptInput,
          templateType: activeTab,
          colorMotif: selectedColor.name,
          brandVoice: selectedVoice.name,
          action: action,
          provider: settings.activeProvider,
          apiKey: activeKey,
          model: activeModel,
          temperature: settings.temperature,
        })
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || "An integration error took place while calling the server.");
      }

      if (action === "prompt" && result.text) {
        setCanvaPrompts(prev => ({
          ...prev,
          [activeTab]: result.text
        }));
        triggerToast(`✨ Canva prompt generated using ${settings.activeProvider.toUpperCase()}!`, "success");
      } else if (action === "copy" && result.data) {
        setCustomTemplates(prev => ({
          ...prev,
          [activeTab]: {
            ...prev[activeTab],
            ...result.data
          }
        }));
        triggerToast(`🚀 Template copy mapped live via ${settings.activeProvider.toUpperCase()}!`, "success");
      }

    } catch (err: any) {
      console.error(err);
      triggerToast(err.message || "Could not execute generation.", "error");
    } finally {
      setLoading(null);
    }
  };

  const activeCopy = customTemplates[activeTab];
  const activePrompt = canvaPrompts[activeTab];

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
      
      {/* Left Drawer Control Panel */}
      <aside className="w-full lg:w-[420px] bg-slate-950/40 p-5 md:p-6 border-b lg:border-b-0 lg:border-r border-slate-900 flex flex-col gap-6 overflow-y-auto shrink-0 select-none">
        
        {/* Active Engine Summary Pill */}
        <div className="bg-slate-900/60 border border-slate-850 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <div>
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Active AI Engine</span>
              <span className="text-xs font-bold text-white capitalize">{settings.activeProvider}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateToSettings}
            className="text-[10px] text-purple-400 hover:text-purple-300 font-mono transition underline"
          >
            Configure
          </button>
        </div>

        {/* Section 1: Dynamic Option Settings */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-purple-500" />
              Tuning Parameters
            </h2>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Selector: Custom template type buttons array */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 font-semibold block uppercase">Layout Blueprint</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-1.5">
              {(Object.keys(DEFAULT_TEMPLATES_DATA) as TemplateType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveTab(type)}
                  className={`px-3 py-2 text-left rounded-lg text-xs font-medium border transition cursor-pointer ${
                    activeTab === type 
                      ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/10" 
                      : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800"
                  }`}
                >
                  <span className="capitalize">{type === 'landing' ? 'Landing Grid' : type === 'portfolio' ? 'Portfolio Grid' : type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Selector: Prompt Input text entry zone */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] text-slate-400 font-semibold uppercase">Brand Theme / Industry Intent</label>
              <span className="text-[10px] font-mono text-purple-400">{settings.activeProvider} Powered</span>
            </div>
            <textarea 
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Ex. A sleek corporate law firm portfolio, minimal aesthetic, high contract layout parameters..."
              className="w-full h-24 bg-slate-950 border border-slate-850 px-3.5 py-2.5 rounded-lg text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition resize-none leading-relaxed"
            />
            
            {/* Concept Presets chips */}
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 font-mono">Quick Brand Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                <button 
                  type="button" 
                  onClick={() => handleLoadThemePreset("Eco-friendly organic matcha tea storefront with earthy warm color balances and modern clean grids.")}
                  className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 hover:text-white px-2 py-0.5 rounded transition cursor-pointer"
                >
                  Organic Tea
                </button>
                <button 
                  type="button" 
                  onClick={() => handleLoadThemePreset("Minimal hyper-efficient legal-tech documentation hub, monochrome slate styling, trustworthy metrics.")}
                  className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 hover:text-white px-2 py-0.5 rounded transition cursor-pointer"
                >
                  LegalTech LLC
                </button>
                <button 
                  type="button" 
                  onClick={() => handleLoadThemePreset("A vibrant retro wave synthesizer shop app, neon pink accents, arcade aesthetic styling.")}
                  className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 hover:text-white px-2 py-0.5 rounded transition cursor-pointer"
                >
                  Retro Synth
                </button>
              </div>
            </div>
          </div>

          {/* Selector: Custom color palette settings */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 font-semibold block uppercase">Aesthetic Palette</label>
            <div className="relative">
              <select 
                value={selectedColor.id}
                onChange={(e) => {
                  const matched = COLOR_MOTIFS.find(c => c.id === e.target.value);
                  if (matched) setSelectedColor(matched);
                }}
                className="w-full bg-slate-900 border border-slate-850 text-xs rounded-lg py-2 pl-3 pr-8 focus:outline-none focus:border-purple-500 transition appearance-none cursor-pointer"
              >
                {COLOR_MOTIFS.map((color) => (
                  <option key={color.id} value={color.id}>{color.name}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Selector: Voice matrices */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 font-semibold block uppercase">Brand Tone of Voice</label>
            <div className="relative">
              <select 
                value={selectedVoice.id}
                onChange={(e) => {
                  const matched = BRAND_VOICES.find(v => v.id === e.target.value);
                  if (matched) setSelectedVoice(matched);
                }}
                className="w-full bg-slate-900 border border-slate-850 text-xs rounded-lg py-2 pl-3 pr-8 focus:outline-none focus:border-purple-500 transition appearance-none cursor-pointer"
              >
                {BRAND_VOICES.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

        </div>

        <hr className="border-slate-900" />

        {/* Section 2: Server-Side AI triggers */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Wand2 className="w-3.5 h-3.5 text-purple-500" />
            AI Template Coprocessor
          </h3>
          
          <p className="text-[11px] leading-relaxed text-slate-400">
            Powered live by <strong className="text-white capitalize">{settings.activeProvider}</strong>. Generate photographic Canva prompts and localized layout copy tailored to your parameters.
          </p>

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => handleAIGenerate("prompt")}
              disabled={loading !== null}
              className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg text-xs font-semibold text-white transition flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10 cursor-pointer"
            >
              {loading === "prompt" ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Generating Canva Prompt...</span>
                </>
              ) : (
                <>
                  <Sparkle className="w-3.5 h-3.5 text-purple-200" />
                  <span>Optimize Canva Prompt</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleAIGenerate("copy")}
              disabled={loading !== null}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-850 disabled:opacity-50 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading === "copy" ? (
                <>
                  <span className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                  <span>Generating Layout Copy...</span>
                </>
              ) : (
                <>
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span>Generate Page Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Prompting Information Help Desk block */}
        <div className="mt-auto bg-slate-900/40 border border-slate-900/80 p-3.5 rounded-lg flex gap-2">
          <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <p className="text-[10px] leading-relaxed text-slate-400">
            Generating <strong className="text-white">Page Copy</strong> instantly adapts the dynamic interactive elements of the active template to match your custom visual theme.
          </p>
        </div>

      </aside>

      {/* Right Active Preview & Canvas Container */}
      <main className="flex-1 p-5 md:p-8 flex flex-col gap-6 overflow-y-auto">
        
        {/* Canva magic prompt output widget */}
        <section className="bg-gradient-to-r from-purple-950/20 to-slate-950 border border-purple-950/40 rounded-xl p-5 shadow-xl relative overflow-hidden flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Wand2 className="w-32 h-32 text-purple-400" />
          </div>
          
          <div className="space-y-1.5 flex-1 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-300 text-[10px] px-2.5 py-1 rounded-md font-bold border border-purple-500/20 uppercase tracking-widest">
              <Wand2 className="w-3 h-3" />
              Canva Magic Text Prompt ({settings.activeProvider.toUpperCase()})
            </div>
            <h3 className="text-xs font-semibold text-white">Selected Template Visual Blueprint Reference:</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-mono italic bg-slate-950/50 p-3 rounded-lg border border-slate-900">
              "{activePrompt}"
            </p>
          </div>

          <button 
            type="button"
            onClick={() => copyToClipboard(activePrompt, "canva-prompt")}
            className="text-xs shrink-0 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3.5 py-2 rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
          >
            {copiedKey === "canva-prompt" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-mono">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Prompt</span>
              </>
            )}
          </button>
        </section>

        {/* Interactive UI Live Component Canvas block */}
        <section className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Monitor className="w-3.5 h-3.5 text-purple-500" />
              Interactive Layout Live Canvas
            </h3>
            <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-850 font-mono">
              Active Theme: {selectedColor.name}
            </span>
          </div>

          {/* Live interactive viewport stage mockup */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-6 min-h-[420px] shadow-inner bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] relative flex flex-col justify-center">
            
            {/* Animation transition container */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="w-full h-full"
              >
                
                {/* Landing page layout blueprint */}
                {activeTab === "landing" && (
                  <div className="space-y-12 py-2 max-w-4xl mx-auto">
                    <nav className="flex justify-between items-center border-b border-slate-900 pb-4">
                      <div className="flex items-center gap-2 font-bold text-sm tracking-widest">
                        <span className={`w-2.5 h-2.5 rounded-full ${selectedColor.id === 'mono' ? 'bg-white' : selectedColor.primary.split(' ')[0]}`}></span>
                        NEXUS.LABS
                      </div>
                      <div className="hidden md:flex gap-6 text-slate-400 font-sans">
                        <span className="text-xs hover:text-white cursor-pointer select-none">Platform</span>
                        <span className="text-xs hover:text-white cursor-pointer select-none">Infrastructure</span>
                        <span className="text-xs hover:text-white cursor-pointer select-none">Blueprints</span>
                      </div>
                      <button className={`px-3.5 py-1.5 rounded-lg text-xs font-bold text-white transition ${selectedColor.primary} shrink-0`}>
                        Get Started
                      </button>
                    </nav>

                    <div className="text-center max-w-2xl mx-auto space-y-6 pt-6">
                      <span className={`inline-flex items-center gap-1.5 ${selectedColor.bgAccent} ${selectedColor.accent} text-[10px] px-3 py-1 rounded-full font-bold border ${selectedColor.primary.split(' ')[2]} tracking-wider uppercase`}>
                        <Sparkle className="w-3 h-3" />
                        {activeCopy.badge}
                      </span>
                      
                      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-white">
                        {activeCopy.heroTitle}
                      </h1>
                      <p className="text-slate-400 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
                        {activeCopy.heroSubtitle}
                      </p>
                      
                      <div className="flex justify-center gap-3 pt-3">
                        <button className={`px-5 py-2.5 rounded-lg text-xs font-bold text-white transition flex items-center gap-1.5 ${selectedColor.primary}`}>
                          Execute Launch <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button className="border border-slate-800 hover:bg-slate-900 px-5 py-2.5 rounded-lg text-xs font-semibold text-slate-300 transition">
                          Explore Assets
                        </button>
                      </div>
                    </div>

                    {/* Dynamic Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-900/60">
                      {activeCopy.features?.map((feature: Feature, idx: number) => (
                        <div key={idx} className="bg-slate-900/40 border border-slate-900/80 p-4.5 rounded-xl hover:border-slate-800 transition space-y-2">
                          <span className={`text-xs ${selectedColor.accent} font-mono block`}>0{idx + 1}.</span>
                          <h4 className="font-bold text-xs text-white uppercase tracking-wider">{feature.title}</h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{feature.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Analytics Dashboard Grid */}
                {activeTab === "dashboard" && (
                  <div className="space-y-6 py-2 max-w-4xl mx-auto">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-4">
                      <div>
                        <h3 className="font-bold text-sm text-white">Analytical Ledger</h3>
                        <p className="text-[10px] text-slate-400">Synchronized pipeline telemetry log records</p>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        ● Online
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-slate-900/50 border border-slate-900/80 p-5 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Primary Revenue</p>
                          <h4 className="text-xl font-bold mt-1 text-white font-mono">{activeCopy.metric1}</h4>
                          <span className="text-[9px] text-emerald-400 flex items-center gap-1 mt-1 font-mono">
                            <TrendingUp className="w-2.5 h-2.5" /> +14.2% Growth
                          </span>
                        </div>
                        <div className={`p-2.5 ${selectedColor.bgAccent} ${selectedColor.accent} rounded-lg`}><DollarSign className="w-4 h-4" /></div>
                      </div>

                      <div className="bg-slate-900/50 border border-slate-900/80 p-5 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Metrics Active</p>
                          <h4 className="text-xl font-bold mt-1 text-white font-mono">{activeCopy.metric2}</h4>
                          <span className="text-[9px] text-purple-400 flex items-center gap-1 mt-1 font-mono">
                            <TrendingUp className="w-2.5 h-2.5" /> +8.1% Weekly
                          </span>
                        </div>
                        <div className={`p-2.5 ${selectedColor.bgAccent} ${selectedColor.accent} rounded-lg`}><Users className="w-4 h-4" /></div>
                      </div>

                      <div className="bg-slate-900/50 border border-slate-900/80 p-5 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Efficiency rate</p>
                          <h4 className="text-xl font-bold mt-1 text-white font-mono">{activeCopy.metric3}</h4>
                          <span className="text-[9px] text-rose-400 flex items-center gap-1 mt-1 font-mono">
                            <TrendingDown className="w-2.5 h-2.5" /> -0.28% Deflection
                          </span>
                        </div>
                        <div className={`p-2.5 ${selectedColor.bgAccent} ${selectedColor.accent} rounded-lg`}><Activity className="w-4 h-4" /></div>
                      </div>
                    </div>

                    <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-5">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-xs text-white uppercase tracking-wider">{activeCopy.subHeading}</h4>
                        <span className="text-[9px] text-slate-500 font-mono">Real-time status stream</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-400">
                          <thead>
                            <tr className="border-b border-slate-900/95 text-slate-400 uppercase tracking-wider font-bold">
                              <th className="pb-2">Account Subscriber</th>
                              <th className="pb-2">Fidelity Status</th>
                              <th className="pb-2 text-right">Settlement value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeCopy.transactions?.map((tx: Transaction, idx: number) => (
                              <tr key={idx} className="border-b border-slate-900/40 last:border-0">
                                <td className="py-2.5 text-white font-medium">{tx.name}</td>
                                <td className="py-2.5">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${tx.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                    {tx.status}
                                  </span>
                                </td>
                                <td className="py-2.5 text-right text-white font-mono font-medium">{tx.amount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Authentication Screen - Login */}
                {activeTab === "login" && (
                  <div className="max-w-md mx-auto bg-slate-900/40 border border-slate-900 rounded-2xl p-7 shadow-2xl relative overflow-hidden my-3">
                    <div className="text-center space-y-2 mb-6">
                      <div className={`w-10 h-10 ${selectedColor.bgAccent} ${selectedColor.accent} rounded-xl flex items-center justify-center mx-auto mb-3 border ${selectedColor.primary.split(' ')[2]}`}>
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-bold text-white">{activeCopy.title}</h2>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">{activeCopy.subtitle}</p>
                    </div>
                    
                    <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Corporate Email Address</label>
                        <input 
                          type="email" 
                          disabled 
                          placeholder="admin@nexuslabs.io" 
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-400 focus:outline-none focus:border-purple-500 transition cursor-not-allowed selection:bg-transparent" 
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Access Password</label>
                          <span className="text-[9px] text-slate-500 hover:underline cursor-pointer select-none">Recover credentials</span>
                        </div>
                        <input 
                          type="password" 
                          disabled 
                          placeholder="••••••••••••" 
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-400 focus:outline-none focus:border-purple-500 transition cursor-not-allowed selection:bg-transparent" 
                        />
                      </div>

                      <div className="flex items-center gap-2 py-1 select-none">
                        <input type="checkbox" id="remember-me" defaultChecked className="accent-purple-600 rounded cursor-pointer" />
                        <label htmlFor="remember-me" className="text-[10px] text-slate-400">Keep me authorized in this node for 30 cycles</label>
                      </div>

                      <button 
                        className={`w-full py-2.5 rounded-lg text-xs font-bold text-white transition ${selectedColor.primary} shadow-lg ${selectedColor.glow}`}
                        type="button"
                      >
                        {activeCopy.cta}
                      </button>
                    </form>
                  </div>
                )}

                {/* Authentication Screen - Register */}
                {activeTab === "register" && (
                  <div className="max-w-md mx-auto bg-slate-900/40 border border-slate-900 rounded-2xl p-7 shadow-2xl relative overflow-hidden my-2">
                    <div className="text-center space-y-2 mb-6">
                      <div className={`w-10 h-10 ${selectedColor.bgAccent} ${selectedColor.accent} rounded-xl flex items-center justify-center mx-auto mb-3 border ${selectedColor.primary.split(' ')[2]}`}>
                        <Sparkle className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-bold text-white">{activeCopy.title}</h2>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">{activeCopy.subtitle}</p>
                    </div>

                    <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Workspace Identity Name</label>
                        <input 
                          type="text" 
                          disabled 
                          placeholder="Nexus General User" 
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-400 focus:outline-none focus:border-purple-500 transition cursor-not-allowed" 
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Corporate Email Address</label>
                        <input 
                          type="email" 
                          disabled 
                          placeholder="user@nexuslabs.co" 
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-400 focus:outline-none focus:border-purple-500 transition cursor-not-allowed" 
                        />
                      </div>

                      <p className="text-[9px] text-slate-500 text-center leading-relaxed">
                        By continuing, you authorize credentials collection aligned to standard system parameters.
                      </p>

                      <button 
                        className={`w-full py-2.5 rounded-lg text-xs font-bold text-white transition ${selectedColor.primary} shadow-lg ${selectedColor.glow}`}
                        type="button"
                      >
                        {activeCopy.cta}
                      </button>
                    </form>
                  </div>
                )}

                {/* Authentication Screen - Forget/Reset password */}
                {activeTab === "reset" && (
                  <div className="max-w-md mx-auto bg-slate-900/40 border border-slate-900 rounded-2xl p-7 shadow-2xl relative overflow-hidden my-8 text-center">
                    <div className={`w-11 h-11 ${selectedColor.bgAccent} ${selectedColor.accent} rounded-xl flex items-center justify-center mx-auto mb-4 border ${selectedColor.primary.split(' ')[2]}`}>
                      <KeyRound className="w-5 h-5" />
                    </div>
                    
                    <h2 className="text-xl font-bold text-white mb-2">{activeCopy.title}</h2>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto mb-6">{activeCopy.subtitle}</p>
                    
                    <form className="space-y-4 text-left" onSubmit={e => e.preventDefault()}>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Registered Account Email</label>
                        <input 
                          type="email" 
                          disabled 
                          placeholder="keyholder@nexuslabs.io" 
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2.5 text-xs text-slate-400 focus:outline-none focus:border-purple-500 transition cursor-not-allowed" 
                        />
                      </div>
                      
                      <button 
                        className={`w-full py-2.5 rounded-lg text-xs font-bold text-white transition flex items-center justify-center gap-2 ${selectedColor.primary} shadow-lg ${selectedColor.glow}`}
                        type="button"
                      >
                        {activeCopy.cta} <Send className="w-3 h-3" />
                      </button>
                    </form>

                    <div className="mt-5 pt-3 border-t border-slate-900">
                      <span className="text-[11px] text-slate-500 hover:text-white cursor-pointer select-none inline-flex items-center gap-1 transition">
                        <ArrowLeft className="w-3 h-3" /> Back to corporate login
                      </span>
                    </div>
                  </div>
                )}

                {/* Portfolio showcases */}
                {activeTab === "portfolio" && (
                  <div className="space-y-8 py-2 max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-4">
                      <div>
                        <h2 className="text-xl font-bold text-white">{activeCopy.title}</h2>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">{activeCopy.subtitle}</p>
                      </div>
                      <div className="flex gap-1.5 bg-slate-900 p-1 rounded-lg text-[10px] font-bold uppercase shrink-0 border border-slate-850">
                        <span className={`px-2.5 py-1 rounded-md text-white font-semibold ${selectedColor.primary.split(' ')[0]}`}>Exhibition</span>
                        <span className="px-2.5 py-1 text-slate-500 select-none">Web3 Blueprints</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group bg-slate-900/40 border border-slate-900 rounded-xl overflow-hidden hover:border-slate-800 transition shadow-lg flex flex-col">
                        <div className={`h-40 ${selectedColor.bgAccent} flex items-center justify-center p-6 relative border-b border-slate-900`}>
                          <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition duration-300"></div>
                          <Wallet className={`w-12 h-12 ${selectedColor.accent}`} />
                        </div>
                        <div className="p-4.5 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <span className={`text-[9px] uppercase font-bold tracking-wider ${selectedColor.accent}`}>{activeCopy.item1_badge}</span>
                            <h4 className="font-bold text-xs text-white uppercase tracking-wider mt-0.5">{activeCopy.item1_title}</h4>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{activeCopy.item1_desc}</p>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 hover:text-white transition cursor-pointer select-none">
                            Explore code block <ChevronRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>

                      <div className="group bg-slate-900/40 border border-slate-900 rounded-xl overflow-hidden hover:border-slate-800 transition shadow-lg flex flex-col">
                        <div className={`h-40 ${selectedColor.bgAccent} flex items-center justify-center p-6 relative border-b border-slate-900`}>
                          <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition duration-300"></div>
                          <ShoppingBag className={`w-12 h-12 ${selectedColor.accent}`} />
                        </div>
                        <div className="p-4.5 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <span className={`text-[9px] uppercase font-bold tracking-wider ${selectedColor.accent}`}>{activeCopy.item2_badge}</span>
                            <h4 className="font-bold text-xs text-white uppercase tracking-wider mt-0.5">{activeCopy.item2_title}</h4>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{activeCopy.item2_desc}</p>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 hover:text-white transition cursor-pointer select-none">
                            Explore code block <ChevronRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

          </div>
        </section>

        {/* Live dynamic structured mapping debugger */}
        <section className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              Real-time Copy Output Bindings
            </h4>
            <span className="text-[10px] font-mono text-slate-500">Live JSON Mapping</span>
          </div>

          <p className="text-[11px] leading-relaxed text-slate-400">
            Below is the raw text structured mapping of the interactive visual elements. Copy values directly for use inside development codebases.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 border border-slate-900 p-4 rounded-lg space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">Segment Key 1 - Display Header Title</span>
                <p className="text-xs font-semibold text-white mt-1">
                  {activeTab === 'landing' ? activeCopy.heroTitle : activeTab === 'portfolio' ? activeCopy.title : activeCopy.title}
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => copyToClipboard(activeTab === 'landing' ? activeCopy.heroTitle! : activeTab === 'portfolio' ? activeCopy.title! : activeCopy.title!, "seg-1")}
                className="mt-3 text-[10px] bg-slate-900 text-slate-400 hover:text-white px-2.5 py-1.5 rounded border border-slate-850 flex items-center gap-1 self-start transition cursor-pointer"
              >
                {copiedKey === "seg-1" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === "seg-1" ? "Copied" : "Copy Value"}</span>
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-900 p-4 rounded-lg space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">Segment Key 2 - Supporting Subtitle</span>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {activeTab === 'landing' ? activeCopy.heroSubtitle : activeTab === 'portfolio' ? activeCopy.subtitle : activeCopy.subtitle}
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => copyToClipboard(activeTab === 'landing' ? activeCopy.heroSubtitle! : activeTab === 'portfolio' ? activeCopy.subtitle! : activeCopy.subtitle!, "seg-2")}
                className="mt-3 text-[10px] bg-slate-900 text-slate-400 hover:text-white px-2.5 py-1.5 rounded border border-slate-850 flex items-center gap-1 self-start transition cursor-pointer"
              >
                {copiedKey === "seg-2" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === "seg-2" ? "Copied" : "Copy Value"}</span>
              </button>
            </div>
          </div>
        </section>

      </main>

    </div>
  );
};
