import { PaletteItem } from '../types';
import { CURATED_PALETTES } from '../data/palettes';
import { getContrastRatio, getColorAccessibility, ColorAccessibilityAssessment, hexToHsl, hslToHex } from './colorUtils';

export interface SwatchValidationResult {
  hex: string;
  name: string;
  role?: string;
  paletteId: string;
  paletteSlug: string;
  paletteTitle: string;
  accessibility: ColorAccessibilityAssessment;
  replacementSuggestion?: string | null;
}

export interface PaletteValidationSummary {
  totalPalettes: number;
  totalSwatches: number;
  uniqueColors: number;
  aaPassCount: number;
  aaFailCount: number;
  aaaCapableCount: number;
  aaOnlyCount: number;
  aaFailures: SwatchValidationResult[];
  allPalettesPassAA: boolean;
}

/**
 * Finds the nearest accessible replacement color for a failing hex by
 * adjusting lightness in HSL space while strictly preserving hue and saturation.
 * Evaluates both darkening and lightening candidates and picks the one with
 * minimal lightness delta that achieves >= targetRatio:1.
 */
export function findAccessibleColorReplacement(
  hex: string,
  targetRatio: number = 4.5
): {
  originalHex: string;
  replacementHex: string;
  bestTextColor: '#FFFFFF' | '#000000';
  achievedContrast: number;
  lightnessDelta: number;
  direction: 'darken' | 'lighten';
} | null {
  const hsl = hexToHsl(hex);
  if (!hsl) return null;

  const { h, s, l: initialL } = hsl;

  // Option A: Darken while preserving hue & saturation
  let bestDarkenHex: string | null = null;
  let bestDarkenRatio = 0;
  let bestDarkenL = initialL;
  for (let l = initialL; l >= 0; l -= 1) {
    const testHex = hslToHex(h, s, l);
    const whiteRatio = getContrastRatio(testHex, '#FFFFFF');
    const blackRatio = getContrastRatio(testHex, '#000000');
    const maxRatio = Math.max(whiteRatio, blackRatio);
    if (maxRatio >= targetRatio) {
      bestDarkenHex = testHex;
      bestDarkenRatio = maxRatio;
      bestDarkenL = l;
      break;
    }
  }

  // Option B: Lighten while preserving hue & saturation
  let bestLightenHex: string | null = null;
  let bestLightenRatio = 0;
  let bestLightenL = initialL;
  for (let l = initialL; l <= 100; l += 1) {
    const testHex = hslToHex(h, s, l);
    const whiteRatio = getContrastRatio(testHex, '#FFFFFF');
    const blackRatio = getContrastRatio(testHex, '#000000');
    const maxRatio = Math.max(whiteRatio, blackRatio);
    if (maxRatio >= targetRatio) {
      bestLightenHex = testHex;
      bestLightenRatio = maxRatio;
      bestLightenL = l;
      break;
    }
  }

  const darkenDist = bestDarkenHex ? Math.abs(initialL - bestDarkenL) : Infinity;
  const lightenDist = bestLightenHex ? Math.abs(bestLightenL - initialL) : Infinity;

  if (bestDarkenHex && darkenDist <= lightenDist) {
    const blackRatio = getContrastRatio(bestDarkenHex, '#000000');
    const whiteRatio = getContrastRatio(bestDarkenHex, '#FFFFFF');
    return {
      originalHex: hex,
      replacementHex: bestDarkenHex,
      bestTextColor: blackRatio >= whiteRatio ? '#000000' : '#FFFFFF',
      achievedContrast: bestDarkenRatio,
      lightnessDelta: darkenDist,
      direction: 'darken',
    };
  }

  if (bestLightenHex) {
    const blackRatio = getContrastRatio(bestLightenHex, '#000000');
    const whiteRatio = getContrastRatio(bestLightenHex, '#FFFFFF');
    return {
      originalHex: hex,
      replacementHex: bestLightenHex,
      bestTextColor: blackRatio >= whiteRatio ? '#000000' : '#FFFFFF',
      achievedContrast: bestLightenRatio,
      lightnessDelta: lightenDist,
      direction: 'lighten',
    };
  }

  return null;
}

/**
 * Validates a single palette against WCAG AA/AAA standards.
 */
export function validatePalette(palette: PaletteItem): {
  palette: PaletteItem;
  swatches: SwatchValidationResult[];
  allPassAA: boolean;
  allPassAAA: boolean;
  minContrast: number;
  maxContrast: number;
  averageContrast: number;
} {
  const swatches: SwatchValidationResult[] = palette.colors.map((c) => {
    const accessibility = getColorAccessibility(c.hex);
    let replacementSuggestion: string | null = null;
    if (!accessibility.passAANormal) {
      const rep = findAccessibleColorReplacement(c.hex, 4.5);
      replacementSuggestion = rep ? rep.replacementHex : null;
    }

    return {
      hex: c.hex,
      name: c.name,
      role: c.role,
      paletteId: palette.id,
      paletteSlug: palette.slug,
      paletteTitle: palette.title,
      accessibility,
      replacementSuggestion,
    };
  });

  const contrasts = swatches.map((s) => s.accessibility.bestContrast);
  const minContrast = contrasts.length > 0 ? Math.min(...contrasts) : 0;
  const maxContrast = contrasts.length > 0 ? Math.max(...contrasts) : 0;
  const sum = contrasts.reduce((a, b) => a + b, 0);
  const averageContrast = contrasts.length > 0 ? parseFloat((sum / contrasts.length).toFixed(2)) : 0;

  return {
    palette,
    swatches,
    allPassAA: swatches.every((s) => s.accessibility.passAANormal),
    allPassAAA: swatches.every((s) => s.accessibility.passAAA),
    minContrast,
    maxContrast,
    averageContrast,
  };
}

/**
 * Audits the complete palette dataset (all 1,210 curated palettes and swatches).
 */
export function validateAllPalettes(
  palettes: PaletteItem[] = CURATED_PALETTES
): PaletteValidationSummary {
  let totalSwatches = 0;
  const uniqueColorMap = new Map<string, ColorAccessibilityAssessment>();
  const aaFailures: SwatchValidationResult[] = [];
  let aaaCapableCount = 0;
  let aaOnlyCount = 0;

  for (const palette of palettes) {
    for (const color of palette.colors) {
      totalSwatches++;
      const cleanHex = color.hex.toUpperCase();

      if (!uniqueColorMap.has(cleanHex)) {
        const assessment = getColorAccessibility(cleanHex);
        uniqueColorMap.set(cleanHex, assessment);

        if (assessment.passAAA) {
          aaaCapableCount++;
        } else if (assessment.passAANormal) {
          aaOnlyCount++;
        }
      }

      const assessment = uniqueColorMap.get(cleanHex)!;
      if (!assessment.passAANormal) {
        const rep = findAccessibleColorReplacement(cleanHex, 4.5);
        aaFailures.push({
          hex: color.hex,
          name: color.name,
          role: color.role,
          paletteId: palette.id,
          paletteSlug: palette.slug,
          paletteTitle: palette.title,
          accessibility: assessment,
          replacementSuggestion: rep ? rep.replacementHex : null,
        });
      }
    }
  }

  const uniqueColors = uniqueColorMap.size;
  const aaPassCount = uniqueColors - aaFailures.length;

  return {
    totalPalettes: palettes.length,
    totalSwatches,
    uniqueColors,
    aaPassCount,
    aaFailCount: aaFailures.length,
    aaaCapableCount,
    aaOnlyCount,
    aaFailures,
    allPalettesPassAA: aaFailures.length === 0,
  };
}
