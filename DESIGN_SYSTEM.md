# KROMA — Design System & Tailwind Visual Token Specifications

## 1. Design System Purpose

KROMA uses an editorial, minimalist, precise visual language designed for design-system professionals.

The design system defines **visual decisions and constraints**, not a separate custom CSS framework.

### Mandatory Styling Technology

This project uses **Tailwind CSS as the primary and default styling system**.

All UI styling should be implemented using:

1. Tailwind utility classes
2. Tailwind responsive/state variants
3. Tailwind theme tokens / CSS variables where appropriate
4. Reusable UI components that compose Tailwind classes

Do not create a parallel custom CSS utility system.

### Important

The design tokens in this document describe **what the UI should look like**.

They do not require creating custom CSS classes such as:

```text
.kroma-header
.kroma-dropdown
.kroma-card
.kroma-button
.kroma-container
.kroma-section
```

when the same styling can be expressed with Tailwind.

The visual system must be preserved; the styling implementation should remain Tailwind-first.

---

# 2. Visual Philosophy

KROMA embodies an editorial, minimalist, and ultra-precise aesthetic tailored for design-system professionals.

It avoids:

- generic SaaS aesthetics
- excessive rounded pills
- unnecessary gradients
- arbitrary shadows
- excessive visual decoration
- inconsistent spacing
- uncalibrated typography
- arbitrary colors
- unnecessary custom CSS abstractions

Visual decisions should be deliberate and consistent.

---

# 3. Typography

## Primary Interface

**General Sans** (Fontshare)

Fallback:

```text
-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
```

Use Tailwind typography utilities for implementation.

Example:

```html
<p class="font-sans text-sm leading-5"></p>
```

Do not create custom typography classes such as:

```text
.kroma-body
.kroma-label
.kroma-heading
.kroma-caption
```

unless a genuine technical requirement makes Tailwind insufficient.

---

## Editorial / Serif

**Instrument Serif** (Google Fonts)

Fallback:

```text
Georgia, serif
```

Use the project's configured Tailwind font token.

---

## Monospace / Code

**JetBrains Mono**

Fallback:

```text
"SF Mono", Consolas, monospace
```

Use Tailwind's configured monospace font token.

---

# 4. Color Tokens

The project uses semantic color tokens.

Where these tokens are represented as CSS variables, they should be exposed through the Tailwind theme/configuration when practical.

UI code should consume these tokens through Tailwind classes rather than manually defining equivalent CSS declarations.

---

## Canvas & Surface Tokens

| Token            | Light                    | Dark                  | Purpose                          |
| ---------------- | ------------------------ | --------------------- | -------------------------------- |
| `--bg-canvas`    | `#FFFFFF`                | `#0E0E10`             | Default page background          |
| `--bg-surface-1` | `#F8F8F9`                | `#161619`             | Primary elevated surface / cards |
| `--bg-surface-2` | `#F0F0F2`                | `#1E1E23`             | Secondary nested elements        |
| `--bg-surface-3` | `#E5E5E9`                | `#28282F`             | Tertiary borders / active states |
| `--bg-navbar`    | `rgba(255,255,255,0.88)` | `rgba(14,14,16,0.88)` | Header / floating toolbar        |

### Implementation

Prefer Tailwind utilities using the configured semantic tokens.

For example:

```html
<div class="bg-bg-canvas"></div>
```

or the project's equivalent configured Tailwind token.

Do not introduce a custom class such as:

```css
.kroma-surface {
  background: var(--bg-surface-1);
}
```

when a Tailwind utility can represent the same token.

---

# 5. Typography Color Tokens

| Token              | Light     | Dark      | Purpose               |
| ------------------ | --------- | --------- | --------------------- |
| `--text-primary`   | `#171717` | `#F0F0F2` | Dominant text         |
| `--text-secondary` | `#707070` | `#9E9EA4` | Supporting labels     |
| `--text-tertiary`  | `#9E9EA4` | `#666670` | Metadata / timestamps |

Use Tailwind text utilities.

Example:

```html
<h1 class="text-text-primary"></h1>
```

```html
<p class="text-text-secondary"></p>
```

Do not create custom classes such as:

```text
.kroma-primary-text
.kroma-secondary-text
.kroma-muted-text
```

---

# 6. Border Tokens

