# Product Requirements Document (PRD)

## Project Name: App Template & Prompt Studio

---

## 1. Executive Summary & Overview
The **App Template & Prompt Studio** is a unified sandbox and creative hub for developers and visual designers. It answers a common need: developers who want to quickly build and preview functional UI templates (SaaS landings, login screens, dashboards, portfolio layouts) and simultaneously require optimized, vivid visual prompts (for tools like Canva/Midjourney) and localized website copywriting to flesh out those templates.

This application integrates a curated gallery of high-fidelity, interactive layout interfaces with a powerful server-side Gemini AI module. Users can select any structural app template, see a high-contrast preview canvas in action, modify design/industry parameters, and instantly generate custom-themed Canva image prompts and tailored marketing copy.

---

## 2. Core Value Proposition
- **Turn Ideas into High-Quality Visual Prompts**: Converts basic design intentions (e.g., "fintech app in dark mode") into cinematic, high-fidelity prompt scripts engineered specifically for Canva AI or general image generators.
- **Instant Website & Copy Grounding**: Drastically reduces placeholder load by generating custom contextual copywriting (landing headers, dashboard widget metrics, call-to-actions) aligned with the selected layout template.
- **Interactive Layout Sandbox**: Provides clean, desktop-first, fully-designed mock interfaces so users can visualize the structure, layout flow, and component relationships directly inside the canvas.

---

## 3. Product Specifications & Features

### 3.1 Template Center (Aesthetic Canvas Previews)
Providing modular, interactive layout prototypes in beautiful CSS structure. Supported template modules:
1. **Landing Page Template**: Full hero banner layout, custom CTA indicators, features grid mockup, feature badges, and responsive navigation header.
2. **Analytics Dashboard Template**: Comprehensive metric grids, recent activity databases, dynamic transaction listings, and clear visual indicators.
3. **Dual-Screen Authentication Screens**:
   - **Modern Login**: Dual-screen split, clean input sections, and micro-animations.
   - **Secure Registration**: Signup flow with visual credential hints.
   - **Password Reset**: Single focus modal with security illustration.
4. **Artistic Portfolio Gallery**: Responsive masonry portfolio grid, filtering mechanics, and modern interactive tags.

### 3.2 Gemini-Powered Prompt & Copy Generator (Server-Side)
An integrated co-generation studio with deep tuning controls:
- **Design Intent Parameter Input**: A free-form description text block for target ideas or brand industry description (e.g., "eco-friendly organic tea storefront", "cyberpunk portfolio", "sleek minimal legal tech").
- **Tonal & Aesthetic Preferences**: Dynamic options to pick:
  - *Color Motifs*: Sunset Warmth, Neon Tech, Minimalist Monochrome, Cosmic Slate, Forest Organic.
  - *Brand Voice*: Bold & Inspiring, Professional & Trustworthy, Technical & Direct, Playful & Friendly.
- **AI Action Engines**:
  - **✨ Optimize Canva Prompt**: Takes raw ideas and structural context to manufacture cinematic, evocative asset-generation prompts. It outlines specific background styles, geometry, colors, asset placeholder directions, and fidelity tags.
  - **📋 Generate Custom Copy**: Produces contextual marketing, structural texts, or simulated data matched directly to the selected layout template's placeholders.

### 3.3 Prompt & Copy Sandbox Workspace
- **Dynamic Interaction Sandbox**: Users can view the exact optimized text block next to the interactive template preview canvas.
- **Copy-to-Clipboard Integrations**: Quick action links and status highlights to export data for easy pasting into design software (like Canva) or development codebases.
- **Theme Preset Indicators**: Visualizing recommended pairings (e.g., "Inter" for UI and "JetBrains Mono" for tech-oriented components).

---

## 4. Visual Design & Aesthetic Strategy
- **Mood**: High-contrast, premium dark mode using soft off-black, celestial charcoal backgrounds, and rich neon purple or cyan accents. It focuses heavily on generous margins, readable text containers, and clean border borders.
- **Typography Pairing**:
  - *Primary Sans*: **Inter** for standard UI fields, button markers, and form values.
  - *Accent Mono*: **JetBrains Mono** for status logs, copying feedback, and prompt script sections to emphasize its technical utility.
- **Animation Principles**: Subtle hover scales on card layouts, clean borders transition highlights, and smooth state transitions via `motion/react`.

---

## 5. Technical & Architectural Design

### 5.1 Technology Stack
- **Frontend SPA**: React 19 + TypeScript, designed using Vite. Fully responsive using customized Tailwind utility declarations.
- **Backend Service**: Node.js Express server to host API endpoints and proxy external model dependencies.
- **AI Integration**: `@google/genai` library instantiated safely on the backend with authorization secrets protected.
- **Icons & Visuals**: Pure vector representation via `lucide-react` for instant rendering and unified weights.

### 5.2 Server-Side AI Security
To comply with security mandates, **no API keys are exposed to client-side bundles or referenced in the browser**.
- All copy optimization and Canva prompt rendering requests are sent to `/api/generate` Express route.
- The route gathers client requirements, formats them with robust system instructions, queries `gemini-3.5-flash` model, and returns structured JSON responses.

---

## 6. Development Milestones & Implementation Map
1. **Milestone 1**: Setup server-side Express runtime with routing foundations and full support for Vite middleware integration in development. Configure TypeScript build targets.
2. **Milestone 2**: Write standard backend helper modules configuring `GoogleGenAI` model definitions safely utilizing telemetry user agents (`'aistudio-build'`).
3. **Milestone 3**: Build out responsive frontend viewport, layout drawers, and high-fidelity interactive templates database with custom UI toggles.
4. **Milestone 4**: Conduct rigid verification checks (compilation, static analysis, component render testing) to guarantee flawless performance.
