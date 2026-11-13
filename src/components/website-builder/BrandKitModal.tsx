/**
 * BrandKitModal Component
 * Generates a cohesive color palette, Google Fonts pairing, and interactive
 * 3D logo marks powered by Three.js using the user's configured AI provider & keys.
 */
import React, { useState } from 'react';
import { SiteProject } from './builderTypes';
import { AISettings, getActiveCredential, safeFetchJson } from '../../types/ai';
import { ThreeLogoViewer, Procedural3DLogoData } from './ThreeLogoViewer';
import {
  AlertCircle,
  Box,
  Check,
  Palette,
  RefreshCw,
  Type,
  X,
} from 'lucide-react';

export interface GeneratedBrandKit {
  brandName: string;
  palette: {
    name: string;
    harmony: string;
    rationale: string;
    primary: string;
    accent: string;
    bg: string;
    surface: string;
    text: string;
    muted: string;
    border: string;
  };
  typography: {
    fontH: string;
    fontB: string;
    pairingName: string;
    weights: string;
    rationale: string;
  };
  logoConcepts: {
    id: string;
    name: string;
    tagline: string;
    archetype: string;
    proceduralDetails: Procedural3DLogoData;
    svgGlyph: string;
    rationale: string;
  }[];
}

interface BrandKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: SiteProject;
  settings: AISettings;
  onApplyPalette: (palette: any) => void;
  onApplyTypography: (fontH: string, fontB: string) => void;
  onApplyBrand: (brandName: string, logoConcept?: any) => void;
  onApplyCompleteKit: (kit: GeneratedBrandKit, selectedLogoIndex: number) => void;
  onAddFloatingLogo: (logoConcept: any) => void;
  triggerToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onOpenSettings?: () => void;
}

const AESTHETIC_VIBES = [
  { id: 'Minimalist Neo-Grotesque', label: 'Minimalist Swiss' },
  { id: 'Warm Editorial Luxury', label: 'Editorial Luxury' },
  { id: 'Industrial Obsidian Technical', label: 'Industrial Dark' },
  { id: 'Nordic Clean Organic', label: 'Nordic Organic' },
  { id: 'High-Contrast Studio Mono', label: 'Architectural Mono' },
];

