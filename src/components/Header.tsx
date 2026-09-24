import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  Bookmark,
  Sun,
  Moon,
  X,
  ChevronDown,
  Layers,
  Compass,
  Wand2,
  Grid,
  Sparkles,
  Image as ImageIcon,
  Palette,
  ShieldCheck,
  Users,
  TrendingUp,
  Clock,
  Gamepad2,
  Shuffle,
  Code,
  CloudSun,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { RouteType } from '../types';
import { useSaved } from '../context/SavedContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from './common/Link';
import { KromaButton } from './common/KromaButton';

export interface HeaderProps {
  currentRoute: RouteType;
  onNavigate: (route: RouteType) => void;
  onOpenSearch: () => void;
}

/* ─── Studio Engines (from previous commit) ─── */
const STUDIO_TOOLS = [
  {
    id: 'ramps',
    title: 'Ramps Studio',
    description: 'Perceptual OKLCH ramps & WCAG semantic tokens',
    icon: <Layers size={15} />,
    color: '#34C759',
    path: { path: 'ramps' } as RouteType,
  },
  {
    id: 'springs',
    title: 'Springs Studio',
    description: 'Physics & spring motion lab with harmonic kinematics',
    icon: <Activity size={15} />,
    color: '#00AEEF',
    path: { path: 'springs' } as RouteType,
  },
  {
    id: 'mesh',
    title: 'Mesh Gradient Studio',
    description: 'Multi-point radial mesh canvas & design token exports',
    icon: <Wand2 size={15} />,
    color: '#7B2CBF',
    path: { path: 'mesh' } as RouteType,
  },
  {
    id: 'pattern-studio',
    title: 'Pattern Studio',
    description: 'Algorithmic vector surfaces, grids & seamless textures',
    icon: <Grid size={15} />,
    color: '#FF9500',
    path: { path: 'pattern-studio' } as RouteType,
  },
  {
    id: 'palette-generator',
    title: 'Palette Generator',
    description: 'Generative chromatic balance with swatch locking',
    icon: <Sparkles size={15} />,
    color: '#FF2D55',
    path: { path: 'palette-generator' } as RouteType,
  },
  {
    id: 'extract-from-image',
    title: 'Extract from Image',
    description: 'Photo color extraction across 8 chromatic directions',
    icon: <ImageIcon size={15} />,
    color: '#007AFF',
    path: { path: 'extract-from-image' } as RouteType,
  },
  {
    id: 'brand-kit',
    title: 'Brand Kit Studio',
    description: 'Mini design system builder with simulated interface',
    icon: <Palette size={15} />,
    color: '#FF3B30',
    path: { path: 'brand-kit' } as RouteType,
  },
  {
    id: 'contrast-checker',
    title: 'Contrast Checker',
    description: 'WCAG 2.1 ratio validator & automated remediation',
    icon: <ShieldCheck size={15} />,
    color: '#5856D6',
    path: { path: 'contrast-checker' } as RouteType,
  },
  {
    id: 'live',
    title: 'Weather Color (Live)',
    description: 'Real-time solar elevation, Rayleigh scatter & atmospheric tones',
    icon: <CloudSun size={15} />,
    color: '#00AEEF',
    path: { path: 'live' } as RouteType,
  },
];

/* ─── Community Destinations (from previous commit) ─── */
const COMMUNITY_LINKS = [
  {
    id: 'collections',
    title: 'Curated Collections',
    description: 'Themed specimen anthologies and brand design systems',
    icon: <Layers size={15} />,
    color: '#00AEEF',
    path: { path: 'collections' } as RouteType,
  },
  {
    id: 'creators',
    title: 'Designers & Colorists',
    description: 'Portfolios from design systems architects worldwide',
    icon: <Users size={15} />,
    color: '#34C759',
    path: { path: 'creators' } as RouteType,
  },
  {
    id: 'trending',
    title: 'Trending Specimens',
    description: 'High velocity palettes, colors, and community remixes',
    icon: <TrendingUp size={15} />,
    color: '#FF9500',
    path: { path: 'trending' } as RouteType,
  },
  {
    id: 'new',
    title: 'New Releases',
    description: 'Chronological feed of newly formulated color systems',
    icon: <Clock size={15} />,
    color: '#FFD60A',
    path: { path: 'new' } as RouteType,
  },
  {
    id: 'play',
    title: 'Color Games & Play',
    description: 'Hexle, Odd One Out, and Palette Match challenges',
    icon: <Gamepad2 size={15} />,
    color: '#FF2D55',
    path: { path: 'play' } as RouteType,
  },
];

