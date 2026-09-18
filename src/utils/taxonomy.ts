export interface TaxonomyCategory {
  id: string;
  name: string;
  description: string;
  iconName?: string;
}

export const USE_CASES: TaxonomyCategory[] = [
  { id: 'branding', name: 'Branding & Identity', description: 'Distinctive, memorable brand color marks' },
  { id: 'web', name: 'Web & Product UI', description: 'Ergonomic, accessible screen interfaces' },
  { id: 'mobile', name: 'Mobile App', description: 'Compact, high-contrast mobile experiences' },
  { id: 'dashboard', name: 'Data Dashboard', description: 'Information-dense, distinct metric palettes' },
  { id: 'editorial', name: 'Editorial & Typography', description: 'Sophisticated print and publishing tones' },
  { id: 'e-commerce', name: 'E-commerce & Retail', description: 'Conversion-focused, trustworthy hues' },
  { id: 'packaging', name: 'Packaging & Print', description: 'Tangible pigment and physical surface shades' },
];

export const MOODS: TaxonomyCategory[] = [
  { id: 'calm', name: 'Calm & Serene', description: 'Tranquil teals, soft sages, and quiet neutrals' },
  { id: 'bold', name: 'Bold & Striking', description: 'High-energy, commanding primary statements' },
  { id: 'minimal', name: 'Minimal & Pure', description: 'Restrained neutrals, sumi blacks, and raw linen' },
  { id: 'luxury', name: 'Luxury & Refined', description: 'Deep emeralds, obsidian, gold, and royal indigos' },
  { id: 'warm', name: 'Warm & Earthy', description: 'Terracotta, ochre, clay, and sand' },
  { id: 'cool', name: 'Cool & Crisp', description: 'Cobalt, glacial cyan, slate, and frost' },
  { id: 'playful', name: 'Playful & Fresh', description: 'Vivid corals, citrus yellows, and lilac' },
  { id: 'technical', name: 'Technical & Modern', description: 'Monospace slates, terminal ambers, and cyan' },
];

export const VISUAL_CHARACTERS: TaxonomyCategory[] = [
  { id: 'vibrant', name: 'Vibrant & Saturated', description: 'Punchy, high-chroma tones' },
  { id: 'muted', name: 'Muted & Desaturated', description: 'Softened, matte pigments' },
  { id: 'dark', name: 'Dark Mode & Obsidian', description: 'Low-luminance surfaces with luminous accents' },
  { id: 'light', name: 'Light & Airy', description: 'High-luminance, sunlit foundations' },
  { id: 'monochrome', name: 'Monochrome & Tonal', description: 'Single-hue tonal progressions' },
  { id: 'pastel', name: 'Pastel & Gentle', description: 'High-lightness, delicate tint gamuts' },
  { id: 'high-contrast', name: 'High Contrast (AAA)', description: 'Maximum legibility and strict accessibility' },
];

export const SEASONS: TaxonomyCategory[] = [
  { id: 'spring', name: 'Spring Botanical', description: 'Emerging blossoms, crisp leaves, and petal rose' },
  { id: 'summer', name: 'Summer Solar', description: 'Sun-drenched azure, golden warmth, and pool turquoise' },
  { id: 'autumn', name: 'Autumn Ochre', description: 'Foliage russet, amber harvests, and charred bark' },
  { id: 'winter', name: 'Winter Glacial', description: 'Alpine frost, charcoal pines, and starlight slate' },
];

/**
 * Normalizes raw user tags to canonical forms
 */
export function normalizeTag(tag: string): string {
  const clean = tag.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  const synonyms: Record<string, string> = {
    'luxurious': 'luxury',
    'lux': 'luxury',
    'minimalist': 'minimal',
    'minimalism': 'minimal',
    'warmth': 'warm',
    'earth': 'earthy',
    'nature': 'earthy',
    'dark-mode': 'dark',
    'light-mode': 'light',
    'hi-contrast': 'high-contrast',
    'accessible': 'high-contrast',
    'brand': 'branding',
    'ui': 'web',
    'ux': 'web',
  };
  return synonyms[clean] || clean;
}
