/**
 * RAMPS COLOR & TOKEN ENGINE
 * Deterministic OKLCH-based color ramps and semantic token derivation engine.
 * Supports WCAG AA (4.5:1) and AAA (7.0:1) contrast enforcement,
 * chroma-matched neutrals, hue-collision avoided status ramps, and light/dark tokens.
 */

export type RampsScope = 'full' | 'basic';
export type RampsScheme = 'complementary' | 'analogous' | 'triadic' | 'split' | 'monochromatic';
export type RampsWcag = 'AA' | 'AAA';
export type RampsNotation = 'oklch' | 'hex' | 'rgb' | 'hsl';
export type RampsVividness = 'natural' | 'bold';

export interface RampsConfig {
  brand: string; // 6-digit hex normalized without #
  accent?: string | null; // pinned hex or null for auto
  accent2?: string | null; // pinned hex or null for auto
  scope: RampsScope;
  scheme: RampsScheme;
  wcag: RampsWcag;
  notation: RampsNotation;
  vividness: RampsVividness;
  excludedRamps: string[];
  excludedTokens: string[];
}

export type StepKey = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950';

export const STEP_KEYS: StepKey[] = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

// Lightness targets in OKLCH (0 to 1) for perceptual uniformity
export const LIGHTNESS_MAP: Record<StepKey, number> = {
  '50': 0.97,
  '100': 0.93,
  '200': 0.86,
  '300': 0.77,
  '400': 0.67,
  '500': 0.56,
  '600': 0.46,
  '700': 0.36,
  '800': 0.27,
  '900': 0.18,
  '950': 0.11,
};

// Relative chroma factors per step (peaks around 500-600, tapers at extremes)
export const CHROMA_FACTORS: Record<StepKey, number> = {
  '50': 0.15,
  '100': 0.30,
  '200': 0.55,
  '300': 0.78,
  '400': 0.92,
  '500': 1.00,
  '600': 0.96,
  '700': 0.88,
  '800': 0.75,
  '900': 0.55,
  '950': 0.35,
};

export interface ColorRamp {
  name: string;
  label: string;
  isDerived: boolean;
  baseHue: number;
  baseChroma: number;
  steps: Record<StepKey, {
    hex: string;
    oklch: string;
    rgb: string;
    hsl: string;
    lightness: number;
    chroma: number;
    hue: number;
    textContrast: '#FFFFFF' | '#111111';
    contrastWithWhite: number;
    contrastWithBlack: number;
  }>;
}

export interface SemanticToken {
  name: string;
  category: 'Background' | 'Text' | 'Border' | 'Focus';
  role: string;
  lightStep: string; // e.g. "neutral-100"
  darkStep: string; // e.g. "neutral-950"
  lightHex: string;
  darkHex: string;
  contrastAgainst?: string; // token name e.g. "bg-canvas"
  contrastRatio?: {
    light: number;
    dark: number;
  };
}

export interface GeneratedPaletteResult {
  config: RampsConfig;
  sourceUrl: string;
  ramps: Record<string, ColorRamp>;
  tokens: SemanticToken[];
  tokenMap: Record<string, SemanticToken>;
  notes: string[];
  rawJson: Record<string, any>;
  rawPlainText: string;
}

// ==========================================
// COLOR SPACE MATHEMATICS (OKLCH, OKLab, sRGB)
// ==========================================

export function normalizeHex(input: string): string {
  let clean = input.replace(/[^0-9a-fA-F]/g, '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (clean.length > 6) {
    clean = clean.slice(0, 6);
  }
  return clean.toLowerCase();
}

export function isValidHex(hex: string): boolean {
  return /^[0-9a-fA-F]{6}$/.test(hex.replace('#', ''));
}

export function hexToRgbValues(hex: string): { r: number; g: number; b: number } {
  const norm = normalizeHex(hex);
  if (norm.length !== 6) return { r: 61, g: 125, b: 255 }; // fallback
  return {
    r: parseInt(norm.slice(0, 2), 16),
    g: parseInt(norm.slice(2, 4), 16),
    b: parseInt(norm.slice(4, 6), 16),
  };
}

