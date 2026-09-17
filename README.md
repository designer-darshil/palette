# KROMA — The Definitive Editorial Color & Palette Library

<p align="center">
  <img src="https://raw.githubusercontent.com/designer-darshil/palette/main/public/og-kroma-preview.png" alt="KROMA Banner" width="100%" style="border-radius: 12px; max-width: 860px;" />
</p>

<p align="center">
  <strong>A curated digital color library, modernist palette catalogue, WCAG AAA harmony pairings, and creative studio tools for designers and digital architects.</strong>
</p>

<p align="center">
  <a href="https://kroma.design/"><img src="https://img.shields.io/badge/Live_Demo-kroma.design-090A0C?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" /></a>
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.3-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/WCAG-AAA_Compliant-22C55E?style=for-the-badge" alt="WCAG AAA" />
  <img src="https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge" alt="License" />
</p>

---

## 🌟 Overview

**KROMA** is a modern editorial color system and design discovery engine built for product designers, creative directors, typographers, and frontend architects. 

Moving beyond standard color pickers, KROMA combines rigorous colorimetric calculations (HEX, RGB, HSL, CMYK, LAB, APCA, and WCAG 2.2 contrast standards) with editorial modernist aesthetics, atmospheric lighting simulation, and a full suite of studio generation tools.

---

## ✨ Key Features

### 🎨 1. Curated Color Catalogue
- **Deep Colorimetry**: Instant conversion and mathematical breakdown across HEX, RGB, HSL, CMYK, and CIE-LAB spaces.
- **Harmonic Projections**: Live generation of complementary, triadic, tetradic, analogous, and monochromatic chords.
- **Tonal Scales & Shades**: Dynamic generation of 10-step tints, tones, and shades for design system tokenization.
- **Delta-E Precision**: Nearest named shade identification matching across thousands of historical and standardized color nomenclatures.

### 🎭 2. Modernist Palette Library
- Hand-curated, multi-hue color palettes categorized by mood, architecture, editorial theme, and visual weight.
- One-click copy formats: **CSS Custom Properties**, **Tailwind Config**, **JSON Tokens**, **SVG Swatches**, and **Adobe ASE**.
- Live interactive UI component mockups demonstrating palette cohesion across cards, navigation bars, badges, and typography.

### ⚡ 3. Editorial Combos & Typographic Pairings
- Verified foreground-to-background typographic pairings calibrated against WCAG 2.1 AAA/AA standards.
- High-contrast editorial display treatments with real-time text scaling, inverted modes, and readability metrics.

### 🌈 4. Multi-Stop CSS Gradients
- Linear, radial, and conic gradient specimens designed for high-end web surfaces.
- Direct CSS snippet export with customizable rotation angles, color stops, and blend transitions.

### 🔮 5. Live Atmosphere Visualizer
- Full-screen ambient atmospheric simulation blending real-time organic color gradients with subtle lighting dynamics.
- Ideal for digital displays, mood boarding, and immersive background exploration.

### 🛠️ 6. Creative Studio Suite
- **⚡ Palette Generator**: Interactive generator with color locking, keyboard shortcuts (`Space` to generate), chroma tweaking, and harmony modes.
- **👁️ WCAG & APCA Contrast Checker**: Real-time ratio calculator with support for simulated color vision deficiencies (Protanopia, Deuteranopia, Tritanopia, Achromatopsia).
- **🏷️ Color Name Finder**: Reverse hex search engine referencing 30,000+ recognized pigment, paint, and digital color titles.
- **🖼️ Image Color Extractor**: Drag-and-drop image analyzer extracting dominant color swatches, vibrancy distributions, and exportable palettes using HTML5 canvas sampling.
- **📑 Brand Kit Studio**: Automated generation of enterprise-grade brand guideline tokens, typography pairings, component sheets, and downloadable specifications.

### 💾 7. Personal Bookmarking & Collections
- Zero-friction client-side bookmarking with LocalStorage persistence.
- Curate custom collections of colors, palettes, and gradients without mandatory authentication.

### 🔐 8. Administrative Management Suite
- Dedicated administrative control panel (`/admin`) for content curation.
- Features: **Live Data Validation**, **Bulk CSV/JSON Import**, **Relationship Graph Manager**, **Security Controls**, and **Audit Logs**.

---

## 🏗️ Project Architecture

```
palette/
├── public/                 # Static assets, OpenGraph previews & favicons
├── scripts/
│   ├── buildDatasets.cjs             # Dataset compilation and indexing
│   ├── generateExpandedDataset.js   # Algorithmic color dataset expansion
│   └── generateSitemaps.cjs          # Dynamic XML sitemap generator
├── src/
│   ├── components/         # Reusable UI primitives, Modals, Navbar, Footer
│   ├── context/            # Global application state (Saved items, Theme, etc.)
│   ├── data/               # Curated collections (colors, palettes, combos, gradients)
│   ├── pages/              # Primary route views & studio tools
│   │   ├── admin/          # Admin studio pages (Dashboard, Security, Users, etc.)
│   │   ├── BrandKitPage.tsx
│   │   ├── ColorDetailPage.tsx
│   │   ├── ColorNameFinderPage.tsx
│   │   ├── ContrastCheckerPage.tsx
│   │   ├── ExtractFromImagePage.tsx
│   │   ├── HomePage.tsx
│   │   ├── LiveColorsPage.tsx
│   │   ├── MobilePaletteGeneratorPage.tsx
│   │   └── ...
│   ├── types/              # TypeScript interfaces and data models
│   ├── utils/              # Color mathematics, WCAG checkers, Delta-E, export helpers
│   ├── App.tsx             # Root router and layout orchestrator
│   ├── index.css           # Design tokens, typography variables & dark theme base
│   └── main.tsx            # Application entrypoint
├── tailwind.config.js      # Custom theme scale & typography tokens
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build pipeline & plugin setup
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm** or **pnpm** or **yarn**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/designer-darshil/palette.git
   cd palette
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server with instant HMR. |
| `npm run build` | Generates XML sitemaps, typechecks via `tsc`, and creates production bundle in `dist/`. |
| `npm run preview` | Locally serves the production build for testing. |
| `npm run generate:sitemap` | Generates dynamic search engine sitemaps based on color catalogue entries. |

---

## 🎨 Design System & Typography

KROMA utilizes a custom modernist typography hierarchy and semantic dark theme:

- **Primary Sans**: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) — UI clarity, body copy, and metadata.
- **Editorial Serif**: [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) — Editorial headers and artistic contrast.
- **Technical Monospace**: [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) — Color codes, HEX/RGB values, and code exports.

---

## 🌐 SEO & Deployment

- **Single Page Application Routing**: Configured with fallback rewrites via `vercel.json`.
- **Automated Sitemaps**: Dynamic sitemap script (`generateSitemaps.cjs`) runs on every build, indexing all color, palette, combo, and gradient slugs.
- **Zero-Flash Dark Booting**: Inline head scripts in `index.html` prevent FOUC (Flash of Unstyled Content) during initial load.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">
  Crafted with precision for designers and developers worldwide.
</p>
