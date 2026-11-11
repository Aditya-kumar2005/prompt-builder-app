/**
 * TemplateGalleryModal Component
 * Interactive template browser allowing users to switch between 10+ production-ready website archetypes,
 * with live palette swatches, typography pairing, section lists, and 1-click project loading.
 */
import React, { useState } from 'react';
import { TEMPLATE_PRESETS } from './builderDefaults';
import { TemplatePreset } from './builderTypes';
import {
  LayoutTemplate,
  X,
  Check,
  Sparkles,
  ArrowRight,
  Palette,
  Layers,
  Search,
} from 'lucide-react';

interface TemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
}

export const TemplateGalleryModal: React.FC<TemplateGalleryModalProps> = ({
  isOpen,
  onClose,
  activeTemplateId,
  onSelectTemplate,
}) => {
  const [filter, setFilter] = useState<'all' | 'dev' | 'design' | 'saas'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredPresets = TEMPLATE_PRESETS.filter(preset => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'dev' && ['webdev', 'fullstack', 'java', 'devops'].includes(preset.id)) ||
      (filter === 'design' && ['uiux', 'creative', 'minimal'].includes(preset.id)) ||
      (filter === 'saas' && ['enterprise', 'saas', 'agency'].includes(preset.id));

    const matchesSearch =
      preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.tag.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Layout Templates Gallery
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {TEMPLATE_PRESETS.length} Archetypes
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Choose a pre-built responsive layout archetype to replace the canvas sections instantly
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['all', 'dev', 'design', 'saas'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filter === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {cat === 'all'
                  ? 'All Layouts'
                  : cat === 'dev'
                  ? 'Engineering'
                  : cat === 'design'
                  ? 'Design & Creative'
                  : 'SaaS & Enterprise'}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search layout presets..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPresets.map(preset => {
            const isCurrent = activeTemplateId === preset.id;
            const pal = preset.theme.palette;

            return (
              <div
                key={preset.id}
                className={`bg-slate-950/70 border rounded-2xl p-5 flex flex-col justify-between transition-all group ${
                  isCurrent
                    ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-950/20'
                    : 'border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                }`}
              >
                <div className="space-y-3">
                  {/* Top: Emoji, Title, Tag & Current Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-2 rounded-xl bg-slate-900 border border-slate-800">
                        {preset.emoji}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {preset.name}
                        </h3>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {preset.tag}
                        </span>
                      </div>
                    </div>

                    {isCurrent && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    )}
                  </div>

                  {/* Palette & Typography Tag */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-850 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-500">Palette:</span>
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: pal.primary }} />
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: pal.accent }} />
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: pal.bg }} />
                      </div>
                      <span className="text-[11px] text-slate-300 font-mono">{pal.name}</span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono">
                      {preset.theme.fontH} + {preset.theme.fontB}
                    </div>
                  </div>

                  {/* Included Sections Pills */}
                  <div className="flex flex-wrap gap-1 text-[10px] text-slate-400">
                    {preset.layout.map(([secType], i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 capitalize"
                      >
                        {secType}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="pt-4 mt-2 border-t border-slate-850 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {preset.layout.length} Sections
                  </span>

                  <button
                    onClick={() => {
                      onSelectTemplate(preset.id);
                      onClose();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-slate-800 text-slate-300 hover:text-white'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                    }`}
                  >
                    <span>{isCurrent ? 'Reload Template' : 'Load This Template'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
