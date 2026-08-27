import React from 'react';
import { ArrowRight, Palette, Layers, Wand2, Sparkles, Copy, Check } from 'lucide-react';
import { RouteType } from '../types';
import { CURATED_COLORS } from '../data/colors';
import { CURATED_PALETTES } from '../data/palettes';
import { CURATED_COMBOS } from '../data/combos';
import { CURATED_GRADIENTS } from '../data/gradients';
import { ColorCard } from '../components/ColorCard';
import { PaletteCard } from '../components/PaletteCard';
import { ComboCard } from '../components/ComboCard';
import { GradientCard } from '../components/GradientCard';
import { copyToClipboard } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';

interface HomePageProps {
  onNavigate: (route: RouteType) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();

  const handleCopyQuick = async (hex: string, name: string) => {
    const success = await copyToClipboard(hex);
    if (success) {
      showToast(`Copied ${hex}`, name, hex);
    }
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-editorial">
        <div className="hero-editorial-grid">
          <div className="hero-copy-col">
            <div className="hero-kicker">
              <span className="brand-glyph" style={{ width: 10, height: 10 }} />
              <span>Editorial Digital Color Reference</span>
            </div>

            <h1 className="hero-headline">
              COLOR, <br />
              <span className="highlight-serif">curated.</span>
            </h1>

            <p className="hero-lead">
              A serious, calibrated library of pigment hues, modernist palette systems, color harmony combos, and CSS gradient specimens for designers and front-end architects.
            </p>

            <div className="hero-actions">
              <button
                className="btn-primary"
                onClick={() => onNavigate({ path: 'colors' })}
              >
                <span>Explore Colors</span>
                <ArrowRight size={16} />
              </button>

              <button
                className="btn-secondary"
                onClick={() => onNavigate({ path: 'palettes' })}
              >
                <span>Palette Systems</span>
                <Layers size={16} />
              </button>
            </div>
          </div>

          <div className="hero-specimen-stage">
            <div className="hero-specimen-header">
              <span>Specimen Nº 01 — Modernist Triad</span>
              <span>WCAG AAA (18.9:1)</span>
            </div>

            <div className="hero-specimen-plates">
              <div
                className="hero-plate-large"
                style={{ backgroundColor: '#1D4ED8', color: '#FFFFFF' }}
                onClick={() => handleCopyQuick('#1D4ED8', 'Celestial Cobalt')}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', opacity: 0.85 }}>
                  PRIMARY SPECIMEN
                </span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>Celestial Cobalt</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>#1D4ED8</div>
                </div>
              </div>

              <div className="hero-plate-stack">
                <div
                  className="hero-plate-sub"
                  style={{ backgroundColor: '#E63946', color: '#FFFFFF' }}
                  onClick={() => handleCopyQuick('#E63946', 'Vermilion')}
                >
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Vermilion</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>#E63946</span>
                </div>

                <div
                  className="hero-plate-sub"
                  style={{ backgroundColor: '#E9C46A', color: '#111111' }}
                  onClick={() => handleCopyQuick('#E9C46A', 'Saffron Ochre')}
                >
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Saffron Ochre</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>#E9C46A</span>
                </div>

                <div
                  className="hero-plate-sub"
                  style={{ backgroundColor: '#111215', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)' }}
                  onClick={() => handleCopyQuick('#111215', 'Tokyo Sumi')}
                >
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Tokyo Sumi</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>#111215</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              <span>CLICK ANY SWATCH TO COPY HEX</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>sRGB • OKLCH • WCAG</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Colors Grid */}
      <section style={{ marginBottom: '64px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
          <div>
            <span className="page-category-label">Curated Gamut</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Master Color Specimens
            </h2>
          </div>
          <button
            className="btn-secondary"
            onClick={() => onNavigate({ path: 'colors' })}
            style={{ padding: '8px 14px', fontSize: '0.8rem' }}
          >
            <span>View All Colors ({CURATED_COLORS.length})</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="specimen-grid-colors">
          {CURATED_COLORS.slice(0, 4).map((color) => (
            <ColorCard key={color.id} color={color} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* Featured Palettes Section */}
      <section style={{ marginBottom: '64px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
          <div>
            <span className="page-category-label">Editorial Systems</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Modernist &amp; Earthen Palettes
            </h2>
          </div>
          <button
            className="btn-secondary"
            onClick={() => onNavigate({ path: 'palettes' })}
            style={{ padding: '8px 14px', fontSize: '0.8rem' }}
          >
            <span>All Palettes ({CURATED_PALETTES.length})</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="specimen-grid-palettes">
          {CURATED_PALETTES.slice(0, 2).map((palette) => (
            <PaletteCard key={palette.id} palette={palette} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* Color Harmonies / Combos Preview */}
      <section style={{ marginBottom: '64px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
          <div>
            <span className="page-category-label">Relational Theory</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Color Harmonies &amp; Combinations
            </h2>
          </div>
          <button
            className="btn-secondary"
            onClick={() => onNavigate({ path: 'combos' })}
            style={{ padding: '8px 14px', fontSize: '0.8rem' }}
          >
            <span>All Harmonies ({CURATED_COMBOS.length})</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="specimen-grid-combos">
          {CURATED_COMBOS.slice(0, 2).map((combo) => (
            <ComboCard key={combo.id} combo={combo} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* CSS Gradients Preview */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
          <div>
            <span className="page-category-label">Continuous Gamut</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Curated CSS Gradients
            </h2>
          </div>
          <button
            className="btn-secondary"
            onClick={() => onNavigate({ path: 'gradients' })}
            style={{ padding: '8px 14px', fontSize: '0.8rem' }}
          >
            <span>All Gradients ({CURATED_GRADIENTS.length})</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="specimen-grid-gradients">
          {CURATED_GRADIENTS.slice(0, 2).map((gradient) => (
            <GradientCard key={gradient.id} gradient={gradient} onNavigate={onNavigate} />
          ))}
        </div>
      </section>
    </div>
  );
};
