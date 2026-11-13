/**
 * Standalone HTML Generator for SiteCraft Projects
 * Produces clean, portable single-file index.html with inlined CSS, fonts, and FX runtime.
 */
import { SiteProject } from './builderTypes';
import { computeThemeVars } from './builderDefaults';
import { SITE_BUILDER_CSS } from './builderStyles';
import { SC_RUNTIME_INLINED_JS } from './scFxRuntime';

export function generateStandaloneHtml(project: SiteProject): string {
  const { title, theme, sections, profile } = project;
  const themeVars = computeThemeVars(theme);

  // Google fonts URL
  const fonts = [...new Set([theme.fontH, theme.fontB])];
  const fontUrl = `https://fonts.googleapis.com/css2?${fonts
    .map(f => `family=${f.replace(/ /g, '+')}:wght@400;600;700;800`)
    .join('&')}&display=swap`;

  // Escape HTML entities
  const esc = (str?: string) =>
    (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  // Render sections HTML string
  const renderedSections = sections
    .filter(s => s.visible)
    .map(sec => {
      const tag = sec.type === 'nav' ? 'header' : sec.type === 'footer' ? 'footer' : 'section';
      const id = sec.type === 'hero' ? 'top' : sec.type;
      const bgClass = `bg-${sec.style?.bg || 'default'}`;
      const padClass = `pad-${sec.style?.pad || 'md'}`;
      const animAttr = sec.anim && sec.anim !== 'none' ? ` data-anim="${sec.anim}"` : '';
      const tiltAttr = sec.fx?.tilt ? ' data-tilt="1"' : '';
      const spotAttr = sec.fx?.spot ? ' data-spot="1"' : '';

      // Media layer
      let mediaHtml = '';
      if (sec.media && sec.media.type !== 'none') {
        if (sec.media.type === 'gradient' && sec.media.grad) {
          mediaHtml = `<div class="media" style="background: linear-gradient(${sec.media.grad.angle || 135}deg, ${sec.media.grad.c1}, ${sec.media.grad.c2});"></div>`;
        } else if (sec.media.type === 'scene') {
          mediaHtml = `<div class="media"><canvas data-scene="${sec.media.scene || 'torus'}" class="scene"></canvas></div>`;
        } else if (sec.media.type === 'avatar' && sec.media.avatar) {
          mediaHtml = `<div class="avbg" style="right: ${sec.media.pos === 'right' ? '4%' : 'auto'}; left: ${sec.media.pos === 'left' ? '4%' : 'auto'}; width: ${sec.media.size || 46}%;">
            ${sec.media.backdrop === 'scene' ? `<canvas data-scene="${sec.media.scene || 'particles'}" class="scene" style="position:absolute;inset:0;"></canvas>` : ''}
            <canvas data-avatar='${JSON.stringify(sec.media.avatar)}' style="width:100%;height:100%;position:relative;z-index:1;"></canvas>
          </div>`;
        }
      }

      // Content HTML
      let contentHtml = '';
      const data = sec.data || {};

      switch (sec.type) {
        case 'nav':
          contentHtml = `<div class="wrap">
            <div class="nav ${sec.variant === 'center' ? 'stack' : ''}">
              <a href="#top" class="brand">${esc(data.brand || profile.name)}</a>
              <nav>
                ${(data.links || []).map((l: any) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join('')}
              </nav>
              <div><a href="#contact" class="btn sm">${esc(data.cta || 'Get in Touch')}</a></div>
            </div>
          </div>`;
          break;

        case 'hero':
          if (sec.variant === 'center') {
            contentHtml = `<div class="wrap narrow center hero centered">
              <span class="eyebrow">${esc(data.eyebrow)}</span>
              <h1>${esc(data.title)}</h1>
              <p class="lead">${esc(data.subtitle)}</p>
              <div class="row c mt-3">
                <a href="#projects" class="btn">${esc(data.cta || 'See my work')}</a>
                ${data.cta2 ? `<a href="#contact" class="btn ghost">${esc(data.cta2)}</a>` : ''}
              </div>
            </div>`;
          } else if (sec.variant === 'bold') {
            contentHtml = `<div class="wrap hero bold">
              <span class="eyebrow">${esc(data.eyebrow)}</span>
              <h1>${esc(data.title)}</h1>
              <p class="lead narrow">${esc(data.subtitle)}</p>
              <div class="row mt-4">
                <a href="#projects" class="btn">${esc(data.cta || 'Explore projects')}</a>
                ${data.cta2 ? `<a href="#contact" class="btn ghost">${esc(data.cta2)}</a>` : ''}
              </div>
            </div>`;
          } else if (sec.variant === 'avatar') {
            contentHtml = `<div class="wrap grid2 hero avh">
              <div class="col">
                <span class="eyebrow">${esc(data.eyebrow)}</span>
                <h1>${esc(data.title)}</h1>
                <p class="lead">${esc(data.subtitle)}</p>
                <div class="row mt-3">
                  <a href="#projects" class="btn">${esc(data.cta || 'Explore')}</a>
                  ${data.cta2 ? `<a href="#contact" class="btn ghost">${esc(data.cta2)}</a>` : ''}
                </div>
              </div>
              <div class="avspace"></div>
            </div>`;
          } else {
            contentHtml = `<div class="wrap grid2 hero">
              <div class="col">
                <span class="eyebrow">${esc(data.eyebrow)}</span>
                <h1>${esc(data.title)}</h1>
                <p class="lead">${esc(data.subtitle)}</p>
                <div class="row mt-3">
                  <a href="#projects" class="btn">${esc(data.cta || 'See my work')}</a>
                  ${data.cta2 ? `<a href="#contact" class="btn ghost">${esc(data.cta2)}</a>` : ''}
                </div>
              </div>
              <div class="imgbox hero-img flex items-center justify-center p-6">
                <canvas data-scene="torus" style="width:100%;height:100%;max-height:380px;"></canvas>
              </div>
            </div>`;
          }
          break;

        case 'about':
          if (sec.variant === 'stats') {
            contentHtml = `<div class="wrap">
              <div class="head center">
                <h2>${esc(data.title)}</h2>
                <p class="lead narrow">${esc(data.text)}</p>
              </div>
              <div class="stats big" style="justify-content:center;">
                ${(data.stats || []).map((s: any) => `<div class="stat card text-center"><span class="num">${esc(s.value)}</span><span class="muted text-sm">${esc(s.label)}</span></div>`).join('')}
              </div>
            </div>`;
          } else {
            contentHtml = `<div class="wrap grid2">
              <div class="col">
                <h2>${esc(data.title)}</h2>
                <p class="lead">${esc(data.text)}</p>
                <div class="stats mt-2">
                  ${(data.stats || []).map((s: any) => `<div class="stat"><span class="num">${esc(s.value)}</span><span class="muted text-xs">${esc(s.label)}</span></div>`).join('')}
                </div>
              </div>
              <div class="imgbox portrait flex items-center justify-center p-8">
                <canvas data-scene="sphere" style="width:100%;height:100%;max-height:360px;"></canvas>
              </div>
            </div>`;
          }
          break;

        case 'skills':
          contentHtml = `<div class="wrap">
            <div class="head">
              <h2>${esc(data.title)}</h2>
              <p class="lead">${esc(data.subtitle)}</p>
            </div>
            ${
              sec.variant === 'bars'
                ? `<div class="bars">${(data.items || []).map((i: any) => `<div class="flex flex-col gap-1"><div class="flex justify-between text-sm font-semibold"><span>${esc(i.name)}</span><span class="muted">${i.level}%</span></div><div class="track"><i style="width:${i.level}%"></i></div></div>`).join('')}</div>`
                : `<div class="chips">${(data.items || []).map((i: any) => `<span class="chip">${esc(i.name)}</span>`).join('')}</div>`
            }
          </div>`;
          break;

        case 'services':
          contentHtml = `<div class="wrap">
            <div class="head ${sec.variant === 'centered' ? 'center' : ''}">
              <h2>${esc(data.title)}</h2>
              <p class="lead">${esc(data.subtitle)}</p>
            </div>
            <div class="cards ${sec.variant === 'list' ? 'style="grid-template-columns:1fr;"' : ''}">
              ${(data.items || []).map((i: any) => `<div class="card"><div class="ico">${esc(i.icon || '🚀')}</div><h3>${esc(i.title)}</h3><p class="muted text-sm">${esc(i.text)}</p></div>`).join('')}
            </div>
          </div>`;
          break;

        case 'projects':
          contentHtml = `<div class="wrap">
            <div class="head">
              <h2>${esc(data.title)}</h2>
              <p class="lead">${esc(data.subtitle)}</p>
            </div>
            <div class="cards">
              ${(data.items || []).map((p: any, idx: number) => `<div class="card pcard">
                <div class="imgbox flex items-center justify-center p-6" style="background:rgba(0,0,0,0.3);">
                  <canvas data-scene="${idx % 2 === 0 ? 'cube' : 'waves'}" style="width:100%;height:160px;"></canvas>
                </div>
                <div class="pad">
                  <span class="eyebrow">${esc(p.tags)}</span>
                  <h3>${esc(p.title)}</h3>
                  <p class="muted text-sm">${esc(p.text)}</p>
                  <a href="${esc(p.link || 'https://github.com')}" target="_blank" rel="noreferrer" class="more">View Project →</a>
                </div>
              </div>`).join('')}
            </div>
          </div>`;
          break;

        case 'repos':
          contentHtml = `<div class="wrap">
            <div class="head">
              <h2>${esc(data.title)}</h2>
              <p class="lead">${esc(data.subtitle)}</p>
            </div>
            <div class="cards">
              ${(data.items || []).map((r: any) => `<a href="${esc(r.url)}" target="_blank" rel="noreferrer" class="card">
                <div class="flex justify-between items-center"><h3 style="font-size:1rem;font-weight:600;">${esc(r.name)}</h3><span class="muted text-xs">★ ${r.stars?.toLocaleString() || 0}</span></div>
                <p class="muted text-sm grow">${esc(r.description)}</p>
                <div class="flex items-center gap-2 text-xs muted"><span>${esc(r.language || 'Code')}</span></div>
              </a>`).join('')}
            </div>
          </div>`;
          break;

        case 'testimonials':
          contentHtml = `<div class="wrap">
            <div class="head center">
              <h2>${esc(data.title)}</h2>
              <p class="lead">${esc(data.subtitle)}</p>
            </div>
            <div class="cards">
              ${(data.items || []).map((r: any) => `<figure class="card quote">
                <blockquote>"${esc(r.quote)}"</blockquote>
                <figcaption style="margin-top:16px;">
                  <div style="width:36px;height:36px;border-radius:50%;background:rgba(124,140,255,0.2);display:grid;place-items:center;font-weight:700;">${(r.name || 'A')[0]}</div>
                  <div><b>${esc(r.name)}</b><br><span class="muted text-xs">${esc(r.role)}</span></div>
                </figcaption>
              </figure>`).join('')}
            </div>
          </div>`;
          break;

        case 'experience':
          contentHtml = `<div class="wrap narrow">
            <div class="head">
              <h2>${esc(data.title)}</h2>
              <p class="lead">${esc(data.subtitle)}</p>
            </div>
            <div class="tl">
              ${(data.items || []).map((exp: any) => `<div class="tli">
                <i></i>
                <span class="eyebrow">${esc(exp.period)}</span>
                <h3>${esc(exp.role)}</h3>
                <div class="org">${esc(exp.org)}</div>
                <p class="muted text-sm">${esc(exp.text)}</p>
              </div>`).join('')}
            </div>
          </div>`;
          break;

        case 'contact':
          contentHtml = `<div class="wrap narrow center contact">
            <h2>${esc(data.title)}</h2>
            <p class="lead">${esc(data.text)}</p>
            <a href="mailto:${esc(data.email || 'hello@example.com')}" class="btn mt-2">${esc(data.cta || 'Send Message')}</a>
            <div class="row c links mt-4">
              ${(data.links || []).map((l: any) => `<a href="${esc(l.href)}" target="_blank" rel="noreferrer">${esc(l.label)}</a>`).join('')}
            </div>
          </div>`;
          break;

        case 'video': {
          const rawUrl = String(data.url || '').trim();
          let embedUrl = '';
          const ytMatch = rawUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
          if (ytMatch) {
            embedUrl = `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`;
          } else if (rawUrl.includes('youtube-nocookie.com/embed/') || rawUrl.includes('player.vimeo.com/video/')) {
            embedUrl = rawUrl;
          }
          contentHtml = `<div class="wrap narrow center">
            <div class="head center">
              <h2>${esc(data.title)}</h2>
              <p class="lead">${esc(data.subtitle)}</p>
            </div>
            <div class="vwrap my-4">
              ${
                embedUrl
                  ? `<iframe src="${esc(embedUrl)}" allowfullscreen></iframe>`
                  : `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--surface);border:1px solid var(--border);color:var(--muted);font-family:var(--font-b);padding:24px;text-align:center;"><strong style="color:var(--text);margin-bottom:6px;">Video Walkthrough Slot</strong><span style="font-size:14px;">Set a YouTube or Vimeo embed URL in SiteCraft Inspector.</span></div>`
              }
            </div>
            <p class="muted text-sm cap">${esc(data.caption)}</p>
          </div>`;
          break;
        }

        case 'footer':
          contentHtml = `<div class="wrap between">
            <span class="muted text-sm">${esc(data.text)}</span>
            <a href="#top" class="muted text-sm">Back to top ↑</a>
          </div>`;
          break;

        default:
          contentHtml = '';
      }

      // Floating elements layer
      let floatsHtml = '';
      if (sec.floats && sec.floats.length > 0) {
        floatsHtml = `<div class="floats">${sec.floats
          .map(fl => {
            let inner = '';
            if (fl.kind === 'text') {
              inner = `<div class="ft" style="font-size:${fl.fontSize || 16}px;font-weight:${fl.fontWeight || 600};color:${fl.color || 'inherit'};">${esc(fl.text)}</div>`;
            } else if (fl.kind === 'avatar') {
              inner = `<canvas data-avatar='${JSON.stringify(fl.avatarConfig || {})}' style="width:100%;height:${fl.h || 180}px;"></canvas>`;
            } else if (fl.kind === 'scene') {
              inner = `<canvas data-scene="${fl.sceneKind || 'particles'}" style="width:100%;height:${fl.h || 140}px;"></canvas>`;
            } else if (fl.kind === 'btn') {
              inner = `<a href="${esc(fl.href || '#')}" class="btn sm ${fl.variant === 'ghost' ? 'ghost' : ''}">${esc(fl.label || 'Action')}</a>`;
            } else if (fl.kind === 'shape') {
              inner = `<div class="fshape" style="width:${fl.w || 60}px;height:${fl.h || 60}px;border-radius:${fl.shape === 'circle' ? '50%' : fl.shape === 'pill' ? '999px' : '12px'};background:${fl.fill || 'var(--primary)'};"></div>`;
            } else if (fl.kind === 'threeLogo') {
              const tl = fl.threeLogoData || {};
              inner = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:12px;background:rgba(9,9,11,0.92);border:1px solid ${tl.primaryColor || '#2563eb'}55;border-radius:12px;box-shadow:0 10px 25px -5px rgba(0,0,0,0.5);backdrop-filter:blur(8px);text-align:center;">
                <div style="width:44px;height:44px;border-radius:8px;background:linear-gradient(135deg, ${tl.primaryColor || '#2563eb'} 0%, ${tl.secondaryColor || '#38bdf8'} 100%);margin-bottom:6px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;font-family:monospace;">3D</div>
                <div style="font-size:11px;font-weight:700;color:#fff;letter-spacing:0.04em;">${esc(tl.name || '3D MARK')}</div>
                <div style="font-size:9px;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.08em;">${esc(tl.archetype || 'Procedural 3D')}</div>
              </div>`;
            }

            return `<div class="fl" data-fc="${fl.motion && fl.motion !== 'none' ? fl.motion : ''}" data-hv="${fl.hover && fl.hover !== 'none' ? fl.hover : ''}" style="left:${fl.x}%;top:${fl.y}%;width:${fl.w || 140}px;height:${fl.h ? `${fl.h}px` : 'auto'};transform:${fl.rot ? `rotate(${fl.rot}deg)` : 'none'};z-index:${fl.z || 5};"><div class="fi">${inner}</div></div>`;
          })
          .join('')}</div>`;
      }

      return `<${tag} id="${id}" class="sec t-${sec.type} ${bgClass} ${padClass}"${animAttr}${tiltAttr}${spotAttr}>
        ${mediaHtml}
        <div class="content">${contentHtml}</div>
        ${floatsHtml}
      </${tag}>`;
    })
    .join('\n');

  // CSS variables string
  const cssVarsString = Object.entries(themeVars)
    .map(([k, v]) => `${k}: ${v};`)
    .join('\n    ');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(profile.role)} portfolio of ${esc(profile.name)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="${fontUrl}">
  <style>
    :root {
      ${cssVarsString}
    }
    html, body {
      margin: 0;
      padding: 0;
      background: var(--bg);
      color: var(--text);
    }
    ${SITE_BUILDER_CSS}
  </style>
</head>
<body>
  <div class="site fx-on">
    ${renderedSections}
  </div>

  <script>
    ${SC_RUNTIME_INLINED_JS}
  </script>
</body>
</html>`;
}
