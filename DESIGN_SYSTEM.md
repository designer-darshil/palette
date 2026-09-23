# KROMA — Design System & Visual Token Specifications (DESIGN_SYSTEM.md)

## 1. Visual Philosophy
KROMA embodies an editorial, minimalist, and ultra-precise aesthetic tailored for design system professionals. It rejects generic SaaS aesthetics, excessive rounded pills, chaotic gradients, and uncalibrated typography.

## 2. Typography
- **Primary Interface**: `General Sans` (Fontshare), fallback to `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.
- **Editorial / Serif**: `Instrument Serif` (Google Fonts), fallback to `Georgia, serif`.
- **Monospace / Code**: `JetBrains Mono`, fallback to `"SF Mono", Consolas, monospace`.

## 3. Color Tokens
All components must use established CSS variables and Tailwind semantic colors:

### Canvas & Surface Tokens
- `--bg-canvas`: Default page background (`#FFFFFF` in light mode, `#0E0E10` in dark mode).
- `--bg-surface-1`: Primary elevated surface / cards (`#F8F8F9` / `#161619`).
- `--bg-surface-2`: Secondary nested elements (`#F0F0F2` / `#1E1E23`).
- `--bg-surface-3`: Tertiary borders / active states (`#E5E5E9` / `#28282F`).
- `--bg-navbar`: Fixed header and floating toolbar background with alpha transparency for blur effect (`rgba(255, 255, 255, 0.88)` / `rgba(14, 14, 16, 0.88)`).

### Typography Tokens
- `--text-primary`: High-contrast dominant text (`#171717` / `#F0F0F2`).
- `--text-secondary`: Mid-contrast supportive labels (`#707070` / `#9E9EA4`).
- `--text-tertiary`: Muted meta descriptions & timestamps (`#9E9EA4` / `#666670`).

### Border Tokens
- `--border-subtle`: Default component boundaries (`rgba(0, 0, 0, 0.08)` / `rgba(255, 255, 255, 0.08)`).
- `--border-medium`: Interactive and hover boundaries (`rgba(0, 0, 0, 0.16)` / `rgba(255, 255, 255, 0.16)`).
- `--border-strong`: Active focus and selected states (`rgba(0, 0, 0, 0.32)` / `rgba(255, 255, 255, 0.32)`).

### Semantic Brand Accent Tokens
- `kroma-red`: `#FF3B30`
- `kroma-orange`: `#FF9500`
- `kroma-yellow`: `#FFD60A`
- `kroma-green`: `#34C759`
- `kroma-blue`: `#00AEEF`
- `kroma-purple`: `#7B2CBF`

## 4. Layout & Spacing
- `--header-height`: `56px` (`3.5rem`).
- Spacing units: Multiples of 4px / 8px (`gap-1`, `gap-2`, `gap-3`, `gap-4`, `gap-6`, `gap-8`).
- Header max-width: `1440px`.

## 5. Z-Index Hierarchy
- Base content: `z-0` to `z-10`
- Sticky toolbars / studio sidebars: `z-20` to `z-40`
- Fixed Header (`.kroma-header`): `z-index: 100`
- Header Dropdown menus (`.kroma-dropdown`): `z-index: 110`
- Mobile Navigation Drawer (`.kroma-mobile-menu`): `z-index: 120`
- Global Modals & Search Overlay (`SearchModal`): `z-index: 200`
- Toasts: `z-index: 300`
