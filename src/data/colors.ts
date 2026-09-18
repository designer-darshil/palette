import { ColorItem } from '../types';
import compactColorsRaw from './colorsCompact.json?raw';

function hexToRgb(hex: string): { r: number; g: number; b: number } {
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
  return { r: 0, g: 0, b: 0 };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const rgb = hexToRgb(hex);
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return parseFloat(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
}

function hexToOklch(hex: string): string {
  const rgb = hexToRgb(hex);
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
  const lr = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  const lg = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  const lb = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  const C = Math.sqrt(a * a + b_ * b_);
  let H = Math.atan2(b_, a) * (180 / Math.PI);
  if (H < 0) H += 360;

  return `oklch(${L.toFixed(2)} ${C.toFixed(2)} ${H.toFixed(1)})`;
}

function classifyHueGroup(h: number, s: number): 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'cyan' | 'blue' | 'indigo' | 'purple' | 'pink' | 'neutral' {
  if (s < 10) return 'neutral';
  if (h >= 345 || h < 15) return 'red';
  if (h >= 15 && h < 45) return 'orange';
  if (h >= 45 && h < 70) return 'yellow';
  if (h >= 70 && h < 160) return 'green';
  if (h >= 160 && h < 190) return 'teal';
  if (h >= 190 && h < 210) return 'cyan';
  if (h >= 210 && h < 240) return 'blue';
  if (h >= 240 && h < 270) return 'indigo';
  if (h >= 270 && h < 315) return 'purple';
  return 'pink';
}

function classifyFamily(hueGroup: string, s: number, l: number): 'warm' | 'cool' | 'neutral' | 'earth' | 'pastel' | 'vibrant' | 'deep' {
  if (s < 12) return 'neutral';
  if (l < 22) return 'deep';
  if (l > 82 && s < 45) return 'pastel';
  if (s > 75 && l > 35 && l < 65) return 'vibrant';
  if (['red', 'orange', 'yellow'].includes(hueGroup)) {
    if (s < 50 && l < 50) return 'earth';
    return 'warm';
  }
  if (['teal', 'cyan', 'blue', 'indigo'].includes(hueGroup)) return 'cool';
  return 'warm';
}

function classifyTone(l: number, s: number): 'light' | 'medium' | 'dark' | 'muted' {
  if (s < 20) return 'muted';
  if (l > 70) return 'light';
  if (l < 30) return 'dark';
  return 'medium';
}

function generateShades(h: number, s: number): { level: string; hex: string }[] {
  return [
    { level: '50', hex: hslToHex(h, Math.min(s, 40), 96) },
    { level: '100', hex: hslToHex(h, Math.min(s, 50), 90) },
    { level: '200', hex: hslToHex(h, Math.min(s, 60), 80) },
    { level: '300', hex: hslToHex(h, Math.min(s, 70), 70) },
    { level: '400', hex: hslToHex(h, Math.min(s, 75), 60) },
    { level: '500', hex: hslToHex(h, s, 50) },
    { level: '600', hex: hslToHex(h, s, 42) },
    { level: '700', hex: hslToHex(h, s, 34) },
    { level: '800', hex: hslToHex(h, Math.min(s, 70), 24) },
    { level: '900', hex: hslToHex(h, Math.min(s, 60), 16) },
    { level: '950', hex: hslToHex(h, Math.min(s, 50), 9) },
  ];
}

function hydrateColor(tuple: [string, string, string], index: number): ColorItem {
  const [slug, name, hex] = tuple;
  const rgb = hexToRgb(hex);
  const hsl = hexToHsl(hex);
  const hueGroup = classifyHueGroup(hsl.h, hsl.s);
  const family = classifyFamily(hueGroup, hsl.s, hsl.l);
  const tone = classifyTone(hsl.l, hsl.s);
  const contrastW = getContrastRatio(hex, '#FFFFFF');
  const contrastB = getContrastRatio(hex, '#000000');
  const bestTextColor = contrastW >= 4.5 ? '#FFFFFF' : '#000000';

  return {
    id: `c${index + 1}`,
    slug,
    name,
    hex,
    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    oklch: hexToOklch(hex),
    family,
    hueGroup,
    tone,
    description: `A calibrated ${tone} ${family} specimen in the ${hueGroup} spectrum, engineered for digital interfaces and architectural palettes.`,
    usageNotes: `Optimized for ${bestTextColor === '#FFFFFF' ? 'dark-ground contrast' : 'light-ground contrast'} and UI hierarchy.`,
    tags: [hueGroup, family, tone, 'calibrated'],
    contrastWithWhite: contrastW,
    contrastWithBlack: contrastB,
    bestTextColor,
    complementaryHex: hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
    analogousHexes: [
      hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
      hslToHex((hsl.h + 330) % 360, hsl.s, hsl.l),
    ],
    triadicHexes: [
      hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
      hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
    ],
    shades: generateShades(hsl.h, hsl.s),
  };
}

// Hydrate 44,000 colors from compact tuples
const parsedTuples: [string, string, string][] = JSON.parse(compactColorsRaw);

export const CURATED_COLORS: ColorItem[] = parsedTuples.map((t, idx) => hydrateColor(t, idx));
