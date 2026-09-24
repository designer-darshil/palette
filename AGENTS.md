# KROMA — Autonomous AI Coding Agent Operating Rules

## 1. Operating Contract

All agents operating in this repository must strictly adhere to the project governance principles and canonical documentation set:

- `PRD.md`
- `AGENTS.md`
- `DESIGN_SYSTEM.md`
- `ARCHITECTURE.md`
- `SECURITY.md`
- `CODE_STYLE.md`
- `TESTING.md`
- `README.md`

These documents must be treated as the project's canonical governance and implementation references.

Before making implementation changes, inspect the documentation relevant to the requested task.

---

# 2. Mandatory Task Workflow

For every task:

1. Understand the user's requested scope.
2. Read the relevant canonical documentation.
3. Inspect the existing implementation before creating new abstractions.
4. Identify existing components, styles, utilities, tokens, and patterns that should be reused.
5. Plan the smallest coherent change.
6. Implement the change.
7. Validate the implementation.
8. Update affected canonical documentation when the implementation changes documented behavior or architecture.

Do not skip repository inspection merely because the requested change appears small.

---

# 3. Scope Precision

When assigned a specific task, modify only the components, files, styles, and logic relevant to that task.

Do not perform unrelated:

- refactors
- redesigns
- dependency changes
- architecture changes
- naming changes
- CSS migrations
- component rewrites

unless they are required to correctly complete the requested task.

If an existing component being modified contains obsolete styling that can be safely replaced as part of the requested work, it may be migrated to the project's current styling standard.

---

# 4. Tailwind-First Styling — NON-NEGOTIABLE

This project uses Tailwind CSS.

**Tailwind CSS is the default styling implementation for all UI work.**

When implementing or modifying UI:

1. Prefer Tailwind utility classes.
2. Reuse configured Tailwind theme tokens.
3. Use Tailwind responsive variants.
4. Use Tailwind interaction/state variants.
5. Reuse existing component variants.
6. Use arbitrary Tailwind values only when an appropriate project token or standard utility does not exist.
7. Use custom CSS only when Tailwind cannot reasonably express the required behavior.

Do not create a parallel custom CSS styling system.

---

# 5. Custom CSS Classes — Avoid By Default

Do NOT create new custom CSS classes when Tailwind can express the same styling.

Avoid patterns such as:

```text id="7j3m4r"
.kroma-button
.kroma-card
.kroma-header
.kroma-dropdown
.kroma-container
.page-container
.section-wrapper
.custom-grid
.custom-flex
.text-heading
.text-muted
.spacing-md
```

if the same result can be implemented using Tailwind utilities.

For example, prefer:

```tsx id="2wq9d5"
<div className="rounded-xl border border-border-subtle bg-bg-surface-1 p-6">
```

instead of:

```tsx id="1am5xv"
<div className="kroma-card">
```

with a separate CSS implementation.

---

# 6. Existing Custom CSS Must Not Be Automatically Preserved

When modifying an existing component that uses custom CSS:

1. Inspect the existing custom class.
2. Understand what visual behavior it provides.
3. Determine whether Tailwind can represent that behavior.
4. Replace it with Tailwind utilities when practical.
5. Remove the obsolete CSS if no longer referenced.
6. Preserve the visual design and behavior.
7. Do not redesign the component unless explicitly requested.

The existing CSS implementation is not automatically authoritative.

The project's visual/design requirements are authoritative.

---

# 7. KROMA Design Tokens

Use the semantic KROMA design tokens defined in `DESIGN_SYSTEM.md`.

The following concepts remain authoritative:

- canvas colors
- surface colors
- text colors
- border colors
- semantic brand colors
- typography
- spacing
- radii
- shadows
- z-index hierarchy
- component dimensions

However:

**Design tokens should be consumed through Tailwind whenever practical.**

Preferred:

```tsx id="fb4c02"
<div className="bg-bg-canvas text-text-primary border-border-subtle">
```

Not:

```tsx id="8j3p2n"
<div className="kroma-surface kroma-primary-text kroma-border">
```

and not:

```tsx id="4m4y8k"
<div style={{ backgroundColor: "var(--bg-canvas)" }}>
```

