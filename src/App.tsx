import React, { useState, useEffect, Suspense, lazy } from 'react';
import { RouteType } from './types';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { RainbowPaintRollerPreloader } from './components/common/RainbowPaintRollerPreloader';
import { generateFullRampsSystem, normalizeHex, isValidHex, RampsScope, RampsScheme, RampsWcag, RampsNotation, RampsVividness } from './utils/rampsEngine';
import { deserializeAntigravityConfig, serializeAntigravityConfig, generateMotionTokens, generateCssExport, generateJsExport, generateFramerMotionExport, describeMotion } from './utils/antigravityEngine';
import { deserializeSpringsConfig, serializeSpringsConfig, generateCssSpringExport, generateJsSpringExport, generateFramerMotionSpringExport, generateDtcgSpringTokens, calculateSpringMetrics } from './utils/springsEngine';
import { SpringsStudioPage } from './pages/SpringsStudioPage';
import { deserializeMeshConfig, serializeMeshConfig, generateMeshCss, generateMeshSvg, generateMeshTokensJson } from './utils/meshEngine';
import { CURATED_COLORS } from './data/colors';
import { CURATED_PALETTES } from './data/palettes';
import { CURATED_COMBOS } from './data/combos';
import { CURATED_GRADIENTS } from './data/gradients';

