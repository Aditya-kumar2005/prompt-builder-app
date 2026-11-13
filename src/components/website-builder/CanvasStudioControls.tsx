/**
 * CanvasStudioControls Component
 * Modal drawer to customize background canvas patterns, backdrop colors, grid geometry,
 * bezel styles, corner radius, shadow depth, padding, and preview browser URL.
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
  Box,
  Check,
  CircleDot,
  Eye,
  Grid,
  Layers,
  RotateCcw,
  Sliders,
  Sparkles,
  X,
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
  { id: 'dots', name: 'Stitch Dot Matrix', desc: 'Crisp subtle grid points', icon: CircleDot },
  { id: 'grid', name: 'Drafting Grid', desc: 'Technical alignment lines', icon: Grid },
  { id: 'blueprint', name: 'Blueprint Matrix', desc: 'Dual-step engineering grid', icon: Layers },
  { id: 'isometric', name: 'Isometric Mesh', desc: 'Angled perspective grid', icon: Box },
  { id: 'glow', name: 'Radial Spotlight', desc: 'Ambient vignette core', icon: Sparkles },
  { id: 'checker', name: 'Transparency Tile', desc: 'Alpha checker pattern', icon: Sliders },
  { id: 'solid', name: 'Solid Surface', desc: 'Flat neutral backdrop', icon: Eye },
];

const FRAME_STYLES: { id: FrameStyle; name: string; desc: string }[] = [
  { id: 'browser', name: 'Browser Window', desc: 'Minimal frame with custom URL bar' },
  { id: 'device_bezel', name: 'Device Bezel', desc: 'Viewport frame chrome on mobile/tablet' },
  { id: 'card', name: 'Elevated Frame', desc: 'Crisp hairline border container' },
  { id: 'frameless', name: 'Frameless', desc: 'Pure borderless canvas edges' },
];

const SHADOW_STYLES: { id: FrameShadow; name: string; desc: string }[] = [
  { id: 'studio_3d', name: 'Deep Elevation', desc: 'Diffused multi-layer studio shadow' },
  { id: 'ambient_glow', name: 'Accent Backlight', desc: 'Subtle tint in active primary color' },
  { id: 'soft', name: 'Soft Shadow', desc: 'Balanced daylight depth' },
  { id: 'none', name: 'Flat (None)', desc: 'Zero shadow for crisp edges' },
];

export const CanvasStudioControls: React.FC<CanvasStudioControlsProps> = ({
  isOpen,
  onClose,
  config,
  onChange,
  onReset,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden text-zinc-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-blue-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                Canvas Workbench Settings
              </h2>
              <p className="text-[11px] text-zinc-400">
                Customize backdrop surface, dot/grid geometry, bezel frame, and elevation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onReset}
              className="px-2.5 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors border border-zinc-800 cursor-pointer"
              title="Reset canvas settings"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* 1. Patterns */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-2">
              Canvas Pattern
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PATTERNS.map(p => {
                const Icon = p.icon;
                const isSelected = config.pattern === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onChange({ pattern: p.id })}
                    className={`p-3 rounded-lg border text-left transition-colors flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-zinc-950 text-white'
                        : 'border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-zinc-500'}`} />
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                    <div>
                      <div className="text-xs font-medium">{p.name}</div>
                      <div className="text-[10px] text-zinc-500 line-clamp-1">{p.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Backdrop Colors */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-2">
              Backdrop Color
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {CANVAS_BACKDROP_PRESETS.map(preset => {
                const isSelected = config.bgColor.toLowerCase() === preset.color.toLowerCase();
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onChange({ bgColor: preset.color })}
                    className={`p-2 rounded-lg border flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-zinc-800'
                        : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded border border-white/15"
                      style={{ backgroundColor: preset.color }}
                    />
                    <span className="text-[10px] font-medium text-zinc-300">{preset.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center gap-3 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <input
                type="color"
                value={config.bgColor}
                onChange={e => onChange({ bgColor: e.target.value })}
                className="w-8 h-8 rounded bg-transparent border-0 cursor-pointer p-0"
              />
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-white">Custom Backdrop</div>
                  <div className="text-[10px] text-zinc-400">Any hex color behind the preview viewport</div>
                </div>
                <span className="font-mono text-xs px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 tabular-nums">
                  {config.bgColor}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Grid Geometry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-800">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Grid Spacing</span>
                <span className="font-mono text-zinc-200 tabular-nums">{config.gridSize}px</span>
              </div>
              <input
                type="range"
                min="12"
                max="64"
                step="2"
                value={config.gridSize}
                onChange={e => onChange({ gridSize: parseInt(e.target.value) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Grid Opacity</span>
                <span className="font-mono text-zinc-200 tabular-nums">{Math.round(config.gridOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.02"
                max="0.4"
                step="0.02"
                value={config.gridOpacity}
                onChange={e => onChange({ gridOpacity: parseFloat(e.target.value) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          {/* 4. Bezel Style */}
          <div className="space-y-2.5 pt-3 border-t border-zinc-800">
            <label className="block text-xs font-medium text-zinc-300">
              Viewport Frame
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FRAME_STYLES.map(f => {
                const isSelected = config.frameStyle === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onChange({ frameStyle: f.id })}
                    className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-zinc-950 text-white'
                        : 'border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="text-xs font-medium flex items-center justify-between">
                      <span>{f.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">{f.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Radius & Elevation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-800">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Frame Corner Radius</span>
                <span className="font-mono text-zinc-200 tabular-nums">{config.frameRadius}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="44"
                step="4"
                value={config.frameRadius}
                onChange={e => onChange({ frameRadius: parseInt(e.target.value) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs text-zinc-400">Elevation Shadow</label>
              <select
                value={config.shadow}
                onChange={e => onChange({ shadow: e.target.value as FrameShadow })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2 text-xs text-white"
              >
                {SHADOW_STYLES.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.desc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 6. URL & Padding */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-800">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">
                Mockup Browser URL
              </label>
              <input
                type="text"
                value={config.browserUrl}
                onChange={e => onChange({ browserUrl: e.target.value })}
                placeholder="https://preview.sitecraft.dev"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2 text-xs text-zinc-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">
                Workspace Padding
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['tight', 'normal', 'spacious'] as const).map(pad => (
                  <button
                    key={pad}
                    type="button"
                    onClick={() => onChange({ canvasPadding: pad })}
                    className={`py-2 px-1 rounded-md border text-xs capitalize text-center transition-colors cursor-pointer ${
                      config.canvasPadding === pad
                        ? 'border-blue-500 bg-zinc-950 text-white font-medium'
                        : 'border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:text-zinc-200'
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
        <div className="px-5 py-3.5 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">
            Saved automatically to local browser storage.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
