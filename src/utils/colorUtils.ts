// Color conversion and accessibility calculations

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

export function getTextColorForBackground(hex: string): '#FFFFFF' | '#111111' {
  const whiteRatio = getContrastRatio(hex, '#FFFFFF');
  const blackRatio = getContrastRatio(hex, '#111111');
  return whiteRatio >= blackRatio ? '#FFFFFF' : '#111111';
}

export interface CalculatedHarmonies {
  complementary: string;
  analogous: [string, string];
  triadic: [string, string];
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
    splitComplementary: [hslToHex(h + 150, s, l), hslToHex(h + 210, s, l)],
    monochromatic: [
      hslToHex(h, s, Math.max(12, l - 35)),
      hslToHex(h, s, Math.max(20, l - 18)),
      hslToHex(h, s, Math.min(85, l + 18)),
      hslToHex(h, s, Math.min(94, l + 32)),
    ],
  };
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
  const onBlackRatio = getContrastRatio(hex, '#111215');
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
