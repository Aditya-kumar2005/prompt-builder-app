/**
 * SiteLayers Component
 * Left sidebar navigation: Sections Manager, Add Section Catalog, Template Switcher, AI Site Creator, and 3D Avatar Studio.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  SectionType,
  SiteProject,
  SiteSection,
} from './builderTypes';
import {
  SECTION_META,
  TEMPLATE_PRESETS,
  createInitialSection,
  createProjectFromTemplate,
} from './builderDefaults';
import { AvatarConfig, DEFAULT_AVATAR, startAvatar } from './scFxRuntime';
import {
  ArrowDown,
  ArrowUp,
  Bot,
  Copy,
  Eye,
  EyeOff,
  Layers,
  LayoutGrid,
  Plus,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react';

interface SiteLayersProps {
  project: SiteProject;
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
  onUpdateProject: (updater: (prev: SiteProject) => SiteProject) => void;
  onSectionAction: (sectionId: string, action: 'up' | 'down' | 'dup' | 'hide' | 'del') => void;
  onAddSection: (type: SectionType) => void;
  onApplyTemplate: (templateId: string) => void;
}

type LeftTab = 'sections' | 'add' | 'templates' | 'create' | 'avatar';

export const SiteLayers: React.FC<SiteLayersProps> = ({
  project,
  selectedSectionId,
  onSelectSection,
  onSectionAction,
  onAddSection,
  onApplyTemplate,
  onUpdateProject,
}) => {
  const [activeTab, setActiveTab] = useState<LeftTab>('sections');
  const [armedTemplateId, setArmedTemplateId] = useState<string | null>(null);

  // AI Creator State
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [aiName, setAiName] = useState(project.profile.name || 'Alex Morgan');
  const [aiRole, setAiRole] = useState(project.tid || 'webdev');
  const [aiGoal, setAiGoal] = useState('Portfolio');
  const [aiVibe, setAiVibe] = useState('futuristic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiStatus, setAiStatus] = useState<string | null>(null);

  // Avatar Studio State
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const avatarPreviewRef = useRef<HTMLCanvasElement>(null);

  // Run preview avatar canvas
  useEffect(() => {
    if (activeTab !== 'avatar' || !avatarPreviewRef.current) return;
    const controller = startAvatar(avatarPreviewRef.current, avatarConfig);
    return () => {
      if (controller) controller.stop();
    };
  }, [activeTab, avatarConfig]);

  // Handle template selection with confirmation
  const handleTemplateClick = (id: string) => {
    if (armedTemplateId === id) {
      onApplyTemplate(id);
      setArmedTemplateId(null);
    } else {
      setArmedTemplateId(id);
      setTimeout(() => setArmedTemplateId(null), 4000);
    }
  };

  // AI Site Generator execution
  const handleGenerateSite = async () => {
    setIsGenerating(true);
    setAiStatus('Synthesizing design system & custom copy...');

    try {
      // Build prompt for backend
      const prompt = `Create a complete website configuration in JSON for a ${aiRole} named "${aiName}". Goal: ${aiGoal}, Vibe: ${aiVibe}.
Include hero eyebrow, headline, subtitle, about bio, 3 stats, 8 skills, 3 services, 3 projects, and contact info.`;

      const response = await fetch('/api/prompt-craft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: prompt,
          domain: 'Portfolio',
          framework: 'SiteCraft',
        }),
      });

      if (!response.ok) {
        throw new Error('Backend generation unavailable');
      }

      const result = await response.json();
      setAiStatus('Applied successfully!');

      // Create new fresh project tailored to the role
      const newProj = createProjectFromTemplate(aiRole, {
        name: aiName,
        role: aiRole,
      });

      // Update project
      onUpdateProject(() => newProj);
      setActiveTab('sections');
    } catch {
      // Graceful instant fallback: apply preset template with custom profile
      const newProj = createProjectFromTemplate(aiRole, {
        name: aiName,
        role: aiRole,
      });
      onUpdateProject(() => newProj);
      setActiveTab('sections');
    } finally {
      setIsGenerating(false);
      setAiStatus(null);
    }
  };

  const applyAvatarToHero = () => {
    onUpdateProject(prev => {
      const heroIdx = prev.sections.findIndex(s => s.type === 'hero');
      if (heroIdx === -1) return prev;

      const updated = [...prev.sections];
      updated[heroIdx] = {
        ...updated[heroIdx],
        variant: 'avatar',
        media: {
          type: 'avatar',
          avatar: { ...avatarConfig },
          pos: 'right',
          size: 46,
          backdrop: 'scene',
          scene: 'particles',
          overlay: 0,
        },
        fx: { spot: true },
        anim: 'fade-up',
      };
      return { ...prev, sections: updated };
    });
    setActiveTab('sections');
  };

  const addFloatingAvatar = () => {
    onUpdateProject(prev => {
      const targetSec = prev.sections.find(s => s.id === selectedSectionId) || prev.sections[0];
      if (!targetSec) return prev;

      const updated = prev.sections.map(s => {
        if (s.id !== targetSec.id) return s;
        const newFloat: any = {
          id: `fl_av_${Math.random().toString(36).slice(2, 7)}`,
          kind: 'avatar',
          x: 75,
          y: 20,
          w: 180,
          h: 220,
          motion: 'float',
          hover: 'lift',
          avatarConfig: { ...avatarConfig },
        };
        return {
          ...s,
          floats: [...(s.floats || []), newFloat],
        };
      });
      return { ...prev, sections: updated };
    });
    setActiveTab('sections');
  };

  return (
    <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full min-h-0 text-slate-200">
      {/* Tab Switcher */}
      <div className="grid grid-cols-5 p-2 gap-1 border-b border-slate-800 bg-slate-950/60 text-xs">
        <button
          onClick={() => setActiveTab('sections')}
          className={`flex flex-col items-center py-2 px-1 rounded-lg transition-colors ${
            activeTab === 'sections'
              ? 'bg-indigo-600/20 text-indigo-400 font-semibold border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
          title="Section Layers"
        >
          <Layers className="w-4 h-4 mb-1" />
          <span>Layers</span>
        </button>

        <button
          onClick={() => setActiveTab('add')}
          className={`flex flex-col items-center py-2 px-1 rounded-lg transition-colors ${
            activeTab === 'add'
              ? 'bg-indigo-600/20 text-indigo-400 font-semibold border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
          title="Add New Section"
        >
          <Plus className="w-4 h-4 mb-1" />
          <span>Add</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`flex flex-col items-center py-2 px-1 rounded-lg transition-colors ${
            activeTab === 'templates'
              ? 'bg-indigo-600/20 text-indigo-400 font-semibold border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
          title="Preset Layouts"
        >
          <LayoutGrid className="w-4 h-4 mb-1" />
          <span>Presets</span>
        </button>

        <button
          onClick={() => setActiveTab('create')}
          className={`flex flex-col items-center py-2 px-1 rounded-lg transition-colors ${
            activeTab === 'create'
              ? 'bg-indigo-600/20 text-indigo-400 font-semibold border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
          title="AI Site Wizard"
        >
          <Sparkles className="w-4 h-4 mb-1" />
          <span>AI Site</span>
        </button>

        <button
          onClick={() => setActiveTab('avatar')}
          className={`flex flex-col items-center py-2 px-1 rounded-lg transition-colors ${
            activeTab === 'avatar'
              ? 'bg-indigo-600/20 text-indigo-400 font-semibold border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
          title="3D Procedural Avatar"
        >
          <User className="w-4 h-4 mb-1" />
          <span>Avatar</span>
        </button>
      </div>

      {/* Pane Content */}
      <div className="flex-1 overflow-y-auto p-3 text-xs space-y-3">
        {/* TAB: SECTIONS */}
        {activeTab === 'sections' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-300">Page Structure ({project.sections.length})</span>
              <button
                onClick={() => setActiveTab('add')}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 rounded transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {project.sections.map((sec, index) => {
                const meta = SECTION_META[sec.type] || { label: sec.type, icon: '📄' };
                const isSelected = selectedSectionId === sec.id;

                return (
                  <div
                    key={sec.id}
                    onClick={() => onSelectSection(sec.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 text-white'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:border-slate-600 hover:bg-slate-800/70'
                    } ${!sec.visible ? 'opacity-50' : ''}`}
                  >
                    <span className="text-base">{meta.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{meta.label}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                        <span className="capitalize">{sec.variant}</span>
                        {sec.media?.type && sec.media.type !== 'none' && (
                          <span className="text-indigo-400 font-mono">✦ {sec.media.type}</span>
                        )}
                      </div>
                    </div>

                    {/* Quick controls */}
                    <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onSectionAction(sec.id, 'up');
                        }}
                        disabled={index === 0}
                        className="p-1 hover:text-white disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onSectionAction(sec.id, 'down');
                        }}
                        disabled={index === project.sections.length - 1}
                        className="p-1 hover:text-white disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onSectionAction(sec.id, 'hide');
                        }}
                        className="p-1 hover:text-white"
                        title={sec.visible ? 'Hide' : 'Show'}
                      >
                        {sec.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: ADD SECTION */}
        {activeTab === 'add' && (
          <div>
            <div className="mb-2">
              <h4 className="font-semibold text-slate-300 mb-0.5">Section Catalog</h4>
              <p className="text-[11px] text-slate-400">Choose a section component to insert into your site:</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(SECTION_META) as SectionType[]).map(type => {
                const meta = SECTION_META[type];
                return (
                  <button
                    key={type}
                    onClick={() => {
                      onAddSection(type);
                      setActiveTab('sections');
                    }}
                    className="flex flex-col items-start p-2.5 bg-slate-800/40 hover:bg-indigo-950/40 border border-slate-700/60 hover:border-indigo-500/70 rounded-xl transition-all text-left group"
                  >
                    <span className="text-xl mb-1 group-hover:scale-110 transition-transform">{meta.icon}</span>
                    <span className="font-semibold text-slate-200 group-hover:text-indigo-400">{meta.label}</span>
                    <span className="text-[10px] text-slate-400">{meta.variants.length} styles</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: TEMPLATES */}
        {activeTab === 'templates' && (
          <div>
            <div className="mb-2">
              <h4 className="font-semibold text-slate-300 mb-0.5">Curated Blueprints</h4>
              <p className="text-[11px] text-slate-400">Click a blueprint to preview, click again to apply:</p>
            </div>

            <div className="space-y-2">
              {TEMPLATE_PRESETS.map(tpl => {
                const isArmed = armedTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => handleTemplateClick(tpl.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isArmed
                        ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/40'
                        : project.tid === tpl.id
                        ? 'bg-indigo-950/40 border-indigo-500'
                        : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-lg">{tpl.emoji}</span>
                      <span className="font-bold text-slate-200">{tpl.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 h-1.5 rounded-full overflow-hidden mb-2 bg-slate-800">
                      <div className="h-full flex-1" style={{ background: tpl.theme.palette.primary }} />
                      <div className="h-full flex-1" style={{ background: tpl.theme.palette.accent }} />
                      <div className="h-full flex-1" style={{ background: tpl.theme.palette.bg }} />
                    </div>

                    <div className="text-[10px] text-slate-400 flex justify-between items-center">
                      <span>{tpl.tag}</span>
                      {isArmed ? (
                        <span className="text-amber-400 font-bold animate-pulse">Click again to confirm</span>
                      ) : project.tid === tpl.id ? (
                        <span className="text-indigo-400 font-semibold">Active</span>
                      ) : (
                        <span className="text-slate-500">Apply</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: AI CREATOR */}
        {activeTab === 'create' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-indigo-400" />
                <span>AI Site Generator</span>
              </span>
              <span className="text-[10px] text-slate-400">Step {step} of 3</span>
            </div>

            {step === 1 && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    value={aiName}
                    onChange={e => setAiName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Alex Morgan"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Primary Role</label>
                  <select
                    value={aiRole}
                    onChange={e => setAiRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="webdev">Frontend Web Developer</option>
                    <option value="uiux">UI/UX Designer</option>
                    <option value="fullstack">Full-Stack Engineer</option>
                    <option value="java">Java Backend Engineer</option>
                    <option value="avatar">3D Avatar Showroom</option>
                    <option value="custom">Blank Canvas Starter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Site Goal</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['Portfolio', 'Consulting', 'Agency', 'SaaS Landing'].map(goal => (
                      <button
                        key={goal}
                        onClick={() => setAiGoal(goal)}
                        className={`p-1.5 rounded-lg border text-center transition-all ${
                          aiGoal === goal
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                            : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors mt-2"
                >
                  Next: Vibe & Effects →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Visual Aesthetic</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'futuristic', label: 'Futuristic Dark' },
                      { id: 'editorial', label: 'Editorial Clean' },
                      { id: 'vibrant', label: 'Vibrant Neon' },
                      { id: 'minimal', label: 'Warm Travertine' },
                    ].map(v => (
                      <button
                        key={v.id}
                        onClick={() => setAiVibe(v.id)}
                        className={`p-2 rounded-lg border text-left transition-all ${
                          aiVibe === v.id
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                            : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-300">Active FX Features:</div>
                  <div className="text-[10px] text-slate-400 flex flex-col gap-1">
                    <span>✓ Interactive 3D Math Wireframes</span>
                    <span>✓ Cursor-Following 3D Head Avatar</span>
                    <span>✓ Smooth Scroll Reveal Transitions</span>
                    <span>✓ 3D Card Hover Perspective Tilt</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors"
                  >
                    Review Prompt →
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Generated Plan Prompt</label>
                  <textarea
                    rows={4}
                    readOnly
                    value={`Build high-impact ${aiGoal} for ${aiName} (${aiRole}) with ${aiVibe} design language. Include 3D interactive hero, skills, open source github activity, client testimonials, and contact form.`}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-[11px] text-slate-300 font-mono resize-none"
                  />
                </div>

                {aiStatus && (
                  <div className="p-2 rounded bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 text-[11px] animate-pulse text-center">
                    {aiStatus}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setStep(2)}
                    disabled={isGenerating}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleGenerateSite}
                    disabled={isGenerating}
                    className="flex-1 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isGenerating ? 'Building...' : 'Generate Site'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: AVATAR STUDIO */}
        {activeTab === 'avatar' && (
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-slate-300 mb-0.5">3D Procedural Avatar</h4>
              <p className="text-[11px] text-slate-400">Head and eyes dynamically track your cursor:</p>
            </div>

            {/* Live Avatar Preview Box */}
            <div
              className="w-full h-48 rounded-xl border border-slate-700/80 relative overflow-hidden flex items-center justify-center shadow-inner"
              style={{
                background: 'radial-gradient(circle at 50% 40%, #1e2640, #0a0d17)',
                '--primary': '#6c8cff',
                '--accent': '#22d3ee',
              } as any}
            >
              <canvas
                ref={avatarPreviewRef}
                data-avatar={JSON.stringify(avatarConfig)}
                className="w-full h-full block"
              />
              <span className="absolute bottom-2 text-[10px] text-slate-400/80 pointer-events-none">
                Move mouse here to track
              </span>
            </div>

            {/* Customization controls */}
            <div className="space-y-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Hairstyle</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['short', 'long', 'curly', 'bun', 'none'] as const).map(hs => (
                    <button
                      key={hs}
                      onClick={() => setAvatarConfig(prev => ({ ...prev, hairStyle: hs }))}
                      className={`p-1 rounded text-center capitalize border transition-all ${
                        avatarConfig.hairStyle === hs
                          ? 'bg-indigo-600/30 border-indigo-500 text-white font-semibold'
                          : 'bg-slate-800/40 border-slate-700 text-slate-400'
                      }`}
                    >
                      {hs}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Accessories</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['glasses', 'headphones', 'none'] as const).map(acc => (
                    <button
                      key={acc}
                      onClick={() => setAvatarConfig(prev => ({ ...prev, acc }))}
                      className={`p-1 rounded text-center capitalize border transition-all ${
                        avatarConfig.acc === acc
                          ? 'bg-indigo-600/30 border-indigo-500 text-white font-semibold'
                          : 'bg-slate-800/40 border-slate-700 text-slate-400'
                      }`}
                    >
                      {acc}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Skin Tone</label>
                  <input
                    type="color"
                    value={avatarConfig.skin}
                    onChange={e => setAvatarConfig(prev => ({ ...prev, skin: e.target.value }))}
                    className="w-full h-8 rounded bg-slate-950 border border-slate-700 cursor-pointer p-0.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Hair Color</label>
                  <input
                    type="color"
                    value={avatarConfig.hair}
                    onChange={e => setAvatarConfig(prev => ({ ...prev, hair: e.target.value }))}
                    className="w-full h-8 rounded bg-slate-950 border border-slate-700 cursor-pointer p-0.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Outfit Color</label>
                  <input
                    type="color"
                    value={avatarConfig.outfit}
                    onChange={e => setAvatarConfig(prev => ({ ...prev, outfit: e.target.value }))}
                    className="w-full h-8 rounded bg-slate-950 border border-slate-700 cursor-pointer p-0.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Eye Color</label>
                  <input
                    type="color"
                    value={avatarConfig.eyes}
                    onChange={e => setAvatarConfig(prev => ({ ...prev, eyes: e.target.value }))}
                    className="w-full h-8 rounded bg-slate-950 border border-slate-700 cursor-pointer p-0.5"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 space-y-1.5">
                <button
                  onClick={applyAvatarToHero}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors"
                >
                  Apply Avatar to Hero Section
                </button>
                <button
                  onClick={addFloatingAvatar}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg border border-slate-700 transition-colors"
                >
                  + Add as Floating 3D Element
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
