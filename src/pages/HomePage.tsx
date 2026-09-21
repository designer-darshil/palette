import React from 'react';
import { Palette, Layers, Sparkles } from 'lucide-react';
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
import { Button } from '../components/common/Button';
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
    <div className="home-container max-w-[1360px] mx-auto px-4 md:px-8">
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
              <span>curated.</span>
            </h1>

            <p className="hero-lead">
              A serious, calibrated library of pigment hues, modernist palette systems, color harmony combos, and CSS gradient specimens for designers and front-end architects.
            </p>

            <div className="hero-actions flex items-center gap-3 flex-wrap mt-6">
              <Link to={{ path: 'ramps' }} onNavigate={onNavigate}>
                <Button variant="primary" size="md" iconLeft={<Sparkles size={15} />}>
                  Ramps Studio (OKLCH)
                </Button>
              </Link>

              <Link to={{ path: 'colors' }} onNavigate={onNavigate}>
                <Button variant="secondary" size="md">
                  Explore Colors
                </Button>
              </Link>

              <Link to={{ path: 'palettes' }} onNavigate={onNavigate}>
                <Button variant="secondary" size="md" iconLeft={<Layers size={15} />}>
                  Palette Systems
                </Button>
              </Link>
            </div>
          </div>

          <div className="hero-specimen-stage">
            <div className="hero-specimen-header flex items-center justify-between text-xs font-mono text-[var(--text-tertiary)] mb-3 pb-2 border-b border-[var(--border-subtle)]">
              <span>Specimen Nº 01 — Modernist Triad</span>
              <span className="text-emerald-400">WCAG AAA (18.9:1)</span>
            </div>

            <div className="hero-specimen-plates flex flex-col sm:flex-row gap-3 h-[280px]">
              <div
                className="hero-plate-large flex-1 rounded-[var(--radius-sm)] p-4 flex flex-col justify-between cursor-pointer transition-transform hover:-translate-y-0.5 shadow-[var(--shadow-sm)]"
                style={{ backgroundColor: '#1D4ED8', color: '#FFFFFF' }}
                onClick={() => handleCopyQuick('#1D4ED8', 'Celestial Cobalt')}
              >
                <span className="font-mono text-xs opacity-85">
                  PRIMARY SPECIMEN
                </span>
                <div>
                  <div className="font-bold text-xl">Celestial Cobalt</div>
                  <div className="font-mono text-sm opacity-90">#1D4ED8</div>
                </div>
              </div>

              <div className="hero-plate-stack w-full sm:w-[150px] flex flex-col gap-2">
                <div
                  className="hero-plate-sub flex-1 rounded-[var(--radius-sm)] p-2.5 flex flex-col justify-center cursor-pointer transition-transform hover:-translate-y-0.5"
                  style={{ backgroundColor: '#E63946', color: '#FFFFFF' }}
                  onClick={() => handleCopyQuick('#E63946', 'Vermilion')}
                >
                  <span className="font-semibold text-sm">Vermilion</span>
                  <span className="font-mono text-xs opacity-90">#E63946</span>
                </div>

                <div
                  className="hero-plate-sub flex-1 rounded-[var(--radius-sm)] p-2.5 flex flex-col justify-center cursor-pointer transition-transform hover:-translate-y-0.5"
                  style={{ backgroundColor: '#E9C46A', color: '#111111' }}
                  onClick={() => handleCopyQuick('#E9C46A', 'Saffron Ochre')}
                >
                  <span className="font-semibold text-sm">Saffron Ochre</span>
                  <span className="font-mono text-xs opacity-90">#E9C46A</span>
                </div>

                <div
                  className="hero-plate-sub flex-1 rounded-[var(--radius-sm)] p-2.5 flex flex-col justify-center cursor-pointer transition-transform hover:-translate-y-0.5 border border-white/10"
                  style={{ backgroundColor: '#111215', color: '#FFFFFF' }}
                  onClick={() => handleCopyQuick('#111215', 'Tokyo Sumi')}
                >
                  <span className="font-semibold text-sm">Tokyo Sumi</span>
                  <span className="font-mono text-xs opacity-90">#111215</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-[var(--text-tertiary)] mt-3">
              <span>Click any swatch to copy HEX</span>
              <span className="font-mono">sRGB • OKLCH • WCAG</span>
            </div>
          </div>
        </div>
      </section>

      {/* Ramps Studio Flagship Doorway */}
      <section className="mb-10">
        <div className="bg-[var(--bg-surface-1)] border border-[var(--border-medium)] rounded-[var(--radius-md)] p-6 md:p-7 flex items-center justify-between flex-wrap gap-5 shadow-[var(--shadow-sm)] hover:border-[var(--border-strong)] transition-all">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 mb-2 text-xs font-semibold text-[var(--color-primary-text)]">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] inline-block" />
              <span className="tracking-tight">Ramps Studio — Design Token Engine</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-1 text-[var(--text-primary)]">
              Color ramps and semantic tokens your agent can read.
            </h2>
            <p className="text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed">
              Generate complete accessible design token systems from one brand color: perceptually-even OKLCH scales (50–950), scheme-derived accents, chroma-matched neutrals, and enforced WCAG AAA/AA contrast.
            </p>
          </div>

          <Link to={{ path: 'ramps' }} onNavigate={onNavigate}>
            <Button variant="primary" size="md">
              Launch Ramps Studio
            </Button>
          </Link>
        </div>
      </section>

      {/* Live Atmospheric Doorway */}
      <section className="mb-12">
        <div className="bg-[var(--bg-surface-1)] border border-[var(--border-medium)] rounded-[var(--radius-md)] p-6 md:p-7 flex items-center justify-between flex-wrap gap-5 shadow-[var(--shadow-sm)] hover:border-[var(--border-strong)] transition-all">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 mb-2 text-xs font-semibold text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-pulse" />
              <span className="tracking-tight">Live Atmosphere Broadcast</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-1 text-[var(--text-primary)]">
              What does the world look like right now?
            </h2>
            <p className="text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed">
              Deterministic real-time chromatic atmospheres calibrated from solar elevation, Rayleigh scatter, time of day, and environmental temperatures.
            </p>
          </div>

          <Link to={{ path: 'live' }} onNavigate={onNavigate}>
            <Button variant="secondary" size="md">
              Explore Live Colors
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Colors Grid */}
      <section className="mb-14">
        <div className="flex justify-between items-end mb-6 pb-2 border-b border-[var(--border-subtle)]">
          <div>
            <span className="page-category-label">Curated Gamut</span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Master Color Specimens
            </h2>
          </div>
          <Link to={{ path: 'colors' }} onNavigate={onNavigate}>
            <Button variant="secondary" size="sm">
              View All Colors ({CURATED_COLORS.length})
            </Button>
          </Link>
        </div>

        <div className="specimen-grid-colors grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CURATED_COLORS.slice(0, 4).map((color) => (
            <ColorCard key={color.id} color={color} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* Featured Palettes Section */}
      <section className="mb-14">
        <div className="flex justify-between items-end mb-6 pb-2 border-b border-[var(--border-subtle)]">
          <div>
            <span className="page-category-label">Editorial Systems</span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Modernist &amp; Earthen Palettes
            </h2>
          </div>
          <Link to={{ path: 'palettes' }} onNavigate={onNavigate}>
            <Button variant="secondary" size="sm">
              All Palettes ({CURATED_PALETTES.length})
            </Button>
          </Link>
        </div>

        <div className="specimen-grid-palettes grid grid-cols-1 lg:grid-cols-2 gap-4">
          {CURATED_PALETTES.slice(0, 2).map((palette) => (
            <PaletteCard key={palette.id} palette={palette} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* Color Harmonies / Combos Preview */}
      <section className="mb-14">
        <div className="flex justify-between items-end mb-6 pb-2 border-b border-[var(--border-subtle)]">
          <div>
            <span className="page-category-label">Relational Theory</span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Color Harmonies &amp; Combinations
            </h2>
          </div>
          <Link to={{ path: 'combos' }} onNavigate={onNavigate}>
            <Button variant="secondary" size="sm">
              All Harmonies ({CURATED_COMBOS.length})
            </Button>
          </Link>
        </div>

        <div className="specimen-grid-combos grid grid-cols-1 lg:grid-cols-2 gap-4">
          {CURATED_COMBOS.slice(0, 2).map((combo) => (
            <ComboCard key={combo.id} combo={combo} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* CSS Gradients Preview */}
      <section className="mb-12">
        <div className="flex justify-between items-end mb-6 pb-2 border-b border-[var(--border-subtle)]">
          <div>
            <span className="page-category-label">Continuous Gamut</span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Curated CSS Gradients
            </h2>
          </div>
          <Link to={{ path: 'gradients' }} onNavigate={onNavigate}>
            <Button variant="secondary" size="sm">
              All Gradients ({CURATED_GRADIENTS.length})
            </Button>
          </Link>
        </div>

        <div className="specimen-grid-gradients grid grid-cols-1 lg:grid-cols-2 gap-4">
          {CURATED_GRADIENTS.slice(0, 2).map((gradient) => (
            <GradientCard key={gradient.id} gradient={gradient} onNavigate={onNavigate} />
          ))}
        </div>
      </section>
    </div>
  );
};
