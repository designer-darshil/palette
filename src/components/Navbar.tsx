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
  Wrench,
  Compass,
} from 'lucide-react';
import { RouteType } from '../types';
import { useSaved } from '../context/SavedContext';
import { useTheme } from '../context/ThemeContext';

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
          <button
            className="brand-logo"
            onClick={() => handleNav({ path: 'home' })}
            aria-label="KROMA Color Library Home"
          >
            <span className="brand-glyph" />
            <span className="brand-title-text">KROMA</span>
          </button>

          {/* Desktop Navigation Links — Streamlined & Uncluttered */}
          <nav className="nav-links" aria-label="Main Navigation">
            <button
              className={`nav-link ${isActive('colors') ? 'active' : ''}`}
              onClick={() => handleNav({ path: 'colors' })}
            >
              <Palette size={15} />
              <span>Colors</span>
            </button>
            <button
              className={`nav-link ${isActive('palettes') ? 'active' : ''}`}
              onClick={() => handleNav({ path: 'palettes' })}
            >
              <Layers size={15} />
              <span>Palettes</span>
            </button>
            <button
              className={`nav-link ${isActive('combos') ? 'active' : ''}`}
              onClick={() => handleNav({ path: 'combos' })}
            >
              <Wand2 size={15} />
              <span>Combos</span>
            </button>
            <button
              className={`nav-link ${isActive('gradients') ? 'active' : ''}`}
              onClick={() => handleNav({ path: 'gradients' })}
            >
              <Sparkles size={15} />
              <span>Gradients</span>
            </button>

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
                      <button
                        key={tool.id}
                        onClick={() => handleNav(tool.path)}
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
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Unified Action Controls (Search, Saved, Theme, Menu) */}
          <div className="nav-actions">
            {/* Quick Search */}
            <button
              className="search-trigger-btn"
              onClick={onOpenSearch}
              aria-label="Search color library"
              title="Search Library (⌘K)"
            >
              <Search size={14} />
              <span className="search-text">Search</span>
              <kbd className="kbd-shortcut">⌘K</kbd>
            </button>

            {/* Saved Items */}
            <button
              className={`saved-nav-btn ${isActive('saved') ? 'active' : ''}`}
              onClick={() => handleNav({ path: 'saved' })}
              aria-label={`Saved collection (${savedItems.length} items)`}
              title="View Saved Specimens"
            >
              <Bookmark size={14} fill={savedItems.length > 0 ? 'currentColor' : 'none'} />
              <span className="saved-nav-text">Saved</span>
              {savedItems.length > 0 && (
                <span className="saved-count-badge">{savedItems.length}</span>
              )}
            </button>

            {/* Compact Geometric Theme Toggle */}
            <button
              onClick={cycleTheme}
              className="theme-toggle-btn"
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
              <span className="theme-name-text">{theme}</span>
            </button>

            {/* Mobile Navigation Toggle */}
            <button
              className="mobile-menu-toggle"
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
            <button
              className={`mobile-nav-link ${isActive('home') ? 'active' : ''}`}
              onClick={() => handleNav({ path: 'home' })}
            >
              <span>Home Library</span>
            </button>
            <button
              className={`mobile-nav-link ${isActive('colors') ? 'active' : ''}`}
              onClick={() => handleNav({ path: 'colors' })}
            >
              <span>Color Specimens</span>
              <Palette size={16} />
            </button>
            <button
              className={`mobile-nav-link ${isActive('palettes') ? 'active' : ''}`}
              onClick={() => handleNav({ path: 'palettes' })}
            >
              <span>Palette Systems</span>
              <Layers size={16} />
            </button>
            <button
              className={`mobile-nav-link ${isActive('combos') ? 'active' : ''}`}
              onClick={() => handleNav({ path: 'combos' })}
            >
              <span>Harmonies &amp; Combos</span>
              <Wand2 size={16} />
            </button>
            <button
              className={`mobile-nav-link ${isActive('gradients') ? 'active' : ''}`}
              onClick={() => handleNav({ path: 'gradients' })}
            >
              <span>CSS Gradients</span>
              <Sparkles size={16} />
            </button>

            <div className="px-4 pt-4 pb-2 font-mono text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-semibold border-t border-[var(--border-subtle)] mt-2">
              STUDIO &amp; TOOLS
            </div>
            <button
              className={`mobile-nav-link ${isActive('palette-generator') ? 'active' : ''}`}
              onClick={() => handleNav({ path: 'palette-generator' })}
            >
              <span>Palette Generator</span>
              <Sparkles size={16} color="#E9C46A" />
            </button>
            <button
              className={`mobile-nav-link ${isActive('contrast-checker') ? 'active' : ''}`}
              onClick={() => handleNav({ path: 'contrast-checker' })}
            >
              <span>Color Contrast Checker</span>
              <ShieldCheck size={16} color="#3B82F6" />
            </button>
            <button
              className={`mobile-nav-link ${isActive('color-name-finder') ? 'active' : ''}`}
              onClick={() => handleNav({ path: 'color-name-finder' })}
            >
              <span>Color Name Finder</span>
              <Search size={16} color="#10B981" />
            </button>
            <button
              className={`mobile-nav-link ${isActive('live') ? 'active' : ''}`}
              onClick={() => handleNav({ path: 'live' })}
            >
              <span>Real-Time Live Atmosphere</span>
              <Radio size={16} color="#E63946" />
            </button>

            <div className="px-4 pt-4 pb-2 font-mono text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-semibold border-t border-[var(--border-subtle)] mt-2">
              WORKSPACE
            </div>
            <button
              className={`mobile-nav-link ${isActive('saved') ? 'active' : ''}`}
              onClick={() => handleNav({ path: 'saved' })}
            >
              <span>Saved Specimens ({savedItems.length})</span>
              <Bookmark size={16} fill={savedItems.length > 0 ? 'currentColor' : 'none'} />
            </button>
          </div>
        )}
      </header>
    </>
  );
};
