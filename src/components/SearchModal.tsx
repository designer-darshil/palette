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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open triggered by parent state
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchedColors = CURATED_COLORS.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.hex.toLowerCase().includes(q) ||
      c.family.toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q))
  ).slice(0, 4);

  const matchedPalettes = CURATED_PALETTES.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      p.colors.some((c) => c.hex.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
  ).slice(0, 3);

  const matchedCombos = CURATED_COMBOS.filter(
    (cb) =>
      cb.title.toLowerCase().includes(q) ||
      cb.harmonyType.toLowerCase().includes(q) ||
      cb.tags.some((t) => t.toLowerCase().includes(q))
  ).slice(0, 3);

  const matchedGradients = CURATED_GRADIENTS.filter(
    (g) =>
      g.title.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q) ||
      g.tags.some((t) => t.toLowerCase().includes(q))
  ).slice(0, 3);

  const totalMatches =
    matchedColors.length + matchedPalettes.length + matchedCombos.length + matchedGradients.length;

  const handleSelect = (route: RouteType) => {
    onNavigate(route);
    onClose();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="search-dialog-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Search Library"
      >
        <div className="search-dialog-header">
          <Search size={18} color="#9DA3AF" />
          <input
            ref={inputRef}
            type="text"
            className="search-dialog-input"
            placeholder="Search colors, hex (#1D4ED8), palettes, harmonies, gradients..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} aria-label="Close search">
            <X size={18} color="#9DA3AF" />
          </button>
        </div>

        <div className="search-dialog-results">
          {q && totalMatches === 0 && (
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
              {matchedColors.map((color) => (
                <div
                  key={color.id}
                  className="search-result-row"
                  onClick={() => handleSelect({ path: 'color-detail', slug: color.slug })}
                >
                  <div className="search-result-left">
                    <span className="search-result-thumb" style={{ backgroundColor: color.hex }} />
                    <div>
                      <div className="search-result-title">{color.name}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#9DA3AF' }}>
                        {color.hex} • {color.family}
                      </div>
                    </div>
                  </div>
                  <span className="search-result-type-tag">Color</span>
                </div>
              ))}
            </div>
          )}

          {/* Palettes */}
          {matchedPalettes.length > 0 && (
            <div>
              <div style={{ padding: '8px 10px 4px 10px', fontSize: '0.7rem', color: '#606675', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Palettes ({matchedPalettes.length})
              </div>
              {matchedPalettes.map((palette) => (
                <div
                  key={palette.id}
                  className="search-result-row"
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
              ))}
            </div>
          )}

          {/* Combos */}
          {matchedCombos.length > 0 && (
            <div>
              <div style={{ padding: '8px 10px 4px 10px', fontSize: '0.7rem', color: '#606675', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Harmonies ({matchedCombos.length})
              </div>
              {matchedCombos.map((combo) => (
                <div
                  key={combo.id}
                  className="search-result-row"
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
              ))}
            </div>
          )}

          {/* Gradients */}
          {matchedGradients.length > 0 && (
            <div>
              <div style={{ padding: '8px 10px 4px 10px', fontSize: '0.7rem', color: '#606675', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Gradients ({matchedGradients.length})
              </div>
              {matchedGradients.map((gradient) => (
                <div
                  key={gradient.id}
                  className="search-result-row"
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
