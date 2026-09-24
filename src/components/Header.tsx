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
    className="shrink-0 block"
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
        className={`z-[100] w-full h-[58px] md:h-[68px] bg-canvas/88 backdrop-blur-md border-b transition-all duration-200 ${
          scrolled ? 'border-border-medium shadow-[0_1px_4px_rgba(0,0,0,0.06)]' : 'border-border-subtle'
        }`}
        role="banner"
      >
        <div className="w-full max-w-[1400px] h-full mx-auto px-4 md:px-8 flex items-center justify-between gap-3 md:gap-6 flex-nowrap">
          {/* ─── ZONE 1 (LEFT): Brand / Logo ──────────────────── */}
          <div className="flex items-center shrink-0">
            <Link
              to={{ path: 'home' }}
              onNavigate={handleNav}
              className="inline-flex items-center gap-2 text-text-primary select-none cursor-pointer hover:opacity-85 hover:-translate-y-[0.5px] transition-all"
              aria-label="KROMA Home"
            >
              <RollerEmblem size={20} />
              <span className="font-sans text-[1.15rem] font-[750] tracking-[-0.035em] leading-none text-text-primary">Kroma</span>
            </Link>
          </div>

          {/* ─── ZONE 2 (CENTER): Primary Navigation ──────────── */}
          <nav className="hidden md:flex items-center gap-6 m-0 p-0 shrink-0 flex-nowrap" aria-label="Primary navigation">
            {/* Explore */}
            <Link
              to={{ path: 'explore' }}
              onNavigate={handleNav}
              className={`group relative inline-flex items-center py-1.5 px-0.5 font-sans text-sm tracking-[-0.01em] transition-colors select-none whitespace-nowrap shrink-0 ${
                isExploreActive ? 'text-text-primary font-semibold' : 'text-text-secondary hover:text-text-primary font-medium'
              }`}
            >
              <span className="relative z-10">Explore</span>
              <span
                className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-0.5 rounded-full transition-all duration-200 ease-out pointer-events-none ${
                  isExploreActive
                    ? 'scale-x-100 opacity-100 bg-[#FF3B30]'
                    : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-70 bg-[#FF3B30]'
                }`}
                aria-hidden="true"
              />
            </Link>

            {/* Colors */}
            <Link
              to={{ path: 'colors' }}
              onNavigate={handleNav}
              className={`group relative inline-flex items-center py-1.5 px-0.5 font-sans text-sm tracking-[-0.01em] transition-colors select-none whitespace-nowrap shrink-0 ${
                isColorsActive ? 'text-text-primary font-semibold' : 'text-text-secondary hover:text-text-primary font-medium'
              }`}
            >
              <span className="relative z-10">Colors</span>
              <span
                className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-0.5 rounded-full transition-all duration-200 ease-out pointer-events-none ${
                  isColorsActive
                    ? 'scale-x-100 opacity-100 bg-[#FF9500]'
                    : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-70 bg-[#FF9500]'
                }`}
                aria-hidden="true"
              />
            </Link>

            {/* Palettes */}
            <Link
              to={{ path: 'palettes' }}
              onNavigate={handleNav}
              className={`group relative inline-flex items-center py-1.5 px-0.5 font-sans text-sm tracking-[-0.01em] transition-colors select-none whitespace-nowrap shrink-0 ${
                isPalettesActive ? 'text-text-primary font-semibold' : 'text-text-secondary hover:text-text-primary font-medium'
              }`}
            >
              <span className="relative z-10">Palettes</span>
              <span
                className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-0.5 rounded-full transition-all duration-200 ease-out pointer-events-none ${
                  isPalettesActive
                    ? 'scale-x-100 opacity-100 bg-[#FFD60A]'
                    : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-70 bg-[#FFD60A]'
                }`}
                aria-hidden="true"
              />
            </Link>

            {/* Patterns */}
            <Link
              to={{ path: 'patterns' }}
              onNavigate={handleNav}
              className={`group relative inline-flex items-center py-1.5 px-0.5 font-sans text-sm tracking-[-0.01em] transition-colors select-none whitespace-nowrap shrink-0 ${
                isPatternsActive ? 'text-text-primary font-semibold' : 'text-text-secondary hover:text-text-primary font-medium'
              }`}
            >
              <span className="relative z-10">Patterns</span>
              <span
                className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-0.5 rounded-full transition-all duration-200 ease-out pointer-events-none ${
                  isPatternsActive
                    ? 'scale-x-100 opacity-100 bg-[#34C759]'
                    : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-70 bg-[#34C759]'
                }`}
                aria-hidden="true"
              />
            </Link>

            {/* Studios Dropdown */}
            <div
              className="relative inline-flex items-center"
              ref={studiosRef}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setStudiosOpen(false);
                }
              }}
            >
              <button
                type="button"
                className={`group relative inline-flex items-center gap-1 py-1.5 px-0.5 font-sans text-sm tracking-[-0.01em] transition-colors cursor-pointer select-none whitespace-nowrap bg-transparent border-0 ${
                  isStudioActive ? 'text-text-primary font-semibold' : 'text-text-secondary hover:text-text-primary font-medium'
                }`}
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
              >
                <span className="relative z-10">Studios</span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-180 ease-out text-inherit shrink-0 ${studiosOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
                <span
                  className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-0.5 rounded-full transition-all duration-200 ease-out pointer-events-none ${
                    isStudioActive
                      ? 'scale-x-100 opacity-100 bg-[#00AEEF]'
                      : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-70 bg-[#00AEEF]'
                  }`}
                  aria-hidden="true"
                />
              </button>

              <div
                className={`absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 w-[min(720px,calc(100vw-32px))] p-6 rounded-xs bg-surface-1 border border-border-medium shadow-[0_16px_36px_-8px_rgba(0,0,0,0.25)] z-[1000] flex flex-col transition-all duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  studiosOpen
                    ? 'opacity-100 pointer-events-auto visible translate-y-0'
                    : 'opacity-0 pointer-events-none invisible -translate-y-1'
                }`}
                role="menu"
                aria-label="Studio engines and generators"
              >
                <div className="grid grid-cols-[1fr_1fr_200px] gap-7 items-stretch">
                  {/* Column 1: Generators & Color Science */}
                  <div className="flex flex-col gap-3 min-w-0">
                    <div className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-text-tertiary pb-2 border-b border-border-subtle mb-1">
                      Generators &amp; Science
                    </div>
                    <div className="flex flex-col gap-2.5">
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
                            className={`group/item flex items-start gap-2.5 py-1.5 px-2 -mx-2 rounded-xs bg-transparent border-none cursor-pointer transition-colors relative text-left w-full hover:bg-surface-2/60 ${
                              isActive ? 'bg-surface-2/70' : ''
                            }`}
                            role="menuitem"
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-[1px] mt-1.5 shrink-0 transition-transform duration-160 ease-out group-hover/item:scale-125"
                              style={{ backgroundColor: tool.color }}
                              aria-hidden="true"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className={`font-sans text-sm leading-tight transition-colors inline-flex items-center gap-1 ${
                                isActive ? 'font-semibold text-text-primary' : 'font-[550] text-text-primary'
                              }`}>
                                {tool.title}
                              </span>
                              <span className="font-sans text-[13px] text-text-secondary leading-snug mt-0.5 line-clamp-2">
                                {tool.description}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Column 2: Systems & Workspaces */}
                  <div className="flex flex-col gap-3 min-w-0">
                    <div className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-text-tertiary pb-2 border-b border-border-subtle mb-1">
                      Systems &amp; Workspaces
                    </div>
                    <div className="flex flex-col gap-2.5">
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
                            className={`group/item flex items-start gap-2.5 py-1.5 px-2 -mx-2 rounded-xs bg-transparent border-none cursor-pointer transition-colors relative text-left w-full hover:bg-surface-2/60 ${
                              isActive ? 'bg-surface-2/70' : ''
                            }`}
                            role="menuitem"
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-[1px] mt-1.5 shrink-0 transition-transform duration-160 ease-out group-hover/item:scale-125"
                              style={{ backgroundColor: tool.color }}
                              aria-hidden="true"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className={`font-sans text-sm leading-tight transition-colors inline-flex items-center gap-1 ${
                                isActive ? 'font-semibold text-text-primary' : 'font-[550] text-text-primary'
                              }`}>
                                {tool.title}
                              </span>
                              <span className="font-sans text-[13px] text-text-secondary leading-snug mt-0.5 line-clamp-2">
                                {tool.description}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Column 3: Editorial Featured Studio Strip */}
                  <div className="border-l border-border-subtle pl-6 flex flex-col justify-between">
                    <div>
                      <div className="font-mono text-xs font-semibold tracking-widest uppercase text-text-tertiary mb-1.5">
                        WORKSPACE
                      </div>
                      <div className="font-sans text-sm font-semibold text-text-primary leading-tight mb-1.5">
                        Kroma Studio Gateway
                      </div>
                      <p className="font-sans text-[13px] text-text-secondary leading-normal m-0 mb-4">
                        An integrated creative color laboratory for exploring harmonic relationships, gamuts, and design tokens.
                      </p>
                      <div
                        className="flex w-full h-1 rounded-[1px] overflow-hidden"
                        aria-hidden="true"
                      >
                        <span className="flex-1 h-full" style={{ backgroundColor: '#FF3B30' }} />
                        <span className="flex-1 h-full" style={{ backgroundColor: '#FF9500' }} />
                        <span className="flex-1 h-full" style={{ backgroundColor: '#FFD60A' }} />
                        <span className="flex-1 h-full" style={{ backgroundColor: '#34C759' }} />
                        <span className="flex-1 h-full" style={{ backgroundColor: '#00AEEF' }} />
                        <span className="flex-1 h-full" style={{ backgroundColor: '#7B2CBF' }} />
                      </div>
                    </div>
                    <Link
                      to={{ path: 'create' }}
                      onNavigate={handleNav}
                      className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-text-primary hover:underline mt-4"
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
              className="relative inline-flex items-center"
              ref={communityRef}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setCommunityOpen(false);
                }
              }}
            >
              <button
                type="button"
                className={`group relative inline-flex items-center gap-1 py-1.5 px-0.5 font-sans text-sm tracking-[-0.01em] transition-colors cursor-pointer select-none whitespace-nowrap bg-transparent border-0 ${
                  isCommunityActive ? 'text-text-primary font-semibold' : 'text-text-secondary hover:text-text-primary font-medium'
                }`}
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
              >
                <span className="relative z-10">Community</span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-180 ease-out text-inherit shrink-0 ${communityOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
                <span
                  className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-0.5 rounded-full transition-all duration-200 ease-out pointer-events-none ${
                    isCommunityActive
                      ? 'scale-x-100 opacity-100 bg-[#7B2CBF]'
                      : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-70 bg-[#7B2CBF]'
                  }`}
                  aria-hidden="true"
                />
              </button>

              <div
                className={`absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 w-[min(540px,calc(100vw-32px))] p-6 rounded-xs bg-surface-1 border border-border-medium shadow-[0_16px_36px_-8px_rgba(0,0,0,0.25)] z-[1000] flex flex-col transition-all duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  communityOpen
                    ? 'opacity-100 pointer-events-auto visible translate-y-0'
                    : 'opacity-0 pointer-events-none invisible -translate-y-1'
                }`}
                role="menu"
                aria-label="Community and collections"
              >
                <div className="grid grid-cols-[1fr_200px] gap-8">
                  {/* Column 1: Community Destinations */}
                  <div className="flex flex-col gap-3 min-w-0">
                    <div className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-text-tertiary pb-2 border-b border-border-subtle mb-1">
                      Curation &amp; Play
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {COMMUNITY_LINKS.map((link) => {
                        const isActive = currentRoute.path === link.id;
                        return (
                          <Link
                            key={link.id}
                            to={link.path}
                            onNavigate={handleNav}
                            className={`group/item flex items-start gap-2.5 py-1.5 px-2 -mx-2 rounded-xs bg-transparent border-none cursor-pointer transition-colors relative text-left w-full hover:bg-surface-2/60 ${
                              isActive ? 'bg-surface-2/70' : ''
                            }`}
                            role="menuitem"
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-[1px] mt-1.5 shrink-0 transition-transform duration-160 ease-out group-hover/item:scale-125"
                              style={{ backgroundColor: link.color }}
                              aria-hidden="true"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className={`font-sans text-sm leading-tight transition-colors inline-flex items-center gap-1 ${
                                isActive ? 'font-semibold text-text-primary' : 'font-[550] text-text-primary'
                              }`}>
                                {link.title}
                              </span>
                              <span className="font-sans text-[13px] text-text-secondary leading-snug mt-0.5 line-clamp-2">
                                {link.description}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Column 2: Editorial Featured Spotlight */}
                  <div className="border-l border-border-subtle pl-6 flex flex-col justify-between">
                    <div>
                      <div className="font-mono text-xs font-semibold tracking-widest uppercase text-text-tertiary mb-1.5">
                        FEATURED
                      </div>
                      <div className="font-sans text-sm font-semibold text-text-primary leading-tight mb-1.5">
                        Sensory Color Games
                      </div>
                      <p className="font-sans text-[13px] text-text-secondary leading-normal m-0 mb-4">
                        Train chromatic perception with interactive challenges including Hexle, Odd One Out, and Palette Match.
                      </p>
                      <div
                        className="flex w-full h-1 rounded-[1px] overflow-hidden"
                        aria-hidden="true"
                      >
                        <span className="flex-1 h-full" style={{ backgroundColor: '#00AEEF' }} />
                        <span className="flex-1 h-full" style={{ backgroundColor: '#34C759' }} />
                        <span className="flex-1 h-full" style={{ backgroundColor: '#FF9500' }} />
                        <span className="flex-1 h-full" style={{ backgroundColor: '#FF2D55' }} />
                      </div>
                    </div>
                    <Link
                      to={{ path: 'play' }}
                      onNavigate={handleNav}
                      className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-text-primary hover:underline mt-4"
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
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {/* Search: ICON ONLY, strictly no keyboard hint or label */}
            <KromaButton
              type="button"
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex w-8 h-8 p-0 items-center justify-center text-text-secondary hover:text-text-primary rounded-full hover:bg-surface-2/60 transition-colors"
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
              className={`group relative hidden md:inline-flex items-center gap-1.5 py-1.5 px-0.5 font-sans text-sm tracking-[-0.01em] transition-colors select-none whitespace-nowrap shrink-0 ${
                isSavedActive ? 'text-text-primary font-semibold' : 'text-text-secondary hover:text-text-primary font-medium'
              }`}
              aria-label="Saved collection"
              title="Saved specimens"
            >
              <Bookmark
                size={15}
                strokeWidth={2}
                fill={savedItems.length > 0 ? 'currentColor' : 'none'}
              />
              <span className="relative z-10">Saved</span>
              {savedItems.length > 0 && (
                <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-mono font-bold bg-text-primary text-text-inverse">
                  {savedItems.length}
                </span>
              )}
              <span
                className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-0.5 rounded-full transition-all duration-200 ease-out pointer-events-none ${
                  isSavedActive
                    ? 'scale-x-100 opacity-100 bg-[#7B2CBF]'
                    : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-70 bg-[#7B2CBF]'
                }`}
                aria-hidden="true"
              />
            </Link>

            {/* About Link */}
            <Link
              to={{ path: 'about' }}
              onNavigate={handleNav}
              className={`group relative hidden md:inline-flex items-center gap-1.5 py-1.5 px-0.5 font-sans text-sm tracking-[-0.01em] transition-colors select-none whitespace-nowrap shrink-0 ${
                isAboutActive ? 'text-text-primary font-semibold' : 'text-text-secondary hover:text-text-primary font-medium'
              }`}
            >
              <span className="relative z-10">About</span>
              <span
                className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-0.5 rounded-full transition-all duration-200 ease-out pointer-events-none ${
                  isAboutActive
                    ? 'scale-x-100 opacity-100 bg-[#FF2D55]'
                    : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-70 bg-[#FF2D55]'
                }`}
                aria-hidden="true"
              />
            </Link>

            {/* Theme Toggle Button */}
            <KromaButton
              type="button"
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex w-8 h-8 p-0 items-center justify-center text-text-secondary hover:text-text-primary rounded-full hover:bg-surface-2/60 transition-colors"
              onClick={cycleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Appearance: ${theme}`}
            >
              {theme === 'dark' ? <Moon size={15} strokeWidth={2} /> : <Sun size={15} strokeWidth={2} />}
            </KromaButton>

            {/* ─── Mobile Actions: [ SEARCH ] [ MENU ] ────────── */}
            <div className="flex md:hidden items-center gap-1">
              <KromaButton
                type="button"
                variant="ghost"
                size="icon"
                className="w-8 h-8 p-0 flex items-center justify-center text-text-secondary hover:text-text-primary"
                onClick={onOpenSearch}
                aria-label="Search"
              >
                <Search size={19} strokeWidth={2} />
              </KromaButton>

              <KromaButton
                type="button"
                variant="ghost"
                size="icon"
                className="w-8 h-8 p-0 flex flex-col items-center justify-center gap-1 text-text-secondary hover:text-text-primary"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={mobileOpen}
              >
                <span className="w-4 h-0.5 bg-current rounded-full" />
                <span className="w-4 h-0.5 bg-current rounded-full" />
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
        className={`fixed inset-0 z-[120] bg-canvas flex flex-col transition-all duration-240 ease-out ${
          mobileOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
        aria-hidden={!mobileOpen}
      >
        <div className="w-full h-full max-w-[480px] mx-auto flex flex-col px-5 overflow-hidden">
          {/* Mobile Menu Top Bar */}
          <div className="h-[58px] flex items-center justify-between shrink-0 border-b border-border-subtle">
            <Link
              to={{ path: 'home' }}
              onNavigate={handleNav}
              className="inline-flex items-center gap-2 text-text-primary select-none cursor-pointer"
              aria-label="KROMA Home"
            >
              <RollerEmblem size={20} />
              <span className="font-sans text-[1.15rem] font-[750] tracking-[-0.035em] leading-none text-text-primary">Kroma</span>
            </Link>

            <KromaButton
              type="button"
              variant="ghost"
              size="icon"
              className="w-8 h-8 p-0 flex items-center justify-center text-text-secondary hover:text-text-primary"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={20} strokeWidth={2.2} />
            </KromaButton>
          </div>

          {/* Quick Search Action at Top (NO keyboard hints) */}
          <div className="py-3 border-b border-border-subtle shrink-0">
            <KromaButton
              type="button"
              variant="subtle"
              className="w-full flex items-center justify-start! gap-2.5 px-3 py-2 bg-surface-2 rounded-xs text-text-secondary text-sm font-sans hover:text-text-primary transition-colors text-left"
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
          <div className="flex-1 overflow-y-auto py-4 space-y-6 scrollbar-thin">
            {/* Section 1: Discovery & Gamuts */}
            <div className="flex flex-col gap-2">
              <div className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-text-tertiary px-1">
                Discovery &amp; Gamuts
              </div>
              <div className="flex flex-col gap-1">
                <Link
                  to={{ path: 'explore' }}
                  onNavigate={handleNav}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xs font-sans text-sm transition-colors ${
                    currentRoute.path === 'explore'
                      ? 'text-text-primary font-semibold bg-surface-2'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                  }`}
                >
                  <Compass size={16} className="text-kroma-red" />
                  <span>Explore Spectrum</span>
                </Link>
                <Link
                  to={{ path: 'colors' }}
                  onNavigate={handleNav}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xs font-sans text-sm transition-colors ${
                    isColorsActive
                      ? 'text-text-primary font-semibold bg-surface-2'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                  }`}
                >
                  <Palette size={16} className="text-kroma-orange" />
                  <span>Color Specimens</span>
                </Link>
                <Link
                  to={{ path: 'palettes' }}
                  onNavigate={handleNav}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xs font-sans text-sm transition-colors ${
                    isPalettesActive
                      ? 'text-text-primary font-semibold bg-surface-2'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                  }`}
                >
                  <Layers size={16} className="text-kroma-yellow" />
                  <span>Palette Systems</span>
                </Link>
                <Link
                  to={{ path: 'patterns' }}
                  onNavigate={handleNav}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xs font-sans text-sm transition-colors ${
                    isPatternsActive
                      ? 'text-text-primary font-semibold bg-surface-2'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                  }`}
                >
                  <Grid size={16} className="text-kroma-green" />
                  <span>Generative Patterns</span>
                </Link>
                <Link
                  to={{ path: 'trending' }}
                  onNavigate={handleNav}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xs font-sans text-sm transition-colors ${
                    currentRoute.path === 'trending'
                      ? 'text-text-primary font-semibold bg-surface-2'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                  }`}
                >
                  <TrendingUp size={16} className="text-kroma-blue" />
                  <span>Trending Specimens</span>
                </Link>
                <Link
                  to={{ path: 'new' }}
                  onNavigate={handleNav}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xs font-sans text-sm transition-colors ${
                    currentRoute.path === 'new'
                      ? 'text-text-primary font-semibold bg-surface-2'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                  }`}
                >
                  <Clock size={16} className="text-kroma-yellow" />
                  <span>New Releases</span>
                </Link>
                <Link
                  to={{ path: 'random' }}
                  onNavigate={handleNav}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xs font-sans text-sm transition-colors ${
                    currentRoute.path === 'random'
                      ? 'text-text-primary font-semibold bg-surface-2'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                  }`}
                >
                  <Shuffle size={16} className="text-kroma-purple" />
                  <span>Random Discovery</span>
                </Link>
              </div>
            </div>

            {/* Section 2: Studio Engines */}
            <div className="flex flex-col gap-2">
              <div className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-text-tertiary px-1">
                Studio Engines
              </div>
              <div className="flex flex-col gap-1">
                {STUDIO_TOOLS.map((tool) => (
                  <Link
                    key={tool.id}
                    to={tool.path}
                    onNavigate={handleNav}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xs font-sans text-sm transition-colors ${
                      currentRoute.path === tool.id
                        ? 'text-text-primary font-semibold bg-surface-2'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                    }`}
                  >
                    <span style={{ color: tool.color }}>{tool.icon}</span>
                    <span>{tool.title}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Section 3: Community & Play */}
            <div className="flex flex-col gap-2">
              <div className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-text-tertiary px-1">
                Community &amp; Play
              </div>
              <div className="flex flex-col gap-1">
                <Link
                  to={{ path: 'collections' }}
                  onNavigate={handleNav}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xs font-sans text-sm transition-colors ${
                    currentRoute.path === 'collections' || currentRoute.path === 'collection-detail'
                      ? 'text-text-primary font-semibold bg-surface-2'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                  }`}
                >
                  <Layers size={16} className="text-kroma-blue" />
                  <span>Curated Collections</span>
                </Link>
                <Link
                  to={{ path: 'creators' }}
                  onNavigate={handleNav}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xs font-sans text-sm transition-colors ${
                    currentRoute.path === 'creators' || currentRoute.path === 'creator-detail'
                      ? 'text-text-primary font-semibold bg-surface-2'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                  }`}
                >
                  <Users size={16} className="text-kroma-green" />
                  <span>Designers &amp; Colorists</span>
                </Link>
                <Link
                  to={{ path: 'play' }}
                  onNavigate={handleNav}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xs font-sans text-sm transition-colors ${
                    currentRoute.path.startsWith('play')
                      ? 'text-text-primary font-semibold bg-surface-2'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                  }`}
                >
                  <Gamepad2 size={16} className="text-kroma-red" />
                  <span>Sensory Play &amp; Games</span>
                </Link>
              </div>
            </div>

            {/* Section 4: Workspace & Reference */}
            <div className="flex flex-col gap-2">
              <div className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-text-tertiary px-1">
                Workspace &amp; Reference
              </div>
              <div className="flex flex-col gap-1">
                <Link
                  to={{ path: 'saved' }}
                  onNavigate={handleNav}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xs font-sans text-sm transition-colors ${
                    isSavedActive
                      ? 'text-text-primary font-semibold bg-surface-2'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                  }`}
                >
                  <Bookmark size={16} className="text-kroma-purple" />
                  <span>Curator Workspace ({savedItems.length})</span>
                </Link>
                <Link
                  to={{ path: 'about' }}
                  onNavigate={handleNav}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xs font-sans text-sm transition-colors ${
                    isAboutActive
                      ? 'text-text-primary font-semibold bg-surface-2'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                  }`}
                >
                  <Compass size={16} className="text-kroma-red" />
                  <span>About Kroma</span>
                </Link>
                <Link
                  to={{ path: 'api-docs' }}
                  onNavigate={handleNav}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xs font-sans text-sm transition-colors ${
                    currentRoute.path === 'api-docs'
                      ? 'text-text-primary font-semibold bg-surface-2'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                  }`}
                >
                  <Code size={16} className="text-text-tertiary" />
                  <span>Developer API &amp; Tokens</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile Footer & Theme Switcher */}
          <div className="pt-3 pb-5 border-t border-border-subtle shrink-0 flex flex-col gap-3">
            <KromaButton
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-sans font-medium text-text-secondary hover:text-text-primary"
              onClick={cycleTheme}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              <span>{theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
            </KromaButton>

            <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-text-tertiary">
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
