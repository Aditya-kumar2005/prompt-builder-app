/**
 * SiteCraft FX Runtime
 * Procedural 3D math, canvas rendering, cursor-tracking 3D avatar, and interactive FX.
 * Pure TypeScript / HTML5 Canvas with zero external dependencies.
 */

export interface AvatarConfig {
  skin: string;
  hair: string;
  hairStyle: 'short' | 'long' | 'curly' | 'bun' | 'none';
  outfit: string;
  eyes: string;
  acc: 'glasses' | 'headphones' | 'none';
}

export const DEFAULT_AVATAR: AvatarConfig = {
  skin: '#d9a07a',
  hair: '#3a2417',
  hairStyle: 'short',
  outfit: '#6c8cff',
  eyes: '#3b2a1a',
  acc: 'glasses',
};

const TAU = Math.PI * 2;

function shade(hex: string, a: number): string {
  let h = String(hex).replace('#', '');
  if (h.length === 3) h = h.replace(/./g, '$&$&');
  const n = [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16) || 0);
  return (
    'rgb(' +
    n
      .map(v =>
        Math.max(0, Math.min(255, Math.round(a < 0 ? v * (1 + a) : v + (255 - v) * a)))
      )
      .join(',') +
    ')'
  );
}

function cssVar(el: HTMLElement, n: string, fb: string): string {
  return (getComputedStyle(el).getPropertyValue(n) || '').trim() || fb;
}

interface Geometry {
  P: [number, number, number][];
  E: [number, number][];
  kind: string;
}

export function generateGeometry(kind: string): Geometry {
  const P: [number, number, number][] = [];
  const E: [number, number][] = [];
  let i: number, j: number;

  if (kind === 'torus') {
    const N = 30;
    const M = 14;
    for (i = 0; i < N; i++) {
      for (j = 0; j < M; j++) {
        const u = (i / N) * TAU;
        const v = (j / M) * TAU;
        const r = 1 + 0.42 * Math.cos(v);
        P.push([r * Math.cos(u), 0.42 * Math.sin(v), r * Math.sin(u)]);
        E.push([i * M + j, ((i + 1) % N) * M + j], [i * M + j, i * M + ((j + 1) % M)]);
      }
    }
  } else if (kind === 'sphere') {
    const A = 11;
    const B = 20;
    for (i = 1; i < A; i++) {
      for (j = 0; j < B; j++) {
        const th = (i / A) * Math.PI;
        const ph = (j / B) * TAU;
        P.push([
          1.25 * Math.sin(th) * Math.cos(ph),
          1.25 * Math.cos(th),
          1.25 * Math.sin(th) * Math.sin(ph),
        ]);
        const k = (i - 1) * B + j;
        E.push([k, (i - 1) * B + ((j + 1) % B)]);
        if (i > 1) E.push([k, (i - 2) * B + j]);
      }
    }
  } else if (kind === 'cube') {
    [1, 0.5].forEach((s, q) => {
      for (i = 0; i < 8; i++) {
        P.push([
          (i & 1 ? 1 : -1) * s,
          (i & 2 ? 1 : -1) * s,
          (i & 4 ? 1 : -1) * s,
        ]);
      }
      const o = q * 8;
      for (i = 0; i < 8; i++) {
        for (j = i + 1; j < 8; j++) {
          const d = i ^ j;
          if (d === 1 || d === 2 || d === 4) E.push([o + i, o + j]);
        }
      }
    });
    for (i = 0; i < 8; i++) E.push([i, 8 + i]);
    for (i = 0; i < P.length; i++) {
      P[i] = [P[i][0] * 1.05, P[i][1] * 1.05, P[i][2] * 1.05];
    }
  } else if (kind === 'waves') {
    const G = 26;
    for (i = 0; i < G; i++) {
      for (j = 0; j < G; j++) {
        P.push([((i / (G - 1)) - 0.5) * 4.2, 0, ((j / (G - 1)) - 0.5) * 4.2]);
        if (i < G - 1) E.push([i * G + j, (i + 1) * G + j]);
        if (j < G - 1) E.push([i * G + j, i * G + j + 1]);
      }
    }
  } else {
    // particles
    for (i = 0; i < 90; i++) {
      P.push([
        (Math.random() - 0.5) * 3.6,
        (Math.random() - 0.5) * 3.6,
        (Math.random() - 0.5) * 3.6,
      ]);
    }
  }

  return { P, E, kind };
}

export interface AnimationController {
  stop: () => void;
}