// Lazy-loaded route components for optimal initial bundle size and Core Web Vitals
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ColorsPage = lazy(() => import('./pages/ColorsPage').then(m => ({ default: m.ColorsPage })));
const ColorDetailPage = lazy(() => import('./pages/ColorDetailPage').then(m => ({ default: m.ColorDetailPage })));
const PalettesPage = lazy(() => import('./pages/PalettesPage').then(m => ({ default: m.PalettesPage })));
const PaletteDetailPage = lazy(() => import('./pages/PaletteDetailPage').then(m => ({ default: m.PaletteDetailPage })));
const CombosPage = lazy(() => import('./pages/CombosPage').then(m => ({ default: m.CombosPage })));
const ComboDetailPage = lazy(() => import('./pages/ComboDetailPage').then(m => ({ default: m.ComboDetailPage })));
const GradientsPage = lazy(() => import('./pages/GradientsPage').then(m => ({ default: m.GradientsPage })));
const GradientDetailPage = lazy(() => import('./pages/GradientDetailPage').then(m => ({ default: m.GradientDetailPage })));
const LiveColorsPage = lazy(() => import('./pages/LiveColorsPage').then(m => ({ default: m.LiveColorsPage })));
const SavedPage = lazy(() => import('./pages/SavedPage').then(m => ({ default: m.SavedPage })));
const MobilePaletteGeneratorPage = lazy(() => import('./pages/MobilePaletteGeneratorPage').then(m => ({ default: m.MobilePaletteGeneratorPage })));
const ContrastCheckerPage = lazy(() => import('./pages/ContrastCheckerPage').then(m => ({ default: m.ContrastCheckerPage })));
const ColorNameFinderPage = lazy(() => import('./pages/ColorNameFinderPage').then(m => ({ default: m.ColorNameFinderPage })));
const ExtractFromImagePage = lazy(() => import('./pages/ExtractFromImagePage').then(m => ({ default: m.ExtractFromImagePage })));
const BrandKitPage = lazy(() => import('./pages/BrandKitPage').then(m => ({ default: m.BrandKitPage })));
const RampsStudioPage = lazy(() => import('./pages/RampsStudioPage').then(m => ({ default: m.RampsStudioPage })));
const AntigravityStudioPage = lazy(() => import('./pages/AntigravityStudioPage').then(m => ({ default: m.AntigravityStudioPage })));
const MeshGradientStudioPage = lazy(() => import('./pages/MeshGradientStudioPage').then(m => ({ default: m.MeshGradientStudioPage })));
const CreateStudioGatewayPage = lazy(() => import('./pages/CreateStudioGatewayPage').then(m => ({ default: m.CreateStudioGatewayPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const AdminHubPage = lazy(() => import('./pages/admin/AdminHubPage').then(m => ({ default: m.AdminHubPage })));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage').then(m => ({ default: m.MaintenancePage })));

// Expanded discovery, curation, studio, utility & play routes
const ExplorePage = lazy(() => import('./pages/ExplorePage').then(m => ({ default: m.ExplorePage })));
const TrendingPage = lazy(() => import('./pages/TrendingPage').then(m => ({ default: m.TrendingPage })));
const NewPage = lazy(() => import('./pages/NewPage').then(m => ({ default: m.NewPage })));
const RandomDiscoveryPage = lazy(() => import('./pages/RandomDiscoveryPage').then(m => ({ default: m.RandomDiscoveryPage })));
const CollectionsPage = lazy(() => import('./pages/CollectionsPage').then(m => ({ default: m.CollectionsPage })));
const CollectionDetailPage = lazy(() => import('./pages/CollectionDetailPage').then(m => ({ default: m.CollectionDetailPage })));
const CreatorsPage = lazy(() => import('./pages/CreatorsPage').then(m => ({ default: m.CreatorsPage })));
const CreatorDetailPage = lazy(() => import('./pages/CreatorDetailPage').then(m => ({ default: m.CreatorDetailPage })));
const PatternsPage = lazy(() => import('./pages/PatternsPage').then(m => ({ default: m.PatternsPage })));
const PatternDetailPage = lazy(() => import('./pages/PatternDetailPage').then(m => ({ default: m.PatternDetailPage })));
const PatternStudioPage = lazy(() => import('./pages/PatternStudioPage').then(m => ({ default: m.PatternStudioPage })));
const ColorRelationshipsPage = lazy(() => import('./pages/ColorRelationshipsPage').then(m => ({ default: m.ColorRelationshipsPage })));
const ColorOfTheDayPage = lazy(() => import('./pages/ColorOfTheDayPage').then(m => ({ default: m.ColorOfTheDayPage })));
const PaletteOfTheDayPage = lazy(() => import('./pages/PaletteOfTheDayPage').then(m => ({ default: m.PaletteOfTheDayPage })));
const PaletteRemixPage = lazy(() => import('./pages/PaletteRemixPage').then(m => ({ default: m.PaletteRemixPage })));
const PlayHubPage = lazy(() => import('./pages/PlayHubPage').then(m => ({ default: m.PlayHubPage })));
const HexleGamePage = lazy(() => import('./pages/HexleGamePage').then(m => ({ default: m.HexleGamePage })));
const OddOneOutGamePage = lazy(() => import('./pages/OddOneOutGamePage').then(m => ({ default: m.OddOneOutGamePage })));
const PaletteMatchGamePage = lazy(() => import('./pages/PaletteMatchGamePage').then(m => ({ default: m.PaletteMatchGamePage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const ApiDocsPage = lazy(() => import('./pages/ApiDocsPage').then(m => ({ default: m.ApiDocsPage })));
import { useMaintenance } from './context/MaintenanceContext';

function parseUrlToRoute(): RouteType {
  const rawPath = window.location.pathname.replace(/^\/+|\/+$/g, '');
  const searchParams = new URLSearchParams(window.location.search);

  // If visiting root with Ramps query parameters (e.g. /?b=3d7dff&m=full)
  if (!rawPath && (searchParams.has('b') || searchParams.has('m') || searchParams.has('s'))) {
    return {
      path: 'ramps',
      b: searchParams.get('b') || undefined,
      a: searchParams.get('a') || undefined,
      a2: searchParams.get('a2') || undefined,
      m: searchParams.get('m') || undefined,
      s: searchParams.get('s') || undefined,
      c: searchParams.get('c') || undefined,
      f: searchParams.get('f') || undefined,
      v: searchParams.get('v') || undefined,
      xr: searchParams.get('xr') || undefined,
      xt: searchParams.get('xt') || undefined,
    };
  }

  if (!rawPath) return { path: 'home' };

  const path = rawPath.toLowerCase();
  const segments = path.split('/');
  const s0 = segments[0];
  const s1 = segments[1];
  const s2 = segments[2];

  // API Endpoint Route Handler (GET /api/palette)
  if (path === 'api/palette' || path === 'api/palettes' || (s0 === 'api' && s1 === 'palette')) {
    return {
      path: 'api-palette',
      b: searchParams.get('b') || undefined,
      a: searchParams.get('a') || undefined,
      a2: searchParams.get('a2') || undefined,
      m: searchParams.get('m') || undefined,
      s: searchParams.get('s') || undefined,
      c: searchParams.get('c') || undefined,
      f: searchParams.get('f') || undefined,
      v: searchParams.get('v') || undefined,
      xr: searchParams.get('xr') || undefined,
      xt: searchParams.get('xt') || undefined,
      format: searchParams.get('format') || 'json',
    };
  }

  // API Endpoint Route Handler (GET /api/springs or legacy /api/antigravity)
  if (
    path === 'api/springs' ||
    (s0 === 'api' && s1 === 'springs') ||
    path === 'api/antigravity' ||
    (s0 === 'api' && s1 === 'antigravity')
  ) {
    return {
      path: 'api-springs',
      p: searchParams.get('p') || undefined,
      o: searchParams.get('o') || undefined,
      k: searchParams.get('k') || undefined,
      c: searchParams.get('c') || undefined,
      m: searchParams.get('m') || undefined,
      mode: searchParams.get('mode') || undefined,
      format: searchParams.get('format') || 'json',
    };
  }

  // API Endpoint Route Handler (GET /api/mesh)
  if (path === 'api/mesh' || (s0 === 'api' && s1 === 'mesh')) {
    return {
      path: 'api-mesh',
      p: searchParams.get('p') || undefined,
      s: searchParams.get('s') || undefined,
      sf: searchParams.get('sf') || undefined,
      in: searchParams.get('in') || undefined,
      bl: searchParams.get('bl') || undefined,
      gr: searchParams.get('gr') || undefined,
      rot: searchParams.get('rot') || undefined,
      sc: searchParams.get('sc') || undefined,
      bg: searchParams.get('bg') || undefined,
      scol: searchParams.get('scol') || undefined,
      pts: searchParams.get('pts') || undefined,
      format: searchParams.get('format') || 'json',
    };
  }

  // API Documentation page (/api or /api-docs or /docs/api)
  if (path === 'api' || path === 'api-docs' || (s0 === 'docs' && s1 === 'api')) {
    return { path: 'api-docs' };
  }

  // Mesh Gradient Studio Dedicated Routes
  if (
    s0 === 'mesh' ||
    s0 === 'mesh-gradient' ||
    s0 === 'mesh-studio' ||
    s0 === 'gradient-mesh'
  ) {
    return {
      path: 'mesh',
      p: searchParams.get('p') || undefined,
      s: searchParams.get('s') || undefined,
      sf: searchParams.get('sf') || undefined,
      in: searchParams.get('in') || undefined,
      bl: searchParams.get('bl') || undefined,
      gr: searchParams.get('gr') || undefined,
      rot: searchParams.get('rot') || undefined,
      sc: searchParams.get('sc') || undefined,
      bg: searchParams.get('bg') || undefined,
      scol: searchParams.get('scol') || undefined,
      pts: searchParams.get('pts') || undefined,
    };
  }

  // Springs Studio Dedicated Routes (with antigravity redirect)
  if (
    s0 === 'springs' ||
    s0 === 'spring' ||
    s0 === 'antigravity' ||
    s0 === 'physics' ||
    s0 === 'motion' ||
    s0 === 'gravity'
  ) {
    return {
      path: 'springs',
      p: searchParams.get('p') || undefined,
      o: searchParams.get('o') || undefined,
      k: searchParams.get('k') || undefined,
      c: searchParams.get('c') || undefined,
      m: searchParams.get('m') || undefined,
      mode: searchParams.get('mode') || undefined,
      tens: searchParams.get('tens') || undefined,
      f: searchParams.get('f') || undefined,
      ts: searchParams.get('ts') || undefined,
      grid: searchParams.get('grid') || undefined,
      trail: searchParams.get('trail') || undefined,
    };
  }

  // Ramps Studio Dedicated Routes
  if (
    s0 === 'ramps' ||
    s0 === 'ramps-studio' ||
    s0 === 'tokens' ||
    s0 === 'color-ramps' ||
    s0 === 'token-generator'
  ) {
    return {
      path: 'ramps',
      b: searchParams.get('b') || undefined,
      a: searchParams.get('a') || undefined,
      a2: searchParams.get('a2') || undefined,
      m: searchParams.get('m') || undefined,
      s: searchParams.get('s') || undefined,
      c: searchParams.get('c') || undefined,
      f: searchParams.get('f') || undefined,
      v: searchParams.get('v') || undefined,
      xr: searchParams.get('xr') || undefined,
      xt: searchParams.get('xt') || undefined,
    };
  }

  // 1. Discovery Routes
  if (s0 === 'explore') {
    return {
      path: 'explore',
      mood: searchParams.get('mood') || undefined,
      useCase: searchParams.get('useCase') || searchParams.get('usecase') || undefined,
      character: searchParams.get('character') || undefined,
      season: searchParams.get('season') || undefined,
    };
  }

  if (s0 === 'trending') {
    const tabParam = searchParams.get('tab') as any;
    return { path: 'trending', tab: tabParam || 'palettes' };
  }

  if (s0 === 'new') {
    const tabParam = searchParams.get('tab') as any;
    return { path: 'new', tab: tabParam || 'palettes' };
  }

  if (s0 === 'random') {
    return { path: 'random', seed: searchParams.get('seed') || undefined };
  }

  // 2. Dailies
  if (s0 === 'color-of-the-day' || path === 'colors/daily' || path === 'color/daily') {
    return { path: 'color-of-the-day' };
  }

  if (s0 === 'palette-of-the-day' || path === 'palettes/daily' || path === 'palette/daily') {
    return { path: 'palette-of-the-day' };
  }

  // 3. Collections
  if (s0 === 'collections' || s0 === 'collection') {
    if (s1) {
      return { path: 'collection-detail', slug: decodeURIComponent(segments[1]) };
    }
    return { path: 'collections' };
  }

  // 4. Creators
  if (s0 === 'creators' || s0 === 'creator') {
    if (s1) {
      return { path: 'creator-detail', username: decodeURIComponent(segments[1]) };
    }
    return { path: 'creators' };
  }

  // 5. Patterns & Pattern Studio
  if (s0 === 'pattern-studio' || (s0 === 'create' && s1 === 'pattern') || (s0 === 'patterns' && s1 === 'create')) {
    return {
      path: 'pattern-studio',
      palette: searchParams.get('palette') || undefined,
      type: searchParams.get('type') || undefined,
      scale: searchParams.get('scale') || undefined,
      density: searchParams.get('density') || undefined,
      rotation: searchParams.get('rotation') || undefined,
    };
  }

  if (s0 === 'patterns' || s0 === 'pattern') {
    if (s1) {
      return { path: 'pattern-detail', slug: decodeURIComponent(segments[1]) };
    }
    return { path: 'patterns' };
  }

  // 6. Play & Games
  if (s0 === 'play') {
    if (s1 === 'hexle') return { path: 'play-hexle' };
    if (s1 === 'odd-one-out' || s1 === 'odd') return { path: 'play-odd-one-out' };
    if (s1 === 'palette-match' || s1 === 'match') return { path: 'play-palette-match' };
    return { path: 'play', game: s1 || undefined };
  }
  if (s0 === 'hexle') return { path: 'play-hexle' };
  if (s0 === 'odd-one-out') return { path: 'play-odd-one-out' };
  if (s0 === 'palette-match') return { path: 'play-palette-match' };

  // 7. Profile
  if (s0 === 'profile') {
    const tab = searchParams.get('tab') as any;
    return { path: 'profile', tab: tab || 'saved' };
  }

  // 8. Dedicated Live Atmosphere Routes
  if (
    path === 'palettes/live' ||
    path === 'palette/live' ||
    path === 'palettes/live-atmosphere' ||
    path === 'palette/live-atmosphere' ||
    s0 === 'live' ||
    s0 === 'live-atmosphere' ||
    s0 === 'weather' ||
    s0 === 'weather-color' ||
    s0 === 'weather-colors'
  ) {
    return { path: 'live' };
  }

  // 9. Tools & Generators
  if (s0 === 'palette-generator' || s0 === 'generator' || s0 === 'generate') {
    const colors = searchParams.get('colors') || undefined;
    return { path: 'generate', colors };
  }
  if (s0 === 'create') {
    if (s1 === 'pattern') {
      return {
        path: 'pattern-studio',
        palette: searchParams.get('palette') || undefined,
        type: searchParams.get('type') || undefined,
        scale: searchParams.get('scale') || undefined,
        density: searchParams.get('density') || undefined,
        rotation: searchParams.get('rotation') || undefined,
      };
    }
    if (s1 === 'mesh') return { path: 'mesh' };
    if (s1 === 'physics' || s1 === 'antigravity' || s1 === 'springs') return { path: 'springs' };
    if (s1 === 'image') return { path: 'extract-from-image' };
    return {
      path: 'create',
      b: searchParams.get('b') || undefined,
      a: searchParams.get('a') || undefined,
      a2: searchParams.get('a2') || undefined,
      m: searchParams.get('m') || undefined,
      s: searchParams.get('s') || undefined,
      c: searchParams.get('c') || undefined,
      f: searchParams.get('f') || undefined,
      v: searchParams.get('v') || undefined,
      xr: searchParams.get('xr') || undefined,
      xt: searchParams.get('xt') || undefined,
    };
  }
  if (s0 === 'contrast-checker' || s0 === 'contrast') {
    const fg = searchParams.get('fg') || searchParams.get('foreground') || undefined;
    const bg = searchParams.get('bg') || searchParams.get('background') || undefined;
    return { path: 'contrast-checker', fg, bg };
  }
  if (s0 === 'color-name-finder' || s0 === 'name-finder' || s0 === 'name') {
    const hex = searchParams.get('hex') || searchParams.get('color') || undefined;
    return { path: 'color-name-finder', hex };
  }
  if (s0 === 'extract-from-image' || s0 === 'extract' || s0 === 'image' || s0 === 'image-to-palette' || s0 === 'image-palette') {
    const imagePreset = searchParams.get('preset') || undefined;
    return { path: 'extract-from-image', imagePreset };
  }
  if (s0 === 'brand-kit' || s0 === 'brand') {
    const id = segments[1] || undefined;
    const paletteSlug = searchParams.get('palette') || undefined;
    return { path: 'brand-kit', id, paletteSlug };
  }

  // 10. Catalogs & Detail Routes
  if (s0 === 'colors' || s0 === 'color') {
    if (s1) {
      if (s2 === 'relationships' || s2 === 'relations' || s2 === 'harmonies') {
        return { path: 'color-relationships', slug: decodeURIComponent(segments[1]) };
      }
      return { path: 'color-detail', slug: decodeURIComponent(segments[1]) };
    }
    return { path: 'colors' };
  }

  if (s0 === 'palettes' || s0 === 'palette') {
    if (s1) {
      if (s2 === 'remix' || s2 === 'edit') {
        return { path: 'palette-remix', slug: decodeURIComponent(segments[1]) };
      }
      return { path: 'palette-detail', slug: decodeURIComponent(segments[1]) };
    }
    return { path: 'palettes' };
  }

  if (s0 === 'combos' || s0 === 'combo') {
    if (s1) {
      return { path: 'combo-detail', slug: decodeURIComponent(segments[1]) };
    }
    return { path: 'combos' };
  }

  if (s0 === 'gradients' || s0 === 'gradient') {
    if (s1) {
      return { path: 'gradient-detail', slug: decodeURIComponent(segments[1]) };
    }
    return { path: 'gradients' };
  }

  if (s0 === 'admin') {
    return { path: 'admin', tab: segments[1] || 'dashboard' };
  }

  if (s0 === 'saved') {
    return { path: 'saved' };
  }

  if (s0 === 'about') {
    return { path: 'about' };
  }

  if (s0 === 'search') {
    return { path: 'search', q: searchParams.get('q') || undefined };
  }

  // 11. Direct slug fallback support
  if (segments.length === 1) {
    const singleSlug = decodeURIComponent(segments[0]);
    const colorMatch = CURATED_COLORS.find((c) => c.slug.toLowerCase() === singleSlug);
    if (colorMatch) return { path: 'color-detail', slug: colorMatch.slug };

    const comboMatch = CURATED_COMBOS.find((cb) => cb.slug.toLowerCase() === singleSlug);
    if (comboMatch) return { path: 'combo-detail', slug: comboMatch.slug };

    const paletteMatch = CURATED_PALETTES.find((p) => p.slug.toLowerCase() === singleSlug);
    if (paletteMatch) return { path: 'palette-detail', slug: paletteMatch.slug };

    const gradientMatch = CURATED_GRADIENTS.find((g) => g.slug.toLowerCase() === singleSlug);
    if (gradientMatch) return { path: 'gradient-detail', slug: gradientMatch.slug };
  }

  return { path: 'not-found', requestedUrl: window.location.pathname };
}

function routeToUrl(route: RouteType): string {
  switch (route.path) {
    case 'home':
      return '/';
    case 'explore':
      {
        const params = new URLSearchParams();
        if (route.mood) params.set('mood', route.mood);
        if (route.useCase) params.set('useCase', route.useCase);
        if (route.character) params.set('character', route.character);
        if (route.season) params.set('season', route.season);
        const qs = params.toString();
        return qs ? `/explore?${qs}` : '/explore';
      }
    case 'trending':
      return route.tab && route.tab !== 'palettes' ? `/trending?tab=${route.tab}` : '/trending';
    case 'new':
      return route.tab && route.tab !== 'palettes' ? `/new?tab=${route.tab}` : '/new';
    case 'random':
      return route.seed ? `/random?seed=${route.seed}` : '/random';
    case 'collections':
      return '/collections';
    case 'collection-detail':
      return `/collections/${route.slug}`;
    case 'creators':
      return '/creators';
    case 'creator-detail':
      return `/creators/${route.username}`;
    case 'patterns':
      return '/patterns';
    case 'pattern-detail':
      return `/patterns/${route.slug}`;
    case 'pattern-studio':
      {
        const params = new URLSearchParams();
        if (route.palette) params.set('palette', route.palette);
        if (route.type) params.set('type', route.type);
        if (route.scale) params.set('scale', route.scale);
        if (route.density) params.set('density', route.density);
        if (route.rotation) params.set('rotation', route.rotation);
        const qs = params.toString();
        return qs ? `/pattern-studio?${qs}` : '/pattern-studio';
      }
    case 'colors':
      return '/colors';
    case 'color-detail':
      return `/colors/${route.slug}`;
    case 'color-relationships':
      return `/colors/${route.slug}/relationships`;
    case 'color-of-the-day':
      return '/color-of-the-day';
    case 'palettes':
      return '/palettes';
    case 'palette-detail':
      return `/palettes/${route.slug}`;
    case 'palette-remix':
      return `/palettes/${route.slug}/remix`;
    case 'palette-of-the-day':
      return '/palette-of-the-day';
    case 'combos':
      return '/combos';
    case 'combo-detail':
      return `/combos/${route.slug}`;
    case 'gradients':
      return '/gradients';
    case 'gradient-detail':
      return `/gradients/${route.slug}`;
    case 'play':
      return route.game ? `/play/${route.game}` : '/play';
    case 'play-hexle':
      return '/play/hexle';
    case 'play-odd-one-out':
      return '/play/odd-one-out';
    case 'play-palette-match':
      return '/play/palette-match';
    case 'profile':
      return route.tab ? `/profile?tab=${route.tab}` : '/profile';
    case 'api-docs':
      return '/api';
    case 'live':
      return '/weather';
    case 'ramps':
      {
        const params = new URLSearchParams();
        if (route.b) params.set('b', route.b.replace('#', ''));
        if (route.a) params.set('a', route.a.replace('#', ''));
        if (route.a2) params.set('a2', route.a2.replace('#', ''));
        if (route.m && route.m !== 'full') params.set('m', route.m);
        if (route.s && route.s !== 'complementary') params.set('s', route.s);
        if (route.c && route.c !== 'AA') params.set('c', route.c);
        if (route.f && route.f !== 'oklch') params.set('f', route.f);
        if (route.v && route.v !== 'natural') params.set('v', route.v);
        if (route.xr) params.set('xr', route.xr);
        if (route.xt) params.set('xt', route.xt);
        const qs = params.toString();
        return qs ? `/ramps?${qs}` : '/ramps';
      }
    case 'api-palette':
      {
        const params = new URLSearchParams();
        if (route.b) params.set('b', route.b.replace('#', ''));
        if (route.m) params.set('m', route.m);
        if (route.s) params.set('s', route.s);
        if (route.c) params.set('c', route.c);
        if (route.format) params.set('format', route.format);
        const qs = params.toString();
        return qs ? `/api/palette?${qs}` : '/api/palette';
      }
    case 'springs':
    case 'antigravity':
      {
        const params = new URLSearchParams();
        if (route.p) params.set('p', route.p);
        if (route.o && route.o !== 'circle') params.set('o', route.o);
        if (route.k && route.k !== '220') params.set('k', route.k);
        if (route.c && route.c !== '14') params.set('c', route.c);
        if (route.m && route.m !== '1') params.set('m', route.m);
        if (route.mode && route.mode !== 'single') params.set('mode', route.mode);
        if (route.f && route.f !== '0.04') params.set('f', route.f);
        const qs = params.toString();
        return qs ? `/springs?${qs}` : '/springs';
      }
    case 'api-springs':
    case 'api-antigravity':
      {
        const params = new URLSearchParams();
        if (route.p) params.set('p', route.p);
        if (route.o) params.set('o', route.o);
        if (route.k) params.set('k', route.k);
        if (route.c) params.set('c', route.c);
        if (route.m) params.set('m', route.m);
        if (route.mode) params.set('mode', route.mode);
        if (route.format) params.set('format', route.format);
        const qs = params.toString();
        return qs ? `/api/springs?${qs}` : '/api/springs';
      }
    case 'mesh':
      {
        const params = new URLSearchParams();
        if (route.p) params.set('p', route.p);
        if (route.s) params.set('s', route.s);
        if (route.sf) params.set('sf', route.sf);
        if (route.in) params.set('in', route.in);
        if (route.bl) params.set('bl', route.bl);
        if (route.gr) params.set('gr', route.gr);
        if (route.rot) params.set('rot', route.rot);
        if (route.sc) params.set('sc', route.sc);
        if (route.bg) params.set('bg', route.bg);
        if (route.scol) params.set('scol', route.scol);
        if (route.pts) params.set('pts', route.pts);
        const qs = params.toString();
        return qs ? `/mesh?${qs}` : '/mesh';
      }
    case 'api-mesh':
      {
        const params = new URLSearchParams();
        if (route.p) params.set('p', route.p);
        if (route.s) params.set('s', route.s);
        if (route.format) params.set('format', route.format);
        const qs = params.toString();
        return qs ? `/api/mesh?${qs}` : '/api/mesh';
      }
    case 'palette-generator':
    case 'generate':
      return route.colors ? `/generate?colors=${route.colors}` : '/generate';
    case 'create':
      return '/create';
    case 'about':
      return '/about';
    case 'search':
      return route.q ? `/search?q=${encodeURIComponent(route.q)}` : '/search';
    case 'contrast-checker':
      {
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
    case 'brand-kit':
      {
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

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<RouteType>(parseUrlToRoute);
  const [searchOpen, setSearchOpen] = useState(false);
  const { isActive, previewMode } = useMaintenance();

  // Complete initial boot preloader once App mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismiss = (window as any).__RAINBOW_LOADER_COMPLETE__;
      if (typeof dismiss === 'function') {
        dismiss();
      }
    }
  }, []);

  // Configure manual browser scroll restoration to prevent stuck scroll positions
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Global Scroll Restoration — Every client-side navigation resets scroll to (0, 0)
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    });
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (typeof document !== 'undefined' && document.body) {
      document.body.scrollTop = 0;
    }
  }, [currentRoute]);

  // Sync browser back/forward seamlessly
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(parseUrlToRoute());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (route: RouteType) => {
    const newUrl = routeToUrl(route);
    if (window.location.pathname + window.location.search !== newUrl) {
      setCurrentRoute(route);
      window.history.pushState(null, '', newUrl);
    } else {
      setCurrentRoute(route);
    }
  };

  // API Route renders pure text or JSON directly in browser
  if (currentRoute.path === 'api-palette') {
    const rawBrand = currentRoute.b || '3d7dff';
    const normBrand = normalizeHex(rawBrand) || '3d7dff';
    const result = generateFullRampsSystem({
      brand: normBrand,
      accent: currentRoute.a ? normalizeHex(currentRoute.a) : null,
      accent2: currentRoute.a2 ? normalizeHex(currentRoute.a2) : null,
      scope: (currentRoute.m === 'basic' ? 'basic' : 'full') as RampsScope,
      scheme: (currentRoute.s || 'complementary') as RampsScheme,
      wcag: (currentRoute.c === 'AAA' ? 'AAA' : 'AA') as RampsWcag,
      notation: (currentRoute.f || 'oklch') as RampsNotation,
      vividness: (currentRoute.v === 'bold' ? 'bold' : 'natural') as RampsVividness,
      excludedRamps: (currentRoute.xr || '').split('.').filter(Boolean),
      excludedTokens: (currentRoute.xt || '').split('.').filter(Boolean),
    });

    const isText = currentRoute.format === 'text';
    const outputString = isText ? result.rawPlainText : JSON.stringify(result.rawJson, null, 2);

    return (
      <div style={{ backgroundColor: '#0e0f12', color: '#e5e7eb', minHeight: '100dvh', padding: '24px', fontFamily: 'monospace', fontSize: '13px' }}>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {outputString}
        </pre>
      </div>
    );
  }

  // API Route for Springs motion tokens & code exports (supports legacy api-antigravity)
  if (currentRoute.path === 'api-springs' || currentRoute.path === 'api-antigravity') {
    const searchParams = new URLSearchParams();
    if (currentRoute.p) searchParams.set('p', currentRoute.p);
    if (currentRoute.o) searchParams.set('o', currentRoute.o);
    if (currentRoute.k) searchParams.set('k', currentRoute.k);
    if (currentRoute.c) searchParams.set('c', currentRoute.c);
    if (currentRoute.m) searchParams.set('m', currentRoute.m);
    if (currentRoute.mode) searchParams.set('mode', currentRoute.mode);

    const config = deserializeSpringsConfig(searchParams);
    const qs = serializeSpringsConfig(config);
    const sourceUrl = `https://kroma.design/springs?${qs}`;
    const metrics = calculateSpringMetrics(config.stiffness, config.damping, config.mass);
    const tokens = generateDtcgSpringTokens(config);

    const isText = currentRoute.format === 'text';
    let outputString = '';
    if (isText) {
      outputString = `SPRINGS STUDIO — GENERATED MOTION SPECIFICATION\n`;
      outputString += `Source: ${sourceUrl}\n\n`;
      outputString += `Architecture: ${config.mode.toUpperCase()} SPRING\n`;
      outputString += `Object Shape: ${config.object}\n`;
      outputString += `Stiffness (k): ${config.stiffness} N/m\n`;
      outputString += `Damping (c): ${config.damping} N·s/m\n`;
      outputString += `Mass (m): ${config.mass} kg\n`;
      outputString += `Natural Frequency (ω₀): ${metrics.omega0} rad/s\n`;
      outputString += `Damping Ratio (ζ): ${metrics.zeta} (${metrics.regime})\n`;
      outputString += `Period (T): ${metrics.periodMs} ms\n`;
    } else {
      outputString = JSON.stringify(
        {
          version: '2.0',
          tool: 'springs',
          source: sourceUrl,
          config,
          metrics,
          tokens,
          css: generateCssSpringExport(config, sourceUrl),
          javascript: generateJsSpringExport(config, sourceUrl),
          react: generateFramerMotionSpringExport(config),
        },
        null,
        2
      );
    }

    return (
      <div style={{ backgroundColor: '#0e0f12', color: '#e5e7eb', minHeight: '100dvh', padding: '24px', fontFamily: 'monospace', fontSize: '13px' }}>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {outputString}
        </pre>
      </div>
    );
  }

  // API Route for Mesh Gradient tokens & CSS
  if (currentRoute.path === 'api-mesh') {
    const config = deserializeMeshConfig(currentRoute);
    const qs = serializeMeshConfig(config);
    const sourceUrl = `https://kroma.design/mesh?${qs}`;

    const isCss = currentRoute.format === 'css';
    const isSvg = currentRoute.format === 'svg';
    let outputString = '';
    if (isCss) {
      outputString = generateMeshCss(config);
    } else if (isSvg) {
      outputString = generateMeshSvg(config);
    } else {
      outputString = generateMeshTokensJson(config, sourceUrl);
    }

    return (
      <div style={{ backgroundColor: '#0e0f12', color: '#e5e7eb', minHeight: '100dvh', padding: '24px', fontFamily: 'monospace', fontSize: '13px' }}>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {outputString}
        </pre>
      </div>
    );
  }

  // Admin route renders its own standalone layout (Always accessible, never locked out)
  if (currentRoute.path === 'admin') {
    return (
      <Suspense fallback={<RainbowPaintRollerPreloader fullscreen={false} />}>
        <AdminHubPage onNavigatePublic={handleNavigate} />
      </Suspense>
    );
  }

  // Centralized Public Maintenance Guard
  // When active and not in preview mode, renders the standalone MaintenancePage
  if (isActive && !previewMode) {
    return (
      <Suspense fallback={<RainbowPaintRollerPreloader fullscreen={false} />}>
        <MaintenancePage onNavigateAdmin={() => handleNavigate({ path: 'admin' })} />
      </Suspense>
    );
  }

  const renderCurrentPage = () => {
    switch (currentRoute.path) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'explore':
        return (
          <ExplorePage
            onNavigate={handleNavigate}
            initialMood={currentRoute.mood}
            initialUseCase={currentRoute.useCase}
            initialCharacter={currentRoute.character}
            initialSeason={currentRoute.season}
          />
        );
      case 'trending':
        return <TrendingPage onNavigate={handleNavigate} initialTab={currentRoute.tab} />;
      case 'new':
        return <NewPage onNavigate={handleNavigate} initialTab={currentRoute.tab} />;
      case 'random':
        return <RandomDiscoveryPage onNavigate={handleNavigate} />;
      case 'collections':
        return <CollectionsPage onNavigate={handleNavigate} />;
      case 'collection-detail':
        return <CollectionDetailPage slug={currentRoute.slug} onNavigate={handleNavigate} />;
      case 'creators':
        return <CreatorsPage onNavigate={handleNavigate} />;
      case 'creator-detail':
        return <CreatorDetailPage username={currentRoute.username} onNavigate={handleNavigate} />;
      case 'patterns':
        return <PatternsPage onNavigate={handleNavigate} />;
      case 'pattern-detail':
        return <PatternDetailPage slug={currentRoute.slug} onNavigate={handleNavigate} />;
      case 'pattern-studio':
        return (
          <PatternStudioPage
            onNavigate={handleNavigate}
            initialPaletteQuery={currentRoute.palette}
            initialType={currentRoute.type}
            initialScale={currentRoute.scale}
            initialDensity={currentRoute.density}
            initialRotation={currentRoute.rotation}
          />
        );
      case 'colors':
        return <ColorsPage onNavigate={handleNavigate} />;
      case 'color-detail':
        return <ColorDetailPage slug={currentRoute.slug} onNavigate={handleNavigate} />;
      case 'color-relationships':
        return <ColorRelationshipsPage slug={currentRoute.slug} onNavigate={handleNavigate} />;
      case 'color-of-the-day':
        return <ColorOfTheDayPage onNavigate={handleNavigate} />;
      case 'palettes':
        return <PalettesPage onNavigate={handleNavigate} />;
      case 'palette-detail':
        return <PaletteDetailPage slug={currentRoute.slug} onNavigate={handleNavigate} />;
      case 'palette-remix':
        return <PaletteRemixPage slug={currentRoute.slug} onNavigate={handleNavigate} />;
      case 'palette-of-the-day':
        return <PaletteOfTheDayPage onNavigate={handleNavigate} />;
      case 'combos':
        return <CombosPage onNavigate={handleNavigate} />;
      case 'combo-detail':
        return <ComboDetailPage slug={currentRoute.slug} onNavigate={handleNavigate} />;
      case 'gradients':
        return <GradientsPage onNavigate={handleNavigate} />;
      case 'gradient-detail':
        return <GradientDetailPage slug={currentRoute.slug} onNavigate={handleNavigate} />;
      case 'play':
        return <PlayHubPage onNavigate={handleNavigate} />;
      case 'play-hexle':
        return <HexleGamePage onNavigate={handleNavigate} />;
      case 'play-odd-one-out':
        return <OddOneOutGamePage onNavigate={handleNavigate} />;
      case 'play-palette-match':
        return <PaletteMatchGamePage onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} initialTab={currentRoute.tab} />;
      case 'api-docs':
        return <ApiDocsPage onNavigate={handleNavigate} />;
      case 'live':
        return <LiveColorsPage onNavigate={handleNavigate} />;
      case 'ramps':
        return <RampsStudioPage onNavigate={handleNavigate} initialParams={currentRoute} />;
      case 'create':
        return <CreateStudioGatewayPage onNavigate={handleNavigate} />;
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;
      case 'search':
        return <ExplorePage onNavigate={handleNavigate} initialMood={currentRoute.q} />;
      case 'springs':
      case 'antigravity':
        return <SpringsStudioPage onNavigate={handleNavigate} initialParams={currentRoute} />;
      case 'mesh':
        return <MeshGradientStudioPage onNavigate={handleNavigate} initialParams={currentRoute} />;
      case 'palette-generator':
      case 'generate':
        return (
          <MobilePaletteGeneratorPage
            initialColorsQuery={currentRoute.colors}
            onNavigate={handleNavigate}
          />
        );
      case 'contrast-checker':
        return (
          <ContrastCheckerPage
            initialFg={currentRoute.fg}
            initialBg={currentRoute.bg}
            onNavigate={handleNavigate}
          />
        );
      case 'color-name-finder':
        return (
          <ColorNameFinderPage
            initialHex={currentRoute.hex}
            onNavigate={handleNavigate}
          />
        );
      case 'extract-from-image':
        return (
          <ExtractFromImagePage
            imagePreset={currentRoute.imagePreset}
            onNavigate={handleNavigate}
          />
        );
      case 'brand-kit':
        return (
          <BrandKitPage
            initialId={currentRoute.id}
            initialPaletteSlug={currentRoute.paletteSlug}
            onNavigate={handleNavigate}
          />
        );
      case 'saved':
        return <SavedPage onNavigate={handleNavigate} />;
      case 'not-found':
        return <NotFoundPage requestedUrl={currentRoute.requestedUrl} onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  const isStudioView = ['create', 'mesh', 'pattern-studio'].includes(currentRoute.path);

  useEffect(() => {
    if (currentRoute.path === 'search') {
      setSearchOpen(true);
    }
  }, [currentRoute.path]);

  return (
    <div className="app-container">
      <Header
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        onOpenSearch={() => setSearchOpen(true)}
      />

      <main className={`main-content ${isStudioView ? 'main-content-studio' : ''}`}>
        <Suspense fallback={<RainbowPaintRollerPreloader fullscreen={false} />}>
          {renderCurrentPage()}
        </Suspense>
      </main>

      {!isStudioView && (
        <Footer onNavigate={handleNavigate} />
      )}

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
};