when an equivalent Tailwind utility is available.

---

# 8. No Raw Arbitrary Colors

Do not introduce raw arbitrary hex colors when an existing KROMA token exists.

Avoid:

```tsx id="b6n7z3"
<div className="bg-[#F8F8F9]">
```

when the project already provides the equivalent semantic token.

Prefer the configured Tailwind token:

```tsx id="z7k2pq"
<div className="bg-bg-surface-1">
```

However, arbitrary Tailwind values are allowed for legitimate project-specific values when no appropriate token exists.

For example:

```tsx id="m7d4qa"
<div className="max-w-[1440px]">
```

may be acceptable when `1440px` is an intentional KROMA specification and no corresponding Tailwind token exists.

Do not confuse arbitrary Tailwind values with arbitrary visual design.

---

# 9. Do Not Fight Tailwind

Do not use custom CSS to override Tailwind utilities.

Avoid:

```css id="2w9h7e"
.kroma-card {
  padding: 24px !important;
}
```

Avoid creating CSS specifically to defeat utility precedence.

Do not use `!important` unless a documented third-party integration genuinely requires it.

If a Tailwind class is not producing the expected result:

1. inspect class composition
2. inspect Tailwind configuration
3. inspect CSS ordering
4. inspect specificity
5. inspect third-party styles
6. fix the underlying conflict

Do not automatically add another custom CSS override.

---

# 10. Tailwind State and Responsive Rules

Use Tailwind variants for responsive and interactive behavior.

Preferred:

```text id="x8b9nz"
sm:
md:
lg:
xl:
2xl:

hover:
focus:
focus-visible:
active:
disabled:
group-hover:
group-focus:
data-[state=...]:
aria-[...]:
```

Do not create custom media-query classes or state classes when Tailwind can express the same behavior.

---

# 11. Component Architecture

Reusable components are encouraged.

A component may encapsulate:

- structure
- behavior
- accessibility
- state
- variants
- Tailwind class composition

For example:

```tsx id="k8z3jw"
<KromaButton size="md" />
```

is valid if `KromaButton` is a real reusable component.

However, its visual implementation should use Tailwind classes or Tailwind-compatible class composition.

Do not create a component solely to hide a large custom CSS system.

---

# 12. Header Architecture

Only ONE shared public Header exists:

```text id="v7c1m4"
src/components/Header.tsx
```

Never create page-specific header copies such as:

```text id="2s9f3a"
StudioHeader
ExploreHeader
AdminHeader
DashboardHeader
```

unless explicitly required by a documented architectural decision.

The shared public Header must use:

- `position: fixed`
- `top: 0`
- `z-[100]`
- backdrop blur

Prefer Tailwind implementation:

```tsx id="4j8m1q"
className = "fixed inset-x-0 top-0 z-[100] backdrop-blur-md";
```

Do not create `.kroma-header` solely to provide these styles.

---

# 13. React Safety

Never call hooks conditionally.

Never call hooks after early returns.

Maintain identical hook invocation order across all rendering paths.

Do not introduce conditional hook execution during refactoring.

---

# 14. Design-System Consistency

Use `DESIGN_SYSTEM.md` as the source of truth for KROMA's visual language.

Do not invent a new visual language for individual screens.

Reuse:

- existing colors
- typography
- spacing
- radii
- shadows
- component dimensions
- interaction patterns

However, consistency with the design system does **not** mean preserving obsolete custom CSS classes.

Preserve the design.

Modernize the implementation to Tailwind when appropriate.

---

# 15. CSS Migration Rule

When touching a component containing obsolete custom CSS, prefer this migration:

```text id="9s5j2e"
Existing custom CSS
        ↓
Inspect visual behavior
        ↓
Find equivalent Tailwind utilities
        ↓
Replace class usage
        ↓
Remove unused CSS
        ↓
Validate visual behavior
```

Do not create:

```text id="x1k8q6"
Existing custom CSS
        ↓
Existing custom CSS + Tailwind
        ↓
Another custom abstraction
```

The project should converge toward a Tailwind-first implementation.

---

# 16. New UI Implementation Rule

When creating new UI:

