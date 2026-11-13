/**
 * LandingPage Component
 * Clean editorial product landing page built around the 60-30-10 obsidian workbench aesthetic.
 */
import React, { useState } from 'react';
import {
  ArrowRight,
  Globe,
  Wand2,
  Sliders,
  Box,
  Download,
  Palette,
} from 'lucide-react';
import heroWorkbenchImg from '../assets/images/studio_workbench_hero_1794540118773.jpg';

interface LandingPageProps {
  onNavigate: (view: 'home' | 'builder' | 'prompt_builder' | 'settings') => void;
  hasApiKeys: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, hasApiKeys }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-950 text-zinc-100 select-text">
      {/* 1. HERO SECTION */}
      <section className="border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            {/* Left Copy Column */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 font-mono">
                  <span>Visual Web Builder</span>
                  <span aria-hidden="true">·</span>
                  <span>Prompt Architecture</span>
                  <span aria-hidden="true">·</span>
                  <span>Single-File Export</span>
                </div>

                <h1
                  className="font-display font-bold tracking-tight text-zinc-50 leading-[1.08]"
                  style={{
                    fontSize: 'clamp(2.25rem, 4vw, 3.5rem)',
                    textWrap: 'balance',
                  }}
                >
                  Build responsive websites and structured AI prompts in one studio.
                </h1>

                <p className="text-base text-zinc-400 leading-relaxed max-w-xl">
                  Edit live sections directly on a customizable canvas, generate 3D brand marks and WCAG-compliant color systems, refine prompts across Gemini, Claude, and OpenAI, and export clean standalone HTML without platform lock-in.
                </p>

                {/* Primary & Secondary Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('builder')}
                    className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Open Website Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('prompt_builder')}
                    className="px-5 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 font-medium text-sm transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Wand2 className="w-4 h-4 text-zinc-400" />
                    <span>Prompt Studio</span>
                  </button>

                  {!hasApiKeys && (
                    <button
                      type="button"
                      onClick={() => onNavigate('settings')}
                      className="px-3 py-2.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 underline underline-offset-4 cursor-pointer whitespace-nowrap"
                    >
                      Add API Keys
                    </button>
                  )}
                </div>
              </div>

              {/* Grounded Spec Strip (Tabular Numerals) */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-zinc-900">
                <div>
                  <div className="font-mono text-xl font-semibold text-zinc-100 tabular-nums">10+</div>
                  <div className="text-xs text-zinc-400 mt-0.5">Layout archetypes</div>
                </div>
                <div>
                  <div className="font-mono text-xl font-semibold text-zinc-100 tabular-nums">3 Engines</div>
                  <div className="text-xs text-zinc-400 mt-0.5">Gemini, Claude, OpenAI</div>
                </div>
                <div>
                  <div className="font-mono text-xl font-semibold text-zinc-100 tabular-nums">1 File</div>
                  <div className="text-xs text-zinc-400 mt-0.5">Portable HTML export</div>
                </div>
              </div>
            </div>

            {/* Right Visual Carrier Column */}
            <div className="lg:col-span-6 flex flex-col">
              <div className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden flex flex-col">
                <div className="relative flex-1 min-h-[280px] lg:min-h-[380px] bg-zinc-900">
                  {!imgError ? (
                    <img
                      src={heroWorkbenchImg}
                      alt="Minimalist studio display showing layout grid geometry beside anodized mechanical dial and calipers"
                      referrerPolicy="no-referrer"
                      onError={() => setImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-zinc-900">
                      <Box className="w-10 h-10 text-zinc-600 mb-3" />
                      <p className="text-sm font-medium text-zinc-300">SiteCraft Studio Workbench</p>
                      <p className="text-xs text-zinc-500 mt-1">Responsive layout grids and procedural 3D tooling</p>
                    </div>
                  )}
                </div>
                <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between text-xs text-zinc-400 font-mono">
                  <span>Responsive Canvas · 1280 / 768 / 390</span>
                  <button
                    type="button"
                    onClick={() => onNavigate('builder')}
                    className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Launch editor →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE WORKSPACE CAPABILITIES (Editorial 01-04 Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="max-w-2xl mb-12 space-y-2">
          <p className="text-xs font-mono text-zinc-400">Architecture</p>
          <h2
            className="font-display font-bold tracking-tight text-zinc-50"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', textWrap: 'balance' }}
          >
            Four integrated tools built to ship real pages and tested prompts.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Capability 01 — Featured Wide */}
          <div className="md:col-span-7 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>01. Website &amp; Layout Studio</span>
                <Sliders className="w-4 h-4 text-zinc-500" />
              </div>
              <h3 className="font-display text-xl font-semibold text-zinc-50">
                Customizable Stitch Canvas &amp; In-Place Editing
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
                Switch effortlessly between 10+ responsive blueprints, click any headline or paragraph on the canvas to edit directly, test mobile and tablet hardware frames, and toggle between dots, blueprint grids, isometric matrices, and custom studio backdrops.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <span className="font-mono">Zoom 40%–200% · Undo/Redo History</span>
              <button
                type="button"
                onClick={() => onNavigate('builder')}
                className="text-zinc-200 hover:text-white font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Open Builder</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Capability 02 */}
          <div className="md:col-span-5 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>02. Identity &amp; 3D Marks</span>
                <Box className="w-4 h-4 text-zinc-500" />
              </div>
              <h3 className="font-display text-xl font-semibold text-zinc-50">
                Brand Kit &amp; Procedural Three.js Logos
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Generate 7-shade WCAG AA palettes, Google Fonts pairings, and interactive 3D PBR logo geometry that can be orbited, exploded, and dropped straight onto your page sections.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-800/80 text-xs font-mono text-zinc-400">
              Studio PBR Materials · Explode Inspector
            </div>
          </div>

          {/* Capability 03 */}
          <div className="md:col-span-5 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>03. Prompt Workbench</span>
                <Wand2 className="w-4 h-4 text-zinc-500" />
              </div>
              <h3 className="font-display text-xl font-semibold text-zinc-50">
                Multi-Model Prompt Doctor &amp; Runner
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Convert rough notes into structured prompts using XML delimiters, Role-Task-Constraint schemas, and parameterized variables—then execute live against Gemini, Claude, or OpenAI.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <span className="font-mono">Live Execution · Local Bookmarks</span>
              <button
                type="button"
                onClick={() => onNavigate('prompt_builder')}
                className="text-zinc-200 hover:text-white font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Open Workbench</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Capability 04 — Featured Wide */}
          <div className="md:col-span-7 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>04. Visual Image Prompts &amp; Export</span>
                <Palette className="w-4 h-4 text-zinc-500" />
              </div>
              <h3 className="font-display text-xl font-semibold text-zinc-50">
                4-Way Visual Prompt Expansion &amp; Portable HTML
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
                Specify lens focal length, lighting atmosphere, color grade, and negative exclusions to generate four distinct prompts formatted for Midjourney, DALL-E 3, Flux.1, or Canva—plus 1-click batch export to TXT, Markdown, or JSON.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <span className="font-mono">Midjourney Flags · Standalone index.html</span>
              <button
                type="button"
                onClick={() => onNavigate('settings')}
                className="text-zinc-200 hover:text-white font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Configure Keys</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WORKFLOW MATRIX */}
      <section className="border-y border-zinc-900 bg-zinc-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2 border-t border-zinc-800 pt-5">
              <div className="text-xs font-mono text-zinc-500">Founders &amp; Solo Builders</div>
              <h3 className="font-display text-base font-semibold text-zinc-100">
                From Idea to Shipped Page
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Pick a structural archetype, customize sections inline, sync real GitHub repositories, and download a single portable HTML file ready for Vercel or Netlify.
              </p>
            </div>

            <div className="space-y-2 border-t border-zinc-800 pt-5">
              <div className="text-xs font-mono text-zinc-500">Designers &amp; Art Directors</div>
              <h3 className="font-display text-base font-semibold text-zinc-100">
                Consistent Visual Direction
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Test contrast palettes and Google Font pairings live, inspect interactive 3D geometry, and export batch image prompt sheets with exact camera optics.
              </p>
            </div>

            <div className="space-y-2 border-t border-zinc-800 pt-5">
              <div className="text-xs font-mono text-zinc-500">Engineers &amp; Technical Writers</div>
              <h3 className="font-display text-base font-semibold text-zinc-100">
                Multi-Model Prompt Testing
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Bring your own Gemini, Anthropic Claude, or OpenAI keys stored strictly in browser localStorage and verify prompt outputs with real latency readouts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BOTTOM ACTION BAND */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="border border-zinc-800 bg-zinc-900/40 rounded-xl p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h2 className="font-display text-2xl font-bold text-zinc-50">
              Start in the studio right away
            </h2>
            <p className="text-sm text-zinc-400">
              Open the responsive website builder immediately, or connect your API keys in Settings to enable multi-model generation.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('builder')}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Launch Website Studio</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('settings')}
              className="px-4 py-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-900 text-zinc-200 border border-zinc-800 font-medium text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              AI Settings
            </button>
          </div>
        </div>
      </section>

      {/* 5. QUIET FOOTER */}
      <footer className="border-t border-zinc-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="font-display font-semibold text-zinc-300">SiteCraft</span>
            <span aria-hidden="true">·</span>
            <span>Website Builder &amp; Prompt Workbench</span>
          </div>
          <div className="flex items-center gap-6">
            <button type="button" onClick={() => onNavigate('builder')} className="hover:text-zinc-300 cursor-pointer">
              Website Studio
            </button>
            <button type="button" onClick={() => onNavigate('prompt_builder')} className="hover:text-zinc-300 cursor-pointer">
              Prompt Studio
            </button>
            <button type="button" onClick={() => onNavigate('settings')} className="hover:text-zinc-300 cursor-pointer">
              Settings
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
