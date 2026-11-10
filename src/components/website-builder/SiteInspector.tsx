/**
 * SiteInspector Component
 * Right sidebar inspector: Section properties, layout variant, dynamic fields/lists,
 * GitHub repo fetcher, motion/FX, and global Design System styling.
 */
import React, { useState } from 'react';
import {
  FloatingElement,
  Palette,
  SiteProject,
  SiteSection,
} from './builderTypes';
import {
  GOOGLE_FONTS,
  PALETTES,
  SECTION_META,
  getPalette,
} from './builderDefaults';
import {
  FolderGit2,
  MousePointer,
  Palette as PaletteIcon,
  Plus,
  Sliders,
  Sparkles,
  Trash2,
  Type,
} from 'lucide-react';

interface SiteInspectorProps {
  project: SiteProject;
  selectedSectionId: string | null;
  selectedFloatId: string | null;
  onUpdateProject: (updater: (prev: SiteProject) => SiteProject) => void;
  onSelectFloat: (id: string | null) => void;
}

type RightTab = 'section' | 'design';

export const SiteInspector: React.FC<SiteInspectorProps> = ({
  project,
  selectedSectionId,
  selectedFloatId,
  onUpdateProject,
  onSelectFloat,
}) => {
  const [activeTab, setActiveTab] = useState<RightTab>('section');
  const [ghLoading, setGhLoading] = useState(false);
  const [ghError, setGhError] = useState<string | null>(null);

  const activeSection = project.sections.find(s => s.id === selectedSectionId) || project.sections[0];
  const activeFloat = activeSection?.floats?.find(f => f.id === selectedFloatId);
  const sectionMeta = activeSection ? SECTION_META[activeSection.type] : null;

  // Update active section
  const updateActiveSection = (updater: (sec: SiteSection) => SiteSection) => {
    if (!activeSection) return;
    onUpdateProject(prev => ({
      ...prev,
      sections: prev.sections.map(s => (s.id === activeSection.id ? updater(s) : s)),
    }));
  };

  // GitHub public repo fetcher
  const handleFetchGitHubRepos = async (username: string) => {
    if (!username.trim()) return;
    setGhLoading(true);
    setGhError(null);

    try {
      const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=12`);
      if (!res.ok) {
        throw new Error('User not found or rate limited');
      }
      const data = await res.json();
      const repos = data.slice(0, activeSection.data.count || 4).map((r: any) => ({
        name: r.name,
        description: r.description || 'Public repository',
        stars: r.stargazers_count,
        language: r.language || 'Code',
        url: r.html_url,
      }));

      updateActiveSection(s => ({
        ...s,
        data: {
          ...s.data,
          username,
          items: repos,
        },
      }));
    } catch (err: any) {
      setGhError(err.message || 'Failed to fetch repos');
    } finally {
      setGhLoading(false);
    }
  };

  // Add floating element
  const handleAddFloat = (kind: FloatingElement['kind']) => {
    if (!activeSection) return;
    const newFloat: FloatingElement = {
      id: `fl_${kind}_${Math.random().toString(36).slice(2, 7)}`,
      kind,
      x: 35,
      y: 30,
      w: kind === 'btn' ? 140 : kind === 'text' ? 160 : 80,
      h: kind === 'shape' ? 80 : undefined,
      motion: 'float',
      hover: 'lift',
      text: kind === 'text' ? 'Interactive Badge' : undefined,
      label: kind === 'btn' ? 'Explore More' : undefined,
      shape: kind === 'shape' ? 'circle' : undefined,
      fill: 'var(--primary)',
      sceneKind: kind === 'scene' ? 'particles' : undefined,
    };

    updateActiveSection(s => ({
      ...s,
      floats: [...(s.floats || []), newFloat],
    }));
    onSelectFloat(newFloat.id);
  };

  return (
    <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full min-h-0 text-slate-200">
      {/* Tab Switcher */}
      <div className="grid grid-cols-2 p-2 gap-1 border-b border-slate-800 bg-slate-950/60 text-xs">
        <button
          onClick={() => setActiveTab('section')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'section'
              ? 'bg-indigo-600/20 text-indigo-400 font-semibold border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Section Inspector</span>
        </button>

        <button
          onClick={() => setActiveTab('design')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'design'
              ? 'bg-indigo-600/20 text-indigo-400 font-semibold border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <PaletteIcon className="w-3.5 h-3.5" />
          <span>Global Design</span>
        </button>
      </div>

      {/* Pane Content */}
      <div className="flex-1 overflow-y-auto p-3 text-xs space-y-4">
        {/* TAB 1: SECTION PROPERTIES */}
        {activeTab === 'section' && activeSection && (
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">{sectionMeta?.icon}</span>
                <div>
                  <h4 className="font-bold text-slate-200 capitalize">{activeSection.type}</h4>
                  <span className="text-[10px] text-slate-400">ID: {activeSection.id}</span>
                </div>
              </div>
            </div>

            {/* Layout Variant */}
            {sectionMeta && sectionMeta.variants.length > 1 && (
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-semibold uppercase tracking-wider">
                  Layout Variant
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {sectionMeta.variants.map(variant => (
                    <button
                      key={variant}
                      onClick={() => updateActiveSection(s => ({ ...s, variant }))}
                      className={`p-1.5 rounded-lg border text-center capitalize transition-all ${
                        activeSection.variant === variant
                          ? 'bg-indigo-600/30 border-indigo-500 text-white font-semibold'
                          : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {variant}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Background Style & Padding */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-semibold uppercase tracking-wider">
                  Background
                </label>
                <select
                  value={activeSection.style.bg || 'default'}
                  onChange={e =>
                    updateActiveSection(s => ({
                      ...s,
                      style: { ...s.style, bg: e.target.value as any },
                    }))
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                >
                  <option value="default">Default Neutral</option>
                  <option value="surface">Surface Card</option>
                  <option value="accent">Primary Accent</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-semibold uppercase tracking-wider">
                  Section Padding
                </label>
                <select
                  value={activeSection.style.pad || 'md'}
                  onChange={e =>
                    updateActiveSection(s => ({
                      ...s,
                      style: { ...s.style, pad: e.target.value as any },
                    }))
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                >
                  <option value="sm">Compact (sm)</option>
                  <option value="md">Balanced (md)</option>
                  <option value="lg">Airy (lg)</option>
                </select>
              </div>
            </div>

            {/* Media Background Layer (Gradient / 3D Canvas / Video) */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="block text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                Procedural 3D / Media Layer
              </label>

              <select
                value={activeSection.media?.type || 'none'}
                onChange={e =>
                  updateActiveSection(s => ({
                    ...s,
                    media: {
                      ...s.media,
                      type: e.target.value as any,
                      scene: 'torus',
                    },
                  }))
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
              >
                <option value="none">None (Clean Background)</option>
                <option value="scene">3D Procedural Canvas Scene</option>
                <option value="gradient">Subtle Gradient Mesh</option>
              </select>

              {activeSection.media?.type === 'scene' && (
                <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg space-y-2">
                  <label className="block text-[10px] text-slate-400">3D Geometry Type</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['torus', 'sphere', 'cube', 'waves', 'particles'] as const).map(sc => (
                      <button
                        key={sc}
                        onClick={() =>
                          updateActiveSection(s => ({
                            ...s,
                            media: { ...s.media!, scene: sc },
                          }))
                        }
                        className={`p-1 text-center capitalize rounded border transition-all text-[11px] ${
                          activeSection.media?.scene === sc
                            ? 'bg-indigo-600/30 border-indigo-500 text-white font-semibold'
                            : 'bg-slate-800/40 border-slate-700 text-slate-400'
                        }`}
                      >
                        {sc}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Motion & Interaction FX */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="block text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                Interaction FX & Animations
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 p-2 bg-slate-950/60 border border-slate-800 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!activeSection.fx?.tilt}
                    onChange={e =>
                      updateActiveSection(s => ({
                        ...s,
                        fx: { ...s.fx, tilt: e.target.checked },
                      }))
                    }
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <span>3D Tilt on Hover</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-slate-950/60 border border-slate-800 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!activeSection.fx?.spot}
                    onChange={e =>
                      updateActiveSection(s => ({
                        ...s,
                        fx: { ...s.fx, spot: e.target.checked },
                      }))
                    }
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <span>Spotlight Glow</span>
                </label>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Scroll Reveal Animation</label>
                <select
                  value={activeSection.anim || 'none'}
                  onChange={e =>
                    updateActiveSection(s => ({
                      ...s,
                      anim: e.target.value as any,
                    }))
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                >
                  <option value="none">None (Instant)</option>
                  <option value="fade-up">Fade Up</option>
                  <option value="slide-left">Slide from Left</option>
                  <option value="slide-right">Slide from Right</option>
                  <option value="zoom">Scale Zoom</option>
                </select>
              </div>
            </div>

            {/* GitHub Live Fetcher (if section is repos) */}
            {activeSection.type === 'repos' && (
              <div className="space-y-2 pt-2 border-t border-slate-800 bg-indigo-950/20 p-2.5 rounded-xl border border-indigo-500/30">
                <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                  <FolderGit2 className="w-4 h-4" />
                  <span>GitHub Repos Sync</span>
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={activeSection.data.username || ''}
                    onChange={e =>
                      updateActiveSection(s => ({
                        ...s,
                        data: { ...s.data, username: e.target.value },
                      }))
                    }
                    placeholder="GitHub username"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                  />
                  <button
                    onClick={() => handleFetchGitHubRepos(activeSection.data.username)}
                    disabled={ghLoading}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-colors"
                  >
                    {ghLoading ? '...' : 'Fetch'}
                  </button>
                </div>
                {ghError && <p className="text-red-400 text-[10px]">{ghError}</p>}
              </div>
            )}

            {/* Floating Elements on Section */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Floating Elements ({(activeSection.floats || []).length})
                </label>
              </div>

              <div className="grid grid-cols-4 gap-1">
                <button
                  onClick={() => handleAddFloat('text')}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-[10px] flex flex-col items-center gap-0.5"
                >
                  <Type className="w-3 h-3" />
                  <span>Text</span>
                </button>
                <button
                  onClick={() => handleAddFloat('btn')}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-[10px] flex flex-col items-center gap-0.5"
                >
                  <MousePointer className="w-3 h-3" />
                  <span>Button</span>
                </button>
                <button
                  onClick={() => handleAddFloat('shape')}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-[10px] flex flex-col items-center gap-0.5"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Shape</span>
                </button>
                <button
                  onClick={() => handleAddFloat('scene')}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-[10px] flex flex-col items-center gap-0.5"
                >
                  <Sliders className="w-3 h-3" />
                  <span>3D Scene</span>
                </button>
              </div>

              {/* Active float inspector */}
              {activeFloat && (
                <div className="p-2.5 bg-indigo-950/30 border border-indigo-500/40 rounded-xl space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-indigo-300 capitalize">
                      Active: {activeFloat.kind}
                    </span>
                    <button
                      onClick={() => {
                        updateActiveSection(s => ({
                          ...s,
                          floats: s.floats?.filter(f => f.id !== activeFloat.id),
                        }));
                        onSelectFloat(null);
                      }}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="Delete Float"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400">Position X (%)</label>
                      <input
                        type="range"
                        min="0"
                        max="90"
                        value={activeFloat.x}
                        onChange={e => {
                          const val = Number(e.target.value);
                          updateActiveSection(s => ({
                            ...s,
                            floats: s.floats?.map(f =>
                              f.id === activeFloat.id ? { ...f, x: val } : f
                            ),
                          }));
                        }}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400">Position Y (%)</label>
                      <input
                        type="range"
                        min="0"
                        max="90"
                        value={activeFloat.y}
                        onChange={e => {
                          const val = Number(e.target.value);
                          updateActiveSection(s => ({
                            ...s,
                            floats: s.floats?.map(f =>
                              f.id === activeFloat.id ? { ...f, y: val } : f
                            ),
                          }));
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400">Motion Loop</label>
                      <select
                        value={activeFloat.motion || 'none'}
                        onChange={e =>
                          updateActiveSection(s => ({
                            ...s,
                            floats: s.floats?.map(f =>
                              f.id === activeFloat.id ? { ...f, motion: e.target.value as any } : f
                            ),
                          }))
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs"
                      >
                        <option value="none">None</option>
                        <option value="float">Gentle Float</option>
                        <option value="pulse">Pulse</option>
                        <option value="spin">Spin 360°</option>
                        <option value="sway">Sway</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400">Hover Reaction</label>
                      <select
                        value={activeFloat.hover || 'none'}
                        onChange={e =>
                          updateActiveSection(s => ({
                            ...s,
                            floats: s.floats?.map(f =>
                              f.id === activeFloat.id ? { ...f, hover: e.target.value as any } : f
                            ),
                          }))
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs"
                      >
                        <option value="none">None</option>
                        <option value="lift">Lift Up</option>
                        <option value="zoom">Scale Zoom</option>
                        <option value="glow">Accent Glow</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: GLOBAL DESIGN SYSTEM */}
        {activeTab === 'design' && (
          <div className="space-y-4">
            {/* Curated Color Palettes */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1.5 font-semibold uppercase tracking-wider">
                Color Palettes
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {PALETTES.map(pal => (
                  <button
                    key={pal.id}
                    onClick={() =>
                      onUpdateProject(prev => ({
                        ...prev,
                        theme: { ...prev.theme, palette: pal },
                      }))
                    }
                    className={`p-2 rounded-xl border text-center transition-all ${
                      project.theme.palette.id === pal.id
                        ? 'border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex gap-1 justify-center mb-1">
                      <span className="w-3 h-3 rounded-full" style={{ background: pal.primary }} />
                      <span className="w-3 h-3 rounded-full" style={{ background: pal.accent }} />
                      <span className="w-3 h-3 rounded-full" style={{ background: pal.bg }} />
                    </div>
                    <span className="text-[11px] font-medium text-slate-300">{pal.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom HEX Colors */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="block text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                Custom Palette Colors
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Primary Accent</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={project.theme.palette.primary}
                      onChange={e => {
                        const val = e.target.value;
                        onUpdateProject(prev => ({
                          ...prev,
                          theme: {
                            ...prev.theme,
                            palette: { ...prev.theme.palette, primary: val },
                          },
                        }));
                      }}
                      className="w-8 h-8 rounded bg-slate-950 border border-slate-700 cursor-pointer p-0.5"
                    />
                    <span className="font-mono text-xs">{project.theme.palette.primary}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Secondary Accent</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={project.theme.palette.accent}
                      onChange={e => {
                        const val = e.target.value;
                        onUpdateProject(prev => ({
                          ...prev,
                          theme: {
                            ...prev.theme,
                            palette: { ...prev.theme.palette, accent: val },
                          },
                        }));
                      }}
                      className="w-8 h-8 rounded bg-slate-950 border border-slate-700 cursor-pointer p-0.5"
                    />
                    <span className="font-mono text-xs">{project.theme.palette.accent}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Canvas Background</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={project.theme.palette.bg}
                      onChange={e => {
                        const val = e.target.value;
                        onUpdateProject(prev => ({
                          ...prev,
                          theme: {
                            ...prev.theme,
                            palette: { ...prev.theme.palette, bg: val },
                          },
                        }));
                      }}
                      className="w-8 h-8 rounded bg-slate-950 border border-slate-700 cursor-pointer p-0.5"
                    />
                    <span className="font-mono text-xs">{project.theme.palette.bg}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Surface Card</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={project.theme.palette.surface}
                      onChange={e => {
                        const val = e.target.value;
                        onUpdateProject(prev => ({
                          ...prev,
                          theme: {
                            ...prev.theme,
                            palette: { ...prev.theme.palette, surface: val },
                          },
                        }));
                      }}
                      className="w-8 h-8 rounded bg-slate-950 border border-slate-700 cursor-pointer p-0.5"
                    />
                    <span className="font-mono text-xs">{project.theme.palette.surface}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="block text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                Typography Pairing
              </label>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Display / Headings</label>
                <select
                  value={project.theme.fontH}
                  onChange={e =>
                    onUpdateProject(prev => ({
                      ...prev,
                      theme: { ...prev.theme, fontH: e.target.value },
                    }))
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                >
                  {GOOGLE_FONTS.map(f => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Body Prose</label>
                <select
                  value={project.theme.fontB}
                  onChange={e =>
                    onUpdateProject(prev => ({
                      ...prev,
                      theme: { ...prev.theme, fontB: e.target.value },
                    }))
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                >
                  {GOOGLE_FONTS.map(f => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Corner Radius & Spacing Density */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span className="font-semibold uppercase tracking-wider">Corner Radius</span>
                  <span className="font-mono">{project.theme.radius}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="28"
                  value={project.theme.radius}
                  onChange={e => {
                    const r = Number(e.target.value);
                    onUpdateProject(prev => ({
                      ...prev,
                      theme: { ...prev.theme, radius: r },
                    }));
                  }}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-semibold uppercase tracking-wider">
                  Layout Density
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(['compact', 'cozy', 'airy'] as const).map(d => (
                    <button
                      key={d}
                      onClick={() =>
                        onUpdateProject(prev => ({
                          ...prev,
                          theme: { ...prev.theme, density: d },
                        }))
                      }
                      className={`p-1.5 rounded-lg border text-center capitalize transition-all ${
                        project.theme.density === d
                          ? 'bg-indigo-600/30 border-indigo-500 text-white font-semibold'
                          : 'bg-slate-800/40 border-slate-700 text-slate-400'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SEO & Document Title */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="block text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                SEO & Page Title
              </label>
              <input
                type="text"
                value={project.title}
                onChange={e => {
                  const val = e.target.value;
                  onUpdateProject(prev => ({ ...prev, title: val }));
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                placeholder="Site Title"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
