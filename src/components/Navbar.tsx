import React, { useState } from 'react';
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

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

          {/* Desktop Navigation Links */}
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
            <button
              className={`nav-link ${isActive('palette-generator') ? 'active' : ''}`}
              onClick={() => handleNav({ path: 'palette-generator' })}
            >
              <Sparkles size={14} color="#E9C46A" />
              <span>Generator</span>
            </button>
            <button
              className={`nav-link ${isActive('contrast-checker') ? 'active' : ''}`}
              onClick={() => handleNav({ path: 'contrast-checker' })}
            >
              <ShieldCheck size={14} color="#3B82F6" />
              <span>Contrast</span>
            </button>
            <button
              className={`nav-link ${isActive('color-name-finder') ? 'active' : ''}`}
              onClick={() => handleNav({ path: 'color-name-finder' })}
            >
              <Search size={14} color="#10B981" />
              <span>Name Finder</span>
            </button>
            <button
              className={`nav-link ${isActive('live') ? 'active' : ''}`}
              onClick={() => handleNav({ path: 'live' })}
            >
              <Radio size={14} color={isActive('live') ? '#E9C46A' : '#E63946'} />
              <span>Live</span>
            </button>
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

        {/* Mobile Navigation Overlay */}
        {mobileOpen && (
          <div className="mobile-nav-overlay">
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
            <button
              className={`mobile-nav-link ${isActive('palette-generator') ? 'active' : ''}`}
              onClick={() => handleNav({ path: 'palette-generator' })}
            >
              <span>Mobile Palette Generator</span>
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
