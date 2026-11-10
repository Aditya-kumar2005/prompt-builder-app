/**
 * Default templates, palettes, and section schemas for SiteCraft Website Builder
 */
import {
  Palette,
  SiteProject,
  SiteSection,
  SiteTheme,
  TemplatePreset,
  SectionType,
  CanvasStudioConfig,
} from './builderTypes';
import { DEFAULT_AVATAR } from './scFxRuntime';

export const PALETTES: Palette[] = [
  {
    id: 'midnight',
    name: 'Midnight',
    bg: '#0b1020',
    surface: '#121a2f',
    text: '#eef2ff',
    muted: '#9aa6c7',
    primary: '#6c8cff',
    accent: '#22d3ee',
    border: '#243050',
  },
  {
    id: 'paper',
    name: 'Paper',
    bg: '#fbfaf7',
    surface: '#f1eee7',
    text: '#1c1b19',
    muted: '#6b665c',
    primary: '#d9480f',
    accent: '#1c1b19',
    border: '#e2ddd0',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    bg: '#f5fbff',
    surface: '#e4f2fb',
    text: '#0b2540',
    muted: '#4f6a85',
    primary: '#0077cc',
    accent: '#00b3a4',
    border: '#cfe3f2',
  },
  {
    id: 'forest',
    name: 'Forest',
    bg: '#0e1a14',
    surface: '#15271e',
    text: '#e9f5ee',
    muted: '#8fb09c',
    primary: '#4ade80',
    accent: '#facc15',
    border: '#23402f',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    bg: '#1a0f14',
    surface: '#271721',
    text: '#fff1ec',
    muted: '#c9a3a3',
    primary: '#ff6b4a',
    accent: '#ffb84a',
    border: '#40242f',
  },
  {
    id: 'rose',
    name: 'Rose',
    bg: '#fff7f8',
    surface: '#ffe9ee',
    text: '#2a1218',
    muted: '#8a5560',
    primary: '#e11d62',
    accent: '#7c3aed',
    border: '#f6cfd8',
  },
  {
    id: 'violet',
    name: 'Violet',
    bg: '#0f0b1e',
    surface: '#1a1433',
    text: '#f3efff',
    muted: '#a99bd4',
    primary: '#a78bfa',
    accent: '#f472b6',
    border: '#31285a',
  },
  {
    id: 'mono',
    name: 'Mono',
    bg: '#ffffff',
    surface: '#f4f4f5',
    text: '#09090b',
    muted: '#71717a',
    primary: '#09090b',
    accent: '#52525b',
    border: '#e4e4e7',
  },
  {
    id: 'sand',
    name: 'Sand',
    bg: '#fdf8ee',
    surface: '#f6ecd6',
    text: '#2b2112',
    muted: '#7d6b4a',
    primary: '#e8590c',
    accent: '#2b8a3e',
    border: '#eadcb8',
  },
];

export const GOOGLE_FONTS = [
  'Inter',
  'Poppins',
  'Space Grotesk',
  'DM Sans',
  'Manrope',
  'Sora',
  'Outfit',
  'Syne',
  'Playfair Display',
  'Lora',
  'Merriweather',
  'JetBrains Mono',
];

export const DENSITY_SPACING = {
  compact: 44,
  cozy: 76,
  airy: 116,
};

export function getPalette(id: string): Palette {
  return PALETTES.find(p => p.id === id) || PALETTES[0];
}

export function getContrastOnColor(hexColor: string): string {
  const e = hexColor.replace('#', '');
  const [l, n, a] = [0, 2, 4].map(i => parseInt(e.slice(i, i + 2), 16) || 0);
  return (l * 299 + n * 587 + a * 114) / 1000 > 150 ? '#0b0b0b' : '#ffffff';
}

