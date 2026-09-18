import { PaletteItem, ColorItem, GradientItem, CollectionItem, CreatorItem } from '../types';

export interface ContentStats {
  views?: number;
  saves?: number;
  likes?: number;
  remixes?: number;
  createdAt?: string | number;
}

/**
 * Deterministic trending score calculation
 */
export function calculateTrendingScore(item: ContentStats): number {
  const views = item.views || 0;
  const saves = item.saves || 0;
  const likes = item.likes || 0;
  const remixes = item.remixes || 0;

  // Weightings: Saves and remixes reflect higher intentionality than casual likes/views
  const engagementScore = (likes * 2) + (saves * 5) + (remixes * 8) + (views * 0.1);
  return Math.round(engagementScore);
}

export function sortTrendingPalettes(palettes: PaletteItem[]): PaletteItem[] {
  return [...palettes].sort((a, b) => {
    const scoreA = calculateTrendingScore({
      likes: a.likes || 0,
      saves: a.saves || 0,
      remixes: a.remixCount || 0,
      views: a.views || 0,
    });
    const scoreB = calculateTrendingScore({
      likes: b.likes || 0,
      saves: b.saves || 0,
      remixes: b.remixCount || 0,
      views: b.views || 0,
    });
    if (scoreB !== scoreA) return scoreB - scoreA;
    // Secondary tie-breaker: featured first
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return a.title.localeCompare(b.title);
  });
}

export function sortNewestPalettes(palettes: PaletteItem[]): PaletteItem[] {
  return [...palettes].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (timeB !== timeA) return timeB - timeA;
    return b.id.localeCompare(a.id);
  });
}

export function sortTrendingColors(colors: ColorItem[]): ColorItem[] {
  return [...colors].sort((a, b) => {
    const scoreA = calculateTrendingScore({ likes: a.likes || 0, saves: a.saves || 0, views: a.views || 0 });
    const scoreB = calculateTrendingScore({ likes: b.likes || 0, saves: b.saves || 0, views: b.views || 0 });
    if (scoreB !== scoreA) return scoreB - scoreA;
    return b.contrastWithWhite - a.contrastWithWhite;
  });
}

export function sortTrendingCollections(collections: CollectionItem[]): CollectionItem[] {
  return [...collections].sort((a, b) => {
    const scoreA = (a.likes || 0) * 3 + (a.items.length * 2);
    const scoreB = (b.likes || 0) * 3 + (b.items.length * 2);
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return scoreB - scoreA;
  });
}

export function sortTrendingCreators(creators: CreatorItem[]): CreatorItem[] {
  return [...creators].sort((a, b) => {
    const scoreA = (a.paletteCount * 3) + (a.collectionCount * 4) + (a.patternCount * 2);
    const scoreB = (b.paletteCount * 3) + (b.collectionCount * 4) + (b.patternCount * 2);
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return scoreB - scoreA;
  });
}