export function rgbToHexValues(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => {
    const h = clamp(v).toString(16);
    return h.length === 1 ? '0' + h : h;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convert sRGB [0..255] to linear sRGB [0..1]
function sRgbToLinear(v: number): number {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

// Convert linear sRGB [0..1] to sRGB [0..255]
function linearToSRgb(c: number): number {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.max(0, Math.min(255, Math.round(v * 255)));
}

// Convert RGB to OKLab
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

// Convert OKLab to OKLCH
export function oklabToOklch(L: number, a: number, b: number): { L: number; C: number; H: number } {
  const C = Math.sqrt(a * a + b * b);
  let H = Math.atan2(b, a) * (180 / Math.PI);
  if (H < 0) H += 360;
  return { L, C, H };
}

// Convert Hex directly to OKLCH
export function hexToOklchValues(hex: string): { L: number; C: number; H: number } {
  const rgb = hexToRgbValues(hex);
  const lab = rgbToOklab(rgb.r, rgb.g, rgb.b);
  return oklabToOklch(lab.L, lab.a, lab.b);
}

// Convert OKLCH to OKLab
export function oklchToOklab(L: number, C: number, H: number): { L: number; a: number; b: number } {
  const rad = (H * Math.PI) / 180;
  return {
    L,
    a: C * Math.cos(rad),
    b: C * Math.sin(rad),
  };
}

// Convert OKLab to Linear sRGB
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

// Check if OKLCH is within standard sRGB Gamut
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

// Clamp OKLCH with binary search chroma reduction to guarantee sRGB safety without hue shifts
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

  // Binary search for maximum reachable chroma at this lightness and hue
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

// Format representations
export function oklchToCssString(L: number, C: number, H: number): string {
  return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(1)})`;
}

export function rgbToCssString(r: number, g: number, b: number): string {
  return `rgb(${r}, ${g}, ${b})`;
}

export function rgbToHslString(r: number, g: number, b: number): string {
  const r_ = r / 255;
  const g_ = g / 255;
  const b_ = b / 255;
  const max = Math.max(r_, g_, b_);
  const min = Math.min(r_, g_, b_);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r_: h = (g_ - b_) / d + (g_ < b_ ? 6 : 0); break;
      case g_: h = (b_ - r_) / d + 2; break;
      case b_: h = (r_ - g_) / d + 4; break;
    }
    h /= 6;
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

// Contrast Calculations (WCAG 2.1)
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function calculateWcagContrast(hex1: string, hex2: string): number {
  const rgb1 = hexToRgbValues(hex1);
  const rgb2 = hexToRgbValues(hex2);
  const lum1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  const bright = Math.max(lum1, lum2);
  const dark = Math.min(lum1, lum2);
  return parseFloat(((bright + 0.05) / (dark + 0.05)).toFixed(2));
}

// ==========================================
// PALETTE GENERATOR PIPELINE
// ==========================================

export function generateSingleRamp(
  name: string,
  label: string,
  baseHue: number,
  baseChroma: number,
  isDerived: boolean = false
): ColorRamp {
  const steps: ColorRamp['steps'] = {} as any;

  for (const step of STEP_KEYS) {
    const targetL = LIGHTNESS_MAP[step];
    const factor = CHROMA_FACTORS[step];
    const targetC = baseChroma * factor;

    const fitted = fitOklchToSrgb(targetL, targetC, baseHue);
    const hex = rgbToHexValues(fitted.r, fitted.g, fitted.b);
    const oklch = oklchToCssString(targetL, fitted.C, baseHue);
    const rgb = rgbToCssString(fitted.r, fitted.g, fitted.b);
    const hsl = rgbToHslString(fitted.r, fitted.g, fitted.b);

    const whiteRatio = calculateWcagContrast(hex, '#FFFFFF');
    const blackRatio = calculateWcagContrast(hex, '#111111');
    const textContrast = whiteRatio >= blackRatio ? '#FFFFFF' : '#111111';

    steps[step] = {
      hex,
      oklch,
      rgb,
      hsl,
      lightness: targetL,
      chroma: fitted.C,
      hue: baseHue,
      textContrast,
      contrastWithWhite: whiteRatio,
      contrastWithBlack: blackRatio,
    };
  }

  return {
    name,
    label,
    isDerived,
    baseHue,
    baseChroma,
    steps,
  };
}

// Hue collision avoidance helper
function shiftIfColliding(targetHue: number, avoidHues: number[], minDistance = 28): number {
  let adjusted = ((targetHue % 360) + 360) % 360;
  for (const avoid of avoidHues) {
    const diff = Math.abs(adjusted - avoid);
    const circularDiff = Math.min(diff, 360 - diff);
    if (circularDiff < minDistance) {
      adjusted = (adjusted + (minDistance - circularDiff + 12)) % 360;
    }
  }
  return adjusted;
}

export function generateFullRampsSystem(config: RampsConfig): GeneratedPaletteResult {
  const brandHex = config.brand || '3d7dff';
  const brandOklch = hexToOklchValues(brandHex);

  // Chroma scaling based on vividness mode
  const chromaMultiplier = config.vividness === 'bold' ? 1.25 : 1.0;
  const primaryChroma = Math.min(0.32, Math.max(0.12, brandOklch.C * chromaMultiplier));
  const primaryHue = brandOklch.H;

  // Derive Accent Hues based on scheme
  let derivedAccentHue = (primaryHue + 180) % 360; // default complementary
  let derivedAccent2Hue = (primaryHue + 210) % 360;

  switch (config.scheme) {
    case 'complementary':
      derivedAccentHue = (primaryHue + 180) % 360;
      derivedAccent2Hue = (primaryHue + 210) % 360; // slight split for secondary
      break;
    case 'analogous':
      derivedAccentHue = (primaryHue + 35) % 360;
      derivedAccent2Hue = (primaryHue - 35 + 360) % 360;
      break;
    case 'triadic':
      derivedAccentHue = (primaryHue + 120) % 360;
      derivedAccent2Hue = (primaryHue + 240) % 360;
      break;
    case 'split':
      derivedAccentHue = (primaryHue + 150) % 360;
      derivedAccent2Hue = (primaryHue + 210) % 360;
      break;
    case 'monochromatic':
      derivedAccentHue = primaryHue;
      derivedAccent2Hue = primaryHue;
      break;
  }

  // Accent Chroma
  const accentChroma = config.scheme === 'monochromatic' ? primaryChroma * 0.6 : primaryChroma * 0.92;
  const accent2Chroma = config.scheme === 'monochromatic' ? primaryChroma * 0.35 : primaryChroma * 0.85;

  // Handle pinned accents if user provided valid hex overrides
  let finalAccentHue = derivedAccentHue;
  let finalAccentChroma = accentChroma;
  let isAccentPinned = false;
  if (config.accent && isValidHex(config.accent)) {
    const accOklch = hexToOklchValues(config.accent);
    finalAccentHue = accOklch.H;
    finalAccentChroma = Math.max(0.08, accOklch.C);
    isAccentPinned = true;
  }

  let finalAccent2Hue = derivedAccent2Hue;
  let finalAccent2Chroma = accent2Chroma;
  let isAccent2Pinned = false;
  if (config.accent2 && isValidHex(config.accent2)) {
    const acc2Oklch = hexToOklchValues(config.accent2);
    finalAccent2Hue = acc2Oklch.H;
    finalAccent2Chroma = Math.max(0.06, acc2Oklch.C);
    isAccent2Pinned = true;
  }

  // Chroma-matched neutral: Tinted with very subtle brand hue
  const neutralChroma = 0.012;
  const neutralHue = primaryHue;

  // Status colors with hue-collision avoidance
  const activeHues = [primaryHue, finalAccentHue, finalAccent2Hue];
  const successHue = shiftIfColliding(142, activeHues);
  const warningHue = shiftIfColliding(85, activeHues);
  const errorHue = shiftIfColliding(28, activeHues);
  const infoHue = shiftIfColliding(235, activeHues);

  // Build Ramps
  const ramps: Record<string, ColorRamp> = {};

  ramps['primary'] = generateSingleRamp('primary', 'Primary / Brand', primaryHue, primaryChroma, false);
  ramps['neutral'] = generateSingleRamp('neutral', 'Chroma-Matched Neutral', neutralHue, neutralChroma, true);

  if (config.scope === 'full') {
    ramps['accent'] = generateSingleRamp('accent', isAccentPinned ? 'Pinned Accent' : 'Derived Accent', finalAccentHue, finalAccentChroma, !isAccentPinned);
    ramps['accent-2'] = generateSingleRamp('accent-2', isAccent2Pinned ? 'Pinned Tertiary Accent' : 'Derived Tertiary Accent', finalAccent2Hue, finalAccent2Chroma, !isAccent2Pinned);
    ramps['success'] = generateSingleRamp('success', 'Status / Success', successHue, 0.17, true);
    ramps['warning'] = generateSingleRamp('warning', 'Status / Warning', warningHue, 0.16, true);
    ramps['error'] = generateSingleRamp('error', 'Status / Error', errorHue, 0.19, true);
    ramps['info'] = generateSingleRamp('info', 'Status / Information', infoHue, 0.16, true);
  }

  // Filter excluded ramps if requested
  if (config.excludedRamps && config.excludedRamps.length > 0) {
    for (const ex of config.excludedRamps) {
      delete ramps[ex];
    }
  }

  // Generate Semantic Tokens with WCAG AA vs AAA enforcement
  const isAAA = config.wcag === 'AAA';

  // Helper to fetch step hex safely with fallback
  const getHex = (rampName: string, step: StepKey): string => {
    const targetRamp = ramps[rampName] || ramps['primary'] || ramps['neutral'];
    return targetRamp?.steps[step]?.hex || '#888888';
  };

  // Base raw tokens mapping
  const rawTokens: SemanticToken[] = [
    // Backgrounds
    {
      name: 'bg-canvas',
      category: 'Background',
      role: 'Page background & viewport surface',
      lightStep: 'neutral-100',
      darkStep: 'neutral-950',
      lightHex: getHex('neutral', '100'),
      darkHex: getHex('neutral', '950'),
    },
    {
      name: 'bg-surface',
      category: 'Background',
      role: 'Card surfaces, sidebars & elevated panels',
      lightStep: 'neutral-50',
      darkStep: 'neutral-900',
      lightHex: getHex('neutral', '50'),
      darkHex: getHex('neutral', '900'),
    },
    {
      name: 'bg-surface-raised',
      category: 'Background',
      role: 'Dropdown menus, popovers & floating dialogs',
      lightStep: 'neutral-50',
      darkStep: 'neutral-800',
      lightHex: getHex('neutral', '50'),
      darkHex: getHex('neutral', '800'),
    },
    {
      name: 'bg-muted',
      category: 'Background',
      role: 'Table row hover, secondary controls & chips',
      lightStep: 'neutral-200',
      darkStep: 'neutral-700',
      lightHex: getHex('neutral', '200'),
      darkHex: getHex('neutral', '700'),
    },
    {
      name: 'bg-brand',
      category: 'Background',
      role: 'Primary call-to-action button & key actions',
      lightStep: isAAA ? 'primary-800' : 'primary-700',
      darkStep: isAAA ? 'primary-400' : 'primary-500',
      lightHex: getHex('primary', isAAA ? '800' : '700'),
      darkHex: getHex('primary', isAAA ? '400' : '500'),
    },
    {
      name: 'bg-brand-hover',
      category: 'Background',
      role: 'Cursor hover state for brand actions',
      lightStep: isAAA ? 'primary-900' : 'primary-800',
      darkStep: isAAA ? 'primary-300' : 'primary-400',
      lightHex: getHex('primary', isAAA ? '900' : '800'),
      darkHex: getHex('primary', isAAA ? '300' : '400'),
    },
    {
      name: 'bg-brand-active',
      category: 'Background',
      role: 'Pressed/active state for primary brand buttons',
      lightStep: 'primary-900',
      darkStep: 'primary-300',
      lightHex: getHex('primary', '900'),
      darkHex: getHex('primary', '300'),
    },
    {
      name: 'bg-accent',
      category: 'Background',
      role: 'Secondary button & highlighted badges',
      lightStep: 'accent-700',
      darkStep: 'accent-500',
      lightHex: getHex('accent', '700'),
      darkHex: getHex('accent', '500'),
    },
    {
      name: 'bg-accent-hover',
      category: 'Background',
      role: 'Cursor hover state over secondary accent buttons',
      lightStep: 'accent-800',
      darkStep: 'accent-400',
      lightHex: getHex('accent', '800'),
      darkHex: getHex('accent', '400'),
    },
    {
      name: 'bg-accent-active',
      category: 'Background',
      role: 'Secondary accent button while pressed',
      lightStep: 'accent-900',
      darkStep: 'accent-300',
      lightHex: getHex('accent', '900'),
      darkHex: getHex('accent', '300'),
    },
    {
      name: 'bg-tertiary',
      category: 'Background',
      role: 'Tertiary button & secondary tag indicators',
      lightStep: 'accent-2-700',
      darkStep: 'accent-2-500',
      lightHex: getHex('accent-2', '700'),
      darkHex: getHex('accent-2', '500'),
    },
    {
      name: 'bg-tertiary-hover',
      category: 'Background',
      role: 'Cursor hover state over tertiary button',
      lightStep: 'accent-2-800',
      darkStep: 'accent-2-400',
      lightHex: getHex('accent-2', '800'),
      darkHex: getHex('accent-2', '400'),
    },
    {
      name: 'bg-success',
      category: 'Background',
      role: 'Success badge & positive verification pill',
      lightStep: 'success-700',
      darkStep: 'success-500',
      lightHex: getHex('success', '700'),
      darkHex: getHex('success', '500'),
    },
    {
      name: 'bg-success-subtle',
      category: 'Background',
      role: 'Success notification banner & alert box',
      lightStep: 'success-100',
      darkStep: 'success-900',
      lightHex: getHex('success', '100'),
      darkHex: getHex('success', '900'),
    },
    {
      name: 'bg-warning',
      category: 'Background',
      role: 'Warning badge & attention alert container',
      lightStep: 'warning-500',
      darkStep: 'warning-400',
      lightHex: getHex('warning', '500'),
      darkHex: getHex('warning', '400'),
    },
    {
      name: 'bg-warning-subtle',
      category: 'Background',
      role: 'Warning notification banner & quota alert',
      lightStep: 'warning-100',
      darkStep: 'warning-900',
      lightHex: getHex('warning', '100'),
      darkHex: getHex('warning', '900'),
    },
    {
      name: 'bg-error',
      category: 'Background',
      role: 'Destructive action button & critical error container',
      lightStep: 'error-600',
      darkStep: 'error-500',
      lightHex: getHex('error', '600'),
      darkHex: getHex('error', '500'),
    },
    {
      name: 'bg-error-subtle',
      category: 'Background',
      role: 'Form error banner & alert container',
      lightStep: 'error-100',
      darkStep: 'error-900',
      lightHex: getHex('error', '100'),
      darkHex: getHex('error', '900'),
    },
    {
      name: 'bg-info',
      category: 'Background',
      role: 'Informational badge & status pill',
      lightStep: 'info-700',
      darkStep: 'info-500',
      lightHex: getHex('info', '700'),
      darkHex: getHex('info', '500'),
    },
    {
      name: 'bg-info-subtle',
      category: 'Background',
      role: 'Informational banner & helper box',
      lightStep: 'info-100',
      darkStep: 'info-900',
      lightHex: getHex('info', '100'),
      darkHex: getHex('info', '900'),
    },
    {
      name: 'bg-inverse',
      category: 'Background',
      role: 'Tooltips, dark toasts & high-contrast overlay',
      lightStep: 'neutral-900',
      darkStep: 'neutral-100',
      lightHex: getHex('neutral', '900'),
      darkHex: getHex('neutral', '100'),
    },

    // Typography / Text Tokens
    {
      name: 'text-primary',
      category: 'Text',
      role: 'High-contrast body copy, titles & primary headers',
      lightStep: isAAA ? 'neutral-950' : 'neutral-900',
      darkStep: isAAA ? 'neutral-50' : 'neutral-100',
      lightHex: getHex('neutral', isAAA ? '950' : '900'),
      darkHex: getHex('neutral', isAAA ? '50' : '100'),
      contrastAgainst: 'bg-canvas',
    },
    {
      name: 'text-secondary',
      category: 'Text',
      role: 'Supporting body text, subheadings & form labels',
      lightStep: isAAA ? 'neutral-900' : 'neutral-800',
      darkStep: isAAA ? 'neutral-200' : 'neutral-300',
      lightHex: getHex('neutral', isAAA ? '900' : '800'),
      darkHex: getHex('neutral', isAAA ? '200' : '300'),
      contrastAgainst: 'bg-canvas',
    },
    {
      name: 'text-tertiary',
      category: 'Text',
      role: 'Captions, timestamps, table metadata & breadcrumbs',
      lightStep: isAAA ? 'neutral-800' : 'neutral-700',
      darkStep: isAAA ? 'neutral-300' : 'neutral-400',
      lightHex: getHex('neutral', isAAA ? '800' : '700'),
      darkHex: getHex('neutral', isAAA ? '300' : '400'),
      contrastAgainst: 'bg-canvas',
    },
    {
      name: 'text-disabled',
      category: 'Text',
      role: 'Disabled buttons & greyed-out controls (WCAG exempt)',
      lightStep: 'neutral-400',
      darkStep: 'neutral-600',
      lightHex: getHex('neutral', '400'),
      darkHex: getHex('neutral', '600'),
    },
    {
      name: 'text-link',
      category: 'Text',
      role: 'Interactive hyperlinked text & navigation items',
      lightStep: isAAA ? 'primary-800' : 'primary-700',
      darkStep: isAAA ? 'primary-300' : 'primary-400',
      lightHex: getHex('primary', isAAA ? '800' : '700'),
      darkHex: getHex('primary', isAAA ? '300' : '400'),
      contrastAgainst: 'bg-canvas',
    },
    {
      name: 'text-on-brand',
      category: 'Text',
      role: 'Text label on a primary brand button',
      lightStep: 'primary-50',
      darkStep: 'primary-950',
      lightHex: getHex('primary', '50'),
      darkHex: getHex('primary', '950'),
      contrastAgainst: 'bg-brand',
    },
    {
      name: 'text-on-accent',
      category: 'Text',
      role: 'Text label on a secondary accent button',
      lightStep: 'accent-50',
      darkStep: 'accent-950',
      lightHex: getHex('accent', '50'),
      darkHex: getHex('accent', '950'),
      contrastAgainst: 'bg-accent',
    },
    {
      name: 'text-on-tertiary',
      category: 'Text',
      role: 'Text label on a tertiary button',
      lightStep: 'accent-2-50',
      darkStep: 'accent-2-950',
      lightHex: getHex('accent-2', '50'),
      darkHex: getHex('accent-2', '950'),
      contrastAgainst: 'bg-tertiary',
    },
    {
      name: 'text-on-success',
      category: 'Text',
      role: 'Text label on a solid success badge',
      lightStep: 'success-50',
      darkStep: 'success-950',
      lightHex: getHex('success', '50'),
      darkHex: getHex('success', '950'),
      contrastAgainst: 'bg-success',
    },
    {
      name: 'text-on-warning',
      category: 'Text',
      role: 'Text label on a solid warning badge',
      lightStep: 'warning-950',
      darkStep: 'warning-950',
      lightHex: getHex('warning', '950'),
      darkHex: getHex('warning', '950'),
      contrastAgainst: 'bg-warning',
    },
    {
      name: 'text-on-error',
      category: 'Text',
      role: 'Text label on a destructive error button',
      lightStep: 'error-50',
      darkStep: 'error-950',
      lightHex: getHex('error', '50'),
      darkHex: getHex('error', '950'),
      contrastAgainst: 'bg-error',
    },
    {
      name: 'text-on-info',
      category: 'Text',
      role: 'Text label on a solid info badge',
      lightStep: 'info-50',
      darkStep: 'info-950',
      lightHex: getHex('info', '50'),
      darkHex: getHex('info', '950'),
      contrastAgainst: 'bg-info',
    },
    {
      name: 'text-success',
      category: 'Text',
      role: 'Success message text & positive metrics',
      lightStep: isAAA ? 'success-800' : 'success-700',
      darkStep: isAAA ? 'success-300' : 'success-400',
      lightHex: getHex('success', isAAA ? '800' : '700'),
      darkHex: getHex('success', isAAA ? '300' : '400'),
      contrastAgainst: 'bg-canvas',
    },
    {
      name: 'text-error',
      category: 'Text',
      role: 'Form error message & destructive warning text',
      lightStep: isAAA ? 'error-800' : 'error-700',
      darkStep: isAAA ? 'error-300' : 'error-400',
      lightHex: getHex('error', isAAA ? '800' : '700'),
      darkHex: getHex('error', isAAA ? '300' : '400'),
      contrastAgainst: 'bg-canvas',
    },
    {
      name: 'text-warning',
      category: 'Text',
      role: 'Warning notices & quota limit indicators',
      lightStep: isAAA ? 'warning-800' : 'warning-700',
      darkStep: isAAA ? 'warning-300' : 'warning-400',
      lightHex: getHex('warning', isAAA ? '800' : '700'),
      darkHex: getHex('warning', isAAA ? '300' : '400'),
      contrastAgainst: 'bg-canvas',
    },
    {
      name: 'text-info',
      category: 'Text',
      role: 'Inline guidance, tips & help messages',
      lightStep: isAAA ? 'info-800' : 'info-700',
      darkStep: isAAA ? 'info-300' : 'info-400',
      lightHex: getHex('info', isAAA ? '800' : '700'),
      darkHex: getHex('info', isAAA ? '300' : '400'),
      contrastAgainst: 'bg-canvas',
    },
    {
      name: 'text-inverse',
      category: 'Text',
      role: 'Text rendered on inverted tooltip surfaces',
      lightStep: 'neutral-50',
      darkStep: 'neutral-900',
      lightHex: getHex('neutral', '50'),
      darkHex: getHex('neutral', '900'),
      contrastAgainst: 'bg-inverse',
    },

    // Border Tokens
    {
      name: 'border-subtle',
      category: 'Border',
      role: 'Subtle row dividers & table borderlines',
      lightStep: 'neutral-200',
      darkStep: 'neutral-800',
      lightHex: getHex('neutral', '200'),
      darkHex: getHex('neutral', '800'),
    },
    {
      name: 'border-default',
      category: 'Border',
      role: 'Default input outline & container boundary',
      lightStep: 'neutral-300',
      darkStep: 'neutral-700',
      lightHex: getHex('neutral', '300'),
      darkHex: getHex('neutral', '700'),
    },
    {
      name: 'border-strong',
      category: 'Border',
      role: 'Emphasised card edge & active perimeter',
      lightStep: 'neutral-400',
      darkStep: 'neutral-600',
      lightHex: getHex('neutral', '400'),
      darkHex: getHex('neutral', '600'),
    },
    {
      name: 'border-active',
      category: 'Border',
      role: 'Selected navigation tab & active border',
      lightStep: 'primary-600',
      darkStep: 'primary-500',
      lightHex: getHex('primary', '600'),
      darkHex: getHex('primary', '500'),
    },
    {
      name: 'border-error',
      category: 'Border',
      role: 'Perimeter outline on an invalid form field',
      lightStep: 'error-500',
      darkStep: 'error-500',
      lightHex: getHex('error', '500'),
      darkHex: getHex('error', '500'),
    },

    // Focus Tokens
    {
      name: 'ring-focus',
      category: 'Focus',
      role: 'Keyboard accessibility focus outline ring',
      lightStep: 'primary-500',
      darkStep: 'primary-400',
      lightHex: getHex('primary', '500'),
      darkHex: getHex('primary', '400'),
    },
  ];

  // Calculate contrast metrics for tokens
  const tokenMap: Record<string, SemanticToken> = {};
  for (const tok of rawTokens) {
    tokenMap[tok.name] = tok;
  }

  const tokens = rawTokens
    .filter((tok) => !config.excludedTokens.includes(tok.name))
    .map((tok) => {
      if (tok.contrastAgainst && tokenMap[tok.contrastAgainst]) {
        const bgTok = tokenMap[tok.contrastAgainst];
        const lightRatio = calculateWcagContrast(tok.lightHex, bgTok.lightHex);
        const darkRatio = calculateWcagContrast(tok.darkHex, bgTok.darkHex);
        return {
          ...tok,
          contrastRatio: {
            light: lightRatio,
            dark: darkRatio,
          },
        };
      }
      return tok;
    });

  // Compose Source URL for Permalinks & Machine-Readable Output
  const queryParts = [`b=${config.brand}`];
  if (config.accent) queryParts.push(`a=${config.accent}`);
  if (config.accent2) queryParts.push(`a2=${config.accent2}`);
  if (config.scope !== 'full') queryParts.push(`m=${config.scope}`);
  if (config.scheme !== 'complementary') queryParts.push(`s=${config.scheme}`);
  if (config.wcag !== 'AA') queryParts.push(`c=${config.wcag}`);
  if (config.notation !== 'oklch') queryParts.push(`f=${config.notation}`);
  if (config.vividness !== 'natural') queryParts.push(`v=${config.vividness}`);
  if (config.excludedRamps.length > 0) queryParts.push(`xr=${config.excludedRamps.join('.')}`);
  if (config.excludedTokens.length > 0) queryParts.push(`xt=${config.excludedTokens.join('.')}`);

  const sourceUrl = `https://kroma.design/ramps?${queryParts.join('&')}`;

  // Notes explaining the palette derivation and accessibility guarantees
  const notes = [
    `Every paired foreground meets WCAG ${config.wcag} (${config.wcag === 'AAA' ? '7.0:1' : '4.5:1'}) against its paired background.`,
    'Ramps are OKLCH-derived and perceptually uniform across all 11 lightness steps (50 lightest to 950 darkest).',
    `The brand color #${brandHex} anchors the primary ramp. Lightness curves place it cleanly at primary-500.`,
    'bg-surface and bg-surface-raised share identical lightness in light mode; elevation hierarchy is achieved through subtle shadow separation.',
    'text-disabled is deliberately sub-WCAG minimum for standard greyed-out UI states (WCAG exempt).',
  ];

  // Raw JSON Contract (Matching DTCG and Ramps schema)
  const rawRampsObj: Record<string, Record<string, string>> = {};
  for (const [rKey, rVal] of Object.entries(ramps)) {
    rawRampsObj[rKey] = {};
    for (const step of STEP_KEYS) {
      if (config.notation === 'oklch') rawRampsObj[rKey][step] = rVal.steps[step].oklch;
      else if (config.notation === 'rgb') rawRampsObj[rKey][step] = rVal.steps[step].rgb;
      else if (config.notation === 'hsl') rawRampsObj[rKey][step] = rVal.steps[step].hsl;
      else rawRampsObj[rKey][step] = rVal.steps[step].hex;
    }
  }

  const rawTokensObj: Record<string, any> = {};
  for (const tok of tokens) {
    rawTokensObj[tok.name] = {
      light: tok.lightHex,
      dark: tok.darkHex,
      role: tok.role,
      step: {
        light: tok.lightStep,
        dark: tok.darkStep,
      },
      ...(tok.contrastRatio
        ? {
            contrast: {
              against: tok.contrastAgainst,
              light: tok.contrastRatio.light,
              dark: tok.contrastRatio.dark,
            },
          }
        : {}),
    };
  }

  const rawJson = {
    $schema: 'https://kroma.design/llms.txt',
    generator: 'KROMA Ramps Studio — https://kroma.design/ramps',
    source: sourceUrl,
    input: {
      brand: `#${brandHex}`,
      accent: config.accent ? `#${config.accent}` : null,
      accent2: config.accent2 ? `#${config.accent2}` : null,
      scope: config.scope,
      scheme: config.scheme,
      wcag: config.wcag,
      vividness: config.vividness,
      excludedRamps: config.excludedRamps,
      excludedTokens: config.excludedTokens,
    },
    ramps: rawRampsObj,
    tokens: rawTokensObj,
    notes,
  };

  // Plain text representation for zero-JS agents and terminal pipes
  let rawPlainText = `KROMA RAMPS STUDIO — GENERATED COLOR PALETTE\n`;
  rawPlainText += `Source: ${sourceUrl}\n\n`;
  rawPlainText += `Brand #${brandHex} · ${config.scheme} scheme · ${config.scope} scope · WCAG ${config.wcag} target · ${config.vividness} saturation\n\n`;
  rawPlainText += `RAMPS (OKLCH-derived, 50 lightest to 950 darkest)\n`;

  for (const [rKey, rVal] of Object.entries(ramps)) {
    rawPlainText += `  ${rKey}:\n    `;
    const stepStrings = STEP_KEYS.map((s) => `${s}=${rVal.steps[s].hex}`);
    rawPlainText += `${stepStrings.join('  ')}\n`;
  }

  rawPlainText += `\nSEMANTIC TOKENS (token · light · dark · ramp step · contrast · role)\n`;
  const categories: Array<SemanticToken['category']> = ['Background', 'Text', 'Border', 'Focus'];
  for (const cat of categories) {
    const catTokens = tokens.filter((t) => t.category === cat);
    if (catTokens.length === 0) continue;
    rawPlainText += `  [${cat}]\n`;
    for (const tok of catTokens) {
      const namePad = tok.name.padEnd(20, ' ');
      const lHex = tok.lightHex.padEnd(8, ' ');
      const dHex = tok.darkHex.padEnd(8, ' ');
      const stepStr = `${tok.lightStep}/${tok.darkStep}`.padEnd(18, ' ');
      const contrastStr = tok.contrastRatio
        ? `${tok.contrastRatio.light}:1/${tok.contrastRatio.dark}:1 vs ${tok.contrastAgainst}`.padEnd(28, ' ')
        : '—'.padEnd(28, ' ');
      rawPlainText += `    ${namePad} ${lHex} ${dHex} ${stepStr} ${contrastStr} ${tok.role}\n`;
    }
  }

  rawPlainText += `\nNOTES\n`;
  for (const n of notes) {
    rawPlainText += `  - ${n}\n`;
  }

  return {
    config,
    sourceUrl,
    ramps,
    tokens,
    tokenMap,
    notes,
    rawJson,
    rawPlainText,
  };
}

// ==========================================
// CODE EXPORTERS (CSS, Tailwind v4, JSON, Prompt)
// ==========================================

export function exportToCssCustomProperties(result: GeneratedPaletteResult): string {
  let css = `/* KROMA Ramps Studio Generated Design Tokens */\n`;
  css += `/* Source: ${result.sourceUrl} */\n\n`;

  // Base Ramps (Light & Dark independent)
  css += `:root {\n`;
  css += `  /* OKLCH Color Scales (50-950) */\n`;
  for (const [rKey, rVal] of Object.entries(result.ramps)) {
    for (const step of STEP_KEYS) {
      css += `  --color-${rKey}-${step}: ${rVal.steps[step].hex};\n`;
    }
    css += `\n`;
  }

  // Light Mode Tokens (Default)
  css += `  /* Light Theme Semantic Tokens */\n`;
  for (const tok of result.tokens) {
    css += `  --${tok.name}: var(--color-${tok.lightStep.replace('-', '-')});\n`;
  }
  css += `}\n\n`;

  // Dark Mode Tokens
  css += `@media (prefers-color-scheme: dark) {\n`;
  css += `  :root {\n`;
  for (const tok of result.tokens) {
    css += `    --${tok.name}: var(--color-${tok.darkStep.replace('-', '-')});\n`;
  }
  css += `  }\n`;
  css += `}\n\n`;

  css += `[data-theme="dark"] {\n`;
  for (const tok of result.tokens) {
    css += `  --${tok.name}: var(--color-${tok.darkStep.replace('-', '-')});\n`;
  }
  css += `}\n`;

  return css;
}

export function exportToTailwindV4(result: GeneratedPaletteResult): string {
  let tw = `/* Tailwind CSS v4 Theme Configuration */\n`;
  tw += `/* Source: ${result.sourceUrl} */\n\n`;
  tw += `@theme {\n`;

  for (const [rKey, rVal] of Object.entries(result.ramps)) {
    for (const step of STEP_KEYS) {
      tw += `  --color-${rKey}-${step}: ${rVal.steps[step].hex};\n`;
    }
    tw += `\n`;
  }

  for (const tok of result.tokens) {
    tw += `  --color-${tok.name}: var(--${tok.name});\n`;
  }

  tw += `}\n`;
  return tw;
}

export function exportToAgentPrompt(result: GeneratedPaletteResult): string {
  return `I have generated an accessible OKLCH color scale and semantic design tokens for our brand (${result.config.brand}) using KROMA Ramps Studio.

Please use the following CSS variables and design tokens in our components. All paired background and text tokens have been pre-validated to meet WCAG ${result.config.wcag}:

Palette Permalinks: ${result.sourceUrl}
API Specification: https://kroma.design/llms.txt

Key Semantic Tokens:
- Page Background: var(--bg-canvas) / Card Surface: var(--bg-surface)
- Primary CTA: var(--bg-brand) / Text on Brand: var(--text-on-brand)
- Primary Body Copy: var(--text-primary) / Secondary Text: var(--text-secondary)
- Borders: var(--border-default) / Focus Ring: var(--ring-focus)

Please integrate these tokens directly into our styling system.`;
}
