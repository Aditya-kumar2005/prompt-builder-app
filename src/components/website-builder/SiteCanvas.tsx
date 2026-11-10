/**
 * SiteCanvas Component
 * Interactive visual canvas rendering with responsive device frames, in-place contentEditable editing,
 * 3D procedural scenes & avatars, floating elements, and Google Stitch customizable studio workbench.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  FloatingElement,
  SiteProject,
  SiteSection,
  CanvasStudioConfig,
  CanvasPattern,
  FrameStyle,
  FrameShadow,
} from './builderTypes';
import {
  computeThemeVars,
  DEFAULT_CANVAS_STUDIO_CONFIG,
  CANVAS_BACKDROP_PRESETS,
} from './builderDefaults';
import { startAvatar, startScene } from './scFxRuntime';
import { ThreeLogoViewer } from './ThreeLogoViewer';
import { CanvasStudioControls } from './CanvasStudioControls';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sliders,
  CircleDot,
  Grid,
  Layers,
  Sparkles,
  Box,
  Lock,
  RefreshCw,
  ExternalLink,
  Laptop,
  Tablet,
  Smartphone,
  Check,
} from 'lucide-react';

interface SiteCanvasProps {
  project: SiteProject;
  device: 'desktop' | 'tablet' | 'mobile';
  previewMode: boolean;
  selectedSectionId: string | null;
  selectedFloatId: string | null;
  onSelectSection: (id: string) => void;
  onSelectFloat: (id: string | null) => void;
  onUpdateSectionData: (sectionId: string, path: string, value: any) => void;
  onSectionAction: (sectionId: string, action: 'up' | 'down' | 'dup' | 'hide' | 'del') => void;
  onUpdateFloat: (sectionId: string, floatId: string, updates: Partial<FloatingElement>) => void;
}

export const SiteCanvas: React.FC<SiteCanvasProps> = ({
  project,
  device,
  previewMode,
  selectedSectionId,
  selectedFloatId,
  onSelectSection,
  onSelectFloat,
  onUpdateSectionData,
  onSectionAction,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Google Stitch Canvas Studio customizable configuration
  const [canvasConfig, setCanvasConfig] = useState<CanvasStudioConfig>(() => {
    try {
      const saved = localStorage.getItem('sitecraft_canvas_studio_config');
      if (saved) {
        return { ...DEFAULT_CANVAS_STUDIO_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not load canvas config from localStorage', e);
    }
    return DEFAULT_CANVAS_STUDIO_CONFIG;
  });

  const [isStudioControlsOpen, setIsStudioControlsOpen] = useState(false);
  const [customViewportWidth, setCustomViewportWidth] = useState<number | null>(null);

  // Persist canvas studio config to localStorage
  const updateCanvasConfig = (updates: Partial<CanvasStudioConfig>) => {
    setCanvasConfig(prev => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('sitecraft_canvas_studio_config', JSON.stringify(next));
      } catch (e) {
        console.warn('Could not persist canvas config', e);
      }
      return next;
    });
  };

  const handleResetCanvasConfig = () => {
    setCanvasConfig(DEFAULT_CANVAS_STUDIO_CONFIG);
    try {
      localStorage.setItem('sitecraft_canvas_studio_config', JSON.stringify(DEFAULT_CANVAS_STUDIO_CONFIG));
    } catch {}
  };

  // Initialize FX and canvas scenes whenever sections change or mount
  useEffect(() => {
    if (!containerRef.current) return;
    const cleanups: (() => void)[] = [];

    // start scenes
    const sceneCanvases = containerRef.current.querySelectorAll<HTMLCanvasElement>('canvas[data-scene]');
    sceneCanvases.forEach(cv => {
      const s = startScene(cv);
      if (s) cleanups.push(s.stop);
    });

    // start avatars
    const avatarCanvases = containerRef.current.querySelectorAll<HTMLCanvasElement>('canvas[data-avatar]');
    avatarCanvases.forEach(cv => {
      const s = startAvatar(cv);
      if (s) cleanups.push(s.stop);
    });

    // mouse spotlight tracking
    const spotSections = containerRef.current.querySelectorAll<HTMLElement>('[data-spot="1"]');
    spotSections.forEach(sec => {
      const handler = (e: MouseEvent) => {
        const r = sec.getBoundingClientRect();
        sec.style.setProperty('--mx', `${e.clientX - r.left}px`);
        sec.style.setProperty('--my', `${e.clientY - r.top}px`);
      };
      sec.addEventListener('mousemove', handler);
      cleanups.push(() => sec.removeEventListener('mousemove', handler));
    });

    return () => {
      cleanups.forEach(c => c());
    };
  }, [project.sections, project.theme, device, previewMode]);

  const themeStyles = computeThemeVars(project.theme);

  // Helper for in-place editable text
  const renderEditable = (
    sectionId: string,
    keyPath: string,
    initialVal: string,
    className?: string,
    tag: keyof React.JSX.IntrinsicElements = 'span'
  ) => {
    const Tag = tag as any;
    if (previewMode) {
      return <Tag className={className}>{initialVal}</Tag>;
    }
    return (
      <Tag
        className={`${className || ''} outline-none rounded transition-shadow hover:ring-2 hover:ring-indigo-400/50 focus:ring-2 focus:ring-indigo-500 focus:bg-indigo-500/10 px-1 -mx-1`}
        contentEditable
        suppressContentEditableWarning
        onBlur={(e: React.FocusEvent<HTMLElement>) => {
          const newVal = e.currentTarget.innerText.trim();
          if (newVal !== initialVal) {
            onUpdateSectionData(sectionId, keyPath, newVal);
          }
        }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {initialVal}
      </Tag>
    );
  };

  const renderSectionMedia = (sec: SiteSection) => {
    const media = sec.media;
    if (!media || media.type === 'none') return null;

    if (media.type === 'gradient' && media.grad) {
      const { c1, c2, angle = 135 } = media.grad;
      return (
        <div
          className="media"
          style={{
            background: `linear-gradient(${angle}deg, ${c1}, ${c2})`,
            opacity: 1 - (media.overlay || 0),
          }}
        />
      );
    }

    if (media.type === 'scene') {
      return (
        <div className="media">
          <canvas
            data-scene={media.scene || 'torus'}
            className="scene"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      );
    }

    if (media.type === 'avatar' && media.avatar) {
      return (
        <div
          className="avbg"
          style={{
            right: media.pos === 'right' ? '4%' : media.pos === 'left' ? 'auto' : '28%',
            left: media.pos === 'left' ? '4%' : 'auto',
            width: `${media.size || 46}%`,
          }}
        >
          {media.backdrop === 'scene' && (
            <canvas
              data-scene={media.scene || 'particles'}
              className="scene"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            />
          )}
          <canvas
            data-avatar={JSON.stringify(media.avatar)}
            style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}
          />
        </div>
      );
    }

    return null;
  };

  const renderSectionContent = (sec: SiteSection) => {
    const { type, variant, data } = sec;

    switch (type) {
      case 'nav':
        return (
          <div className="wrap">
            <div className={`nav ${variant === 'center' ? 'stack' : ''}`}>
              <a href="#top" className="brand">
                {renderEditable(sec.id, 'brand', data.brand || project.profile.name, 'brand')}
              </a>
              <nav className="flex items-center gap-6">
                {(data.links || []).map((link: any, i: number) => (
                  <a
                    key={i}
                    href={previewMode ? link.href : undefined}
                    onClick={e => !previewMode && e.preventDefault()}
                    className="hover:underline"
                  >
                    {renderEditable(sec.id, `links.${i}.label`, link.label)}
                  </a>
                ))}
              </nav>
              <div>
                <a
                  href="#contact"
                  className="btn sm"
                  onClick={e => !previewMode && e.preventDefault()}
                >
                  {renderEditable(sec.id, 'cta', data.cta || 'Get in Touch')}
                </a>
              </div>
            </div>
          </div>
        );

      case 'hero':
        if (variant === 'center') {
          return (
            <div className="wrap narrow center hero centered">
              <span className="eyebrow">
                {renderEditable(sec.id, 'eyebrow', data.eyebrow || "Hi, I'm Alex")}
              </span>
              <h1>{renderEditable(sec.id, 'title', data.title || 'I build digital experiences', undefined, 'span')}</h1>
              <p className="lead">
                {renderEditable(sec.id, 'subtitle', data.subtitle || 'Frontend developer craft', undefined, 'span')}
              </p>
              <div className="row c mt-3">
                <a href="#projects" className="btn" onClick={e => !previewMode && e.preventDefault()}>
                  {renderEditable(sec.id, 'cta', data.cta || 'See my work')}
                </a>
                {data.cta2 && (
                  <a href="#contact" className="btn ghost" onClick={e => !previewMode && e.preventDefault()}>
                    {renderEditable(sec.id, 'cta2', data.cta2 || 'Get in touch')}
                  </a>
                )}
              </div>
            </div>
          );
        }
        if (variant === 'bold') {
          return (
            <div className="wrap hero bold">
              <span className="eyebrow">{renderEditable(sec.id, 'eyebrow', data.eyebrow || 'Specialist')}</span>
              <h1>{renderEditable(sec.id, 'title', data.title || 'Shipping Complete Products', undefined, 'span')}</h1>
              <p className="lead narrow">
                {renderEditable(sec.id, 'subtitle', data.subtitle || 'High-performance engineering.', undefined, 'span')}
              </p>
              <div className="row mt-4">
                <a href="#projects" className="btn" onClick={e => !previewMode && e.preventDefault()}>
                  {renderEditable(sec.id, 'cta', data.cta || 'Explore projects')}
                </a>
                {data.cta2 && (
                  <a href="#contact" className="btn ghost" onClick={e => !previewMode && e.preventDefault()}>
                    {renderEditable(sec.id, 'cta2', data.cta2 || 'Hire me')}
                  </a>
                )}
              </div>
            </div>
          );
        }
        if (variant === 'avatar') {
          return (
            <div className="wrap grid2 hero avh">
              <div className="col">
                <span className="eyebrow">{renderEditable(sec.id, 'eyebrow', data.eyebrow || 'Hello!')}</span>
                <h1>{renderEditable(sec.id, 'title', data.title || 'Creative Developer', undefined, 'span')}</h1>
                <p className="lead">
                  {renderEditable(sec.id, 'subtitle', data.subtitle || 'Building interactive web experiences', undefined, 'span')}
                </p>
                <div className="row mt-3">
                  <a href="#projects" className="btn" onClick={e => !previewMode && e.preventDefault()}>
                    {renderEditable(sec.id, 'cta', data.cta || 'Explore')}
                  </a>
                  {data.cta2 && (
                    <a href="#contact" className="btn ghost" onClick={e => !previewMode && e.preventDefault()}>
                      {renderEditable(sec.id, 'cta2', data.cta2 || 'Contact')}
                    </a>
                  )}
                </div>
              </div>
              <div className="avspace" />
            </div>
          );
        }
        // default split
        return (
          <div className="wrap grid2 hero">
            <div className="col">
              <span className="eyebrow">{renderEditable(sec.id, 'eyebrow', data.eyebrow || "Hi, I'm Alex")}</span>
              <h1>{renderEditable(sec.id, 'title', data.title || 'Crafting Exceptional Web Apps', undefined, 'span')}</h1>
              <p className="lead">
                {renderEditable(sec.id, 'subtitle', data.subtitle || 'Specialized in frontend performance and clean architecture.', undefined, 'span')}
              </p>
              <div className="row mt-3">
                <a href="#projects" className="btn" onClick={e => !previewMode && e.preventDefault()}>
                  {renderEditable(sec.id, 'cta', data.cta || 'See my work')}
                </a>
                {data.cta2 && (
                  <a href="#contact" className="btn ghost" onClick={e => !previewMode && e.preventDefault()}>
                    {renderEditable(sec.id, 'cta2', data.cta2 || 'Get in touch')}
                  </a>
                )}
              </div>
            </div>
            <div className="imgbox hero-img flex items-center justify-center p-6 bg-slate-900/30 border border-slate-700/30">
              <canvas data-scene="torus" style={{ width: '100%', height: '100%', maxHeight: 380 }} />
            </div>
          </div>
        );

      case 'about':
        if (variant === 'stats') {
          return (
            <div className="wrap">
              <div className="head center">
                <h2>{renderEditable(sec.id, 'title', data.title || 'About Me', undefined, 'span')}</h2>
                <p className="lead narrow">
                  {renderEditable(sec.id, 'text', data.text || 'I love solving hard problems.', undefined, 'span')}
                </p>
              </div>
              <div className="stats big justify-center">
                {(data.stats || []).map((s: any, i: number) => (
                  <div key={i} className="stat card text-center">
                    <span className="num">{renderEditable(sec.id, `stats.${i}.value`, s.value)}</span>
                    <span className="muted text-sm">{renderEditable(sec.id, `stats.${i}.label`, s.label)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        return (
          <div className="wrap grid2">
            <div className="col">
              <h2>{renderEditable(sec.id, 'title', data.title || 'About Me', undefined, 'span')}</h2>
              <p className="lead">{renderEditable(sec.id, 'text', data.text || 'Developer story.', undefined, 'span')}</p>
              <div className="stats mt-2">
                {(data.stats || []).map((s: any, i: number) => (
                  <div key={i} className="stat">
                    <span className="num">{renderEditable(sec.id, `stats.${i}.value`, s.value)}</span>
                    <span className="muted text-xs">{renderEditable(sec.id, `stats.${i}.label`, s.label)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="imgbox portrait flex items-center justify-center p-8 bg-slate-900/20 border border-slate-700/20">
              <canvas data-scene="sphere" style={{ width: '100%', height: '100%', maxHeight: 360 }} />
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className="wrap">
            <div className="head">
              <h2>{renderEditable(sec.id, 'title', data.title || 'Skills & Tooling', undefined, 'span')}</h2>
              <p className="lead">{renderEditable(sec.id, 'subtitle', data.subtitle || 'Core stacks', undefined, 'span')}</p>
            </div>
            {variant === 'bars' ? (
              <div className="bars">
                {(data.items || []).map((item: any, i: number) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex justify-between text-sm font-semibold">
                      <span>{renderEditable(sec.id, `items.${i}.name`, item.name)}</span>
                      <span className="muted">{item.level}%</span>
                    </div>
                    <div className="track">
                      <i style={{ width: `${item.level}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="chips">
                {(data.items || []).map((item: any, i: number) => (
                  <span key={i} className="chip">
                    {renderEditable(sec.id, `items.${i}.name`, item.name)}
                  </span>
                ))}
              </div>
            )}
          </div>
        );

      case 'services':
        return (
          <div className="wrap">
            <div className={`head ${variant === 'centered' ? 'center' : ''}`}>
              <h2>{renderEditable(sec.id, 'title', data.title || 'Services', undefined, 'span')}</h2>
              <p className="lead">{renderEditable(sec.id, 'subtitle', data.subtitle || 'How I can help', undefined, 'span')}</p>
            </div>
            <div className={`cards ${variant === 'list' ? 'grid-cols-1' : ''}`}>
              {(data.items || []).map((item: any, i: number) => (
                <div key={i} className="card">
                  <div className="ico">{renderEditable(sec.id, `items.${i}.icon`, item.icon || '🚀')}</div>
                  <h3>{renderEditable(sec.id, `items.${i}.title`, item.title, undefined, 'span')}</h3>
                  <p className="muted text-sm">{renderEditable(sec.id, `items.${i}.text`, item.text, undefined, 'span')}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'projects':
        return (
          <div className="wrap">
            <div className="head">
              <h2>{renderEditable(sec.id, 'title', data.title || 'Featured Projects', undefined, 'span')}</h2>
              <p className="lead">{renderEditable(sec.id, 'subtitle', data.subtitle || 'Production work', undefined, 'span')}</p>
            </div>
            <div className="cards">
              {(data.items || []).map((p: any, i: number) => (
                <div key={i} className="card pcard">
                  <div className="imgbox flex items-center justify-center p-6 bg-slate-900/40">
                    <canvas data-scene={i % 2 === 0 ? 'cube' : 'waves'} style={{ width: '100%', height: 160 }} />
                  </div>
                  <div className="pad">
                    <span className="eyebrow">{renderEditable(sec.id, `items.${i}.tags`, p.tags)}</span>
                    <h3>{renderEditable(sec.id, `items.${i}.title`, p.title, undefined, 'span')}</h3>
                    <p className="muted text-sm">{renderEditable(sec.id, `items.${i}.text`, p.text, undefined, 'span')}</p>
                    <a
                      href={p.link || 'https://github.com'}
                      target="_blank"
                      rel="noreferrer"
                      className="more"
                      onClick={e => !previewMode && e.preventDefault()}
                    >
                      View Project →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'repos':
        return (
          <div className="wrap">
            <div className="head">
              <h2>{renderEditable(sec.id, 'title', data.title || 'GitHub Repositories', undefined, 'span')}</h2>
              <p className="lead">{renderEditable(sec.id, 'subtitle', data.subtitle || 'Open source activity', undefined, 'span')}</p>
            </div>
            <div className="cards">
              {(data.items || []).map((repo: any, i: number) => (
                <a
                  key={i}
                  href={previewMode ? repo.url : undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="card hover:border-indigo-400 transition-colors"
                  onClick={e => !previewMode && e.preventDefault()}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-semibold">{repo.name}</h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      ★ {repo.stars?.toLocaleString() || 0}
                    </span>
                  </div>
                  <p className="muted text-sm grow">{repo.description || 'Public repository'}</p>
                  <div className="flex items-center gap-2 text-xs muted font-mono">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span>{repo.language || 'Code'}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        );

      case 'testimonials':
        return (
          <div className="wrap">
            <div className="head center">
              <h2>{renderEditable(sec.id, 'title', data.title || 'Kind Words', undefined, 'span')}</h2>
              <p className="lead">{renderEditable(sec.id, 'subtitle', data.subtitle || 'Client feedback', undefined, 'span')}</p>
            </div>
            <div className="cards">
              {(data.items || []).map((rev: any, i: number) => (
                <figure key={i} className="card quote">
                  <blockquote>"{renderEditable(sec.id, `items.${i}.quote`, rev.quote)}"</blockquote>
                  <figcaption className="mt-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center font-bold text-sm">
                      {rev.name?.slice(0, 1) || 'A'}
                    </div>
                    <div>
                      <b>{renderEditable(sec.id, `items.${i}.name`, rev.name)}</b>
                      <br />
                      <span className="muted text-xs">{renderEditable(sec.id, `items.${i}.role`, rev.role)}</span>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="wrap narrow">
            <div className="head">
              <h2>{renderEditable(sec.id, 'title', data.title || 'Work Experience', undefined, 'span')}</h2>
              <p className="lead">{renderEditable(sec.id, 'subtitle', data.subtitle || 'Career trajectory', undefined, 'span')}</p>
            </div>
            <div className="tl">
              {(data.items || []).map((exp: any, i: number) => (
                <div key={i} className="tli">
                  <i />
                  <span className="eyebrow">{renderEditable(sec.id, `items.${i}.period`, exp.period)}</span>
                  <h3>{renderEditable(sec.id, `items.${i}.role`, exp.role, undefined, 'span')}</h3>
                  <div className="org">{renderEditable(sec.id, `items.${i}.org`, exp.org)}</div>
                  <p className="muted text-sm">{renderEditable(sec.id, `items.${i}.text`, exp.text, undefined, 'span')}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="wrap narrow center contact">
            <h2>{renderEditable(sec.id, 'title', data.title || "Let's Connect", undefined, 'span')}</h2>
            <p className="lead">{renderEditable(sec.id, 'text', data.text || 'Reach out for inquiries', undefined, 'span')}</p>
            <a
              href={`mailto:${data.email || 'hello@example.com'}`}
              className="btn mt-2"
              onClick={e => !previewMode && e.preventDefault()}
            >
              {renderEditable(sec.id, 'cta', data.cta || 'Send Message')}
            </a>
            <div className="row c links mt-4">
              {(data.links || []).map((l: any, i: number) => (
                <a
                  key={i}
                  href={previewMode ? l.href : undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                  onClick={e => !previewMode && e.preventDefault()}
                >
                  {renderEditable(sec.id, `links.${i}.label`, l.label)}
                </a>
              ))}
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="wrap narrow center">
            <div className="head center">
              <h2>{renderEditable(sec.id, 'title', data.title || 'Demo Video', undefined, 'span')}</h2>
              <p className="lead">{renderEditable(sec.id, 'subtitle', data.subtitle || 'Watch walkthrough', undefined, 'span')}</p>
            </div>
            <div className="vwrap my-4">
              <iframe
                src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
                title="Video preview"
                allowFullScreen
              />
            </div>
            <p className="muted text-sm cap">{renderEditable(sec.id, 'caption', data.caption || 'Project demo')}</p>
          </div>
        );

      case 'canvas':
        return (
          <div
            className="wrap flex items-center justify-center border-2 border-dashed border-slate-700/50 rounded-xl"
            style={{ minHeight: data.height || 300 }}
          >
            <div className="text-center p-6 text-slate-500">
              <p className="font-semibold text-slate-400">Freeform Canvas Area</p>
              <p className="text-xs mt-1">Add floating 3D avatars, badges, text, or shapes anywhere in this space.</p>
            </div>
          </div>
        );

      case 'footer':
        return (
          <div className="wrap between">
            <span className="muted text-sm">{renderEditable(sec.id, 'text', data.text || '© SiteCraft')}</span>
            <a href="#top" className="muted text-sm hover:underline" onClick={e => !previewMode && e.preventDefault()}>
              Back to top ↑
            </a>
          </div>
        );

      default:
        return null;
    }
  };

  const renderFloats = (sec: SiteSection) => {
    if (!sec.floats || sec.floats.length === 0) return null;

    return (
      <div className="floats">
        {sec.floats.map(fl => {
          const isSelected = selectedFloatId === fl.id;
          return (
            <div
              key={fl.id}
              className={`fl ${!previewMode ? 'ed' : ''} ${isSelected ? 'sel' : ''}`}
              data-fc={fl.motion && fl.motion !== 'none' ? fl.motion : undefined}
              data-hv={fl.hover && fl.hover !== 'none' ? fl.hover : undefined}
              style={{
                left: `${fl.x}%`,
                top: `${fl.y}%`,
                width: fl.w || 140,
                height: fl.h || 'auto',
                transform: fl.rot ? `rotate(${fl.rot}deg)` : undefined,
                zIndex: fl.z || 5,
              }}
              onClick={e => {
                if (!previewMode) {
                  e.stopPropagation();
                  onSelectFloat(fl.id);
                  onSelectSection(sec.id);
                }
              }}
            >
              <div className="fi">
                {fl.kind === 'text' && (
                  <div
                    className="ft"
                    style={{
                      fontSize: `${fl.fontSize || 16}px`,
                      fontWeight: fl.fontWeight || 600,
                      color: fl.color || 'inherit',
                    }}
                  >
                    {fl.text || 'Floating Text'}
                  </div>
                )}
                {fl.kind === 'avatar' && (
                  <canvas
                    data-avatar={JSON.stringify(fl.avatarConfig || {})}
                    style={{ width: '100%', height: fl.h || 180 }}
                  />
                )}
                {fl.kind === 'scene' && (
                  <canvas
                    data-scene={fl.sceneKind || 'particles'}
                    style={{ width: '100%', height: fl.h || 140 }}
                  />
                )}
                {fl.kind === 'btn' && (
                  <a
                    href={fl.href || '#'}
                    className={`btn sm ${fl.variant === 'ghost' ? 'ghost' : ''}`}
                    onClick={e => e.preventDefault()}
                  >
                    {fl.label || 'Action'}
                  </a>
                )}
                {fl.kind === 'shape' && (
                  <div
                    className="fshape"
                    style={{
                      width: fl.w || 60,
                      height: fl.h || 60,
                      borderRadius: fl.shape === 'circle' ? '50%' : fl.shape === 'pill' ? '999px' : '12px',
                      background: fl.fill || 'var(--primary)',
                    }}
                  />
                )}
                {fl.kind === 'threeLogo' && fl.threeLogoData && (
                  <div style={{ width: '100%', height: fl.h || 180 }}>
                    <ThreeLogoViewer
                      data={fl.threeLogoData}
                      height={fl.h || 180}
                      interactive={true}
                      autoRotate={true}
                      showControls={false}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Compute Google Stitch Background Canvas CSS Styles
  const getCanvasBackgroundStyle = (): React.CSSProperties => {
    if (previewMode) {
      return { backgroundColor: canvasConfig.bgColor };
    }

    const { pattern, bgColor, gridSize, gridOpacity } = canvasConfig;
    const isDark = !['#f8fafc', '#f5f5f4', '#ffffff'].includes(bgColor.toLowerCase());
    const dotColor = isDark ? `rgba(255, 255, 255, ${gridOpacity})` : `rgba(0, 0, 0, ${gridOpacity * 1.5})`;
    const lineColor = isDark ? `rgba(255, 255, 255, ${gridOpacity})` : `rgba(0, 0, 0, ${gridOpacity * 1.3})`;
    const blueLine = `rgba(59, 130, 246, ${gridOpacity * 1.5})`;

    switch (pattern) {
      case 'dots':
        return {
          backgroundColor: bgColor,
          backgroundImage: `radial-gradient(circle at 1px 1px, ${dotColor} 1.5px, transparent 0)`,
          backgroundSize: `${gridSize}px ${gridSize}px`,
        };
      case 'grid':
        return {
          backgroundColor: bgColor,
          backgroundImage: `linear-gradient(to right, ${lineColor} 1px, transparent 1px), linear-gradient(to bottom, ${lineColor} 1px, transparent 1px)`,
          backgroundSize: `${gridSize}px ${gridSize}px`,
        };
      case 'blueprint':
        return {
          backgroundColor: isDark ? bgColor : '#0f2744',
          backgroundImage: `linear-gradient(${blueLine} 1px, transparent 1px), linear-gradient(90deg, ${blueLine} 1px, transparent 1px), linear-gradient(rgba(59,130,246,${gridOpacity * 0.4}) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,${gridOpacity * 0.4}) 1px, transparent 1px)`,
          backgroundSize: `${gridSize * 4}px ${gridSize * 4}px, ${gridSize * 4}px ${gridSize * 4}px, ${gridSize}px ${gridSize}px, ${gridSize}px ${gridSize}px`,
        };
      case 'isometric':
        return {
          backgroundColor: bgColor,
          backgroundImage: `linear-gradient(30deg, ${lineColor} 1px, transparent 1px), linear-gradient(150deg, ${lineColor} 1px, transparent 1px)`,
          backgroundSize: `${Math.round(gridSize * 1.732)}px ${gridSize}px`,
        };
      case 'glow':
        return {
          backgroundColor: bgColor,
          backgroundImage: `radial-gradient(ellipse at 50% 30%, ${project.theme.palette.primary}33 0%, transparent 65%), radial-gradient(circle at 1px 1px, ${dotColor} 1.2px, transparent 0)`,
          backgroundSize: `100% 100%, ${gridSize}px ${gridSize}px`,
        };
      case 'checker':
        return {
          backgroundColor: bgColor,
          backgroundImage: `linear-gradient(45deg, ${lineColor} 25%, transparent 25%), linear-gradient(-45deg, ${lineColor} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${lineColor} 75%), linear-gradient(-45deg, transparent 75%, ${lineColor} 75%)`,
          backgroundSize: `${gridSize}px ${gridSize}px`,
        };
      case 'solid':
      default:
        return { backgroundColor: bgColor, backgroundImage: 'none' };
    }
  };

  // Compute Device Viewport Max Width
  const getDeviceWidth = () => {
    if (previewMode) return '100%';
    if (customViewportWidth) return `${customViewportWidth}px`;
    if (device === 'tablet') return '768px';
    if (device === 'mobile') return '390px';
    return '1280px';
  };

  // Compute Elevation & Shadow Style
  const getShadowStyle = () => {
    if (previewMode) return 'none';
    switch (canvasConfig.shadow) {
      case 'studio_3d':
        return '0 35px 90px -20px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.08)';
      case 'ambient_glow':
        return `0 25px 80px -10px ${project.theme.palette.primary}55, 0 0 0 1px ${project.theme.palette.primary}66`;
      case 'soft':
        return '0 15px 40px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)';
      case 'none':
      default:
        return 'none';
    }
  };

  // Canvas Padding Class
  const getCanvasPaddingClass = () => {
    if (previewMode) return 'p-0';
    switch (canvasConfig.canvasPadding) {
      case 'tight':
        return 'p-3 sm:p-5';
      case 'spacious':
        return 'p-8 sm:p-14';
      case 'normal':
      default:
        return 'p-5 sm:p-9';
    }
  };

  const handleZoom = (delta: number) => {
    const next = Math.min(Math.max(parseFloat((canvasConfig.zoom + delta).toFixed(2)), 0.4), 2.0);
    updateCanvasConfig({ zoom: next });
  };

  const handleResetZoom = () => {
    updateCanvasConfig({ zoom: 1 });
  };

  const handleFitZoom = () => {
    if (!containerRef.current) return;
    const cw = containerRef.current.clientWidth - 80;
    const targetW = device === 'mobile' ? 390 : device === 'tablet' ? 768 : 1280;
    const ratio = Math.min(Math.max(parseFloat((cw / targetW).toFixed(2)), 0.4), 1.2);
    updateCanvasConfig({ zoom: ratio });
  };

  return (
    <div
      ref={containerRef}
      className={`flex-1 overflow-auto flex flex-col items-center justify-start min-h-0 select-text relative transition-colors duration-200 ${getCanvasPaddingClass()}`}
      style={getCanvasBackgroundStyle()}
      onClick={() => {
        if (!previewMode) {
          onSelectFloat(null);
        }
      }}
    >
      {/* Google Stitch Canvas Studio Workbench HUD (Hidden in Fullscreen Preview Mode) */}
      {!previewMode && (
        <div
          className="sticky top-2 z-40 mb-4 flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-900/90 hover:bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-xl backdrop-blur-md text-xs text-slate-300 max-w-4xl w-full transition-all"
          onClick={e => e.stopPropagation()}
        >
          {/* Left: Live Dimensions & Custom Width Override */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-indigo-300">
              {device === 'desktop' && <Laptop className="w-3.5 h-3.5 text-slate-400" />}
              {device === 'tablet' && <Tablet className="w-3.5 h-3.5 text-slate-400" />}
              {device === 'mobile' && <Smartphone className="w-3.5 h-3.5 text-slate-400" />}
              <span>{getDeviceWidth()}</span>
            </div>

            {/* Quick Resolution Preset Pills */}
            <div className="hidden lg:flex items-center gap-1 text-[11px]">
              <button
                onClick={() => setCustomViewportWidth(null)}
                className={`px-2 py-0.5 rounded-lg border transition-all ${
                  customViewportWidth === null
                    ? 'border-indigo-500 bg-indigo-950/40 text-white font-medium'
                    : 'border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Auto
              </button>
              <button
                onClick={() => setCustomViewportWidth(1440)}
                className={`px-2 py-0.5 rounded-lg border transition-all ${
                  customViewportWidth === 1440
                    ? 'border-indigo-500 bg-indigo-950/40 text-white font-medium'
                    : 'border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                1440px
              </button>
              <button
                onClick={() => setCustomViewportWidth(1024)}
                className={`px-2 py-0.5 rounded-lg border transition-all ${
                  customViewportWidth === 1024
                    ? 'border-indigo-500 bg-indigo-950/40 text-white font-medium'
                    : 'border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                1024px
              </button>
            </div>
          </div>

          {/* Center: Canvas Pattern Selector Pills */}
          <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            {(['dots', 'grid', 'blueprint', 'isometric', 'glow', 'solid'] as CanvasPattern[]).map(pat => (
              <button
                key={pat}
                onClick={() => updateCanvasConfig({ pattern: pat })}
                className={`px-2 py-0.5 rounded-lg capitalize text-[10px] font-medium transition-all ${
                  canvasConfig.pattern === pat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title={`Switch canvas pattern to ${pat}`}
              >
                {pat}
              </button>
            ))}
          </div>

          {/* Right: Zoom Controls & Stitch Studio Settings Trigger */}
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center bg-slate-950/80 p-0.5 rounded-xl border border-slate-800">
              <button
                onClick={() => handleZoom(-0.1)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Zoom Out (Ctrl -)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="px-1.5 py-0.5 text-[11px] font-mono text-slate-300 hover:text-white"
                title="Click to reset to 100%"
              >
                {Math.round(canvasConfig.zoom * 100)}%
              </button>
              <button
                onClick={() => handleZoom(0.1)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Zoom In (Ctrl +)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleFitZoom}
                className="px-1.5 py-0.5 text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold border-l border-slate-800"
                title="Fit canvas to screen"
              >
                Fit
              </button>
            </div>

            {/* Quick Backdrop Theme Chips */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              {CANVAS_BACKDROP_PRESETS.slice(0, 4).map(pre => (
                <button
                  key={pre.id}
                  onClick={() => updateCanvasConfig({ bgColor: pre.color })}
                  className={`w-4 h-4 rounded-full border transition-all ${
                    canvasConfig.bgColor.toLowerCase() === pre.color.toLowerCase()
                      ? 'border-indigo-400 ring-2 ring-indigo-500/50 scale-110'
                      : 'border-white/10 hover:scale-105'
                  }`}
                  style={{ backgroundColor: pre.color }}
                  title={`Canvas Color: ${pre.name}`}
                />
              ))}
            </div>

            {/* Canvas Customizer Popover Trigger */}
            <button
              onClick={() => setIsStudioControlsOpen(true)}
              className="p-1.5 px-2.5 rounded-xl bg-gradient-to-r from-indigo-600/30 to-purple-600/30 hover:from-indigo-600/50 hover:to-purple-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              title="Customize Google Stitch Background Canvas & Frame"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Canvas Studio</span>
            </button>
          </div>
        </div>
      )}

      {/* Scaled Canvas Container with Zoom Transform */}
      <div
        className="w-full flex justify-center transition-transform duration-150 ease-out"
        style={{
          transform: `scale(${canvasConfig.zoom})`,
          transformOrigin: 'top center',
        }}
      >
        {/* Device Viewport Outer Card */}
        <div
          className="w-full transition-all duration-300 relative overflow-hidden"
          style={{
            maxWidth: getDeviceWidth(),
            borderRadius: previewMode ? 0 : `${canvasConfig.frameRadius}px`,
            boxShadow: getShadowStyle(),
            border: previewMode
              ? 'none'
              : canvasConfig.frameStyle === 'frameless'
              ? 'none'
              : '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Google Stitch / macOS Studio Window Browser Chrome */}
          {!previewMode && canvasConfig.frameStyle === 'browser' && (
            <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex items-center justify-between gap-3 select-none">
              {/* macOS Traffic Light Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] flex items-center justify-center text-[7px] text-[#7a0d0d] font-bold group hover:opacity-90">
                  <span className="opacity-0 hover:opacity-100">×</span>
                </span>
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] flex items-center justify-center text-[7px] text-[#7d5000] font-bold hover:opacity-90">
                  <span className="opacity-0 hover:opacity-100">–</span>
                </span>
                <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] flex items-center justify-center text-[7px] text-[#004e0a] font-bold hover:opacity-90">
                  <span className="opacity-0 hover:opacity-100">+</span>
                </span>
              </div>

              {/* URL Address Bar */}
              <div className="flex-1 max-w-md mx-auto flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-300">
                <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate text-slate-400 font-mono">
                  {canvasConfig.browserUrl || 'https://preview.sitecraft.dev'}
                </span>
                <RefreshCw className="w-3 h-3 text-slate-500 hover:text-slate-300 cursor-pointer ml-auto shrink-0" />
              </div>

              {/* Window Right Indicator */}
              <div className="flex items-center gap-2 shrink-0 text-[10px] text-slate-500 font-mono">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  {device === 'desktop' ? 'DESKTOP' : device === 'tablet' ? 'TABLET' : 'MOBILE'}
                </span>
              </div>
            </div>
          )}

          {/* Smartphone Hardware Bezel Overlay (iPhone Dynamic Island) */}
          {!previewMode && canvasConfig.frameStyle === 'device_bezel' && device === 'mobile' && (
            <div className="w-full bg-slate-900 border-b border-slate-800 py-1.5 flex justify-center items-center">
              <div className="w-20 h-4 bg-black rounded-full flex items-center justify-center gap-2 border border-slate-800 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-slate-950 border border-slate-800" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-950" />
              </div>
            </div>
          )}

          {/* Main Website Content Canvas */}
          <div className="site fx-on" style={themeStyles as React.CSSProperties}>
            {project.sections
              .filter(sec => sec.visible || !previewMode)
              .map(sec => {
                const isSelected = selectedSectionId === sec.id;
                const TagName = sec.type === 'nav' ? 'header' : sec.type === 'footer' ? 'footer' : 'section';

                return (
                  <div
                    key={sec.id}
                    data-sec={sec.id}
                    className={`frame relative group transition-all ${
                      !previewMode ? 'cursor-pointer hover:ring-2 hover:ring-indigo-400/40' : ''
                    } ${isSelected && !previewMode ? 'ring-2 ring-indigo-500' : ''} ${
                      !sec.visible ? 'opacity-40' : ''
                    }`}
                    onClick={e => {
                      if (!previewMode) {
                        e.stopPropagation();
                        onSelectSection(sec.id);
                      }
                    }}
                  >
                    {/* Floating Action Stool */}
                    {!previewMode && isSelected && (
                      <div
                        className="absolute top-3 right-3 z-30 flex items-center gap-1 bg-slate-900/95 border border-indigo-500/80 rounded-lg p-1 shadow-xl backdrop-blur-md"
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          onClick={() => onSectionAction(sec.id, 'up')}
                          title="Move Section Up"
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSectionAction(sec.id, 'down')}
                          title="Move Section Down"
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSectionAction(sec.id, 'dup')}
                          title="Duplicate Section"
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSectionAction(sec.id, 'hide')}
                          title={sec.visible ? 'Hide Section' : 'Show Section'}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                        >
                          {sec.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => onSectionAction(sec.id, 'del')}
                          title="Delete Section"
                          className="p-1.5 rounded hover:bg-red-950 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <TagName
                      id={sec.type === 'hero' ? 'top' : sec.type}
                      className={`sec t-${sec.type} bg-${sec.style.bg || 'default'} pad-${
                        sec.style.pad || 'md'
                      }`}
                      data-anim={sec.anim && sec.anim !== 'none' ? sec.anim : undefined}
                      data-tilt={sec.fx?.tilt ? '1' : undefined}
                      data-spot={sec.fx?.spot ? '1' : undefined}
                    >
                      {renderSectionMedia(sec)}
                      <div className="content">{renderSectionContent(sec)}</div>
                      {renderFloats(sec)}
                    </TagName>
                  </div>
                );
              })}
          </div>

          {/* Smartphone Hardware Bottom Home Bar */}
          {!previewMode && canvasConfig.frameStyle === 'device_bezel' && device === 'mobile' && (
            <div className="w-full bg-slate-900 border-t border-slate-800 py-2 flex justify-center items-center">
              <div className="w-32 h-1 bg-slate-600 rounded-full" />
            </div>
          )}
        </div>
      </div>

      {/* Google Stitch Canvas Studio Settings Modal */}
      <CanvasStudioControls
        isOpen={isStudioControlsOpen}
        onClose={() => setIsStudioControlsOpen(false)}
        config={canvasConfig}
        onChange={updateCanvasConfig}
        onReset={handleResetCanvasConfig}
        primaryAccent={project.theme.palette.primary}
      />
    </div>
  );
};
