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
