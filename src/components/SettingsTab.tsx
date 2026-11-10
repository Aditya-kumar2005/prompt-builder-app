import React, { useState } from "react";
import { 
  KeyRound, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Sliders, 
  Cpu, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Trash2,
  Sparkles,
  Bot,
  Zap,
  AlertCircle
} from "lucide-react";
import { AISettings, AIProvider, PROVIDER_MODELS } from "../types/ai";

interface SettingsTabProps {
  settings: AISettings;
  onUpdateSettings: (newSettings: AISettings) => void;
  triggerToast: (message: string, type?: "success" | "error" | "info") => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onUpdateSettings,
  triggerToast,
}) => {
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showClaudeKey, setShowClaudeKey] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);

  const [testingProvider, setTestingProvider] = useState<AIProvider | null>(null);
  const [testResult, setTestResult] = useState<{
    provider: AIProvider;
    success: boolean;
    message: string;
  } | null>(null);

  const handleTestConnection = async (provider: AIProvider) => {
    setTestingProvider(provider);
    setTestResult(null);

    let key = "";
    let model = "";

    if (provider === "gemini") {
      key = settings.geminiKey;
      model = settings.geminiModel;
    } else if (provider === "claude") {
      key = settings.claudeKey;
      model = settings.claudeModel;
    } else if (provider === "openai") {
      key = settings.openaiKey;
      model = settings.openaiModel;
    }

    try {
      const resp = await fetch("/api/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          apiKey: key,
          model,
        }),
      });

      const data = await resp.json();

      if (resp.ok && data.success) {
        setTestResult({
          provider,
          success: true,
          message: data.sampleResponse || "Connection verified! Provider responded ready.",
        });
        triggerToast(`Connected to ${provider.toUpperCase()} successfully!`, "success");
      } else {
        setTestResult({
          provider,
          success: false,
          message: data.error || "Connection failed. Please inspect your API key.",
        });
        triggerToast(`Failed to connect to ${provider.toUpperCase()}`, "error");
      }
    } catch (err: any) {
      setTestResult({
        provider,
        success: false,
        message: err.message || "Network error while connecting to server proxy.",
      });
      triggerToast("Connection test error", "error");
    } finally {
      setTestingProvider(null);
    }
  };

  const handleClearKeys = () => {
    onUpdateSettings({
      ...settings,
      geminiKey: "",
      claudeKey: "",
      openaiKey: "",
    });
    setTestResult(null);
    triggerToast("All custom API keys removed from local storage.", "info");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2">
      {/* Header section */}
      <div className="border-b border-slate-900 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <KeyRound className="w-5 h-5 text-purple-400" />
              AI Engines & API Settings
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Configure models and API keys for Google Gemini, Anthropic Claude, and OpenAI to power your prompt engineering studio.
            </p>
          </div>
          
          <button
            type="button"
            onClick={handleClearKeys}
            className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-900 hover:border-rose-900/40 bg-slate-900/50 transition cursor-pointer self-start sm:self-center"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Custom Keys</span>
          </button>
        </div>
      </div>

      {/* Primary Provider Selector Cards */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          Active Generation Provider
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Gemini */}
          <div
            onClick={() => onUpdateSettings({ ...settings, activeProvider: "gemini" })}
            className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
              settings.activeProvider === "gemini"
                ? "bg-purple-950/20 border-purple-500/80 shadow-lg shadow-purple-900/20 ring-1 ring-purple-500/30"
                : "bg-slate-900/40 border-slate-900 hover:border-slate-800"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-white">Google Gemini</span>
                </div>
                {settings.activeProvider === "gemini" && (
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 font-mono font-semibold px-2 py-0.5 rounded-full border border-purple-500/30">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Superfast multimodal reasoning, pre-configured with default server access.
              </p>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-900/80 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-500">
                {settings.geminiKey ? "Custom Key Set" : "Server Key Ready"}
              </span>
              <span className="text-purple-400">{settings.geminiModel}</span>
            </div>
          </div>

          {/* Claude */}
          <div
            onClick={() => onUpdateSettings({ ...settings, activeProvider: "claude" })}
            className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
              settings.activeProvider === "claude"
                ? "bg-amber-950/20 border-amber-500/80 shadow-lg shadow-amber-900/20 ring-1 ring-amber-500/30"
                : "bg-slate-900/40 border-slate-900 hover:border-slate-800"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-white">Anthropic Claude</span>
                </div>
                {settings.activeProvider === "claude" && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Elite prompt fidelity, XML scaffolding, and nuanced system instruction execution.
              </p>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-900/80 flex items-center justify-between text-[11px] font-mono">
              <span className={settings.claudeKey ? "text-emerald-400" : "text-amber-500/80"}>
                {settings.claudeKey ? "Key Configured" : "Key Required"}
              </span>
              <span className="text-amber-400 truncate max-w-[120px]">{settings.claudeModel.replace("claude-", "")}</span>
            </div>
          </div>

          {/* OpenAI */}
          <div
            onClick={() => onUpdateSettings({ ...settings, activeProvider: "openai" })}
            className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
              settings.activeProvider === "openai"
                ? "bg-emerald-950/20 border-emerald-500/80 shadow-lg shadow-emerald-900/20 ring-1 ring-emerald-500/30"
                : "bg-slate-900/40 border-slate-900 hover:border-slate-800"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-white">OpenAI GPT</span>
                </div>
                {settings.activeProvider === "openai" && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Industry standard GPT-4o models for JSON structures and general prompt engineering.
              </p>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-900/80 flex items-center justify-between text-[11px] font-mono">
              <span className={settings.openaiKey ? "text-emerald-400" : "text-emerald-500/80"}>
                {settings.openaiKey ? "Key Configured" : "Key Required"}
              </span>
              <span className="text-emerald-400">{settings.openaiModel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Provider API Key & Model Configuration Panels */}
      <div className="space-y-6">
        
        {/* 1. Google Gemini Config */}
        <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-sm text-white">Google Gemini Configuration</h3>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 transition"
            >
              Get Gemini Key <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Gemini Model
              </label>
              <select
                value={settings.geminiModel}
                onChange={(e) => onUpdateSettings({ ...settings, geminiModel: e.target.value })}
                className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                {PROVIDER_MODELS.gemini.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.badge ? `(${m.badge})` : ""}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 font-mono">
                {PROVIDER_MODELS.gemini.find((m) => m.id === settings.geminiModel)?.description}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Custom Gemini API Key (Optional)
                </label>
                <span className="text-[9px] text-emerald-400 font-mono">
                  {settings.geminiKey ? "Custom Active" : "Server Default Available"}
                </span>
              </div>
              <div className="relative">
                <input
                  type={showGeminiKey ? "text" : "password"}
                  value={settings.geminiKey}
                  onChange={(e) => onUpdateSettings({ ...settings, geminiKey: e.target.value })}
                  placeholder="Leave empty to use default server key"
                  className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg py-2.5 pl-3 pr-10 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showGeminiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                You can use AI Studio's built-in key or provide your own API key to bypass default limits.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => handleTestConnection("gemini")}
              disabled={testingProvider === "gemini"}
              className="text-xs bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 px-3.5 py-1.5 rounded-lg transition inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {testingProvider === "gemini" ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin text-purple-400" />
                  <span>Pinging Gemini...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  <span>Test Gemini Connection</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2. Anthropic Claude Config */}
        <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center gap-2.5">
              <Bot className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white">Anthropic Claude Configuration</h3>
            </div>
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
            >
              Get Claude Key <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Claude Model
              </label>
              <select
                value={settings.claudeModel}
                onChange={(e) => onUpdateSettings({ ...settings, claudeModel: e.target.value })}
                className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {PROVIDER_MODELS.claude.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.badge ? `(${m.badge})` : ""}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 font-mono">
                {PROVIDER_MODELS.claude.find((m) => m.id === settings.claudeModel)?.description}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Anthropic API Key
                </label>
                <span className={`text-[9px] font-mono ${settings.claudeKey ? "text-emerald-400" : "text-amber-400"}`}>
                  {settings.claudeKey ? "Saved" : "Not Provided"}
                </span>
              </div>
              <div className="relative">
                <input
                  type={showClaudeKey ? "text" : "password"}
                  value={settings.claudeKey}
                  onChange={(e) => onUpdateSettings({ ...settings, claudeKey: e.target.value })}
                  placeholder="sk-ant-api03-..."
                  className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg py-2.5 pl-3 pr-10 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowClaudeKey(!showClaudeKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showClaudeKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                Required when setting Anthropic Claude as your active provider.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => handleTestConnection("claude")}
              disabled={testingProvider === "claude"}
              className="text-xs bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 px-3.5 py-1.5 rounded-lg transition inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {testingProvider === "claude" ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                  <span>Pinging Claude...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-3.5 h-3.5 text-amber-400" />
                  <span>Test Claude Connection</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3. OpenAI Config */}
        <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">OpenAI Configuration</h3>
            </div>
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
            >
              Get OpenAI Key <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                OpenAI Model
              </label>
              <select
                value={settings.openaiModel}
                onChange={(e) => onUpdateSettings({ ...settings, openaiModel: e.target.value })}
                className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {PROVIDER_MODELS.openai.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.badge ? `(${m.badge})` : ""}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 font-mono">
                {PROVIDER_MODELS.openai.find((m) => m.id === settings.openaiModel)?.description}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  OpenAI API Key
                </label>
                <span className={`text-[9px] font-mono ${settings.openaiKey ? "text-emerald-400" : "text-amber-400"}`}>
                  {settings.openaiKey ? "Saved" : "Not Provided"}
                </span>
              </div>
              <div className="relative">
                <input
                  type={showOpenAIKey ? "text" : "password"}
                  value={settings.openaiKey}
                  onChange={(e) => onUpdateSettings({ ...settings, openaiKey: e.target.value })}
                  placeholder="sk-proj-..."
                  className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg py-2.5 pl-3 pr-10 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showOpenAIKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                Required when setting OpenAI GPT as your active provider.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => handleTestConnection("openai")}
              disabled={testingProvider === "openai"}
              className="text-xs bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 px-3.5 py-1.5 rounded-lg transition inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {testingProvider === "openai" ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
                  <span>Pinging OpenAI...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Test OpenAI Connection</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Connection Test Output Banner */}
      {testResult && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 ${
            testResult.success
              ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
              : "bg-rose-950/20 border-rose-500/40 text-rose-300"
          }`}
        >
          {testResult.success ? (
            <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1 text-xs">
            <span className="font-bold uppercase tracking-wider block">
              {testResult.provider.toUpperCase()} Ping Result:{" "}
              {testResult.success ? "Online & Ready" : "Connection Refused"}
            </span>
            <p className="font-mono text-[11px] leading-relaxed opacity-90">{testResult.message}</p>
          </div>
        </div>
      )}

      {/* Global Hyperparameters Section */}
      <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-900 pb-3">
          <Sliders className="w-4 h-4 text-purple-400" />
          <h3 className="font-bold text-sm text-white">Global Inference Hyperparameters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold uppercase tracking-wider text-slate-400">
                Temperature (Randomness / Creativity)
              </label>
              <span className="font-mono text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                {settings.temperature.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.temperature}
              onChange={(e) => onUpdateSettings({ ...settings, temperature: parseFloat(e.target.value) })}
              className="w-full accent-purple-600 bg-slate-950 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.0 (Deterministic / Exact)</span>
              <span>0.7 (Standard / Balanced)</span>
              <span>1.0 (Creative / Exploratory)</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold uppercase tracking-wider text-slate-400">
                Max Output Tokens
              </label>
              <span className="font-mono text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                {settings.maxTokens}
              </span>
            </div>
            <input
              type="range"
              min="512"
              max="8192"
              step="256"
              value={settings.maxTokens}
              onChange={(e) => onUpdateSettings({ ...settings, maxTokens: parseInt(e.target.value) })}
              className="w-full accent-purple-600 bg-slate-950 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>512 (Short snippets)</span>
              <span>3000 (Detailed prompt scripts)</span>
              <span>8192 (Full documentation)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security and Privacy Notice Card */}
      <div className="p-4 rounded-xl bg-slate-900/20 border border-slate-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-slate-400">
          <h4 className="font-bold text-slate-200">Local Security Guarantee</h4>
          <p className="text-[11px] leading-relaxed">
            API keys entered here are stored strictly in your browser's local cache (<code className="text-slate-300 font-mono">localStorage</code>). When you craft or run prompts, your keys are passed via secure backend proxy headers directly to the AI providers without ever being written to a database or tracked.
          </p>
        </div>
      </div>
    </div>
  );
};
