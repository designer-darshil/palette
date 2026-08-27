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
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminHubPage } from './pages/admin/AdminHubPage';
import { CURATED_COLORS } from './data/colors';
import { CURATED_PALETTES } from './data/palettes';
import { CURATED_COMBOS } from './data/combos';
import { CURATED_GRADIENTS } from './data/gradients';

function parseUrlToRoute(): RouteType {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
  if (!path) return { path: 'home' };

  const segments = path.split('/');
  if (segments[0] === 'palette-generator' || segments[0] === 'generator') {
    const params = new URLSearchParams(window.location.search);
    const colors = params.get('colors') || undefined;
    return { path: 'palette-generator', colors };
  }
  if (segments[0] === 'colors') {
    if (segments[1]) {
      const match = CURATED_COLORS.find((c) => c.slug === segments[1]);
      if (match) return { path: 'color-detail', slug: match.slug };
      return { path: 'not-found', requestedUrl: window.location.pathname };
    }
    return { path: 'colors' };
  }
  if (segments[0] === 'palettes') {
    if (segments[1]) {
      const match = CURATED_PALETTES.find((p) => p.slug === segments[1]);
      if (match) return { path: 'palette-detail', slug: match.slug };
      return { path: 'not-found', requestedUrl: window.location.pathname };
    }
    return { path: 'palettes' };
  }
  if (segments[0] === 'combos') {
    if (segments[1]) {
      const match = CURATED_COMBOS.find((cb) => cb.slug === segments[1]);
      if (match) return { path: 'combo-detail', slug: match.slug };
      return { path: 'not-found', requestedUrl: window.location.pathname };
    }
    return { path: 'combos' };
  }
  if (segments[0] === 'gradients') {
    if (segments[1]) {
      const match = CURATED_GRADIENTS.find((g) => g.slug === segments[1]);
      if (match) return { path: 'gradient-detail', slug: match.slug };
      return { path: 'not-found', requestedUrl: window.location.pathname };
    }
    return { path: 'gradients' };
  }
  if (segments[0] === 'live') {
    return { path: 'live' };
  }
  if (segments[0] === 'admin') {
    return { path: 'admin', tab: segments[1] || 'dashboard' };
  }
  if (segments[0] === 'saved') {
    return { path: 'saved' };
  }

  // Direct slug support (e.g. /terracotta-cyan-split or /celestial-cobalt)
  if (segments.length === 1) {
    const singleSlug = segments[0];
    const colorMatch = CURATED_COLORS.find((c) => c.slug === singleSlug);
    if (colorMatch) return { path: 'color-detail', slug: colorMatch.slug };

    const comboMatch = CURATED_COMBOS.find((cb) => cb.slug === singleSlug);
    if (comboMatch) return { path: 'combo-detail', slug: comboMatch.slug };

    const paletteMatch = CURATED_PALETTES.find((p) => p.slug === singleSlug);
    if (paletteMatch) return { path: 'palette-detail', slug: paletteMatch.slug };

    const gradientMatch = CURATED_GRADIENTS.find((g) => g.slug === singleSlug);
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
      return '/live';
    case 'palette-generator':
      return route.colors ? `/palette-generator?colors=${route.colors}` : '/palette-generator';
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
