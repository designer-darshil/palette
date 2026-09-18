import { hexToRgb, rgbToHex, hexToHsl, hslToHex } from './colorUtils';
import { CURATED_COLORS } from '../data/colors';
import { CURATED_PALETTES } from '../data/palettes';
import { getDailySeed } from './dailyEngine';

// --- GAME 1: HEXLE ENGINE ---
export interface HexleGuessResult {
  guessHex: string;
  rFeedback: 'exact' | 'higher' | 'lower';
  gFeedback: 'exact' | 'higher' | 'lower';
  bFeedback: 'exact' | 'higher' | 'lower';
  isCorrect: boolean;
}

export function evaluateHexleGuess(targetHex: string, guessHex: string): HexleGuessResult {
  const targetRgb = hexToRgb(targetHex) || { r: 128, g: 128, b: 128 };
  const guessRgb = hexToRgb(guessHex) || { r: 0, g: 0, b: 0 };

  const getFeedback = (t: number, g: number): 'exact' | 'higher' | 'lower' => {
    if (Math.abs(t - g) <= 8) return 'exact';
    return g < t ? 'higher' : 'lower'; // 'higher' means target is higher, so player must guess higher
  };

  const rFeedback = getFeedback(targetRgb.r, guessRgb.r);
  const gFeedback = getFeedback(targetRgb.g, guessRgb.g);
  const bFeedback = getFeedback(targetRgb.b, guessRgb.b);

  const isCorrect = rFeedback === 'exact' && gFeedback === 'exact' && bFeedback === 'exact';

  return {
    guessHex: guessHex.toUpperCase(),
    rFeedback,
    gFeedback,
    bFeedback,
    isCorrect,
  };
}

export function getDailyHexleTarget(): { hex: string; name: string } {
  const seed = getDailySeed();
  const index = seed % CURATED_COLORS.length;
  const col = CURATED_COLORS[index] || CURATED_COLORS[0];
  return { hex: col.hex, name: col.name };
}

// --- GAME 2: ODD ONE OUT ENGINE ---
export interface OddOneOutRound {
  baseColor: string;
  oddColor: string;
  oddIndex: number;
  gridSize: number; // e.g. 4x4 = 16 or 3x3 = 9
  difficultyDelta: number; // Delta in HSL lightness/hue
}

export function generateOddOneOutRound(level = 1): OddOneOutRound {
  const seedColor = CURATED_COLORS[Math.floor(Math.random() * CURATED_COLORS.length)] || CURATED_COLORS[0];
  const hsl = hexToHsl(seedColor.hex) || { h: 180, s: 50, l: 50 };

  // As level increases, delta decreases (harder to spot)
  const delta = Math.max(3, 20 - Math.min(15, level * 1.5));
  const shiftLightness = hsl.l > 50 ? hsl.l - delta : hsl.l + delta;
  const oddHex = hslToHex(hsl.h, hsl.s, shiftLightness);

  const gridSize = level <= 2 ? 9 : level <= 6 ? 16 : 25;
  const oddIndex = Math.floor(Math.random() * gridSize);

  return {
    baseColor: seedColor.hex,
    oddColor: oddHex,
    oddIndex,
    gridSize,
    difficultyDelta: delta,
  };
}

// --- GAME 3: PALETTE MATCH ENGINE ---
export interface PaletteMatchRound {
  targetPaletteTitle: string;
  targetColors: string[];
  scrambledColors: string[];
}

export function generatePaletteMatchRound(): PaletteMatchRound {
  const palette = CURATED_PALETTES[Math.floor(Math.random() * CURATED_PALETTES.length)] || CURATED_PALETTES[0];
  const targetColors = palette.colors.map((c) => c.hex);

  // Scramble colors
  const scrambled = [...targetColors].sort(() => Math.random() - 0.5);

  return {
    targetPaletteTitle: palette.title,
    targetColors,
    scrambledColors: scrambled,
  };
}
