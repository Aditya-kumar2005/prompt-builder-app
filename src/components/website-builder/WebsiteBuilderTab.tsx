/**
 * WebsiteBuilderTab Component
 * Main orchestrator for Live Website Builder with Responsive Preview,
 * Section Hierarchy, 3D Math/Avatar procedural rendering, and Standalone Export.
 */
import React, { useState, useRef } from 'react';
import {
  FloatingElement,
  SectionType,
  SiteProject,
  SiteSection,
} from './builderTypes';
import {
  createInitialSection,
  createProjectFromTemplate,
} from './builderDefaults';
import { AISettings, getActiveCredential, safeFetchJson } from '../../types/ai';
import { SiteCanvas } from './SiteCanvas';
import { SiteLayers } from './SiteLayers';
import { SiteInspector } from './SiteInspector';
import { generateStandaloneHtml } from './exportHtml';
import { BrandKitModal, GeneratedBrandKit } from './BrandKitModal';
import { TemplateGalleryModal } from './TemplateGalleryModal';
import {
  Code,
  Download,
  Eye,
  EyeOff,
  FolderOpen,
  Laptop,
  Layers,
  LayoutTemplate,
  Monitor,
  MoreVertical,
  Palette,
  Redo2,
  Save,
  Sliders,
  Smartphone,
  Tablet,
  Undo2,
  Wand2,
} from 'lucide-react';

interface WebsiteBuilderTabProps {
  settings: AISettings;
  triggerToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onOpenSettings?: () => void;
}