export function startScene(
  cv: HTMLCanvasElement,
  kind?: string
): AnimationController | null {
  const ctx = cv.getContext('2d');
  if (!ctx) return null;

  const actualKind = kind || cv.getAttribute('data-scene') || 'torus';
  const g = generateGeometry(actualKind);
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  let w = 300,
    h = 300,
    mx = 0,
    my = 0,
    sx = 0,
    sy = 0,
    t = 0,
    raf = 0,
    visible = true,
    last = 0;
  let c1 = '#6c8cff',
    c2 = '#22d3ee';

  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function size() {
    const r = cv.getBoundingClientRect();
    w = Math.max(40, r.width);
    h = Math.max(40, r.height);
    cv.width = w * dpr;
    cv.height = h * dpr;
    c1 = cssVar(cv, '--primary', '#6c8cff');
    c2 = cssVar(cv, '--accent', '#22d3ee');
  }

  function onMove(e: MouseEvent | PointerEvent) {
    mx = e.clientX / window.innerWidth - 0.5;
    my = e.clientY / window.innerHeight - 0.5;
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    if (!reduce) t += dt;
    sx += (mx - sx) * 0.06;
    sy += (my - sy) * 0.06;

    const ay = t * 0.45 + sx * 2;
    const ax = (actualKind === 'waves' ? -0.95 : t * 0.22) + sy * 1.4;
    const ca = Math.cos(ay),
      sa = Math.sin(ay),
      cb = Math.cos(ax),
      sb = Math.sin(ax);

    const P = g.P;
    const out: [number, number, number, number][] = new Array(P.length);
    const sc =
      Math.min(w, h) *
      (actualKind === 'waves' ? 0.27 : actualKind === 'particles' ? 0.3 : 0.3);

    for (let i = 0; i < P.length; i++) {
      const p = P[i];
      let x = p[0],
        y = p[1],
        z = p[2];
      if (actualKind === 'waves') {
        y =
          Math.sin(x * 1.6 + t * 1.6) * 0.28 +
          Math.cos(z * 1.6 + t * 1.2) * 0.28;
      }
      const x1 = x * ca + z * sa;
      const z1 = -x * sa + z * ca;
      const y1 = y * cb - z1 * sb;
      const z2 = y * sb + z1 * cb;
      const f = 3.6 / (3.6 + z2);
      out[i] = [w / 2 + x1 * sc * f, h / 2 + y1 * sc * f, z2, f];
    }

    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.clearRect(0, 0, w, h);
    ctx!.lineWidth = 1;
    ctx!.strokeStyle = c1;

    let E = g.E;
    if (actualKind === 'particles') {
      E = [];
      for (let a = 0; a < out.length; a++) {
        for (let b = a + 1; b < out.length; b++) {
          const dx = P[a][0] - P[b][0];
          const dy = P[a][1] - P[b][1];
          const dz = P[a][2] - P[b][2];
          if (dx * dx + dy * dy + dz * dz < 0.75) E.push([a, b]);
        }
      }
    }

    for (let i = 0; i < E.length; i++) {
      const A = out[E[i][0]];
      const B = out[E[i][1]];
      if (!A || !B) continue;
      ctx!.globalAlpha = Math.max(
        0.08,
        Math.min(0.65, 0.38 + (A[2] + B[2]) * -0.18)
      );
      ctx!.beginPath();
      ctx!.moveTo(A[0], A[1]);
      ctx!.lineTo(B[0], B[1]);
      ctx!.stroke();
    }

    ctx!.fillStyle = c2;
    for (let i = 0; i < out.length; i++) {
      const o = out[i];
      ctx!.globalAlpha = Math.max(0.25, Math.min(1, 0.6 - o[2] * 0.3));
      ctx!.beginPath();
      ctx!.arc(
        o[0],
        o[1],
        (actualKind === 'particles' ? 2.4 : 1.7) * o[3],
        0,
        TAU
      );
      ctx!.fill();
    }
    ctx!.globalAlpha = 1;
  }

  size();
  const ro =
    typeof window !== 'undefined' && window.ResizeObserver
      ? new ResizeObserver(size)
      : null;
  if (ro) ro.observe(cv);

  const io =
    typeof window !== 'undefined' && window.IntersectionObserver
      ? new IntersectionObserver(en => {
          visible = en[0].isIntersecting;
        })
      : null;
  if (io) io.observe(cv);

  window.addEventListener('pointermove', onMove, { passive: true });
  raf = requestAnimationFrame(frame);

  return {
    stop: () => {
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      if (io) io.disconnect();
      window.removeEventListener('pointermove', onMove);
    },
  };
}