/* ─── Rainbow roller emblem for brand mark ─── */
const RollerEmblem: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="kroma-header__roller-icon"
  >
    {/* Roller head */}
    <rect x="3" y="3" width="10" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <rect x="4.2" y="4.2" width="7.6" height="2" rx="0.5" fill="#FF3B30" />
    <rect x="4.2" y="6.2" width="7.6" height="2" rx="0.5" fill="#FF9500" />
    <rect x="4.2" y="8.2" width="7.6" height="2" rx="0.5" fill="#FFD60A" />
    <rect x="4.2" y="10.2" width="7.6" height="2" rx="0.5" fill="#34C759" />
    <rect x="4.2" y="12.2" width="7.6" height="2" rx="0.5" fill="#00AEEF" />
    <rect x="4.2" y="14.2" width="7.6" height="2" rx="0.5" fill="#7B2CBF" />
    {/* Connecting bracket */}
    <path
      d="M8 17 L8 18.5 C8 19 8.5 19.5 9 19.5 L15 19.5 C15.5 19.5 16 19.5 16 19.5"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      fill="none"
    />
    {/* Wooden handle */}
    <line x1="16" y1="18.5" x2="16" y2="22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const Header: React.FC<HeaderProps> = ({ currentRoute, onNavigate, onOpenSearch }) => {
  const { savedItems } = useSaved();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [studiosOpen, setStudiosOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);

  const studiosRef = useRef<HTMLDivElement>(null);
  const communityRef = useRef<HTMLDivElement>(null);

  /* ─── Scroll detection ─── */
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 16);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ─── Click outside dropdowns ─── */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (studiosRef.current && !studiosRef.current.contains(e.target as Node)) {
        setStudiosOpen(false);
      }
      if (communityRef.current && !communityRef.current.contains(e.target as Node)) {
        setCommunityOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ─── Mobile scroll lock ─── */
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
        setStudiosOpen(false);
        setCommunityOpen(false);
      }
    };
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
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

  const handleNav = useCallback(
    (route: RouteType) => {
      onNavigate(route);
      setMobileOpen(false);
      setStudiosOpen(false);
      setCommunityOpen(false);
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    },
    [onNavigate]
  );

  const cycleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  /* Route active matching rules matching previous commit */
  const isExploreActive = currentRoute.path === 'explore' || currentRoute.path === 'random' || currentRoute.path === 'search';
  const isColorsActive =
    currentRoute.path === 'colors' ||
    currentRoute.path === 'color-detail' ||
    currentRoute.path === 'color-relationships' ||
    currentRoute.path === 'color-name-finder' ||
    currentRoute.path === 'color-of-the-day';
  const isPalettesActive =
    currentRoute.path === 'palettes' ||
    currentRoute.path === 'palette-detail' ||
    currentRoute.path === 'palette-remix' ||
    currentRoute.path === 'palette-of-the-day' ||
    currentRoute.path === 'combos' ||
    currentRoute.path === 'combo-detail' ||
    currentRoute.path === 'gradients' ||
    currentRoute.path === 'gradient-detail';
  const isPatternsActive = currentRoute.path === 'patterns' || currentRoute.path === 'pattern-detail';

  const isStudioActive =
    currentRoute.path === 'ramps' ||
    currentRoute.path === 'springs' ||
    currentRoute.path === 'antigravity' ||
    currentRoute.path === 'mesh' ||
    currentRoute.path === 'pattern-studio' ||
    currentRoute.path === 'palette-generator' ||
    currentRoute.path === 'generate' ||
    currentRoute.path === 'create' ||
    currentRoute.path === 'extract-from-image' ||
    currentRoute.path === 'brand-kit' ||
    currentRoute.path === 'contrast-checker' ||
    currentRoute.path === 'live';

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

  const isSavedActive = currentRoute.path === 'saved' || currentRoute.path === 'profile';
  const isAboutActive = currentRoute.path === 'about';

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          GLOBAL HEADER (Desktop, Tablet & Mobile Shell)
          ═══════════════════════════════════════════════════════════ */}
      <header
        className={`kroma-header ${scrolled ? 'kroma-header--scrolled' : ''}`}
        role="banner"
      >
        <div className="kroma-header__container">
          {/* ─── ZONE 1 (LEFT): Brand / Logo ──────────────────── */}
          <div className="kroma-header__left">
            <Link
              to={{ path: 'home' }}
              onNavigate={handleNav}
              className="kroma-header__logo"
              aria-label="KROMA Home"
            >
              <RollerEmblem size={20} />
              <span className="kroma-header__wordmark">Kroma</span>
            </Link>
          </div>

          {/* ─── ZONE 2 (CENTER): Primary Navigation ──────────── */}
          <nav className="kroma-header__center" aria-label="Primary navigation">
            {/* Explore */}
            <Link
              to={{ path: 'explore' }}
              onNavigate={handleNav}
              className={`kroma-header__nav-link ${isExploreActive ? 'kroma-header__nav-link--active' : ''}`}
              style={{ '--link-color': '#FF3B30' } as React.CSSProperties}
            >
              <span className="kroma-header__nav-text">Explore</span>
              <span className="kroma-header__indicator" aria-hidden="true" />
            </Link>

            {/* Colors */}
            <Link
              to={{ path: 'colors' }}
              onNavigate={handleNav}
              className={`kroma-header__nav-link ${isColorsActive ? 'kroma-header__nav-link--active' : ''}`}
              style={{ '--link-color': '#FF9500' } as React.CSSProperties}
            >
              <span className="kroma-header__nav-text">Colors</span>
              <span className="kroma-header__indicator" aria-hidden="true" />
            </Link>

            {/* Palettes */}
            <Link
              to={{ path: 'palettes' }}
              onNavigate={handleNav}
              className={`kroma-header__nav-link ${isPalettesActive ? 'kroma-header__nav-link--active' : ''}`}
              style={{ '--link-color': '#FFD60A' } as React.CSSProperties}
            >
              <span className="kroma-header__nav-text">Palettes</span>
              <span className="kroma-header__indicator" aria-hidden="true" />
            </Link>

            {/* Patterns */}
            <Link
              to={{ path: 'patterns' }}
              onNavigate={handleNav}
              className={`kroma-header__nav-link ${isPatternsActive ? 'kroma-header__nav-link--active' : ''}`}
              style={{ '--link-color': '#34C759' } as React.CSSProperties}
            >
              <span className="kroma-header__nav-text">Patterns</span>
              <span className="kroma-header__indicator" aria-hidden="true" />
            </Link>

            {/* Studios Dropdown */}
            <div
              className="kroma-header__dropdown"
              ref={studiosRef}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setStudiosOpen(false);
                }
              }}
            >
              <button
                type="button"
                className={`kroma-header__dropdown-btn ${isStudioActive ? 'kroma-header__dropdown-btn--active' : ''}`}
                onClick={() => {
                  setStudiosOpen(!studiosOpen);
                  setCommunityOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setStudiosOpen(true);
                    setCommunityOpen(false);
                  }
                }}
                aria-expanded={studiosOpen}
                aria-haspopup="true"
                style={{ '--link-color': '#00AEEF' } as React.CSSProperties}
              >
                <span className="kroma-header__nav-text">Studios</span>
                <ChevronDown size={13} className="kroma-header__dropdown-chevron" aria-hidden="true" />
                <span className="kroma-header__indicator" aria-hidden="true" />
              </button>

              <div
                className={`kroma-header__dropdown-menu kroma-header__dropdown-menu--studios ${
                  studiosOpen ? 'kroma-header__dropdown-menu--open' : ''
                }`}
                role="menu"
                aria-label="Studio engines and generators"
              >
                <div className="kroma-header__dropdown-grid">
                  {/* Column 1: Generators & Color Science */}
                  <div className="kroma-header__dropdown-col">
                    <div className="kroma-header__dropdown-category">
                      Generators &amp; Science
                    </div>
                    <div className="kroma-header__dropdown-list">
                      {[
                        STUDIO_TOOLS[0], // Ramps
                        STUDIO_TOOLS[4], // Palette Generator
                        STUDIO_TOOLS[2], // Mesh Gradient
                        STUDIO_TOOLS[3], // Pattern Studio
                      ].map((tool) => {
                        const isActive = currentRoute.path === tool.id;
                        return (
                          <Link
                            key={tool.id}
                            to={tool.path}
                            onNavigate={handleNav}
                            className={`kroma-header__dropdown-item ${
                              isActive ? 'kroma-header__dropdown-item--active' : ''
                            }`}
                            role="menuitem"
                          >
                            <span
                              className="kroma-header__dropdown-marker"
                              style={{ backgroundColor: tool.color }}
                              aria-hidden="true"
                            />
                            <div className="kroma-header__dropdown-text">
                              <span className="kroma-header__dropdown-title">
                                {tool.title}
                              </span>
                              <span className="kroma-header__dropdown-desc">
                                {tool.description}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Column 2: Systems & Workspaces */}
                  <div className="kroma-header__dropdown-col">
                    <div className="kroma-header__dropdown-category">
                      Systems &amp; Workspaces
                    </div>
                    <div className="kroma-header__dropdown-list">
                      {[
                        STUDIO_TOOLS[1], // Antigravity
                        STUDIO_TOOLS[6], // Brand Kit
                        STUDIO_TOOLS[7], // Contrast Checker
                        STUDIO_TOOLS[5], // Extract from Image
                      ].map((tool) => {
                        const isActive = currentRoute.path === tool.id;
                        return (
                          <Link
                            key={tool.id}
                            to={tool.path}
                            onNavigate={handleNav}
                            className={`kroma-header__dropdown-item ${
                              isActive ? 'kroma-header__dropdown-item--active' : ''
                            }`}
                            role="menuitem"
                          >
                            <span
                              className="kroma-header__dropdown-marker"
                              style={{ backgroundColor: tool.color }}
                              aria-hidden="true"
                            />
                            <div className="kroma-header__dropdown-text">
                              <span className="kroma-header__dropdown-title">
                                {tool.title}
                              </span>
                              <span className="kroma-header__dropdown-desc">
                                {tool.description}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Column 3: Editorial Featured Studio Strip */}
                  <div className="kroma-header__dropdown-featured">
                    <div>
                      <div className="kroma-header__dropdown-featured-tag">
                        WORKSPACE
                      </div>
                      <div className="kroma-header__dropdown-featured-title">
                        Kroma Studio Gateway
                      </div>
                      <p className="kroma-header__dropdown-featured-desc">
                        An integrated creative color laboratory for exploring harmonic relationships, gamuts, and design tokens.
                      </p>
                      <div
                        className="kroma-header__dropdown-palette-strip"
                        aria-hidden="true"
                      >
                        <span style={{ backgroundColor: '#FF3B30' }} />
                        <span style={{ backgroundColor: '#FF9500' }} />
                        <span style={{ backgroundColor: '#FFD60A' }} />
                        <span style={{ backgroundColor: '#34C759' }} />
                        <span style={{ backgroundColor: '#00AEEF' }} />
                        <span style={{ backgroundColor: '#7B2CBF' }} />
                      </div>
                    </div>
                    <Link
                      to={{ path: 'create' }}
                      onNavigate={handleNav}
                      className="kroma-header__dropdown-featured-link"
                      role="menuitem"
                    >
                      <span>Explore Studio Gateway</span>
                      <ArrowRight size={13} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Community Dropdown */}
            <div
              className="kroma-header__dropdown"
              ref={communityRef}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setCommunityOpen(false);
                }
              }}
            >
              <button
                type="button"
                className={`kroma-header__dropdown-btn ${isCommunityActive ? 'kroma-header__dropdown-btn--active' : ''}`}
                onClick={() => {
                  setCommunityOpen(!communityOpen);
                  setStudiosOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setCommunityOpen(true);
                    setStudiosOpen(false);
                  }
                }}
                aria-expanded={communityOpen}
                aria-haspopup="true"
                style={{ '--link-color': '#7B2CBF' } as React.CSSProperties}
              >
                <span className="kroma-header__nav-text">Community</span>
                <ChevronDown size={13} className="kroma-header__dropdown-chevron" aria-hidden="true" />
                <span className="kroma-header__indicator" aria-hidden="true" />
              </button>

              <div
                className={`kroma-header__dropdown-menu kroma-header__dropdown-menu--community ${
                  communityOpen ? 'kroma-header__dropdown-menu--open' : ''
                }`}
                role="menu"
                aria-label="Community and collections"
              >
                <div className="kroma-header__dropdown-grid kroma-header__dropdown-grid--community">
                  {/* Column 1: Community Destinations */}
                  <div className="kroma-header__dropdown-col">
                    <div className="kroma-header__dropdown-category">
                      Curation &amp; Play
                    </div>
                    <div className="kroma-header__dropdown-list">
                      {COMMUNITY_LINKS.map((link) => {
                        const isActive = currentRoute.path === link.id;
                        return (
                          <Link
                            key={link.id}
                            to={link.path}
                            onNavigate={handleNav}
                            className={`kroma-header__dropdown-item ${
                              isActive ? 'kroma-header__dropdown-item--active' : ''
                            }`}
                            role="menuitem"
                          >
                            <span
                              className="kroma-header__dropdown-marker"
                              style={{ backgroundColor: link.color }}
                              aria-hidden="true"
                            />
                            <div className="kroma-header__dropdown-text">
                              <span className="kroma-header__dropdown-title">
                                {link.title}
                              </span>
                              <span className="kroma-header__dropdown-desc">
                                {link.description}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Column 2: Editorial Featured Spotlight */}
                  <div className="kroma-header__dropdown-featured">
                    <div>
                      <div className="kroma-header__dropdown-featured-tag">
                        FEATURED
                      </div>
                      <div className="kroma-header__dropdown-featured-title">
                        Sensory Color Games
                      </div>
                      <p className="kroma-header__dropdown-featured-desc">
                        Train chromatic perception with interactive challenges including Hexle, Odd One Out, and Palette Match.
                      </p>
                      <div
                        className="kroma-header__dropdown-palette-strip"
                        aria-hidden="true"
                      >
                        <span style={{ backgroundColor: '#00AEEF' }} />
                        <span style={{ backgroundColor: '#34C759' }} />
                        <span style={{ backgroundColor: '#FF9500' }} />
                        <span style={{ backgroundColor: '#FF2D55' }} />
                      </div>
                    </div>
                    <Link
                      to={{ path: 'play' }}
                      onNavigate={handleNav}
                      className="kroma-header__dropdown-featured-link"
                      role="menuitem"
                    >
                      <span>Launch Games Hub</span>
                      <ArrowRight size={13} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* ─── ZONE 3 (RIGHT): Search (Icon Only), Saved, About, Theme ──── */}
          <div className="kroma-header__right">
            {/* Search: ICON ONLY, strictly no keyboard hint or label */}
            <KromaButton
              type="button"
              variant="ghost"
              size="icon"
              className="kroma-header__search-btn"
              onClick={onOpenSearch}
              aria-label="Search"
              title="Search"
            >
              <Search size={18} strokeWidth={2} />
            </KromaButton>

            {/* Saved Link with Live Badge */}
            <Link
              to={{ path: 'saved' }}
              onNavigate={handleNav}
              className={`kroma-header__action-link ${isSavedActive ? 'kroma-header__action-link--active' : ''}`}
              aria-label="Saved collection"
              title="Saved specimens"
              style={{ '--link-color': '#7B2CBF' } as React.CSSProperties}
            >
              <Bookmark
                size={15}
                strokeWidth={2}
                fill={savedItems.length > 0 ? 'currentColor' : 'none'}
              />
              <span className="kroma-header__action-label">Saved</span>
              {savedItems.length > 0 && (
                <span className="kroma-header__badge">{savedItems.length}</span>
              )}
              <span className="kroma-header__indicator" aria-hidden="true" />
            </Link>

            {/* About Link */}
            <Link
              to={{ path: 'about' }}
              onNavigate={handleNav}
              className={`kroma-header__action-link ${isAboutActive ? 'kroma-header__action-link--active' : ''}`}
              style={{ '--link-color': '#FF2D55' } as React.CSSProperties}
            >
              <span className="kroma-header__action-label">About</span>
              <span className="kroma-header__indicator" aria-hidden="true" />
            </Link>

            {/* Theme Toggle Button */}
            <KromaButton
              type="button"
              variant="ghost"
              size="icon"
              className="kroma-header__theme-btn"
              onClick={cycleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Appearance: ${theme}`}
            >
              {theme === 'dark' ? <Moon size={15} strokeWidth={2} /> : <Sun size={15} strokeWidth={2} />}
            </KromaButton>

            {/* ─── Mobile Actions: [ SEARCH ] [ MENU ] ────────── */}
            <div className="kroma-header__mobile-actions">
              <KromaButton
                type="button"
                variant="ghost"
                size="icon"
                className="kroma-header__mobile-search-btn"
                onClick={onOpenSearch}
                aria-label="Search"
              >
                <Search size={19} strokeWidth={2} />
              </KromaButton>

              <KromaButton
                type="button"
                variant="ghost"
                size="icon"
                className="kroma-header__mobile-menu-btn"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={mobileOpen}
              >
                <span className="kroma-header__menu-bar" />
                <span className="kroma-header__menu-bar" />
              </KromaButton>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          MOBILE FULL-SCREEN NAVIGATION PANEL
          All 100% of previous options cleanly organized into sections
          ═══════════════════════════════════════════════════════════ */}
      <div
        className={`kroma-mobile-menu ${mobileOpen ? 'kroma-mobile-menu--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
        aria-hidden={!mobileOpen}
      >
        <div className="kroma-mobile-menu__inner">
          {/* Mobile Menu Top Bar */}
          <div className="kroma-mobile-menu__header">
            <Link
              to={{ path: 'home' }}
              onNavigate={handleNav}
              className="kroma-header__logo"
              aria-label="KROMA Home"
            >
              <RollerEmblem size={20} />
              <span className="kroma-header__wordmark">Kroma</span>
            </Link>

            <KromaButton
              type="button"
              variant="ghost"
              size="icon"
              className="kroma-mobile-menu__close-btn"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={20} strokeWidth={2.2} />
            </KromaButton>
          </div>

          {/* Quick Search Action at Top (NO keyboard hints) */}
          <div className="kroma-mobile-menu__search-bar">
            <KromaButton
              type="button"
              variant="subtle"
              className="kroma-mobile-menu__search-trigger"
              onClick={() => {
                setMobileOpen(false);
                onOpenSearch();
              }}
              aria-label="Search"
            >
              <Search size={18} strokeWidth={2} />
              <span>Search color library...</span>
            </KromaButton>
          </div>

          {/* Mobile Scrollable Navigation Content */}
          <div className="kroma-mobile-menu__scrollable">
            {/* Section 1: Discovery & Gamuts */}
            <div className="kroma-mobile-menu__section">
              <div className="kroma-mobile-menu__section-title">Discovery &amp; Gamuts</div>
              <div className="kroma-mobile-menu__section-links">
                <Link
                  to={{ path: 'explore' }}
                  onNavigate={handleNav}
                  className={`kroma-mobile-menu__item ${currentRoute.path === 'explore' ? 'kroma-mobile-menu__item--active' : ''}`}
                >
                  <Compass size={16} className="text-kroma-red" />
                  <span>Explore Spectrum</span>
                </Link>
                <Link
                  to={{ path: 'colors' }}
                  onNavigate={handleNav}
                  className={`kroma-mobile-menu__item ${isColorsActive ? 'kroma-mobile-menu__item--active' : ''}`}
                >
                  <Palette size={16} className="text-kroma-orange" />
                  <span>Color Specimens</span>
                </Link>
                <Link
                  to={{ path: 'palettes' }}
                  onNavigate={handleNav}
                  className={`kroma-mobile-menu__item ${isPalettesActive ? 'kroma-mobile-menu__item--active' : ''}`}
                >
                  <Layers size={16} className="text-kroma-yellow" />
                  <span>Palette Systems</span>
                </Link>
                <Link
                  to={{ path: 'patterns' }}
                  onNavigate={handleNav}
                  className={`kroma-mobile-menu__item ${isPatternsActive ? 'kroma-mobile-menu__item--active' : ''}`}
                >
                  <Grid size={16} className="text-kroma-green" />
                  <span>Generative Patterns</span>
                </Link>
                <Link
                  to={{ path: 'trending' }}
                  onNavigate={handleNav}
                  className={`kroma-mobile-menu__item ${currentRoute.path === 'trending' ? 'kroma-mobile-menu__item--active' : ''}`}
                >
                  <TrendingUp size={16} className="text-kroma-blue" />
                  <span>Trending Specimens</span>
                </Link>
                <Link
                  to={{ path: 'new' }}
                  onNavigate={handleNav}
                  className={`kroma-mobile-menu__item ${currentRoute.path === 'new' ? 'kroma-mobile-menu__item--active' : ''}`}
                >
                  <Clock size={16} className="text-kroma-yellow" />
                  <span>New Releases</span>
                </Link>
                <Link
                  to={{ path: 'random' }}
                  onNavigate={handleNav}
                  className={`kroma-mobile-menu__item ${currentRoute.path === 'random' ? 'kroma-mobile-menu__item--active' : ''}`}
                >
                  <Shuffle size={16} className="text-kroma-purple" />
                  <span>Random Discovery</span>
                </Link>
              </div>
            </div>

            {/* Section 2: Studio Engines */}
            <div className="kroma-mobile-menu__section">
              <div className="kroma-mobile-menu__section-title">Studio Engines</div>
              <div className="kroma-mobile-menu__section-links">
                {STUDIO_TOOLS.map((tool) => (
                  <Link
                    key={tool.id}
                    to={tool.path}
                    onNavigate={handleNav}
                    className={`kroma-mobile-menu__item ${currentRoute.path === tool.id ? 'kroma-mobile-menu__item--active' : ''}`}
                  >
                    <span style={{ color: tool.color }}>{tool.icon}</span>
                    <span>{tool.title}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Section 3: Community & Play */}
            <div className="kroma-mobile-menu__section">
              <div className="kroma-mobile-menu__section-title">Community &amp; Play</div>
              <div className="kroma-mobile-menu__section-links">
                <Link
                  to={{ path: 'collections' }}
                  onNavigate={handleNav}
                  className={`kroma-mobile-menu__item ${currentRoute.path === 'collections' || currentRoute.path === 'collection-detail' ? 'kroma-mobile-menu__item--active' : ''}`}
                >
                  <Layers size={16} className="text-kroma-blue" />
                  <span>Curated Collections</span>
                </Link>
                <Link
                  to={{ path: 'creators' }}
                  onNavigate={handleNav}
                  className={`kroma-mobile-menu__item ${currentRoute.path === 'creators' || currentRoute.path === 'creator-detail' ? 'kroma-mobile-menu__item--active' : ''}`}
                >
                  <Users size={16} className="text-kroma-green" />
                  <span>Designers &amp; Colorists</span>
                </Link>
                <Link
                  to={{ path: 'play' }}
                  onNavigate={handleNav}
                  className={`kroma-mobile-menu__item ${currentRoute.path.startsWith('play') ? 'kroma-mobile-menu__item--active' : ''}`}
                >
                  <Gamepad2 size={16} className="text-kroma-red" />
                  <span>Sensory Play &amp; Games</span>
                </Link>
              </div>
            </div>

            {/* Section 4: Workspace & Reference */}
            <div className="kroma-mobile-menu__section">
              <div className="kroma-mobile-menu__section-title">Workspace &amp; Reference</div>
              <div className="kroma-mobile-menu__section-links">
                <Link
                  to={{ path: 'saved' }}
                  onNavigate={handleNav}
                  className={`kroma-mobile-menu__item ${isSavedActive ? 'kroma-mobile-menu__item--active' : ''}`}
                >
                  <Bookmark size={16} className="text-kroma-purple" />
                  <span>Curator Workspace ({savedItems.length})</span>
                </Link>
                <Link
                  to={{ path: 'about' }}
                  onNavigate={handleNav}
                  className={`kroma-mobile-menu__item ${isAboutActive ? 'kroma-mobile-menu__item--active' : ''}`}
                >
                  <Compass size={16} className="text-kroma-red" />
                  <span>About Kroma</span>
                </Link>
                <Link
                  to={{ path: 'api-docs' }}
                  onNavigate={handleNav}
                  className={`kroma-mobile-menu__item ${currentRoute.path === 'api-docs' ? 'kroma-mobile-menu__item--active' : ''}`}
                >
                  <Code size={16} className="text-text-tertiary" />
                  <span>Developer API &amp; Tokens</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile Footer & Theme Switcher */}
          <div className="kroma-mobile-menu__footer">
            <KromaButton
              type="button"
              variant="outline"
              className="kroma-mobile-menu__theme-btn"
              onClick={cycleTheme}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              <span>{theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
            </KromaButton>

            <div className="kroma-mobile-menu__meta">
              <span>KROMA STUDIO REFERENCE</span>
              <span>•</span>
              <Link to={{ path: 'api-docs' }} onNavigate={handleNav}>
                API
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/* Re-export as Navbar for backward compatibility */
export const Navbar = Header;
