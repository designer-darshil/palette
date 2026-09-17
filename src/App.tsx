import React, { useState, useEffect } from 'react';
import { RouteType } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { HomePage } from './pages/HomePage';
import { ColorsPage } from './pages/ColorsPage';
import { ColorDetailPage } from './pages/ColorDetailPage';
import { PalettesPage } from './pages/PalettesPage';
import { PaletteDetailPage } from './pages/PaletteDetailPage';
import { CombosPage } from './pages/CombosPage';
import { ComboDetailPage } from './pages/ComboDetailPage';
import { GradientsPage } from './pages/GradientsPage';
import { GradientDetailPage } from './pages/GradientDetailPage';
import { LiveColorsPage } from './pages/LiveColorsPage';
import { SavedPage } from './pages/SavedPage';
import { MobilePaletteGeneratorPage } from './pages/MobilePaletteGeneratorPage';
import { ContrastCheckerPage } from './pages/ContrastCheckerPage';
import { ColorNameFinderPage } from './pages/ColorNameFinderPage';
import { ExtractFromImagePage } from './pages/ExtractFromImagePage';
import { BrandKitPage } from './pages/BrandKitPage';
import { RampsStudioPage } from './pages/RampsStudioPage';
import { AntigravityStudioPage } from './pages/AntigravityStudioPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminHubPage } from './pages/admin/AdminHubPage';
import { generateFullRampsSystem, normalizeHex, isValidHex, RampsScope, RampsScheme, RampsWcag, RampsNotation, RampsVividness } from './utils/rampsEngine';
import { deserializeAntigravityConfig, serializeAntigravityConfig, generateMotionTokens, generateCssExport, generateJsExport, generateFramerMotionExport, describeMotion } from './utils/antigravityEngine';
import { CURATED_COLORS } from './data/colors';
import { CURATED_PALETTES } from './data/palettes';
import { CURATED_COMBOS } from './data/combos';
import { CURATED_GRADIENTS } from './data/gradients';

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

  // API Endpoint Route Handler (GET /api/antigravity)
  if (path === 'api/antigravity' || (s0 === 'api' && s1 === 'antigravity')) {
    return {
      path: 'api-antigravity',
      p: searchParams.get('p') || undefined,
      o: searchParams.get('o') || undefined,
      gx: searchParams.get('gx') || undefined,
      gy: searchParams.get('gy') || undefined,
      vx: searchParams.get('vx') || undefined,
      vy: searchParams.get('vy') || undefined,
      m: searchParams.get('m') || undefined,
      r: searchParams.get('r') || undefined,
      f: searchParams.get('f') || undefined,
      d: searchParams.get('d') || undefined,
      av: searchParams.get('av') || undefined,
      ts: searchParams.get('ts') || undefined,
      format: searchParams.get('format') || 'json',
    };
  }

  // Antigravity Studio Dedicated Routes
  if (
    s0 === 'antigravity' ||
    s0 === 'physics' ||
    s0 === 'motion' ||
    s0 === 'gravity'
  ) {
    return {
      path: 'antigravity',
      p: searchParams.get('p') || undefined,
      o: searchParams.get('o') || undefined,
      gx: searchParams.get('gx') || undefined,
      gy: searchParams.get('gy') || undefined,
      vx: searchParams.get('vx') || undefined,
      vy: searchParams.get('vy') || undefined,
      m: searchParams.get('m') || undefined,
      r: searchParams.get('r') || undefined,
      f: searchParams.get('f') || undefined,
      d: searchParams.get('d') || undefined,
      av: searchParams.get('av') || undefined,
      ts: searchParams.get('ts') || undefined,
      tr: searchParams.get('tr') || undefined,
      vv: searchParams.get('vv') || undefined,
      grid: searchParams.get('grid') || undefined,
      sr: searchParams.get('sr') || undefined,
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

  // 1. Dedicated Live Atmosphere Routes (Prioritized before dynamic palette slugs)
  if (
    path === 'palettes/live' ||
    path === 'palette/live' ||
    path === 'palettes/live-atmosphere' ||
    path === 'palette/live-atmosphere' ||
    s0 === 'live' ||
    s0 === 'live-atmosphere'
  ) {
    return { path: 'live' };
  }

  // 2. Tools & Generators
  if (s0 === 'palette-generator' || s0 === 'generator') {
    const params = new URLSearchParams(window.location.search);
    const colors = params.get('colors') || undefined;
    return { path: 'palette-generator', colors };
  }
  if (s0 === 'contrast-checker' || s0 === 'contrast') {
    const params = new URLSearchParams(window.location.search);
    const fg = params.get('fg') || params.get('foreground') || undefined;
    const bg = params.get('bg') || params.get('background') || undefined;
    return { path: 'contrast-checker', fg, bg };
  }
  if (s0 === 'color-name-finder' || s0 === 'name-finder' || s0 === 'name') {
    const params = new URLSearchParams(window.location.search);
    const hex = params.get('hex') || params.get('color') || undefined;
    return { path: 'color-name-finder', hex };
  }
  if (s0 === 'extract-from-image' || s0 === 'extract' || s0 === 'image') {
    const params = new URLSearchParams(window.location.search);
    const imagePreset = params.get('preset') || undefined;
    return { path: 'extract-from-image', imagePreset };
  }
  if (s0 === 'brand-kit' || s0 === 'brand') {
    const id = segments[1] || undefined;
    const params = new URLSearchParams(window.location.search);
    const paletteSlug = params.get('palette') || undefined;
    return { path: 'brand-kit', id, paletteSlug };
  }

  // 3. Catalogs & Detail Routes
  if (s0 === 'colors' || s0 === 'color') {
    if (s1) {
      return { path: 'color-detail', slug: decodeURIComponent(segments[1]) };
    }
    return { path: 'colors' };
  }
  if (s0 === 'palettes' || s0 === 'palette') {
    if (s1) {
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

  // 4. Direct slug support (e.g. /terracotta-cyan-split or /celestial-cobalt)
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
    case 'antigravity':
      {
        const params = new URLSearchParams();
        if (route.p) params.set('p', route.p);
        if (route.o && route.o !== 'circle') params.set('o', route.o);
        if (route.gx && route.gx !== '0') params.set('gx', route.gx);
        if (route.gy && route.gy !== '-2') params.set('gy', route.gy);
        if (route.vx && route.vx !== '25') params.set('vx', route.vx);
        if (route.vy && route.vy !== '0') params.set('vy', route.vy);
        if (route.m && route.m !== '1') params.set('m', route.m);
        if (route.r && route.r !== '0.6') params.set('r', route.r);
        if (route.f && route.f !== '0.08') params.set('f', route.f);
        if (route.d && route.d !== '0.02') params.set('d', route.d);
        if (route.av && route.av !== '12') params.set('av', route.av);
        if (route.ts && route.ts !== '1') params.set('ts', route.ts);
        if (route.tr === '0') params.set('tr', '0');
        if (route.vv === '1') params.set('vv', '1');
        if (route.grid === '1') params.set('grid', '1');
        if (route.sr === '1') params.set('sr', '1');
        const qs = params.toString();
        return qs ? `/antigravity?${qs}` : '/antigravity';
      }
    case 'api-antigravity':
      {
        const params = new URLSearchParams();
        if (route.p) params.set('p', route.p);
        if (route.o) params.set('o', route.o);
        if (route.gy) params.set('gy', route.gy);
        if (route.gx) params.set('gx', route.gx);
        if (route.format) params.set('format', route.format);
        const qs = params.toString();
        return qs ? `/api/antigravity?${qs}` : '/api/antigravity';
      }
    case 'palette-generator':
      return route.colors ? `/palette-generator?colors=${route.colors}` : '/palette-generator';
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

  // Sync browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(parseUrlToRoute());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (route: RouteType) => {
    setCurrentRoute(route);
    const newUrl = routeToUrl(route);
    if (window.location.pathname !== newUrl) {
      window.history.pushState(null, '', newUrl);
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
      <div style={{ backgroundColor: '#0e0f12', color: '#e5e7eb', minHeight: '100vh', padding: '24px', fontFamily: 'monospace', fontSize: '13px' }}>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {outputString}
        </pre>
      </div>
    );
  }

  // API Route for Antigravity motion tokens & code exports
  if (currentRoute.path === 'api-antigravity') {
    const config = deserializeAntigravityConfig(currentRoute as any);
    const qs = serializeAntigravityConfig(config);
    const sourceUrl = `https://kroma.design/antigravity?${qs}`;
    const tokens = generateMotionTokens(config);
    const description = describeMotion(config);

    const isText = currentRoute.format === 'text';
    let outputString = '';
    if (isText) {
      outputString = `ANTIGRAVITY STUDIO — GENERATED MOTION SPECIFICATION\n`;
      outputString += `Source: ${sourceUrl}\n\n`;
      outputString += `Behavior: ${description}\n`;
      outputString += `Object: ${config.object}\n`;
      outputString += `Gravity: gx=${config.gravityX} m/s², gy=${config.gravityY} m/s²\n`;
      outputString += `Velocity: vx=${config.velocityX} px/s, vy=${config.velocityY} px/s\n`;
      outputString += `Mass: ${config.mass} kg, Restitution: ${config.restitution}, Damping: ${config.damping}, Friction: ${config.friction}\n`;
    } else {
      outputString = JSON.stringify(
        {
          version: '1.0',
          tool: 'antigravity',
          source: sourceUrl,
          config,
          tokens,
          css: generateCssExport(config, sourceUrl),
          javascript: generateJsExport(config, sourceUrl),
          react: generateFramerMotionExport(config, sourceUrl),
          description,
        },
        null,
        2
      );
    }

    return (
      <div style={{ backgroundColor: '#0e0f12', color: '#e5e7eb', minHeight: '100vh', padding: '24px', fontFamily: 'monospace', fontSize: '13px' }}>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {outputString}
        </pre>
      </div>
    );
  }

  // Antigravity Studio renders its dedicated layout
  if (currentRoute.path === 'antigravity') {
    return <AntigravityStudioPage onNavigate={handleNavigate} initialParams={currentRoute as any} />;
  }

  // Ramps Studio renders its dedicated high-density layout
  if (currentRoute.path === 'ramps') {
    return <RampsStudioPage onNavigate={handleNavigate} initialParams={currentRoute} />;
  }

  // Admin route renders its own standalone layout
  if (currentRoute.path === 'admin') {
    return <AdminHubPage onNavigatePublic={handleNavigate} />;
  }

  const renderCurrentPage = () => {
    switch (currentRoute.path) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'colors':
        return <ColorsPage onNavigate={handleNavigate} />;
      case 'color-detail':
        return <ColorDetailPage slug={currentRoute.slug} onNavigate={handleNavigate} />;
      case 'palettes':
        return <PalettesPage onNavigate={handleNavigate} />;
      case 'palette-detail':
        return <PaletteDetailPage slug={currentRoute.slug} onNavigate={handleNavigate} />;
      case 'combos':
        return <CombosPage onNavigate={handleNavigate} />;
      case 'combo-detail':
        return <ComboDetailPage slug={currentRoute.slug} onNavigate={handleNavigate} />;
      case 'gradients':
        return <GradientsPage onNavigate={handleNavigate} />;
      case 'gradient-detail':
        return <GradientDetailPage slug={currentRoute.slug} onNavigate={handleNavigate} />;
      case 'live':
        return <LiveColorsPage onNavigate={handleNavigate} />;
      case 'palette-generator':
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

  return (
    <div className="app-container">
      <Navbar
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        onOpenSearch={() => setSearchOpen(true)}
      />

      <main className="main-content">
        {renderCurrentPage()}
      </main>

      <Footer onNavigate={handleNavigate} />

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
};
