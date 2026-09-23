# KROMA — Code Style & Implementation Guidelines (CODE_STYLE.md)

## 1. Language & Framework Conventions
- **Language**: TypeScript with strict mode enabled (`tsconfig.json`).
- **Framework**: React 18 functional components with hooks.
- **Styling**: TailwindCSS utility classes combined with semantic CSS variables defined in `src/index.css`.

## 2. Naming Standards
- **Component Files**: PascalCase (e.g., `Header.tsx`, `ExplorePage.tsx`, `KromaButton.tsx`).
- **Utility / Engine Files**: camelCase (e.g., `colorUtils.ts`, `springsEngine.ts`, `rankingEngine.ts`).
- **Types & Interfaces**: PascalCase (e.g., `RouteType`, `PaletteSpecimen`, `ColorModel`).
- **Constants**: UPPER_SNAKE_CASE (e.g., `STUDIO_TOOLS`, `COMMUNITY_LINKS`).

## 3. CSS & Design Token Rules
- DO NOT use arbitrary hex color utility classes like `text-[#171717]`, `bg-[#F8F8F8]`, or `border-[#171717]`.
- Always use semantic tokens: `var(--bg-canvas)`, `var(--bg-navbar)`, `var(--text-primary)`, `var(--text-secondary)`, `var(--border-subtle)`, or `text-kroma-*`.
- Typography is strictly `General Sans` for interface text.
- Do not introduce arbitrary inline styles when classes exist.

## 4. React Safety & Hook Rules
- Hooks must be declared at the top level of the component.
- Never call hooks inside loops, conditionals, or nested callbacks.
- Avoid conditional returns before hook declarations to prevent "Rendered fewer hooks than expected" errors.

## 5. File Organization
- Every public view lives in `src/pages/`.
- Admin-specific views live in `src/pages/admin/`.
- Reusable UI primitives live in `src/components/common/`.
- Shared layout elements live in `src/components/`.
