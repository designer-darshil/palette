/**
 * KROMA — WCAG 2.2 + OKLCH Brand Kit Color System
 *
 * Provides mathematically exact WCAG 2.2 contrast checking,
 * OKLCH color space conversions with sRGB gamut fitting,
 * minimal perceptual contrast adjustments (preserving hue & chroma),
 * and intelligent semantic role resolution.
 */

// ── 1. Basic Color Conversions & Luminance ──────────────────────────

export interface RgbColor {
  r: number; // 0..255
  g: number;
  b: number;
}

export interface OklchColor {
  L: number; // 0..1 (Lightness)
  C: number; // 0..~0.4 (Chroma)
  H: number; // 0..360 (Hue angle in degrees)
}

export function hexToRgb(hex: string): RgbColor | null {
  if (!hex || typeof hex !== 'string') return null;
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    };
  }
  if (clean.length === 6) {
    return {
      r: parseInt(clean.substring(0, 2), 16),
      g: parseInt(clean.substring(2, 4), 16),
      b: parseInt(clean.substring(4, 6), 16),
    };
  }
  return null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (c: number) => {
    const h = clamp(c).toString(16);
    return h.length === 1 ? '0' + h : h;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Standard IEC 61966-2-1 relative luminance
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

export function getHexLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  return getRelativeLuminance(rgb.r, rgb.g, rgb.b);
}

// ── 2. WCAG 2.2 Contrast Ratio Calculation ──────────────────────────

/**
 * Mathematically exact WCAG 2.2 contrast ratio without premature upward rounding.
 * e.g. 4.496 is strictly < 4.50.
 */
export function calculateWcagRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 1.0;

  const lum1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

  const l1 = Math.max(lum1, lum2);
  const l2 = Math.min(lum1, lum2);

  return (l1 + 0.05) / (l2 + 0.05);
}

/**
 * Formats a contrast ratio for display without rounding up across thresholds.
 * For example, 4.496 is formatted as "4.49" so it never displays as "4.50" if failing.
 */
export function formatContrastRatio(ratio: number): string {
  // Truncate to 2 decimal places to avoid upward rounding false-passes
  const truncated = Math.floor(ratio * 100) / 100;
  return truncated.toFixed(2);
}

export interface WcagRating {
  ratio: number;
  formattedRatio: string;
  normalTextAA: boolean; // >= 4.5
  normalTextAAA: boolean; // >= 7.0
  largeTextAA: boolean; // >= 3.0
  largeTextAAA: boolean; // >= 4.5
  uiComponent: boolean; // >= 3.0
  statusText: 'WCAG AAA PASS' | 'WCAG AA PASS' | 'WCAG AA LARGE ONLY' | 'FAIL';
}

export function evaluateWcagRating(fgHex: string, bgHex: string): WcagRating {
  const ratio = calculateWcagRatio(fgHex, bgHex);
  const normalTextAA = ratio >= 4.5;
  const normalTextAAA = ratio >= 7.0;
  const largeTextAA = ratio >= 3.0;
  const largeTextAAA = ratio >= 4.5;
  const uiComponent = ratio >= 3.0;

  let statusText: WcagRating['statusText'] = 'FAIL';
  if (normalTextAAA) statusText = 'WCAG AAA PASS';
  else if (normalTextAA) statusText = 'WCAG AA PASS';
  else if (largeTextAA) statusText = 'WCAG AA LARGE ONLY';

  return {
    ratio,
    formattedRatio: formatContrastRatio(ratio),
    normalTextAA,
    normalTextAAA,
    largeTextAA,
    largeTextAAA,
    uiComponent,
    statusText,
  };
}

// ── 3. OKLCH Conversions & Gamut Fitting ────────────────────────────

