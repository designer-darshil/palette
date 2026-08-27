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
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminHubPage } from './pages/admin/AdminHubPage';
import { CURATED_COLORS } from './data/colors';
import { CURATED_PALETTES } from './data/palettes';
import { CURATED_COMBOS } from './data/combos';
import { CURATED_GRADIENTS } from './data/gradients';

function parseUrlToRoute(): RouteType {
  const rawPath = window.location.pathname.replace(/^\/+|\/+$/g, '');
  if (!rawPath) return { path: 'home' };

  const path = rawPath.toLowerCase();
  const segments = path.split('/');
  const s0 = segments[0];
  const s1 = segments[1];

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

  // SEO & Head Title Management
  useEffect(() => {
    switch (currentRoute.path) {
      case 'home':
        document.title = 'KROMA — The Definitive Editorial Color & Palette Library';
        break;
      case 'colors':
        document.title = 'Color Specimens Library | 500+ Curated Gamuts | KROMA';
        break;
      case 'color-detail':
        document.title = `${currentRoute.slug.toUpperCase()} | Color Specimen | KROMA`;
        break;
      case 'palettes':
        document.title = 'Curated Palette Systems | 5-Tone Design Harmonies | KROMA';
        break;
      case 'palette-detail':
        document.title = `${currentRoute.slug.toUpperCase()} | Palette System | KROMA`;
        break;
      case 'combos':
        document.title = 'Editorial Harmonies & Pairings | WCAG AAA Tested | KROMA';
        break;
      case 'combo-detail':
        document.title = `${currentRoute.slug.toUpperCase()} | Color Harmony | KROMA`;
        break;
      case 'gradients':
        document.title = 'CSS Gradients & Multi-Stop Spectra | KROMA';
        break;
      case 'gradient-detail':
        document.title = `${currentRoute.slug.toUpperCase()} | Gradient Specimen | KROMA`;
        break;
      case 'live':
        document.title = 'Real-Time Global Color Stream | KROMA Live';
        break;
      case 'palette-generator':
        document.title = 'Mobile Palette Generator | Fast Touch-First Harmonies | KROMA';
        break;
      case 'contrast-checker':
        document.title = 'WCAG Color Contrast Checker & Accessibility Engine | KROMA';
        break;
      case 'color-name-finder':
        document.title = 'Color Name Finder & Perceptual Gamut Identifier | KROMA';
        break;
      case 'extract-from-image':
        document.title = 'Extract Color Palette from Image | KROMA Spectrum';
        break;
      case 'brand-kit':
        document.title = 'Brand Kit Studio & Design System Tokens | KROMA';
        break;
      case 'admin':
        document.title = 'Editorial CMS & Library Control | KROMA Admin';
        break;
      case 'saved':
        document.title = 'Saved Specimens | Curator Workspace | KROMA';
        break;
      case 'not-found':
        document.title = '404 — Specimen Not Found | KROMA';
        break;
    }
  }, [currentRoute]);

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
