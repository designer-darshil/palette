/**
 * Centralized SEO Configuration for KROMA Digital Color Library
 */

export const SEO_CONFIG = {
  siteName: 'KROMA',
  siteUrl: 'https://kroma.design',
  defaultTitle: 'KROMA — The Definitive Editorial Color & Palette Library',
  titleTemplate: '%s | KROMA',
  defaultDescription:
    'A curated digital color library, modernist palette catalogue, WCAG AAA harmony pairings, and CSS gradient specimens for designers and digital architects.',
  defaultImage: 'https://kroma.design/og-kroma-preview.png',
  twitterHandle: '@kromacolors',
  author: 'KROMA Editorial Team',
  locale: 'en_US',
  themeColor: '#090A0C',
} as const;

/**
 * Returns the fully qualified canonical URL for a given path.
 * Strips duplicate slashes, normalizes query params, and ensures consistent lowercase routing.
 */
export function getCanonicalUrl(path: string = '/'): string {
  const baseUrl = SEO_CONFIG.siteUrl;
  
  if (!path || path === '/' || path === 'home') {
    return `${baseUrl}/`;
  }

  // Clean leading/trailing slashes and ensure lowercase base path
  const [pathname, queryString] = path.split('?');
  const cleanPath = pathname.replace(/^\/+|\/+$/g, '').toLowerCase();

  if (!cleanPath) {
    return `${baseUrl}/`;
  }

  if (queryString) {
    return `${baseUrl}/${cleanPath}?${queryString}`;
  }

  return `${baseUrl}/${cleanPath}`;
}
