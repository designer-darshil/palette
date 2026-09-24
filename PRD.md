# KROMA (PaletteParadise) — Product Requirements Document (PRD)

## 1. Product Overview & Vision
KROMA (PaletteParadise) is an editorial-grade, high-performance digital colorimetry platform, palette library, and mathematical color studio. It combines algorithmic color generators, WCAG 2.2 accessibility validation, multi-color-space conversions (sRGB, HSL, OKLCH, OKLab, CIELAB), and hardware-accelerated interactive design studios.

## 2. Target Audience
- UI/UX & Digital Product Designers needing precision color tokens and WCAG AAA compliance.
- Design System Architects generating ramps, DTCG tokens, and brand color manuals.
- Frontend Engineers seeking ready-to-use CSS, OKLCH scales, and SVG assets.
- Colorists and creative developers exploring kinetic physics, mesh gradients, and generative patterns.

## 3. Core Functional Requirements
### 3.1 Public Header & Navigation
- Single authoritative public Header rendered across all public pages.
- Left Zone: KROMA brand mark with RollerEmblem.
- Center Zone: Primary navigation for Explore, Colors, Palettes, Patterns, Studios (dropdown menu), and Community (dropdown menu).
- Right Zone: Instant Search trigger (shortcut modal), Saved specimen collection bookmark counter, About link, and Theme toggle (Dark / Light).
- Mobile Navigation: Full-screen editorial drawer with Discovery, Studio Engines, Community, and Workspace sections.
- Universal stability: `position: fixed; top: 0; z-index: 100`, backdrop blur, and semantic tokens.

### 3.2 Discovery & Specimen Collections
- **Colors Catalog** (`/colors`): 44,000 calibrated colors with CIEDE2000 similarity search, delta-E matching, and detail specs.
- **Palettes Catalog** (`/palettes`): 1,211 curated multi-hue palettes with tags, harmonic rules, and copy/export capabilities.
- **Combos** (`/combos`): 810 two-color pairing specimens with contrast ratings.
- **Gradients** (`/gradients`): 810 CSS gradients with linear/radial export.
- **Patterns** (`/patterns`): 6 procedural vector patterns with real-time SVG tiling.
- **Collections & Creators** (`/collections`, `/creators`): Themed specimen anthologies and designer profiles.

### 3.3 Creative Studios
- **Color Picker** (`/color-picker`, `/picker`): Mathematical colorimetry studio with bidirectional HEX, RGB, HSL, HSV & OKLCH translation, live harmonic schemes (Complementary, Analogous, Triadic, Tetradic, Monochromatic), tints/shades/tones scales, and WCAG 2.2 contrast compliance.
- **Ramps Studio** (`/ramps`): 11-step design system scale generator (50–950) with automated semantic tokens and OKLCH color-space gamut fitting.
- **Antigravity Studio** (`/antigravity`): Interactive 2D rigid-body kinetic physics simulator generating DTCG tokens and CSS keyframes.
- **Mesh Gradient Studio** (`/mesh`): Multi-point procedural radial/conic gradient generator with deterministic PRNG seeding and SVG/CSS exports.
- **Pattern Studio** (`/pattern-studio`): Procedural vector pattern generator.
- **Palette Generator** (`/palette-generator`, `/create`): Spacebar-driven 5-step palette creator with color locking.
- **Brand Kit Studio** (`/brand-kit`): Enterprise brand manual and accessible token export system.
- **Contrast Checker** (`/contrast-checker`): WCAG 2.2 AA/AAA validator with CVD simulation.
- **Color Name Finder** (`/color-name-finder`): Delta-E CIEDE2000 reverse color matching.
- **Image Extractor** (`/extract-from-image`): HTML5 Canvas k-means clustering swatch extraction.
- **Live Atmosphere** (`/live`): Solar elevation and meteorological color visualization.
- **Play Hub** (`/play`): Daily interactive challenges including Hexle, Odd One Out, and Palette Match.

### 3.4 Admin & Governance
- Secure administration panel (`/admin`) for system status, user management, and maintenance mode controls.
- Dedicated public maintenance intermission screen (`/maintenance`) displayed when maintenance mode is active.

## 4. Non-Functional Requirements
- **Performance**: Instant client-side route transitions (<16ms frame budget), zero cumulative layout shift (CLS 0.00).
- **Accessibility**: Strict adherence to WCAG 2.2 AA standards across all public navigation and UI components.
- **Typography**: General Sans editorial typography without decorative fallbacks.
- **Color Semantics**: Semantic CSS variables (`--bg-navbar`, `--text-primary`, `--border-subtle`, etc.) without arbitrary ad-hoc hex values.
