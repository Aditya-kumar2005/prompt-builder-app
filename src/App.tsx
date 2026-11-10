import React, { useState, useEffect } from "react";
import { 
  Sparkle, 
  LayoutTemplate, 
  Wand2, 
  Settings as SettingsIcon, 
  RotateCcw, 
  Check, 
  Cpu,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AISettings, DEFAULT_AI_SETTINGS } from "./types/ai";
import { TemplateStudioTab } from "./components/TemplateStudioTab";
import { PromptBuilderTab } from "./components/PromptBuilderTab";
import { SettingsTab } from "./components/SettingsTab";
import { WebsiteBuilderTab } from "./components/website-builder/WebsiteBuilderTab";

type ActiveView = "builder" | "templates" | "prompt_builder" | "settings";

export default function App() {
  const [currentView, setCurrentView] = useState<ActiveView>("builder");

  // Load and persist AI settings in localStorage
  const [aiSettings, setAiSettings] = useState<AISettings>(() => {
    try {
      const stored = localStorage.getItem("template_studio_ai_settings");
      if (stored) {
        return { ...DEFAULT_AI_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error("Failed to load AI settings:", e);
    }
    return DEFAULT_AI_SETTINGS;
  });

  const handleUpdateSettings = (newSettings: AISettings) => {
    setAiSettings(newSettings);
    try {
      localStorage.setItem("template_studio_ai_settings", JSON.stringify(newSettings));
    } catch (e) {
      console.error("Failed to persist AI settings:", e);
    }
  };

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const triggerToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const getActiveModelName = () => {
    if (aiSettings.activeProvider === "gemini") return aiSettings.geminiModel;
    if (aiSettings.activeProvider === "claude") return aiSettings.claudeModel.replace("claude-", "");
    return aiSettings.openaiModel;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-purple-500/30 selection:text-white">
      
      {/* Toast Notification HUD */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            id="toast-notification-banner"
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl border border-slate-800 bg-slate-900/95 backdrop-blur-md shadow-2xl flex items-center gap-3 max-w-sm w-full"
          >
            <div className={`p-1.5 rounded-lg ${
              toast.type === "success" 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : toast.type === "error" 
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
            }`}>
              <Sparkle className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-slate-200">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Top Header Frame */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/20 shrink-0">
            <Sparkle className="w-4.5 h-4.5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm tracking-tight text-white md:text-base">
                Template Studio & Prompt Builder
              </h1>
              <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] px-2 py-0.5 rounded-full font-mono hidden sm:inline">
                AI Multi-Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              Web Layout Previews + Gemini, Claude & OpenAI Universal Prompt Studio
            </p>
          </div>
        </div>

        {/* Center View Selector Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-850">
          <button
            type="button"
            onClick={() => setCurrentView("builder")}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              currentView === "builder"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Live Website Builder</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentView("templates")}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              currentView === "templates"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span>Layout Templates</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentView("prompt_builder")}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              currentView === "prompt_builder"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Prompt Studio</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentView("settings")}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              currentView === "settings"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>AI Settings</span>
            {(aiSettings.claudeKey || aiSettings.openaiKey || aiSettings.geminiKey) && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            )}
          </button>
        </nav>

        {/* Global actions HUD */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setCurrentView("settings")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-850 hover:border-purple-500/40 text-xs font-mono transition cursor-pointer"
            title="Active generation engine"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400 uppercase">{aiSettings.activeProvider}:</span>
            <span className="text-white font-semibold truncate max-w-[100px]">{getActiveModelName()}</span>
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentView === "builder" && (
          <WebsiteBuilderTab />
        )}

        {currentView === "templates" && (
          <TemplateStudioTab 
            settings={aiSettings}
            triggerToast={triggerToast}
            onNavigateToSettings={() => setCurrentView("settings")}
          />
        )}

        {currentView === "prompt_builder" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <PromptBuilderTab 
              settings={aiSettings}
              triggerToast={triggerToast}
            />
          </div>
        )}

        {currentView === "settings" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <SettingsTab 
              settings={aiSettings}
              onUpdateSettings={handleUpdateSettings}
              triggerToast={triggerToast}
            />
          </div>
        )}
      </div>

    </div>
  );
}
