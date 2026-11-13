import React, { useState } from "react";
import {
  KeyRound,
  Check,
  ExternalLink,
  ShieldCheck,
  Sliders,
  RefreshCw,
  Eye,
  EyeOff,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { AISettings, AIProvider, PROVIDER_MODELS, cleanClientApiKey } from "../types/ai";

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

  const normalizeKeyInput = (val: string) => cleanClientApiKey(val);

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
          apiKey: cleanClientApiKey(key),
          model,
        }),
      });

      const data = await resp.json();

      if (resp.ok && data.success) {
        setTestResult({
          provider,
          success: true,
          message: data.sampleResponse || `${provider.toUpperCase()} verified (${data.model || model}).`,
        });
        triggerToast(`Connected to ${provider.toUpperCase()} successfully`, "success");
      } else {
        setTestResult({
          provider,
          success: false,
          message: data.error || "Connection refused. Verify your API key and selected model.",
        });
        triggerToast(`${provider.toUpperCase()} connection failed`, "error");
      }
    } catch (err: any) {
      setTestResult({
        provider,
        success: false,
        message: err.message || "Network error contacting API proxy.",
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
    triggerToast("Cleared custom API keys from browser storage.", "info");
  };

  const renderInlineResult = (provider: AIProvider) => {
    if (!testResult || testResult.provider !== provider) return null;
    return (
      <div
        className={`p-3 rounded-md border flex items-start gap-2.5 text-xs ${
          testResult.success
            ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-200"
            : "bg-rose-950/20 border-rose-500/40 text-rose-200"
        }`}
      >
        {testResult.success ? (
          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
        )}
        <div className="space-y-0.5">
          <span className="font-semibold block">
            {testResult.success ? "Verified" : "Verification Failed"}
          </span>
          <p className="font-mono text-[11px] leading-relaxed opacity-90">{testResult.message}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-white flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-blue-400" />
            <span>AI Engines &amp; API Configuration</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Configure API credentials and default models for Google Gemini, Anthropic Claude, and OpenAI across all studios.
          </p>
        </div>

        <button
          type="button"
          onClick={handleClearKeys}
          className="text-xs text-zinc-400 hover:text-rose-400 flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-800 hover:border-rose-500/40 bg-zinc-900 transition-colors cursor-pointer self-start sm:self-center"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Saved Keys</span>
        </button>
      </div>

      {/* Primary Provider Selector */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-zinc-400 block">
          Active Provider (Used by Website Studio, Brand Kit &amp; Prompt Studio)
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              id: "gemini" as AIProvider,
              title: "Google Gemini",
              desc: "Multimodal generation, structured JSON outputs, and low-latency prompt crafting.",
              keySet: Boolean(settings.geminiKey.trim()),
              emptyStatus: "API key recommended",
              modelLabel: settings.geminiModel,
            },
            {
              id: "claude" as AIProvider,
              title: "Anthropic Claude",
              desc: "Long-context reasoning, strict XML instruction adherence, and editorial prose.",
              keySet: Boolean(settings.claudeKey.trim()),
              emptyStatus: "API key required",
              modelLabel: settings.claudeModel.replace(/^claude-/, "").replace(/-\d{8}$/, ""),
            },
            {
              id: "openai" as AIProvider,
              title: "OpenAI GPT",
              desc: "GPT-4o, GPT-4.1, and o3-mini reasoning models for strict JSON schemas.",
              keySet: Boolean(settings.openaiKey.trim()),
              emptyStatus: "API key required",
              modelLabel: settings.openaiModel,
            },
          ].map(card => {
            const isActive = settings.activeProvider === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onUpdateSettings({ ...settings, activeProvider: card.id })}
                className={`p-4 rounded-lg border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? "bg-zinc-900 border-blue-500 ring-1 ring-blue-500/30"
                    : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-white">{card.title}</span>
                    {isActive && (
                      <span className="text-[11px] font-mono text-blue-400 font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{card.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono">
                  <span className={card.keySet ? "text-emerald-400" : "text-zinc-500"}>
                    {card.keySet ? "Custom key set" : card.emptyStatus}
                  </span>
                  <span className="text-zinc-300 truncate max-w-[130px]">{card.modelLabel}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Provider Configuration Panels */}
      <div className="space-y-4">
        {/* 1. Google Gemini */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-semibold text-sm text-white">Google Gemini</h3>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              <span>Create API Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 block">Model</label>
              <select
                value={settings.geminiModel}
                onChange={e => onUpdateSettings({ ...settings, geminiModel: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-md p-2.5 text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {PROVIDER_MODELS.gemini.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.badge ? `(${m.badge})` : ""}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-zinc-500">
                {PROVIDER_MODELS.gemini.find(m => m.id === settings.geminiModel)?.description}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-zinc-400">API Key</label>
                <span className="text-[11px] font-mono text-zinc-500">
                  {settings.geminiKey ? "Saved locally" : "Starts with AIza..."}
                </span>
              </div>
              <div className="relative">
                <input
                  type={showGeminiKey ? "text" : "password"}
                  value={settings.geminiKey}
                  onChange={e =>
                    onUpdateSettings({ ...settings, geminiKey: normalizeKeyInput(e.target.value) })
                  }
                  placeholder="AIzaSy..."
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-md py-2.5 pl-3 pr-10 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  {showGeminiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {renderInlineResult("gemini")}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => handleTestConnection("gemini")}
              disabled={testingProvider === "gemini"}
              className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 px-3.5 py-1.5 rounded-md transition-colors inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingProvider === "gemini" ? "animate-spin text-blue-400" : "text-zinc-400"}`} />
              <span>{testingProvider === "gemini" ? "Testing..." : "Verify Connection"}</span>
            </button>
          </div>
        </div>

        {/* 2. Anthropic Claude */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-semibold text-sm text-white">Anthropic Claude</h3>
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              <span>Create API Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 block">Model</label>
              <select
                value={settings.claudeModel}
                onChange={e => onUpdateSettings({ ...settings, claudeModel: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-md p-2.5 text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {PROVIDER_MODELS.claude.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.badge ? `(${m.badge})` : ""}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-zinc-500">
                {PROVIDER_MODELS.claude.find(m => m.id === settings.claudeModel)?.description}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-zinc-400">API Key</label>
                <span className="text-[11px] font-mono text-zinc-500">
                  {settings.claudeKey ? "Saved locally" : "Starts with sk-ant-..."}
                </span>
              </div>
              <div className="relative">
                <input
                  type={showClaudeKey ? "text" : "password"}
                  value={settings.claudeKey}
                  onChange={e =>
                    onUpdateSettings({ ...settings, claudeKey: normalizeKeyInput(e.target.value) })
                  }
                  placeholder="sk-ant-api03-..."
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-md py-2.5 pl-3 pr-10 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowClaudeKey(!showClaudeKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  {showClaudeKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {renderInlineResult("claude")}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => handleTestConnection("claude")}
              disabled={testingProvider === "claude"}
              className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 px-3.5 py-1.5 rounded-md transition-colors inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingProvider === "claude" ? "animate-spin text-blue-400" : "text-zinc-400"}`} />
              <span>{testingProvider === "claude" ? "Testing..." : "Verify Connection"}</span>
            </button>
          </div>
        </div>

        {/* 3. OpenAI */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-semibold text-sm text-white">OpenAI</h3>
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              <span>Create API Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 block">Model</label>
              <select
                value={settings.openaiModel}
                onChange={e => onUpdateSettings({ ...settings, openaiModel: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-md p-2.5 text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {PROVIDER_MODELS.openai.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.badge ? `(${m.badge})` : ""}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-zinc-500">
                {PROVIDER_MODELS.openai.find(m => m.id === settings.openaiModel)?.description}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-zinc-400">API Key</label>
                <span className="text-[11px] font-mono text-zinc-500">
                  {settings.openaiKey ? "Saved locally" : "Starts with sk-..."}
                </span>
              </div>
              <div className="relative">
                <input
                  type={showOpenAIKey ? "text" : "password"}
                  value={settings.openaiKey}
                  onChange={e =>
                    onUpdateSettings({ ...settings, openaiKey: normalizeKeyInput(e.target.value) })
                  }
                  placeholder="sk-proj-..."
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-md py-2.5 pl-3 pr-10 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  {showOpenAIKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {renderInlineResult("openai")}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => handleTestConnection("openai")}
              disabled={testingProvider === "openai"}
              className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 px-3.5 py-1.5 rounded-md transition-colors inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingProvider === "openai" ? "animate-spin text-blue-400" : "text-zinc-400"}`} />
              <span>{testingProvider === "openai" ? "Testing..." : "Verify Connection"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global Parameters */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
          <Sliders className="w-4 h-4 text-blue-400" />
          <h3 className="font-semibold text-sm text-white">Inference Parameters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-medium text-zinc-300">Temperature</label>
              <span className="font-mono text-zinc-100 tabular-nums">{settings.temperature.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.temperature}
              onChange={e => onUpdateSettings({ ...settings, temperature: parseFloat(e.target.value) })}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
              <span>0.0 Deterministic</span>
              <span>0.7 Balanced</span>
              <span>1.0 Creative</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-medium text-zinc-300">Max Output Tokens</label>
              <span className="font-mono text-zinc-100 tabular-nums">{settings.maxTokens}</span>
            </div>
            <input
              type="range"
              min="512"
              max="8192"
              step="256"
              value={settings.maxTokens}
              onChange={e => onUpdateSettings({ ...settings, maxTokens: parseInt(e.target.value) })}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-zinc-500 font-mono tabular-nums">
              <span>512</span>
              <span>3000</span>
              <span>8192</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="p-4 rounded-lg bg-zinc-900/30 border border-zinc-800 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-zinc-400">
          <h4 className="font-medium text-zinc-200">Client-Local Credential Storage</h4>
          <p className="text-[11px] leading-relaxed">
            Keys are stored only in browser <code className="text-zinc-300 font-mono">localStorage</code> and forwarded cleanly per request through the local server proxy directly to your chosen provider. Whitespace, quotes, and accidental <code className="text-zinc-300 font-mono">Bearer</code> prefixes are stripped automatically.
          </p>
        </div>
      </div>
    </div>
  );
};
