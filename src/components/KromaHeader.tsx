import React, { useState, useEffect } from 'react';
import {
  Search,
  Bookmark,
  Menu,
  X,
  Compass,
  TrendingUp,
  Clock,
  Shuffle,
  Palette,
  Layers,
  Grid,
  Users,
  Gamepad2,
  Sparkles,
  Wand2,
  Image as ImageIcon,
  ShieldCheck,
  Radio,
  Code,
  Sun,
  Moon,
} from 'lucide-react';
import { RouteType } from '../types';
import { useSaved } from '../context/SavedContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from './common/Link';

interface KromaHeaderProps {
  currentRoute: RouteType;
  onNavigate: (route: RouteType) => void;
  onOpenSearch: () => void;
}

export const KromaHeader: React.FC<KromaHeaderProps> = ({
  currentRoute,
  onNavigate,
  onOpenSearch,
}) => {
  const { savedItems } = useSaved();
  const { theme, setTheme, toggleTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = currentRoute.path === 'home';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock document scroll when drawer is open
  useEffect(() => {
    if (!drawerOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawerOpen]);

  const totalSaved = savedItems.length;

  const isActive = (path: string) => {
    if (path === 'generate' && (currentRoute.path === 'generate' || currentRoute.path === 'palette-generator')) {
      return true;
    }
    return currentRoute.path === path;
  };

  const handleNav = (route: RouteType) => {
    onNavigate(route);
    setDrawerOpen(false);
  };

  return (
    <>
      <header
        className={`w-full transition-colors duration-200 z-50 ${
          isHome && !scrolled
            ? 'absolute top-0 left-0 text-white bg-gradient-to-b from-black/50 to-transparent'
            : 'sticky top-0 bg-[#F5F2EB]/95 backdrop-blur-[6px] text-[#151513] border-b border-[rgba(21,21,19,0.08)]'
        }`}
      >
        {/* Container with exact height (desktop 66px, mobile 58px) and horizontal padding (desktop 32px, mobile 16px) */}
        <div className="max-w-[1360px] mx-auto px-4 md:px-8 h-[58px] md:h-[66px] flex items-center justify-between">
          
          {/* Zone 1: Left (1fr) — Wordmark */}
          <div className="flex-1 flex items-center justify-start">
            <Link
              to={{ path: 'home' }}
              onNavigate={onNavigate}
              className="font-sans font-semibold text-[11px] md:text-[12px] tracking-[0.14em] uppercase text-inherit hover:opacity-80 transition-opacity"
            >
              KROMA
            </Link>
          </div>

          {/* Zone 2: Center (auto) — Main Navigation */}
          <nav className="hidden md:flex items-center justify-center gap-7 flex-none">
            <Link
              to={{ path: 'explore' }}
              onNavigate={onNavigate}
              className={`font-sans text-[10.5px] uppercase tracking-[0.08em] transition-all relative py-1 ${
                isActive('explore')
                  ? 'opacity-100 font-medium after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-current'
                  : 'opacity-70 hover:opacity-100 font-normal'
              }`}
            >
              Explore
            </Link>

            <Link
              to={{ path: 'generate' }}
              onNavigate={onNavigate}
              className={`font-sans text-[10.5px] uppercase tracking-[0.08em] transition-all relative py-1 ${
                isActive('generate')
                  ? 'opacity-100 font-medium after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-current'
                  : 'opacity-70 hover:opacity-100 font-normal'
              }`}
            >
              Generate
            </Link>

            <Link
              to={{ path: 'studio' }}
              onNavigate={onNavigate}
              className={`font-sans text-[10.5px] uppercase tracking-[0.08em] transition-all relative py-1 ${
                isActive('studio')
                  ? 'opacity-100 font-medium after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-current'
                  : 'opacity-70 hover:opacity-100 font-normal'
              }`}
            >
              Studio
            </Link>

            <Link
              to={{ path: 'collections' }}
              onNavigate={onNavigate}
              className={`font-sans text-[10.5px] uppercase tracking-[0.08em] transition-all relative py-1 ${
                isActive('collections')
                  ? 'opacity-100 font-medium after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-current'
                  : 'opacity-70 hover:opacity-100 font-normal'
              }`}
            >
              Collections
            </Link>

            {/* Studios Quick Dropdown */}
            <div className="relative group">
              <button
                className={`font-sans text-[10.5px] uppercase tracking-[0.08em] transition-all flex items-center gap-1 py-1 ${
                  [
                    'ramps',
                    'antigravity',
                    'mesh',
                    'live',
                    'brand-kit',
                    'play',
                    'image-to-palette',
                  ].includes(currentRoute.path)
                    ? 'opacity-100 font-medium after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-current'
                    : 'opacity-70 hover:opacity-100 font-normal'
                }`}
              >
                <span>Studios</span>
                <span className="text-[7px] opacity-60">▼</span>
              </button>

              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-1.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all">
                <div className="w-52 bg-[#F8F6F0] text-[#151513] border border-[rgba(21,21,19,0.12)] rounded-[3px] p-1.5 shadow-lg flex flex-col gap-0.5">
                  <div className="px-2.5 py-1 font-mono text-[8.5px] uppercase tracking-widest text-[#8E8A81] border-b border-[rgba(21,21,19,0.08)] mb-0.5 font-medium">
                    CREATIVE WORKBENCHES
                  </div>
                  {[
                    { path: 'ramps', label: 'OKLCH Ramps', code: 'RAMPS' },
                    { path: 'antigravity', label: 'Antigravity Physics', code: 'PHYSICS' },
                    { path: 'mesh', label: 'Mesh Gradient', code: 'MESH' },
                    { path: 'pattern-studio', label: 'Pattern Studio', code: 'PATTERN' },
                    { path: 'extract-from-image', label: 'Extract from Image', code: 'VISION' },
                    { path: 'brand-kit', label: 'Brand Kit Studio', code: 'BRAND' },
                    { path: 'contrast-checker', label: 'Contrast Checker', code: 'WCAG' },
                    { path: 'color-name-finder', label: 'Color Name Finder', code: 'NAMES' },
                    { path: 'live', label: 'Live Atmosphere', code: 'LIVE' },
                    { path: 'play', label: 'Sensory Games', code: 'PLAY' },
                  ].map((s) => (
                    <button
                      key={s.path}
                      onClick={() => onNavigate({ path: s.path as any })}
                      className="px-2.5 py-1 text-left text-[11px] font-sans hover:bg-[#F5F2EB] rounded-[2px] transition-colors flex items-center justify-between"
                    >
                      <span>{s.label}</span>
                      <span className="font-mono text-[8.5px] text-[#8E8A81]">{s.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Zone 3: Right (1fr) — Search, Saved, Menu Drawer Trigger */}
          <div className="flex-1 flex items-center justify-end gap-3 md:gap-3.5">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-1 hover:opacity-75 transition-opacity flex items-center gap-1.5"
              aria-label="Search KROMA archive"
              title="Search (⌘K)"
            >
              <Search size={15} strokeWidth={1.5} />
              <span className="hidden lg:inline text-[9px] font-mono uppercase tracking-widest opacity-60">
                ⌘K
              </span>
            </button>

            {/* Saved Trigger */}
            <Link
              to={{ path: 'saved' }}
              onNavigate={onNavigate}
              className="p-1 hover:opacity-75 transition-opacity relative flex items-center"
              aria-label="Saved collections"
              title="Saved"
            >
              <Bookmark size={15} strokeWidth={1.5} />
              {totalSaved > 0 && (
                <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#151513] text-[#F5F2EB] text-[8px] font-mono flex items-center justify-center font-bold">
                  {totalSaved > 99 ? '99+' : totalSaved}
                </span>
              )}
            </Link>

            {/* Menu Drawer Button (Accessible across Desktop & Mobile) */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-1 hover:opacity-75 transition-opacity flex items-center gap-1 ml-0.5"
              aria-label="Open complete options menu"
              title="All Directory & Studio Engines"
            >
              <Menu size={17} strokeWidth={1.5} />
            </button>
          </div>

        </div>
      </header>

      {/* Slide-out Navigation Drawer with ALL PaletteParadise & Kroma Options */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="mobile-nav-backdrop"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div
            className="mobile-nav-overlay mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Directory & Studio Engines"
          >
            {/* Header */}
            <div className="mobile-nav__header">
              <div
                onClick={() => handleNav({ path: 'home' })}
                className="flex items-center gap-2 cursor-pointer select-none"
              >
                <span className="w-3.5 h-3.5 rounded-[2px] bg-gradient-to-tr from-[#3B82F6] via-[#EC4899] to-[#E9C46A] shrink-0 inline-block shadow-sm" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                  PALETTEPARADISE
                </span>
              </div>

              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-[4px] flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close navigation"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Scrollable Options Body */}
            <div className="mobile-nav__options">
              
              {/* SECTION 1: DISCOVERY & GAMUTS */}
              <div className="mobile-nav__section-header">
                DISCOVERY &amp; GAMUTS
              </div>

              <button
                onClick={() => handleNav({ path: 'explore' })}
                className={`mobile-nav-link w-full text-left ${isActive('explore') ? 'active' : ''}`}
              >
                <span>Explore Spectrum</span>
                <Compass size={16} />
              </button>

              <button
                onClick={() => handleNav({ path: 'trending' })}
                className={`mobile-nav-link w-full text-left ${isActive('trending') ? 'active' : ''}`}
              >
                <span>Trending Specimens</span>
                <TrendingUp size={16} />
              </button>

              <button
                onClick={() => handleNav({ path: 'new' })}
                className={`mobile-nav-link w-full text-left ${isActive('new') ? 'active' : ''}`}
              >
                <span>New Releases</span>
                <Clock size={16} />
              </button>

              <button
                onClick={() => handleNav({ path: 'random' })}
                className={`mobile-nav-link w-full text-left ${isActive('random') ? 'active' : ''}`}
              >
                <span>Random Discovery</span>
                <Shuffle size={16} />
              </button>

              <button
                onClick={() => handleNav({ path: 'colors' })}
                className={`mobile-nav-link w-full text-left ${isActive('colors') ? 'active' : ''}`}
              >
                <span>Color Specimens</span>
                <Palette size={16} />
              </button>

              <button
                onClick={() => handleNav({ path: 'palettes' })}
                className={`mobile-nav-link w-full text-left ${isActive('palettes') ? 'active' : ''}`}
              >
                <span>Palette Systems</span>
                <Layers size={16} />
              </button>

              <button
                onClick={() => handleNav({ path: 'patterns' })}
                className={`mobile-nav-link w-full text-left ${isActive('patterns') ? 'active' : ''}`}
              >
                <span>Generative Patterns</span>
                <Grid size={16} />
              </button>

              <button
                onClick={() => handleNav({ path: 'collections' })}
                className={`mobile-nav-link w-full text-left ${isActive('collections') ? 'active' : ''}`}
              >
                <span>Curated Collections</span>
                <Layers size={16} />
              </button>

              <button
                onClick={() => handleNav({ path: 'creators' })}
                className={`mobile-nav-link w-full text-left ${isActive('creators') ? 'active' : ''}`}
              >
                <span>Designers &amp; Colorists</span>
                <Users size={16} />
              </button>

              <button
                onClick={() => handleNav({ path: 'play' })}
                className={`mobile-nav-link w-full text-left ${isActive('play') ? 'active' : ''}`}
              >
                <span>Sensory Play &amp; Games</span>
                <Gamepad2 size={16} />
              </button>

              {/* SECTION 2: STUDIO ENGINES */}
              <div className="mobile-nav__section-header">
                STUDIO ENGINES
              </div>

              <button
                onClick={() => handleNav({ path: 'ramps' })}
                className={`mobile-nav-link w-full text-left ${isActive('ramps') ? 'active' : ''}`}
              >
                <span>Ramps Studio (OKLCH)</span>
                <Layers size={16} className="text-emerald-400" />
              </button>

              <button
                onClick={() => handleNav({ path: 'antigravity' })}
                className={`mobile-nav-link w-full text-left ${isActive('antigravity') ? 'active' : ''}`}
              >
                <span>Antigravity Physics</span>
                <Compass size={16} className="text-cyan-400" />
              </button>

              <button
                onClick={() => handleNav({ path: 'mesh' })}
                className={`mobile-nav-link w-full text-left ${isActive('mesh') ? 'active' : ''}`}
              >
                <span>Mesh Gradient Studio</span>
                <Wand2 size={16} className="text-purple-400" />
              </button>

              <button
                onClick={() => handleNav({ path: 'pattern-studio' })}
                className={`mobile-nav-link w-full text-left ${isActive('pattern-studio') ? 'active' : ''}`}
              >
                <span>Pattern Studio</span>
                <Grid size={16} className="text-amber-400" />
              </button>

              <button
                onClick={() => handleNav({ path: 'extract-from-image' })}
                className={`mobile-nav-link w-full text-left ${isActive('extract-from-image') || isActive('image-to-palette') ? 'active' : ''}`}
              >
                <span>Extract from Image</span>
                <ImageIcon size={16} className="text-blue-400" />
              </button>

              <button
                onClick={() => handleNav({ path: 'studio' })}
                className={`mobile-nav-link w-full text-left ${isActive('studio') ? 'active' : ''}`}
              >
                <span>Kroma Studio</span>
                <Sparkles size={16} className="text-amber-300" />
              </button>

              <button
                onClick={() => handleNav({ path: 'brand-kit' })}
                className={`mobile-nav-link w-full text-left ${isActive('brand-kit') ? 'active' : ''}`}
              >
                <span>Brand Kit Studio</span>
                <Palette size={16} className="text-pink-400" />
              </button>

              <button
                onClick={() => handleNav({ path: 'contrast-checker' })}
                className={`mobile-nav-link w-full text-left ${isActive('contrast-checker') ? 'active' : ''}`}
              >
                <span>Color Contrast Checker</span>
                <ShieldCheck size={16} className="text-sky-400" />
              </button>

              <button
                onClick={() => handleNav({ path: 'color-name-finder' })}
                className={`mobile-nav-link w-full text-left ${isActive('color-name-finder') ? 'active' : ''}`}
              >
                <span>Color Name Finder</span>
                <Search size={16} className="text-emerald-400" />
              </button>

              <button
                onClick={() => handleNav({ path: 'live' })}
                className={`mobile-nav-link w-full text-left ${isActive('live') ? 'active' : ''}`}
              >
                <span>Real-Time Live Atmosphere</span>
                <Radio size={16} className="text-rose-400" />
              </button>

              {/* SECTION 3: WORKSPACE & THEME */}
              <div className="mobile-nav__section-header">
                WORKSPACE &amp; THEME
              </div>

              <button
                onClick={() => handleNav({ path: 'saved' })}
                className={`mobile-nav-link w-full text-left ${isActive('saved') ? 'active' : ''}`}
              >
                <span>Curator Workspace ({totalSaved})</span>
                <Bookmark size={16} />
              </button>

              <button
                onClick={() => handleNav({ path: 'api-docs' })}
                className={`mobile-nav-link w-full text-left ${isActive('api-docs') ? 'active' : ''}`}
              >
                <span>Developer API &amp; Tokens</span>
                <Code size={16} />
              </button>

              <button
                onClick={toggleTheme}
                className="mobile-nav-link w-full text-left flex justify-between items-center"
              >
                <span>Theme: {theme.toUpperCase()}</span>
                {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} color="#E9C46A" />}
              </button>

            </div>
          </div>
        </>
      )}
    </>
  );
};
