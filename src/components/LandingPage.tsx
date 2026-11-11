/**
 * LandingPage Component
 * High-converting, interactive landing page explaining what SiteCraft Studio is,
 * why users should use it, key value propositions, live feature showcases, and quick start launchpads.
 */
import React from 'react';
import {
  Sparkles,
  Globe,
  Wand2,
  Palette,
  LayoutTemplate,
  Layers,
  ArrowRight,
  Download,
  Code2,
  Cpu,
  CheckCircle2,
  ShieldCheck,
  Eye,
  Sliders,
  Maximize2,
  ExternalLink,
  Laptop,
  Smartphone,
  Tablet,
  Box,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: 'home' | 'builder' | 'prompt_builder' | 'settings') => void;
  hasApiKeys: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, hasApiKeys }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 select-text">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-900">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-purple-600/20 via-indigo-600/10 to-transparent blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-semibold shadow-sm animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>THE ALL-IN-ONE AI WEB BUILDER & PROMPT STUDIO</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Build Live Responsive Websites.{' '}
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              Engineer Elite AI Prompts.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-sm sm:text-base lg:text-lg text-slate-400 leading-relaxed">
            SiteCraft Studio merges an interactive <span className="text-white font-medium">Google Stitch canvas website builder</span>,
            procedural <span className="text-indigo-300 font-medium">Three.js 3D brand marks</span>, and a comprehensive
            <span className="text-purple-300 font-medium"> Multi-Engine Prompt Engineering Suite</span> for Midjourney, DALL-E, Flux, Claude, and Gemini.
          </p>

          {/* Call-to-action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('builder')}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 flex items-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Globe className="w-4 h-4" />
              <span>Launch Website Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('prompt_builder')}
              className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 hover:border-purple-500/50 font-semibold text-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <Wand2 className="w-4 h-4 text-purple-400" />
              <span>Open Prompt Studio</span>
            </button>

            {!hasApiKeys && (
              <button
                onClick={() => onNavigate('settings')}
                className="px-4 py-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 border border-slate-800 text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>AI Providers</span>
              </button>
            )}
          </div>

          {/* Quick value badges */}
          <div className="flex flex-wrap justify-center items-center gap-6 pt-6 text-xs text-slate-400 font-medium border-t border-slate-900/80">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero-code live editing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Three.js 3D Procedural Logos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Google Stitch Workbench Canvas</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Single-File HTML Export</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Studio Mockup Banner */}
        <div className="max-w-5xl mx-auto mt-12 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-2 shadow-2xl backdrop-blur-md">
          {/* Mockup macOS Window Titlebar */}
          <div className="bg-slate-950 px-4 py-2.5 rounded-t-xl border-b border-slate-850 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
              <span className="text-xs font-mono text-slate-400 ml-2">sitecraft.dev/live-studio</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span className="px-2 py-0.5 rounded bg-slate-900 text-indigo-400 border border-slate-800">
                1280 × 800 (Desktop)
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30">
                Google Stitch Canvas
              </span>
            </div>
          </div>

          {/* Mockup Viewport Body */}
          <div
            className="p-6 sm:p-10 rounded-b-xl flex flex-col md:flex-row items-center justify-between gap-8"
            style={{
              backgroundColor: '#090d16',
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1.5px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          >
            {/* Left simulated live site card */}
            <div className="flex-1 bg-slate-900/95 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                    ✦
                  </div>
                  <span className="font-bold text-sm text-white">Nova Systems</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Live Editable
                </span>
              </div>
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                  Next-Gen Cloud Architecture
                </div>
                <h3 className="text-xl font-bold text-white">
                  Intelligent systems built for hyper-scale agility.
                </h3>
                <p className="text-xs text-slate-400">
                  Experience instantaneous deployment and dynamic visual components with in-place text updates and real-time canvas preview.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => onNavigate('builder')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                >
                  Edit in Studio →
                </button>
                <span className="text-[11px] text-slate-500 font-mono">10+ Layout Archetypes</span>
              </div>
            </div>

            {/* Right simulated 3D brand logo & prompt engine teaser */}
            <div className="w-full md:w-80 space-y-3">
              <div className="bg-slate-900/90 border border-purple-500/30 rounded-xl p-4 shadow-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-purple-400" />
                    Three.js 3D Brand Mark
                  </span>
                  <span className="text-[10px] font-mono text-purple-300">PBR Studio</span>
                </div>
                <div className="h-28 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center relative overflow-hidden group">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 rotate-12 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-purple-600/50 group-hover:rotate-45 transition-transform duration-500">
                    ✦
                  </div>
                  <div className="absolute bottom-2 left-2 text-[9px] font-mono text-slate-500">
                    Orbit &amp; Deconstruct Controls
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
                <div className="font-bold text-white flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                    Prompt Studio Engine
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">Ready</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono line-clamp-1">
                  Midjourney v6.1 • DALL-E 3 • Flux.1 • Canva
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHY SITECRAFT STUDIO? (CORE VALUE PILLARS) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-widest text-indigo-400">
            Why Professionals &amp; Creators Use SiteCraft
          </h2>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
            Everything You Need To Create, Validate &amp; Deploy
          </h3>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-400">
            Traditional website builders lock you into closed platforms. Standalone prompt tools give you weak text.
            SiteCraft bridges both with real code export and production-grade AI models.
          </p>
        </div>

        {/* 5 Core Feature Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Google Stitch Canvas */}
          <div className="bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 space-y-3 transition-all hover:shadow-xl hover:shadow-indigo-600/10">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Google Stitch Background Canvas</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Work on an infinite studio workbench with customizable patterns: Google Stitch dots, drafting grid, blueprint lines, isometric matrix, or spotlight glow.
              Full zoom from 25% to 200% with hardware bezel mockups (iPhone 16 Pro Dynamic Island &amp; MacBook).
            </p>
          </div>

          {/* Card 2: AI Brand Kit & 3D Three.js Logos */}
          <div className="bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-6 space-y-3 transition-all hover:shadow-xl hover:shadow-purple-600/10">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Box className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Gemini 3.8 Flash 3D Brand Kit</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate cohesive 7-color palettes (WCAG AA compliant), Google font pairings, and 3 distinct procedural Three.js 3D logo concepts.
              Inspect models with smooth orbit damping, studio PBR lighting, and an interactive Deconstruct Explode slider.
            </p>
          </div>

          {/* Card 3: Unified Layout Templates */}
          <div className="bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 space-y-3 transition-all hover:shadow-xl hover:shadow-cyan-600/10">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Merged Template Studio</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Seamlessly switch between 10+ pre-designed responsive layouts: Web Developer Portfolio, SaaS Landing, Enterprise Systems, UI/UX Agency, and Minimal Portals.
              Add, rearrange, duplicate, and customize sections with in-place text editing.
            </p>
          </div>

          {/* Card 4: Dedicated Visual Image Prompt App */}
          <div className="bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-6 space-y-3 transition-all hover:shadow-xl hover:shadow-purple-600/10">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Palette className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Visual Image Prompt Studio</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate 4-way prompt expansions tailored for Midjourney v6.1 (with --ar and --s flags), DALL-E 3, Flux.1, and Canva.
              Includes 12 art styles, camera optics, lighting atmospheres, negative prompt filters, and 1-click bulk export (.TXT / .MD / .JSON).
            </p>
          </div>

          {/* Card 5: Multi-Engine Universal Prompt Doctor */}
          <div className="bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 space-y-3 transition-all hover:shadow-xl hover:shadow-emerald-600/10">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Wand2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Multi-Engine Prompt Doctor</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Turn vague ideas into structured prompts with XML guardrails, System Role Architectures, Chain-of-Thought scratchpads, and Clean TypeScript coders.
              Test run outputs live with Gemini, Claude, or OpenAI.
            </p>
          </div>

          {/* Card 6: Standalone Single-File Export */}
          <div className="bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 space-y-3 transition-all hover:shadow-xl hover:shadow-amber-600/10">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Download className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Zero Vendor Lock-In Export</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export your finished site as a clean, standalone, single-file <code className="text-amber-300">index.html</code> with all CSS variables, typography, and interactive FX runtime inlined.
              Host on GitHub Pages, Vercel, Netlify, or standard servers without build steps.
            </p>
          </div>
        </div>
      </section>

      {/* 3. WHO IS SITECRAFT FOR? */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/40 border-y border-slate-900">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-widest text-purple-400">Target Audiences</h3>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Crafted For High-Speed Modern Workflows</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-850 space-y-3">
              <span className="text-2xl">⚡</span>
              <h4 className="text-sm font-bold text-white">Founders &amp; Indie Hackers</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Go from product concept to live responsive website with cohesive brand palettes and 3D marks in under 10 minutes.
              </p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-850 space-y-3">
              <span className="text-2xl">🎨</span>
              <h4 className="text-sm font-bold text-white">Designers &amp; Art Directors</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate high-resolution image prompts with exact camera focal lengths, lighting atmospheres, and aspect ratios for Midjourney and Canva.
              </p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-850 space-y-3">
              <span className="text-2xl">💻</span>
              <h4 className="text-sm font-bold text-white">Engineers &amp; Developers</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Export portable HTML code without bloated external frameworks or proprietary build lock-in. Full TypeScript and Tailwind v4 compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. QUICK ACTION LAUNCHPAD */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-950/70 via-purple-950/50 to-slate-900 border border-indigo-500/40 rounded-3xl p-8 sm:p-12 shadow-2xl text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Ready to Start Building?
          </h2>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-300 leading-relaxed">
            Choose your starting workflow below. Everything runs seamlessly in your browser with zero setup required.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-2">
            <button
              onClick={() => onNavigate('builder')}
              className="p-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg flex flex-col items-center gap-2 transition-all cursor-pointer"
            >
              <Globe className="w-5 h-5" />
              <span>Launch Website Studio</span>
              <span className="text-[10px] text-indigo-200 font-normal">Live builder + templates</span>
            </button>

            <button
              onClick={() => onNavigate('prompt_builder')}
              className="p-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg flex flex-col items-center gap-2 transition-all cursor-pointer"
            >
              <Palette className="w-5 h-5" />
              <span>Image Prompt Generator</span>
              <span className="text-[10px] text-purple-200 font-normal">Midjourney • DALL-E • Flux</span>
            </button>

            <button
              onClick={() => onNavigate('settings')}
              className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 font-semibold text-xs flex flex-col items-center gap-2 transition-all cursor-pointer"
            >
              <Cpu className="w-5 h-5 text-indigo-400" />
              <span>Configure AI Settings</span>
              <span className="text-[10px] text-slate-400 font-normal">Gemini, Claude &amp; OpenAI</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="border-t border-slate-900 py-8 px-4 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-2 font-semibold text-slate-400">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>SiteCraft Studio</span>
          <span>•</span>
          <span>Google AI Studio Build Edition</span>
        </div>
        <p>Built with React, TypeScript, Tailwind CSS, Three.js, and Gemini 3.8 Flash.</p>
      </footer>
    </div>
  );
};