export function computeThemeVars(theme: SiteTheme): Record<string, string> {
  const pal = theme.palette;
  return {
    '--bg': pal.bg,
    '--surface': pal.surface,
    '--text': pal.text,
    '--muted': pal.muted,
    '--primary': pal.primary,
    '--accent': pal.accent,
    '--border': pal.border,
    '--on-primary': getContrastOnColor(pal.primary),
    '--font-h': `'${theme.fontH}', system-ui, sans-serif`,
    '--font-b': `'${theme.fontB}', system-ui, sans-serif`,
    '--radius': `${theme.radius}px`,
    '--sp': `${DENSITY_SPACING[theme.density] || 76}px`,
  };
}

export const COPY_DATABASE: Record<string, any> = {
  webdev: {
    role: 'Frontend Web Developer',
    hero: {
      eyebrow: "Hi, I'm {first} 👋",
      title: 'I build fast, accessible websites people love.',
      subtitle:
        'Frontend developer crafting pixel-perfect interfaces with HTML, CSS, JavaScript and React.',
      cta: 'See my work',
      cta2: 'Get in touch',
    },
    about: {
      title: 'About me',
      text: 'I turn designs into responsive, performant experiences. I care about semantics, accessibility and the small details that make a product feel polished.',
      stats: [
        { value: '5+', label: 'Years experience' },
        { value: '60+', label: 'Sites shipped' },
        { value: '100', label: 'Lighthouse score' },
      ],
    },
    skills: [
      'HTML5',
      'CSS3 / Sass',
      'JavaScript',
      'TypeScript',
      'React',
      'Next.js',
      'Tailwind',
      'Accessibility',
      'Figma',
      'Vite',
    ],
    services: [
      ['🖥️', 'Landing pages', 'Conversion-focused, lightning-fast marketing pages.'],
      ['⚛️', 'React apps', 'Component-driven single page applications.'],
      ['♿', 'Accessibility audits', 'WCAG reviews and fixes for existing sites.'],
    ],
    projects: [
      [
        'Shopfront',
        'A headless e-commerce storefront with instant search.',
        'React, Next.js, Stripe',
      ],
      [
        'Pixel Dash',
        'Real-time analytics dashboard with live charts.',
        'TypeScript, D3, WebSockets',
      ],
      [
        'Bloom Blog',
        'Static blog with MDX and a custom design system.',
        'Astro, MDX, CSS',
      ],
    ],
    exp: [
      [
        '2023 — Now',
        'Senior Frontend Engineer',
        'Nimbus Labs',
        'Lead the design system and web performance work.',
      ],
      [
        '2020 — 2023',
        'Frontend Developer',
        'Studio North',
        'Built 30+ client websites and web apps.',
      ],
    ],
    reviews: [
      [
        'Delivered ahead of schedule and the site is blazing fast. Our bounce rate dropped 30%.',
        'Priya Nair',
        'Founder, Bloom',
      ],
      [
        'Great communicator with an eye for detail. Would hire again.',
        'Tom Becker',
        'PM, Nimbus',
      ],
    ],
  },
  uiux: {
    role: 'UI/UX Designer',
    hero: {
      eyebrow: 'Product designer',
      title: 'Designing calm, human-centred digital products.',
      subtitle:
        "I'm {name}, a UI/UX designer helping teams turn messy problems into simple, delightful experiences.",
      cta: 'View case studies',
      cta2: "Let's talk",
    },
    about: {
      title: 'My design philosophy',
      text: 'Great design is invisible. I combine research, systems thinking and visual craft to ship products people actually enjoy using.',
      stats: [
        { value: '7', label: 'Years designing' },
        { value: '40+', label: 'Products launched' },
        { value: '12', label: 'Design awards' },
      ],
    },
    skills: [
      'User research',
      'Wireframing',
      'Prototyping',
      'Design systems',
      'Figma',
      'Interaction design',
      'Usability testing',
      'Branding',
      'Accessibility',
    ],
    services: [
      ['🔍', 'UX research', 'Interviews, surveys and usability testing that reveal real needs.'],
      ['🎨', 'UI design', 'Beautiful, consistent interfaces for web and mobile.'],
      ['🧩', 'Design systems', 'Scalable component libraries and design tokens.'],
    ],
    projects: [
      [
        'Fintly Mobile',
        'Redesigned onboarding that lifted activation by 42%.',
        'Research, Mobile, Figma',
      ],
      [
        'Wander',
        'Travel planning app with collaborative itineraries.',
        'UX, Prototyping',
      ],
      [
        'Atlas DS',
        'A multi-brand design system used by 9 product teams.',
        'Design system, Tokens',
      ],
    ],
    exp: [
      [
        '2022 — Now',
        'Lead Product Designer',
        'Fintly',
        'Own design for the consumer app across 3 squads.',
      ],
      [
        '2018 — 2022',
        'UI/UX Designer',
        'Pixel & Co',
        'Delivered brand and product work for 25+ clients.',
      ],
    ],
    reviews: [
      [
        '{first} brought clarity to a chaotic product. The new flow tested incredibly well.',
        'Mara Singh',
        'CPO, Fintly',
      ],
      ['The most thoughtful designer I have worked with.', 'Luis Ortega', 'Eng Manager'],
    ],
  },
  fullstack: {
    role: 'Full-Stack Developer',
    hero: {
      eyebrow: 'Full-stack developer',
      title: 'From database to pixel — I ship complete products.',
      subtitle:
        'I design APIs, build UIs and deploy to the cloud. React, Node, PostgreSQL and everything in between.',
      cta: 'Explore projects',
      cta2: 'Hire me',
    },
    about: {
      title: 'Who I am',
      text: "I'm a full-stack engineer who enjoys owning features end to end — from schema design and REST/GraphQL APIs to polished React front-ends and CI/CD.",
      stats: [
        { value: '6', label: 'Years building' },
        { value: '25+', label: 'Products shipped' },
        { value: '99.9%', label: 'Uptime' },
      ],
    },
    skills: [
      ['React', 92],
      ['Node.js', 90],
      ['TypeScript', 88],
      ['PostgreSQL', 82],
      ['Docker / AWS', 76],
      ['GraphQL', 74],
    ],
    services: [
      ['⚙️', 'API development', 'Secure, documented REST and GraphQL backends.'],
      ['🌐', 'Web applications', 'End-to-end SaaS products built to scale.'],
      ['☁️', 'Cloud & DevOps', 'CI/CD pipelines, containers and monitoring.'],
    ],
    projects: [
      [
        'Taskly SaaS',
        'Multi-tenant project management platform with real-time updates.',
        'React, Node, Postgres',
      ],
      [
        'PayBridge API',
        'Payments orchestration API processing 1M+ requests a day.',
        'Node, Redis, AWS',
      ],
      [
        'DevPulse',
        'Developer analytics dashboard with GitHub integration.',
        'Next.js, GraphQL',
      ],
    ],
    exp: [
      [
        '2022 — Now',
        'Senior Full-Stack Engineer',
        'Cloudwave',
        'Architect and maintain the core SaaS platform.',
      ],
      [
        '2019 — 2022',
        'Software Engineer',
        'Kite Systems',
        'Built APIs and dashboards for enterprise clients.',
      ],
    ],
    reviews: [
      [
        '{first} owned the project from idea to production. Rock-solid engineering.',
        'Dana Kim',
        'CTO, Cloudwave',
      ],
      ['Fast, reliable and a great teammate.', 'Alex Ruiz', 'Tech Lead'],
    ],
  },
  java: {
    role: 'Java Backend Developer',
    hero: {
      eyebrow: 'Java • Spring Boot • Microservices',
      title: 'Building reliable, scalable backend systems in Java.',
      subtitle:
        "I'm {name}, a Java developer designing high-throughput services, clean APIs and resilient architectures.",
      cta: 'View projects',
      cta2: 'Contact me',
    },
    about: {
      title: 'About',
      text: 'I specialise in enterprise-grade Java: Spring Boot microservices, event-driven systems with Kafka and well-tested, maintainable code.',
      stats: [
        { value: '8', label: 'Years in Java' },
        { value: '30+', label: 'Microservices' },
        { value: '5M', label: 'Requests / day' },
      ],
    },
    skills: [
      ['Java 21', 95],
      ['Spring Boot', 92],
      ['Microservices', 88],
      ['Kafka', 80],
      ['SQL / JPA', 86],
      ['Docker / K8s', 78],
    ],
    services: [
      ['☕', 'Spring Boot services', 'Production-ready REST APIs and microservices.'],
      ['🔁', 'Event-driven systems', 'Kafka and messaging architectures that scale.'],
      ['🧪', 'Legacy modernisation', 'Migrate monoliths to clean, tested services.'],
    ],
    projects: [
      [
        'OrderFlow',
        'Event-driven order management platform on Kafka.',
        'Java, Spring, Kafka',
      ],
      [
        'AuthGate',
        'OAuth2 / OIDC gateway protecting 40 internal services.',
        'Spring Security, Redis',
      ],
      ['LedgerCore', 'Double-entry ledger engine with audit trails.', 'Java, PostgreSQL'],
    ],
    exp: [
      [
        '2021 — Now',
        'Senior Java Engineer',
        'FinEdge Bank',
        'Lead a team of 6 on payment microservices.',
      ],
      [
        '2017 — 2021',
        'Java Developer',
        'Infosys Labs',
        'Delivered enterprise Spring applications.',
      ],
    ],
    reviews: [
      [
        "Exceptional engineer — our latency dropped by 60% after {first}'s refactor.",
        'Rahul Mehta',
        'VP Engineering',
      ],
      ['Writes clean, well-tested code and mentors the whole team.', 'Sarah Lin', 'Architect'],
    ],
  },
};