| Token             | Light              | Dark                     | Purpose                        |
| ----------------- | ------------------ | ------------------------ | ------------------------------ |
| `--border-subtle` | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.08)` | Default boundaries             |
| `--border-medium` | `rgba(0,0,0,0.16)` | `rgba(255,255,255,0.16)` | Interactive / hover boundaries |
| `--border-strong` | `rgba(0,0,0,0.32)` | `rgba(255,255,255,0.32)` | Focus / selected states        |

Use Tailwind border utilities mapped to these tokens.

Example:

```html
<div class="border border-border-subtle"></div>
```

Interactive states should use Tailwind variants:

```html
<button
  class="border border-border-subtle hover:border-border-medium focus-visible:border-border-strong"
></button>
```

---

# 7. Semantic Brand Accent Tokens

The KROMA semantic accent palette is:

| Token          | Value     |
| -------------- | --------- |
| `kroma-red`    | `#FF3B30` |
| `kroma-orange` | `#FF9500` |
| `kroma-yellow` | `#FFD60A` |
| `kroma-green`  | `#34C759` |
| `kroma-blue`   | `#00AEEF` |
| `kroma-purple` | `#7B2CBF` |

These should be available through the Tailwind theme.

Prefer:

```html
<div class="bg-kroma-blue text-white"></div>
```

over:

```html
<div class="kroma-blue-block"></div>
```

Do not create custom CSS classes for these colors.

---

# 8. Layout & Spacing

## Header

Header height:

```text
56px / 3.5rem
```

Prefer the Tailwind utility:

```html
h-14
```

rather than creating:

```css
.kroma-header {
  height: 56px;
}
```

---

## Spacing

Use the project's Tailwind spacing scale.

Preferred spacing:

```text
gap-1
gap-2
gap-3
gap-4
gap-6
gap-8
```

Prefer Tailwind spacing utilities for:

- padding
- margin
- gap
- positioning
- layout rhythm

Do not create custom spacing classes.

---

## Header Width

Maximum header content width:

```text
1440px
```

Use an appropriate Tailwind max-width token.

Example:

```html
<div class="mx-auto w-full max-w-[1440px]"></div>
```

If the project defines an equivalent Tailwind theme token, use that token instead of the arbitrary value.

---

## Minimum Typography Size

Meaningful UI text and labels must not fall below:

```text
12px
```

Use:

```html
text-xs
```

when the project's Tailwind configuration maps `text-xs` to the required minimum size.

Do not create custom classes solely to represent 12px typography.

---

# 9. Component Styling

## General Rule

Components are allowed.

Custom CSS styling abstractions are not the default.

A reusable component may encapsulate:

- structure
- behavior
- accessibility
- state
- variants
- Tailwind class composition

Example:

```tsx
<Button className="h-9 rounded-md px-4 text-xs">Save</Button>
```

This is preferred over creating a custom CSS class solely for the same visual result.

---

# 10. Button Standards

The previous `KromaButton` naming describes **component behavior and sizing**, not a requirement to create `.kroma-button` CSS classes.

## Sizes

| Size      | Height | Tailwind Reference      |
| --------- | -----: | ----------------------- |
| `xs`      |   28px | `h-7 text-xs px-2 py-1` |
| `sm`      |   32px | `h-8 text-xs px-3`      |
| `md`      |   38px | `h-[38px] text-xs px-4` |
| `lg`      |   46px | `h-[46px] text-sm px-6` |
| `icon-sm` |   28px | `size-7`                |
| `icon`    |   36px | `size-9`                |

If a reusable `Button` component exists, these should be implemented as component variants using Tailwind class composition.

Do not create separate global CSS classes such as:

```text
.kroma-button-xs
.kroma-button-sm
.kroma-button-md
.kroma-button-lg
```

---

# 11. Cards

Cards should use Tailwind utilities for:

- background
- border
- radius
- padding
- shadow
- layout
- hover/focus states

Example:

```html
<div
  class="rounded-lg border border-border-subtle bg-bg-surface-1 p-6 shadow-sm"
></div>
```

Do not create:

```text
.kroma-card
```

unless there is a genuine technical requirement that Tailwind cannot reasonably express.

---

# 12. Responsive Design

Responsive behavior must use Tailwind responsive variants.

Preferred:

```html
<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"></div>
```

Avoid custom media-query classes when Tailwind can express the same behavior.

Do not create:

```css
.kroma-responsive-grid {
  ...
}

@media (...) {
  ...
}
```

unless Tailwind cannot reasonably express the requirement.

---

# 13. Interaction States

Use Tailwind state variants.

Preferred:

```text
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

Example:

```html
<button
  class="border border-border-subtle hover:border-border-medium focus-visible:border-border-strong disabled:opacity-50"
