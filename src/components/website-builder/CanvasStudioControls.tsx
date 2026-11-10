/**
 * CanvasStudioControls Component
 * Popover/Modal settings drawer to customize every aspect of the Google Stitch Background Canvas:
 * Pattern, Studio Theme, Grid Spacing, Grid Opacity, Frame Mockup Style, Corner Radius,
 * Shadow/Elevation, Canvas Padding, and Browser Mockup metadata.
 */
import React from 'react';
import {
  CanvasStudioConfig,
  CanvasPattern,
  FrameStyle,
  FrameShadow,
} from './builderTypes';
import { CANVAS_BACKDROP_PRESETS } from './builderDefaults';
import {
  CircleDot,
  Grid,
  Layers,
  Sparkles,
  Sliders,
  X,
  RotateCcw,
  Monitor,
  Smartphone,
  Tablet,
  Box,
  Eye,
  Check,
} from 'lucide-react';

interface CanvasStudioControlsProps {
  isOpen: boolean;
  onClose: () => void;
  config: CanvasStudioConfig;
  onChange: (updates: Partial<CanvasStudioConfig>) => void;
  onReset: () => void;
  primaryAccent: string;
}

const PATTERNS: { id: CanvasPattern; name: string; desc: string; icon: React.ElementType }[] = [
  { id: 'dots', name: 'Google Stitch Dots', desc: 'Minimalist high-precision dot matrix', icon: CircleDot },
  { id: 'grid', name: 'Technical Grid', desc: 'Drafting grid lines for alignment', icon: Grid },
  { id: 'blueprint', name: 'Blueprint Matrix', desc: 'Dual-frequency engineering grid', icon: Layers },
  { id: 'isometric', name: 'Isometric Grid', desc: '3D perspective matrix pattern', icon: Box },
  { id: 'glow', name: 'Studio Spotlight', desc: 'Radial studio vignette with ambient core', icon: Sparkles },
  { id: 'checker', name: 'Design Checker', desc: 'Transparency checkerboard tiles', icon: Sliders },
  { id: 'solid', name: 'Solid Studio', desc: 'Clean, distraction-free flat backdrop', icon: Eye },
];

const FRAME_STYLES: { id: FrameStyle; name: string; desc: string }[] = [
  { id: 'browser', name: 'Stitch Studio Window', desc: 'macOS window with address bar & traffic lights' },
  { id: 'device_bezel', name: 'Hardware Bezel', desc: 'Realistic MacBook / iPad / iPhone chassis' },
  { id: 'card', name: 'Floating Glass Card', desc: 'Sleek rounded card with illuminated rim' },
  { id: 'frameless', name: 'Frameless View', desc: 'Zero borders, edge-to-edge pure canvas' },
];

const SHADOW_STYLES: { id: FrameShadow; name: string; desc: string }[] = [
  { id: 'studio_3d', name: 'Studio 3D Elevation', desc: 'Multi-layer diffused studio drop shadow' },
  { id: 'ambient_glow', name: 'Neon Backlight', desc: 'Ambient illumination in site primary accent' },
  { id: 'soft', name: 'Soft Natural', desc: 'Subtle clean elevation' },
  { id: 'none', name: 'None (Flat)', desc: 'Zero shadow for flat architectural layout' },
];

export const CanvasStudioControls: React.FC<CanvasStudioControlsProps> = ({
  isOpen,
  onClose,
  config,
  onChange,
  onReset,
  primaryAccent,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden text-slate-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Google Stitch Canvas Studio
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Customizable Workbench
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Modify canvas backdrop, grid patterns, frame bezels, shadows, and viewport parameters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              className="p-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
              title="Reset to default Google Stitch canvas configuration"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Section 1: Canvas Patterns */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              Canvas Background Pattern
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PATTERNS.map(p => {
                const Icon = p.icon;
                const isSelected = config.pattern === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onChange({ pattern: p.id })}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{p.name}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-1">{p.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Studio Backdrop Colors */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              Studio Canvas Backdrop Color
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {CANVAS_BACKDROP_PRESETS.map(preset => {
                const isSelected = config.bgColor.toLowerCase() === preset.color.toLowerCase();
                return (
                  <button
                    key={preset.id}
                    onClick={() => onChange({ bgColor: preset.color })}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/50 bg-slate-800'
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg border border-white/10 shadow-inner"
                      style={{ backgroundColor: preset.color }}
                    />
                    <span className="text-[10px] font-medium text-slate-300">{preset.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom HEX Picker */}
            <div className="mt-3 flex items-center gap-3 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
              <input
                type="color"
                value={config.bgColor}
                onChange={e => onChange({ bgColor: e.target.value })}
                className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer p-0"
              />
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Custom Studio Backdrop</div>
                  <div className="text-[10px] text-slate-400">Pick any custom HEX color for canvas workbench</div>
                </div>
                <span className="font-mono text-xs px-2 py-1 rounded bg-slate-800 text-indigo-300">
                  {config.bgColor}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Grid Geometry & Density Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-850">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Grid Sizing / Spacing</span>
                <span className="font-mono text-indigo-300">{config.gridSize}px</span>
              </div>
              <input
                type="range"
                min="12"
                max="64"
                step="2"
                value={config.gridSize}
                onChange={e => onChange({ gridSize: parseInt(e.target.value) })}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>12px (Dense)</span>
                <span>32px</span>
                <span>64px (Expansive)</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Grid Contrast / Opacity</span>
                <span className="font-mono text-indigo-300">{Math.round(config.gridOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.02"
                max="0.4"
                step="0.02"
                value={config.gridOpacity}
                onChange={e => onChange({ gridOpacity: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>2% (Subtle)</span>
                <span>20%</span>
                <span>40% (Bold)</span>
              </div>
            </div>
          </div>

          {/* Section 4: Frame / Bezel Mockup Style */}
          <div className="space-y-3 pt-2 border-t border-slate-850">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Viewport Frame / Bezel Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FRAME_STYLES.map(f => {
                const isSelected = config.frameStyle === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => onChange({ frameStyle: f.id })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-semibold flex items-center justify-between">
                      <span>{f.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{f.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Corner Radius & Frame Shadow Elevation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-850">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Frame Corner Radius</span>
                <span className="font-mono text-indigo-300">{config.frameRadius}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="44"
                step="4"
                value={config.frameRadius}
                onChange={e => onChange({ frameRadius: parseInt(e.target.value) })}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0px (Sharp)</span>
                <span>16px (Standard)</span>
                <span>44px (Device Curve)</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs text-slate-400">Shadow & Elevation</label>
              <select
                value={config.shadow}
                onChange={e => onChange({ shadow: e.target.value as FrameShadow })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
              >
                {SHADOW_STYLES.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} - {s.desc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 6: Browser Mockup Metadata & Canvas Padding */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-850">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-semibold uppercase">
                Mockup Browser URL
              </label>
              <input
                type="text"
                value={config.browserUrl}
                onChange={e => onChange({ browserUrl: e.target.value })}
                placeholder="https://preview.sitecraft.dev"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-indigo-300 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-semibold uppercase">
                Canvas Padding Around Viewport
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['tight', 'normal', 'spacious'] as const).map(pad => (
                  <button
                    key={pad}
                    onClick={() => onChange({ canvasPadding: pad })}
                    className={`py-2 px-1 rounded-lg border text-xs capitalize text-center transition-all ${
                      config.canvasPadding === pad
                        ? 'border-indigo-500 bg-indigo-950/40 text-white font-semibold'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {pad}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Settings automatically persist in local storage.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-all"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