### First

Look for an existing component.

### Second

Look for an existing Tailwind token.

### Third

Use standard Tailwind utilities.

### Fourth

Use an arbitrary Tailwind value if a specific documented value is required.

### Last

Create custom CSS only when Tailwind cannot reasonably express the requirement.

Before adding custom CSS, explicitly verify that Tailwind cannot reasonably implement the requirement.

---

# 17. Documentation Consistency

When implementation changes the project's:

- product behavior
- architecture
- design system
- security model
- coding conventions
- testing strategy
- developer workflow

update the relevant canonical document.

In particular, when custom CSS is migrated to Tailwind:

- update `DESIGN_SYSTEM.md` if its implementation guidance is affected
- update `CODE_STYLE.md` if coding conventions change
- remove obsolete styling instructions

Do not leave documentation instructing future agents to use styling patterns that have been removed.

---

# 18. Testing & Validation

Before concluding implementation, run:

```bash id="w8k3f2"
npx tsc --noEmit
```

and:

```bash id="9d1m7q"
npm test
```

Verify that all test suites pass with zero failures.

For UI changes, also validate:

- responsive behavior
- hover states
- focus states
- disabled states
- dark/light mode when applicable
- visual consistency with `DESIGN_SYSTEM.md`

If a required validation command cannot be run, explicitly state that it was not verified.

Do not claim validation that was not actually performed.

---

# 19. Final Implementation Gate

Before considering a task complete, verify:

- [ ] Requested scope was respected.
- [ ] Existing components were inspected before creating new ones.
- [ ] Tailwind was used for new UI styling.
- [ ] Existing KROMA tokens were reused.
- [ ] No unnecessary custom CSS was introduced.
- [ ] No unnecessary arbitrary colors were introduced.
- [ ] No unnecessary `!important` rules were introduced.
- [ ] Obsolete custom CSS was removed when safely migrated.
- [ ] Responsive behavior was verified.
- [ ] Relevant tests were run.
- [ ] TypeScript validation was run.
- [ ] Relevant documentation remains accurate.

---

# 20. Core Principle

The KROMA project has one visual language and one primary styling implementation:

**KROMA Design System → implemented with Tailwind CSS.**

Do not build a second custom CSS system beside Tailwind.

When an old custom CSS implementation exists, preserve its intended visual behavior where required, but prefer replacing the implementation with Tailwind when the component is touched.

The target architecture is:

```text id="5z6n1k"
Design Tokens
     ↓
Tailwind Theme / CSS Variables
     ↓
Tailwind Utilities
     ↓
Reusable Components
     ↓
Application UI
```

Not:

```text id="a4q8s2"
Design Tokens
     ↓
Custom CSS Classes
     ↓
Another abstraction
     ↓
Tailwind overrides
     ↓
Application UI
```

## Global CSS and Tailwind Migration Policy

### Tailwind is the Primary UI Styling Layer

Tailwind CSS is the canonical implementation layer for application UI.

Do not create or expand component-level CSS abstractions in `src/index.css`.

The following are prohibited for new UI work when Tailwind can express the same behavior:

- BEM-style component selectors such as `.kroma-header__item`
- page-specific selectors such as `.studio-*` or `.admin-*`
- custom component classes such as `.kroma-button-*`
- CSS classes that merely wrap Tailwind utilities
- duplicate responsive systems
- duplicate typography systems
- duplicate spacing systems
- `!important` used to fight Tailwind specificity
- CSS selectors whose only purpose is to encode React component state

### `src/index.css` Responsibility

`src/index.css` is global infrastructure, not the application's primary component stylesheet.

It may contain only:

1. Tailwind directives/imports
2. Runtime design tokens that genuinely require CSS variables
3. Global base/reset styles
4. Global typography defaults
5. Global accessibility/focus defaults
6. Required third-party stylesheet imports
7. Browser-specific technical CSS that Tailwind cannot reasonably express

Component styling does not belong here.

### Technical CSS

The following may remain outside Tailwind when technically necessary:

- `::-webkit-scrollbar` and related scrollbar pseudo-elements
- `::-webkit-slider-thumb`
- `::-moz-range-thumb`
- unavoidable browser-specific pseudo-elements
- specialized preloaders
- genuinely complex browser-specific rendering behavior

