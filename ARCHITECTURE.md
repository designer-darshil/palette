# KROMA — Technical Architecture Document (ARCHITECTURE.md)

## 1. System Architecture Overview
KROMA is a client-side single page application (SPA) built with React 18, TypeScript, Vite, and TailwindCSS. It utilizes custom routing and state synchronization to achieve sub-millisecond route transitions without full page reloads.

## 2. Directory Structure & Key Modules
- `src/App.tsx`: Central application orchestrator, URL parser/serializer (`parseUrlToRoute`, `routeToUrl`), and root layout renderer.
- `src/components/Header.tsx`: Single source of truth for the public header and mobile navigation drawer.
- `src/components/common/CustomColorPicker.tsx` / `KromaColorPicker.tsx`: Canonical precision color picker engine supporting HEX, RGB, HSL, HSV, and OKLCH with 2D saturation/value field, spectrum sliders, and harmonics.
- `src/components/studio/`: Framework components for hardware-accelerated creative studios.
- `src/pages/`: Route-level pages for public catalog and creative studios (including `ColorPickerPage.tsx` at `/color-picker`).
- `src/pages/admin/`: Admin Hub components and maintenance mode access controls.
- `src/context/`: Global React contexts including `ThemeContext`, `ToastContext`, `AdminAuthContext`, and `MaintenanceContext`.
- `src/services/maintenanceStore.ts`: Cross-tab synchronized storage service for maintenance state.
- `src/utils/`: Colorimetric calculations, OKLCH conversions, physics solvers, and export engines.

## 3. Header Architecture & Positioning
- **Component**: `src/components/Header.tsx`
- **Positioning**: Fixed to top (`position: fixed; top: 0; left: 0; right: 0; z-index: 100`).
- **Styling**: Tailwind utilities applied directly in `Header.tsx` (`fixed inset-x-0 top-0 z-[100] backdrop-blur-md bg-navbar border-b border-border-subtle`). Design tokens are consumed via Tailwind theme integration.
- **Studio Layout Accommodation**: Studio routes (`create`, `mesh`, `pattern-studio`, etc.) use Tailwind responsive utilities for `h-[calc(100dvh-var(--header-height))]` containment with internal scroll containers. The fixed header with backdrop blur and border cleanly separates the header from studio toolbars regardless of window scroll position.
- **Responsive System**:
  - Desktop (>1024px): Full brand mark, central primary navigation, and expanded action links.
  - Tablet (768px–1024px): Symmetrically centered dropdown menus with 2-column grid to prevent clipping.
  - Mobile (<768px): Compact header with search button and two-bar hamburger button opening a full-screen drawer (`z-index: 120`).

## 4. Routing Model
KROMA uses a custom lightweight router that integrates with the HTML5 History API (`window.history.pushState`). The route object format is `{ path: RoutePath, id?: string, slug?: string, ... }`.
Rewrites for direct URL navigation in production are handled by `vercel.json` (`"source": "/(.*)", "destination": "/index.html"`).
