# KROMA — Autonomous AI Coding Agent Operating Rules (AGENTS.md)

## 1. Operating Contract
All agents operating in `/Users/jarvis/Documents/palette` must strictly adhere to the project governance principles and canonical documentation set:
- `PRD.md`
- `AGENTS.md`
- `DESIGN_SYSTEM.md`
- `ARCHITECTURE.md`
- `SECURITY.md`
- `CODE_STYLE.md`
- `TESTING.md`
- `README.md`

## 2. Key Constraints & Non-Negotiables
1. **Scope Precision**: When assigned a specific task (e.g., Header, Admin, Maintenance, Studio), modify ONLY the components and styles relevant to that scope. Never perform broad unintended refactors.
2. **Design Language**:
   - Use `General Sans` font exclusively for UI interfaces.
   - Use semantic design tokens (`var(--bg-canvas)`, `var(--text-primary)`, `var(--border-subtle)`, `text-kroma-*`).
   - Do NOT introduce raw arbitrary hex styles (e.g. `text-[#171717]`, `bg-[#F8F8F8]`).
3. **React Safety**:
   - Never call hooks conditionally or after early returns.
   - Maintain identical hook invocation order across rendering paths.
4. **Header Architecture**:
   - Only ONE shared public Header exists (`src/components/Header.tsx`).
   - Never create page-specific header copies (`StudioHeader`, `ExploreHeader`, etc.).
   - Must use `position: fixed`, `top: 0`, `z-index: 100`, and backdrop blur.
5. **Testing & Validation**:
   - Always run `npx tsc --noEmit` and `npm test` before concluding implementation.
   - Verify that all test suites pass with zero failures.