export function startAvatar(
  cv: HTMLCanvasElement,
  customConfig?: Partial<AvatarConfig>
): AnimationController | null {
  const ctx = cv.getContext('2d');
  if (!ctx) return null;

  let cfg: AvatarConfig = { ...DEFAULT_AVATAR };
  try {
    const raw = cv.getAttribute('data-avatar');
    if (raw) cfg = { ...cfg, ...JSON.parse(raw) };
  } catch {
    // fallback
  }
  if (customConfig) cfg = { ...cfg, ...customConfig };

  const skin = cfg.skin || '#d9a07a';
  const hair = cfg.hair || '#3a2417';
  const outfit = cfg.outfit || '#6c8cff';
  const eyeC = cfg.eyes || '#3b2a1a';
  const style = cfg.hairStyle || 'short';
  const acc = cfg.acc || 'glasses';

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  let w = 300,
    h = 380,
    mx = 0,
    my = 0,
    sx = 0,
    sy = 0,
    t = 0,
    raf = 0,
    visible = true,
    last = 0,
    c1 = '#6c8cff';

  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function size() {
    const r = cv.getBoundingClientRect();
    w = Math.max(60, r.width);
    h = Math.max(60, r.height);
    cv.width = w * dpr;
    cv.height = h * dpr;
    c1 = cssVar(cv, '--primary', '#6c8cff');
  }

  function onMove(e: MouseEvent | PointerEvent) {
    const r = cv.getBoundingClientRect();
    mx = Math.max(
      -1,
      Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth * 0.42))
    );
    my = Math.max(
      -1,
      Math.min(1, (e.clientY - (r.top + r.height * 0.35)) / (window.innerHeight * 0.42))
    );
  }

  function ball(
    x: number,
    y: number,
    rx: number,
    ry: number,
    col: string,
    al: number = 1
  ) {
    const g = ctx!.createRadialGradient(
      x - rx * 0.35,
      y - ry * 0.4,
      Math.min(rx, ry) * 0.1,
      x,
      y,
      Math.max(rx, ry) * 1.05
    );
    g.addColorStop(0, shade(col, 0.3));
    g.addColorStop(0.6, col);
    g.addColorStop(1, shade(col, -0.38));
    ctx!.globalAlpha = al == null ? 1 : al;
    ctx!.fillStyle = g;
    ctx!.beginPath();
    ctx!.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, TAU);
    ctx!.fill();
    ctx!.globalAlpha = 1;
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    if (!reduce) t += dt;
    sx += (mx - sx) * 0.07;
    sy += (my - sy) * 0.07;

    const S = Math.min(w * 0.42, h * 0.33);
    const hx = w / 2;
    const hy = h * 0.38;
    const yaw = sx * 0.8 + Math.sin(t * 0.7) * 0.07;
    const pitch = sy * 0.3;

    function R(x: number, y: number, z: number, k: number = 1): [number, number, number] {
      const a = yaw * k,
        b = pitch * k;
      const ca = Math.cos(a),
        sa = Math.sin(a),
        cb = Math.cos(b),
        sb = Math.sin(b);
      const x1 = x * ca + z * sa;
      const z1 = -x * sa + z * ca;
      const y1 = y * cb - z1 * sb;
      const z2 = y * sb + z1 * cb;
      return [hx + x1 * S, hy - y1 * S, z2];
    }

    function E(p: [number, number, number], rx: number, ry: number, col: string, al: number = 1) {
      ball(p[0], p[1], rx * S * (0.86 + 0.14 * Math.cos(yaw)), ry * S, col, al);
    }

    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.clearRect(0, 0, w, h);

    // subtle background glow
    const gm = Math.min(w, h) * 0.49;
    for (let i = 6; i > 0; i--) {
      ctx!.globalAlpha = 0.05;
      ctx!.fillStyle = c1;
      ctx!.beginPath();
      ctx!.arc(w / 2, h * 0.46, (gm * i) / 6, 0, TAU);
      ctx!.fill();
    }
    ctx!.globalAlpha = 1;

    const br = 1 + Math.sin(t * 1.7) * 0.012;
    let p: [number, number, number];

    // back hair
    if (style === 'long') E(R(0, -0.3, -0.25), 0.84, 1.05, hair);
    if (style === 'short' || style === 'curly' || style === 'bun') {
      E(R(0, 0.06, -0.2), style === 'curly' ? 0.82 : 0.74, style === 'curly' ? 0.86 : 0.8, hair);
    }
    if (style === 'bun') E(R(0, 0.88, -0.15), 0.27, 0.27, hair);

    // body + neck
    E(R(0, -1.68, 0, 0.3), 1.18 * br, 0.86 * br, outfit);
    E(R(0, -0.82, 0, 0.6), 0.25, 0.3, shade(skin, -0.16));

    // head + ears
    E(R(0, 0, 0), 0.68, 0.76, skin);
    for (let sgn = -1; sgn <= 1; sgn += 2) {
      p = R(sgn * 0.69, -0.02, -0.02);
      if (p[2] > -0.3) E(p, 0.12, 0.17, shade(skin, -0.06));
    }

    // face & eyes
    const blink = t % 3.8 > 3.66 ? 0.1 : 1;
    for (let sgn = -1; sgn <= 1; sgn += 2) {
      p = R(sgn * 0.27, 0.1, 0.6);
      if (p[2] < 0) continue;
      ctx!.fillStyle = '#ffffff';
      ctx!.beginPath();
      ctx!.ellipse(p[0], p[1], 0.14 * S * (0.7 + 0.3 * p[2]), 0.1 * S * blink, 0, 0, TAU);
      ctx!.fill();

      ball(p[0] + sx * 0.05 * S, p[1] + sy * 0.035 * S, 0.065 * S, 0.065 * S * blink, eyeC);

      ctx!.fillStyle = 'rgba(255,255,255,0.9)';
      ctx!.beginPath();
      ctx!.arc(p[0] + sx * 0.05 * S - 0.02 * S, p[1] - 0.02 * S, 0.017 * S, 0, TAU);
      ctx!.fill();

      const q1 = R(sgn * 0.4, 0.3, 0.55);
      const q2 = R(sgn * 0.15, 0.33, 0.62);
      if (q2[2] > 0) {
        ctx!.strokeStyle = hair;
        ctx!.lineWidth = 0.04 * S;
        ctx!.lineCap = 'round';
        ctx!.beginPath();
        ctx!.moveTo(q1[0], q1[1]);
        ctx!.lineTo(q2[0], q2[1]);
        ctx!.stroke();
      }

      const ch = R(sgn * 0.43, -0.2, 0.5);
      if (ch[2] > 0) E(ch, 0.12, 0.075, '#ff7a8a', 0.2);
    }

    // nose
    p = R(0, -0.1, 0.69);
    if (p[2] > 0) ball(p[0], p[1], 0.07 * S, 0.055 * S, shade(skin, -0.1));

    // mouth
    const m1 = R(-0.2, -0.32, 0.58);
    const m2 = R(0.2, -0.32, 0.58);
    const m3 = R(0, -0.5 + Math.sin(t * 1.3) * 0.01, 0.62);
    if (m3[2] > 0) {
      ctx!.strokeStyle = '#8a3a3a';
      ctx!.lineWidth = 0.04 * S;
      ctx!.lineCap = 'round';
      ctx!.beginPath();
      ctx!.moveTo(m1[0], m1[1]);
      ctx!.quadraticCurveTo(m3[0], m3[1], m2[0], m2[1]);
      ctx!.stroke();
    }

    // front hair
    if (style !== 'none') {
      if (style === 'curly') {
        for (let i = 0; i < 9; i++) {
          const a = (i / 8) * Math.PI;
          E(R(Math.cos(a) * 0.64, 0.42 + Math.sin(a) * 0.36, 0.2), 0.2, 0.2, hair);
        }
      } else {
        E(R(0, 0.56, 0.14), 0.74, 0.36, hair);
        for (let sgn = -1; sgn <= 1; sgn += 2) {
          E(R(sgn * 0.64, 0.3, 0.06), 0.1, 0.3, hair);
        }
      }
    }

    // accessories
    if (acc === 'glasses') {
      ctx!.strokeStyle = '#1d1d1f';
      ctx!.lineWidth = 0.032 * S;
      for (let sgn = -1; sgn <= 1; sgn += 2) {
        p = R(sgn * 0.27, 0.1, 0.64);
        if (p[2] > 0) {
          ctx!.beginPath();
          ctx!.ellipse(p[0], p[1], 0.18 * S * (0.7 + 0.3 * p[2]), 0.15 * S, 0, 0, TAU);
          ctx!.stroke();
        }
      }
      const b1 = R(-0.1, 0.11, 0.68);
      const b2 = R(0.1, 0.11, 0.68);
      if (b1[2] > 0) {
        ctx!.beginPath();
        ctx!.moveTo(b1[0], b1[1]);
        ctx!.lineTo(b2[0], b2[1]);
        ctx!.stroke();
      }
    } else if (acc === 'headphones') {
      const l = R(-0.76, -0.02, 0);
      const r2 = R(0.76, -0.02, 0);
      const top = R(0, 1.5, 0);
      ctx!.strokeStyle = '#23262f';
      ctx!.lineWidth = 0.08 * S;
      ctx!.lineCap = 'round';
      ctx!.beginPath();
      ctx!.moveTo(l[0], l[1]);
      ctx!.quadraticCurveTo(top[0], top[1], r2[0], r2[1]);
      ctx!.stroke();
      E(l, 0.15, 0.23, '#2d313c');
      E(r2, 0.15, 0.23, '#2d313c');
    }
  }

  size();
  const ro =
    typeof window !== 'undefined' && window.ResizeObserver
      ? new ResizeObserver(size)
      : null;
  if (ro) ro.observe(cv);

  const io =
    typeof window !== 'undefined' && window.IntersectionObserver
      ? new IntersectionObserver(en => {
          visible = en[0].isIntersecting;
        })
      : null;
  if (io) io.observe(cv);

  window.addEventListener('pointermove', onMove, { passive: true });
  raf = requestAnimationFrame(frame);

  return {
    stop: () => {
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      if (io) io.disconnect();
      window.removeEventListener('pointermove', onMove);
    },
  };
}

