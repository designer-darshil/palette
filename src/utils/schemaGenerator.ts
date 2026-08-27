/**
 * Schema.org JSON-LD Structured Data Generators for KROMA
 * Conforms strictly to Google Search Central structured data specifications.
 */

import { SEO_CONFIG, getCanonicalUrl } from './seoConfig';
import { ColorItem, PaletteItem, ComboItem, GradientItem } from '../types';

/**
 * WebSite schema with internal SearchAction for rich home search representation.
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SEO_CONFIG.siteName,
    url: SEO_CONFIG.siteUrl,
    description: SEO_CONFIG.defaultDescription,
    publisher: {
      '@type': 'Organization',
      name: SEO_CONFIG.siteName,
      url: SEO_CONFIG.siteUrl,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SEO_CONFIG.siteUrl}/colors?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * BreadcrumbList schema for nested navigational hierarchies.
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: getCanonicalUrl(item.url),
    })),
  };
}

/**
 * WebApplication schema for interactive color tools & design engines.
 */
export function generateWebApplicationSchema(options: {
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${options.name} — ${SEO_CONFIG.siteName}`,
    description: options.description,
    url: getCanonicalUrl(options.url),
    applicationCategory: options.applicationCategory,
    operatingSystem: 'Any (Web-based)',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
}

/**
 * CollectionPage & ItemList schema for catalog pages (Colors, Palettes, Combos, Gradients).
 */
export function generateCollectionPageSchema(options: {
  name: string;
  description: string;
  url: string;
  items: { name: string; url: string; description?: string }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: options.name,
    description: options.description,
    url: getCanonicalUrl(options.url),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: options.items.length,
      itemListElement: options.items.slice(0, 30).map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: getCanonicalUrl(item.url),
        description: item.description,
      })),
    },
  };
}

/**
 * Color Specimen Schema (CreativeWork / VisualArtwork with design attributes).
 */
export function generateColorSchema(color: ColorItem) {
  const pageUrl = getCanonicalUrl(`/colors/${color.slug}`);
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: `${color.name} (${color.hex}) Color Specimen`,
      headline: `${color.name} — ${color.hex} Color Specimen`,
      description: color.description,
      url: pageUrl,
      genre: 'Digital Color Specimen',
      keywords: color.tags.join(', '),
      additionalProperty: [
        { '@type': 'PropertyValue', name: 'HEX Code', value: color.hex },
        { '@type': 'PropertyValue', name: 'RGB Value', value: color.rgb },
        { '@type': 'PropertyValue', name: 'HSL Value', value: color.hsl },
        { '@type': 'PropertyValue', name: 'OKLCH Gamut', value: color.oklch },
        { '@type': 'PropertyValue', name: 'Color Family', value: color.family },
        { '@type': 'PropertyValue', name: 'Hue Group', value: color.hueGroup },
        { '@type': 'PropertyValue', name: 'WCAG White Contrast', value: `${color.contrastWithWhite}:1` },
        { '@type': 'PropertyValue', name: 'WCAG Black Contrast', value: `${color.contrastWithBlack}:1` },
      ],
    },
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Colors', url: '/colors' },
      { name: color.family.toUpperCase(), url: `/colors?family=${color.family}` },
      { name: color.name, url: `/colors/${color.slug}` },
    ]),
  ];
}

/**
 * Palette System Schema (Dataset / CreativeWork).
 */
export function generatePaletteSchema(palette: PaletteItem) {
  const pageUrl = getCanonicalUrl(`/palettes/${palette.slug}`);
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: `${palette.title} Color Palette System`,
      headline: `${palette.title} — ${palette.category} Palette System`,
      description: palette.description,
      url: pageUrl,
      genre: 'Color Palette System',
      keywords: palette.tags.join(', '),
      additionalProperty: palette.colors.map((c, i) => ({
        '@type': 'PropertyValue',
        name: `Tone ${i + 1} (${c.role || c.name})`,
        value: `${c.name} (${c.hex})`,
      })),
    },
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Palettes', url: '/palettes' },
      { name: palette.category, url: `/palettes?category=${encodeURIComponent(palette.category)}` },
      { name: palette.title, url: `/palettes/${palette.slug}` },
    ]),
  ];
}

/**
 * Combo Harmony Specimen Schema.
 */
export function generateComboSchema(combo: ComboItem) {
  const pageUrl = getCanonicalUrl(`/combos/${combo.slug}`);
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: `${combo.title} Color Harmony Pairing`,
      headline: `${combo.title} — ${combo.harmonyType}`,
      description: combo.description,
      url: pageUrl,
      additionalProperty: [
        { '@type': 'PropertyValue', name: 'Harmony Type', value: combo.harmonyType },
        { '@type': 'PropertyValue', name: 'Contrast Score', value: combo.contrastScore },
        { '@type': 'PropertyValue', name: 'Usage Context', value: combo.usageContext },
      ],
    },
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Combos', url: '/combos' },
      { name: combo.title, url: `/combos/${combo.slug}` },
    ]),
  ];
}

/**
 * Gradient Specimen Schema.
 */
export function generateGradientSchema(gradient: GradientItem) {
  const pageUrl = getCanonicalUrl(`/gradients/${gradient.slug}`);
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: `${gradient.title} CSS Gradient Specimen`,
      headline: `${gradient.title} CSS Gradient`,
      description: `CSS gradient specimen with ${gradient.stops.length} color stops (${gradient.css}).`,
      url: pageUrl,
      additionalProperty: [
        { '@type': 'PropertyValue', name: 'Gradient CSS', value: gradient.css },
        { '@type': 'PropertyValue', name: 'Gradient Type', value: gradient.type },
        { '@type': 'PropertyValue', name: 'Category', value: gradient.category },
      ],
    },
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Gradients', url: '/gradients' },
      { name: gradient.title, url: `/gradients/${gradient.slug}` },
    ]),
  ];
}
