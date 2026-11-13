import React, { useState } from "react";
import {
  Wand2,
  Settings as SettingsIcon,
  Globe,
  Home,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  AISettings,
  DEFAULT_AI_SETTINGS,
  sanitizeAISettings,
} from "./types/ai";
import { PromptBuilderTab } from "./components/PromptBuilderTab";
import { SettingsTab } from "./components/SettingsTab";
import { WebsiteBuilderTab } from "./components/website-builder/WebsiteBuilderTab";
import { LandingPage } from "./components/LandingPage";

type ActiveView = "home" | "builder" | "prompt_builder" | "settings";

export default function App() {
  const [currentView, setCurrentView] = useState<ActiveView>("home");

  // Load, sanitize, and persist AI settings in localStorage
  const [aiSettings, setAiSettings] = useState<AISettings>(() => {
    try {
      const stored = localStorage.getItem("template_studio_ai_settings");
      if (stored) {
        return sanitizeAISettings(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load AI settings:", e);
    }
    return DEFAULT_AI_SETTINGS;
  });

  const handleUpdateSettings = (newSettings: AISettings) => {
    const cleaned = sanitizeAISettings(newSettings);
    setAiSettings(cleaned);
    try {
      localStorage.setItem("template_studio_ai_settings", JSON.stringify(cleaned));
    } catch (e) {
      console.error("Failed to persist AI settings:", e);
    }
  };

  // Toast notification state
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const triggerToast = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const getActiveModelLabel = () => {
    if (aiSettings.activeProvider === "gemini") return aiSettings.geminiModel;
    if (aiSettings.activeProvider === "claude") {
      return aiSettings.claudeModel.replace(/^claude-/, "").replace(/-\d{8}$/, "");
    }
    return aiSettings.openaiModel;
  };

  const hasCustomKeys = Boolean(
    aiSettings.claudeKey || aiSettings.openaiKey || aiSettings.geminiKey
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col selection:bg-blue-600/30 selection:text-white">
      {/* Toast Notification HUD */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            id="toast-notification-banner"
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900/95 backdrop-blur-md shadow-2xl flex items-center gap-2.5 max-w-md w-max"
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : toast.type === "error" ? (
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
            )}
            <p className="text-xs font-medium text-zinc-100 leading-snug">
              {toast.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Top Header Frame (3-Zone Contract) */}
      <header className="border-b border-zinc-900 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-6 lg:gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => setCurrentView("home")}
          className="flex items-center gap-2 cursor-pointer group shrink-0 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            className="text-zinc-100 group-hover:text-blue-400 transition-colors shrink-0"
            aria-hidden="true"
          >
            <rect
              x="3"
              y="3"
              width="11"
              height="11"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.75"
            />
            <rect
              x="10"
              y="10"
              width="11"
              height="11"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.75"
              fill="#09090b"
            />
          </svg>
          <span className="font-display font-bold text-sm sm:text-base tracking-tight text-zinc-100">
            SiteCraft
          </span>
        </button>

        {/* Zone 2: Clean Single-Line Navigation Links */}
        <nav
          aria-label="Primary workspace navigation"
          className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar"
        >
          <button
            type="button"
            onClick={() => setCurrentView("home")}
            className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              currentView === "home"
                ? "bg-zinc-900 text-white border border-zinc-800"
                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentView("builder")}
            className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              currentView === "builder"
                ? "bg-zinc-900 text-white border border-zinc-800"
                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Builder</span>
            <span className="hidden md:inline">Studio</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentView("prompt_builder")}
            className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              currentView === "prompt_builder"
                ? "bg-zinc-900 text-white border border-zinc-800"
                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50"
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Prompts</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentView("settings")}
            className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              currentView === "settings"
                ? "bg-zinc-900 text-white border border-zinc-800"
                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50"
            }`}
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </nav>

        {/* Zone 3: Single Primary Action / Active Provider Link */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => setCurrentView("settings")}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="Configure active AI provider and API keys"
          >
            <span className="text-zinc-400 capitalize">{aiSettings.activeProvider}</span>
            <span className="text-zinc-600" aria-hidden="true">/</span>
            <span className="text-zinc-100 font-medium truncate max-w-[130px]">
              {getActiveModelLabel()}
            </span>
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {currentView === "home" && (
          <LandingPage
            onNavigate={setCurrentView}
            hasApiKeys={hasCustomKeys}
          />
        )}

        {currentView === "builder" && (
          <WebsiteBuilderTab
            settings={aiSettings}
            triggerToast={triggerToast}
            onOpenSettings={() => setCurrentView("settings")}
          />
        )}

        {currentView === "prompt_builder" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <PromptBuilderTab
              settings={aiSettings}
              triggerToast={triggerToast}
              onOpenSettings={() => setCurrentView("settings")}
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
      </main>
    </div>
  );
}