export function initFx(
  root: HTMLElement | Document = document,
  options: { reveal?: boolean } = {}
): () => void {
  const stops: (() => void)[] = [];

  root.querySelectorAll<HTMLCanvasElement>('canvas[data-scene]').forEach(c => {
    const s = startScene(c);
    if (s) stops.push(s.stop);
  });

  root.querySelectorAll<HTMLCanvasElement>('canvas[data-avatar]').forEach(c => {
    const s = startAvatar(c);
    if (s) stops.push(s.stop);
  });

  if (!options.reveal) {
    return () => stops.forEach(s => s());
  }

  // Tilt effects
  root.querySelectorAll<HTMLElement>('[data-tilt] .card, [data-tilt] .imgbox').forEach(el => {
    function mv(e: PointerEvent) {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transition = 'transform 0.08s';
      el.style.transform = `perspective(800px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateZ(6px)`;
    }
    function lv() {
      el.style.transition = 'transform 0.4s';
      el.style.transform = '';
    }
    el.addEventListener('pointermove', mv as EventListener);
    el.addEventListener('pointerleave', lv);
    stops.push(() => {
      el.removeEventListener('pointermove', mv as EventListener);
      el.removeEventListener('pointerleave', lv);
      el.style.transform = '';
    });
  });

  // Spotlight effects
  root.querySelectorAll<HTMLElement>('[data-spot]').forEach(el => {
    function mv(e: PointerEvent) {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    }
    el.addEventListener('pointermove', mv as EventListener);
    stops.push(() => el.removeEventListener('pointermove', mv as EventListener));
  });

  return () => {
    stops.forEach(s => s());
  };
}

