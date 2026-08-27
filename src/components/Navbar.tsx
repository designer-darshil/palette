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
  Monitor,
  ShieldCheck,
  ChevronDown,
  Image as ImageIcon,
  Wrench,
  Compass,
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
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);

  // Close tools dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(e.target as Node)) {
        setToolsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isToolActive =
    currentRoute.path === 'palette-generator' ||
    currentRoute.path === 'contrast-checker' ||
    currentRoute.path === 'color-name-finder' ||
    currentRoute.path === 'extract-from-image' ||
    currentRoute.path === 'brand-kit' ||
    currentRoute.path === 'live';

  const isActive = (path: string) => {
    if (path === 'home' && currentRoute.path === 'home') return true;
    if (path === 'colors' && (currentRoute.path === 'colors' || currentRoute.path === 'color-detail')) return true;
    if (path === 'palettes' && (currentRoute.path === 'palettes' || currentRoute.path === 'palette-detail')) return true;
    if (path === 'combos' && (currentRoute.path === 'combos' || currentRoute.path === 'combo-detail')) return true;
    if (path === 'gradients' && (currentRoute.path === 'gradients' || currentRoute.path === 'gradient-detail')) return true;
    if (path === 'live' && currentRoute.path === 'live') return true;
    if (path === 'palette-generator' && currentRoute.path === 'palette-generator') return true;
    if (path === 'contrast-checker' && currentRoute.path === 'contrast-checker') return true;
    if (path === 'color-name-finder' && currentRoute.path === 'color-name-finder') return true;
    if (path === 'extract-from-image' && currentRoute.path === 'extract-from-image') return true;
    if (path === 'brand-kit' && currentRoute.path === 'brand-kit') return true;
    if (path === 'saved' && currentRoute.path === 'saved') return true;
    return false;
  };

  const handleNav = (route: RouteType) => {
    onNavigate(route);
    setMobileOpen(false);
    setToolsDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  const toolsList = [
    {
      id: 'palette-generator',
      title: 'Palette Generator',
      description: 'Touch-first palette generation with locking & export',
      icon: <Sparkles size={16} className="text-amber-400" />,
      path: { path: 'palette-generator' } as RouteType,
    },
    {
      id: 'extract-from-image',
      title: 'Extract from Image',
      description: 'Perceptual photo color extraction & role mapping',
      icon: <ImageIcon size={16} className="text-purple-400" />,
      path: { path: 'extract-from-image' } as RouteType,
    },
    {
      id: 'brand-kit',
      title: 'Brand Kit Studio',
      description: 'Mini design system builder with live UI preview',
      icon: <Palette size={16} className="text-pink-400" />,
      path: { path: 'brand-kit' } as RouteType,
    },
    {
      id: 'contrast-checker',
      title: 'Contrast Checker',
      description: 'WCAG 2.1 ratio validator & automated remediation',
      icon: <ShieldCheck size={16} className="text-blue-400" />,
      path: { path: 'contrast-checker' } as RouteType,
    },
    {
      id: 'color-name-finder',
      title: 'Color Name Finder',
      description: 'Perceptual distance & bidirectional name search',
      icon: <Search size={16} className="text-emerald-400" />,
      path: { path: 'color-name-finder' } as RouteType,
    },
    {
      id: 'live',
      title: 'Live Atmosphere',
      description: 'Real-time global solar color stream & observatory',
      icon: <Radio size={16} className="text-rose-400" />,
      path: { path: 'live' } as RouteType,
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
            aria-label="KROMA Color Library Home"
          >
            <span className="brand-glyph" />
            <span className="brand-title-text">KROMA</span>
          </Link>

          {/* Desktop Navigation Links — Streamlined & Uncluttered */}
          <nav className="nav-links" aria-label="Main Navigation">
            <Link
              to={{ path: 'colors' }}
              onNavigate={handleNav}
              className={`nav-link ${isActive('colors') ? 'active' : ''}`}
            >
              <Palette size={15} />
              <span>Colors</span>
            </Link>
            <Link
              to={{ path: 'palettes' }}
              onNavigate={handleNav}
              className={`nav-link ${isActive('palettes') ? 'active' : ''}`}
            >
              <Layers size={15} />
              <span>Palettes</span>
            </Link>
            <Link
              to={{ path: 'combos' }}
              onNavigate={handleNav}
              className={`nav-link ${isActive('combos') ? 'active' : ''}`}
            >
              <Wand2 size={15} />
              <span>Combos</span>
            </Link>
            <Link
              to={{ path: 'gradients' }}
              onNavigate={handleNav}
              className={`nav-link ${isActive('gradients') ? 'active' : ''}`}
            >
              <Sparkles size={15} />
              <span>Gradients</span>
            </Link>

            {/* Clean Tools & Studio Dropdown */}
            <div className="relative" ref={toolsDropdownRef}>
              <button
                className={`nav-link ${isToolActive ? 'active' : ''}`}
                onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                aria-expanded={toolsDropdownOpen}
                aria-haspopup="true"
              >
                <Sparkles size={14} className={isToolActive ? 'text-[var(--accent-gold)]' : ''} />
                <span>Tools</span>
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ${toolsDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Tools Dropdown Popover */}
              {toolsDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-[var(--bg-surface-1)] border border-[var(--border-strong)] rounded-md shadow-2xl p-2 z-50 flex flex-col gap-1 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 font-mono text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                    Studio &amp; Creation Tools
                  </div>
                  {toolsList.map((tool) => {
                    const isSelected = isActive(tool.id);
                    return (
                      <Link
                        key={tool.id}
                        to={tool.path}
                        onNavigate={handleNav}
                        className={`w-full flex items-start gap-3 p-2.5 rounded-xs text-left transition-all ${
                          isSelected
                            ? 'bg-[var(--bg-surface-3)] text-[var(--text-primary)]'
                            : 'hover:bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <div className="p-1.5 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs flex-shrink-0 mt-0.5">
                          {tool.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-[var(--text-primary)] flex items-center justify-between">
                            <span>{tool.title}</span>
                            {isSelected && (
                              <span className="font-mono text-[9px] px-1.5 py-0.5 bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] rounded-xs">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[var(--text-tertiary)] leading-tight mt-0.5 line-clamp-1">
                            {tool.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Unified Action Controls (Search, Saved, Theme, Menu) */}
          <div className="nav-actions flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Quick Search — Visible on all viewports */}
            <button
              className="search-trigger-btn w-9 h-9 md:w-auto p-0 md:px-2.5 flex items-center justify-center"
              onClick={onOpenSearch}
              aria-label="Search color library"
              title="Search Library (⌘K)"
            >
              <Search size={15} />
              <span className="search-text hidden md:inline text-xs">Search</span>
              <kbd className="kbd-shortcut hidden md:inline-block">⌘K</kbd>
            </button>

            {/* Saved Items — Desktop Only (Mobile uses Drawer) */}
            <Link
              to={{ path: 'saved' }}
              onNavigate={handleNav}
              className={`saved-nav-btn hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 ${isActive('saved') ? 'active' : ''}`}
              aria-label={`Saved collection (${savedItems.length} items)`}
              title="View Saved Specimens"
            >
              <Bookmark size={14} fill={savedItems.length > 0 ? 'currentColor' : 'none'} />
              <span className="saved-nav-text text-xs">Saved</span>
              {savedItems.length > 0 && (
                <span className="saved-count-badge">{savedItems.length}</span>
              )}
            </Link>

            {/* Compact Geometric Theme Toggle — Desktop Only (Mobile uses Drawer) */}
            <button
              onClick={cycleTheme}
              className="theme-toggle-btn hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5"
              title={`Active Theme: ${theme.toUpperCase()} (Click to toggle Light / Dark / System)`}
              aria-label={`Current Theme: ${theme}. Click to switch theme.`}
            >
              {theme === 'system' ? (
                <Monitor size={14} />
              ) : resolvedTheme === 'dark' ? (
                <Moon size={14} />
              ) : (
                <Sun size={14} color="#E9C46A" />
              )}
              <span className="theme-name-text text-xs">{theme}</span>
            </button>

            {/* Mobile Navigation Toggle — Mobile/Tablet Only */}
            <button
              className="mobile-menu-toggle w-9 h-9 flex items-center justify-center p-0 md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Overlay with Structured Categories */}
        {mobileOpen && (
          <div className="mobile-nav-overlay">
            <div className="px-4 py-2 font-mono text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
              LIBRARY CATALOG
            </div>
            <Link
              to={{ path: 'home' }}
              onNavigate={handleNav}
              className={`mobile-nav-link ${isActive('home') ? 'active' : ''}`}
            >
              <span>Home Library</span>
            </Link>
            <Link
              to={{ path: 'colors' }}
              onNavigate={handleNav}
              className={`mobile-nav-link ${isActive('colors') ? 'active' : ''}`}
            >
              <span>Color Specimens</span>
              <Palette size={16} />
            </Link>
            <Link
              to={{ path: 'palettes' }}
              onNavigate={handleNav}
              className={`mobile-nav-link ${isActive('palettes') ? 'active' : ''}`}
            >
              <span>Palette Systems</span>
              <Layers size={16} />
            </Link>
            <Link
              to={{ path: 'combos' }}
              onNavigate={handleNav}
              className={`mobile-nav-link ${isActive('combos') ? 'active' : ''}`}
            >
              <span>Harmonies &amp; Combos</span>
              <Wand2 size={16} />
            </Link>
            <Link
              to={{ path: 'gradients' }}
              onNavigate={handleNav}
              className={`mobile-nav-link ${isActive('gradients') ? 'active' : ''}`}
            >
              <span>CSS Gradients</span>
              <Sparkles size={16} />
            </Link>

            <div className="px-4 pt-4 pb-2 font-mono text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-semibold border-t border-[var(--border-subtle)] mt-2">
              STUDIO &amp; TOOLS
            </div>
            <Link
              to={{ path: 'palette-generator' }}
              onNavigate={handleNav}
              className={`mobile-nav-link ${isActive('palette-generator') ? 'active' : ''}`}
            >
              <span>Palette Generator</span>
              <Sparkles size={16} color="#E9C46A" />
            </Link>
            <Link
              to={{ path: 'extract-from-image' }}
              onNavigate={handleNav}
              className={`mobile-nav-link ${isActive('extract-from-image') ? 'active' : ''}`}
            >
              <span>Extract from Image</span>
              <ImageIcon size={16} className="text-purple-400" />
            </Link>
            <Link
              to={{ path: 'brand-kit' }}
              onNavigate={handleNav}
              className={`mobile-nav-link ${isActive('brand-kit') ? 'active' : ''}`}
            >
              <span>Brand Kit Studio</span>
              <Palette size={16} className="text-pink-400" />
            </Link>
            <Link
              to={{ path: 'contrast-checker' }}
              onNavigate={handleNav}
              className={`mobile-nav-link ${isActive('contrast-checker') ? 'active' : ''}`}
            >
              <span>Color Contrast Checker</span>
              <ShieldCheck size={16} color="#3B82F6" />
            </Link>
            <Link
              to={{ path: 'color-name-finder' }}
              onNavigate={handleNav}
              className={`mobile-nav-link ${isActive('color-name-finder') ? 'active' : ''}`}
            >
              <span>Color Name Finder</span>
              <Search size={16} color="#10B981" />
            </Link>
            <Link
              to={{ path: 'live' }}
              onNavigate={handleNav}
              className={`mobile-nav-link ${isActive('live') ? 'active' : ''}`}
            >
              <span>Real-Time Live Atmosphere</span>
              <Radio size={16} color="#E63946" />
            </Link>

            <div className="px-4 pt-4 pb-2 font-mono text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-semibold border-t border-[var(--border-subtle)] mt-2">
              PREFERENCES &amp; WORKSPACE
            </div>

            {/* Saved Items Link in Drawer */}
            <Link
              to={{ path: 'saved' }}
              onNavigate={handleNav}
              className={`mobile-nav-link ${isActive('saved') ? 'active' : ''}`}
            >
              <div className="flex items-center gap-2">
                <Bookmark size={16} fill={savedItems.length > 0 ? 'currentColor' : 'none'} />
                <span>Saved Specimens</span>
              </div>
              {savedItems.length > 0 && (
                <span className="saved-count-badge">{savedItems.length}</span>
              )}
            </Link>

            {/* Appearance / Theme Selector in Drawer */}
            <div className="px-3.5 py-3 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] mt-1 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs font-mono text-[var(--text-secondary)] font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  {resolvedTheme === 'dark' ? <Moon size={14} /> : <Sun size={14} color="#E9C46A" />}
                  <span>Appearance</span>
                </span>
                <span className="text-[var(--accent-gold)] capitalize font-bold">{theme}</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`py-1.5 px-2 rounded-xs text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    theme === 'light'
                      ? 'bg-[var(--text-primary)] text-[var(--text-inverse)] shadow-sm'
                      : 'bg-[var(--bg-surface-1)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
                  }`}
                  aria-label="Set Light Theme"
                >
                  <Sun size={13} color={theme === 'light' ? 'currentColor' : '#E9C46A'} />
                  <span>Light</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`py-1.5 px-2 rounded-xs text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    theme === 'dark'
                      ? 'bg-[var(--text-primary)] text-[var(--text-inverse)] shadow-sm'
                      : 'bg-[var(--bg-surface-1)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
                  }`}
                  aria-label="Set Dark Theme"
                >
                  <Moon size={13} />
                  <span>Dark</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className={`py-1.5 px-2 rounded-xs text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    theme === 'system'
                      ? 'bg-[var(--text-primary)] text-[var(--text-inverse)] shadow-sm'
                      : 'bg-[var(--bg-surface-1)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
                  }`}
                  aria-label="Set System Theme"
                >
                  <Monitor size={13} />
                  <span>System</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
