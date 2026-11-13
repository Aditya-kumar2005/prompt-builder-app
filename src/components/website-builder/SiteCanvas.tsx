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
  SECTION_META,
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
  Sliders,
  Lock,
  Laptop,
  Tablet,
  Smartphone,
  Pencil,
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
  onMobileEditSection?: () => void;
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
  onMobileEditSection,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1024);
  const [frameHeight, setFrameHeight] = useState<number>(0);

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

  // Track container width & frame height for seamless responsive canvas fitting on mobile/tablet
  useEffect(() => {
    const el = containerRef.current;
    const frameEl = frameRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === el) {
          setContainerWidth(Math.round(entry.contentRect.width));
        } else if (entry.target === frameEl) {
          setFrameHeight(Math.round(entry.contentRect.height));
        }
      }
    });
    ro.observe(el);
    if (frameEl) ro.observe(frameEl);
    return () => ro.disconnect();
  }, [previewMode, device, project.sections.length]);

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

  // Initialize FX, animations, and canvas scenes whenever sections change or mount
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

    // reveal [data-anim] sections cleanly
    const animTargets = containerRef.current.querySelectorAll<HTMLElement>('[data-anim]');
    if (!previewMode) {
      // Keep every section visible while editing
      animTargets.forEach(el => el.classList.add('in'));
    } else if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      animTargets.forEach(el => {
        el.classList.remove('in');
        el.querySelectorAll('.content > .wrap > *').forEach((child, idx) => {
          (child as HTMLElement).style.setProperty('--i', String(idx));
        });
      });
      const io = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in');
              io.unobserve(entry.target);
            }
          });
        },
        { root: containerRef.current, threshold: 0.05 }
      );
      animTargets.forEach(el => io.observe(el));
      cleanups.push(() => io.disconnect());
    } else {
      animTargets.forEach(el => el.classList.add('in'));
    }

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
        className={`${className || ''} outline-none rounded transition-shadow hover:ring-2 hover:ring-blue-400/50 focus:ring-2 focus:ring-blue-500 focus:bg-blue-500/10 px-1 -mx-1`}
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
            <div
              className="imgbox hero-img flex items-center justify-center p-6 border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
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
            <div
              className="imgbox portrait flex items-center justify-center p-8 border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
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
                  <div className="ico">{renderEditable(sec.id, `items.${i}.icon`, item.icon || '01')}</div>
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
                  <div
                    className="imgbox flex items-center justify-center p-6 border-b"
                    style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
                  >
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
                  className="card hover:border-blue-400 transition-colors"
                  onClick={e => !previewMode && e.preventDefault()}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-semibold">{repo.name}</h3>
                    <span className="text-xs font-mono muted tabular-nums">
                      ★ {repo.stars?.toLocaleString() || 0}
                    </span>
                  </div>
                  <p className="muted text-sm grow">{repo.description || 'Public repository'}</p>
                  <div className="flex items-center gap-2 text-xs muted font-mono">
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
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border"
                      style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--primary)' }}
                    >
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

      case 'video': {
        const rawUrl = String(data.url || '').trim();
        let embedUrl = '';
        const ytMatch = rawUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
        if (ytMatch) {
          embedUrl = `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`;
        } else if (rawUrl.includes('youtube-nocookie.com/embed/') || rawUrl.includes('player.vimeo.com/video/')) {
          embedUrl = rawUrl;
        }
        return (
          <div className="wrap narrow center">
            <div className="head center">
              <h2>{renderEditable(sec.id, 'title', data.title || 'Project Reel', undefined, 'span')}</h2>
              <p className="lead">{renderEditable(sec.id, 'subtitle', data.subtitle || 'Watch walkthrough', undefined, 'span')}</p>
            </div>
            <div className="vwrap my-4">
              {embedUrl ? (
                <iframe src={embedUrl} title="Video preview" allowFullScreen />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-400 p-6 text-center">
                  <p className="text-sm font-medium text-zinc-200 mb-1">Video Walkthrough Slot</p>
                  <p className="text-xs text-zinc-400">
                    Paste a YouTube or Vimeo link under Edit Section &rarr; Embed Video URL.
                  </p>
                </div>
              )}
            </div>
            <p className="muted text-sm cap">{renderEditable(sec.id, 'caption', data.caption || 'Project demo')}</p>
          </div>
        );
      }

      case 'canvas':
        return (
          <div
            className="wrap flex items-center justify-center border border-dashed rounded-xl"
            style={{ minHeight: data.height || 300, borderColor: 'var(--border)' }}
          >
            <div className="text-center p-6 muted">
              <p className="font-semibold" style={{ color: 'var(--text)' }}>
                Freeform Canvas Area
              </p>
              <p className="text-xs mt-1">
                Add floating 3D marks, avatars, text, or interactive buttons anywhere in this region.
              </p>
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

  // Compute Device Viewport Width (numeric for responsive fitting)
  const numericDeviceWidth = device === 'tablet' ? 768 : device === 'mobile' ? 390 : 1280;
  const horizontalGutter = containerWidth < 640 ? 16 : 48;
  const availableWidth = Math.max(240, containerWidth - horizontalGutter);
  const autoScale =
    !previewMode && containerWidth > 0 && availableWidth < numericDeviceWidth
      ? availableWidth / numericDeviceWidth
      : 1;
  const effectiveScale = previewMode ? 1 : Number((autoScale * canvasConfig.zoom).toFixed(3));

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
        return 'p-2 sm:p-5';
      case 'spacious':
        return 'p-3 sm:p-12';
      case 'normal':
      default:
        return 'p-2 sm:p-8';
    }
  };

  const handleZoom = (delta: number) => {
    const next = Math.min(Math.max(parseFloat((canvasConfig.zoom + delta).toFixed(2)), 0.5), 1.6);
    updateCanvasConfig({ zoom: next });
  };

  const handleResetZoom = () => {
    updateCanvasConfig({ zoom: 1 });
  };

  const selectedSecObj = project.sections.find(s => s.id === selectedSectionId);
  const selectedSecLabel = selectedSecObj ? SECTION_META[selectedSecObj.type]?.label || selectedSecObj.type : null;

  return (
    <div
      ref={containerRef}
      className={`flex-1 overflow-y-auto overflow-x-hidden flex flex-col items-center justify-start min-h-0 select-text relative transition-colors duration-200 ${getCanvasPaddingClass()}`}
      style={getCanvasBackgroundStyle()}
      onClick={() => {
        if (!previewMode) {
          onSelectFloat(null);
        }
      }}
    >
      {/* Clean Single-Row Workbench Canvas Bar */}
      {!previewMode && (
        <div
          className="sticky top-1.5 z-30 mb-3 flex items-center justify-between gap-2 px-3 py-1.5 bg-zinc-950/95 border border-zinc-800 rounded-xl shadow-lg backdrop-blur-md text-xs text-zinc-300 max-w-4xl w-full transition-colors"
          onClick={e => e.stopPropagation()}
        >
          {/* Left: Device Width & Active Section */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-200 tabular-nums shrink-0">
              {device === 'desktop' && <Laptop className="w-3.5 h-3.5 text-zinc-400" />}
              {device === 'tablet' && <Tablet className="w-3.5 h-3.5 text-zinc-400" />}
              {device === 'mobile' && <Smartphone className="w-3.5 h-3.5 text-zinc-400" />}
              <span>{numericDeviceWidth}px</span>
            </div>

            {selectedSecLabel && (
              <span className="hidden sm:inline text-[11px] text-zinc-400 truncate">
                Selected: <strong className="text-zinc-200 font-medium">{selectedSecLabel}</strong>
              </span>
            )}
          </div>

          {/* Right: Zoom Controls & Backdrop Settings */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center bg-zinc-900 p-0.5 rounded-md border border-zinc-800">
              <button
                type="button"
                onClick={() => handleZoom(-0.1)}
                className="p-1.5 sm:p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="px-1.5 py-0.5 text-[11px] font-mono text-zinc-300 hover:text-white tabular-nums cursor-pointer"
                title="Reset to Fit"
              >
                {Math.round(effectiveScale * 100)}%
              </button>
              <button
                type="button"
                onClick={() => handleZoom(0.1)}
                className="p-1.5 sm:p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsStudioControlsOpen(true)}
              className="px-2.5 py-1.5 sm:py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              title="Customize canvas backdrop, grid pattern, frame style, and shadows"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Backdrop</span>
            </button>
          </div>
        </div>
      )}

      {/* Responsive Auto-Fit Scaled Canvas Container */}
      <div
        className="w-full flex justify-center overflow-x-hidden"
        style={{
          height:
            !previewMode && frameHeight > 0 && effectiveScale !== 1
              ? `${Math.ceil(frameHeight * effectiveScale) + 16}px`
              : 'auto',
        }}
      >
        <div
          className="transition-transform duration-150 ease-out"
          style={{
            width: previewMode ? '100%' : `${numericDeviceWidth}px`,
            flexShrink: 0,
            transform: effectiveScale !== 1 ? `scale(${effectiveScale})` : undefined,
            transformOrigin: 'top center',
          }}
        >
          {/* Device Viewport Outer Card */}
          <div
            ref={frameRef}
            className="w-full transition-all duration-300 relative overflow-hidden"
            style={{
              borderRadius: previewMode ? 0 : `${canvasConfig.frameRadius}px`,
              boxShadow: getShadowStyle(),
              border: previewMode
                ? 'none'
                : canvasConfig.frameStyle === 'frameless'
                ? 'none'
                : '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Minimal Studio Browser Bar */}
            {!previewMode && canvasConfig.frameStyle === 'browser' && (
              <div className="bg-zinc-900 border-b border-zinc-800 px-3 py-2 flex items-center justify-between gap-3 select-none">
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                </div>

                <div className="flex-1 max-w-md mx-auto flex items-center gap-1.5 px-3 py-1 rounded bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300">
                  <Lock className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span className="truncate text-zinc-400 font-mono">
                    {canvasConfig.browserUrl || 'https://preview.sitecraft.dev'}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 text-[10px] text-zinc-500 font-mono">
                  <span className="uppercase">{device}</span>
                </div>
              </div>
            )}

            {/* Smartphone Bezel */}
            {!previewMode && canvasConfig.frameStyle === 'device_bezel' && device === 'mobile' && (
              <div className="w-full bg-zinc-950 border-b border-zinc-800 py-1.5 flex justify-center items-center">
                <div className="w-20 h-4 bg-black rounded-full flex items-center justify-center gap-2 border border-zinc-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
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
                  const secLabel = SECTION_META[sec.type]?.label || sec.type;

                  return (
                    <div
                      key={sec.id}
                      data-sec={sec.id}
                      className={`frame relative group transition-all ${
                        !previewMode ? 'cursor-pointer hover:ring-2 hover:ring-blue-400/40' : ''
                      } ${isSelected && !previewMode ? 'ring-2 ring-blue-500' : ''} ${
                        !sec.visible ? 'opacity-40' : ''
                      }`}
                      onClick={e => {
                        if (!previewMode) {
                          e.stopPropagation();
                          onSelectSection(sec.id);
                        }
                      }}
                    >
                      {/* Floating Section Controls */}
                      {!previewMode && isSelected && (
                        <div
                          className="absolute top-2.5 right-2.5 z-30 flex items-center gap-0.5 sm:gap-1 bg-zinc-950/95 border border-zinc-700 rounded-lg p-1 shadow-xl backdrop-blur-md"
                          onClick={e => e.stopPropagation()}
                        >
                          <span className="hidden sm:inline px-2 text-[11px] font-medium text-zinc-300 border-r border-zinc-800 mr-0.5">
                            {secLabel}
                          </span>
                          {onMobileEditSection && (
                            <button
                              type="button"
                              onClick={onMobileEditSection}
                              className="lg:hidden px-2.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1 cursor-pointer mr-0.5"
                              title="Edit this section"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onSectionAction(sec.id, 'up')}
                            title="Move Section Up"
                            className="p-2 sm:p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onSectionAction(sec.id, 'down')}
                            title="Move Section Down"
                            className="p-2 sm:p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onSectionAction(sec.id, 'dup')}
                            title="Duplicate Section"
                            className="p-2 sm:p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onSectionAction(sec.id, 'hide')}
                            title={sec.visible ? 'Hide Section' : 'Show Section'}
                            className="p-2 sm:p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          >
                            {sec.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => onSectionAction(sec.id, 'del')}
                            title="Delete Section"
                            className="p-2 sm:p-1.5 rounded hover:bg-rose-950 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
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

            {!previewMode && canvasConfig.frameStyle === 'device_bezel' && device === 'mobile' && (
              <div className="w-full bg-zinc-950 border-t border-zinc-800 py-2 flex justify-center items-center">
                <div className="w-32 h-1 bg-zinc-700 rounded-full" />
              </div>
            )}
          </div>
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
