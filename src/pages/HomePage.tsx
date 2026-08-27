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
import { SEOHead } from '../components/seo/SEOHead';
import { generateWebSiteSchema } from '../utils/schemaGenerator';
import { Link } from '../components/common/Link';
import { Analytics } from '../utils/analytics';

interface HomePageProps {
  onNavigate: (route: RouteType) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();

  const handleCopyQuick = async (hex: string, name: string) => {
    const success = await copyToClipboard(hex);
    if (success) {
      Analytics.trackColorCopy(hex, 'HEX', name);
      showToast(`Copied ${hex}`, name, hex);
    }
  };

  return (
    <div className="home-container">
      <SEOHead
        rawTitle
        title="KROMA — Digital Color Library & Design Specimen Reference"
        description="A curated digital color library, modernist palette catalogue, WCAG AAA harmony combinations, and CSS gradient specimens for designers and digital architects."
        canonicalPath="/"
        jsonLd={generateWebSiteSchema()}
      />

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
              <Link
                to={{ path: 'colors' }}
                onNavigate={onNavigate}
                className="btn-primary inline-flex items-center gap-2"
              >
                <span>Explore Colors</span>
                <ArrowRight size={16} />
              </Link>

              <Link
                to={{ path: 'palettes' }}
                onNavigate={onNavigate}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <span>Palette Systems</span>
                <Layers size={16} />
              </Link>
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

      {/* Live Atmospheric Doorway */}
      <section style={{ marginBottom: '48px' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #111216 0%, #181A20 100%)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '24px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
            boxShadow: 'var(--shadow-specimen)',
          }}
        >
          <div style={{ maxWidth: '560px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="brand-glyph" style={{ width: 8, height: 8 }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', color: '#E63946', letterSpacing: '0.1em', fontWeight: 700 }}>
                LIVE ATMOSPHERE BROADCAST
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
              What does the world look like right now?
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Deterministic real-time chromatic atmospheres calibrated from solar elevation, Rayleigh scatter, time of day, and environmental temperatures.
            </p>
          </div>

          <Link
            to={{ path: 'live' }}
            onNavigate={onNavigate}
            className="btn-primary inline-flex items-center gap-1.5"
            style={{ padding: '10px 18px', fontSize: '0.82rem' }}
          >
            <span>Explore Live Colors</span>
            <ArrowRight size={14} />
          </Link>
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
          <Link
            to={{ path: 'colors' }}
            onNavigate={onNavigate}
            className="btn-secondary inline-flex items-center gap-1.5"
            style={{ padding: '8px 14px', fontSize: '0.8rem' }}
          >
            <span>View All Colors ({CURATED_COLORS.length})</span>
            <ArrowRight size={14} />
          </Link>
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
          <Link
            to={{ path: 'palettes' }}
            onNavigate={onNavigate}
            className="btn-secondary inline-flex items-center gap-1.5"
            style={{ padding: '8px 14px', fontSize: '0.8rem' }}
          >
            <span>All Palettes ({CURATED_PALETTES.length})</span>
            <ArrowRight size={14} />
          </Link>
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
          <Link
            to={{ path: 'combos' }}
            onNavigate={onNavigate}
            className="btn-secondary inline-flex items-center gap-1.5"
            style={{ padding: '8px 14px', fontSize: '0.8rem' }}
          >
            <span>All Harmonies ({CURATED_COMBOS.length})</span>
            <ArrowRight size={14} />
          </Link>
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
          <Link
            to={{ path: 'gradients' }}
            onNavigate={onNavigate}
            className="btn-secondary inline-flex items-center gap-1.5"
            style={{ padding: '8px 14px', fontSize: '0.8rem' }}
          >
            <span>All Gradients ({CURATED_GRADIENTS.length})</span>
            <ArrowRight size={14} />
          </Link>
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
