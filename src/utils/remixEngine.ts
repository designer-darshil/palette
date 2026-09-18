import { PaletteItem } from '../types';
import { hexToHsl, hslToHex } from './colorUtils';
import { findClosestColorName } from './paletteGenerator';

export interface RemixAdjustments {
  hueShift: number; // -180 to +180
  saturationMultiplier: number; // 0.0 to 2.0 (1.0 = normal)
  lightnessShift: number; // -50 to +50
  contrastMultiplier: number; // 0.5 to 2.0 (1.0 = normal)
  temperatureShift: number; // -50 (cooler) to +50 (warmer)
}

export const DEFAULT_REMIX_ADJUSTMENTS: RemixAdjustments = {
  hueShift: 0,
  saturationMultiplier: 1.0,
  lightnessShift: 0,
  contrastMultiplier: 1.0,
  temperatureShift: 0,
};

export type RemixPreset = 
  | 'lighter'
  | 'darker'
  | 'warmer'
  | 'cooler'
  | 'vibrant'
  | 'muted'
  | 'high-contrast'
  | 'soft-contrast'
  | 'invert';

export function applyRemixAdjustments(
  originalColors: { name: string; hex: string; role?: string }[],
  adjustments: RemixAdjustments
): { name: string; hex: string; role?: string }[] {
  // Find average lightness for contrast adjustments around midpoint
  const hslList = originalColors.map((c) => hexToHsl(c.hex) || { h: 0, s: 50, l: 50 });
  const avgL = hslList.reduce((acc, h) => acc + h.l, 0) / (hslList.length || 1);

  return originalColors.map((col, i) => {
    const hsl = hslList[i];
    let h = hsl.h + adjustments.hueShift;

    // Apply temperature shift (nudges hues toward warm amber ~30 or cool blue ~220)
    if (adjustments.temperatureShift !== 0) {
      const targetHue = adjustments.temperatureShift > 0 ? 30 : 220;
      const factor = Math.abs(adjustments.temperatureShift) / 100;
      // shortest hue distance interpolate
      let diff = targetHue - h;
      while (diff < -180) diff += 360;
      while (diff > 180) diff -= 360;
      h += diff * factor * 0.4;
    }

    h = ((h % 360) + 360) % 360;

    let s = hsl.s * adjustments.saturationMultiplier;
    s = Math.max(0, Math.min(100, s));

    // Lightness with contrast expansion/compression around midpoint
    let l = hsl.l + adjustments.lightnessShift;
    l = avgL + (l - avgL) * adjustments.contrastMultiplier;
    l = Math.max(4, Math.min(96, l));

    const newHex = hslToHex(h, s, l);
    const newName = findClosestColorName(newHex);

    return {
      name: newName,
      hex: newHex,
      role: col.role,
    };
  });
}

export function applyRemixPreset(
  current: RemixAdjustments,
  preset: RemixPreset
): RemixAdjustments {
  switch (preset) {
    case 'lighter':
      return { ...current, lightnessShift: Math.min(40, current.lightnessShift + 15) };
    case 'darker':
      return { ...current, lightnessShift: Math.max(-40, current.lightnessShift - 15) };
    case 'warmer':
      return { ...current, temperatureShift: Math.min(50, current.temperatureShift + 25) };
    case 'cooler':
      return { ...current, temperatureShift: Math.max(-50, current.temperatureShift - 25) };
    case 'vibrant':
      return { ...current, saturationMultiplier: parseFloat((current.saturationMultiplier * 1.35).toFixed(2)) };
    case 'muted':
      return { ...current, saturationMultiplier: parseFloat((current.saturationMultiplier * 0.65).toFixed(2)) };
    case 'high-contrast':
      return { ...current, contrastMultiplier: parseFloat((current.contrastMultiplier * 1.3).toFixed(2)) };
    case 'soft-contrast':
      return { ...current, contrastMultiplier: parseFloat((current.contrastMultiplier * 0.75).toFixed(2)) };
    case 'invert':
      return { ...current, hueShift: (current.hueShift + 180) % 360, lightnessShift: -current.lightnessShift };
    default:
      return current;
  }
}

export function createRemixedPalette(
  original: PaletteItem,
  remixedColors: { name: string; hex: string; role?: string }[],
  customTitle?: string
): PaletteItem {
  const title = customTitle || `${original.title} (Remix)`;
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return {
    id: `remix_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    slug: `${slug}-${Math.random().toString(36).substring(2, 5)}`,
    title,
    category: original.category,
    description: `Remixed interpretation of ${original.title}. Balanced chromatic spectrum.`,
    colors: remixedColors,
    tags: [...new Set(['remix', ...(original.tags || [])])],
    remixedFrom: {
      id: original.id,
      title: original.title,
      slug: original.slug,
      creatorName: original.creator?.name || 'PaletteParadise Archive',
    },
    remixCount: 0,
    likes: 0,
    saves: 0,
    createdAt: new Date().toISOString(),
  };
}
