/**
 * CSS stylesheet for SiteCraft live preview & exported standalone sites
 */

export const SITE_BUILDER_CSS = `
/* SiteCraft Site Container & Themes */
.site {
  container-type: inline-size;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-b);
  line-height: 1.6;
  font-size: 16px;
  scroll-behavior: smooth;
  width: 100%;
  min-height: 100%;
}
.site * { box-sizing: border-box; }
.site h1, .site h2, .site h3, .site h4 {
  font-family: var(--font-h);
  line-height: 1.15;
  margin: 0;
  letter-spacing: -0.02em;
}
.site h1 { font-size: clamp(2.2rem, 5.5cqw, 4.2rem); }
.site h2 { font-size: clamp(1.7rem, 3.8cqw, 2.5rem); }
.site h3 { font-size: 1.25rem; }
.site p { margin: 0; }
.site a { color: inherit; text-decoration: none; }
.site img { display: block; width: 100%; height: 100%; object-fit: cover; }
.site .wrap { max-width: 1100px; margin: 0 auto; padding: 0 24px; position: relative; }
.site .narrow { max-width: 760px; }

/* Sections & Spacing */
.site .sec { padding: var(--sp) 0; position: relative; overflow: hidden; }
.site .pad-sm { padding: calc(var(--sp) * 0.55) 0; }
.site .pad-lg { padding: calc(var(--sp) * 1.5) 0; }

/* Section Backgrounds */
.site .bg-surface { background: var(--surface); }
.site .bg-accent {
  background: var(--primary);
  --text: var(--on-primary);
  --muted: var(--on-primary);
  --border: rgba(255, 255, 255, 0.28);
  --surface: rgba(255, 255, 255, 0.12);
  color: var(--on-primary);
}
.site .bg-accent .btn { background: var(--on-primary); color: var(--primary); border-color: var(--on-primary); }
.site .bg-accent .btn.ghost { background: transparent; color: var(--on-primary); border-color: var(--on-primary); }
.site .bg-accent .chip, .site .bg-accent .card { background: rgba(255, 255, 255, 0.14); border-color: rgba(255, 255, 255, 0.25); }
.site .bg-accent .eyebrow { color: var(--on-primary); opacity: 0.85; }
.site .bg-accent .num { color: var(--on-primary); }

.site .muted { color: var(--muted); }
.site .center { text-align: center; align-items: center; }
.site .grow { flex: 1; }
.site .head { margin-bottom: 36px; display: grid; gap: 8px; max-width: 640px; }
.site .head.center { margin-inline: auto; text-align: center; }
.site .sub, .site .lead { color: var(--muted); font-size: 1.1rem; }
.site .eyebrow {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-weight: 700;
  color: var(--primary);
  display: inline-block;
}

.site .col { display: flex; flex-direction: column; gap: 18px; justify-content: center; }
.site .row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
.site .row.c { justify-content: center; }
.site .row.end { justify-content: flex-end; align-self: flex-end; }
.site .between { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.site .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
.site .grid2.tight { gap: 28px; margin-top: 24px; }

/* Buttons */
.site .btn {
  display: inline-block;
  background: var(--primary);
  color: var(--on-primary);
  padding: 12px 22px;
  border-radius: calc(var(--radius) * 0.8);
  font-weight: 700;
  border: 2px solid var(--primary);
  transition: transform 0.15s, opacity 0.15s;
  cursor: pointer;
  font-family: var(--font-b);
  font-size: 0.95rem;
}
.site .btn:hover { transform: translateY(-2px); opacity: 0.92; }
.site .btn.ghost { background: transparent; color: var(--text); border-color: var(--border); }
.site .btn.sm { padding: 8px 16px; font-size: 0.88rem; }

/* Media Box */
.site .imgbox { position: relative; overflow: hidden; border-radius: var(--radius); background: var(--surface); }
.site .hero-img { aspect-ratio: 1/1; max-height: 480px; }
.site .portrait { aspect-ratio: 4/5; max-height: 480px; }
.site .avatar { width: 140px; height: 140px; border-radius: 50%; margin-bottom: 8px; border: 3px solid var(--primary); }

/* Hero */
.site .hero { padding-top: 24px; }
.site .hero.centered { display: flex; flex-direction: column; gap: 18px; align-items: center; text-align: center; max-width: 820px; margin: 0 auto; }
.site .hero.bold h1 { font-size: clamp(2.8rem, 8cqw, 5.8rem); margin: 12px 0; }

/* Header / Nav */
.site .nav { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.site .nav nav { display: flex; gap: 24px; color: var(--muted); font-weight: 500; }
.site .nav.stack { flex-direction: column; gap: 12px; }
.site .brand { font-family: var(--font-h); font-weight: 800; font-size: 1.25rem; }
.site header.sec { padding: 18px 0; border-bottom: 1px solid var(--border); }

/* Stats & Chips */
.site .stats { display: flex; gap: 32px; flex-wrap: wrap; margin-top: 10px; }
.site .stat { display: flex; flex-direction: column; }
.site .num { font-family: var(--font-h); font-size: 2rem; font-weight: 800; color: var(--primary); line-height: 1; }
.site .chips { display: flex; gap: 8px; flex-wrap: wrap; }
.site .chip {
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 7px 14px;
  border-radius: 99px;
  font-weight: 600;
  font-size: 0.9rem;
  display: inline-block;
}
.site .chip.sm { padding: 3px 10px; font-size: 0.76rem; }

/* Skill Bars */
.site .bars { display: grid; gap: 18px; max-width: 680px; }
.site .track {
  height: 8px;
  background: var(--surface);
  border-radius: 9px;
  margin-top: 8px;
  overflow: hidden;
  border: 1px solid var(--border);
}
.site .track i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--accent));
  border-radius: 9px;
}

/* Cards & Grid */
.site .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
.site .card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.site .ico {
  font-size: 0.95rem;
  font-weight: 700;
  font-family: var(--font-h);
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: calc(var(--radius) * 0.7);
  color: var(--primary);
  flex: none;
}
.site .pcard { padding: 0; overflow: hidden; transition: transform 0.2s; }
.site .pcard:hover { transform: translateY(-4px); }
.site .pcard .imgbox { border-radius: 0; aspect-ratio: 16/10; }
.site .pcard .pad { padding: 20px; display: flex; flex-direction: column; gap: 10px; }
.site .more { color: var(--primary); font-weight: 700; margin-top: 4px; font-size: 0.9rem; }

/* Rows & Timelines */
.site .rows { display: grid; }
.site .rowitem { display: flex; gap: 20px; align-items: center; padding: 18px 0; border-top: 1px solid var(--border); }
.site .rowitem:last-child { border-bottom: 1px solid var(--border); }
.site .tl { border-left: 2px solid var(--border); margin-left: 6px; display: grid; gap: 30px; }
.site .tli { position: relative; padding-left: 26px; display: flex; flex-direction: column; gap: 4px; }
.site .tli i {
  position: absolute;
  left: -7px;
  top: 6px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--primary);
  box-shadow: 0 0 0 4px var(--bg);
}
.site .org { font-weight: 600; }

/* Testimonials */
.site .quote blockquote { margin: 0; font-size: 1.05rem; }
.site .quote figcaption, .site .bigq figcaption { display: flex; gap: 12px; align-items: center; margin-top: auto; }
.site .quote img { width: 44px; height: 44px; border-radius: 50%; }
.site figure { margin: 0; }
.site .bigq { display: grid; gap: 36px; }
.site .bigq blockquote { margin: 0 0 12px; font-family: var(--font-h); font-size: 1.5rem; line-height: 1.35; }

/* Contact & Forms */
.site .contact { display: grid; gap: 18px; }
.site .contact.center { display: flex; flex-direction: column; gap: 18px; text-align: center; }
.site .mail { font-weight: 700; font-size: 1.2rem; color: var(--primary); }
.site .links { gap: 20px; color: var(--muted); font-weight: 600; }
.site .form { gap: 12px; }
.site .form input, .site .form textarea {
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: calc(var(--radius) * 0.6);
  padding: 12px 14px;
  color: var(--text);
  font: inherit;
}

/* Footer */
.site footer.sec { padding: 26px 0; border-top: 1px solid var(--border); }

/* Background Media & 3D Canvas */
.site .media { position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
.site .content { position: relative; z-index: 1; }
.site .mbg { position: absolute; inset: 0; background-size: cover; background-position: center; }
.site .mbg.grad { background: linear-gradient(var(--ang, 135deg), var(--c1), var(--c2)); }
.site .mov { position: absolute; inset: 0; background: var(--bg); }
.site .scene { width: 100%; height: 100%; display: block; }
.site .avbg { position: absolute; top: 0; bottom: 0; right: 4%; width: 44%; min-width: 280px; }
.site .avbg canvas { width: 100%; height: 100%; display: block; }
.site .avspace { min-height: clamp(280px, 40cqw, 480px); }
.site .vwrap { position: relative; aspect-ratio: 16/9; border-radius: var(--radius); overflow: hidden; background: #000; border: 1px solid var(--border); }
.site .vwrap iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.site .cap { text-align: center; margin-top: 12px; }

/* Freeform Floats */
.site .floats { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
.site .fl { position: absolute; pointer-events: auto; touch-action: none; }
.site .fi { width: 100%; height: 100%; transition: translate 0.25s, scale 0.25s, filter 0.25s; }
.site .ft { white-space: pre-wrap; line-height: 1.15; outline: none; word-break: break-word; }
.site .fimg { width: 100%; height: 100%; display: block; }
.site .fv { position: relative; width: 100%; height: 100%; overflow: hidden; background: #000; }
.site .fv iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.site .fbtn { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }

/* Hover & Motion loops */
.site .fl[data-hv="lift"]:hover .fi { translate: 0 -8px; }
.site .fl[data-hv="zoom"]:hover .fi { scale: 1.08; }
.site .fl[data-hv="glow"]:hover .fi { filter: drop-shadow(0 0 18px var(--primary)); }
.site.fx-on .fl[data-fc="float"] .fi { animation: scflt 4.5s ease-in-out infinite; }
.site.fx-on .fl[data-fc="pulse"] .fi { animation: scpls 2.6s ease-in-out infinite; }
.site.fx-on .fl[data-fc="spin"] .fi { animation: scspin 14s linear infinite; }
.site.fx-on .fl[data-fc="sway"] .fi { animation: scsway 5s ease-in-out infinite; }
@keyframes scflt { 50% { translate: 0 -14px; } }
@keyframes scpls { 50% { scale: 1.08; } }
@keyframes scspin { to { rotate: 360deg; } }
@keyframes scsway { 0%, 100% { rotate: -4deg; } 50% { rotate: 4deg; } }

/* Scroll reveal animations */
.site.fx-on [data-anim] .content > .wrap > * {
  opacity: 0;
  transition: opacity 0.8s ease, translate 0.8s cubic-bezier(0.2, 0.7, 0.2, 1), scale 0.8s cubic-bezier(0.2, 0.7, 0.2, 1);
  transition-delay: calc(var(--i, 0) * 100ms);
}
.site.fx-on [data-anim="fade-up"] .content > .wrap > * { translate: 0 32px; }
.site.fx-on [data-anim="slide-left"] .content > .wrap > * { translate: -60px 0; }
.site.fx-on [data-anim="slide-right"] .content > .wrap > * { translate: 60px 0; }
.site.fx-on [data-anim="zoom"] .content > .wrap > * { scale: 0.9; }
.site.fx-on [data-anim].in .content > .wrap > * { opacity: 1; translate: none; scale: none; }

/* Spotlight Radial Glow */
.site .sec[data-spot]::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: radial-gradient(520px circle at var(--mx, 50%) var(--my, 35%), color-mix(in srgb, var(--primary) 22%, transparent), transparent 65%);
  opacity: 0;
  transition: opacity 0.4s;
}
.site.fx-on .sec[data-spot]:hover::after { opacity: 1; }

/* Responsive Container Queries */
@container (max-width: 760px) {
  .site .grid2 { grid-template-columns: 1fr; gap: 28px; }
  .site .nav nav { display: none; }
  .site .nav.stack nav { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; }
  .site .avbg { position: relative; width: 100%; right: auto; height: 320px; }
  .site .avspace { display: none; }
  .site .hero-img, .site .portrait { max-height: 340px; }
  .site .stats { gap: 20px; }
}
`;
