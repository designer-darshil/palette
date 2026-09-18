import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bookmark,
  Menu,
  X,
  Layers,
  Palette,
  Sparkles,
  Wand2,
  Radio,
  Sun,
  Moon,
  ShieldCheck,
  ChevronDown,
  Image as ImageIcon,
  Wrench,
  Compass,
  Grid,
  TrendingUp,
  Clock,
  Shuffle,
  Gamepad2,
  Users,
  Code,
  User,
} from 'lucide-react';
import { RouteType } from '../types';
import { useSaved } from '../context/SavedContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from './common/Link';

interface NavbarProps {
  currentRoute: RouteType;
  onNavigate: (route: RouteType) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onNavigate, onOpenSearch }) => {
  const { savedItems } = useSaved();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [studiosDropdownOpen, setStudiosDropdownOpen] = useState(false);
  const [communityDropdownOpen, setCommunityDropdownOpen] = useState(false);

  const studiosDropdownRef = useRef<HTMLDivElement>(null);
  const communityDropdownRef = useRef<HTMLDivElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);

  // Document Scroll Lock System for Mobile Navigation
  useEffect(() => {
    if (!mobileOpen) return;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.classList.add('nav-open');
    document.body.classList.add('nav-open');
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        mobileToggleRef.current?.focus();
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 900) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      document.documentElement.classList.remove('nav-open');
      document.body.classList.remove('nav-open');
      document.body.style.paddingRight = '';
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (studiosDropdownRef.current && !studiosDropdownRef.current.contains(e.target as Node)) {
        setStudiosDropdownOpen(false);
      }
      if (communityDropdownRef.current && !communityDropdownRef.current.contains(e.target as Node)) {
        setCommunityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isStudioActive =
    currentRoute.path === 'ramps' ||
    currentRoute.path === 'antigravity' ||
    currentRoute.path === 'mesh' ||
    currentRoute.path === 'brand-kit' ||
    currentRoute.path === 'live' ||
    currentRoute.path === 'palette-generator' ||
    currentRoute.path === 'extract-from-image' ||
    currentRoute.path === 'pattern-studio' ||
    currentRoute.path === 'contrast-checker' ||
    currentRoute.path === 'color-name-finder';

  const isCommunityActive =
    currentRoute.path === 'collections' ||
    currentRoute.path === 'collection-detail' ||
    currentRoute.path === 'creators' ||
    currentRoute.path === 'creator-detail' ||
    currentRoute.path === 'trending' ||
    currentRoute.path === 'new' ||
    currentRoute.path === 'play' ||
    currentRoute.path === 'play-hexle' ||
    currentRoute.path === 'play-odd-one-out' ||
    currentRoute.path === 'play-palette-match';

  const isActive = (path: string) => {
    if (path === 'home' && currentRoute.path === 'home') return true;
    if (path === 'explore' && (currentRoute.path === 'explore' || currentRoute.path === 'random')) return true;
    if (path === 'colors' && (currentRoute.path === 'colors' || currentRoute.path === 'color-detail' || currentRoute.path === 'color-relationships' || currentRoute.path === 'color-of-the-day')) return true;
    if (path === 'palettes' && (currentRoute.path === 'palettes' || currentRoute.path === 'palette-detail' || currentRoute.path === 'palette-remix' || currentRoute.path === 'palette-of-the-day')) return true;
    if (path === 'patterns' && (currentRoute.path === 'patterns' || currentRoute.path === 'pattern-detail')) return true;
    if (path === 'combos' && (currentRoute.path === 'combos' || currentRoute.path === 'combo-detail')) return true;
    if (path === 'gradients' && (currentRoute.path === 'gradients' || currentRoute.path === 'gradient-detail')) return true;
    if (path === 'saved' && (currentRoute.path === 'saved' || currentRoute.path === 'profile')) return true;
    return false;
  };

  const handleNav = (route: RouteType) => {
    onNavigate(route);
    setMobileOpen(false);
    setStudiosDropdownOpen(false);
    setCommunityDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cycleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const studioTools = [
    {
      id: 'ramps',
      title: 'Ramps Studio',
      description: 'Perceptual OKLCH ramps & WCAG semantic tokens',
      icon: <Layers size={15} className="text-emerald-400" />,
      path: { path: 'ramps' } as RouteType,
    },
    {
      id: 'antigravity',
      title: 'Antigravity Studio',
      description: 'Physics & motion generator with deterministic exports',
      icon: <Compass size={15} className="text-cyan-400" />,
      path: { path: 'antigravity' } as RouteType,
    },
    {
      id: 'mesh',
      title: 'Mesh Gradient Studio',
      description: 'Multi-point radial mesh canvas & design token exports',
      icon: <Wand2 size={15} className="text-purple-400" />,
      path: { path: 'mesh' } as RouteType,
    },
    {
      id: 'pattern-studio',
      title: 'Pattern Studio',
      description: 'Algorithmic vector surfaces, grids & seamless SVG textures',
      icon: <Grid size={15} className="text-amber-400" />,
      path: { path: 'pattern-studio' } as RouteType,
    },
    {
      id: 'palette-generator',
      title: 'Palette Generator',
      description: 'Generative chromatic balance with swatch locking',
      icon: <Sparkles size={15} className="text-pink-400" />,
      path: { path: 'palette-generator' } as RouteType,
    },
    {
      id: 'extract-from-image',
      title: 'Extract from Image',
      description: 'Photo color extraction across 8 chromatic directions',
      icon: <ImageIcon size={15} className="text-blue-400" />,
      path: { path: 'extract-from-image' } as RouteType,
    },
    {
      id: 'brand-kit',
      title: 'Brand Kit Studio',
      description: 'Mini design system builder with simulated interface',
      icon: <Palette size={15} className="text-rose-400" />,
      path: { path: 'brand-kit' } as RouteType,
    },
    {
      id: 'contrast-checker',
      title: 'Contrast Checker',
      description: 'WCAG 2.1 ratio validator & automated remediation',
      icon: <ShieldCheck size={15} className="text-indigo-400" />,
      path: { path: 'contrast-checker' } as RouteType,
    },
  ];

  const communityLinks = [
    {
      id: 'collections',
      title: 'Curated Collections',
      description: 'Themed specimen anthologies and brand design systems',
      icon: <Layers size={15} className="text-blue-400" />,
      path: { path: 'collections' } as RouteType,
    },
    {
      id: 'creators',
      title: 'Designers & Colorists',
      description: 'Portfolios from design systems architects worldwide',
      icon: <Users size={15} className="text-emerald-400" />,
      path: { path: 'creators' } as RouteType,
    },
    {
      id: 'trending',
      title: 'Trending Content',
      description: 'High velocity palettes, colors, and community remixes',
      icon: <TrendingUp size={15} className="text-amber-400" />,
      path: { path: 'trending' } as RouteType,
    },
    {
      id: 'new',
      title: 'New Releases',
      description: 'Chronological feed of newly formulated color systems',
      icon: <Clock size={15} className="text-cyan-400" />,
      path: { path: 'new' } as RouteType,
    },
    {
      id: 'play',
      title: 'Color Games & Play',
      description: 'Hexle, Odd One Out, and Palette Match challenges',
      icon: <Gamepad2 size={15} className="text-pink-400" />,
      path: { path: 'play' } as RouteType,
    },
  ];

  return (
    <>
      <header className="navbar" role="banner">
        <div className="navbar-inner">
          {/* Brand Logo */}
          <Link
            to={{ path: 'home' }}
            onNavigate={handleNav}
            className="brand-logo"
            aria-label="PaletteParadise Home"
          >
            <span className="brand-glyph" />
            <span className="brand-title-text">PaletteParadise</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="nav-links" aria-label="Main Navigation">
            <Link
              to={{ path: 'explore' }}
              onNavigate={handleNav}
              className={`nav-link ${isActive('explore') ? 'active' : ''}`}
            >
              <Compass size={14} />
              <span>Explore</span>
            </Link>

            <Link
              to={{ path: 'colors' }}
              onNavigate={handleNav}
              className={`nav-link ${isActive('colors') ? 'active' : ''}`}
            >
              <Palette size={14} />
              <span>Colors</span>
            </Link>

            <Link
              to={{ path: 'palettes' }}
              onNavigate={handleNav}
              className={`nav-link ${isActive('palettes') ? 'active' : ''}`}
            >
              <Layers size={14} />
              <span>Palettes</span>
            </Link>

            <Link
              to={{ path: 'patterns' }}
              onNavigate={handleNav}
              className={`nav-link ${isActive('patterns') ? 'active' : ''}`}
            >
              <Grid size={14} />
              <span>Patterns</span>
            </Link>

            {/* Studios & Creation Tools Dropdown */}
            <div className="relative" ref={studiosDropdownRef}>
              <button
                className={`nav-link ${isStudioActive ? 'active' : ''}`}
                onClick={() => {
                  setStudiosDropdownOpen(!studiosDropdownOpen);
                  setCommunityDropdownOpen(false);
                }}
                aria-expanded={studiosDropdownOpen}
              >
                <Wand2 size={14} />
                <span>Studios</span>
                <ChevronDown
                  size={11}
                  className={`transition-transform duration-200 ${studiosDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {studiosDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-[var(--bg-surface-1)] border border-[var(--border-strong)] rounded-md shadow-2xl p-2 z-50 flex flex-col gap-1 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1 font-mono text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                    Studio Engines &amp; Generators
                  </div>
                  {studioTools.map((tool) => (
                    <Link
                      key={tool.id}
                      to={tool.path}
                      onNavigate={handleNav}
                      className="w-full flex items-start gap-2.5 p-2 rounded-xs hover:bg-[var(--bg-surface-2)] text-left transition-colors"
                    >
                      <div className="p-1 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs mt-0.5">
                        {tool.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[var(--text-primary)]">{tool.title}</div>
                        <div className="text-[10px] text-[var(--text-tertiary)] truncate leading-tight mt-0.5">
                          {tool.description}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Community & Curation Dropdown */}
            <div className="relative" ref={communityDropdownRef}>
              <button
                className={`nav-link ${isCommunityActive ? 'active' : ''}`}
                onClick={() => {
                  setCommunityDropdownOpen(!communityDropdownOpen);
                  setStudiosDropdownOpen(false);
                }}
                aria-expanded={communityDropdownOpen}
              >
                <Users size={14} />
                <span>Community</span>
                <ChevronDown
                  size={11}
                  className={`transition-transform duration-200 ${communityDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {communityDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-[var(--bg-surface-1)] border border-[var(--border-strong)] rounded-md shadow-2xl p-2 z-50 flex flex-col gap-1 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1 font-mono text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                    Community &amp; Collections
                  </div>
                  {communityLinks.map((link) => (
                    <Link
                      key={link.id}
                      to={link.path}
                      onNavigate={handleNav}
                      className="w-full flex items-start gap-2.5 p-2 rounded-xs hover:bg-[var(--bg-surface-2)] text-left transition-colors"
                    >
                      <div className="p-1 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs mt-0.5">
                        {link.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[var(--text-primary)]">{link.title}</div>
                        <div className="text-[10px] text-[var(--text-tertiary)] truncate leading-tight mt-0.5">
                          {link.description}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Unified Action Controls */}
          <div className="nav-actions flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Quick Search */}
            <button
              className="search-trigger-btn w-9 h-9 md:w-auto p-0 md:px-2.5 flex items-center justify-center"
              onClick={onOpenSearch}
              aria-label="Search color library"
              title="Search Library (⌘K)"
            >
              <Search size={14} />
              <span className="search-text hidden md:inline text-xs">Search</span>
              <kbd className="kbd-shortcut hidden md:inline-block">⌘K</kbd>
            </button>

            {/* Saved / Profile Workspace */}
            <Link
              to={{ path: 'profile' }}
              onNavigate={handleNav}
              className={`saved-nav-btn hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 ${isActive('saved') ? 'active' : ''}`}
              aria-label={`Curator workspace (${savedItems.length} items)`}
              title="Curator Workspace"
            >
              <Bookmark size={14} fill={savedItems.length > 0 ? 'currentColor' : 'none'} />
              <span className="saved-nav-text text-xs">Workspace</span>
              {savedItems.length > 0 && (
                <span className="saved-count-badge">{savedItems.length}</span>
              )}
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={cycleTheme}
              className="theme-toggle-btn hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5"
              title={`Active Theme: ${theme.toUpperCase()}`}
            >
              {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} color="#E9C46A" />}
              <span className="theme-name-text text-xs">{theme}</span>
            </button>

            {/* Mobile Navigation Toggle */}
            <button
              ref={mobileToggleRef}
              className="mobile-menu-toggle w-9 h-9 flex items-center justify-center p-0 md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="mobile-nav-overlay mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
        >
          <div className="mobile-nav__header">
            <Link
              to={{ path: 'home' }}
              onNavigate={handleNav}
              className="brand-logo"
            >
              <span className="brand-glyph" />
              <span className="brand-title-text">PaletteParadise</span>
            </Link>

            <button
              type="button"
              className="mobile-menu-toggle w-9 h-9 flex items-center justify-center p-0"
              onClick={() => setMobileOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          <div className="mobile-nav__options">
            <div className="mobile-nav__section-header">DISCOVERY &amp; GAMUTS</div>
            <Link to={{ path: 'explore' }} onNavigate={handleNav} className={`mobile-nav-link ${isActive('explore') ? 'active' : ''}`}>
              <span>Explore Spectrum</span>
              <Compass size={16} />
            </Link>
            <Link to={{ path: 'trending' }} onNavigate={handleNav} className="mobile-nav-link">
              <span>Trending Specimens</span>
              <TrendingUp size={16} />
            </Link>
            <Link to={{ path: 'new' }} onNavigate={handleNav} className="mobile-nav-link">
              <span>New Releases</span>
              <Clock size={16} />
            </Link>
            <Link to={{ path: 'random' }} onNavigate={handleNav} className="mobile-nav-link">
              <span>Random Discovery</span>
              <Shuffle size={16} />
            </Link>
            <Link to={{ path: 'colors' }} onNavigate={handleNav} className={`mobile-nav-link ${isActive('colors') ? 'active' : ''}`}>
              <span>Color Specimens</span>
              <Palette size={16} />
            </Link>
            <Link to={{ path: 'palettes' }} onNavigate={handleNav} className={`mobile-nav-link ${isActive('palettes') ? 'active' : ''}`}>
              <span>Palette Systems</span>
              <Layers size={16} />
            </Link>
            <Link to={{ path: 'patterns' }} onNavigate={handleNav} className={`mobile-nav-link ${isActive('patterns') ? 'active' : ''}`}>
              <span>Generative Patterns</span>
              <Grid size={16} />
            </Link>
            <Link to={{ path: 'collections' }} onNavigate={handleNav} className="mobile-nav-link">
              <span>Curated Collections</span>
              <Layers size={16} />
            </Link>
            <Link to={{ path: 'creators' }} onNavigate={handleNav} className="mobile-nav-link">
              <span>Designers &amp; Colorists</span>
              <Users size={16} />
            </Link>
            <Link to={{ path: 'play' }} onNavigate={handleNav} className="mobile-nav-link">
              <span>Sensory Play &amp; Games</span>
              <Gamepad2 size={16} />
            </Link>

            <div className="mobile-nav__section-header">STUDIO ENGINES</div>
            <Link to={{ path: 'ramps' }} onNavigate={handleNav} className="mobile-nav-link">
              <span>Ramps Studio (OKLCH)</span>
              <Layers size={16} className="text-emerald-400" />
            </Link>
            <Link to={{ path: 'antigravity' }} onNavigate={handleNav} className="mobile-nav-link">
              <span>Antigravity Physics</span>
              <Compass size={16} className="text-cyan-400" />
            </Link>
            <Link to={{ path: 'mesh' }} onNavigate={handleNav} className="mobile-nav-link">
              <span>Mesh Gradient Studio</span>
              <Wand2 size={16} className="text-purple-400" />
            </Link>
            <Link to={{ path: 'pattern-studio' }} onNavigate={handleNav} className="mobile-nav-link">
              <span>Pattern Studio</span>
              <Grid size={16} className="text-amber-400" />
            </Link>
            <Link to={{ path: 'extract-from-image' }} onNavigate={handleNav} className="mobile-nav-link">
              <span>Extract from Image</span>
              <ImageIcon size={16} className="text-blue-400" />
            </Link>

            <div className="mobile-nav__section-header">WORKSPACE &amp; THEME</div>
            <Link to={{ path: 'profile' }} onNavigate={handleNav} className="mobile-nav-link">
              <span>Curator Workspace ({savedItems.length})</span>
              <Bookmark size={16} />
            </Link>
            <Link to={{ path: 'api-docs' }} onNavigate={handleNav} className="mobile-nav-link">
              <span>Developer API &amp; Tokens</span>
              <Code size={16} />
            </Link>
            <button onClick={cycleTheme} className="mobile-nav-link w-full text-left flex justify-between">
              <span>Theme: {theme.toUpperCase()}</span>
              {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} color="#E9C46A" />}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
