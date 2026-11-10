/**
 * Type definitions for SiteCraft Website Builder
 */
import { AvatarConfig } from './scFxRuntime';

export interface Palette {
  id: string;
  name: string;
  bg: string;
  surface: string;
  text: string;
  muted: string;
  primary: string;
  accent: string;
  border: string;
}

export type Density = 'compact' | 'cozy' | 'airy';

export interface SiteTheme {
  palette: Palette;
  fontH: string;
  fontB: string;
  radius: number;
  density: Density;
}

export interface SectionStyle {
  bg?: 'default' | 'surface' | 'accent';
  pad?: 'sm' | 'md' | 'lg';
}

export interface SectionFx {
  tilt?: boolean;
  spot?: boolean;
}

export interface SectionMedia {
  type: 'none' | 'gradient' | 'scene' | 'video' | 'avatar';
  grad?: { c1: string; c2: string; angle?: number; anim?: boolean };
  scene?: 'torus' | 'sphere' | 'cube' | 'waves' | 'particles';
  videoUrl?: string;
  avatar?: AvatarConfig;
  pos?: 'left' | 'right' | 'center';
  size?: number; // percentage
  backdrop?: 'none' | 'scene';
  overlay?: number; // opacity 0-1
}

export interface FloatingElement {
  id: string;
  kind: 'text' | 'image' | 'video' | 'btn' | 'shape' | 'scene' | 'avatar' | 'threeLogo';
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  w: number; // px or %
  h?: number;
  rot?: number; // deg
  z?: number;
  motion?: 'none' | 'float' | 'pulse' | 'spin' | 'sway';
  hover?: 'none' | 'lift' | 'zoom' | 'glow';
  // Text specific
  text?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  // Image specific
  src?: string;
  // Video specific
  url?: string;
  // Button specific
  label?: string;
  href?: string;
  variant?: 'primary' | 'ghost';
  // Shape specific
  shape?: 'circle' | 'square' | 'pill' | 'star';
  fill?: string;
  // Scene / 3D
  sceneKind?: 'torus' | 'sphere' | 'cube' | 'waves' | 'particles';
  // Avatar
  avatarConfig?: AvatarConfig;
  // Three.js 3D Procedural Logo
  threeLogoData?: any;
}

export type SectionType =
  | 'nav'
  | 'hero'
  | 'about'
  | 'skills'
  | 'services'
  | 'projects'
  | 'repos'
  | 'testimonials'
  | 'experience'
  | 'contact'
  | 'video'
  | 'canvas'
  | 'footer';

export interface SiteSection {
  id: string;
  type: SectionType;
  variant: string;
  visible: boolean;
  style: SectionStyle;
  fx: SectionFx;
  anim?: 'none' | 'fade-up' | 'slide-left' | 'slide-right' | 'zoom' | 'flip';
  media?: SectionMedia;
  floats?: FloatingElement[];
  data: Record<string, any>;
}

export interface UserProfile {
  name: string;
  role: string;
  first?: string;
}

export interface SiteProject {
  id?: string;
  title: string;
  tid: string;
  copy: string;
  profile: UserProfile;
  theme: SiteTheme;
  sections: SiteSection[];
}

export interface TemplatePreset {
  id: string;
  name: string;
  emoji: string;
  tag: string;
  copy: string;
  theme: SiteTheme;
  layout: [SectionType, string, SectionStyle?, { media?: SectionMedia; fx?: SectionFx; anim?: string }?][];
}

// Google Stitch Canvas Studio Types
export type CanvasPattern = 'dots' | 'grid' | 'blueprint' | 'isometric' | 'checker' | 'glow' | 'solid';
export type FrameStyle = 'browser' | 'device_bezel' | 'card' | 'frameless';
export type FrameShadow = 'none' | 'soft' | 'studio_3d' | 'ambient_glow';

export interface CanvasStudioConfig {
  pattern: CanvasPattern;
  bgColor: string;
  gridSize: number;
  gridOpacity: number;
  frameStyle: FrameStyle;
  frameRadius: number;
  shadow: FrameShadow;
  zoom: number;
  browserTitle: string;
  browserUrl: string;
  showRulers: boolean;
  canvasPadding: 'tight' | 'normal' | 'spacious';
  customWidth?: number;
}

