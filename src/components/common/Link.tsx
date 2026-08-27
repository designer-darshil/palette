import React from 'react';
import { RouteType } from '../../types';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to?: RouteType | string;
  onNavigate?: (route: RouteType) => void;
  children?: React.ReactNode;
}

export function routeToHref(route: RouteType | string): string {
  if (typeof route === 'string') {
    return route.startsWith('/') ? route : `/${route}`;
  }

  switch (route.path) {
    case 'home':
      return '/';
    case 'colors':
      return '/colors';
    case 'color-detail':
      return `/colors/${route.slug}`;
    case 'palettes':
      return '/palettes';
    case 'palette-detail':
      return `/palettes/${route.slug}`;
    case 'combos':
      return '/combos';
    case 'combo-detail':
      return `/combos/${route.slug}`;
    case 'gradients':
      return '/gradients';
    case 'gradient-detail':
      return `/gradients/${route.slug}`;
    case 'live':
      return '/palettes/live';
    case 'palette-generator':
      return route.colors ? `/palette-generator?colors=${route.colors}` : '/palette-generator';
    case 'contrast-checker': {
      const params = new URLSearchParams();
      if (route.fg) params.set('fg', route.fg.replace('#', ''));
      if (route.bg) params.set('bg', route.bg.replace('#', ''));
      const qs = params.toString();
      return qs ? `/contrast-checker?${qs}` : '/contrast-checker';
    }
    case 'color-name-finder':
      return route.hex ? `/color-name-finder?hex=${route.hex.replace('#', '')}` : '/color-name-finder';
    case 'extract-from-image':
      return route.imagePreset ? `/extract-from-image?preset=${route.imagePreset}` : '/extract-from-image';
    case 'brand-kit': {
      if (route.id) return `/brand-kit/${route.id}`;
      if (route.paletteSlug) return `/brand-kit?palette=${route.paletteSlug}`;
      return '/brand-kit';
    }
    case 'admin':
      return route.tab ? `/admin/${route.tab}` : '/admin';
    case 'saved':
      return '/saved';
    case 'not-found':
      return route.requestedUrl || '/404';
    default:
      return '/';
  }
}

export function hrefToRoute(href: string): RouteType {
  const clean = href.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!clean) return { path: 'home' };

  const segments = clean.split('/');
  const s0 = segments[0];

  if (clean === 'palettes/live' || clean === 'palette/live' || s0 === 'live') {
    return { path: 'live' };
  }
  if (s0 === 'colors') {
    return segments[1] ? { path: 'color-detail', slug: segments[1] } : { path: 'colors' };
  }
  if (s0 === 'palettes') {
    return segments[1] ? { path: 'palette-detail', slug: segments[1] } : { path: 'palettes' };
  }
  if (s0 === 'combos') {
    return segments[1] ? { path: 'combo-detail', slug: segments[1] } : { path: 'combos' };
  }
  if (s0 === 'gradients') {
    return segments[1] ? { path: 'gradient-detail', slug: segments[1] } : { path: 'gradients' };
  }
  if (s0 === 'palette-generator') return { path: 'palette-generator' };
  if (s0 === 'contrast-checker') return { path: 'contrast-checker' };
  if (s0 === 'color-name-finder') return { path: 'color-name-finder' };
  if (s0 === 'extract-from-image') return { path: 'extract-from-image' };
  if (s0 === 'brand-kit') return { path: 'brand-kit' };
  if (s0 === 'saved') return { path: 'saved' };

  return { path: 'home' };
}

export const Link: React.FC<LinkProps> = ({
  to = '/',
  onNavigate,
  children,
  onClick,
  href: propHref,
  ...rest
}) => {
  const href = propHref || (to ? routeToHref(to) : '/');

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }

    // Allow standard browser behaviors (new tab, popup, download, etc.)
    if (
      e.defaultPrevented ||
      e.button !== 0 || // not left click
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      rest.target === '_blank'
    ) {
      return;
    }

    // SPA client-side transition
    if (onNavigate) {
      e.preventDefault();
      const route: RouteType = typeof to === 'object' ? to : hrefToRoute(href);
      onNavigate(route);
    }
  };

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
};
