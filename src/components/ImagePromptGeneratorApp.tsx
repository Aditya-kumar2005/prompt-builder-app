/**
 * ImagePromptGeneratorApp Component
 * Visual prompt workstation for Midjourney v6.1, DALL-E 3, Flux.1, Canva Magic Media, and Imagen 3.
 * Supports multi-variation prompt generation, negative prompt exclusions, and batch export (.TXT, .MD, .JSON).
 */
import React, { useState } from 'react';
import {
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  Camera,
  Check,
  Copy,
  Dices,
  Download,
  Info,
  Layers,
  Palette,
  RefreshCw,
  Sun,
  Wand2,
} from 'lucide-react';
import { AISettings, getActiveCredential, safeFetchJson } from '../types/ai';

interface ImagePromptGeneratorAppProps {
  settings: AISettings;
  triggerToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onOpenSettings?: () => void;
}

interface PromptVariation {
  id: string;
  styleLabel: string;
  fullPrompt: string;
  negativePrompt: string;
  engineParameters: string;
  breakdown: {
    subject: string;
    composition: string;
    lighting: string;
    camera: string;
    colorPalette: string;
  };
  rationale: string;
}

const TARGET_ENGINES = [
  { id: 'midjourney', name: 'Midjourney v6.1', meta: 'Parameters & Flags', desc: 'Adds --ar, --v 6.1, --style raw, and stylize flags' },
  { id: 'dalle3', name: 'DALL-E 3', meta: 'Descriptive Prose', desc: 'High-detail narrative scenes for OpenAI image models' },
  { id: 'flux', name: 'Flux.1 Dev', meta: 'Prompt Fidelity', desc: 'Structured compositions and embedded typography accuracy' },
  { id: 'canva', name: 'Canva Magic Media', meta: 'Commercial Clean', desc: 'Hero visuals, editorial mockups, and brand assets' },
  { id: 'imagen', name: 'Google Imagen 3', meta: 'Photoreal Optics', desc: 'Natural materials, lens physics, and balanced grain' },
];

const ART_STYLES = [
  '35mm Analog Film (Kodak Portra 400)',
  'Architectural Product Photography',
  'Cinematic Film Still (Anamorphic)',
  'Hyperrealistic 3D Render',
  'Macro Material Photography',
  'Isometric 3D Architectural',
  'Editorial Fashion Photography',
  'Minimalist Vector Illustration',
  'Digital Matte Concept Art',
  'Tactile Claymation Diorama',
];

const CAMERAS = [
  '85mm f/1.4 Lens, Shallow Depth of Field',
  '24mm Wide-Angle Architectural Shift',
  '100mm Macro Close-Up Focus',
  'Top-Down Overhead Flatlay',
  'Low-Angle Hero Perspective',
  'Medium Format Hasselblad 100MP',
];

const LIGHTINGS = [
  'Volumetric Golden Hour Sunlight',
  'Soft Overhead Studio Softbox',
  'Moody Chiaroscuro Side Key',
  'Overcast Diffused Natural Daylight',
  'Harsh Noon Sun with Geometric Shadows',
  'Warm Tungsten Interior Ambient',
];

const COLOR_MOODS = [
  'Muted Warm Earth & Slate',
  'Teal & Amber Natural Cinema',
  'Monochrome High-Contrast Noir',
  'Kodachrome 1970s Film Stock',
  'Clean Neutral Titanium & Bone',
  'Soft Nordic Pastels',
];

const ASPECT_RATIOS = [
  { id: '16:9', label: '16:9 Landscape' },
  { id: '1:1', label: '1:1 Square' },
  { id: '9:16', label: '9:16 Vertical' },
  { id: '4:5', label: '4:5 Portrait' },
  { id: '21:9', label: '21:9 Cinema' },
  { id: '3:2', label: '3:2 Classic' },
];

const SURPRISE_INSPIRATIONS = [
  'Minimalist brutalist concrete pavilion cantilevered over a misty Nordic fjord at sunrise',
  'Matte anodized aluminum audio console resting on walnut timber beside a rain-streaked studio window',
  'Cutaway isometric architectural model of a botanical greenhouse crafted from basswood and brass',
  'Overhead flatlay of vintage mechanical rangefinder camera disassembled cleanly on textured linen paper',
  'Ceramic pour-over coffee carafe steaming in morning window light on honed travertine counter',
];

