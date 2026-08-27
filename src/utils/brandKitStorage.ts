import { findClosestColorName } from './paletteGenerator';
import { getContrastRatio, getTextColorForBackground } from './colorUtils';

export interface BrandKitRoles {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

export interface BrandKitTypography {
  headingFont: string;
  bodyFont: string;
}

export interface BrandKitItem {
  id: string;
  name: string;
  tagline: string;
  paletteSlug?: string;
  paletteTitle?: string;
  roles: BrandKitRoles;
  typography: BrandKitTypography;
  logoText?: string;
  createdAt: string;
  updatedAt: string;
}

export const FONT_OPTIONS: { name: string; value: string; category: string }[] = [
  { name: 'Plus Jakarta Sans', value: "'Plus Jakarta Sans', sans-serif", category: 'Geometric' },
  { name: 'Inter', value: "'Inter', sans-serif", category: 'Neutral' },
  { name: 'Outfit', value: "'Outfit', sans-serif", category: 'Modern' },
  { name: 'Space Grotesk', value: "'Space Grotesk', sans-serif", category: 'Neo-Grotesk' },
  { name: 'Playfair Display', value: "'Playfair Display', serif", category: 'Editorial Serif' },
  { name: 'JetBrains Mono', value: "'JetBrains Mono', monospace", category: 'Monospace' },
];

export const DEFAULT_BRAND_KIT: BrandKitItem = {
  id: 'brand-celestial-nexus',
  name: 'Nexus Intelligence',
  tagline: 'Precision AI & Generative Color Systems',
  paletteSlug: 'celestial-cobalt',
  paletteTitle: 'Celestial Cobalt System',
  roles: {
    primary: '#10288C',
    secondary: '#5739E6',
    accent: '#E9C46A',
    background: '#0F1117',
    surface: '#1A1D27',
    text: '#F8FAFC',
    mutedText: '#94A3B8',
    border: '#334155',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  typography: {
    headingFont: "'Plus Jakarta Sans', sans-serif",
    bodyFont: "'Inter', sans-serif",
  },
  logoText: 'NEXUS',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const STORAGE_KEY = 'kroma_saved_brand_kits';

export function getSavedBrandKits(): BrandKitItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [DEFAULT_BRAND_KIT];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEFAULT_BRAND_KIT];
  } catch {
    return [DEFAULT_BRAND_KIT];
  }
}

export function saveBrandKitToStorage(kit: BrandKitItem): void {
  try {
    const all = getSavedBrandKits().filter((k) => k.id !== kit.id);
    const updated = [kit, ...all];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save brand kit to storage', err);
  }
}

export function deleteBrandKitFromStorage(id: string): void {
  try {
    const all = getSavedBrandKits().filter((k) => k.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to delete brand kit from storage', err);
  }
}

// Generate CSS design tokens snippet for developers
export function generateBrandKitCssTokens(kit: BrandKitItem): string {
  return `:root {
  /* Brand Identity: ${kit.name} */
  --brand-primary: ${kit.roles.primary};
  --brand-secondary: ${kit.roles.secondary};
  --brand-accent: ${kit.roles.accent};
  --brand-background: ${kit.roles.background};
  --brand-surface: ${kit.roles.surface};
  --brand-text: ${kit.roles.text};
  --brand-text-muted: ${kit.roles.mutedText};
  --brand-border: ${kit.roles.border};
  --brand-success: ${kit.roles.success};
  --brand-warning: ${kit.roles.warning};
  --brand-error: ${kit.roles.error};

  /* Typography */
  --font-heading: ${kit.typography.headingFont};
  --font-body: ${kit.typography.bodyFont};
}`;
}
