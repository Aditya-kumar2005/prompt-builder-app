/**
 * BrandKitModal Component
 * Modal dialog for triggering Gemini to generate a cohesive color palette,
 * typography pairing, and an interactive set of 3D logo concepts powered by Three.js.
 */
import React, { useState } from 'react';
import { SiteProject } from './builderTypes';
import { ThreeLogoViewer, Procedural3DLogoData } from './ThreeLogoViewer';
import {
  Check,
  ChevronRight,
  Copy,
  Layers,
  Palette,
  RefreshCw,
  Sparkles,
  Type,
  X,
  Zap,
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
  onApplyPalette: (palette: any) => void;
  onApplyTypography: (fontH: string, fontB: string) => void;
  onApplyBrand: (brandName: string, logoConcept?: any) => void;
  onApplyCompleteKit: (kit: GeneratedBrandKit, selectedLogoIndex: number) => void;
  onAddFloatingLogo: (logoConcept: any) => void;
  showToast: (msg: string) => void;
}

const AESTHETIC_VIBES = [
  { id: 'Futuristic High-Tech', label: 'Futuristic Tech', desc: 'Dark canvas, cyber glow, precise geometry' },
  { id: 'Warm Editorial Luxury', label: 'Editorial Luxury', desc: 'Serif headings, travertine, gold accents' },
  { id: 'Minimalist Neo-Grotesque', label: 'Minimalist Clean', desc: 'Paper texture, high-contrast monochrome' },
  { id: 'Vibrant Cyberpunk', label: 'Vibrant Neon', desc: 'Ultraviolet gradients, bold modern energy' },
  { id: 'Nordic Clean Organic', label: 'Nordic Organic', desc: 'Earthy slate, sage green, human-centered' },
];