export const ImagePromptGeneratorApp: React.FC<ImagePromptGeneratorAppProps> = ({
  settings,
  triggerToast,
  onOpenSettings,
}) => {
  const [subject, setSubject] = useState(
    'Precision anodized aluminum audio dial and warm oscilloscope trace resting on a dark walnut studio desk'
  );
  const [targetEngine, setTargetEngine] = useState('midjourney');
  const [artStyle, setArtStyle] = useState('Architectural Product Photography');
  const [camera, setCamera] = useState('85mm f/1.4 Lens, Shallow Depth of Field');
  const [lighting, setLighting] = useState('Soft Overhead Studio Softbox');
  const [colorMood, setColorMood] = useState('Muted Warm Earth & Slate');
  const [aspectRatio, setAspectRatio] = useState('16:9');

  const [qualityFlags] = useState<string[]>([
    'high surface detail',
    'natural grain',
    'calibrated dynamic range',
  ]);
  const [negativePrompts, setNegativePrompts] = useState<string[]>([
    'blurry',
    'distorted anatomy',
    'extra limbs',
    'watermark',
    'oversaturated',
    'pixelated',
  ]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [variations, setVariations] = useState<PromptVariation[] | null>(null);
  const [creativeTips, setCreativeTips] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedPrompts, setSavedPrompts] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sitecraft_saved_image_prompts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const cred = getActiveCredential(settings);
  const missingCustomKey = cred.provider !== 'gemini' && !cred.apiKey;

  const handleRollDice = () => {
    const random = SURPRISE_INSPIRATIONS[Math.floor(Math.random() * SURPRISE_INSPIRATIONS.length)];
    setSubject(random);
    triggerToast('Loaded new visual subject', 'info');
  };

  const handleGeneratePrompts = async () => {
    if (!subject.trim()) {
      triggerToast('Enter an image subject or scene concept first.', 'error');
      return;
    }
    if (missingCustomKey) {
      const msg = `Add your ${cred.provider.toUpperCase()} API key in AI Settings before generating.`;
      setErrorMsg(msg);
      triggerToast(msg, 'error');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { ok, data: res } = await safeFetchJson('/api/image-prompt-craft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          targetEngine,
          artStyle,
          camera,
          lighting,
          colorMood,
          aspectRatio,
          qualityFlags,
          negativePrompts,
          provider: cred.provider,
          apiKey: cred.apiKey,
          model: cred.model,
          temperature: settings.temperature,
        }),
      });

      if (!ok || !res?.success) {
        throw new Error(res?.error || 'Failed to generate image prompts.');
      }

      setVariations(res.data.variations || []);
      setCreativeTips(res.data.creativeTips || []);
      triggerToast('Generated 4 image prompt variations', 'success');
    } catch (err: any) {
      const msg = err.message || 'Failed to generate image prompts.';
      setErrorMsg(msg);
      triggerToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    triggerToast('Prompt copied to clipboard', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleSave = (promptText: string) => {
    let next: string[];
    if (savedPrompts.includes(promptText)) {
      next = savedPrompts.filter(p => p !== promptText);
      triggerToast('Removed from saved prompts', 'info');
    } else {
      next = [promptText, ...savedPrompts];
      triggerToast('Saved image prompt', 'success');
    }
    setSavedPrompts(next);
    try {
      localStorage.setItem('sitecraft_saved_image_prompts', JSON.stringify(next));
    } catch {}
  };

  const handleExportAll = (format: 'txt' | 'md' | 'json' = 'txt') => {
    if (!variations || variations.length === 0) {
      triggerToast('Generate variations before exporting.', 'error');
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    let fileContent = '';
    const fileName = `sitecraft-image-prompts-${targetEngine}-${timestamp}.${format}`;
    let mimeType = 'text/plain';

    if (format === 'json') {
      mimeType = 'application/json';
      fileContent = JSON.stringify(
        {
          metadata: {
            generator: 'SiteCraft Image Prompt Studio',
            targetEngine,
            subject,
            artStyle,
            aspectRatio,
            exportedAt: new Date().toISOString(),
          },
          variations,
          creativeTips,
        },
        null,
        2
      );
    } else if (format === 'md') {
      fileContent = `# Image Prompts Export\n\n` +
        `**Target Engine**: ${targetEngine.toUpperCase()}\n` +
        `**Subject**: ${subject}\n` +
        `**Style**: ${artStyle} | **Aspect Ratio**: ${aspectRatio}\n\n---\n\n` +
        variations
          .map(
            (v, idx) =>
              `## Variation ${idx + 1}: ${v.styleLabel}\n\n` +
              `\`\`\`text\n${v.fullPrompt}\n\`\`\`\n\n` +
              (v.negativePrompt ? `**Negative**: ${v.negativePrompt}\n\n` : '') +
              `- **Parameters**: \`${v.engineParameters}\`\n` +
              `- **Camera**: ${v.breakdown.camera}\n` +
              `- **Lighting**: ${v.breakdown.lighting}\n\n---\n`
          )
          .join('\n');
    } else {
      const separator = '='.repeat(80);
      const subSeparator = '-'.repeat(80);

      fileContent =
        `${separator}\n` +
        `SITECRAFT IMAGE PROMPT EXPORT - 4 VARIATIONS\n` +
        `Target AI Engine : ${targetEngine.toUpperCase()}\n` +
        `Subject          : "${subject}"\n` +
        `Style            : ${artStyle}\n` +
        `Aspect Ratio     : ${aspectRatio}\n` +
        `${separator}\n\n` +
        variations
          .map(
            (v, idx) =>
              `[VARIATION ${idx + 1}] ${v.styleLabel.toUpperCase()}\n` +
              `${subSeparator}\n` +
              `PROMPT:\n${v.fullPrompt}\n\n` +
              (v.negativePrompt ? `NEGATIVE PROMPT:\n${v.negativePrompt}\n\n` : '') +
              `ENGINE PARAMETERS:\n${v.engineParameters}\n\n` +
              `CAMERA  : ${v.breakdown.camera}\n` +
              `LIGHT   : ${v.breakdown.lighting}\n` +
              `COLOR   : ${v.breakdown.colorPalette}\n` +
              `NOTES   : ${v.rationale}\n\n`
          )
          .join(`${separator}\n\n`);
    }

    const blob = new Blob([fileContent], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    triggerToast(`Exported ${fileName}`, 'success');
  };

  return (
    <div className="space-y-6">
      {missingCustomKey && (
        <div className="p-3.5 rounded-lg border border-amber-500/40 bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-100 block">
                {cred.provider === 'claude' ? 'Anthropic Claude' : 'OpenAI'} API key required
              </span>
              <span className="text-[11px] text-amber-200/80">
                Your active provider has no saved key in localStorage. Add a key in Settings or switch to Gemini.
              </span>
            </div>
          </div>
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="px-3 py-1.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-100 font-medium text-xs transition-colors cursor-pointer whitespace-nowrap self-start sm:self-center"
            >
              Open AI Settings
            </button>
          )}
        </div>
      )}
      {/* Top Engine Selector */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-semibold text-white">
              Visual Image Prompt Studio
            </h2>
            <p className="text-xs text-zinc-400">
              Compile camera-accurate prompt variations formatted for Midjourney, DALL-E 3, Flux, Canva, and Imagen 3
            </p>
          </div>

          <button
            type="button"
            onClick={handleRollDice}
            className="self-start md:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-medium transition-colors cursor-pointer"
          >
            <Dices className="w-3.5 h-3.5 text-blue-400" />
            <span>Random Concept</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {TARGET_ENGINES.map(eng => {
            const isSelected = targetEngine === eng.id;
            return (
              <button
                key={eng.id}
                type="button"
                onClick={() => setTargetEngine(eng.id)}
                className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-zinc-950 text-white'
                    : 'border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div className="text-xs font-semibold">{eng.name}</div>
                <div className="text-[11px] text-blue-400 font-mono mt-0.5">{eng.meta}</div>
                <div className="text-[11px] text-zinc-500 mt-1 line-clamp-1">{eng.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Controls */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white">
                Subject &amp; Scene Concept
              </label>
              <span className="text-[11px] text-zinc-500 font-mono">Describe materials &amp; action</span>
            </div>
            <textarea
              rows={3}
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Describe your focal subject, setting, and surface textures..."
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500 rounded-md p-3 text-xs text-white placeholder-zinc-500 outline-none"
            />
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-2">
            <label className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-blue-400" />
              <span>Medium &amp; Art Direction</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ART_STYLES.map(style => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setArtStyle(style)}
                  className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer ${
                    artStyle === style
                      ? 'bg-blue-600 text-white font-medium'
                      : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-2">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-blue-400" />
                <span>Camera Optics</span>
              </label>
              <select
                value={camera}
                onChange={e => setCamera(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2 text-xs text-white outline-none focus:border-blue-500"
              >
                {CAMERAS.map(cam => (
                  <option key={cam} value={cam}>
                    {cam}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-2">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-blue-400" />
                <span>Lighting</span>
              </label>
              <select
                value={lighting}
                onChange={e => setLighting(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2 text-xs text-white outline-none focus:border-blue-500"
              >
                {LIGHTINGS.map(light => (
                  <option key={light} value={light}>
                    {light}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-2">
              <label className="text-xs font-semibold text-white">Color Palette</label>
              <select
                value={colorMood}
                onChange={e => setColorMood(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2 text-xs text-white outline-none focus:border-blue-500"
              >
                {COLOR_MOODS.map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-2">
              <label className="text-xs font-semibold text-white">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-1">
                {ASPECT_RATIOS.map(ar => (
                  <button
                    key={ar.id}
                    type="button"
                    onClick={() => setAspectRatio(ar.id)}
                    className={`py-1.5 px-1 rounded border text-center transition-colors cursor-pointer ${
                      aspectRatio === ar.id
                        ? 'border-blue-500 bg-zinc-950 text-white font-semibold'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="text-[11px] font-mono tabular-nums">{ar.id}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300">
                Negative Exclusions
              </label>
              <span className="text-[11px] text-zinc-500">Toggle excluded artifacts</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                'blurry',
                'extra limbs',
                'distorted anatomy',
                'watermark',
                'text artifacts',
                'lowres',
                'oversaturated',
                'bad hands',
                'cropped',
              ].map(tag => {
                const isIncluded = negativePrompts.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (isIncluded) {
                        setNegativePrompts(negativePrompts.filter(t => t !== tag));
                      } else {
                        setNegativePrompts([...negativePrompts, tag]);
                      }
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] border transition-colors cursor-pointer ${
                      isIncluded
                        ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {isIncluded ? '− ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-md border border-rose-500/40 bg-rose-950/20 flex items-start gap-2 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="font-mono text-[11px] leading-relaxed">{errorMsg}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleGeneratePrompts}
            disabled={loading}
            className="w-full py-3 px-4 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating 4 Variations via {cred.provider.toUpperCase()}...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate 4 Image Prompts ({cred.provider})</span>
              </>
            )}
          </button>
        </div>

        {/* Right Variations Output */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Generated Variations</span>
            </h3>
            {variations && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleExportAll('txt')}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors cursor-pointer"
                  title="Export all 4 variations into a formatted text file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export .TXT</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportAll('md')}
                  className="px-2 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition-colors cursor-pointer"
                >
                  .MD
                </button>
                <button
                  type="button"
                  onClick={() => handleExportAll('json')}
                  className="px-2 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition-colors cursor-pointer"
                >
                  .JSON
                </button>
              </div>
            )}
          </div>

          {!variations && !loading && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-8 text-center flex flex-col items-center justify-center min-h-[380px]">
              <div className="w-11 h-11 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-blue-400 mb-3">
                <Camera className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-zinc-200 mb-1">Variation Queue Empty</h4>
              <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                Select camera optics and target engine on the left, then generate 4 structured prompt variations with batch export.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-8 text-center flex flex-col items-center justify-center min-h-[380px] space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-blue-500 animate-spin" />
              <div className="text-sm font-medium text-white">Compiling Optical Formulations...</div>
              <div className="text-xs text-zinc-400 font-mono">
                {cred.provider} / {cred.model} &rarr; {targetEngine}
              </div>
            </div>
          )}

          {variations && !loading && (
            <div className="space-y-3">
              {variations.map((varItem, idx) => {
                const isCopied = copiedId === varItem.id;
                const isSaved = savedPrompts.includes(varItem.fullPrompt);

                return (
                  <div
                    key={varItem.id}
                    className="bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 rounded-lg p-4 transition-colors space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-white flex items-center gap-2">
                        <span className="font-mono text-zinc-500 tabular-nums">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span>{varItem.styleLabel}</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleSave(varItem.fullPrompt)}
                          className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                          title={isSaved ? 'Saved' : 'Bookmark'}
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-3.5 h-3.5 text-blue-400" />
                          ) : (
                            <Bookmark className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyPrompt(varItem.id, varItem.fullPrompt)}
                          className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                          }`}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-zinc-950 rounded-md p-3 border border-zinc-800 text-xs text-zinc-200 font-mono leading-relaxed select-all">
                      {varItem.fullPrompt}
                    </div>

                    <div className="text-[11px] font-mono text-zinc-400 space-y-1">
                      <div>
                        <span className="text-zinc-500">Camera:</span> {varItem.breakdown.camera} ·{' '}
                        <span className="text-zinc-500">Light:</span> {varItem.breakdown.lighting}
                      </div>
                      {varItem.engineParameters && (
                        <div className="text-blue-400">{varItem.engineParameters}</div>
                      )}
                    </div>

                    <div className="text-[11px] text-zinc-400">
                      {varItem.rationale}
                    </div>
                  </div>
                );
              })}

              {creativeTips.length > 0 && (
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5 text-xs text-zinc-400 space-y-1.5">
                  <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-400" />
                    <span>Parameter Notes</span>
                  </div>
                  {creativeTips.map((tip, idx) => (
                    <div key={idx} className="text-[11px] leading-relaxed text-zinc-400">
                      &mdash; {tip}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
