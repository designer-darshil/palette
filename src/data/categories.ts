export interface CategoryItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  tagline: string;
  image: string;
  paletteCount: number;
  collectionCount: number;
  featured?: boolean;
  tags: string[];
}

export const CURATED_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-editorial',
    slug: 'editorial',
    name: 'Editorial',
    tagline: 'High-contrast typography & publication hues',
    description: 'Disciplined sumi blacks, vermilion accents, raw titanium neutrals, and paper tones inspired by Swiss graphic design archives, art catalogs, and modernist publication culture.',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
    paletteCount: 156,
    collectionCount: 42,
    featured: true,
    tags: ['swiss', 'modernist', 'typography', 'publication', 'high-contrast', 'grid'],
  },
  {
    id: 'cat-luxury',
    slug: 'luxury',
    name: 'Luxury',
    tagline: 'Sartorial depth & gilded restraint',
    description: 'Deep espresso, champagne golds, raw travertine, and burnished leathers calibrated for haute couture, fine jewelry, and timeless atelier branding.',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
    paletteCount: 124,
    collectionCount: 38,
    featured: true,
    tags: ['couture', 'gold', 'travertine', 'rich', 'champagne', 'atelier'],
  },
  {
    id: 'cat-minimal',
    slug: 'minimal',
    name: 'Minimal',
    tagline: 'Quiet tones & calibrated negative space',
    description: 'Warm ivories, soft charcoals, pale limestone, and gentle taupes that allow architectural forms and typography to breathe without noise.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    paletteCount: 188,
    collectionCount: 56,
    featured: true,
    tags: ['neutral', 'limestone', 'ivory', 'tactile', 'quiet', 'restrained'],
  },
  {
    id: 'cat-architecture',
    slug: 'architecture',
    name: 'Architecture',
    tagline: 'Brutalist concrete, terracotta & warm plaster',
    description: 'Mineral earth, raw ceramics, sun-baked clay, aged limestone, and Mediterranean shadow play translated into robust architectural palettes.',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    paletteCount: 142,
    collectionCount: 35,
    featured: true,
    tags: ['concrete', 'terracotta', 'brutalist', 'stone', 'plaster', 'sculptural'],
  },
  {
    id: 'cat-nature',
    slug: 'nature',
    name: 'Nature',
    tagline: 'Botanical pigments & organic terrain',
    description: 'Deep moss greens, weathered lichen stone, sage mist, raw clay, and earthen ochres sourced from pristine Nordic forests and alpine biomes.',
    image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
    paletteCount: 165,
    collectionCount: 48,
    featured: true,
    tags: ['botanical', 'forest', 'earthy', 'moss', 'sage', 'organic'],
  },
  {
    id: 'cat-fashion',
    slug: 'fashion',
    name: 'Fashion',
    tagline: 'Runway palettes & textile harmonies',
    description: 'Dramatic velvet burgundies, cobalt silhouettes, dusty blush, camel wool, and iridescent accents inspired by seasonal runway collections.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
    paletteCount: 110,
    collectionCount: 29,
    featured: true,
    tags: ['textile', 'runway', 'silk', 'burgundy', 'camel', 'editorial'],
  },
  {
    id: 'cat-retro',
    slug: 'retro',
    name: 'Retro',
    tagline: 'Mid-century warmth & analog nostalgia',
    description: 'Burnt sienna, warm mustard, teal patina, olive drab, and creamy parchment derived from 1960s modernist posters and Braun industrial design.',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80',
    paletteCount: 98,
    collectionCount: 24,
    featured: true,
    tags: ['mid-century', 'analog', 'mustard', 'sienna', 'vintage', 'bauhaus'],
  },
  {
    id: 'cat-technology',
    slug: 'technology',
    name: 'Technology',
    tagline: 'Precision interfaces & calibrated digital gamuts',
    description: 'Deep void blacks, electric cyber cobalts, precision violet, and crystalline emeralds engineered for high-density interfaces and developer tools.',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    paletteCount: 135,
    collectionCount: 31,
    featured: true,
    tags: ['interface', 'oklch', 'cobalt', 'digital', 'dark-mode', 'system'],
  },
];
