/**
 * Lightweight, robust DOM Head manager for dynamic Technical SEO & Open Graph
 */

import { SEO_CONFIG, getCanonicalUrl } from './seoConfig';

export interface SEOHeadProps {
  title?: string;
  rawTitle?: boolean; // If true, don't append "| KROMA"
  description?: string;
  canonicalPath?: string;
  noindex?: boolean;
  nofollow?: boolean;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
  keywords?: string[];
}

function updateMetaTag(attribute: 'name' | 'property', key: string, content: string | undefined): void {
  if (typeof document === 'undefined') return;

  let element = document.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement | null;

  if (content === undefined || content === null || content === '') {
    if (element) {
      element.remove();
    }
    return;
  }

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function updateLinkTag(rel: string, href: string | undefined): void {
  if (typeof document === 'undefined') return;

  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;

  if (!href) {
    if (element) {
      element.remove();
    }
    return;
  }

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

function updateJsonLd(jsonLd: Record<string, any> | Record<string, any>[] | undefined): void {
  if (typeof document === 'undefined') return;

  const SCRIPT_ID = 'kroma-structured-data';
  let element = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

  if (!jsonLd) {
    if (element) {
      element.remove();
    }
    return;
  }

  if (!element) {
    element = document.createElement('script');
    element.id = SCRIPT_ID;
    element.type = 'application/ld+json';
    document.head.appendChild(element);
  }

  try {
    element.textContent = JSON.stringify(jsonLd, null, 2);
  } catch (err) {
    console.error('Failed to serialize JSON-LD structured data:', err);
  }
}

/**
 * Apply full SEO metadata to the current HTML document.
 */
export function applySEO(props: SEOHeadProps): void {
  if (typeof document === 'undefined') return;

  const {
    title,
    rawTitle = false,
    description = SEO_CONFIG.defaultDescription,
    canonicalPath,
    noindex = false,
    nofollow = false,
    ogType = 'website',
    ogImage = SEO_CONFIG.defaultImage,
    jsonLd,
    keywords,
  } = props;

  // 1. Page Title
  const formattedTitle = !title
    ? SEO_CONFIG.defaultTitle
    : rawTitle
    ? title
    : `${title} | ${SEO_CONFIG.siteName}`;
  document.title = formattedTitle;

  // 2. Meta Description
  updateMetaTag('name', 'description', description);

  // 3. Robots Directives
  const robotsParts: string[] = [];
  if (noindex) {
    robotsParts.push('noindex');
  } else {
    robotsParts.push('index');
  }

  if (nofollow) {
    robotsParts.push('nofollow');
  } else {
    robotsParts.push('follow');
  }

  // Add Googlebot specific tags
  const robotsContent = robotsParts.join(', ');
  updateMetaTag('name', 'robots', robotsContent);
  updateMetaTag('name', 'googlebot', robotsContent);

  // 4. Canonical URL
  const canonicalUrl = getCanonicalUrl(canonicalPath || window.location.pathname);
  updateLinkTag('canonical', canonicalUrl);

  // 5. Open Graph Meta
  updateMetaTag('property', 'og:site_name', SEO_CONFIG.siteName);
  updateMetaTag('property', 'og:type', ogType);
  updateMetaTag('property', 'og:title', formattedTitle);
  updateMetaTag('property', 'og:description', description);
  updateMetaTag('property', 'og:url', canonicalUrl);
  updateMetaTag('property', 'og:image', ogImage);
  updateMetaTag('property', 'og:locale', SEO_CONFIG.locale);

  // 6. Twitter / X Cards
  updateMetaTag('name', 'twitter:card', 'summary_large_image');
  updateMetaTag('name', 'twitter:site', SEO_CONFIG.twitterHandle);
  updateMetaTag('name', 'twitter:title', formattedTitle);
  updateMetaTag('name', 'twitter:description', description);
  updateMetaTag('name', 'twitter:image', ogImage);

  // 7. Optional Keywords (Used when helpful, never stuffed)
  if (keywords && keywords.length > 0) {
    updateMetaTag('name', 'keywords', keywords.join(', '));
  } else {
    updateMetaTag('name', 'keywords', undefined);
  }

  // 8. JSON-LD Structured Data
  updateJsonLd(jsonLd);
}
