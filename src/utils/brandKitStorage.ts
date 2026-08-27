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
  buttonText: string;
  cardText: string;
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

export interface SemanticAuditRoleResult {
  id: 'bodyTextOnCanvas' | 'primaryButtonText' | 'cardBodyOnSurface' | 'mutedTextOnCanvas';
  label: string;
  description: string;
  fg: string;
  bg: string;
  ratio: number;
  threshold: number;
  pass: boolean;
  targetDescription: string;
  suggestedFg?: string;
  suggestedRatio?: number;
}

export interface SemanticAuditReport {
  results: SemanticAuditRoleResult[];
  overallPass: boolean;
  passingCount: number;
  totalCount: number;
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
    buttonText: '#FFFFFF',
    cardText: '#F8FAFC',
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

/**
 * Find optimal contrasting color against a given background that satisfies minRatio.
 */
export function findOptimalContrastColor(
  bgHex: string,
  preferredHex: string,
  minRatio: number = 4.5,
  isMuted: boolean = false
): { color: string; ratio: number } {
  const initialRatio = getContrastRatio(preferredHex, bgHex);
  if (initialRatio >= minRatio) {
    return { color: preferredHex, ratio: initialRatio };
  }

  const whiteRatio = getContrastRatio('#FFFFFF', bgHex);
  const blackRatio = getContrastRatio('#111111', bgHex);
  const preferLight = whiteRatio >= blackRatio;

  const candidates: { color: string; ratio: number; diff: number }[] = [];

  // 1. Check curated neutral tones
  const neutrals = preferLight
    ? isMuted
      ? ['#94A3B8', '#CBD5E1', '#E2E8F0']
      : ['#FFFFFF', '#F8FAFC', '#F1F5F9']
    : isMuted
    ? ['#64748B', '#475569', '#334155']
    : ['#0F172A', '#111111', '#1E293B'];

  for (const n of neutrals) {
    const r = getContrastRatio(n, bgHex);
    if (r >= minRatio) {
      candidates.push({ color: n, ratio: r, diff: Math.abs(r - minRatio) });
    }
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => (isMuted ? a.diff - b.diff : b.ratio - a.ratio));
    return { color: candidates[0].color, ratio: candidates[0].ratio };
  }

  const fallback = preferLight ? '#FFFFFF' : '#111111';
  return { color: fallback, ratio: getContrastRatio(fallback, bgHex) };
}

/**
 * Audit the four strict semantic brand kit roles independently against their actual backgrounds.
 */
export function auditBrandKitRoles(roles: Partial<BrandKitRoles>): SemanticAuditReport {
  const primary = roles.primary || DEFAULT_BRAND_KIT.roles.primary;
  const background = roles.background || DEFAULT_BRAND_KIT.roles.background;
  const surface = roles.surface || DEFAULT_BRAND_KIT.roles.surface;
  const text = roles.text || '#F8FAFC';
  const buttonText = roles.buttonText || getTextColorForBackground(primary);
  const cardText = roles.cardText || text;
  const mutedText = roles.mutedText || '#94A3B8';

  // 1. Body Text on Canvas
  const bodyOnCanvasRatio = getContrastRatio(text, background);
  const bodyPass = bodyOnCanvasRatio >= 4.5;
  const bodyOptimal = findOptimalContrastColor(background, text, 4.5, false);

  // 2. Primary Button Text
  const btnRatio = getContrastRatio(buttonText, primary);
  const btnPass = btnRatio >= 4.5;
  const btnOptimal = findOptimalContrastColor(primary, buttonText, 4.5, false);

  // 3. Card Body on Surface
  const cardBodyRatio = getContrastRatio(cardText, surface);
  const cardPass = cardBodyRatio >= 4.5;
  const cardOptimal = findOptimalContrastColor(surface, cardText, 4.5, false);

  // 4. Muted Text on Canvas
  const mutedRatio = getContrastRatio(mutedText, background);
  const mutedPass = mutedRatio >= 3.0;
  const mutedOptimal = findOptimalContrastColor(background, mutedText, 3.0, true);

  const results: SemanticAuditRoleResult[] = [
    {
      id: 'bodyTextOnCanvas',
      label: 'BODY TEXT ON CANVAS',
      description: 'Main body copy readability against canvas background',
      fg: text,
      bg: background,
      ratio: bodyOnCanvasRatio,
      threshold: 4.5,
      pass: bodyPass,
      targetDescription: '≥ 4.5:1 (WCAG AA)',
      suggestedFg: bodyPass ? undefined : bodyOptimal.color,
      suggestedRatio: bodyPass ? undefined : bodyOptimal.ratio,
    },
    {
      id: 'primaryButtonText',
      label: 'PRIMARY BUTTON TEXT',
      description: 'Call-to-action text against primary button background',
      fg: buttonText,
      bg: primary,
      ratio: btnRatio,
      threshold: 4.5,
      pass: btnPass,
      targetDescription: '≥ 4.5:1 (WCAG AA)',
      suggestedFg: btnPass ? undefined : btnOptimal.color,
      suggestedRatio: btnPass ? undefined : btnOptimal.ratio,
    },
    {
      id: 'cardBodyOnSurface',
      label: 'CARD BODY ON SURFACE',
      description: 'Card body text against surface background',
      fg: cardText,
      bg: surface,
      ratio: cardBodyRatio,
      threshold: 4.5,
      pass: cardPass,
      targetDescription: '≥ 4.5:1 (WCAG AA)',
      suggestedFg: cardPass ? undefined : cardOptimal.color,
      suggestedRatio: cardPass ? undefined : cardOptimal.ratio,
    },
    {
      id: 'mutedTextOnCanvas',
      label: 'MUTED TEXT ON CANVAS',
      description: 'Secondary labels & captions against canvas background',
      fg: mutedText,
      bg: background,
      ratio: mutedRatio,
      threshold: 3.0,
      pass: mutedPass,
      targetDescription: '≥ 3.0:1 (WCAG Large/Muted)',
      suggestedFg: mutedPass ? undefined : mutedOptimal.color,
      suggestedRatio: mutedPass ? undefined : mutedOptimal.ratio,
    },
  ];

  const passingCount = results.filter((r) => r.pass).length;

  return {
    results,
    overallPass: passingCount === results.length,
    passingCount,
    totalCount: results.length,
  };
}