export const SECTION_META: Record<
  SectionType,
  {
    label: string;
    icon: string;
    variants: string[];
    fields: string[];
    list?: string;
    lf?: string[];
    github?: boolean;
  }
> = {
  nav: {
    label: 'Header / Nav',
    icon: '🧭',
    variants: ['bar', 'center'],
    fields: ['brand', 'cta'],
    list: 'links',
    lf: ['label', 'href'],
  },
  hero: {
    label: 'Front page / Hero',
    icon: '🚀',
    variants: ['split', 'center', 'bold', 'avatar'],
    fields: ['eyebrow', 'title', 'subtitle', 'cta', 'cta2', 'image'],
  },
  about: {
    label: 'About me',
    icon: '👤',
    variants: ['side', 'stats'],
    fields: ['title', 'text', 'image'],
    list: 'stats',
    lf: ['value', 'label'],
  },
  skills: {
    label: 'Skills',
    icon: '🛠️',
    variants: ['chips', 'bars'],
    fields: ['title', 'subtitle'],
    list: 'items',
    lf: ['name', 'level'],
  },
  services: {
    label: 'Services',
    icon: '💼',
    variants: ['cards', 'list', 'centered'],
    fields: ['title', 'subtitle'],
    list: 'items',
    lf: ['icon', 'title', 'text'],
  },
  projects: {
    label: 'Projects',
    icon: '📁',
    variants: ['grid', 'featured', 'list'],
    fields: ['title', 'subtitle'],
    list: 'items',
    lf: ['img', 'title', 'text', 'tags', 'link'],
  },
  repos: {
    label: 'GitHub repos',
    icon: '🐙',
    variants: ['cards', 'list'],
    fields: ['title', 'subtitle', 'username', 'count'],
    github: true,
  },
  testimonials: {
    label: 'Testimonials',
    icon: '💬',
    variants: ['cards', 'big'],
    fields: ['title', 'subtitle'],
    list: 'items',
    lf: ['quote', 'name', 'role'],
  },
  experience: {
    label: 'Experience',
    icon: '📈',
    variants: ['timeline', 'cards'],
    fields: ['title', 'subtitle'],
    list: 'items',
    lf: ['period', 'role', 'org', 'text'],
  },
  contact: {
    label: 'Contact',
    icon: '✉️',
    variants: ['center', 'split'],
    fields: ['title', 'text', 'email', 'cta'],
    list: 'links',
    lf: ['label', 'href'],
  },
  video: {
    label: 'Video',
    icon: '🎬',
    variants: ['wide', 'split'],
    fields: ['title', 'subtitle', 'url', 'caption'],
  },
  canvas: {
    label: 'Free canvas',
    icon: '🧩',
    variants: ['blank'],
    fields: ['height'],
  },
  footer: {
    label: 'Footer',
    icon: '🔻',
    variants: ['simple', 'center'],
    fields: ['text'],
  },
};

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: 'webdev',
    name: 'Web Developer',
    emoji: '🌐',
    tag: 'Frontend portfolio',
    copy: 'webdev',
    theme: {
      palette: getPalette('midnight'),
      fontH: 'Space Grotesk',
      fontB: 'Inter',
      radius: 14,
      density: 'cozy',
    },
    layout: [
      ['nav', 'bar'],
      ['hero', 'split'],
      ['about', 'side', { bg: 'surface' }],
      ['skills', 'chips'],
      ['projects', 'grid', { bg: 'surface' }],
      ['services', 'cards'],
      ['testimonials', 'cards', { bg: 'surface' }],
      ['contact', 'center'],
      ['footer', 'simple'],
    ],
  },
  {
    id: 'uiux',
    name: 'UI/UX Designer',
    emoji: '🎨',
    tag: 'Case-study portfolio',
    copy: 'uiux',
    theme: {
      palette: getPalette('paper'),
      fontH: 'Playfair Display',
      fontB: 'DM Sans',
      radius: 6,
      density: 'airy',
    },
    layout: [
      ['nav', 'center'],
      ['hero', 'center'],
      ['projects', 'featured'],
      ['services', 'centered', { bg: 'surface' }],
      ['about', 'stats'],
      ['skills', 'chips', { bg: 'surface' }],
      ['testimonials', 'big'],
      ['contact', 'split', { bg: 'accent' }],
      ['footer', 'center'],
    ],
  },
  {
    id: 'fullstack',
    name: 'Full-Stack Developer',
    emoji: '🧩',
    tag: 'Product engineer',
    copy: 'fullstack',
    theme: {
      palette: getPalette('violet'),
      fontH: 'Sora',
      fontB: 'Inter',
      radius: 18,
      density: 'cozy',
    },
    layout: [
      ['nav', 'bar'],
      ['hero', 'bold'],
      ['skills', 'bars', { bg: 'surface' }],
      ['projects', 'featured'],
      ['repos', 'cards', { bg: 'surface' }],
      ['experience', 'timeline'],
      ['services', 'list', { bg: 'surface' }],
      ['contact', 'split'],
      ['footer', 'simple'],
    ],
  },
  {
    id: 'java',
    name: 'Java Developer',
    emoji: '☕',
    tag: 'Backend engineer',
    copy: 'java',
    theme: {
      palette: getPalette('sand'),
      fontH: 'JetBrains Mono',
      fontB: 'Manrope',
      radius: 4,
      density: 'cozy',
    },
    layout: [
      ['nav', 'bar'],
      ['hero', 'split'],
      ['about', 'stats', { bg: 'surface' }],
      ['skills', 'bars'],
      ['experience', 'timeline', { bg: 'surface' }],
      ['projects', 'list'],
      ['repos', 'list', { bg: 'surface' }],
      ['contact', 'center', { bg: 'accent' }],
      ['footer', 'simple'],
    ],
  },
  {
    id: 'avatar',
    name: '3D Avatar Portfolio',
    emoji: '🧑‍🎤',
    tag: 'Cursor-facing 3D avatar hero',
    copy: 'fullstack',
    theme: {
      palette: getPalette('midnight'),
      fontH: 'Sora',
      fontB: 'Inter',
      radius: 18,
      density: 'cozy',
    },
    layout: [
      ['nav', 'bar'],
      [
        'hero',
        'avatar',
        undefined,
        {
          media: {
            type: 'avatar',
            avatar: DEFAULT_AVATAR,
            pos: 'right',
            size: 46,
            backdrop: 'scene',
            scene: 'particles',
            overlay: 0,
          },
          fx: { spot: true },
          anim: 'fade-up',
        },
      ],
      ['about', 'stats', { bg: 'surface' }, { anim: 'fade-up' }],
      ['skills', 'chips', undefined, { anim: 'fade-up' }],
      ['projects', 'grid', { bg: 'surface' }, { anim: 'fade-up', fx: { tilt: true } }],
      ['testimonials', 'cards', undefined, { anim: 'fade-up' }],
      ['contact', 'center', { bg: 'surface' }],
      ['footer', 'simple'],
    ],
  },
  {
    id: 'custom',
    name: 'Blank Canvas / Starter',
    emoji: '✨',
    tag: 'Clean starter',
    copy: 'webdev',
    theme: {
      palette: getPalette('ocean'),
      fontH: 'Outfit',
      fontB: 'Inter',
      radius: 12,
      density: 'cozy',
    },
    layout: [
      ['nav', 'bar'],
      ['hero', 'center'],
      ['about', 'side'],
      ['contact', 'center'],
      ['footer', 'center'],
    ],
  },
];

