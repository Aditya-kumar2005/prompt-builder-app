/**
 * ImagePromptGeneratorApp Component
 * Dedicated visual prompt studio for Midjourney v6.1, DALL-E 3, Flux.1, Canva Magic Media, and Imagen 3.
 * Features visual attribute selectors, 4-way prompt variation expansion, negative prompts, and one-click copy.
 */
import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Camera,
  Sun,
  Layers,
  Copy,
  Check,
  Dices,
  Eye,
  Sliders,
  Bookmark,
  BookmarkCheck,
  Download,
  Terminal,
  Zap,
  Info,
  Maximize2,
  RefreshCw,
} from 'lucide-react';
import { AISettings } from '../types/ai';

interface ImagePromptGeneratorAppProps {
  settings: AISettings;
  triggerToast: (message: string, type?: 'success' | 'error' | 'info') => void;
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
  { id: 'midjourney', name: 'Midjourney v6.1', badge: 'Parameters & Flags', desc: 'Adds --ar, --v 6.1, --style raw, and stylize flags' },
  { id: 'dalle3', name: 'DALL-E 3', badge: 'Hyper-detailed Descriptive', desc: 'Rich narrative scenes for OpenAI image models' },
  { id: 'flux', name: 'Flux.1 Schnell / Dev', badge: 'Next-Gen Open Weights', desc: 'High typography & prompt fidelity optimization' },
  { id: 'canva', name: 'Canva Magic Media', badge: 'Commercial Ready', desc: 'Punchy commercial assets & website hero banners' },
  { id: 'imagen', name: 'Google Imagen 3', badge: 'Photoreal Nuance', desc: 'Photorealistic textures and accurate lighting physics' },
];

const ART_STYLES = [
  'Hyperrealistic 3D Octane Render',
  '35mm Analog Film (Kodak Portra 400)',
  'Cinematic Film Still (Anamorphic)',
  'Anime / Makoto Shinkai Aesthetic',
  'Macro Nature Photography',
  'Isometric 3D Low-Poly',
  'Digital Concept Art (Matte Painting)',
  'Cyberpunk Synthwave Neon',
  'Claymation & Tactile Stop-Motion',
  'Minimalist Vector Flat Illustration',
  'Editorial Fashion Photography',
  'Dark Fantasy Oil Painting',
];

const CAMERAS = [
  '85mm f/1.4 Lens, Creamy Bokeh Depth',
  '24mm Ultra-Wide Cinematic Angle',
  '100mm Macro Close-Up Focus',
  'Drone Top-Down Aerial View',
  'Low-Angle Dramatic Hero Perspective',
  'Medium Format Hasselblad 100MP',
  'Telephoto 200mm Compressed Depth',
  'GoPro Action Fisheye POV',
];

const LIGHTINGS = [
  'Volumetric Golden Hour Sunburst Rays',
  'Cyberpunk Neon Rim Light & Glow',
  'Studio Softbox Three-Point Lighting',
  'Moody Noir Chiaroscuro & Deep Shadows',
  'Bioluminescent Ethereal Glow',
  'Soft Overcast Diffused Daylight',
  'Harsh Noon Sunlight with Sharp Geometry',
  'Candlelit Warm Flame Ambient',
];

const COLOR_MOODS = [
  'Teal & Orange Hollywood Cinema',
  'Vibrant Technicolor Saturated',
  'Monochromatic High-Contrast Noir',
  'Pastel Dreamscape (Muted & Soft)',
  'Vintage 80s Kodachrome Film',
  'Iridescent Holographic Prism',
  'Emerald Green & Rich Gold Luxury',
  'Cyber Midnight Ultraviolet',
];

const ASPECT_RATIOS = [
  { id: '16:9', label: '16:9 Landscape', desc: 'Website Hero / YouTube' },
  { id: '1:1', label: '1:1 Square', desc: 'Instagram / Avatar' },
  { id: '9:16', label: '9:16 Vertical', desc: 'Reels / TikTok / Mobile' },
  { id: '4:5', label: '4:5 Portrait', desc: 'Social Post Feed' },
  { id: '21:9', label: '21:9 Ultrawide', desc: 'Cinematic Panoramic' },
  { id: '3:2', label: '3:2 Classic', desc: '35mm Camera Ratio' },
];

const SURPRISE_INSPIRATIONS = [
  'A translucent glass mechanical butterfly resting on a blooming cybernetic lotus with glowing circuit veins',
  'Futuristic architectural villa suspended over a misty fjord with warm interior lights and obsidian slate roofs',
  'Vintage 1980s astronaut enjoying a holographic coffee inside a neon-lit Tokyo ramen booth floating in space',
  'Hyper-detailed luxury sneaker made of crystalline coral and liquid mercury floating in zero gravity',
  'Isometric miniature laboratory inside a cutaway crystal geode with bubbling miniature chemistry vials',
  'An ancient moss-covered marble statue overgrown with bioluminescent mushrooms in an enchanted midnight grove',
];

