import { hexToHsl, hslToHex, hexToRgb, rgbToHex, getContrastRatio } from './colorUtils';

export interface ContrastSuggestion {
  type: 'modify-fg' | 'modify-bg';
  targetRatio: number;
  originalHex: string;
  suggestedHex: string;
  newRatio: number;
  direction: 'darken' | 'lighten';
  label: string;
}

// Find nearest color that achieves the target ratio by adjusting lightness in HSL space
export function findNearestPassingColor(
  fixedHex: string,
  adjustHex: string,
  targetRatio: number,
  type: 'modify-fg' | 'modify-bg'
): ContrastSuggestion | null {
  const hsl = hexToHsl(adjustHex);
  if (!hsl) return null;

  const currentRatio = getContrastRatio(fixedHex, adjustHex);
  if (currentRatio >= targetRatio) return null;

  const { h, s, l: initialL } = hsl;

  // Search downwards (darken)
  let bestDarkenHex: string | null = null;
  let bestDarkenRatio = 0;
  for (let l = initialL; l >= 0; l -= 1) {
    const testHex = hslToHex(h, s, l);
    const ratio = getContrastRatio(fixedHex, testHex);
    if (ratio >= targetRatio) {
      bestDarkenHex = testHex;
      bestDarkenRatio = ratio;
      break;
    }
  }

  // Search upwards (lighten)
  let bestLightenHex: string | null = null;
  let bestLightenRatio = 0;
  for (let l = initialL; l <= 100; l += 1) {
    const testHex = hslToHex(h, s, l);
    const ratio = getContrastRatio(fixedHex, testHex);
    if (ratio >= targetRatio) {
      bestLightenHex = testHex;
      bestLightenRatio = ratio;
      break;
    }
  }

  // Pick the one closest to initial lightness
  const darkenDist = bestDarkenHex ? Math.abs(initialL - (hexToHsl(bestDarkenHex)?.l || 0)) : Infinity;
  const lightenDist = bestLightenHex ? Math.abs((hexToHsl(bestLightenHex)?.l || 100) - initialL) : Infinity;

  if (bestDarkenHex && darkenDist <= lightenDist) {
    return {
      type,
      targetRatio,
      originalHex: adjustHex,
      suggestedHex: bestDarkenHex,
      newRatio: bestDarkenRatio,
      direction: 'darken',
      label: `Darken ${type === 'modify-fg' ? 'foreground' : 'background'} to reach ${targetRatio}:1`,
    };
  }

  if (bestLightenHex) {
    return {
      type,
      targetRatio,
      originalHex: adjustHex,
      suggestedHex: bestLightenHex,
      newRatio: bestLightenRatio,
      direction: 'lighten',
      label: `Lighten ${type === 'modify-fg' ? 'foreground' : 'background'} to reach ${targetRatio}:1`,
    };
  }

  return null;
}

export function getContrastSuggestions(fgHex: string, bgHex: string): ContrastSuggestion[] {
  const currentRatio = getContrastRatio(fgHex, bgHex);
  const targets = [4.5, 7.0];
  const suggestions: ContrastSuggestion[] = [];

  for (const target of targets) {
    if (currentRatio < target) {
      // Suggest modifying FG
      const fgSugg = findNearestPassingColor(bgHex, fgHex, target, 'modify-fg');
      if (fgSugg && !suggestions.some((s) => s.suggestedHex === fgSugg.suggestedHex)) {
        suggestions.push(fgSugg);
      }

      // Suggest modifying BG
      const bgSugg = findNearestPassingColor(fgHex, bgHex, target, 'modify-bg');
      if (bgSugg && !suggestions.some((s) => s.suggestedHex === bgSugg.suggestedHex)) {
        suggestions.push(bgSugg);
      }
    }
  }

  return suggestions;
}

// Color Vision Deficiency (CVD) Simulation matrices (Brettel/Meyer/Viénot algorithm)
export type CvdType = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

export function simulateCvd(hex: string, cvd: CvdType): string {
  if (cvd === 'normal') return hex;
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const { r, g, b } = rgb;

  // Linearize sRGB
  const toLinear = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };

  const toSrgb = (v: number) => {
    const c = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
    return Math.max(0, Math.min(255, Math.round(c * 255)));
  };

  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);

  let sr = lr;
  let sg = lg;
  let sb = lb;

  switch (cvd) {
    case 'protanopia': // Red-blind
      sr = 0.56667 * lr + 0.43333 * lg;
      sg = 0.55833 * lr + 0.44167 * lg;
      sb = 0.24167 * lg + 0.75833 * lb;
      break;
    case 'deuteranopia': // Green-blind
      sr = 0.625 * lr + 0.375 * lg;
      sg = 0.700 * lr + 0.300 * lg;
      sb = 0.300 * lg + 0.700 * lb;
      break;
    case 'tritanopia': // Blue-blind
      sr = 0.950 * lr + 0.050 * lg;
      sg = 0.43333 * lg + 0.56667 * lb;
      sb = 0.475 * lg + 0.525 * lb;
      break;
    case 'achromatopsia': // Total color blindness / Luminance
      {
        const lum = 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
        sr = lum;
        sg = lum;
        sb = lum;
      }
      break;
  }

  return rgbToHex(toSrgb(sr), toSrgb(sg), toSrgb(sb));
}
