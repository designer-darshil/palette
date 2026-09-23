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
  likes?: number;
  saves?: number;
  views?: number;
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
  saves?: number;
  views?: number;
  featured?: boolean;
  creator?: {
    name: string;
    username: string;
    avatar?: string;
  };
  remixedFrom?: {
    id?: string;
    title: string;
    slug: string;
    creatorName?: string;
  };
  remixCount?: number;
  createdAt?: string;
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
  likes?: number;
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
  likes?: number;
}

export interface CollectionElement {
  id: string;
  type: 'palette' | 'color' | 'gradient' | 'combo' | 'pattern';
  refId: string;
  slug: string;
  title: string;
  preview: string;
  metadata?: string;
  addedAt: number;
}

export interface CollectionItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverPreview?: string;
  items: CollectionElement[];
  creator: {
    name: string;
    username: string;
    avatar?: string;
  };
  visibility: 'public' | 'private';
  createdAt: number;
  updatedAt: number;
  tags: string[];
  likes?: number;
  featured?: boolean;
}

export interface CreatorItem {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio: string;
  location?: string;
  website?: string;
  specialties: string[];
  paletteCount: number;
  collectionCount: number;
  patternCount: number;
  featured?: boolean;
  badges?: string[];
}

export type PatternType =
  | 'dots'
  | 'grid'
  | 'stripes'
  | 'noise'
  | 'waves'
  | 'geometry'
  | 'lines'
  | 'shapes'
  | 'orbital'
  | 'liquid-grid'
  | 'micro-dot'
  | 'offset-block'
  | 'ribbon'
  | 'cellular'
  | 'wave-field'
  | 'checker-flux'
  | 'linear-noise'
  | 'color-weave';

export interface PatternItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  type: PatternType;
  palette: string[]; // array of hex strings
  scale: number; // 1-100
  density: number; // 1-100
  rotation: number; // 0-360
  strokeWidth?: number;
  opacity?: number;
  tags: string[];
  creator?: {
    name: string;
    username: string;
  };
  likes?: number;
}

export interface GameScore {
  game: 'hexle' | 'odd-one-out' | 'palette-match';
  score: number;
  playedAt: number;
  streak?: number;
  accuracy?: number;
}

export type RouteType = 
  | { path: 'home' }
  | { path: 'explore'; mood?: string; useCase?: string; character?: string; season?: string }
  | { path: 'trending'; tab?: 'palettes' | 'colors' | 'gradients' | 'collections' | 'creators' }
  | { path: 'new'; tab?: 'palettes' | 'colors' | 'gradients' | 'collections' | 'creators' }
  | { path: 'random'; seed?: string }
  | { path: 'collections' }
  | { path: 'collection-detail'; slug: string }
  | { path: 'creators' }
  | { path: 'creator-detail'; username: string }
  | { path: 'patterns' }
  | { path: 'pattern-detail'; slug: string }
  | { path: 'pattern-studio'; palette?: string; type?: string; scale?: string; density?: string; rotation?: string }
  | { path: 'colors' }
  | { path: 'color-detail'; slug: string }
  | { path: 'color-relationships'; slug: string }
  | { path: 'color-of-the-day' }
  | { path: 'palettes' }
  | { path: 'palette-detail'; slug: string }
  | { path: 'palette-remix'; slug: string }
  | { path: 'palette-of-the-day' }
  | { path: 'combos' }
  | { path: 'combo-detail'; slug: string }
  | { path: 'gradients' }
  | { path: 'gradient-detail'; slug: string }
  | { path: 'live' }
  | { path: 'ramps'; b?: string; a?: string; a2?: string; m?: string; s?: string; c?: string; f?: string; v?: string; xr?: string; xt?: string }
  | { path: 'api-palette'; b?: string; a?: string; a2?: string; m?: string; s?: string; c?: string; f?: string; v?: string; xr?: string; xt?: string; format?: string }
  | { path: 'antigravity'; p?: string; o?: string; gx?: string; gy?: string; vx?: string; vy?: string; m?: string; r?: string; f?: string; d?: string; av?: string; ts?: string; tr?: string; vv?: string; grid?: string; sr?: string; k?: string; c?: string; mode?: string }
  | { path: 'api-antigravity'; p?: string; o?: string; gx?: string; gy?: string; vx?: string; vy?: string; m?: string; r?: string; f?: string; d?: string; av?: string; ts?: string; format?: string; k?: string; c?: string; mode?: string }
  | { path: 'springs'; p?: string; o?: string; k?: string; c?: string; m?: string; mode?: string; tens?: string; f?: string; ts?: string; grid?: string; trail?: string }
  | { path: 'api-springs'; p?: string; o?: string; k?: string; c?: string; m?: string; mode?: string; format?: string }
  | { path: 'mesh'; p?: string; s?: string; sf?: string; in?: string; bl?: string; gr?: string; rot?: string; sc?: string; bg?: string; scol?: string; pts?: string }
  | { path: 'api-mesh'; p?: string; s?: string; sf?: string; in?: string; bl?: string; gr?: string; rot?: string; sc?: string; bg?: string; scol?: string; pts?: string; format?: string }
  | { path: 'palette-generator'; colors?: string }
  | { path: 'generate'; colors?: string }
  | { path: 'create'; b?: string; a?: string; a2?: string; m?: string; s?: string; c?: string; f?: string; v?: string; xr?: string; xt?: string }
  | { path: 'about' }
  | { path: 'search'; q?: string }
  | { path: 'contrast-checker'; fg?: string; bg?: string }
  | { path: 'color-name-finder'; hex?: string }
  | { path: 'extract-from-image'; imagePreset?: string }
  | { path: 'brand-kit'; id?: string; paletteSlug?: string }
  | { path: 'play'; game?: string }
  | { path: 'play-hexle' }
  | { path: 'play-odd-one-out' }
  | { path: 'play-palette-match' }
  | { path: 'profile'; tab?: 'saved' | 'liked' | 'collections' | 'created' | 'remixes' }
  | { path: 'api-docs' }
  | { path: 'admin'; tab?: string; returnTo?: string }
  | { path: 'saved' }
  | { path: 'not-found'; requestedUrl?: string };
