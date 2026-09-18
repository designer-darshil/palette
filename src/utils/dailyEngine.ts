import { ColorItem, PaletteItem } from '../types';
import { CURATED_COLORS } from '../data/colors';
import { CURATED_PALETTES } from '../data/palettes';

/**
 * Returns a deterministic integer hash from a YYYY-MM-DD date string
 */
export function getDailySeed(date = new Date()): number {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const dateStr = `${y}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`;
  
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getColorOfTheDay(date = new Date(), customColors?: ColorItem[]): { color: ColorItem; dateString: string } {
  const list = customColors && customColors.length > 0 ? customColors : CURATED_COLORS;
  const seed = getDailySeed(date);
  const index = seed % list.length;
  
  const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
  const dateString = date.toLocaleDateString('en-US', options);

  return {
    color: list[index] || list[0],
    dateString,
  };
}

export function getPaletteOfTheDay(date = new Date(), customPalettes?: PaletteItem[]): { palette: PaletteItem; dateString: string } {
  const list = customPalettes && customPalettes.length > 0 ? customPalettes : CURATED_PALETTES;
  const seed = getDailySeed(date) + 42; // offset from color seed
  const index = seed % list.length;

  const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
  const dateString = date.toLocaleDateString('en-US', options);

  return {
    palette: list[index] || list[0],
    dateString,
  };
}
