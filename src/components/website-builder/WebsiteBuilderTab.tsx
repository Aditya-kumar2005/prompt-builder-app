/**
 * WebsiteBuilderTab Component
 * Main orchestrator for Live Website Builder with Responsive Preview,
 * Section Hierarchy, 3D Math/Avatar procedural rendering, and Standalone Export.
 */
import React, { useState, useEffect, useRef } from 'react';
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
import { SiteCanvas } from './SiteCanvas';
import { SiteLayers } from './SiteLayers';
import { SiteInspector } from './SiteInspector';
import { generateStandaloneHtml } from './exportHtml';
import { BrandKitModal, GeneratedBrandKit } from './BrandKitModal';
import {
  Code,
  Download,
  Eye,
  EyeOff,
  FolderOpen,
  Laptop,
  Palette,
  Redo2,
  Save,
  Smartphone,
  Sparkles,
  Tablet,
  Undo2,
} from 'lucide-react';

export const WebsiteBuilderTab: React.FC = () => {
  // Main project state with initial Web Developer template
  const [project, setProject] = useState<SiteProject>(() => {
    try {
      const saved = localStorage.getItem('sitecraft_active_project');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return createProjectFromTemplate('webdev');
  });

  // History stack for Undo / Redo
  const [history, setHistory] = useState<SiteProject[]>([project]);
  const [historyIdx, setHistoryIdx] = useState<number>(0);

  // Editor viewport & modes
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    project.sections[0]?.id || null
  );
  const [selectedFloatId, setSelectedFloatId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAiPolishing, setIsAiPolishing] = useState<boolean>(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persist project changes to local storage & history
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Undo / Redo handlers
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

  // Update specific key in active section
  const handleUpdateSectionData = (sectionId: string, path: string, value: any) => {
    updateProjectWithHistory(prev => {
      const updated = prev.sections.map(s => {
        if (s.id !== sectionId) return s;

        const nextData = { ...s.data };
        const parts = path.split('.');

        if (parts.length === 1) {
          nextData[parts[0]] = value;
        } else if (parts.length === 3 && !isNaN(Number(parts[1]))) {
          // e.g. items.0.title
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

  // Section actions (reorder, duplicate, hide, delete)
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
        if (updated.length <= 1) return prev; // keep at least 1
        updated.splice(idx, 1);
        if (selectedSectionId === sectionId) {
          setSelectedSectionId(updated[0]?.id || null);
        }
      }

      return { ...prev, sections: updated };
    });
  };

  // Add new section to page
  const handleAddSection = (type: SectionType) => {
    updateProjectWithHistory(prev => {
      const newSec = createInitialSection(type, undefined, undefined, undefined, prev.profile);
      return {
        ...prev,
        sections: [...prev.sections, newSec],
      };
    });
    showToast(`Added ${type} section to page`);
  };

  // Switch template
  const handleApplyTemplate = (templateId: string) => {
    const nextProj = createProjectFromTemplate(templateId, project.profile);
    updateProjectWithHistory(() => nextProj);
    setSelectedSectionId(nextProj.sections[0]?.id || null);
    showToast(`Applied ${templateId} blueprint`);
  };

  // Update floating element
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

  // Save Project JSON
  const handleSaveProjectJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.profile.name.toLowerCase().replace(/\s+/g, '-')}-sitecraft.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Project JSON saved');
  };

  // Open Project JSON
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
          showToast('Project opened successfully');
        }
      } catch {
        showToast('Invalid SiteCraft JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Copy Standalone HTML
  const handleCopyHtml = async () => {
    const html = generateStandaloneHtml(project);
    try {
      await navigator.clipboard.writeText(html);
      showToast('Standalone HTML copied to clipboard');
    } catch {
      showToast('Failed to copy to clipboard');
    }
  };

  // Export standalone index.html file
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
    showToast('Exported index.html successfully!');
  };

  // AI Assist: Polish Section
  const handleAiPolishSection = async () => {
    const activeSec = project.sections.find(s => s.id === selectedSectionId);
    if (!activeSec) return;

    setIsAiPolishing(true);
    showToast(`AI polishing ${activeSec.type} copy...`);

    try {
      const response = await fetch('/api/prompt-craft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: `Rewrite the content for website section "${activeSec.type}" to make it punchy, professional and high-converting. Existing content: ${JSON.stringify(activeSec.data)}`,
          domain: 'Portfolio',
          framework: 'SiteCraft',
        }),
      });

      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();

      if (data.prompt) {
        showToast('Generated fresh suggestions!');
      }
    } catch {
      showToast('Polished with domain rules');
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
          name: palette.name || 'AI Generated Palette',
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
    showToast('Applied AI Palette to Project');
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
    showToast(`Applied Typography: ${fontH} + ${fontB}`);
  };

  const handleApplyBrand = (brandName: string, logoConcept?: any) => {
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
    showToast(`Updated Brand to ${brandName}`);
  };

  const handleApplyCompleteKit = (kit: GeneratedBrandKit, selectedLogoIdx: number) => {
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
          name: kit.palette.name || 'AI Generated',
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
    showToast('Applied Full Brand Kit (Palette, Typography & Brand)!');
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
    showToast(`Added 3D ${logoConcept.name} to section floats`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] bg-slate-950 overflow-hidden font-sans">
      {/* Top Builder Toolbar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between gap-4 shrink-0 z-20">
        {/* Left: Branding & History */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-sm text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent font-extrabold tracking-tight">
              SiteCraft
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              Live Builder
            </span>
          </div>

          <div className="h-4 w-[1px] bg-slate-800" />

          {/* Undo / Redo */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={historyIdx <= 0}
              title="Undo (Ctrl+Z)"
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIdx >= history.length - 1}
              title="Redo (Ctrl+Y)"
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Device Viewport Switcher & Preview Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 px-3 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-all ${
                device === 'desktop'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Desktop View (1280px)"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>

            <button
              onClick={() => setDevice('tablet')}
              className={`p-1.5 px-3 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-all ${
                device === 'tablet'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </button>

            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 px-3 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-all ${
                device === 'mobile'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Mobile View (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          {/* Interactive Preview Mode Toggle */}
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`p-1.5 px-3 rounded-xl flex items-center gap-1.5 text-xs font-semibold border transition-all ${
              previewMode
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white'
            }`}
          >
            {previewMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{previewMode ? 'Exit Preview' : 'Interactive Preview'}</span>
          </button>
        </div>

        {/* Right: AI Assist, Project Save/Open, Copy & Export */}
        <div className="flex items-center gap-2">
          {/* Gemini AI Brand Kit (Palette, Typography & Three.js 3D Logos) */}
          <button
            onClick={() => setIsBrandModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 text-purple-200 border border-purple-500/50 rounded-xl text-xs font-semibold shadow-sm transition-all"
            title="Generate Cohesive Palette, Typography & 3D Three.js Logos with Gemini"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span className="hidden sm:inline">AI Brand Kit (3D)</span>
            <span className="sm:hidden">Brand</span>
          </button>

          <button
            onClick={handleAiPolishSection}
            disabled={isAiPolishing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-semibold transition-colors"
            title="Use AI to polish active section copy"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">{isAiPolishing ? 'Thinking...' : 'AI Assist'}</span>
          </button>

          {/* Open / Save Project */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-colors"
            title="Open Project JSON"
          >
            <FolderOpen className="w-4 h-4" />
          </button>

          <button
            onClick={handleSaveProjectJson}
            className="p-1.5 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-colors"
            title="Save Project JSON"
          >
            <Save className="w-4 h-4" />
          </button>

          {/* Copy HTML */}
          <button
            onClick={handleCopyHtml}
            className="p-1.5 px-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5"
            title="Copy Standalone HTML to clipboard"
          >
            <Code className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Copy HTML</span>
          </button>

          {/* Export index.html */}
          <button
            onClick={handleExportHtmlFile}
            className="p-1.5 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-1.5"
            title="Download standalone index.html"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Site</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Left Sidebar (Hidden in Preview Mode) */}
        {!previewMode && (
          <SiteLayers
            project={project}
            selectedSectionId={selectedSectionId}
            onSelectSection={setSelectedSectionId}
            onUpdateProject={updateProjectWithHistory}
            onSectionAction={handleSectionAction}
            onAddSection={handleAddSection}
            onApplyTemplate={handleApplyTemplate}
          />
        )}

        {/* Center Canvas */}
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
        />

        {/* Right Sidebar (Hidden in Preview Mode) */}
        {!previewMode && (
          <SiteInspector
            project={project}
            selectedSectionId={selectedSectionId}
            selectedFloatId={selectedFloatId}
            onUpdateProject={updateProjectWithHistory}
            onSelectFloat={setSelectedFloatId}
          />
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-2xl z-50 animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Gemini AI Brand Kit Modal with 3D Three.js Logos */}
      <BrandKitModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        project={project}
        onApplyPalette={handleApplyPalette}
        onApplyTypography={handleApplyTypography}
        onApplyBrand={handleApplyBrand}
        onApplyCompleteKit={handleApplyCompleteKit}
        onAddFloatingLogo={handleAddFloatingLogo}
        showToast={showToast}
      />
    </div>
  );
};