></button>
```

Do not create custom CSS classes solely for these states.

---

# 14. Dynamic Color Contrast

Technical swatches, image-extracted colors, and custom color blocks must dynamically compute background luminance through:

```text
getTextColorForBackground(hex)
```

The function determines an appropriate foreground text/control color for the background.

This is a **behavioral requirement**, not a reason to introduce custom styling classes.

Where possible, combine the computed value with Tailwind utilities.

---

# 15. Z-Index Hierarchy

Use the following layering hierarchy:

| Layer                             | Range            |
| --------------------------------- | ---------------- |
| Base content                      | `z-0` to `z-10`  |
| Sticky toolbars / studio sidebars | `z-20` to `z-40` |
| Fixed header                      | `z-[100]`        |
| Header dropdowns                  | `z-[110]`        |
| Mobile navigation drawer          | `z-[120]`        |
| Global modals / search overlay    | `z-[200]`        |
| Toasts                            | `z-[300]`        |

These values should be implemented directly with Tailwind utilities or configured Tailwind tokens.

Do not create custom classes such as:

```text
.kroma-header
.kroma-dropdown
.kroma-mobile-menu
```

merely to apply z-index.

---

# 16. Custom CSS Policy

Custom CSS is permitted only when Tailwind cannot reasonably express the required behavior.

Examples where custom CSS may be justified:

- complex third-party library overrides
- browser-specific behavior
- complex pseudo-element behavior
- advanced animations that are impractical in Tailwind
- complex selectors that cannot reasonably be represented with Tailwind
- third-party component integration requirements

Before creating custom CSS, verify whether Tailwind already supports the requirement.

Do not use custom CSS merely because writing a class is shorter than writing Tailwind utilities.

---

# 17. `!important` Policy

Do not use `!important` to override Tailwind classes.

Avoid:

```css
.foo {
  color: red !important;
}
```

Avoid using `!important` as a mechanism for resolving styling conflicts.

If a Tailwind utility is not winning as expected:

1. inspect CSS specificity
2. inspect component composition
3. inspect Tailwind configuration
4. inspect stylesheet ordering
5. inspect third-party styles
6. fix the underlying conflict

Use `!important` only when a documented third-party integration makes it unavoidable.

---

# 18. Existing Custom CSS Migration

When modifying an existing component that contains custom CSS:

1. Inspect the existing CSS.
2. Identify the visual properties being provided.
3. Find equivalent Tailwind utilities.
4. Replace the custom class with Tailwind classes.
5. Remove the obsolete CSS if no longer referenced.
6. Preserve the existing visual intent.
7. Do not redesign the component unless explicitly requested.

Example:

### Before

```html
<div class="kroma-card"></div>
```

```css
.kroma-card {
  padding: 24px;
  border-radius: 12px;
  background: var(--bg-surface-1);
  border: 1px solid var(--border-subtle);
}
```

### After

```html
<div class="rounded-xl border border-border-subtle bg-bg-surface-1 p-6"></div>
```

The goal is:

```text
Design intent → Tailwind implementation
```

not:

```text
Design intent → custom CSS abstraction → Tailwind
```

---

# 19. Forbidden Styling Patterns

Do not introduce new classes that merely wrap Tailwind concepts:

```text
.btn-primary
.card-custom
.kroma-card
.kroma-button
.kroma-header
.kroma-dropdown
.page-container
.section-wrapper
.custom-grid
.custom-flex
.text-heading
.text-muted
.spacing-md
```

when Tailwind can express the same behavior.

Do not create a custom CSS system alongside Tailwind.

Do not duplicate Tailwind utilities in CSS.

Do not use inline `style={{...}}` when the value can reasonably be represented with Tailwind.

Do not introduce arbitrary visual values when an existing KROMA token or Tailwind theme value exists.

---

# 20. Tailwind-First Decision Process

Before writing UI styling, follow this order:

### 1. Existing KROMA token

Check whether the required value already exists.

### 2. Existing Tailwind theme token

Use the configured Tailwind token.

### 3. Standard Tailwind utility

Use the standard utility.

### 4. Tailwind arbitrary value

Use an arbitrary value only when a project-specific value is genuinely required and no appropriate theme token exists.

Example:

```html
max-w-[1440px]
```

### 5. Custom CSS

Only when the requirement cannot reasonably be implemented with Tailwind.

This is the exception, not the default.

---

# 21. Design-System Integrity

Do not change KROMA's visual language casually.

When implementing a new feature:

- reuse existing colors
- reuse existing typography
- reuse existing spacing
- reuse existing radii
- reuse existing shadows
- reuse existing interaction patterns
- reuse existing component conventions

Do not invent a new visual language for individual screens.

However, maintaining visual consistency does **not** mean maintaining obsolete custom CSS classes.

The visual system is authoritative.

The old CSS implementation is not.

---

# 22. Enforcement Rule

For every UI-related task:

**Inspect existing styling → identify KROMA tokens → use Tailwind → reuse existing components → remove obsolete custom styling when touched → validate responsive/state behavior.**

The default implementation must be Tailwind-first.

The agent must not create a parallel custom CSS design system.

If an existing custom class can be replaced by Tailwind without losing required behavior, replace it.

If a custom class is no longer referenced after migration, delete it.

If custom CSS is genuinely necessary, keep it minimal and document why it cannot reasonably be implemented with Tailwind.

---

# 23. Native Interactive Elements & Accessibility Specification

All interactive UI elements across KROMA must use native HTML elements:

1. **Actions, Toggles, Controls & Modals**:
   - Use `<button type="button">` or `<KromaButton>`.
   - Never use `<div onClick>`, `<span onClick>`, `<div role="button">`, or `<span role="button">`.
2. **Navigation**:
   - Use `<Link>` or `<a>` with a valid `to`/`href`.
   - Never use fake anchors (`href="#"`) or JavaScript click handlers on buttons to emulate navigation.
3. **No Nested Interactive Elements**:
   - Never place a `<button>` inside a `<button>` or an `<a>` inside an `<a>`.
   - Complex interactive cards must use structural tags (`<article>`, `<section>`) with distinct child interactive elements.
4. **Custom Canvas & SVG Controls**:
   - When elements must reside inside SVG or Canvas trees (e.g. spline handles, color relationship nodes), apply WAI-ARIA button patterns:
     - `role="button"`
     - `tabIndex={0}`
     - `aria-label="..."`
     - `aria-pressed={boolean}`
     - `onKeyDown` supporting Enter (`key === 'Enter'`) and Space (`key === ' '`)
5. **Visible Focus & Keyboard Accessibility**:
   - All interactive controls must provide visible focus indicators (e.g. `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-primary`).

---

# 24. Global Page Title & Header Typography System

To ensure cross-page coherence across all primary pages, studios, and specimen libraries, KROMA enforces a unified, two-tier heading system:

### 1. Display Variant (Hero, Major Studios, Catalogs & Public Landing Pages)
Used on: `HomePage`, `ExplorePage`, `ColorsPage`, `PalettesPage`, `PatternsPage`, `GradientsPage`, `CombosPage`, `BrandKitPage`, `ContrastCheckerPage`, `MeshGradientStudioPage`, `MobilePaletteGeneratorPage`, `SpringsStudioPage`, `RampsStudioPage`, `PatternStudioPage`, `CreateStudioGatewayPage`, `CollectionsPage`, `CollectionDetailPage`, `SavedPage`, `PaletteRemixPage`, `AboutPage`, `NotFoundPage`, `MaintenancePage`.

- **H1**: `font-sans text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-bold leading-[1.05] tracking-tight text-text-primary uppercase m-0`
- **Eyebrow**: `font-mono text-xs font-semibold tracking-wider uppercase text-text-tertiary mb-3 [inline-flex items-center gap-2 | block]`
- **Description / Subtitle**: `text-sm sm:text-base text-text-secondary leading-relaxed max-w-2xl mt-3`

### 2. Standard Variant (Detail, Tool, Game, Profile & Sub-Pages)
Used on: `ColorRelationshipsPage`, `LiveColorsPage`, `ApiDocsPage`, `PlayHubPage`, `HexleGamePage`, `OddOneOutGamePage`, `PaletteMatchGamePage`, `ColorOfTheDayPage`, `PaletteOfTheDayPage`, `RandomDiscoveryPage`, `ColorNameFinderPage`, `ProfilePage`, `CreatorDetailPage`, `ComboDetailPage`, `GradientDetailPage`.

- **H1**: `font-sans text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-[1.1] text-text-primary m-0`
- **Eyebrow**: `text-xs font-semibold tracking-wider uppercase text-text-tertiary mb-2.5 block`
- **Description**: `text-sm md:text-base text-text-secondary leading-relaxed mt-2.5`

### Component Implementation: `<PageHeader>`
Pages using breadcrumbs, actions, or standard layout headers should use `<PageHeader>` with `variant="display"` or `variant="standard"` (default). For custom layout pages, reuse `KROMA_TITLE_CLASSES.display` or `KROMA_TITLE_CLASSES.standard` from `src/components/common/PageHeader.tsx`.

