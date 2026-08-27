import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Palette, Layers, Wand2, Sparkles, ArrowRight } from 'lucide-react';
import { CURATED_COLORS } from '../data/colors';
import { CURATED_PALETTES } from '../data/palettes';
import { CURATED_COMBOS } from '../data/combos';
import { CURATED_GRADIENTS } from '../data/gradients';
import { RouteType } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: RouteType) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const rawQ = query.trim().toLowerCase();
  const hexQ = rawQ.startsWith('#') ? rawQ : `#${rawQ}`;

  const matchedColors = CURATED_COLORS.filter(
    (c) =>
      c.name.toLowerCase().includes(rawQ) ||
      c.hex.toLowerCase().includes(rawQ) ||
      c.hex.toLowerCase() === hexQ ||
      c.family.toLowerCase().includes(rawQ) ||
      c.hueGroup.toLowerCase().includes(rawQ) ||
      c.tags.some((t) => t.toLowerCase().includes(rawQ))
  ).slice(0, 4);

  const matchedPalettes = CURATED_PALETTES.filter(
    (p) =>
      p.title.toLowerCase().includes(rawQ) ||
      p.category.toLowerCase().includes(rawQ) ||
      p.tags.some((t) => t.toLowerCase().includes(rawQ)) ||
      p.colors.some((c) => c.hex.toLowerCase().includes(rawQ) || c.hex.toLowerCase() === hexQ || c.name.toLowerCase().includes(rawQ))
  ).slice(0, 3);

  const matchedCombos = CURATED_COMBOS.filter(
    (cb) =>
      cb.title.toLowerCase().includes(rawQ) ||
      cb.harmonyType.toLowerCase().includes(rawQ) ||
      cb.tags.some((t) => t.toLowerCase().includes(rawQ)) ||
      cb.colors.some((c) => c.hex.toLowerCase().includes(rawQ) || c.hex.toLowerCase() === hexQ)
  ).slice(0, 3);

  const matchedGradients = CURATED_GRADIENTS.filter(
    (g) =>
      g.title.toLowerCase().includes(rawQ) ||
      g.category.toLowerCase().includes(rawQ) ||
      g.type.toLowerCase().includes(rawQ) ||
      g.tags.some((t) => t.toLowerCase().includes(rawQ)) ||
      g.stops.some((s) => s.color.toLowerCase().includes(rawQ) || s.color.toLowerCase() === hexQ)
  ).slice(0, 3);

  const isLiveMatch =
    rawQ.includes('live') ||
    rawQ.includes('atmo') ||
    rawQ.includes('real') ||
    rawQ.includes('sun') ||
    rawQ.includes('weather') ||
    rawQ.includes('time');

  const allResults: { type: 'color' | 'palette' | 'combo' | 'gradient' | 'live'; route: RouteType }[] = [
    ...(isLiveMatch ? [{ type: 'live' as const, route: { path: 'live' as const } }] : []),
    ...matchedColors.map((c) => ({ type: 'color' as const, route: { path: 'color-detail' as const, slug: c.slug } })),
    ...matchedPalettes.map((p) => ({ type: 'palette' as const, route: { path: 'palette-detail' as const, slug: p.slug } })),
    ...matchedCombos.map((cb) => ({ type: 'combo' as const, route: { path: 'combo-detail' as const, slug: cb.slug } })),
    ...matchedGradients.map((g) => ({ type: 'gradient' as const, route: { path: 'gradient-detail' as const, slug: g.slug } })),
  ];

  const handleSelect = (route: RouteType) => {
    onNavigate(route);
    onClose();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (allResults.length > 0 ? (prev + 1) % allResults.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (allResults.length > 0 ? (prev - 1 + allResults.length) % allResults.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allResults[selectedIndex]) {
        handleSelect(allResults[selectedIndex].route);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  let currentIndex = 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="search-dialog-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Search Library"
        onKeyDown={handleKeyDown}
      >
        <div className="search-dialog-header">
          <Search size={18} color="#9DA3AF" />
          <input
            ref={inputRef}
            type="text"
            className="search-dialog-input"
            placeholder="Search colors, hex (#1D4ED8), palettes, harmonies, gradients..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <button onClick={onClose} aria-label="Close search">
            <X size={18} color="#9DA3AF" />
          </button>
        </div>

        <div className="search-dialog-results">
          {rawQ && allResults.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: '#9DA3AF', fontSize: '0.9rem' }}>
              No specimens found matching &ldquo;{query}&rdquo;
            </div>
          )}

          {/* Colors */}
          {matchedColors.length > 0 && (
            <div>
              <div style={{ padding: '6px 10px', fontSize: '0.7rem', color: '#606675', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Colors ({matchedColors.length})
              </div>
              {matchedColors.map((color) => {
                const isSelected = selectedIndex === currentIndex++;
                return (
                  <div
                    key={color.id}
                    className={`search-result-row ${isSelected ? 'focused' : ''}`}
                    onClick={() => handleSelect({ path: 'color-detail', slug: color.slug })}
                  >
                    <div className="search-result-left">
                      <span className="search-result-thumb" style={{ backgroundColor: color.hex }} />
                      <div>
                        <div className="search-result-title">{color.name}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#9DA3AF' }}>
                          {color.hex} • {color.family} • {color.hueGroup}
                        </div>
                      </div>
                    </div>
                    <span className="search-result-type-tag">Color</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Palettes */}
          {matchedPalettes.length > 0 && (
            <div>
              <div style={{ padding: '8px 10px 4px 10px', fontSize: '0.7rem', color: '#606675', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Palettes ({matchedPalettes.length})
              </div>
              {matchedPalettes.map((palette) => {
                const isSelected = selectedIndex === currentIndex++;
                return (
                  <div
                    key={palette.id}
                    className={`search-result-row ${isSelected ? 'focused' : ''}`}
                    onClick={() => handleSelect({ path: 'palette-detail', slug: palette.slug })}
                  >
                    <div className="search-result-left">
                      <div style={{ display: 'flex', width: 28, height: 24, borderRadius: 3, overflow: 'hidden' }}>
                        {palette.colors.slice(0, 4).map((c, i) => (
                          <div key={i} style={{ flex: 1, backgroundColor: c.hex }} />
                        ))}
                      </div>
                      <div>
                        <div className="search-result-title">{palette.title}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#9DA3AF' }}>
                          {palette.colors.length} swatches • {palette.category}
                        </div>
                      </div>
                    </div>
                    <span className="search-result-type-tag">Palette</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Combos */}
          {matchedCombos.length > 0 && (
            <div>
              <div style={{ padding: '8px 10px 4px 10px', fontSize: '0.7rem', color: '#606675', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Harmonies ({matchedCombos.length})
              </div>
              {matchedCombos.map((combo) => {
                const isSelected = selectedIndex === currentIndex++;
                return (
                  <div
                    key={combo.id}
                    className={`search-result-row ${isSelected ? 'focused' : ''}`}
                    onClick={() => handleSelect({ path: 'combo-detail', slug: combo.slug })}
                  >
                    <div className="search-result-left">
                      <div style={{ display: 'flex', width: 28, height: 24, borderRadius: 3, overflow: 'hidden' }}>
                        {combo.colors.map((c, i) => (
                          <div key={i} style={{ flex: 1, backgroundColor: c.hex }} />
                        ))}
                      </div>
                      <div>
                        <div className="search-result-title">{combo.title}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#9DA3AF' }}>
                          {combo.harmonyType} • {combo.contrastScore}
                        </div>
                      </div>
                    </div>
                    <span className="search-result-type-tag">Combo</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Gradients */}
          {matchedGradients.length > 0 && (
            <div>
              <div style={{ padding: '8px 10px 4px 10px', fontSize: '0.7rem', color: '#606675', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Gradients ({matchedGradients.length})
              </div>
              {matchedGradients.map((gradient) => {
                const isSelected = selectedIndex === currentIndex++;
                return (
                  <div
                    key={gradient.id}
                    className={`search-result-row ${isSelected ? 'focused' : ''}`}
                    onClick={() => handleSelect({ path: 'gradient-detail', slug: gradient.slug })}
                  >
                    <div className="search-result-left">
                      <div
                        style={{
                          width: 28,
                          height: 24,
                          borderRadius: 3,
                          background: gradient.css,
                        }}
                      />
                      <div>
                        <div className="search-result-title">{gradient.title}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#9DA3AF' }}>
                          {gradient.type} gradient • {gradient.category}
                        </div>
                      </div>
                    </div>
                    <span className="search-result-type-tag">Gradient</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
