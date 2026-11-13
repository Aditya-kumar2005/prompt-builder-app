/**
 * TemplateGalleryModal Component
 * Clean layout archetype switcher with color palette preview, font pairing,
 * section structure list, and instant load triggers.
 */
import React, { useState } from 'react';
import { TEMPLATE_PRESETS } from './builderDefaults';
import {
  ArrowRight,
  Check,
  LayoutTemplate,
  Search,
  X,
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden text-zinc-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-blue-400">
              <LayoutTemplate className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                Layout Archetypes ({TEMPLATE_PRESETS.length})
              </h2>
              <p className="text-xs text-zinc-400">
                Load a complete responsive blueprint onto the live editing canvas
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-6 py-3 border-b border-zinc-800 bg-zinc-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-md border border-zinc-800">
            {(['all', 'dev', 'design', 'saas'] as const).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`px-3 py-1 rounded text-xs font-medium capitalize transition-colors cursor-pointer ${
                  filter === cat
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {cat === 'all'
                  ? 'All'
                  : cat === 'dev'
                  ? 'Engineering'
                  : cat === 'design'
                  ? 'Design'
                  : 'SaaS'}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search blueprints..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-blue-500"
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
                className={`bg-zinc-950 border rounded-lg p-5 flex flex-col justify-between transition-colors ${
                  isCurrent
                    ? 'border-blue-500 ring-1 ring-blue-500/30'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {preset.name}
                      </h3>
                      <span className="text-xs text-zinc-400">
                        {preset.tag}
                      </span>
                    </div>

                    {isCurrent && (
                      <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </span>
                    )}
                  </div>

                  {/* Palette & Font */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-900 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: pal.primary }} />
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: pal.accent }} />
                      <span className="w-3 h-3 rounded-sm border border-zinc-700" style={{ backgroundColor: pal.bg }} />
                      <span className="text-[11px] text-zinc-300 font-mono ml-1">{pal.name}</span>
                    </div>

                    <div className="text-[11px] text-zinc-400 font-mono">
                      {preset.theme.fontH} + {preset.theme.fontB}
                    </div>
                  </div>

                  {/* Concise Section Sequence */}
                  <div className="text-[11px] font-mono text-zinc-500 leading-relaxed capitalize">
                    {preset.layout.map(([secType]) => secType).join(' · ')}
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-zinc-900 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500 font-mono tabular-nums">
                    {preset.layout.length} sections
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectTemplate(preset.id);
                      onClose();
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    <span>{isCurrent ? 'Reload Archetype' : 'Load Blueprint'}</span>
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
