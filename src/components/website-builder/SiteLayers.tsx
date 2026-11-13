/**
 * SiteLayers Component
 * Left sidebar navigation: Sections Manager, Add Section Catalog, Template Switcher, AI Site Creator, and 3D Avatar Studio.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  SectionType,
  SiteProject,
} from './builderTypes';
import {
  SECTION_META,
  TEMPLATE_PRESETS,
  createProjectFromTemplate,
} from './builderDefaults';
import { AISettings, getActiveCredential } from '../../types/ai';
import { AvatarConfig, DEFAULT_AVATAR, startAvatar } from './scFxRuntime';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Bot,
  Eye,
  EyeOff,
  Layers,
  LayoutGrid,
  Plus,
  RefreshCw,
  User,
  Wand2,
} from 'lucide-react';

interface SiteLayersProps {
  project: SiteProject;
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
  onUpdateProject: (updater: (prev: SiteProject) => SiteProject) => void;
  onSectionAction: (sectionId: string, action: 'up' | 'down' | 'dup' | 'hide' | 'del') => void;
  onAddSection: (type: SectionType) => void;
  onApplyTemplate: (templateId: string) => void;
  settings: AISettings;
  triggerToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onOpenSettings?: () => void;
  onMobileDone?: () => void;
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
  settings,
  triggerToast,
  onOpenSettings,
  onMobileDone,
}) => {
  const [activeTab, setActiveTab] = useState<LeftTab>('sections');
  const [armedTemplateId, setArmedTemplateId] = useState<string | null>(null);

  // AI Creator State
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [aiName, setAiName] = useState(project.profile.name || 'Alex Morgan');
  const [aiRole, setAiRole] = useState(project.tid || 'webdev');
  const [aiGoal, setAiGoal] = useState('Portfolio');
  const [aiVibe, setAiVibe] = useState('editorial');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Avatar Studio State
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const avatarPreviewRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (activeTab !== 'avatar' || !avatarPreviewRef.current) return;
    const controller = startAvatar(avatarPreviewRef.current, avatarConfig);
    return () => {
      if (controller) controller.stop();
    };
  }, [activeTab, avatarConfig]);

  const handleTemplateClick = (id: string) => {
    if (armedTemplateId === id) {
      onApplyTemplate(id);
      setArmedTemplateId(null);
    } else {
      setArmedTemplateId(id);
      setTimeout(() => setArmedTemplateId(null), 4000);
    }
  };

  const cred = getActiveCredential(settings);
  const missingCustomKey = cred.provider !== 'gemini' && !cred.apiKey;

  // Real AI Site Generator execution using active credentials and /api/site-generate
  const handleGenerateSite = async () => {
    if (missingCustomKey) {
      const msg = `Add your ${cred.provider.toUpperCase()} API key in AI Settings first.`;
      setAiError(msg);
      triggerToast(msg, 'error');
      return;
    }
    setIsGenerating(true);
    setAiError(null);

    try {
      const response = await fetch('/api/site-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: aiName,
          role: aiRole,
          goal: aiGoal,
          vibe: aiVibe,
          provider: cred.provider,
          apiKey: cred.apiKey,
          model: cred.model,
          temperature: settings.temperature,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success || !result.siteCopy) {
        throw new Error(result.error || 'Site copy generation failed.');
      }

      const newProj = createProjectFromTemplate(aiRole, {
        name: aiName,
        role: aiRole,
      });

      const copy = result.siteCopy;
      newProj.sections = newProj.sections.map(sec => {
        if (sec.type === 'hero' && copy.hero) {
          return { ...sec, data: { ...sec.data, ...copy.hero } };
        }
        if (sec.type === 'about' && copy.about) {
          return { ...sec, data: { ...sec.data, ...copy.about } };
        }
        if (sec.type === 'services' && copy.services) {
          return { ...sec, data: { ...sec.data, ...copy.services } };
        }
        if (sec.type === 'contact' && copy.contact) {
          return { ...sec, data: { ...sec.data, ...copy.contact } };
        }
        return sec;
      });

      onUpdateProject(() => newProj);
      triggerToast(`Generated custom ${aiGoal} site via ${cred.provider.toUpperCase()}`, 'success');
      setActiveTab('sections');
      onMobileDone?.();
    } catch (err: any) {
      const msg = err.message || 'Generation failed. Inspect your API key in Settings.';
      setAiError(msg);
      triggerToast(msg, 'error');
    } finally {
      setIsGenerating(false);
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
    triggerToast('Applied interactive 3D avatar to Hero', 'success');
    setActiveTab('sections');
    onMobileDone?.();
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
    triggerToast('Added floating 3D avatar to canvas', 'success');
    setActiveTab('sections');
    onMobileDone?.();
  };

  return (
    <div className="w-full lg:w-72 shrink-0 bg-zinc-950 lg:border-r border-zinc-900 flex flex-col h-full min-h-0 text-zinc-200">
      {/* Mobile Header Helper */}
      {onMobileDone && (
        <div className="lg:hidden px-4 py-2.5 border-b border-zinc-900 flex items-center justify-between bg-zinc-950">
          <span className="text-xs font-semibold text-zinc-200">Pages, Sections &amp; Themes</span>
          <button
            type="button"
            onClick={onMobileDone}
            className="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer"
          >
            View Website
          </button>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="grid grid-cols-5 p-1.5 gap-1 border-b border-zinc-900 bg-zinc-950 text-[11px]">
        {[
          { id: 'sections' as LeftTab, label: 'Sections', icon: Layers },
          { id: 'add' as LeftTab, label: 'Add', icon: Plus },
          { id: 'templates' as LeftTab, label: 'Themes', icon: LayoutGrid },
          { id: 'create' as LeftTab, label: 'AI Site', icon: Wand2 },
          { id: 'avatar' as LeftTab, label: 'Avatar', icon: User },
        ].map(item => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-2 px-1 rounded-md transition-colors cursor-pointer ${
                active
                  ? 'bg-zinc-900 text-blue-400 font-medium border border-zinc-800'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5 mb-1" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Pane Content */}
      <div className="flex-1 overflow-y-auto p-3.5 text-xs space-y-3">
        {/* TAB: SECTIONS */}
        {activeTab === 'sections' && (
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-medium text-zinc-300 tabular-nums">
                Page Sections ({project.sections.length})
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('add')}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-400 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Section</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {project.sections.map((sec, index) => {
                const meta = SECTION_META[sec.type] || { label: sec.type, icon: '▪' };
                const isSelected = selectedSectionId === sec.id;

                return (
                  <div
                    key={sec.id}
                    onClick={() => onSelectSection(sec.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-900 border-blue-500/70 text-white'
                        : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900'
                    } ${!sec.visible ? 'opacity-50' : ''}`}
                  >
                    <span className="text-xs font-mono text-zinc-500 w-4 text-center tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{meta.label}</div>
                      <div className="text-[10px] text-zinc-400 flex items-center gap-1.5 font-mono">
                        <span className="capitalize">{sec.variant}</span>
                        {sec.media?.type && sec.media.type !== 'none' && (
                          <span className="text-blue-400">· {sec.media.type}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          onSectionAction(sec.id, 'up');
                        }}
                        disabled={index === 0}
                        className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          onSectionAction(sec.id, 'down');
                        }}
                        disabled={index === project.sections.length - 1}
                        className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          onSectionAction(sec.id, 'hide');
                        }}
                        className="p-1 text-zinc-400 hover:text-white cursor-pointer"
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
            <div className="mb-2.5">
              <h4 className="font-medium text-zinc-200 mb-0.5">Section Catalog</h4>
              <p className="text-[11px] text-zinc-400">Insert a modular section onto the page:</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(SECTION_META) as SectionType[]).map(type => {
                const meta = SECTION_META[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      onAddSection(type);
                      setActiveTab('sections');
                    }}
                    className="flex flex-col items-start p-2.5 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-blue-500/60 rounded-lg transition-colors text-left cursor-pointer"
                  >
                    <span className="font-medium text-zinc-200">{meta.label}</span>
                    <span className="text-[10px] text-zinc-500 font-mono mt-0.5 tabular-nums">
                      {meta.variants.length} variants
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: TEMPLATES */}
        {activeTab === 'templates' && (
          <div>
            <div className="mb-2.5">
              <h4 className="font-medium text-zinc-200 mb-0.5">Layout Archetypes</h4>
              <p className="text-[11px] text-zinc-400">Click once to arm, click again to replace canvas:</p>
            </div>

            <div className="space-y-2">
              {TEMPLATE_PRESETS.map(tpl => {
                const isArmed = armedTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleTemplateClick(tpl.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                      isArmed
                        ? 'bg-amber-950/30 border-amber-500'
                        : project.tid === tpl.id
                        ? 'bg-zinc-900 border-blue-500/70'
                        : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-zinc-100">{tpl.name}</span>
                      <span className="text-[10px] font-mono text-zinc-500 tabular-nums">
                        {tpl.layout.length} sec
                      </span>
                    </div>

                    <div className="flex items-center gap-1 h-1.5 rounded overflow-hidden mb-2 bg-zinc-800">
                      <div className="h-full flex-1" style={{ background: tpl.theme.palette.primary }} />
                      <div className="h-full flex-1" style={{ background: tpl.theme.palette.accent }} />
                      <div className="h-full flex-1" style={{ background: tpl.theme.palette.bg }} />
                    </div>

                    <div className="text-[10px] text-zinc-400 flex justify-between items-center">
                      <span>{tpl.tag}</span>
                      {isArmed ? (
                        <span className="text-amber-400 font-semibold">Click to confirm</span>
                      ) : project.tid === tpl.id ? (
                        <span className="text-blue-400 font-medium">Active</span>
                      ) : (
                        <span className="text-zinc-500">Load</span>
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
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="font-medium text-zinc-200 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-blue-400" />
                <span>AI Site Generator</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-400 tabular-nums">
                Step {step}/3
              </span>
            </div>

            {missingCustomKey && (
              <div className="p-2.5 rounded-md border border-amber-500/40 bg-amber-950/20 space-y-1.5 text-[11px] text-amber-200">
                <div className="flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>Add your {cred.provider.toUpperCase()} API key in Settings before generating.</span>
                </div>
                {onOpenSettings && (
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="w-full py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-100 font-medium cursor-pointer"
                  >
                    Open AI Settings
                  </button>
                )}
              </div>
            )}

            {aiError && (
              <div className="p-2.5 rounded-md border border-rose-500/40 bg-rose-950/20 flex items-start gap-2 text-[11px] text-rose-200">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span>{aiError}</span>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Full Name / Brand</label>
                  <input
                    type="text"
                    value={aiName}
                    onChange={e => setAiName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Alex Morgan"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Primary Discipline</label>
                  <select
                    value={aiRole}
                    onChange={e => setAiRole(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="webdev">Frontend Web Developer</option>
                    <option value="uiux">UI/UX Designer</option>
                    <option value="fullstack">Full-Stack Engineer</option>
                    <option value="java">Java Backend Engineer</option>
                    <option value="avatar">3D Avatar Showroom</option>
                    <option value="custom">Minimal Starter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Site Objective</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['Portfolio', 'Consulting', 'Agency', 'Product Showcase'].map(goal => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => setAiGoal(goal)}
                        className={`p-1.5 rounded-md border text-center transition-colors cursor-pointer ${
                          aiGoal === goal
                            ? 'bg-zinc-900 border-blue-500 text-white font-medium'
                            : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-md transition-colors cursor-pointer"
                >
                  Next Step
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Editorial Tone</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'editorial', label: 'Editorial Crisp' },
                      { id: 'technical', label: 'Technical Direct' },
                      { id: 'minimal', label: 'Minimal Calm' },
                      { id: 'bold', label: 'High-Contrast' },
                    ].map(v => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setAiVibe(v.id)}
                        className={`p-2 rounded-md border text-left transition-colors cursor-pointer ${
                          aiVibe === v.id
                            ? 'bg-zinc-900 border-blue-500 text-white font-medium'
                            : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-md transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-md transition-colors cursor-pointer"
                  >
                    Review
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Brief Summary</label>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-[11px] text-zinc-300 font-mono space-y-1">
                    <div>Brand: {aiName}</div>
                    <div>Focus: {aiRole} / {aiGoal}</div>
                    <div>Style: {aiVibe}</div>
                    <div>Engine: {settings.activeProvider}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={isGenerating}
                    className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-md transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateSite}
                    disabled={isGenerating}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span>{isGenerating ? 'Generating...' : 'Generate Site'}</span>
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
              <h4 className="font-medium text-zinc-200 mb-0.5">3D Procedural Avatar</h4>
              <p className="text-[11px] text-zinc-400">Move cursor across frame to track gaze:</p>
            </div>

            <div
              className="w-full h-44 rounded-lg border border-zinc-800 relative overflow-hidden flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle at 50% 40%, #18181b, #09090b)',
                '--primary': '#2563eb',
                '--accent': '#60a5fa',
              } as any}
            >
              <canvas
                ref={avatarPreviewRef}
                data-avatar={JSON.stringify(avatarConfig)}
                className="w-full h-full block"
              />
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Hairstyle</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['short', 'long', 'curly', 'bun', 'none'] as const).map(hs => (
                    <button
                      key={hs}
                      type="button"
                      onClick={() => setAvatarConfig(prev => ({ ...prev, hairStyle: hs }))}
                      className={`p-1 rounded text-center capitalize border transition-colors cursor-pointer ${
                        avatarConfig.hairStyle === hs
                          ? 'bg-zinc-900 border-blue-500 text-white font-medium'
                          : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {hs}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Accessories</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['glasses', 'headphones', 'none'] as const).map(acc => (
                    <button
                      key={acc}
                      type="button"
                      onClick={() => setAvatarConfig(prev => ({ ...prev, acc }))}
                      className={`p-1 rounded text-center capitalize border transition-colors cursor-pointer ${
                        avatarConfig.acc === acc
                          ? 'bg-zinc-900 border-blue-500 text-white font-medium'
                          : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {acc}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Skin Tone</label>
                  <input
                    type="color"
                    value={avatarConfig.skin}
                    onChange={e => setAvatarConfig(prev => ({ ...prev, skin: e.target.value }))}
                    className="w-full h-8 rounded bg-zinc-900 border border-zinc-800 cursor-pointer p-0.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Hair Color</label>
                  <input
                    type="color"
                    value={avatarConfig.hair}
                    onChange={e => setAvatarConfig(prev => ({ ...prev, hair: e.target.value }))}
                    className="w-full h-8 rounded bg-zinc-900 border border-zinc-800 cursor-pointer p-0.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Outfit Color</label>
                  <input
                    type="color"
                    value={avatarConfig.outfit}
                    onChange={e => setAvatarConfig(prev => ({ ...prev, outfit: e.target.value }))}
                    className="w-full h-8 rounded bg-zinc-900 border border-zinc-800 cursor-pointer p-0.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Eye Color</label>
                  <input
                    type="color"
                    value={avatarConfig.eyes}
                    onChange={e => setAvatarConfig(prev => ({ ...prev, eyes: e.target.value }))}
                    className="w-full h-8 rounded bg-zinc-900 border border-zinc-800 cursor-pointer p-0.5"
                  />
                </div>
              </div>

              <div className="pt-2 space-y-1.5">
                <button
                  type="button"
                  onClick={applyAvatarToHero}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-md transition-colors cursor-pointer"
                >
                  Apply to Hero Section
                </button>
                <button
                  type="button"
                  onClick={addFloatingAvatar}
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-medium rounded-md border border-zinc-800 transition-colors cursor-pointer"
                >
                  + Add as Floating Element
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