export const BrandKitModal: React.FC<BrandKitModalProps> = ({
  isOpen,
  onClose,
  project,
  settings,
  onApplyPalette,
  onApplyTypography,
  onApplyBrand,
  onApplyCompleteKit,
  onAddFloatingLogo,
  triggerToast,
  onOpenSettings,
}) => {
  const [brandName, setBrandName] = useState(project.profile.name || 'Atelier North');
  const [industry, setIndustry] = useState(project.profile.role || 'Full-Stack Software Architecture');
  const [vibe, setVibe] = useState('Industrial Obsidian Technical');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'palette' | 'typography' | 'logos'>('all');
  const [selectedLogoIdx, setSelectedLogoIdx] = useState<number>(0);
  const [brandKit, setBrandKit] = useState<GeneratedBrandKit | null>(null);

  if (!isOpen) return null;

  const cred = getActiveCredential(settings);
  const missingCustomKey = cred.provider !== 'gemini' && !cred.apiKey;

  const handleGenerate = async () => {
    if (missingCustomKey) {
      const msg = `Add your ${cred.provider.toUpperCase()} API key in AI Settings before generating.`;
      setErrorMsg(msg);
      triggerToast(msg, 'error');
      return;
    }
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const { ok, data } = await safeFetchJson('/api/brand-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName,
          industry,
          vibe,
          provider: cred.provider,
          apiKey: cred.apiKey,
          model: cred.model,
          temperature: settings.temperature,
        }),
      });

      if (!ok || !data?.success || !data?.brandKit) {
        throw new Error(data?.error || 'Failed to generate brand kit.');
      }

      setBrandKit(data.brandKit);
      setSelectedLogoIdx(0);
      triggerToast('Brand system generated successfully', 'success');
    } catch (err: any) {
      const msg = err.message || 'API error generating brand kit.';
      setErrorMsg(msg);
      triggerToast(msg, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentKit = brandKit;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-zinc-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-blue-400">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-sm font-semibold text-white">Brand Identity Generator</h3>
                <span className="text-xs font-mono text-zinc-500">
                  {cred.provider} / {cred.model}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Compose a WCAG-balanced 7-swatch palette, Google Fonts pairing, and 3D WebGL logo marks.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Formulation Bar */}
        <div className="p-4 bg-zinc-950/60 border-b border-zinc-800 flex flex-wrap items-end gap-3 text-xs">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[11px] text-zinc-400 mb-1 font-medium">
              Brand / Project Name
            </label>
            <input
              type="text"
              value={brandName}
              onChange={e => setBrandName(e.target.value)}
              placeholder="e.g. Apex Systems"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] text-zinc-400 mb-1 font-medium">
              Domain / Specialization
            </label>
            <input
              type="text"
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              placeholder="e.g. Cloud Infrastructure"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="w-full sm:w-48">
            <label className="block text-[11px] text-zinc-400 mb-1 font-medium">
              Visual Direction
            </label>
            <select
              value={vibe}
              onChange={e => setVibe(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {AESTHETIC_VIBES.map(v => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-auto">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full sm:w-auto px-4 py-1.5 h-[30px] rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Generating...' : 'Generate Brand Kit'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body & Results */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {missingCustomKey && (
            <div className="p-3.5 rounded-lg border border-amber-500/40 bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-200">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-100">
                    {cred.provider === 'claude' ? 'Anthropic Claude' : 'OpenAI'} API key required
                  </p>
                  <p className="text-[11px] text-amber-200/80">
                    Your active provider has no saved key in localStorage. Configure it in Settings or switch to Gemini.
                  </p>
                </div>
              </div>
              {onOpenSettings && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSettings();
                  }}
                  className="px-3 py-1.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-100 font-medium text-xs transition-colors cursor-pointer whitespace-nowrap self-start sm:self-center"
                >
                  Open AI Settings
                </button>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-lg border border-rose-500/40 bg-rose-950/20 flex items-start gap-2.5 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-rose-300">Generation Error</p>
                <p className="font-mono text-[11px] opacity-90">{errorMsg}</p>
              </div>
            </div>
          )}

          {!currentKit && !isGenerating && (
            <div className="py-14 text-center space-y-3 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-lg bg-zinc-800/60 border border-zinc-700 text-blue-400 flex items-center justify-center mx-auto">
                <Palette className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-white">Generate a Cohesive Brand System</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Uses your active AI provider (<span className="font-mono text-zinc-200">{cred.provider}</span>) to compose a 7-color palette, Google Fonts pairing, and 3 procedural Three.js 3D marks.
              </p>
              <button
                type="button"
                onClick={handleGenerate}
                className="px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Generate Brand Kit
              </button>
            </div>
          )}

          {isGenerating && (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-blue-500 animate-spin mx-auto" />
              <p className="text-sm font-medium text-zinc-200">
                Synthesizing palette harmony, typography &amp; 3D geometry via {cred.provider.toUpperCase()}...
              </p>
              <p className="text-xs text-zinc-500 font-mono">{cred.model}</p>
            </div>
          )}

          {currentKit && !isGenerating && (
            <div className="space-y-6">
              {/* Segmented Filter */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-md border border-zinc-800 text-xs">
                  {(['all', 'palette', 'typography', 'logos'] as const).map(tab => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1 rounded text-xs font-medium capitalize transition-colors cursor-pointer ${
                        activeTab === tab ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {tab === 'all' ? 'All Systems' : tab === 'logos' ? '3D Logo Marks' : tab}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => onApplyCompleteKit(currentKit, selectedLogoIdx)}
                  className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply Complete Kit</span>
                </button>
              </div>

              {/* 1. COLOR PALETTE */}
              {(activeTab === 'all' || activeTab === 'palette') && (
                <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-blue-400" />
                      <h4 className="font-semibold text-sm text-white">{currentKit.palette.name}</h4>
                      <span className="text-[11px] font-mono text-zinc-400">
                        · {currentKit.palette.harmony}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onApplyPalette(currentKit.palette)}
                      className="px-3 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Apply Palette
                    </button>
                  </div>

                  <p className="text-xs text-zinc-400">{currentKit.palette.rationale}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1">
                    {[
                      { role: 'Primary', hex: currentKit.palette.primary },
                      { role: 'Accent', hex: currentKit.palette.accent },
                      { role: 'Canvas Bg', hex: currentKit.palette.bg },
                      { role: 'Surface', hex: currentKit.palette.surface },
                      { role: 'Body Text', hex: currentKit.palette.text },
                      { role: 'Muted Text', hex: currentKit.palette.muted },
                      { role: 'Hairline', hex: currentKit.palette.border },
                    ].map(c => (
                      <div
                        key={c.role}
                        className="p-2 rounded-lg border border-zinc-800 bg-zinc-900 flex flex-col gap-1.5"
                      >
                        <div
                          className="h-10 w-full rounded border border-white/10"
                          style={{ background: c.hex }}
                        />
                        <div>
                          <div className="text-[10px] text-zinc-400 truncate">{c.role}</div>
                          <div className="text-xs font-mono font-medium text-white tabular-nums">{c.hex}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. TYPOGRAPHY PAIRING */}
              {(activeTab === 'all' || activeTab === 'typography') && (
                <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Type className="w-4 h-4 text-blue-400" />
                      <h4 className="font-semibold text-sm text-white">
                        {currentKit.typography.fontH} + {currentKit.typography.fontB}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => onApplyTypography(currentKit.typography.fontH, currentKit.typography.fontB)}
                      className="px-3 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Apply Fonts
                    </button>
                  </div>

                  <p className="text-xs text-zinc-400">{currentKit.typography.rationale}</p>

                  <div
                    className="p-5 rounded-lg border border-zinc-800 space-y-2"
                    style={{
                      background: currentKit.palette.surface,
                      color: currentKit.palette.text,
                    }}
                  >
                    <div
                      className="text-2xl font-bold tracking-tight"
                      style={{
                        fontFamily: `'${currentKit.typography.fontH}', system-ui, sans-serif`,
                        color: currentKit.palette.text,
                      }}
                    >
                      Structured typography for clear digital interfaces
                    </div>
                    <div
                      className="text-xs font-medium font-mono"
                      style={{
                        color: currentKit.palette.primary,
                      }}
                    >
                      Heading: {currentKit.typography.fontH} · {currentKit.typography.weights}
                    </div>
                    <p
                      className="text-sm leading-relaxed"
                      style={{
                        fontFamily: `'${currentKit.typography.fontB}', system-ui, sans-serif`,
                        color: currentKit.palette.muted,
                      }}
                    >
                      Body ({currentKit.typography.fontB}): Clear contrast, deliberate proportions, and clean visual rhythm across desktop and mobile viewports.
                    </p>
                  </div>
                </div>
              )}

              {/* 3. THREE.JS 3D LOGO CONCEPTS */}
              {(activeTab === 'all' || activeTab === 'logos') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Box className="w-4 h-4 text-blue-400" />
                      <h4 className="font-semibold text-sm text-white">Interactive 3D Logo Marks</h4>
                      <span className="text-[11px] text-zinc-500">Drag to orbit</span>
                    </div>

                    <span className="text-xs font-mono text-zinc-400 tabular-nums">
                      Concept {selectedLogoIdx + 1} of {currentKit.logoConcepts.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {currentKit.logoConcepts.map((concept, idx) => {
                      const isSelected = selectedLogoIdx === idx;
                      return (
                        <div
                          key={concept.id}
                          onClick={() => setSelectedLogoIdx(idx)}
                          className={`rounded-lg border transition-colors flex flex-col overflow-hidden bg-zinc-950 cursor-pointer ${
                            isSelected
                              ? 'border-blue-500 ring-1 ring-blue-500/40'
                              : 'border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <div className="h-44 w-full relative bg-zinc-950 flex items-center justify-center">
                            <ThreeLogoViewer
                              data={concept.proceduralDetails}
                              height={176}
                              interactive={true}
                              autoRotate={true}
                              showControls={true}
                            />
                            {isSelected && (
                              <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-medium">
                                Selected
                              </span>
                            )}
                          </div>

                          <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between border-t border-zinc-800">
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <h5 className="font-semibold text-xs text-white truncate">{concept.name}</h5>
                                <span className="text-[10px] font-mono text-zinc-400 capitalize shrink-0">
                                  {concept.archetype.replace(/_/g, ' ')}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                                {concept.rationale}
                              </p>
                            </div>

                            <div className="flex gap-1.5 pt-2 border-t border-zinc-800">
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  onApplyBrand(brandName, concept);
                                }}
                                className="flex-1 py-1.5 px-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-medium transition-colors text-center cursor-pointer"
                              >
                                Use Name
                              </button>
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  onAddFloatingLogo(concept);
                                }}
                                className="py-1.5 px-2.5 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-[11px] font-medium transition-colors cursor-pointer"
                              >
                                + Add to Canvas
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="text-xs text-zinc-400 font-mono">
            Engine: {cred.provider} / {cred.model}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Close
            </button>

            {currentKit && (
              <button
                type="button"
                onClick={() => {
                  onApplyCompleteKit(currentKit, selectedLogoIdx);
                  onClose();
                }}
                className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Complete Brand Kit</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
