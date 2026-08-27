import { PaletteItem, ComboItem, ColorItem, GradientItem } from '../types';
import { findClosestColorName } from './paletteGenerator';
import {
  hexToRgb,
  hexToHsl,
  hexToOklch,
  hslToHex,
  getContrastRatio,
  getTextColorForBackground,
  calculateHarmonies,
} from './colorUtils';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Generate canonical stable slug for any palette
export function createPaletteSlug(title: string, colors: { hex: string }[]): string {
  const baseSlug = slugify(title);
  const colorHash = colors.map((c) => c.hex.replace('#', '').toLowerCase()).join('-');
  if (baseSlug) return `${baseSlug}-${colorHash.slice(0, 10)}`;
  return `palette-${colorHash}`;
}

// Decode dynamic palette from slug or query (e.g. "gen-pal-e9c46a-111215..." or hex list)
export function decodePaletteFromSlugOrId(identifier: string): PaletteItem | null {
  if (!identifier) return null;

  const clean = identifier.replace(/^(palettes|palette|gen-pal|custom-palette|gen)-/i, '');
  const hexParts = clean.match(/[0-9a-fA-F]{6}/g);
  if (hexParts && hexParts.length >= 2) {
    const swatches = hexParts.map((h, i) => {
      const hex = `#${h.toUpperCase()}`;
      const name = findClosestColorName(hex);
      const role = i === 0 ? 'Background Anchor' : i === 1 ? 'Primary Dominant' : i === 2 ? 'Accent Focus' : 'Surface / Highlight';
      return { name, hex, role };
    });

    const title = `${swatches[0].name} & ${swatches[1]?.name || 'Harmonic'} Gamut`;
    return {
      id: `pal-dyn-${identifier}`,
      slug: identifier,
      title,
      category: 'Curated Generation',
      description: `Harmonic color system with ${swatches.length} chromatic balance points.`,
      colors: swatches,
      tags: ['dynamic', 'custom', 'generated'],
    };
  }

  return null;
}

// Decode dynamic combo from slug or ID (e.g. "contrast-e9c46a-111215" or "e9c46a-on-111215")
export function decodeComboFromSlugOrId(identifier: string): ComboItem | null {
  if (!identifier) return null;

  const hexParts = identifier.match(/[0-9a-fA-F]{6}/g);
  if (hexParts && hexParts.length >= 2) {
    const hex1 = `#${hexParts[0].toUpperCase()}`;
    const hex2 = `#${hexParts[1].toUpperCase()}`;
    const name1 = findClosestColorName(hex1);
    const name2 = findClosestColorName(hex2);
    const ratio = getContrastRatio(hex1, hex2);

    return {
      id: `combo-dyn-${identifier}`,
      slug: identifier,
      title: `${name1} on ${name2}`,
      harmonyType: 'Accessibility Contrast',
      description: `Dual-color specimen pairing ${name1} and ${name2} with ${ratio}:1 luminance ratio.`,
      colors: [
        { name: name1, hex: hex1, role: 'Foreground' },
        { name: name2, hex: hex2, role: 'Background' },
      ],
      contrastScore: `${ratio}:1`,
      usageContext: 'Text, Buttons & Surface Pairing',
      tags: ['contrast', 'pairing', 'custom'],
    };
  }

  return null;
}

// Construct a full ColorItem from a single HEX code
export function createColorItemFromHex(hex: string, name?: string): ColorItem {
  const cleanHex = hex.startsWith('#') ? hex.toUpperCase() : `#${hex.toUpperCase()}`;
  const resolvedName = name || findClosestColorName(cleanHex);
  const rgbObj = hexToRgb(cleanHex) || { r: 0, g: 0, b: 0 };
  const hslObj = hexToHsl(cleanHex) || { h: 0, s: 0, l: 0 };
  const rgb = `rgb(${rgbObj.r}, ${rgbObj.g}, ${rgbObj.b})`;
  const hsl = `hsl(${hslObj.h}, ${hslObj.s}%, ${hslObj.l}%)`;
  const oklch = hexToOklch(cleanHex);
  const contrastWhite = getContrastRatio(cleanHex, '#FFFFFF');
  const contrastBlack = getContrastRatio(cleanHex, '#111111');
  const bestTextColor = getTextColorForBackground(cleanHex);
  const slug = slugify(resolvedName);
  const harmonies = calculateHarmonies(cleanHex);
  const shades = [
    { level: '100', hex: hslToHex(hslObj.h, hslObj.s, 95) },
    { level: '200', hex: hslToHex(hslObj.h, hslObj.s, 85) },
    { level: '300', hex: hslToHex(hslObj.h, hslObj.s, 70) },
    { level: '400', hex: hslToHex(hslObj.h, hslObj.s, 55) },
    { level: '500', hex: cleanHex },
    { level: '600', hex: hslToHex(hslObj.h, hslObj.s, 40) },
    { level: '700', hex: hslToHex(hslObj.h, hslObj.s, 25) },
    { level: '800', hex: hslToHex(hslObj.h, hslObj.s, 15) },
    { level: '900', hex: hslToHex(hslObj.h, hslObj.s, 8) },
  ];

  return {
    id: `color-${cleanHex.replace('#', '').toLowerCase()}`,
    slug,
    name: resolvedName,
    hex: cleanHex,
    rgb,
    hsl,
    oklch,
    family: 'Chromatics',
    hueGroup: 'Custom',
    tone: hslObj.l > 60 ? 'Light' : hslObj.l < 35 ? 'Deep' : 'Vibrant',
    description: `Calibrated color specimen in the ${resolvedName} spectrum.`,
    usageNotes: `Ideal for interfaces requiring precise chromatic balance (${oklch}).`,
    tags: ['custom', 'spectrum', 'curated'],
    contrastWithWhite: contrastWhite,
    contrastWithBlack: contrastBlack,
    bestTextColor,
    complementaryHex: harmonies.complementary,
    analogousHexes: harmonies.analogous,
    triadicHexes: harmonies.triadic,
    shades,
  };
}