export function createInitialSection(
  type: SectionType,
  variant?: string,
  styleOverride?: { bg?: 'default' | 'surface' | 'accent'; pad?: 'sm' | 'md' | 'lg' },
  copyData?: any,
  profile?: { name: string; first?: string },
  extra?: { media?: any; fx?: any; anim?: any }
): SiteSection {
  const meta = SECTION_META[type];
  const actualVariant = variant || meta.variants[0];
  const copy = copyData || COPY_DATABASE.webdev;
  const name = profile?.name || 'Alex Morgan';
  const first = profile?.first || name.split(' ')[0] || 'Alex';

  const replacePlaceholders = (val: string) =>
    val.replace(/\{name\}/g, name).replace(/\{first\}/g, first);

  let data: Record<string, any> = {};

  if (type === 'nav') {
    data = {
      brand: name,
      cta: 'Get in Touch',
      links: [
        { label: 'About', href: '#about' },
        { label: 'Skills', href: '#skills' },
        { label: 'Projects', href: '#projects' },
        { label: 'Contact', href: '#contact' },
      ],
    };
  } else if (type === 'hero') {
    data = {
      eyebrow: replacePlaceholders(copy.hero.eyebrow),
      title: replacePlaceholders(copy.hero.title),
      subtitle: replacePlaceholders(copy.hero.subtitle),
      cta: copy.hero.cta,
      cta2: copy.hero.cta2,
      image: '',
    };
  } else if (type === 'about') {
    data = {
      title: copy.about.title,
      text: copy.about.text,
      stats: copy.about.stats.map((s: any) => ({ ...s })),
      image: '',
    };
  } else if (type === 'skills') {
    data = {
      title: 'Skills & Tooling',
      subtitle: 'Technologies and frameworks I build with on a daily basis.',
      items: Array.isArray(copy.skills[0])
        ? copy.skills.map(([n, l]: [string, number]) => ({ name: n, level: l }))
        : copy.skills.map((s: string) => ({ name: s, level: 85 })),
    };
  } else if (type === 'services') {
    data = {
      title: 'What I Do',
      subtitle: 'High-impact development and consulting services tailored to your team.',
      items: copy.services.map(([icon, t, desc]: [string, string, string]) => ({
        icon,
        title: t,
        text: desc,
      })),
    };
  } else if (type === 'projects') {
    data = {
      title: 'Featured Projects',
      subtitle: 'A selection of production apps, systems and experiments I have shipped.',
      items: copy.projects.map(([t, desc, tags]: [string, string, string]) => ({
        img: '',
        title: t,
        text: desc,
        tags,
        link: 'https://github.com',
      })),
    };
  } else if (type === 'repos') {
    data = {
      title: 'Open Source',
      subtitle: 'Public repositories, libraries, and contributions.',
      username: 'torvalds',
      count: 4,
      items: [
        {
          name: 'linux',
          description: 'Linux kernel source tree',
          stars: 175000,
          language: 'C',
          url: 'https://github.com/torvalds/linux',
        },
        {
          name: 'subsurface-for-dir',
          description: 'Subsurface divelog program',
          stars: 2400,
          language: 'C++',
          url: 'https://github.com/torvalds/subsurface-for-dir',
        },
      ],
    };
  } else if (type === 'testimonials') {
    data = {
      title: 'Kind Words',
      subtitle: 'Feedback from colleagues, founders, and engineering managers.',
      items: copy.reviews.map(([q, n, r]: [string, string, string]) => ({
        quote: replacePlaceholders(q),
        name: n,
        role: r,
      })),
    };
  } else if (type === 'experience') {
    data = {
      title: 'Work Experience',
      subtitle: 'A timeline of roles, companies and engineering leadership.',
      items: copy.exp.map(([p, r, o, txt]: [string, string, string, string]) => ({
        period: p,
        role: r,
        org: o,
        text: txt,
      })),
    };
  } else if (type === 'contact') {
    data = {
      title: "Let's Build Something Great Together",
      text: "Have an open role, need a product built, or want to discuss architecture? Drop me a line.",
      email: 'alex@example.com',
      cta: 'Send Message',
      links: [
        { label: 'GitHub', href: 'https://github.com' },
        { label: 'LinkedIn', href: 'https://linkedin.com' },
        { label: 'Twitter', href: 'https://twitter.com' },
      ],
    };
  } else if (type === 'video') {
    data = {
      title: 'Project Reel',
      subtitle: 'Watch a 2-minute walkthrough of recent UI interactions and architecture.',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      caption: 'Full demo walkthrough with live code annotations.',
    };
  } else if (type === 'canvas') {
    data = {
      height: 480,
    };
  } else if (type === 'footer') {
    data = {
      text: `© ${new Date().getFullYear()} ${name}. Built with SiteCraft.`,
    };
  }

  return {
    id: `sec_${type}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    variant: actualVariant,
    visible: true,
    style: {
      bg: styleOverride?.bg || 'default',
      pad: styleOverride?.pad || 'md',
    },
    fx: {
      tilt: extra?.fx?.tilt ?? false,
      spot: extra?.fx?.spot ?? false,
    },
    anim: extra?.anim || 'none',
    media: extra?.media || { type: 'none' },
    floats: [],
    data,
  };
}

export function createProjectFromTemplate(
  templateId: string = 'webdev',
  customProfile?: { name?: string; role?: string }
): SiteProject {
  const preset =
    TEMPLATE_PRESETS.find(p => p.id === templateId) || TEMPLATE_PRESETS[0];
  const copy = COPY_DATABASE[preset.copy] || COPY_DATABASE.webdev;

  const name = customProfile?.name || 'Alex Morgan';
  const role = customProfile?.role || copy.role;
  const profile = { name, role, first: name.split(' ')[0] };

  const sections: SiteSection[] = preset.layout.map(([type, variant, style, extra]) =>
    createInitialSection(type, variant, style, copy, profile, extra)
  );

  return {
    title: `${profile.name} — ${profile.role}`,
    tid: preset.id,
    copy: preset.copy,
    profile,
    theme: { ...preset.theme },
    sections,
  };
}

export const DEFAULT_CANVAS_STUDIO_CONFIG: CanvasStudioConfig = {
  pattern: 'dots',
  bgColor: '#090d16',
  gridSize: 24,
  gridOpacity: 0.12,
  frameStyle: 'browser',
  frameRadius: 16,
  shadow: 'studio_3d',
  zoom: 1,
  browserTitle: 'SiteCraft Studio Preview',
  browserUrl: 'https://preview.sitecraft.dev',
  showRulers: true,
  canvasPadding: 'normal',
};

export const CANVAS_BACKDROP_PRESETS = [
  { id: 'obsidian', name: 'Obsidian', color: '#090d16', dark: true },
  { id: 'oled', name: 'OLED Black', color: '#000000', dark: true },
  { id: 'zinc', name: 'Studio Zinc', color: '#18181b', dark: true },
  { id: 'midnight', name: 'Midnight Navy', color: '#0f172a', dark: true },
  { id: 'clay', name: 'Studio Clay', color: '#f8fafc', dark: false },
  { id: 'paper', name: 'Minimal Paper', color: '#f5f5f4', dark: false },
];