export const WebsiteBuilderTab: React.FC<WebsiteBuilderTabProps> = ({
  settings,
  triggerToast,
  onOpenSettings,
}) => {
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const [project, setProject] = useState<SiteProject>(() => {
    try {
      const saved = localStorage.getItem('sitecraft_active_project');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return createProjectFromTemplate('webdev');
  });

  const [history, setHistory] = useState<SiteProject[]>([project]);
  const [historyIdx, setHistoryIdx] = useState<number>(0);

  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop'
  );
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [mobilePane, setMobilePane] = useState<'canvas' | 'layers' | 'inspector'>('canvas');
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    project.sections[0]?.id || null
  );
  const [selectedFloatId, setSelectedFloatId] = useState<string | null>(null);
  const [isAiPolishing, setIsAiPolishing] = useState<boolean>(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateProjectWithHistory = (updater: (prev: SiteProject) => SiteProject) => {
    setProject(prev => {
      const next = updater(prev);
      try {
        localStorage.setItem('sitecraft_active_project', JSON.stringify(next));
      } catch {
        // quota exceeded or private mode
      }

      setHistory(hPrev => {
        const sliced = hPrev.slice(0, historyIdx + 1);
        return [...sliced, next];
      });
      setHistoryIdx(idx => idx + 1);

      return next;
    });
  };

  const handleUndo = () => {
    if (historyIdx > 0) {
      const nextIdx = historyIdx - 1;
      setHistoryIdx(nextIdx);
      setProject(history[nextIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      const nextIdx = historyIdx + 1;
      setHistoryIdx(nextIdx);
      setProject(history[nextIdx]);
    }
  };

  const handleUpdateSectionData = (sectionId: string, path: string, value: any) => {
    updateProjectWithHistory(prev => {
      const updated = prev.sections.map(s => {
        if (s.id !== sectionId) return s;

        const nextData = { ...s.data };
        const parts = path.split('.');

        if (parts.length === 1) {
          nextData[parts[0]] = value;
        } else if (parts.length === 3 && !isNaN(Number(parts[1]))) {
          const listKey = parts[0];
          const idx = Number(parts[1]);
          const field = parts[2];
          const list = [...(nextData[listKey] || [])];
          if (list[idx]) {
            list[idx] = { ...list[idx], [field]: value };
            nextData[listKey] = list;
          }
        }
        return { ...s, data: nextData };
      });
      return { ...prev, sections: updated };
    });
  };

  const handleSectionAction = (
    sectionId: string,
    action: 'up' | 'down' | 'dup' | 'hide' | 'del'
  ) => {
    updateProjectWithHistory(prev => {
      const idx = prev.sections.findIndex(s => s.id === sectionId);
      if (idx === -1) return prev;

      const updated = [...prev.sections];

      if (action === 'up' && idx > 0) {
        const temp = updated[idx - 1];
        updated[idx - 1] = updated[idx];
        updated[idx] = temp;
      } else if (action === 'down' && idx < updated.length - 1) {
        const temp = updated[idx + 1];
        updated[idx + 1] = updated[idx];
        updated[idx] = temp;
      } else if (action === 'dup') {
        const target = updated[idx];
        const copy: SiteSection = {
          ...target,
          id: `sec_${target.type}_${Math.random().toString(36).slice(2, 7)}`,
          data: JSON.parse(JSON.stringify(target.data)),
        };
        updated.splice(idx + 1, 0, copy);
      } else if (action === 'hide') {
        updated[idx] = { ...updated[idx], visible: !updated[idx].visible };
      } else if (action === 'del') {
        if (updated.length <= 1) return prev;
        updated.splice(idx, 1);
        if (selectedSectionId === sectionId) {
          setSelectedSectionId(updated[0]?.id || null);
        }
      }

      return { ...prev, sections: updated };
    });
  };

  const handleAddSection = (type: SectionType) => {
    const newSec = createInitialSection(type, undefined, undefined, undefined, project.profile);
    updateProjectWithHistory(prev => ({
      ...prev,
      sections: [...prev.sections, newSec],
    }));
    setSelectedSectionId(newSec.id);
    setMobilePane('canvas');
    triggerToast(`Added ${type} section to page`, 'info');
  };

  const handleApplyTemplate = (templateId: string) => {
    const nextProj = createProjectFromTemplate(templateId, project.profile);
    updateProjectWithHistory(() => nextProj);
    setSelectedSectionId(nextProj.sections[0]?.id || null);
    setMobilePane('canvas');
    triggerToast(`Applied ${templateId} blueprint`, 'success');
  };

  const handleUpdateFloat = (
    sectionId: string,
    floatId: string,
    updates: Partial<FloatingElement>
  ) => {
    updateProjectWithHistory(prev => {
      const updated = prev.sections.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          floats: (s.floats || []).map(f => (f.id === floatId ? { ...f, ...updates } : f)),
        };
      });
      return { ...prev, sections: updated };
    });
  };

  const handleSaveProjectJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.profile.name.toLowerCase().replace(/\s+/g, '-')}-sitecraft.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast('Project JSON downloaded', 'success');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const loaded = JSON.parse(ev.target?.result as string);
        if (loaded && loaded.sections) {
          updateProjectWithHistory(() => loaded);
          setSelectedSectionId(loaded.sections[0]?.id || null);
          triggerToast('Project loaded successfully', 'success');
        }
      } catch {
        triggerToast('Invalid SiteCraft JSON file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCopyHtml = async () => {
    const html = generateStandaloneHtml(project);
    try {
      await navigator.clipboard.writeText(html);
      triggerToast('Standalone HTML copied to clipboard', 'success');
    } catch {
      triggerToast('Failed to copy HTML to clipboard', 'error');
    }
  };

  const handleExportHtmlFile = () => {
    const html = generateStandaloneHtml(project);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute('download', 'index.html');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
    triggerToast('Exported standalone index.html', 'success');
  };

  // Real AI Section Copy Rewrite using active provider & keys
  const handleAiPolishSection = async () => {
    const activeSec = project.sections.find(s => s.id === selectedSectionId) || project.sections[0];
    if (!activeSec) {
      triggerToast('Select a section on the canvas first.', 'info');
      return;
    }

    const cred = getActiveCredential(settings);
    if (cred.provider !== 'gemini' && !cred.apiKey) {
      triggerToast(
        `Add your ${cred.provider.toUpperCase()} API key in AI Settings before using Polish Section.`,
        'error'
      );
      return;
    }
    setIsAiPolishing(true);
    triggerToast(`Refining ${activeSec.type} copy via ${cred.provider.toUpperCase()}...`, 'info');

    try {
      const { ok, data } = await safeFetchJson('/api/section-polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionType: activeSec.type,
          sectionData: activeSec.data,
          brandName: project.profile.name,
          role: project.profile.role,
          provider: cred.provider,
          apiKey: cred.apiKey,
          model: cred.model,
          temperature: settings.temperature,
        }),
      });

      if (!ok || !data?.success || !data?.updatedData) {
        throw new Error(data?.error || 'Failed to polish section copy.');
      }

      updateProjectWithHistory(prev => ({
        ...prev,
        sections: prev.sections.map(s =>
          s.id === activeSec.id
            ? { ...s, data: { ...s.data, ...data.updatedData } }
            : s
        ),
      }));

      triggerToast(`Updated ${activeSec.type} copy directly on canvas.`, 'success');
    } catch (err: any) {
      triggerToast(err.message || 'Section rewrite failed. Check API key in Settings.', 'error');
    } finally {
      setIsAiPolishing(false);
    }
  };

  // Brand Kit Application Handlers
  const handleApplyPalette = (palette: any) => {
    updateProjectWithHistory(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        palette: {
          id: 'custom_ai',
          name: palette.name || 'Custom Brand Palette',
          primary: palette.primary,
          accent: palette.accent,
          bg: palette.bg,
          surface: palette.surface,
          text: palette.text,
          muted: palette.muted,
          border: palette.border,
        },
      },
    }));
    triggerToast('Applied color palette to active site', 'success');
  };

  const handleApplyTypography = (fontH: string, fontB: string) => {
    updateProjectWithHistory(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        fontH,
        fontB,
      },
    }));
    triggerToast(`Applied typography: ${fontH} + ${fontB}`, 'success');
  };

  const handleApplyBrand = (brandName: string) => {
    updateProjectWithHistory(prev => {
      const updatedProfile = {
        ...prev.profile,
        name: brandName,
        first: brandName.split(' ')[0] || brandName,
      };

      const updatedSections = prev.sections.map(s => {
        if (s.type === 'nav') {
          return {
            ...s,
            data: { ...s.data, brand: brandName },
          };
        }
        return s;
      });

      return {
        ...prev,
        title: `${brandName} — ${prev.profile.role}`,
        profile: updatedProfile,
        sections: updatedSections,
      };
    });
    triggerToast(`Updated brand identity to ${brandName}`, 'success');
  };

  const handleApplyCompleteKit = (kit: GeneratedBrandKit) => {
    updateProjectWithHistory(prev => {
      const updatedProfile = {
        ...prev.profile,
        name: kit.brandName,
        first: kit.brandName.split(' ')[0] || kit.brandName,
      };

      const updatedTheme = {
        ...prev.theme,
        palette: {
          id: 'custom_ai',
          name: kit.palette.name || 'Generated Brand',
          primary: kit.palette.primary,
          accent: kit.palette.accent,
          bg: kit.palette.bg,
          surface: kit.palette.surface,
          text: kit.palette.text,
          muted: kit.palette.muted,
          border: kit.palette.border,
        },
        fontH: kit.typography.fontH,
        fontB: kit.typography.fontB,
      };

      const updatedSections = prev.sections.map(s => {
        if (s.type === 'nav') {
          return {
            ...s,
            data: { ...s.data, brand: kit.brandName },
          };
        }
        return s;
      });

      return {
        ...prev,
        title: `${kit.brandName} — ${prev.profile.role}`,
        profile: updatedProfile,
        theme: updatedTheme,
        sections: updatedSections,
      };
    });
    triggerToast('Applied full brand system to project', 'success');
  };

  const handleAddFloatingLogo = (logoConcept: any) => {
    updateProjectWithHistory(prev => {
      const targetSec = prev.sections.find(s => s.id === selectedSectionId) || prev.sections[0];
      if (!targetSec) return prev;

      const newFloat: FloatingElement = {
        id: `fl_logo_${Math.random().toString(36).slice(2, 7)}`,
        kind: 'threeLogo',
        x: 75,
        y: 20,
        w: 180,
        h: 180,
        motion: 'float',
        hover: 'glow',
        threeLogoData: logoConcept.proceduralDetails,
      };

      const updated = prev.sections.map(s => {
        if (s.id !== targetSec.id) return s;
        return {
          ...s,
          floats: [...(s.floats || []), newFloat],
        };
      });

      return { ...prev, sections: updated };
    });
    triggerToast(`Added 3D ${logoConcept.name} mark to section`, 'success');
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-65px)] bg-zinc-950 overflow-hidden font-sans relative">
      {/* Top Builder Toolbar */}
      <div className="h-14 bg-zinc-950 border-b border-zinc-900 px-2.5 sm:px-4 flex items-center justify-between gap-2 sm:gap-4 shrink-0 z-20 relative">
        {/* Left: Workspace History & Templates */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <span className="text-xs font-semibold text-zinc-300 tracking-tight whitespace-nowrap hidden xl:inline">
            Workbench
          </span>

          <div className="h-4 w-px bg-zinc-800 hidden xl:block" />

          {/* Undo / Redo (Desktop & Tablet) */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIdx <= 0}
              title="Undo"
              className="p-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIdx >= history.length - 1}
              title="Redo"
              className="p-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

          {/* Layout Templates Gallery Switcher */}
          <button
            type="button"
            onClick={() => setIsTemplateModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 sm:py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
            title="Switch website template"
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden xs:inline sm:inline">Templates</span>
          </button>
        </div>

        {/* Center: Device Viewport Switcher & Preview Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="flex items-center bg-zinc-900 p-0.5 rounded-md border border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setDevice('desktop');
                setMobilePane('canvas');
              }}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                device === 'desktop'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Desktop View (1280px)"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Desktop</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDevice('tablet');
                setMobilePane('canvas');
              }}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                device === 'tablet'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tablet</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDevice('mobile');
                setMobilePane('canvas');
              }}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                device === 'mobile'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Mobile View (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Mobile</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-md flex items-center gap-1.5 text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
              previewMode
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white'
            }`}
            title={previewMode ? 'Exit Live Preview' : 'Preview Full Website'}
          >
            {previewMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{previewMode ? 'Exit Preview' : 'Preview'}</span>
          </button>
        </div>

        {/* Right: Brand System, AI Copy Polish, Save/Open, Copy & Export */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsBrandModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 sm:py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
            title="Colors, fonts, and 3D logo marks"
          >
            <Palette className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">Brand Kit</span>
          </button>

          <button
            type="button"
            onClick={handleAiPolishSection}
            disabled={isAiPolishing}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-md text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
            title="Rewrite selected section copy using active AI provider"
          >
            <Wand2 className="w-3.5 h-3.5 text-blue-400" />
            <span>{isAiPolishing ? 'Rewriting...' : 'Polish'}</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="hidden lg:flex p-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs transition-colors cursor-pointer"
            title="Open Project JSON"
          >
            <FolderOpen className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleSaveProjectJson}
            className="hidden lg:flex p-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs transition-colors cursor-pointer"
            title="Save Project JSON"
          >
            <Save className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleCopyHtml}
            className="hidden xl:flex px-2.5 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-medium transition-colors items-center gap-1.5 cursor-pointer whitespace-nowrap"
            title="Copy standalone HTML"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Copy HTML</span>
          </button>

          <button
            type="button"
            onClick={handleExportHtmlFile}
            className="px-2.5 sm:px-3.5 py-2 sm:py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            title="Download standalone index.html"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Compact More Menu (Mobile & Tablet tools) */}
          <div className="relative xl:hidden">
            <button
              type="button"
              onClick={() => setIsMoreMenuOpen(prev => !prev)}
              className="p-2 sm:p-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors cursor-pointer"
              title="More actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMoreMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsMoreMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-52 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-1.5 z-40 text-xs text-zinc-200 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      handleUndo();
                      setIsMoreMenuOpen(false);
                    }}
                    disabled={historyIdx <= 0}
                    className="sm:hidden w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-zinc-900 disabled:opacity-40 text-left cursor-pointer"
                  >
                    <Undo2 className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Undo Change</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleRedo();
                      setIsMoreMenuOpen(false);
                    }}
                    disabled={historyIdx >= history.length - 1}
                    className="sm:hidden w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-zinc-900 disabled:opacity-40 text-left cursor-pointer"
                  >
                    <Redo2 className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Redo Change</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      handleAiPolishSection();
                    }}
                    disabled={isAiPolishing}
                    className="md:hidden w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-zinc-900 disabled:opacity-40 text-left cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>{isAiPolishing ? 'Rewriting Section...' : 'AI Polish Section'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      handleCopyHtml();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-zinc-900 text-left cursor-pointer"
                  >
                    <Code className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Copy HTML Code</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className="lg:hidden w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-zinc-900 text-left cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Import Project JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      handleSaveProjectJson();
                    }}
                    className="lg:hidden w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-zinc-900 text-left cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Save Project JSON</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Workspace Body (Responsive Single-Pane on Mobile/Tablet, 3-Pane on Desktop lg+) */}
      <div className="flex flex-1 min-h-0 relative">
        {!previewMode && (
          <div
            className={`${
              mobilePane === 'layers' ? 'flex w-full lg:w-72' : 'hidden lg:flex lg:w-72'
            } h-full min-h-0 shrink-0`}
          >
            <SiteLayers
              project={project}
              selectedSectionId={selectedSectionId}
              onSelectSection={setSelectedSectionId}
              onUpdateProject={updateProjectWithHistory}
              onSectionAction={handleSectionAction}
              onAddSection={handleAddSection}
              onApplyTemplate={handleApplyTemplate}
              settings={settings}
              triggerToast={triggerToast}
              onOpenSettings={onOpenSettings}
              onMobileDone={() => setMobilePane('canvas')}
            />
          </div>
        )}

        <div
          className={`${
            mobilePane === 'canvas' || previewMode ? 'flex' : 'hidden lg:flex'
          } flex-1 min-w-0 h-full min-h-0`}
        >
          <SiteCanvas
            project={project}
            device={device}
            previewMode={previewMode}
            selectedSectionId={selectedSectionId}
            selectedFloatId={selectedFloatId}
            onSelectSection={setSelectedSectionId}
            onSelectFloat={setSelectedFloatId}
            onUpdateSectionData={handleUpdateSectionData}
            onSectionAction={handleSectionAction}
            onUpdateFloat={handleUpdateFloat}
            onMobileEditSection={() => setMobilePane('inspector')}
          />
        </div>

        {!previewMode && (
          <div
            className={`${
              mobilePane === 'inspector' ? 'flex w-full lg:w-80' : 'hidden lg:flex lg:w-80'
            } h-full min-h-0 shrink-0`}
          >
            <SiteInspector
              project={project}
              selectedSectionId={selectedSectionId}
              selectedFloatId={selectedFloatId}
              onUpdateProject={updateProjectWithHistory}
              onSelectFloat={setSelectedFloatId}
              onMobileDone={() => setMobilePane('canvas')}
            />
          </div>
        )}
      </div>

      {/* Mobile Bottom Studio Navigation Bar (< lg only) */}
      {!previewMode ? (
        <div className="lg:hidden grid grid-cols-3 h-14 bg-zinc-950 border-t border-zinc-800 shrink-0 z-30">
          <button
            type="button"
            onClick={() => setMobilePane('canvas')}
            className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
              mobilePane === 'canvas'
                ? 'text-blue-400 bg-zinc-900/70'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Website</span>
          </button>

          <button
            type="button"
            onClick={() => setMobilePane('layers')}
            className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors cursor-pointer border-x border-zinc-900 ${
              mobilePane === 'layers'
                ? 'text-blue-400 bg-zinc-900/70'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Sections</span>
          </button>

          <button
            type="button"
            onClick={() => setMobilePane('inspector')}
            className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
              mobilePane === 'inspector'
                ? 'text-blue-400 bg-zinc-900/70'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Edit &amp; Style</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPreviewMode(false)}
          className="lg:hidden fixed bottom-4 right-4 z-40 flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-zinc-950/95 border border-zinc-700 text-white text-xs font-medium shadow-xl backdrop-blur-md cursor-pointer"
        >
          <EyeOff className="w-3.5 h-3.5 text-emerald-400" />
          <span>Exit Preview</span>
        </button>
      )}

      {/* AI Brand Kit Modal with 3D Three.js Logos */}
      <BrandKitModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        project={project}
        settings={settings}
        onApplyPalette={handleApplyPalette}
        onApplyTypography={handleApplyTypography}
        onApplyBrand={handleApplyBrand}
        onApplyCompleteKit={handleApplyCompleteKit}
        onAddFloatingLogo={handleAddFloatingLogo}
        triggerToast={triggerToast}
        onOpenSettings={onOpenSettings}
      />

      {/* Layout Archetypes Gallery Modal */}
      <TemplateGalleryModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        activeTemplateId={project.tid}
        onSelectTemplate={handleApplyTemplate}
      />
    </div>
  );
};
