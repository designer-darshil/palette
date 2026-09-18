import { PaletteItem, ColorItem } from '../types';
import { hexToHsl, hexToRgb, calculateDeltaE, getLuminance } from './colorUtils';

export interface PaletteSimilarityScore {
  palette: PaletteItem;
  score: number; // 0.0 to 1.0 (1.0 = identical)
  metrics: {
    hueMatch: number;
    luminanceMatch: number;
    saturationMatch: number;
    contrastMatch: number;
  };
}

/**
 * Calculates a multidimensional similarity score (0.0 to 1.0) between two palettes
 */
export function calculatePaletteSimilarity(target: PaletteItem, candidate: PaletteItem): PaletteSimilarityScore {
  if (target.id === candidate.id) {
    return {
      palette: candidate,
      score: 1.0,
      metrics: { hueMatch: 1, luminanceMatch: 1, saturationMatch: 1, contrastMatch: 1 },
    };
  }

  const targetHsls = target.colors.map((c) => hexToHsl(c.hex) || { h: 0, s: 50, l: 50 });
  const candidateHsls = candidate.colors.map((c) => hexToHsl(c.hex) || { h: 0, s: 50, l: 50 });

  // Average Hues, Sats, Lums
  const targetAvgSat = targetHsls.reduce((acc, h) => acc + h.s, 0) / targetHsls.length;
  const candAvgSat = candidateHsls.reduce((acc, h) => acc + h.s, 0) / candidateHsls.length;
  const saturationMatch = Math.max(0, 1 - Math.abs(targetAvgSat - candAvgSat) / 100);

  const targetAvgLum = targetHsls.reduce((acc, h) => acc + h.l, 0) / targetHsls.length;
  const candAvgLum = candidateHsls.reduce((acc, h) => acc + h.l, 0) / candidateHsls.length;
  const luminanceMatch = Math.max(0, 1 - Math.abs(targetAvgLum - candAvgLum) / 100);

  // Minimum pair-wise Delta-E distance
  let totalMinDeltaE = 0;
  for (const tColor of target.colors) {
    let minD = 100;
    for (const cColor of candidate.colors) {
      const d = calculateDeltaE(tColor.hex, cColor.hex);
      if (d < minD) minD = d;
    }
    totalMinDeltaE += minD;
  }
  const avgMinDeltaE = totalMinDeltaE / target.colors.length;
  const hueMatch = Math.max(0, 1 - avgMinDeltaE / 80);

  // Contrast Range similarity
  const getLumSpan = (colors: { hex: string }[]) => {
    const lums = colors.map((c) => {
      const rgb = hexToRgb(c.hex);
      return rgb ? getLuminance(rgb.r, rgb.g, rgb.b) : 0.5;
    });
    return Math.max(...lums) - Math.min(...lums);
  };
  const targetSpan = getLumSpan(target.colors);
  const candSpan = getLumSpan(candidate.colors);
  const contrastMatch = Math.max(0, 1 - Math.abs(targetSpan - candSpan));

  // Category & Tag bonus
  let bonus = 0;
  if (target.category.toLowerCase() === candidate.category.toLowerCase()) {
    bonus += 0.08;
  }
  if (target.tags && candidate.tags) {
    const commonTags = target.tags.filter((t) => candidate.tags.includes(t));
    bonus += Math.min(0.12, commonTags.length * 0.04);
  }

  const rawScore = (hueMatch * 0.45) + (luminanceMatch * 0.25) + (saturationMatch * 0.15) + (contrastMatch * 0.15) + bonus;
  const finalScore = parseFloat(Math.min(1.0, Math.max(0, rawScore)).toFixed(3));

  return {
    palette: candidate,
    score: finalScore,
    metrics: {
      hueMatch: parseFloat(hueMatch.toFixed(2)),
      luminanceMatch: parseFloat(luminanceMatch.toFixed(2)),
      saturationMatch: parseFloat(saturationMatch.toFixed(2)),
      contrastMatch: parseFloat(contrastMatch.toFixed(2)),
    },
  };
}

/**
 * Finds top N similar palettes across the catalog
 */
export function findSimilarPalettes(target: PaletteItem, catalog: PaletteItem[], limit = 4): PaletteSimilarityScore[] {
  return catalog
    .filter((p) => p.id !== target.id)
    .map((p) => calculatePaletteSimilarity(target, p))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Finds similar colors based on DeltaE distance and HSL tone
 */
export function findSimilarColors(targetHex: string, colorCatalog: ColorItem[], limit = 6): { color: ColorItem; distance: number }[] {
  return colorCatalog
    .filter((c) => c.hex.toLowerCase() !== targetHex.toLowerCase())
    .map((c) => ({
      color: c,
      distance: calculateDeltaE(targetHex, c.hex),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}
