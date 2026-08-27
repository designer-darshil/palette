import React, { useState } from 'react';
import { Search, Bookmark, Menu, X, Layers, Palette, Sparkles, Wand2 } from 'lucide-react';
import { RouteType } from '../types';
import { useSaved } from '../context/SavedContext';

interface NavbarProps {
  currentRoute: RouteType;
  onNavigate: (route: RouteType) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onNavigate, onOpenSearch }) => {
  const { savedItems } = useSaved();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === 'home' && currentRoute.path === 'home') return true;
    if (path === 'colors' && (currentRoute.path === 'colors' || currentRoute.path === 'color-detail')) return true;
    if (path === 'palettes' && (currentRoute.path === 'palettes' || currentRoute.path === 'palette-detail')) return true;
    if (path === 'combos' && (currentRoute.path === 'combos' || currentRoute.path === 'combo-detail')) return true;
    if (path === 'gradients' && (currentRoute.path === 'gradients' || currentRoute.path === 'gradient-detail')) return true;
    if (path === 'saved' && currentRoute.path === 'saved') return true;
    return false;
  };

  const handleNav = (route: RouteType) => {
    onNavigate(route);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="navbar" role="banner">
        <div className="navbar-inner">
          <button
            className="brand-logo"
            onClick={() => handleNav({ path: 'home' })}
            aria-label="KROMA Color Library Home"
          >
            <span className="brand-glyph" />
            <span>KROMA</span>
          </button>

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
          </nav>

          <div className="nav-actions">
            <button
              className="search-trigger-btn"
              onClick={onOpenSearch}
              aria-label="Search Library"
            >
              <Search size={14} />
              <span className="search-text">Search</span>
              <kbd className="kbd-shortcut">⌘K</kbd>
            </button>

            <button
              className={`saved-nav-btn ${isActive('saved') ? 'active' : ''}`}
              onClick={() => handleNav({ path: 'saved' })}
              aria-label={`Saved items (${savedItems.length})`}
            >
              <Bookmark size={14} />
              <span>Saved</span>
              {savedItems.length > 0 && (
                <span className="saved-count-badge">{savedItems.length}</span>
              )}
            </button>

            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="mobile-nav-overlay">
            <button
              className={`mobile-nav-link ${isActive('home') ? 'active' : ''}`}
              onClick={() => handleNav({ path: 'home' })}
            >
              <span>Home</span>
            </button>
            <button
              className={`mobile-nav-link ${isActive('colors') ? 'active' : ''}`}
              onClick={() => handleNav({ path: 'colors' })}
            >
              <span>Colors</span>
              <Palette size={16} />
            </button>
            <button
              className={`mobile-nav-link ${isActive('palettes') ? 'active' : ''}`}
              onClick={() => handleNav({ path: 'palettes' })}
            >
              <span>Palettes</span>
              <Layers size={16} />
            </button>
            <button
              className={`mobile-nav-link ${isActive('combos') ? 'active' : ''}`}
              onClick={() => handleNav({ path: 'combos' })}
            >
              <span>Combos</span>
              <Wand2 size={16} />
            </button>
            <button
              className={`mobile-nav-link ${isActive('gradients') ? 'active' : ''}`}
              onClick={() => handleNav({ path: 'gradients' })}
            >
              <span>Gradients</span>
              <Sparkles size={16} />
            </button>
            <button
              className={`mobile-nav-link ${isActive('saved') ? 'active' : ''}`}
              onClick={() => handleNav({ path: 'saved' })}
            >
              <span>Saved Specimens ({savedItems.length})</span>
              <Bookmark size={16} />
            </button>
          </div>
        )}
      </header>
    </>
  );
};