/**
 * Clean runtime string for inlined export to index.html
 */
export const SC_RUNTIME_INLINED_JS = `
(function () {
  var TAU = Math.PI * 2;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function cssVar(el, n, fb) { return (getComputedStyle(el).getPropertyValue(n) || '').trim() || fb; }

  function geo(kind) {
    var P = [], E = [], i, j;
    if (kind === 'torus') {
      var N = 30, M = 14;
      for (i = 0; i < N; i++) for (j = 0; j < M; j++) {
        var u = i / N * TAU, v = j / M * TAU, r = 1 + .42 * Math.cos(v);
        P.push([r * Math.cos(u), .42 * Math.sin(v), r * Math.sin(u)]);
        E.push([i * M + j, ((i + 1) % N) * M + j], [i * M + j, i * M + (j + 1) % M]);
      }
    } else if (kind === 'sphere') {
      var A = 11, B = 20;
      for (i = 1; i < A; i++) for (j = 0; j < B; j++) {
        var th = i / A * Math.PI, ph = j / B * TAU;
        P.push([1.25 * Math.sin(th) * Math.cos(ph), 1.25 * Math.cos(th), 1.25 * Math.sin(th) * Math.sin(ph)]);
        var k = (i - 1) * B + j;
        E.push([k, (i - 1) * B + (j + 1) % B]); if (i > 1) E.push([k, (i - 2) * B + j]);
      }
    } else if (kind === 'cube') {
      [1, .5].forEach(function (s, q) {
        for (i = 0; i < 8; i++) P.push([(i & 1 ? 1 : -1) * s, (i & 2 ? 1 : -1) * s, (i & 4 ? 1 : -1) * s]);
        var o = q * 8;
        for (i = 0; i < 8; i++) for (j = i + 1; j < 8; j++) { var d = i ^ j; if (d === 1 || d === 2 || d === 4) E.push([o + i, o + j]); }
      });
      for (i = 0; i < 8; i++) E.push([i, 8 + i]);
      P = P.map(function (p) { return [p[0] * 1.05, p[1] * 1.05, p[2] * 1.05]; });
    } else if (kind === 'waves') {
      var G = 26;
      for (i = 0; i < G; i++) for (j = 0; j < G; j++) {
        P.push([(i / (G - 1) - .5) * 4.2, 0, (j / (G - 1) - .5) * 4.2]);
        if (i < G - 1) E.push([i * G + j, (i + 1) * G + j]);
        if (j < G - 1) E.push([i * G + j, i * G + j + 1]);
      }
    } else {
      for (i = 0; i < 90; i++) P.push([(Math.random() - .5) * 3.6, (Math.random() - .5) * 3.6, (Math.random() - .5) * 3.6]);
    }
    return { P: P, E: E, kind: kind };
  }

  function startScene(cv, kind) {
    if (cv.__sc) return cv.__sc;
    kind = kind || cv.getAttribute('data-scene') || 'torus';
    var ctx = cv.getContext('2d'), g = geo(kind), dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = 300, h = 300, mx = 0, my = 0, sx = 0, sy = 0, t = 0, raf = 0, visible = true, last = 0;
    var c1, c2;
    function size() {
      var r = cv.getBoundingClientRect(); w = Math.max(40, r.width); h = Math.max(40, r.height);
      cv.width = w * dpr; cv.height = h * dpr; c1 = cssVar(cv, '--primary', '#6c8cff'); c2 = cssVar(cv, '--accent', '#22d3ee');
    }
    function onMove(e) { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }
    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      var dt = Math.min(.05, (now - last) / 1000 || .016); last = now; if (!reduce) t += dt;
      sx += (mx - sx) * .06; sy += (my - sy) * .06;
      var ay = t * .45 + sx * 2, ax = (kind === 'waves' ? -.95 : t * .22) + sy * 1.4;
      var ca = Math.cos(ay), sa = Math.sin(ay), cb = Math.cos(ax), sb = Math.sin(ax);
      var P = g.P, i, out = new Array(P.length), sc = Math.min(w, h) * (kind === 'waves' ? .27 : kind === 'particles' ? .3 : .3);
      for (i = 0; i < P.length; i++) {
        var p = P[i], x = p[0], y = p[1], z = p[2];
        if (kind === 'waves') y = Math.sin(x * 1.6 + t * 1.6) * .28 + Math.cos(z * 1.6 + t * 1.2) * .28;
        var x1 = x * ca + z * sa, z1 = -x * sa + z * ca, y1 = y * cb - z1 * sb, z2 = y * sb + z1 * cb;
        var f = 3.6 / (3.6 + z2);
        out[i] = [w / 2 + x1 * sc * f, h / 2 + y1 * sc * f, z2, f];
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1; ctx.strokeStyle = c1;
      var E = g.E, a, b;
      if (kind === 'particles') { E = []; for (a = 0; a < out.length; a++) for (b = a + 1; b < out.length; b++) { var dx = P[a][0] - P[b][0], dy = P[a][1] - P[b][1], dz = P[a][2] - P[b][2]; if (dx * dx + dy * dy + dz * dz < .75) E.push([a, b]); } }
      for (i = 0; i < E.length; i++) {
        var A = out[E[i][0]], B = out[E[i][1]];
        if (!A || !B) continue;
        ctx.globalAlpha = Math.max(.08, Math.min(.65, .38 + (A[2] + B[2]) * -.18));
        ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke();
      }
      ctx.fillStyle = c2;
      for (i = 0; i < out.length; i++) {
        var o = out[i]; ctx.globalAlpha = Math.max(.25, Math.min(1, .6 - o[2] * .3));
        ctx.beginPath(); ctx.arc(o[0], o[1], (kind === 'particles' ? 2.4 : 1.7) * o[3], 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    size();
    var ro = window.ResizeObserver ? new ResizeObserver(size) : null; if (ro) ro.observe(cv);
    var io = window.IntersectionObserver ? new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }) : null; if (io) io.observe(cv);
    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(frame);
    cv.__sc = {
      stop: function () { cancelAnimationFrame(raf); if (ro) ro.disconnect(); if (io) io.disconnect(); window.removeEventListener('pointermove', onMove); cv.__sc = null; }
    };
    return cv.__sc;
  }

  function shade(hex, a) {
    var h = String(hex).replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&');
    var n = [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16) || 0; });
    return 'rgb(' + n.map(function (v) { return Math.max(0, Math.min(255, Math.round(a < 0 ? v * (1 + a) : v + (255 - v) * a))); }).join(',') + ')';
  }

  function startAvatar(cv) {
    if (cv.__sc) return cv.__sc;
    var cfg = {}; try { cfg = JSON.parse(cv.getAttribute('data-avatar') || '{}'); } catch (e) {}
    var skin = cfg.skin || '#d9a07a', hair = cfg.hair || '#3a2417', outfit = cfg.outfit || '#6c8cff', eyeC = cfg.eyes || '#3b2a1a', style = cfg.hairStyle || 'short', acc = cfg.acc || 'glasses';
    var ctx = cv.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1), w = 300, h = 380, mx = 0, my = 0, sx = 0, sy = 0, t = 0, raf = 0, visible = true, last = 0, c1;
    function size() { var r = cv.getBoundingClientRect(); w = Math.max(60, r.width); h = Math.max(60, r.height); cv.width = w * dpr; cv.height = h * dpr; c1 = cssVar(cv, '--primary', '#6c8cff'); }
    function onMove(e) { var r = cv.getBoundingClientRect(); mx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (innerWidth * .42))); my = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height * .35)) / (innerHeight * .42))); }
    function ball(x, y, rx, ry, col, al) {
      var g = ctx.createRadialGradient(x - rx * .35, y - ry * .4, Math.min(rx, ry) * .1, x, y, Math.max(rx, ry) * 1.05);
      g.addColorStop(0, shade(col, .3)); g.addColorStop(.6, col); g.addColorStop(1, shade(col, -.38));
      ctx.globalAlpha = al == null ? 1 : al; ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, Math.max(.5, rx), Math.max(.5, ry), 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    }
    function frame(now) {
      raf = requestAnimationFrame(frame); if (!visible) return;
      var dt = Math.min(.05, (now - last) / 1000 || .016); last = now; if (!reduce) t += dt;
      sx += (mx - sx) * .07; sy += (my - sy) * .07;
      var S = Math.min(w * .42, h * .33), hx = w / 2, hy = h * .38, yaw = sx * .8 + Math.sin(t * .7) * .07, pitch = sy * .3;
      function R(x, y, z, k) { k = k || 1; var a = yaw * k, b = pitch * k, ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b); var x1 = x * ca + z * sa, z1 = -x * sa + z * ca, y1 = y * cb - z1 * sb, z2 = y * sb + z1 * cb; return [hx + x1 * S, hy - y1 * S, z2]; }
      function E(p, rx, ry, col, al) { ball(p[0], p[1], rx * S * (.86 + .14 * Math.cos(yaw)), ry * S, col, al); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      var gm = Math.min(w, h) * .49; for (var i = 6; i > 0; i--) { ctx.globalAlpha = .05; ctx.fillStyle = c1; ctx.beginPath(); ctx.arc(w / 2, h * .46, gm * i / 6, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1;
      var br = 1 + Math.sin(t * 1.7) * .012, p, sgn;
      if (style === 'long') E(R(0, -.3, -.25), .84, 1.05, hair);
      if (style === 'short' || style === 'curly' || style === 'bun') E(R(0, .06, -.2), style === 'curly' ? .82 : .74, style === 'curly' ? .86 : .8, hair);
      if (style === 'bun') E(R(0, .88, -.15), .27, .27, hair);
      E(R(0, -1.68, 0, .3), 1.18 * br, .86 * br, outfit);
      E(R(0, -.82, 0, .6), .25, .3, shade(skin, -.16));
      E(R(0, 0, 0), .68, .76, skin);
      for (sgn = -1; sgn <= 1; sgn += 2) { p = R(sgn * .69, -.02, -.02); if (p[2] > -.3) E(p, .12, .17, shade(skin, -.06)); }
      var blink = (t % 3.8) > 3.66 ? .1 : 1;
      for (sgn = -1; sgn <= 1; sgn += 2) {
        p = R(sgn * .27, .1, .6); if (p[2] < 0) continue;
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(p[0], p[1], .14 * S * (.7 + .3 * p[2]), .1 * S * blink, 0, 0, TAU); ctx.fill();
        ball(p[0] + sx * .05 * S, p[1] + sy * .035 * S, .065 * S, .065 * S * blink, eyeC);
        ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.arc(p[0] + sx * .05 * S - .02 * S, p[1] - .02 * S, .017 * S, 0, TAU); ctx.fill();
        var q1 = R(sgn * .4, .3, .55), q2 = R(sgn * .15, .33, .62);
        if (q2[2] > 0) { ctx.strokeStyle = hair; ctx.lineWidth = .04 * S; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(q1[0], q1[1]); ctx.lineTo(q2[0], q2[1]); ctx.stroke(); }
        var ch = R(sgn * .43, -.2, .5); if (ch[2] > 0) E(ch, .12, .075, '#ff7a8a', .2);
      }
      p = R(0, -.1, .69); if (p[2] > 0) ball(p[0], p[1], .07 * S, .055 * S, shade(skin, -.1));
      var m1 = R(-.2, -.32, .58), m2 = R(.2, -.32, .58), m3 = R(0, -.5 + Math.sin(t * 1.3) * .01, .62);
      if (m3[2] > 0) { ctx.strokeStyle = '#8a3a3a'; ctx.lineWidth = .04 * S; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(m1[0], m1[1]); ctx.quadraticCurveTo(m3[0], m3[1], m2[0], m2[1]); ctx.stroke(); }
      if (style !== 'none') {
        if (style === 'curly') { for (i = 0; i < 9; i++) { var a = i / 8 * Math.PI; E(R(Math.cos(a) * .64, .42 + Math.sin(a) * .36, .2), .2, .2, hair); } }
        else { E(R(0, .56, .14), .74, .36, hair); for (sgn = -1; sgn <= 1; sgn += 2) E(R(sgn * .64, .3, .06), .1, .3, hair); }
      }
      if (acc === 'glasses') {
        ctx.strokeStyle = '#1d1d1f'; ctx.lineWidth = .032 * S;
        for (sgn = -1; sgn <= 1; sgn += 2) { p = R(sgn * .27, .1, .64); if (p[2] > 0) { ctx.beginPath(); ctx.ellipse(p[0], p[1], .18 * S * (.7 + .3 * p[2]), .15 * S, 0, 0, TAU); ctx.stroke(); } }
        var b1 = R(-.1, .11, .68), b2 = R(.1, .11, .68); if (b1[2] > 0) { ctx.beginPath(); ctx.moveTo(b1[0], b1[1]); ctx.lineTo(b2[0], b2[1]); ctx.stroke(); }
      } else if (acc === 'headphones') {
        var l = R(-.76, -.02, 0), r2 = R(.76, -.02, 0), top = R(0, 1.5, 0);
        ctx.strokeStyle = '#23262f'; ctx.lineWidth = .08 * S; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(l[0], l[1]); ctx.quadraticCurveTo(top[0], top[1], r2[0], r2[1]); ctx.stroke();
        E(l, .15, .23, '#2d313c'); E(r2, .15, .23, '#2d313c');
      }
    }
    size();
    var ro = window.ResizeObserver ? new ResizeObserver(size) : null; if (ro) ro.observe(cv);
    var io = window.IntersectionObserver ? new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }) : null; if (io) io.observe(cv);
    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(frame);
    cv.__sc = { stop: function () { cancelAnimationFrame(raf); if (ro) ro.disconnect(); if (io) io.disconnect(); window.removeEventListener('pointermove', onMove); cv.__sc = null; } };
    return cv.__sc;
  }

  function initFx(root, o) {
    o = o || {}; root = root || document;
    var stops = [];
    root.querySelectorAll('canvas[data-scene]').forEach(function (c) { var s = startScene(c); if (s) stops.push(s.stop); });
    root.querySelectorAll('canvas[data-avatar]').forEach(function (c) { var s = startAvatar(c); if (s) stops.push(s.stop); });
    if (!o.reveal) return function () { stops.forEach(function (s) { s(); }); };

    root.querySelectorAll('[data-anim] .content > .wrap > *').forEach(function (el) {
      var idx = Array.prototype.indexOf.call(el.parentNode.children, el); el.style.setProperty('--i', idx);
    });
    var targets = root.querySelectorAll('[data-anim], .fl[data-fa]');
    var io = window.IntersectionObserver ? new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in'); io.unobserve(e.target);
      });
    }, { threshold: .15 }) : null;
    targets.forEach(function (t) { if (io && !reduce) io.observe(t); else t.classList.add('in'); });
    stops.push(function () { if (io) io.disconnect(); });

    root.querySelectorAll('[data-tilt] .card, [data-tilt] .imgbox').forEach(function (el) {
      function mv(e) { var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; el.style.transition = 'transform .08s'; el.style.transform = 'perspective(800px) rotateY(' + x * 14 + 'deg) rotateX(' + -y * 14 + 'deg) translateZ(6px)'; }
      function lv() { el.style.transition = 'transform .4s'; el.style.transform = ''; }
      el.addEventListener('pointermove', mv); el.addEventListener('pointerleave', lv);
      stops.push(function () { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerleave', lv); el.style.transform = ''; });
    });
    root.querySelectorAll('[data-spot]').forEach(function (el) {
      function mv(e) { var r = el.getBoundingClientRect(); el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px'); }
      el.addEventListener('pointermove', mv); stops.push(function () { el.removeEventListener('pointermove', mv); });
    });
    return function () { stops.forEach(function (s) { s(); }); };
  }

  window.SC = { startScene: startScene, startAvatar: startAvatar, initFx: initFx };
  document.addEventListener('DOMContentLoaded', function () { initFx(document, { reveal: true }); });
  if (document.readyState === 'complete' || document.readyState === 'interactive') { initFx(document, { reveal: true }); }
})();
`;