export const ImagePromptGeneratorApp: React.FC<ImagePromptGeneratorAppProps> = ({
  settings,
  triggerToast,
}) => {
  const [subject, setSubject] = useState(
    'A hyper-detailed mechanical hummingbird made of polished brass and emerald crystals, hovering over a neon flower'
  );
  const [targetEngine, setTargetEngine] = useState('midjourney');
  const [artStyle, setArtStyle] = useState('Hyperrealistic 3D Octane Render');
  const [camera, setCamera] = useState('85mm f/1.4 Lens, Creamy Bokeh Depth');
  const [lighting, setLighting] = useState('Volumetric Golden Hour Sunburst Rays');
  const [colorMood, setColorMood] = useState('Teal & Orange Hollywood Cinema');
  const [aspectRatio, setAspectRatio] = useState('16:9');

  // Quality & negative tags
  const [qualityFlags, setQualityFlags] = useState<string[]>([
    '8k UHD',
    'raytraced reflections',
    'photorealistic tactile textures',
    'volumetric light bloom',
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

  const handleRollDice = () => {
    const random = SURPRISE_INSPIRATIONS[Math.floor(Math.random() * SURPRISE_INSPIRATIONS.length)];
    setSubject(random);
    triggerToast('🎲 Rolled random visual concept inspiration!', 'info');
  };

  const handleGeneratePrompts = async () => {
    if (!subject.trim()) {
      triggerToast('Please provide an image concept or subject.', 'error');
      return;
    }

    setLoading(true);

    let activeKey = '';
    let activeModel = '';
    if (settings.activeProvider === 'gemini') {
      activeKey = settings.geminiKey;
      activeModel = settings.geminiModel;
    } else if (settings.activeProvider === 'claude') {
      activeKey = settings.claudeKey;
      activeModel = settings.claudeModel;
    } else if (settings.activeProvider === 'openai') {
      activeKey = settings.openaiKey;
      activeModel = settings.openaiModel;
    }

    try {
      const resp = await fetch('/api/image-prompt-craft', {
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
          provider: settings.activeProvider,
          apiKey: activeKey,
          model: activeModel,
          temperature: settings.temperature,
        }),
      });

      const res = await resp.json();
      if (!resp.ok || !res.success) {
        throw new Error(res.error || 'Failed to craft image prompts.');
      }

      setVariations(res.data.variations || []);
      setCreativeTips(res.data.creativeTips || []);
      triggerToast('✨ 4 Master Image Prompts generated!', 'success');
    } catch (err: any) {
      console.error(err);
      triggerToast(err.message || 'Failed to craft image prompts.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    triggerToast('Copied prompt to clipboard! Ready to paste into image AI.', 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleToggleSave = (promptText: string) => {
    let next: string[];
    if (savedPrompts.includes(promptText)) {
      next = savedPrompts.filter(p => p !== promptText);
      triggerToast('Removed from saved image prompts', 'info');
    } else {
      next = [promptText, ...savedPrompts];
      triggerToast('Saved prompt to library!', 'success');
    }
    setSavedPrompts(next);
    try {
      localStorage.setItem('sitecraft_saved_image_prompts', JSON.stringify(next));
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Target Engine Selector */}
      <div className="bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-slate-900 border border-purple-500/30 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Image Prompt Generator Studio
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Visual AI Master
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Craft optimized prompts for Midjourney, DALL-E 3, Flux.1, Canva Magic Media, and Google Imagen
              </p>
            </div>
          </div>

          {/* Quick Dice Roller */}
          <button
            onClick={handleRollDice}
            className="self-start md:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 text-purple-200 border border-purple-500/40 text-xs font-semibold shadow-sm transition-all cursor-pointer"
            title="Roll random visual concept inspiration"
          >
            <Dices className="w-4 h-4 text-purple-400 animate-spin-slow" />
            <span>Surprise Me</span>
          </button>
        </div>

        {/* Target Engine Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {TARGET_ENGINES.map(eng => {
            const isSelected = targetEngine === eng.id;
            return (
              <button
                key={eng.id}
                onClick={() => setTargetEngine(eng.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-950/80 text-white ring-1 ring-purple-500 shadow-lg'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold">{eng.name}</div>
                <div className="text-[10px] text-purple-400 font-mono mt-0.5">{eng.badge}</div>
                <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">{eng.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form: Visual Attribute Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Subject & Parameters (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Subject & Core Concept */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Subject & Visual Concept</span>
              </label>
              <span className="text-[11px] text-slate-400">Be descriptive with focal subject</span>
            </div>
            <textarea
              rows={3}
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Describe your subject, scene, character, product, or architectural concept..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none transition-colors"
            />
          </div>

          {/* Art Style Selector */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-indigo-400" />
              <span>Art Style & Medium</span>
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {ART_STYLES.map(style => (
                <button
                  key={style}
                  onClick={() => setArtStyle(style)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                    artStyle === style
                      ? 'bg-purple-600 text-white font-semibold shadow-sm'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Camera Optics & Lighting Grids */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Camera */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                <span>Camera & Angle</span>
              </label>
              <select
                value={camera}
                onChange={e => setCamera(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white outline-none"
              >
                {CAMERAS.map(cam => (
                  <option key={cam} value={cam}>
                    {cam}
                  </option>
                ))}
              </select>
            </div>

            {/* Lighting */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Lighting & Atmosphere</span>
              </label>
              <select
                value={lighting}
                onChange={e => setLighting(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white outline-none"
              >
                {LIGHTINGS.map(light => (
                  <option key={light} value={light}>
                    {light}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Color Mood & Aspect Ratio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Color Palette Mood */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider">Color Grade / Mood</label>
              <select
                value={colorMood}
                onChange={e => setColorMood(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white outline-none"
              >
                {COLOR_MOODS.map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Aspect Ratio Selector */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-1">
                {ASPECT_RATIOS.map(ar => (
                  <button
                    key={ar.id}
                    onClick={() => setAspectRatio(ar.id)}
                    className={`py-1.5 px-1 rounded-lg border text-center transition-all ${
                      aspectRatio === ar.id
                        ? 'border-purple-500 bg-purple-950/50 text-white font-bold'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-[11px] font-mono">{ar.id}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Negative Prompts Filter */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Negative Constraints Filter (--no)
              </label>
              <span className="text-[10px] text-slate-500">Excluded artifacts</span>
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
                    onClick={() => {
                      if (isIncluded) {
                        setNegativePrompts(negativePrompts.filter(t => t !== tag));
                      } else {
                        setNegativePrompts([...negativePrompts, tag]);
                      }
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[11px] border transition-all ${
                      isIncluded
                        ? 'bg-rose-950/40 border-rose-500/50 text-rose-300 font-medium'
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {isIncluded ? '− ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGeneratePrompts}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Crafting 4 Master Image Prompts...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate 4 Master Image Prompts with Gemini</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Generated 4-Way Variations (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Prompt Variations Showcase</span>
            </h3>
            {variations && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/30 text-purple-300">
                4 Variations Ready
              </span>
            )}
          </div>

          {!variations && !loading && (
            <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-500 flex flex-col items-center justify-center min-h-[380px]">
              <div className="w-12 h-12 rounded-2xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
                <Camera className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-300 mb-1">Visual Concept Engine Ready</h4>
              <p className="text-xs text-slate-400 max-w-xs">
                Select your parameters and click &ldquo;Generate 4 Master Image Prompts&rdquo; to receive tailored Midjourney, DALL-E 3, and Flux variations.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-[380px] space-y-3 animate-pulse">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-6 h-6 animate-spin-slow" />
              </div>
              <div className="text-sm font-semibold text-white">Synthesizing Optical Formulations...</div>
              <div className="text-xs text-slate-400 max-w-xs">
                Gemini is optimizing lens characteristics, lighting balance, and engine parameter flags for {targetEngine}.
              </div>
            </div>
          )}

          {variations && (
            <div className="space-y-3">
              {variations.map(varItem => {
                const isCopied = copiedId === varItem.id;
                const isSaved = savedPrompts.includes(varItem.fullPrompt);

                return (
                  <div
                    key={varItem.id}
                    className="bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-4 shadow-lg transition-all space-y-3 group"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-400" />
                        {varItem.styleLabel}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleSave(varItem.fullPrompt)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title={isSaved ? 'Saved in library' : 'Save to library'}
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-3.5 h-3.5 text-purple-400" />
                          ) : (
                            <Bookmark className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCopyPrompt(varItem.id, varItem.fullPrompt)}
                          className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                            isCopied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40'
                          }`}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Prompt Box */}
                    <div className="bg-slate-950 rounded-xl p-3 border border-slate-850 text-xs text-slate-200 font-mono leading-relaxed select-all">
                      {varItem.fullPrompt}
                    </div>

                    {/* Breakdown Badges */}
                    <div className="flex flex-wrap gap-1 text-[10px] text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                        {varItem.breakdown.camera}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                        {varItem.breakdown.lighting}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-purple-300">
                        {varItem.engineParameters}
                      </span>
                    </div>

                    {/* Rationale */}
                    <div className="text-[11px] text-slate-400 italic">
                      &ldquo;{varItem.rationale}&rdquo;
                    </div>
                  </div>
                );
              })}

              {/* Creative Tips from Gemini */}
              {creativeTips.length > 0 && (
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 space-y-1.5">
                  <div className="font-semibold text-purple-300 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>Creative Engine Tips</span>
                  </div>
                  {creativeTips.map((tip, idx) => (
                    <div key={idx} className="text-[11px] leading-relaxed text-slate-400">
                      • {tip}
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