// sRGB [0..255] to linear sRGB [0..1]
function sRgbToLinear(v: number): number {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

// Linear sRGB [0..1] to sRGB [0..255]
function linearToSRgb(c: number): number {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.max(0, Math.min(255, Math.round(v * 255)));
}

// RGB to OKLab
export function rgbToOklab(r: number, g: number, b: number): { L: number; a: number; b: number } {
  const lr = sRgbToLinear(r);
  const lg = sRgbToLinear(g);
  const lb = sRgbToLinear(b);

  const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  return {
    L: 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  };
}

// OKLab to OKLCH
export function oklabToOklch(L: number, a: number, b: number): OklchColor {
  const C = Math.sqrt(a * a + b * b);
  let H = Math.atan2(b, a) * (180 / Math.PI);
  if (H < 0) H += 360;
  return { L, C, H };
}

export function hexToOklch(hex: string): OklchColor {
  const rgb = hexToRgb(hex);
  if (!rgb) return { L: 0.5, C: 0, H: 0 };
  const lab = rgbToOklab(rgb.r, rgb.g, rgb.b);
  return oklabToOklch(lab.L, lab.a, lab.b);
}

export function oklchToCssString(L: number, C: number, H: number): string {
  return `oklch(${Math.round(L * 100)}% ${C.toFixed(3)} ${Math.round(H)})`;
}

// OKLCH to OKLab
export function oklchToOklab(L: number, C: number, H: number): { L: number; a: number; b: number } {
  const rad = (H * Math.PI) / 180;
  return {
    L,
    a: C * Math.cos(rad),
    b: C * Math.sin(rad),
  };
}

// OKLab to linear sRGB
function oklabToLinear(L: number, a: number, b: number): { r: number; g: number; b: number } {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return {
    r: +4.0767439362 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  };
}

// Check sRGB gamut bounds
export function isOklchInSrgb(L: number, C: number, H: number): boolean {
  const lab = oklchToOklab(L, C, H);
  const lin = oklabToLinear(lab.L, lab.a, lab.b);
  const eps = 0.0001;
  return (
    lin.r >= -eps && lin.r <= 1 + eps &&
    lin.g >= -eps && lin.g <= 1 + eps &&
    lin.b >= -eps && lin.b <= 1 + eps
  );
}

// Fit OKLCH to sRGB using binary search chroma reduction (preserving exact Hue)
export function fitOklchToSrgb(L: number, targetC: number, H: number): { r: number; g: number; b: number; C: number } {
  if (targetC <= 0.0001) {
    const lab = oklchToOklab(L, 0, H);
    const lin = oklabToLinear(lab.L, lab.a, lab.b);
    return {
      r: linearToSRgb(lin.r),
      g: linearToSRgb(lin.g),
      b: linearToSRgb(lin.b),
      C: 0,
    };
  }

  let low = 0;
  let high = targetC;
  let bestC = 0;

  for (let i = 0; i < 16; i++) {
    const mid = (low + high) / 2;
    if (isOklchInSrgb(L, mid, H)) {
      bestC = mid;
      low = mid;
    } else {
      high = mid;
    }
  }

  const lab = oklchToOklab(L, bestC, H);
  const lin = oklabToLinear(lab.L, lab.a, lab.b);
  return {
    r: linearToSRgb(lin.r),
    g: linearToSRgb(lin.g),
    b: linearToSRgb(lin.b),
    C: bestC,
  };
}

export function oklchToHex(L: number, C: number, H: number): string {
  const fitted = fitOklchToSrgb(L, C, H);
  return rgbToHex(fitted.r, fitted.g, fitted.b);
}

// ── 4. Intelligent Foreground Selection (Rule 06) ───────────────────

export interface SmartForegroundResult {
  color: string;
  ratio: number;
  passAA: boolean;
  passAAA: boolean;
}

/**
 * For any colored surface, test standard dark (#171717) and light (#F8F8F8) foregrounds.
 * Choose whichever provides sufficient contrast without sacrificing semantic readability.
 */
export function getSmartForeground(
  bgHex: string,
  minRatio: number = 4.5
): SmartForegroundResult {
  const darkCandidate = '#171717';
  const lightCandidate = '#F8F8F8';

  const darkRatio = calculateWcagRatio(darkCandidate, bgHex);
  const lightRatio = calculateWcagRatio(lightCandidate, bgHex);

  const darkPass = darkRatio >= minRatio;
  const lightPass = lightRatio >= minRatio;

  if (darkPass && !lightPass) {
    return {
      color: darkCandidate,
      ratio: darkRatio,
      passAA: darkRatio >= 4.5,
      passAAA: darkRatio >= 7.0,
    };
  }

  if (lightPass && !darkPass) {
    return {
      color: lightCandidate,
      ratio: lightRatio,
      passAA: lightRatio >= 4.5,
      passAAA: lightRatio >= 7.0,
    };
  }

  if (darkPass && lightPass) {
    // Both pass: pick the one with superior legibility
    const chosen = darkRatio >= lightRatio ? darkCandidate : lightCandidate;
    const ratio = Math.max(darkRatio, lightRatio);
    return {
      color: chosen,
      ratio,
      passAA: ratio >= 4.5,
      passAAA: ratio >= 7.0,
    };
  }

  // If neither reaches minRatio, test pure #000000 and #FFFFFF
  const blackRatio = calculateWcagRatio('#000000', bgHex);
  const whiteRatio = calculateWcagRatio('#FFFFFF', bgHex);
  const fallback = blackRatio >= whiteRatio ? '#000000' : '#FFFFFF';
  const bestRatio = Math.max(blackRatio, whiteRatio);

  return {
    color: fallback,
    ratio: bestRatio,
    passAA: bestRatio >= 4.5,
    passAAA: bestRatio >= 7.0,
  };
}

// ── 5. OKLCH Perceptual Contrast Adjustment (Rules 07, 08, 09) ──────

export interface OklchAdjustmentResult {
  originalHex: string;
  originalOklch: string;
  accessibleHex: string;
  accessibleOklch: string;
  ratio: number;
  adjusted: boolean;
  deltaL: number;
}

/**
 * Adjusts a color in OKLCH to satisfy targetRatio against bgHex.
 * PRESERVES HUE (H) exactly.
 * PRESERVES CHROMA (C) as high as physically possible.
 * ADJUSTS LIGHTNESS (L) first with minimal perceptual step.
 */
export function adjustColorForContrast(
  fgHex: string,
  bgHex: string,
  targetRatio: number = 4.5
): OklchAdjustmentResult {
  const initialRatio = calculateWcagRatio(fgHex, bgHex);
  const origOklch = hexToOklch(fgHex);
  const origOklchStr = oklchToCssString(origOklch.L, origOklch.C, origOklch.H);

  if (initialRatio >= targetRatio) {
    return {
      originalHex: fgHex,
      originalOklch: origOklchStr,
      accessibleHex: fgHex,
      accessibleOklch: origOklchStr,
      ratio: initialRatio,
      adjusted: false,
      deltaL: 0,
    };
  }

  const bgLum = getHexLuminance(bgHex);
  const preferLighter = bgLum < 0.35; // If bg is dark, lightening fg is generally more effective

  // Search candidate lightness levels in steps of 0.005
  let bestCandidate: { hex: string; L: number; C: number; ratio: number; diffL: number } | null = null;

  const testLightness = (targetL: number) => {
    if (targetL < 0.02 || targetL > 0.98) return;
    const fitted = fitOklchToSrgb(targetL, origOklch.C, origOklch.H);
    const candidateHex = rgbToHex(fitted.r, fitted.g, fitted.b);
    const r = calculateWcagRatio(candidateHex, bgHex);
    if (r >= targetRatio) {
      const diffL = Math.abs(targetL - origOklch.L);
      if (!bestCandidate || diffL < bestCandidate.diffL) {
        bestCandidate = { hex: candidateHex, L: targetL, C: fitted.C, ratio: r, diffL };
      }
    }
  };

  // 1. Search outward from current L in both directions, favoring the natural polarity
  const maxSteps = 160; // 0.005 * 160 = 0.8 range
  for (let i = 1; i <= maxSteps; i++) {
    const step = i * 0.005;
    if (preferLighter) {
      testLightness(origOklch.L + step);
      if (bestCandidate) break; // Found nearest lighter candidate
      testLightness(origOklch.L - step);
      if (bestCandidate) break;
    } else {
      testLightness(origOklch.L - step);
      if (bestCandidate) break; // Found nearest darker candidate
      testLightness(origOklch.L + step);
      if (bestCandidate) break;
    }
  }

  if (bestCandidate) {
    const candidate = bestCandidate as { hex: string; L: number; C: number; ratio: number; diffL: number };
    const newOklchStr = oklchToCssString(candidate.L, candidate.C, origOklch.H);
    return {
      originalHex: fgHex,
      originalOklch: origOklchStr,
      accessibleHex: candidate.hex,
      accessibleOklch: newOklchStr,
      ratio: candidate.ratio,
      adjusted: true,
      deltaL: candidate.diffL,
    };
  }

  // 2. If gamut limits at high chroma prevented meeting the threshold, gradually reduce chroma by 10% steps
  let reducedC = origOklch.C;
  for (let cStep = 1; cStep <= 8; cStep++) {
    reducedC *= 0.85;
    for (let i = 1; i <= maxSteps; i++) {
      const step = i * 0.005;
      const tL = preferLighter ? origOklch.L + step : origOklch.L - step;
      if (tL >= 0.02 && tL <= 0.98) {
        const fitted = fitOklchToSrgb(tL, reducedC, origOklch.H);
        const candidateHex = rgbToHex(fitted.r, fitted.g, fitted.b);
        const r = calculateWcagRatio(candidateHex, bgHex);
        if (r >= targetRatio) {
          return {
            originalHex: fgHex,
            originalOklch: origOklchStr,
            accessibleHex: candidateHex,
            accessibleOklch: oklchToCssString(tL, fitted.C, origOklch.H),
            ratio: r,
            adjusted: true,
            deltaL: Math.abs(tL - origOklch.L),
          };
        }
      }
    }
  }

  // Final guaranteed fallback: high contrast neutral respecting background
  const fallback = preferLighter ? '#F8F8F8' : '#171717';
  const fbRatio = calculateWcagRatio(fallback, bgHex);
  const fbOklch = hexToOklch(fallback);
  return {
    originalHex: fgHex,
    originalOklch: origOklchStr,
    accessibleHex: fallback,
    accessibleOklch: oklchToCssString(fbOklch.L, fbOklch.C, fbOklch.H),
    ratio: fbRatio,
    adjusted: true,
    deltaL: Math.abs(fbOklch.L - origOklch.L),
  };
}

// ── 6. Semantic Color Roles Model (Rules 01, 02) ────────────────────

export interface SemanticRolesModel {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  mutedText: string;
  button: string;
  buttonText: string;
  cardText: string;
  border: string;
}

export interface SemanticRelationshipCheck {
  id: string;
  label: string;
  fgRole: string;
  bgRole: string;
  fgHex: string;
  bgHex: string;
  rating: WcagRating;
  requiredRatio: number;
  isCompliant: boolean;
  suggestedFg?: string;
  suggestedOklch?: string;
  suggestedRatio?: number;
}

export interface BrandKitIntelligenceReport {
  originalRoles: SemanticRolesModel;
  accessibleRoles: SemanticRolesModel;
  checks: SemanticRelationshipCheck[];
  overallQuality: 'WCAG AAA READY' | 'WCAG AA READY' | 'WCAG AA NEEDS ADJUSTMENT';
  totalChecks: number;
  passingChecks: number;
  hasAdjustments: boolean;
  adjustedRolesCount: number;
}

/**
 * Builds a complete semantic audit report assessing every actual UI usage combination:
 * - BACKGROUND → PRIMARY TEXT
 * - BACKGROUND → SECONDARY / MUTED TEXT
 * - SURFACE → PRIMARY TEXT / CARD TEXT
 * - SURFACE → SECONDARY / MUTED TEXT
 * - PRIMARY (BUTTON) → BUTTON TEXT
 * - ACCENT → ACCENT TEXT / BADGE
 * - BORDER → BACKGROUND
 */
export function auditBrandKitIntelligence(
  rawRoles: Partial<SemanticRolesModel>
): BrandKitIntelligenceReport {
  // 1. Establish baseline original roles
  const background = rawRoles.background || '#0F1117';
  const surface = rawRoles.surface || '#1A1D27';
  const primary = rawRoles.primary || '#10288C';
  const secondary = rawRoles.secondary || '#5739E6';
  const accent = rawRoles.accent || '#E9C46A';

  // Smart foregrounds for baseline
  const defaultBodyText = rawRoles.text || getSmartForeground(background, 4.5).color;
  const defaultButtonText = rawRoles.buttonText || getSmartForeground(primary, 4.5).color;
  const defaultCardText = rawRoles.cardText || getSmartForeground(surface, 4.5).color;
  const defaultMutedText = rawRoles.mutedText || adjustColorForContrast(defaultBodyText, background, 4.5).accessibleHex;
  const defaultBorder = rawRoles.border || '#334155';

  const originalRoles: SemanticRolesModel = {
    background,
    surface,
    primary,
    secondary,
    accent,
    text: defaultBodyText,
    mutedText: defaultMutedText,
    button: primary,
    buttonText: defaultButtonText,
    cardText: defaultCardText,
    border: defaultBorder,
  };

  // 2. Perform WCAG 2.2 Checks on each semantic usage
  const checks: SemanticRelationshipCheck[] = [];

  // 2.1 Background → Body Text (Normal AA >= 4.5, AAA >= 7.0)
  const bodyCheckRating = evaluateWcagRating(originalRoles.text, originalRoles.background);
  const bodyAdjustment = adjustColorForContrast(originalRoles.text, originalRoles.background, 4.5);
  checks.push({
    id: 'bg-text',
    label: 'BACKGROUND → PRIMARY TEXT',
    fgRole: 'TEXT',
    bgRole: 'BACKGROUND',
    fgHex: originalRoles.text,
    bgHex: originalRoles.background,
    rating: bodyCheckRating,
    requiredRatio: 4.5,
    isCompliant: bodyCheckRating.normalTextAA,
    suggestedFg: bodyCheckRating.normalTextAA ? undefined : bodyAdjustment.accessibleHex,
    suggestedOklch: bodyCheckRating.normalTextAA ? undefined : bodyAdjustment.accessibleOklch,
    suggestedRatio: bodyCheckRating.normalTextAA ? undefined : bodyAdjustment.ratio,
  });

  // 2.2 Background → Muted Text (Must still meet >= 4.5:1 when conveying info, or >= 3.0:1 for large)
  const mutedCheckRating = evaluateWcagRating(originalRoles.mutedText, originalRoles.background);
  const mutedAdjustment = adjustColorForContrast(originalRoles.mutedText, originalRoles.background, 4.5);
  checks.push({
    id: 'bg-muted',
    label: 'BACKGROUND → SECONDARY / MUTED TEXT',
    fgRole: 'MUTED TEXT',
    bgRole: 'BACKGROUND',
    fgHex: originalRoles.mutedText,
    bgHex: originalRoles.background,
    rating: mutedCheckRating,
    requiredRatio: 4.5,
    isCompliant: mutedCheckRating.normalTextAA,
    suggestedFg: mutedCheckRating.normalTextAA ? undefined : mutedAdjustment.accessibleHex,
    suggestedOklch: mutedCheckRating.normalTextAA ? undefined : mutedAdjustment.accessibleOklch,
    suggestedRatio: mutedCheckRating.normalTextAA ? undefined : mutedAdjustment.ratio,
  });

  // 2.3 Surface → Card Body Text (Normal AA >= 4.5)
  const cardCheckRating = evaluateWcagRating(originalRoles.cardText, originalRoles.surface);
  const cardAdjustment = adjustColorForContrast(originalRoles.cardText, originalRoles.surface, 4.5);
  checks.push({
    id: 'surface-text',
    label: 'SURFACE → PRIMARY / CARD TEXT',
    fgRole: 'CARD TEXT',
    bgRole: 'SURFACE',
    fgHex: originalRoles.cardText,
    bgHex: originalRoles.surface,
    rating: cardCheckRating,
    requiredRatio: 4.5,
    isCompliant: cardCheckRating.normalTextAA,
    suggestedFg: cardCheckRating.normalTextAA ? undefined : cardAdjustment.accessibleHex,
    suggestedOklch: cardCheckRating.normalTextAA ? undefined : cardAdjustment.accessibleOklch,
    suggestedRatio: cardCheckRating.normalTextAA ? undefined : cardAdjustment.ratio,
  });

  // 2.4 Button Surface → Button Text (Normal AA >= 4.5)
  const btnCheckRating = evaluateWcagRating(originalRoles.buttonText, originalRoles.button);
  const smartBtnFg = getSmartForeground(originalRoles.button, 4.5);
  const btnAdjustment = adjustColorForContrast(smartBtnFg.color, originalRoles.button, 4.5);
  checks.push({
    id: 'button-text',
    label: 'PRIMARY (BUTTON) → BUTTON TEXT',
    fgRole: 'BUTTON TEXT',
    bgRole: 'BUTTON',
    fgHex: originalRoles.buttonText,
    bgHex: originalRoles.button,
    rating: btnCheckRating,
    requiredRatio: 4.5,
    isCompliant: btnCheckRating.normalTextAA,
    suggestedFg: btnCheckRating.normalTextAA ? undefined : btnAdjustment.accessibleHex,
    suggestedOklch: btnCheckRating.normalTextAA ? undefined : btnAdjustment.accessibleOklch,
    suggestedRatio: btnCheckRating.normalTextAA ? undefined : btnAdjustment.ratio,
  });

  // 2.5 Accent Surface → Accent Foreground (Badge / Tag legibility)
  const smartAccentFg = getSmartForeground(originalRoles.accent, 4.5);
  const accentCheckRating = evaluateWcagRating(smartAccentFg.color, originalRoles.accent);
  checks.push({
    id: 'accent-text',
    label: 'ACCENT → ACCENT TEXT / BADGE',
    fgRole: 'ACCENT TEXT',
    bgRole: 'ACCENT',
    fgHex: smartAccentFg.color,
    bgHex: originalRoles.accent,
    rating: accentCheckRating,
    requiredRatio: 4.5,
    isCompliant: accentCheckRating.normalTextAA,
    suggestedFg: accentCheckRating.normalTextAA ? undefined : smartAccentFg.color,
    suggestedRatio: accentCheckRating.normalTextAA ? undefined : smartAccentFg.ratio,
  });

  // 2.6 Border → Background (Non-text UI Component Boundary >= 3.0:1)
  const borderCheckRating = evaluateWcagRating(originalRoles.border, originalRoles.background);
  const borderAdjustment = adjustColorForContrast(originalRoles.border, originalRoles.background, 3.0);
  checks.push({
    id: 'border-bg',
    label: 'BORDER → BACKGROUND (UI BOUNDARY)',
    fgRole: 'BORDER',
    bgRole: 'BACKGROUND',
    fgHex: originalRoles.border,
    bgHex: originalRoles.background,
    rating: borderCheckRating,
    requiredRatio: 3.0,
    isCompliant: borderCheckRating.uiComponent,
    suggestedFg: borderCheckRating.uiComponent ? undefined : borderAdjustment.accessibleHex,
    suggestedOklch: borderCheckRating.uiComponent ? undefined : borderAdjustment.accessibleOklch,
    suggestedRatio: borderCheckRating.uiComponent ? undefined : borderAdjustment.ratio,
  });

  // 3. Compute Accessible Roles using OKLCH Minimal Perceptual Adjustments
  // Original colors remain completely untouched; accessibleRoles holds the contrast-safe UI variants
  const accessibleRoles: SemanticRolesModel = {
    background: originalRoles.background,
    surface: originalRoles.surface,
    primary: originalRoles.primary,
    secondary: originalRoles.secondary,
    accent: originalRoles.accent,
    text: bodyCheckRating.normalTextAA ? originalRoles.text : bodyAdjustment.accessibleHex,
    mutedText: mutedCheckRating.normalTextAA ? originalRoles.mutedText : mutedAdjustment.accessibleHex,
    button: originalRoles.button,
    buttonText: btnCheckRating.normalTextAA ? originalRoles.buttonText : btnAdjustment.accessibleHex,
    cardText: cardCheckRating.normalTextAA ? originalRoles.cardText : cardAdjustment.accessibleHex,
    border: borderCheckRating.uiComponent ? originalRoles.border : borderAdjustment.accessibleHex,
  };

  // If button contrast with ANY text is impossible at current button lightness, adjust button color via OKLCH
  if (calculateWcagRatio(accessibleRoles.buttonText, accessibleRoles.button) < 4.5) {
    const adjButton = adjustColorForContrast(accessibleRoles.button, accessibleRoles.buttonText, 4.5);
    accessibleRoles.button = adjButton.accessibleHex;
  }

  // 4. Overall Quality Status
  const totalChecks = checks.length;
  const passingChecks = checks.filter((c) => c.isCompliant).length;
  const allAAA = checks.every((c) => c.rating.normalTextAAA || c.rating.largeTextAAA);
  const allAA = checks.every((c) => c.isCompliant);

  let overallQuality: BrandKitIntelligenceReport['overallQuality'] = 'WCAG AA NEEDS ADJUSTMENT';
  if (allAAA) {
    overallQuality = 'WCAG AAA READY';
  } else if (allAA) {
    overallQuality = 'WCAG AA READY';
  }

  const adjustedRolesCount = Object.keys(originalRoles).filter(
    (k) => originalRoles[k as keyof SemanticRolesModel] !== accessibleRoles[k as keyof SemanticRolesModel]
  ).length;

  return {
    originalRoles,
    accessibleRoles,
    checks,
    overallQuality,
    totalChecks,
    passingChecks,
    hasAdjustments: adjustedRolesCount > 0,
    adjustedRolesCount,
  };
}

/**
 * Intelligent Preset Palette Mapper:
 * Understands semantic roles instead of blindly picking indices:
 * 1. Finds the most appropriate background/surface from the palette (or default high-contrast canvas)
 * 2. Assigns the strongest chromatic tone to Primary
 * 3. Assigns supporting chromatic tone to Secondary
 * 4. Assigns vibrant highlight to Accent
 * 5. Intelligently selects contrast-safe foregrounds and generates OKLCH accessible variants
 */
export function mapPaletteToSemanticRoles(colors: string[]): {
  original: SemanticRolesModel;
  accessible: SemanticRolesModel;
  quality: 'WCAG AAA READY' | 'WCAG AA READY' | 'WCAG AA NEEDS ADJUSTMENT';
} {
  if (!colors || colors.length === 0) {
    const base = auditBrandKitIntelligence({});
    return {
      original: base.originalRoles,
      accessible: base.accessibleRoles,
      quality: base.overallQuality,
    };
  }

  // Clean hexes
  const hexList = colors.map((c) => (c.startsWith('#') ? c.toUpperCase() : `#${c.toUpperCase()}`));

  // Analyze luminances of the palette colors
  const withLum = hexList.map((hex) => ({ hex, lum: getHexLuminance(hex), oklch: hexToOklch(hex) }));

  // Sort by luminance
  const sortedByLum = [...withLum].sort((a, b) => a.lum - b.lum);
  const darkest = sortedByLum[0];
  const lightest = sortedByLum[sortedByLum.length - 1];

  // Decide if this palette naturally fits dark or light background
  // If the lightest color is very light (lum > 0.7), it can be background if user has light theme,
  // or darkest (lum < 0.15) can be dark background.
  let background = '#0F1117';
  let surface = '#1A1D27';

  if (darkest.lum < 0.12) {
    background = darkest.hex;
    // Surface is slightly elevated dark tone
    const nextDark = sortedByLum.find((c) => c.lum > darkest.lum && c.lum < 0.3);
    surface = nextDark ? nextDark.hex : adjustColorForContrast('#FFFFFF', background, 1.25).accessibleHex;
  } else if (lightest.lum > 0.85) {
    background = lightest.hex;
    const nextLight = [...sortedByLum].reverse().find((c) => c.lum < lightest.lum && c.lum > 0.7);
    surface = nextLight ? nextLight.hex : '#FFFFFF';
  }

  // Chromatic colors for Primary, Secondary, Accent (highest chroma)
  const sortedByChroma = [...withLum]
    .filter((c) => c.hex !== background && c.hex !== surface)
    .sort((a, b) => b.oklch.C - a.oklch.C);

  const primary = sortedByChroma[0]?.hex || hexList[0] || '#10288C';
  const secondary = sortedByChroma[1]?.hex || hexList[1] || '#5739E6';
  const accent = sortedByChroma[2]?.hex || hexList[2] || '#E9C46A';

  // Smart foregrounds
  const smartBody = getSmartForeground(background, 4.5).color;
  const smartBtn = getSmartForeground(primary, 4.5).color;
  const smartCard = getSmartForeground(surface, 4.5).color;
  const smartMuted = adjustColorForContrast(smartBody, background, 4.5).accessibleHex;

  // Determine border: UI boundary contrast against background >= 3.0
  const borderCandidate = sortedByLum.find((c) => calculateWcagRatio(c.hex, background) >= 3.0)?.hex ||
    (getHexLuminance(background) < 0.5 ? '#334155' : '#E2E8F0');

  const report = auditBrandKitIntelligence({
    background,
    surface,
    primary,
    secondary,
    accent,
    text: smartBody,
    button: primary,
    buttonText: smartBtn,
    cardText: smartCard,
    mutedText: smartMuted,
    border: borderCandidate,
  });

  return {
    original: report.originalRoles,
    accessible: report.accessibleRoles,
    quality: report.overallQuality,
  };
}
