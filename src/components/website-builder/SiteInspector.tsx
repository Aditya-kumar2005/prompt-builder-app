/**
 * SiteInspector Component
 * Right sidebar inspector: Section properties, layout variant, dynamic fields/lists,
 * GitHub repo fetcher, motion/FX, and global Design System styling.
 */
import React, { useState } from 'react';
import {
  FloatingElement,
  SiteProject,
  SiteSection,
} from './builderTypes';
import {
  GOOGLE_FONTS,
  PALETTES,
  SECTION_META,
} from './builderDefaults';
import {
  Box,
  Eye,
  FolderGit2,
  MousePointer,
  Palette as PaletteIcon,
  Sliders,
  Trash2,
  Type,
} from 'lucide-react';

interface SiteInspectorProps {
  project: SiteProject;
  selectedSectionId: string | null;
  selectedFloatId: string | null;
  onUpdateProject: (updater: (prev: SiteProject) => SiteProject) => void;
  onSelectFloat: (id: string | null) => void;
  onMobileDone?: () => void;
}

type RightTab = 'section' | 'design';

export const SiteInspector: React.FC<SiteInspectorProps> = ({
  project,
  selectedSectionId,
  selectedFloatId,
  onUpdateProject,
  onSelectFloat,
  onMobileDone,
}) => {
  const [activeTab, setActiveTab] = useState<RightTab>('section');
  const [ghLoading, setGhLoading] = useState(false);
  const [ghError, setGhError] = useState<string | null>(null);

  const activeSection = project.sections.find(s => s.id === selectedSectionId) || project.sections[0];
  const activeFloat = activeSection?.floats?.find(f => f.id === selectedFloatId);
  const sectionMeta = activeSection ? SECTION_META[activeSection.type] : null;

  const updateActiveSection = (updater: (sec: SiteSection) => SiteSection) => {
    if (!activeSection) return;
    onUpdateProject(prev => ({
      ...prev,
      sections: prev.sections.map(s => (s.id === activeSection.id ? updater(s) : s)),
    }));
  };

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
      text: kind === 'text' ? 'Interactive Note' : undefined,
      label: kind === 'btn' ? 'Explore Work' : undefined,
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
    <div className="w-full lg:w-80 shrink-0 bg-zinc-950 lg:border-l border-zinc-900 flex flex-col h-full min-h-0 text-zinc-200">
      {/* Mobile Done Header */}
      {onMobileDone && (
        <div className="lg:hidden flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-900 bg-zinc-950 shrink-0">
          <span className="text-xs font-semibold text-zinc-200 truncate">
            {activeSection ? `Editing: ${sectionMeta?.label || activeSection.type}` : 'Edit & Style'}
          </span>
          <button
            type="button"
            onClick={onMobileDone}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer whitespace-nowrap min-h-[36px]"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Website</span>
          </button>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="grid grid-cols-2 p-1.5 gap-1 border-b border-zinc-900 bg-zinc-950 text-xs shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('section')}
          className={`flex items-center justify-center gap-1.5 py-2.5 lg:py-2 rounded-md font-medium transition-colors cursor-pointer ${
            activeTab === 'section'
              ? 'bg-zinc-900 text-blue-400 border border-zinc-800'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Edit Section</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('design')}
          className={`flex items-center justify-center gap-1.5 py-2.5 lg:py-2 rounded-md font-medium transition-colors cursor-pointer ${
            activeTab === 'design'
              ? 'bg-zinc-900 text-blue-400 border border-zinc-800'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
          }`}
        >
          <PaletteIcon className="w-3.5 h-3.5" />
          <span>Colors &amp; Fonts</span>
        </button>
      </div>

      {/* Pane Content */}
      <div className="flex-1 overflow-y-auto p-3.5 text-xs space-y-4">
        {activeTab === 'section' && activeSection && (
          <div className="space-y-4">
            {/* Section Title */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
              <div>
                <h4 className="font-semibold text-zinc-100">{sectionMeta?.label || activeSection.type}</h4>
                <span className="text-[10px] font-mono text-zinc-500">{activeSection.id}</span>
              </div>
              <span className="text-[11px] font-mono text-blue-400 capitalize">{activeSection.variant}</span>
            </div>

            {/* Layout Variant */}
            {sectionMeta && sectionMeta.variants.length > 1 && (
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1.5 font-medium">
                  Layout Variant
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {sectionMeta.variants.map(variant => (
                    <button
                      key={variant}
                      type="button"
                      onClick={() => updateActiveSection(s => ({ ...s, variant }))}
                      className={`p-1.5 rounded-md border text-center capitalize transition-colors cursor-pointer ${
                        activeSection.variant === variant
                          ? 'bg-zinc-900 border-blue-500 text-white font-medium'
                          : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-200'
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
                <label className="block text-[11px] text-zinc-400 mb-1 font-medium">
                  Surface
                </label>
                <select
                  value={activeSection.style.bg || 'default'}
                  onChange={e =>
                    updateActiveSection(s => ({
                      ...s,
                      style: { ...s.style, bg: e.target.value as any },
                    }))
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-1.5 text-xs text-white"
                >
                  <option value="default">Default Base</option>
                  <option value="surface">Elevated Surface</option>
                  <option value="accent">Accent Fill</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1 font-medium">
                  Spacing
                </label>
                <select
                  value={activeSection.style.pad || 'md'}
                  onChange={e =>
                    updateActiveSection(s => ({
                      ...s,
                      style: { ...s.style, pad: e.target.value as any },
                    }))
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-1.5 text-xs text-white"
                >
                  <option value="sm">Compact</option>
                  <option value="md">Balanced</option>
                  <option value="lg">Airy</option>
                </select>
              </div>
            </div>

            {/* Quick Content Fields (for fields like CTAs, email, height) */}
            {sectionMeta && sectionMeta.fields.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-zinc-900">
                <label className="block text-[11px] text-zinc-400 font-medium">
                  Section Content Fields
                </label>
                {sectionMeta.fields
                  .filter(f => f !== 'image' && f !== 'count')
                  .map(field => {
                    const isUrlField = field === 'url';
                    const isEmailField = field === 'email';
                    const isNumField = field === 'height';
                    const isLongField = field === 'text' || field === 'subtitle';
                    const rawValue = activeSection.data?.[field] ?? '';

                    return (
                      <div key={field} className="space-y-1">
                        <label className="block text-[10px] text-zinc-500 font-mono uppercase">
                          {field === 'url' ? 'Embed Video URL (YouTube / Vimeo)' : field}
                        </label>
                        {isLongField ? (
                          <textarea
                            rows={2}
                            value={rawValue}
                            onChange={e =>
                              updateActiveSection(s => ({
                                ...s,
                                data: { ...s.data, [field]: e.target.value },
                              }))
                            }
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-1.5 text-xs text-white focus:outline-none focus:border-blue-500 resize-y"
                          />
                        ) : (
                          <input
                            type={isUrlField ? 'url' : isEmailField ? 'email' : isNumField ? 'number' : 'text'}
                            value={rawValue}
                            onChange={e =>
                              updateActiveSection(s => ({
                                ...s,
                                data: {
                                  ...s.data,
                                  [field]: isNumField ? Number(e.target.value) : e.target.value,
                                },
                              }))
                            }
                            placeholder={isUrlField ? 'https://www.youtube.com/watch?v=...' : `Enter ${field}`}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                          />
                        )}
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Media Background Layer */}
            <div className="space-y-2 pt-2 border-t border-zinc-900">
              <label className="block text-[11px] text-zinc-400 font-medium">
                Backdrop &amp; 3D Layer
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
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-1.5 text-xs text-white"
              >
                <option value="none">Solid Clean</option>
                <option value="scene">Procedural 3D Wireframe</option>
                <option value="gradient">Linear Gradient</option>
              </select>

              {activeSection.media?.type === 'scene' && (
                <div className="p-2.5 bg-zinc-900/60 border border-zinc-800 rounded-md space-y-2">
                  <label className="block text-[10px] text-zinc-400">3D Geometry</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['torus', 'sphere', 'cube', 'waves', 'particles'] as const).map(sc => (
                      <button
                        key={sc}
                        type="button"
                        onClick={() =>
                          updateActiveSection(s => ({
                            ...s,
                            media: { ...s.media!, scene: sc },
                          }))
                        }
                        className={`p-1 text-center capitalize rounded border transition-colors text-[11px] cursor-pointer ${
                          activeSection.media?.scene === sc
                            ? 'bg-zinc-800 border-blue-500 text-white font-medium'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400'
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
            <div className="space-y-2 pt-2 border-t border-zinc-900">
              <label className="block text-[11px] text-zinc-400 font-medium">
                Motion &amp; Interaction
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 p-2 bg-zinc-900/60 border border-zinc-800 rounded-md cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!activeSection.fx?.tilt}
                    onChange={e =>
                      updateActiveSection(s => ({
                        ...s,
                        fx: { ...s.fx, tilt: e.target.checked },
                      }))
                    }
                    className="rounded accent-blue-600"
                  />
                  <span>3D Hover Tilt</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-zinc-900/60 border border-zinc-800 rounded-md cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!activeSection.fx?.spot}
                    onChange={e =>
                      updateActiveSection(s => ({
                        ...s,
                        fx: { ...s.fx, spot: e.target.checked },
                      }))
                    }
                    className="rounded accent-blue-600"
                  />
                  <span>Spotlight</span>
                </label>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 mb-1">Scroll Reveal</label>
                <select
                  value={activeSection.anim || 'none'}
                  onChange={e =>
                    updateActiveSection(s => ({
                      ...s,
                      anim: e.target.value as any,
                    }))
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-1.5 text-xs text-white"
                >
                  <option value="none">Instant (No Animation)</option>
                  <option value="fade-up">Fade Up</option>
                  <option value="slide-left">Slide from Left</option>
                  <option value="slide-right">Slide from Right</option>
                  <option value="zoom">Subtle Scale</option>
                </select>
              </div>
            </div>

            {/* GitHub Live Fetcher */}
            {activeSection.type === 'repos' && (
              <div className="space-y-2 pt-2 border-t border-zinc-900 bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-1.5 text-blue-400 font-medium">
                  <FolderGit2 className="w-4 h-4" />
                  <span>GitHub Repository Sync</span>
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
                    placeholder="GitHub handle"
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-md px-2 py-1 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleFetchGitHubRepos(activeSection.data.username)}
                    disabled={ghLoading}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-md text-xs transition-colors cursor-pointer"
                  >
                    {ghLoading ? '...' : 'Sync'}
                  </button>
                </div>
                {ghError && <p className="text-rose-400 text-[10px]">{ghError}</p>}
              </div>
            )}

            {/* Floating Elements */}
            <div className="space-y-2 pt-2 border-t border-zinc-900">
              <label className="block text-[11px] text-zinc-400 font-medium tabular-nums">
                Floating Overlays ({(activeSection.floats || []).length})
              </label>

              <div className="grid grid-cols-4 gap-1">
                <button
                  type="button"
                  onClick={() => handleAddFloat('text')}
                  className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-800 text-[10px] flex flex-col items-center gap-0.5 cursor-pointer"
                >
                  <Type className="w-3 h-3" />
                  <span>Text</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddFloat('btn')}
                  className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-800 text-[10px] flex flex-col items-center gap-0.5 cursor-pointer"
                >
                  <MousePointer className="w-3 h-3" />
                  <span>CTA</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddFloat('shape')}
                  className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-800 text-[10px] flex flex-col items-center gap-0.5 cursor-pointer"
                >
                  <Box className="w-3 h-3" />
                  <span>Shape</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddFloat('scene')}
                  className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-800 text-[10px] flex flex-col items-center gap-0.5 cursor-pointer"
                >
                  <Sliders className="w-3 h-3" />
                  <span>3D Mesh</span>
                </button>
              </div>

              {activeFloat && (
                <div className="p-2.5 bg-zinc-900 border border-blue-500/40 rounded-lg space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-blue-300 capitalize">
                      Selected: {activeFloat.kind}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        updateActiveSection(s => ({
                          ...s,
                          floats: s.floats?.filter(f => f.id !== activeFloat.id),
                        }));
                        onSelectFloat(null);
                      }}
                      className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                      title="Delete Float"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {activeFloat.kind === 'text' && (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={activeFloat.text || ''}
                        onChange={e =>
                          updateActiveSection(s => ({
                            ...s,
                            floats: s.floats?.map(f =>
                              f.id === activeFloat.id ? { ...f, text: e.target.value } : f
                            ),
                          }))
                        }
                        placeholder="Floating text..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-xs text-white"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-zinc-400 tabular-nums">
                            Font ({activeFloat.fontSize || 16}px)
                          </label>
                          <input
                            type="range"
                            min="12"
                            max="42"
                            value={activeFloat.fontSize || 16}
                            onChange={e => {
                              const val = Number(e.target.value);
                              updateActiveSection(s => ({
                                ...s,
                                floats: s.floats?.map(f =>
                                  f.id === activeFloat.id ? { ...f, fontSize: val } : f
                                ),
                              }));
                            }}
                            className="w-full accent-blue-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-400">Text Color</label>
                          <input
                            type="color"
                            value={activeFloat.color || '#ffffff'}
                            onChange={e =>
                              updateActiveSection(s => ({
                                ...s,
                                floats: s.floats?.map(f =>
                                  f.id === activeFloat.id ? { ...f, color: e.target.value } : f
                                ),
                              }))
                            }
                            className="w-full h-7 rounded bg-zinc-950 border border-zinc-800 cursor-pointer p-0.5"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeFloat.kind === 'btn' && (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={activeFloat.label || ''}
                        onChange={e =>
                          updateActiveSection(s => ({
                            ...s,
                            floats: s.floats?.map(f =>
                              f.id === activeFloat.id ? { ...f, label: e.target.value } : f
                            ),
                          }))
                        }
                        placeholder="Button label..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={activeFloat.href || ''}
                        onChange={e =>
                          updateActiveSection(s => ({
                            ...s,
                            floats: s.floats?.map(f =>
                              f.id === activeFloat.id ? { ...f, href: e.target.value } : f
                            ),
                          }))
                        }
                        placeholder="#contact or https://..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  )}

                  {activeFloat.kind === 'shape' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-zinc-400">Shape</label>
                        <select
                          value={activeFloat.shape || 'circle'}
                          onChange={e =>
                            updateActiveSection(s => ({
                              ...s,
                              floats: s.floats?.map(f =>
                                f.id === activeFloat.id ? { ...f, shape: e.target.value as any } : f
                              ),
                            }))
                          }
                          className="w-full bg-zinc-950 border border-zinc-800 rounded p-1 text-xs"
                        >
                          <option value="circle">Circle</option>
                          <option value="pill">Pill</option>
                          <option value="square">Square</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400">Fill</label>
                        <input
                          type="color"
                          value={activeFloat.fill && activeFloat.fill.startsWith('#') ? activeFloat.fill : '#2563eb'}
                          onChange={e =>
                            updateActiveSection(s => ({
                              ...s,
                              floats: s.floats?.map(f =>
                                f.id === activeFloat.id ? { ...f, fill: e.target.value } : f
                              ),
                            }))
                          }
                          className="w-full h-7 rounded bg-zinc-950 border border-zinc-800 cursor-pointer p-0.5"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-zinc-400 tabular-nums">X ({activeFloat.x}%)</label>
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
                        className="w-full accent-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 tabular-nums">Y ({activeFloat.y}%)</label>
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
                        className="w-full accent-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-zinc-400">Motion</label>
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
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-1 text-xs"
                      >
                        <option value="none">Static</option>
                        <option value="float">Float</option>
                        <option value="spin">Rotate</option>
                        <option value="sway">Sway</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400">Hover</label>
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
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-1 text-xs"
                      >
                        <option value="none">None</option>
                        <option value="lift">Lift</option>
                        <option value="zoom">Scale</option>
                        <option value="glow">Highlight</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DESIGN TOKENS */}
        {activeTab === 'design' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1.5 font-medium">
                Color Presets
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {PALETTES.map(pal => (
                  <button
                    key={pal.id}
                    type="button"
                    onClick={() =>
                      onUpdateProject(prev => ({
                        ...prev,
                        theme: { ...prev.theme, palette: pal },
                      }))
                    }
                    className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                      project.theme.palette.id === pal.id
                        ? 'border-blue-500 bg-zinc-900'
                        : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex gap-1 justify-center mb-1">
                      <span className="w-3 h-3 rounded-sm" style={{ background: pal.primary }} />
                      <span className="w-3 h-3 rounded-sm" style={{ background: pal.accent }} />
                      <span className="w-3 h-3 rounded-sm" style={{ background: pal.bg }} />
                    </div>
                    <span className="text-[11px] font-medium text-zinc-300">{pal.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-900">
              <label className="block text-[11px] text-zinc-400 font-medium">
                Custom Palette Hex
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'primary', label: 'Primary' },
                  { key: 'accent', label: 'Accent' },
                  { key: 'bg', label: 'Canvas' },
                  { key: 'surface', label: 'Surface' },
                ].map(item => (
                  <div key={item.key}>
                    <label className="block text-[10px] text-zinc-400 mb-1">{item.label}</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={(project.theme.palette as any)[item.key]}
                        onChange={e => {
                          const val = e.target.value;
                          onUpdateProject(prev => ({
                            ...prev,
                            theme: {
                              ...prev.theme,
                              palette: { ...prev.theme.palette, [item.key]: val },
                            },
                          }));
                        }}
                        className="w-7 h-7 rounded bg-zinc-900 border border-zinc-800 cursor-pointer p-0.5"
                      />
                      <span className="font-mono text-[11px] tabular-nums">
                        {(project.theme.palette as any)[item.key]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-900">
              <label className="block text-[11px] text-zinc-400 font-medium">
                Typography Pairing
              </label>

              <div>
                <label className="block text-[10px] text-zinc-400 mb-1">Display Font</label>
                <select
                  value={project.theme.fontH}
                  onChange={e =>
                    onUpdateProject(prev => ({
                      ...prev,
                      theme: { ...prev.theme, fontH: e.target.value },
                    }))
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-1.5 text-xs text-white"
                >
                  {GOOGLE_FONTS.map(f => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 mb-1">Body Font</label>
                <select
                  value={project.theme.fontB}
                  onChange={e =>
                    onUpdateProject(prev => ({
                      ...prev,
                      theme: { ...prev.theme, fontB: e.target.value },
                    }))
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-1.5 text-xs text-white"
                >
                  {GOOGLE_FONTS.map(f => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-zinc-900">
              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span className="font-medium">Border Radius</span>
                  <span className="font-mono tabular-nums">{project.theme.radius}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={project.theme.radius}
                  onChange={e => {
                    const r = Number(e.target.value);
                    onUpdateProject(prev => ({
                      ...prev,
                      theme: { ...prev.theme, radius: r },
                    }));
                  }}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1 font-medium">
                  Density
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(['compact', 'cozy', 'airy'] as const).map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() =>
                        onUpdateProject(prev => ({
                          ...prev,
                          theme: { ...prev.theme, density: d },
                        }))
                      }
                      className={`p-1.5 rounded-md border text-center capitalize transition-colors cursor-pointer ${
                        project.theme.density === d
                          ? 'bg-zinc-900 border-blue-500 text-white font-medium'
                          : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-zinc-900">
              <label className="block text-[11px] text-zinc-400 font-medium">
                Document &lt;title&gt;
              </label>
              <input
                type="text"
                value={project.title}
                onChange={e => {
                  const val = e.target.value;
                  onUpdateProject(prev => ({ ...prev, title: val }));
                }}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2 text-xs text-white"
                placeholder="Site Title"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