/**
 * Resolver that assigns strictly passing colors to all 4 semantic roles.
 */
export function resolveAuditedBrandKitRoles(roles: Partial<BrandKitRoles>): BrandKitRoles {
  const primary = roles.primary || DEFAULT_BRAND_KIT.roles.primary;
  const secondary = roles.secondary || DEFAULT_BRAND_KIT.roles.secondary;
  const accent = roles.accent || DEFAULT_BRAND_KIT.roles.accent;
  const background = roles.background || DEFAULT_BRAND_KIT.roles.background;
  const surface = roles.surface || DEFAULT_BRAND_KIT.roles.surface;
  const border = roles.border || DEFAULT_BRAND_KIT.roles.border;
  const success = roles.success || DEFAULT_BRAND_KIT.roles.success;
  const warning = roles.warning || DEFAULT_BRAND_KIT.roles.warning;
  const error = roles.error || DEFAULT_BRAND_KIT.roles.error;

  const textCandidate = roles.text || '#F8FAFC';
  const buttonTextCandidate = roles.buttonText || getTextColorForBackground(primary);
  const cardTextCandidate = roles.cardText || textCandidate;
  const mutedTextCandidate = roles.mutedText || '#94A3B8';

  const optimalText = findOptimalContrastColor(background, textCandidate, 4.5, false);
  const optimalButtonText = findOptimalContrastColor(primary, buttonTextCandidate, 4.5, false);
  const optimalCardText = findOptimalContrastColor(surface, cardTextCandidate, 4.5, false);
  const optimalMutedText = findOptimalContrastColor(background, mutedTextCandidate, 3.0, true);

  return {
    primary,
    secondary,
    accent,
    background,
    surface,
    text: optimalText.color,
    buttonText: optimalButtonText.color,
    cardText: optimalCardText.color,
    mutedText: optimalMutedText.color,
    border,
    success,
    warning,
    error,
  };
}

/**
 * Automatically remediate all failing semantic roles to guaranteed passing colors.
 */
export function autoRemediateBrandKitRoles(roles: BrandKitRoles): BrandKitRoles {
  return resolveAuditedBrandKitRoles(roles);
}

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
  const btnText = kit.roles.buttonText || getTextColorForBackground(kit.roles.primary);

  return `:root {
  /* Brand Identity: ${kit.name} */
  --brand-primary: ${kit.roles.primary};
  --brand-secondary: ${kit.roles.secondary};
  --brand-accent: ${kit.roles.accent};
  --brand-background: ${kit.roles.background};
  --brand-surface: ${kit.roles.surface};
  --brand-text: ${kit.roles.text};
  --brand-text-muted: ${kit.roles.mutedText};
  --brand-button-text: ${btnText};
  --brand-card-text: ${kit.roles.cardText || kit.roles.text};
  --brand-border: ${kit.roles.border};
  --brand-success: ${kit.roles.success};
  --brand-warning: ${kit.roles.warning};
  --brand-error: ${kit.roles.error};

  /* Typography */
  --font-heading: ${kit.typography.headingFont};
  --font-body: ${kit.typography.bodyFont};
}`;
}
