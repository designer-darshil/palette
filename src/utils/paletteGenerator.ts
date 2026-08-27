import { CURATED_COLORS } from '../data/colors';
import { hexToHsl, hslToHex, hexToRgb } from './colorUtils';

export type HarmonyMode =
  | 'curated'
  | 'analogous'
  | 'complementary'
  | 'triadic'
  | 'splitComplementary'
  | 'monochromatic';

export interface GeneratorColor {
  id: string;
  hex: string;
  name: string;
  locked: boolean;
}

// Find closest editorial color name from our curated database
export function findClosestColorName(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return 'Specimen Color';

  let minDistance = Infinity;
  let closestName = 'Editorial Tone';

  for (const c of CURATED_COLORS) {
    const cRgb = hexToRgb(c.hex);
    if (!cRgb) continue;

    // Euclidean distance in RGB color space
    const d = Math.sqrt(
      Math.pow(rgb.r - cRgb.r, 2) +
      Math.pow(rgb.g - cRgb.g, 2) +
      Math.pow(rgb.b - cRgb.b, 2)
    );

    if (d < minDistance) {
      minDistance = d;
      closestName = c.name;
    }
  }

  return closestName;
}

// Generate single harmonic color based on anchor and role
function generateColorFromSeed(
  baseHue: number,
  mode: HarmonyMode,
  index: number,
  total: number
): string {
  let hue = baseHue;
  let sat = Math.floor(45 + Math.random() * 45); // 45% - 90%
  let light = Math.floor(20 + Math.random() * 65); // 20% - 85%

  // Balance slot roles (dark background, dominant, accent, light surface)
  if (index === 0) {
    // Deep anchor / canvas tone
    light = Math.floor(10 + Math.random() * 16);
    sat = Math.floor(20 + Math.random() * 40);
  } else if (index === total - 1) {
    // High-light surface / parchment
    light = Math.floor(88 + Math.random() * 8);
    sat = Math.floor(10 + Math.random() * 25);
  } else if (index === 1) {
    // Primary dominant
    light = Math.floor(40 + Math.random() * 25);
    sat = Math.floor(60 + Math.random() * 35);
  } else if (index === 2) {
    // Accent punch
    light = Math.floor(50 + Math.random() * 30);
    sat = Math.floor(70 + Math.random() * 30);
  }

  switch (mode) {
    case 'analogous': {
      const offset = (index - 1) * 28 + (Math.random() * 12 - 6);
      hue = (baseHue + offset + 360) % 360;
      break;
    }
    case 'complementary': {
      if (index % 2 === 1) {
        hue = (baseHue + 180 + (Math.random() * 20 - 10) + 360) % 360;
      } else {
        hue = (baseHue + (Math.random() * 20 - 10) + 360) % 360;
      }
      break;
    }
    case 'triadic': {
      const step = index % 3;
      hue = (baseHue + step * 120 + (Math.random() * 16 - 8) + 360) % 360;
      break;
    }
    case 'splitComplementary': {
      if (index === 0 || index === 1) {
        hue = (baseHue + (Math.random() * 14 - 7) + 360) % 360;
      } else if (index === 2) {
        hue = (baseHue + 150 + (Math.random() * 14 - 7) + 360) % 360;
      } else {
        hue = (baseHue + 210 + (Math.random() * 14 - 7) + 360) % 360;
      }
      break;
    }
    case 'monochromatic': {
      hue = baseHue;
      // Step luminance linearly
      const stepL = 12 + (index / (total - 1)) * 78;
      light = Math.round(stepL);
      sat = Math.max(25, sat - index * 6);
      break;
    }
    case 'curated':
    default: {
      // Curated editorial golden-ratio hue distribution
      const goldenAngle = 137.5;
      hue = (baseHue + index * goldenAngle + (Math.random() * 30 - 15) + 360) % 360;
      break;
    }
  }

  return hslToHex(hue, sat, light);
}

export function generatePalette(
  count: number,
  existingColors: GeneratorColor[],
  harmony: HarmonyMode = 'curated',
  baseSeedHex?: string
): GeneratorColor[] {
  // Determine anchor hue
  let seedHue = Math.floor(Math.random() * 360);

  if (baseSeedHex) {
    const hsl = hexToHsl(baseSeedHex);
    if (hsl) seedHue = hsl.h;
  } else {
    // If there is any locked color, use first locked color as hue anchor
    const firstLocked = existingColors.find((c) => c.locked);
    if (firstLocked) {
      const hsl = hexToHsl(firstLocked.hex);
      if (hsl) seedHue = hsl.h;
    }
  }

  const result: GeneratorColor[] = [];

  for (let i = 0; i < count; i++) {
    const existing = existingColors[i];

    if (existing && existing.locked) {
      result.push(existing);
    } else {
      const hex = generateColorFromSeed(seedHue, harmony, i, count);
      const name = findClosestColorName(hex);
      result.push({
        id: existing?.id || `gen-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        hex,
        name,
        locked: false,
      });
    }
  }

  return result;
}

// Quick export formats
export function formatPaletteExport(colors: GeneratorColor[], format: 'hex' | 'css' | 'tailwind' | 'json'): string {
  switch (format) {
    case 'hex':
      return colors.map((c) => c.hex).join('\n');
    case 'css':
      return `:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c.hex}; /* ${c.name} */`).join('\n')}\n}`;
    case 'tailwind':
      return `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${colors.map((c, i) => `        'palette-${i + 1}': '${c.hex}', // ${c.name}`).join('\n')}\n      }\n    }\n  }\n}`;
    case 'json':
      return JSON.stringify(
        colors.map((c, i) => ({
          step: i + 1,
          hex: c.hex,
          name: c.name,
        })),
        null,
        2
      );
  }
}
