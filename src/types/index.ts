export interface ColorItem {
  id: string;
  slug: string;
  name: string;
  hex: string;
  rgb: string;
  hsl: string;
  oklch: string;
  family: 'warm' | 'cool' | 'neutral' | 'earth' | 'pastel' | 'vibrant' | 'deep';
  hueGroup: 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'cyan' | 'blue' | 'indigo' | 'purple' | 'pink' | 'neutral';
  tone: 'light' | 'medium' | 'dark' | 'muted';
  description: string;
  usageNotes: string;
  tags: string[];
  contrastWithWhite: number;
  contrastWithBlack: number;
  bestTextColor: '#FFFFFF' | '#111111';
  complementaryHex: string;
  analogousHexes: [string, string];
  triadicHexes: [string, string];
  shades: { level: string; hex: string }[];
}

export interface PaletteItem {
  id: string;
  slug: string;
  title: string;
  category: 'editorial' | 'minimal' | 'nature' | 'architectural' | 'vintage' | 'vibrant' | 'monochrome' | 'dark-mode';
  description: string;
  colors: {
    name: string;
    hex: string;
    role?: string;
  }[];
  tags: string[];
  likes?: number;
  featured?: boolean;
}

export interface ComboItem {
  id: string;
  slug: string;
  title: string;
  harmonyType: 'Complementary' | 'Analogous' | 'Triadic' | 'Split Complementary' | 'Monochromatic' | 'Warm & Cool' | 'High Contrast' | 'Editorial Balance';
  description: string;
  colors: {
    name: string;
    hex: string;
    role: 'Background' | 'Surface' | 'Primary / Dominant' | 'Accent / Focus' | 'Muted Tone';
    percentage?: number;
  }[];
  contrastScore: string; // e.g. "AAA (14.2:1)" or "AA (6.8:1)"
  usageContext: string;
  tags: string[];
}

export interface GradientItem {
  id: string;
  slug: string;
  title: string;
  type: 'linear' | 'radial' | 'conic' | 'mesh';
  angle?: number;
  stops: {
    color: string;
    position: number;
    name?: string;
  }[];
  css: string;
  category: 'atmospheric' | 'sunset' | 'holographic' | 'deep-space' | 'organic' | 'editorial-metal' | 'minimal';
  tags: string[];
}

export type RouteType = 
  | { path: 'home' }
  | { path: 'colors' }
  | { path: 'color-detail'; slug: string }
  | { path: 'palettes' }
  | { path: 'palette-detail'; slug: string }
  | { path: 'combos' }
  | { path: 'combo-detail'; slug: string }
  | { path: 'gradients' }
  | { path: 'gradient-detail'; slug: string }
  | { path: 'saved' }
  | { path: 'not-found'; requestedUrl?: string };
