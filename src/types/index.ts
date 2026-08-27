export interface ColorItem {
  id: string;
  slug: string;
  name: string;
  hex: string;
  rgb: string;
  hsl: string;
  oklch: string;
  family: string;
  hueGroup: string;
  tone: string;
  description: string;
  usageNotes: string;
  tags: string[];
  contrastWithWhite: number;
  contrastWithBlack: number;
  bestTextColor: string;
  complementaryHex: string;
  analogousHexes: [string, string];
  triadicHexes: [string, string];
  shades: { level: string; hex: string }[];
}

export interface PaletteItem {
  id: string;
  slug: string;
  title: string;
  category: string;
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
  harmonyType: string;
  description: string;
  colors: {
    name: string;
    hex: string;
    role: string;
    percentage?: number;
  }[];
  contrastScore: string;
  usageContext: string;
  tags: string[];
}

export interface GradientItem {
  id: string;
  slug: string;
  title: string;
  type: string;
  angle?: number;
  stops: {
    color: string;
    position: number;
    name?: string;
  }[];
  css: string;
  category: string;
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
  | { path: 'live' }
  | { path: 'palette-generator'; colors?: string }
  | { path: 'contrast-checker'; fg?: string; bg?: string }
  | { path: 'admin'; tab?: string }
  | { path: 'saved' }
  | { path: 'not-found'; requestedUrl?: string };