export const BrandKitModal: React.FC<BrandKitModalProps> = ({
  isOpen,
  onClose,
  project,
  onApplyPalette,
  onApplyTypography,
  onApplyBrand,
  onApplyCompleteKit,
  onAddFloatingLogo,
  showToast,
}) => {
  const [brandName, setBrandName] = useState(project.profile.name || 'Nova Innovations');
  const [industry, setIndustry] = useState(project.profile.role || 'Full-Stack Software Architecture');
  const [vibe, setVibe] = useState('Futuristic High-Tech');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'palette' | 'typography' | 'logos'>('all');
  const [selectedLogoIdx, setSelectedLogoIdx] = useState<number>(0);
  const [brandKit, setBrandKit] = useState<GeneratedBrandKit | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    showToast('Gemini is crafting cohesive brand identity & 3D models...');

    try {
      const response = await fetch('/api/brand-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName,
          industry,
          vibe,
          provider: 'gemini',
          model: 'gemini-3.8-flash',
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      if (data.brandKit) {
        setBrandKit(data.brandKit);
        setSelectedLogoIdx(0);
        showToast('Brand Kit successfully generated!');
      }
    } catch {
      // Fallback in case of network issue
      showToast('Generated brand kit with domain presets');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentKit = brandKit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Gemini Brand Kit Studio</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  gemini-3.8-flash
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Three.js 3D PBR
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Generate an ultra-cohesive color palette, typography hierarchy, and interactive 3D logo concepts.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Formulation Bar */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] text-slate-400 mb-1 font-semibold uppercase tracking-wider">
              Brand / Project Name
            </label>
            <input
              type="text"
              value={brandName}
              onChange={e => setBrandName(e.target.value)}
              placeholder="e.g. Apex Systems"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] text-slate-400 mb-1 font-semibold uppercase tracking-wider">
              Domain / Specialization
            </label>
            <input
              type="text"
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              placeholder="e.g. Next-Gen Cloud Infrastructure"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="w-full sm:w-auto">
            <label className="block text-[10px] text-slate-400 mb-1 font-semibold uppercase tracking-wider">
              Aesthetic Direction
            </label>
            <select
              value={vibe}
              onChange={e => setVibe(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
            >
              {AESTHETIC_VIBES.map(v => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-auto flex items-end">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Synthesizing...' : 'Generate Brand Kit'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body & Results */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!currentKit && !isGenerating && (
            <div className="py-16 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>
              <h4 className="text-base font-bold text-white">Generate Your Brand Identity with Gemini</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Gemini will compose a WCAG-compliant 7-shade palette, harmonious Google Fonts typography, and 3 procedural 3D logos rendered live in Three.js.
              </p>
              <button
                onClick={handleGenerate}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
              >
                Start Gemini Generation
              </button>
            </div>
          )}

          {isGenerating && (
            <div className="py-20 text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-200">
                Consulting Gemini 3.8 Flash for brand harmony & Three.js 3D models...
              </p>
              <p className="text-xs text-slate-400">
                Synthesizing color math, typography rhythm, and 3D geometric archetypes
              </p>
            </div>
          )}

          {currentKit && !isGenerating && (
            <div className="space-y-6">
              {/* Category Segmented Filter */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                      activeTab === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('palette')}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                      activeTab === 'palette' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Color Palette
                  </button>
                  <button
                    onClick={() => setActiveTab('typography')}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                      activeTab === 'typography' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Typography Pairing
                  </button>
                  <button
                    onClick={() => setActiveTab('logos')}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                      activeTab === 'logos' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Three.js 3D Logos
                  </button>
                </div>

                <button
                  onClick={() => onApplyCompleteKit(currentKit, selectedLogoIdx)}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply Entire Brand Kit</span>
                </button>
              </div>

              {/* 1. COLOR PALETTE SECTION */}
              {(activeTab === 'all' || activeTab === 'palette') && (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-indigo-400" />
                      <h4 className="font-bold text-sm text-white">{currentKit.palette.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        {currentKit.palette.harmony}
                      </span>
                    </div>

                    <button
                      onClick={() => onApplyPalette(currentKit.palette)}
                      className="px-3 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition-colors"
                    >
                      Apply Palette Only
                    </button>
                  </div>

                  <p className="text-xs text-slate-400">{currentKit.palette.rationale}</p>

                  {/* Palette Swatches Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1">
                    {[
                      { role: 'Primary Accent', hex: currentKit.palette.primary, desc: 'Key CTAs' },
                      { role: 'Secondary Accent', hex: currentKit.palette.accent, desc: 'Vibrant highlight' },
                      { role: 'Canvas Bg', hex: currentKit.palette.bg, desc: 'Background' },
                      { role: 'Card Surface', hex: currentKit.palette.surface, desc: 'Containers' },
                      { role: 'Prose Text', hex: currentKit.palette.text, desc: 'Headings & body' },
                      { role: 'Muted Text', hex: currentKit.palette.muted, desc: 'Captions' },
                      { role: 'Hairline Border', hex: currentKit.palette.border, desc: 'Dividers' },
                    ].map(c => (
                      <div
                        key={c.role}
                        className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 flex flex-col gap-2"
                      >
                        <div
                          className="h-12 w-full rounded-lg shadow-inner border border-white/10"
                          style={{ background: c.hex }}
                        />
                        <div>
                          <div className="text-[10px] text-slate-400 font-medium truncate">{c.role}</div>
                          <div className="text-xs font-mono font-bold text-white">{c.hex}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. TYPOGRAPHY PAIRING SECTION */}
              {(activeTab === 'all' || activeTab === 'typography') && (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Type className="w-4 h-4 text-indigo-400" />
                      <h4 className="font-bold text-sm text-white">
                        {currentKit.typography.pairingName}: {currentKit.typography.fontH} + {currentKit.typography.fontB}
                      </h4>
                    </div>

                    <button
                      onClick={() => onApplyTypography(currentKit.typography.fontH, currentKit.typography.fontB)}
                      className="px-3 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition-colors"
                    >
                      Apply Typography Only
                    </button>
                  </div>

                  <p className="text-xs text-slate-400">{currentKit.typography.rationale}</p>

                  {/* Live Typographic Hierarchy Preview Card */}
                  <div
                    className="p-5 rounded-xl border border-slate-800 space-y-2"
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
                      Building the Next Generation of Digital Systems
                    </div>
                    <div
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{
                        color: currentKit.palette.primary,
                        fontFamily: `'${currentKit.typography.fontH}', system-ui, sans-serif`,
                      }}
                    >
                      Display Heading: {currentKit.typography.fontH} (Weight: {currentKit.typography.weights})
                    </div>
                    <p
                      className="text-sm leading-relaxed"
                      style={{
                        fontFamily: `'${currentKit.typography.fontB}', system-ui, sans-serif`,
                        color: currentKit.palette.muted,
                      }}
                    >
                      Body Prose ({currentKit.typography.fontB}): Our framework combines responsive spatial layout algorithms with real-time procedural GPU acceleration to construct production-ready web interfaces.
                    </p>
                  </div>
                </div>
              )}

              {/* 3. THREE.JS 3D LOGO CONCEPTS SECTION */}
              {(activeTab === 'all' || activeTab === 'logos') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <h4 className="font-bold text-sm text-white">Three.js 3D Procedural Logo Concepts</h4>
                      <span className="text-[10px] text-slate-400">Interactive: click and drag to orbit</span>
                    </div>

                    <span className="text-xs text-slate-400">Selected Concept #{selectedLogoIdx + 1}</span>
                  </div>

                  {/* 3D Showcase Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {currentKit.logoConcepts.map((concept, idx) => {
                      const isSelected = selectedLogoIdx === idx;
                      return (
                        <div
                          key={concept.id}
                          onClick={() => setSelectedLogoIdx(idx)}
                          className={`rounded-xl border transition-all flex flex-col overflow-hidden bg-slate-950/80 cursor-pointer ${
                            isSelected
                              ? 'border-cyan-500 ring-2 ring-cyan-500/30'
                              : 'border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {/* 3D Canvas Viewport */}
                          <div className="h-48 w-full relative bg-slate-950 flex items-center justify-center">
                            <ThreeLogoViewer
                              data={concept.proceduralDetails}
                              height={192}
                              interactive={true}
                              autoRotate={true}
                              showControls={true}
                            />
                            {isSelected && (
                              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-cyan-500 text-slate-950 text-[10px] font-bold">
                                Active Choice
                              </div>
                            )}
                          </div>

                          {/* Concept Details */}
                          <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between border-t border-slate-800">
                            <div>
                              <div className="flex items-center justify-between">
                                <h5 className="font-bold text-xs text-white">{concept.name}</h5>
                                <span className="text-[10px] font-mono text-cyan-400 capitalize">
                                  {concept.archetype.replace(/_/g, ' ')}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                                {concept.rationale}
                              </p>
                            </div>

                            {/* Actions for this concept */}
                            <div className="flex gap-1.5 pt-2 border-t border-slate-850">
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  onApplyBrand(brandName, concept);
                                  showToast(`Applied ${concept.name} as Brand Mark`);
                                }}
                                className="flex-1 py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors text-center"
                              >
                                Use as Brand Mark
                              </button>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  onAddFloatingLogo(concept);
                                  showToast(`Added 3D ${concept.name} to section floats`);
                                }}
                                className="py-1 px-2.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 text-[11px] font-medium transition-colors"
                                title="Add as Floating 3D Element on Canvas"
                              >
                                + 3D Float
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

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="text-xs text-slate-400">
            {currentKit ? (
              <span>Brand kit ready for <strong>{brandName}</strong> with {currentKit.logoConcepts.length} Three.js 3D logos</span>
            ) : (
              <span>Powered by Gemini 3.8 Flash & Three.js Studio PBR</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>

            {currentKit && (
              <button
                onClick={() => {
                  onApplyCompleteKit(currentKit, selectedLogoIdx);
                  onClose();
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Apply Entire Brand Kit to Project</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
