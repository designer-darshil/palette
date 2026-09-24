import React from 'react';
import { RouteType } from '../../types';
import { routeToUrl } from '../../utils/routes';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to?: RouteType | string;
  onNavigate?: (route: RouteType) => void;
  children?: React.ReactNode;
}

export function routeToHref(route: RouteType | string): string {
  if (typeof route === 'string') {
    return route.startsWith('/') ? route : `/${route}`;
  }
  return routeToUrl(route);
}

export function hrefToRoute(href: string): RouteType {
  const clean = href.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!clean) return { path: 'home' };

  const segments = clean.split('/');
  const s0 = segments[0];

  if (
    clean === 'palettes/live' ||
    clean === 'palette/live' ||
    s0 === 'live' ||
    s0 === 'weather' ||
    s0 === 'weather-color' ||
    s0 === 'weather-colors'
  ) {
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
