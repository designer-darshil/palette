// Color conversion and accessibility calculations
import { oklchToHex as systemOklchToHex } from './oklchColorSystem';

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
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
  const toHex = (c: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
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
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const rgb = hexToRgb(hex);
  if (!rgb) return { h: 0, s: 0, v: 100 };
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

export function hsvToHex(h: number, s: number, v: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  v = Math.max(0, Math.min(100, v)) / 100;

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

export function hexToOklch(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return 'oklch(0.5 0.1 0)';
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
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

export function hexToOklchNumbers(hex: string): { l: number; c: number; h: number } {
  const rgb = hexToRgb(hex);
  if (!rgb) return { l: 0.5, c: 0, h: 0 };
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
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

  return {
    l: parseFloat(L.toFixed(3)),
    c: parseFloat(C.toFixed(3)),
    h: parseFloat(H.toFixed(1)),
  };
}

export function oklchToHex(l: number, c: number, h: number): string {
  const clampedL = Math.max(0, Math.min(1, l));
  const clampedC = Math.max(0, Math.min(0.4, c));
  const normalizedH = ((h % 360) + 360) % 360;
  return systemOklchToHex(clampedL, clampedC, normalizedH);
}

export function parseOklch(str: string): { l: number; c: number; h: number } | null {
  if (!str) return null;
  const clean = str.trim().toLowerCase();
  const match = clean.match(/^(?:oklch\()?\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+)(?:deg)?\s*\)?$/i);
  if (!match) return null;

  let l = match[1].endsWith('%') ? parseFloat(match[1]) / 100 : parseFloat(match[1]);
  if (l > 1 && !match[1].endsWith('%')) l = l / 100;
  const c = parseFloat(match[2]);
  const h = parseFloat(match[3]);

  if (isNaN(l) || isNaN(c) || isNaN(h)) return null;
  return {
    l: Math.max(0, Math.min(1, l)),
    c: Math.max(0, Math.min(0.4, c)),
    h: ((h % 360) + 360) % 360,
  };
}

export function generateShadesAndTints(hex: string): { shades: string[]; tints: string[]; tones: string[] } {
  const hsl = hexToHsl(hex) || { h: 0, s: 50, l: 50 };
  const { h, s, l } = hsl;

  // Shades: darker variations (L decreasing towards 5%)
  const shades: string[] = [];
  const shadeSteps = [0.85, 0.70, 0.55, 0.40, 0.25, 0.12];
  for (const factor of shadeSteps) {
    shades.push(hslToHex(h, s, Math.round(l * factor)));
  }

  // Tints: lighter variations (L increasing towards 95%)
  const tints: string[] = [];
  const tintSteps = [0.15, 0.30, 0.45, 0.60, 0.75, 0.90];
  for (const factor of tintSteps) {
    tints.push(hslToHex(h, s, Math.round(l + (100 - l) * factor)));
  }

  // Tones: desaturated variations (S decreasing towards 5%)
  const tones: string[] = [];
  const toneSteps = [0.85, 0.70, 0.55, 0.40, 0.25, 0.10];
  for (const factor of toneSteps) {
    tones.push(hslToHex(h, Math.round(s * factor), l));
  }

  return { shades, tints, tones };
}

export function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

export function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 1;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return parseFloat(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
}

export function getContrastRating(ratio: number): {
  label: string;
  passAA: boolean;
  passAAA: boolean;
  passAALarge: boolean;
} {
  return {
    label: ratio >= 7 ? 'AAA (7.0+)' : ratio >= 4.5 ? 'AA (4.5+)' : ratio >= 3 ? 'AA Large (3.0+)' : 'Fail (<3.0)',
    passAA: ratio >= 4.5,
    passAAA: ratio >= 7,
    passAALarge: ratio >= 3,
  };
}

export interface ColorAccessibilityAssessment {
  contrastWithWhite: number;
  contrastWithBlack: number;
  bestTextColor: '#FFFFFF' | '#000000';
  bestContrast: number;
  passAANormal: boolean;
  passAAA: boolean;
  passAALarge: boolean;
}

export function getColorAccessibility(hex: string): ColorAccessibilityAssessment {
  const whiteRatio = getContrastRatio(hex, '#FFFFFF');
  const blackRatio = getContrastRatio(hex, '#000000');
  const bestTextColor: '#FFFFFF' | '#000000' = blackRatio >= whiteRatio ? '#000000' : '#FFFFFF';
  const bestContrast = Math.max(blackRatio, whiteRatio);

  return {
    contrastWithWhite: whiteRatio,
    contrastWithBlack: blackRatio,
    bestTextColor,
    bestContrast,
    passAANormal: bestContrast >= 4.5,
    passAAA: bestContrast >= 7,
    passAALarge: bestContrast >= 3,
  };
}

export function getTextColorForBackground(hex: string): '#FFFFFF' | '#000000' {
  const whiteRatio = getContrastRatio(hex, '#FFFFFF');
  const blackRatio = getContrastRatio(hex, '#000000');
  return blackRatio >= whiteRatio ? '#000000' : '#FFFFFF';
}

export interface CalculatedHarmonies {
  complementary: string;
  analogous: [string, string];
  triadic: [string, string];
  tetradic: [string, string, string];
  splitComplementary: [string, string];
  monochromatic: string[];
}

export function calculateHarmonies(hex: string): CalculatedHarmonies {
  const hsl = hexToHsl(hex) || { h: 0, s: 50, l: 50 };
  const { h, s, l } = hsl;

  return {
    complementary: hslToHex(h + 180, s, l),
    analogous: [hslToHex(h - 30, s, l), hslToHex(h + 30, s, l)],
    triadic: [hslToHex(h + 120, s, l), hslToHex(h + 240, s, l)],
    tetradic: [hslToHex(h + 90, s, l), hslToHex(h + 180, s, l), hslToHex(h + 270, s, l)],
    splitComplementary: [hslToHex(h + 150, s, l), hslToHex(h + 210, s, l)],
    monochromatic: [
      hslToHex(h, s, Math.max(12, l - 35)),
      hslToHex(h, s, Math.max(20, l - 18)),
      hslToHex(h, s, Math.min(85, l + 18)),
      hslToHex(h, s, Math.min(94, l + 32)),
    ],
  };
}

/**
 * Calculates color temperature in Kelvin (approximate) and classification (Warm/Cool/Neutral)
 */
export function getColorTemperature(hex: string): { kelvin: number; classification: 'Warm' | 'Cool' | 'Neutral'; score: number } {
  const hsl = hexToHsl(hex);
  if (!hsl) return { kelvin: 5000, classification: 'Neutral', score: 0 };
  const { h, s } = hsl;

  if (s < 10) return { kelvin: 5500, classification: 'Neutral', score: 0 };

  // Hue 0-60 (Red to Yellow) & 300-360 (Magenta to Red) = Warm
  // Hue 120-270 (Green, Cyan, Blue) = Cool
  let isWarm = false;
  if ((h >= 0 && h <= 80) || (h >= 300 && h <= 360)) {
    isWarm = true;
  }

  // Calculate temperature score from -1.0 (deep cold blue) to +1.0 (vibrant warm orange/red)
  let score = 0;
  if (h >= 0 && h <= 60) {
    score = 1.0 - (Math.abs(h - 30) / 30) * 0.3; // Peak warmth around 30deg (amber/orange)
  } else if (h > 60 && h <= 120) {
    score = 0.7 - ((h - 60) / 60) * 0.9;
  } else if (h > 120 && h <= 240) {
    score = -0.2 - ((h - 120) / 120) * 0.8; // Peak cool around 240deg (cobalt)
  } else if (h > 240 && h <= 300) {
    score = -1.0 + ((h - 240) / 60) * 0.8;
  } else {
    score = -0.2 + ((h - 300) / 60) * 1.0;
  }

  const kelvin = Math.round(isWarm ? 3000 + (1 - Math.max(0, score)) * 2500 : 5500 + Math.abs(score) * 4500);

  return {
    kelvin,
    classification: isWarm ? 'Warm' : 'Cool',
    score: parseFloat(score.toFixed(2)),
  };
}

/**
 * Calculates Euclidean Delta-E distance between two colors in RGB/Lab space
 */
export function calculateDeltaE(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 100;

  // Weighted perceptual color distance
  const rmean = (rgb1.r + rgb2.r) / 2;
  const r = rgb1.r - rgb2.r;
  const g = rgb1.g - rgb2.g;
  const b = rgb1.b - rgb2.b;
  return Math.sqrt((((512 + rmean) * r * r) >> 8) + 4 * g * g + (((767 - rmean) * b * b) >> 8));
}

export interface PracticalUiAssessment {
  onWhiteRatio: number;
  onWhiteRating: { label: string; passAA: boolean; passAAA: boolean; passAALarge: boolean };
  onBlackRatio: number;
  onBlackRating: { label: string; passAA: boolean; passAAA: boolean; passAALarge: boolean };
  recommendedRoles: {
    primaryButton: boolean;
    cardSurface: boolean;
    accentBadge: boolean;
    editorialText: boolean;
    subtleBorder: boolean;
  };
}

export function assessPracticalUi(hex: string): PracticalUiAssessment {
  const onWhiteRatio = getContrastRatio(hex, '#FFFFFF');
  const onBlackRatio = getContrastRatio(hex, '#000000');
  const hsl = hexToHsl(hex) || { h: 0, s: 50, l: 50 };

  return {
    onWhiteRatio,
    onWhiteRating: getContrastRating(onWhiteRatio),
    onBlackRatio,
    onBlackRating: getContrastRating(onBlackRatio),
    recommendedRoles: {
      primaryButton: hsl.s >= 35 && (onWhiteRatio >= 4.0 || onBlackRatio >= 4.0),
      cardSurface: (hsl.l <= 18 && hsl.s <= 35) || (hsl.l >= 88 && hsl.s <= 25),
      accentBadge: hsl.s >= 50,
      editorialText: onWhiteRatio >= 4.5 || onBlackRatio >= 4.5,
      subtleBorder: hsl.l >= 30 && hsl.l <= 70,
    },
  };
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      textArea.remove();
      return Promise.resolve(true);
    } catch {
      textArea.remove();
      return Promise.resolve(false);
    }
  }
}

export function getComboKeyColors(colors: Array<{ name: string; hex: string; role?: string; percentage?: number }>): [{ name: string; hex: string; role?: string }, { name: string; hex: string; role?: string }] {
  if (!colors || colors.length === 0) {
    return [{ name: 'Primary', hex: '#1D4ED8' }, { name: 'Accent', hex: '#E63946' }];
  }
  if (colors.length === 2) {
    return [colors[0], colors[1]];
  }

  // Identify Primary / Dominant and Accent / Focus roles
  const primary = colors.find((c) =>
    (c.role || '').toLowerCase().includes('primary') || (c.role || '').toLowerCase().includes('dominant')
  );
  const accent = colors.find(
    (c) =>
      ((c.role || '').toLowerCase().includes('accent') || (c.role || '').toLowerCase().includes('focus')) &&
      c !== primary
  );

  if (primary && accent) {
    return [primary, accent];
  }

  // If roles are not explicitly labeled, filter out background roles
  const nonBg = colors.filter((c) => !(c.role || '').toLowerCase().includes('background'));
  if (nonBg.length >= 2) {
    return [nonBg[0], nonBg[1]];
  }

  return [colors[0], colors[1] || colors[0]];
}