Prefer isolating such styles in dedicated files under `src/styles/` rather than expanding `src/index.css`.

### Migration Rule

When modifying a component that currently depends on custom CSS:

1. Inspect the component and its CSS together.
2. Identify every selector used by the component.
3. Determine whether Tailwind can express the behavior.
4. Replace the CSS with Tailwind utilities in the component.
5. Preserve visual behavior, responsive behavior, accessibility, interaction states, and animations.
6. Remove the migrated CSS selector.
7. Search the repository for remaining references to the selector.
8. Do not create a replacement custom CSS class merely to avoid writing Tailwind utilities.

Migration priority:

1. Existing KROMA Tailwind token
2. Existing Tailwind theme token
3. Standard Tailwind utility
4. Tailwind responsive/state variant
5. Tailwind arbitrary value
6. Dedicated technical CSS only when Tailwind cannot reasonably express the requirement

### Design Tokens

Preserve the KROMA visual design system.

Do not remove design decisions merely because component CSS is being removed.

However, design tokens must not be confused with component CSS.

For example:

Allowed:

```tsx
className = "bg-bg-surface-1 text-text-primary border-border-subtle";
```

if these are real Tailwind theme utilities.

Not allowed:

```css
.kroma-card {
  background: var(--bg-surface-1);
  border: 1px solid var(--border-subtle);
}
```

when the same result can be expressed through Tailwind.

### Responsive Design

Tailwind breakpoints are the canonical responsive system.

Do not maintain a second breakpoint system in `index.css` unless a runtime CSS variable is technically required.

Prefer:

```tsx
className = "px-4 md:px-6 lg:px-8";
```

over:

```css
@media (max-width: 768px) {
  .component {
    padding: 16px;
  }
}
```

### Component State

Do not encode application state through CSS selectors when React already knows the state.

Avoid patterns such as:

```css
.main-content:has(.studio-workspace) { ... }
```

Prefer explicit React state/structure with conditional Tailwind classes.

Avoid creating modifier CSS such as:

```css
.component--open
.component--active
.component--visible
```

when the same state can be represented by conditional Tailwind classes.

### Animation

Prefer Tailwind animation utilities and Tailwind theme keyframes for reusable application animations.

Do not create standalone CSS animation classes in `index.css` when the animation can be represented through the Tailwind theme.

Keep dedicated CSS only for technically complex animations that genuinely require CSS beyond practical Tailwind expression.

### Existing CSS Migration

When touching a legacy component, migrate its existing custom CSS opportunistically rather than adding more custom CSS.

Do not perform a blind global deletion.

Before deleting a selector:

- search for all usages;
- inspect dynamic class construction;
- inspect conditional class composition;
- inspect third-party or non-React usage;
- verify that equivalent Tailwind behavior exists.

Unused selectors should be deleted.

Migrated selectors should be deleted after verification.

### `!important`

Do not introduce `!important` to solve ordinary Tailwind conflicts.

If existing CSS contains `!important`, treat it as a migration signal.

Resolve the underlying specificity or architecture problem instead of reproducing the `!important` pattern.

Use `!important` only where a genuine browser, accessibility, or third-party integration requirement makes it necessary.

### Global CSS Quality Gate

Before considering a UI task complete:

- `src/index.css` contains no new component-level styling;
- migrated selectors have been removed;
- no duplicate Tailwind/CSS token systems were introduced;
- no unnecessary `!important` rules were introduced;
- no page-specific CSS was added to the global stylesheet;
- responsive behavior uses Tailwind breakpoints;
- interactive states use Tailwind variants or React state;
- technical CSS is isolated when practical;
- `npx tsc --noEmit` passes;
- `npm test` passes;
- `npm run build` passes when available.

### Target Architecture

The target styling architecture is:

KROMA Design System
→ Tailwind Theme / Runtime Tokens
→ Tailwind Utilities
→ React Components
→ Application UI

Not:

KROMA Design System
→ Large global CSS component layer
→ Tailwind overrides
→ `!important`
→ Application UI
