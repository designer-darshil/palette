import React from 'react';
import { ArrowLeft, Copy, Bookmark, Check, Layers } from 'lucide-react';
import { RouteType, ColorItem } from '../types';
import { CURATED_COLORS } from '../data/colors';
import { CURATED_PALETTES } from '../data/palettes';
import { copyToClipboard, getContrastRating } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { ColorCard } from '../components/ColorCard';
import { PaletteCard } from '../components/PaletteCard';

interface ColorDetailPageProps {
  slug: string;
  onNavigate: (route: RouteType) => void;
}

export const ColorDetailPage: React.FC<ColorDetailPageProps> = ({ slug, onNavigate }) => {
  const { showToast } = useToast();
  const { isSaved, saveItem } = useSaved();

  const color = CURATED_COLORS.find((c) => c.slug === slug) || CURATED_COLORS[0];
  const saved = isSaved(color.id);

  const handleCopyValue = async (value: string, format: string) => {
    const success = await copyToClipboard(value);
    if (success) {
      showToast(`Copied ${format}`, color.name, value);
    }
  };

  const handleToggleSave = () => {
    saveItem({
      id: color.id,
      type: 'color',
      title: color.name,
      slug: color.slug,
      preview: color.hex,
      metadata: `${color.family} • ${color.hex}`,
    });
    showToast(
      saved ? 'Removed from saved' : 'Saved to specimen library',
      color.name,
      color.hex
    );
  };

  // Find complementary color in dataset or use hex
  const compColorObj = CURATED_COLORS.find((c) => c.hex.toLowerCase() === color.complementaryHex.toLowerCase());

  // Related colors from same family
  const relatedColors = CURATED_COLORS.filter((c) => c.id !== color.id && (c.family === color.family || c.hueGroup === color.hueGroup)).slice(0, 3);

  // Related palettes
  const relatedPalettes = CURATED_PALETTES.filter((p) =>
    p.colors.some((c) => c.hex.toLowerCase() === color.hex.toLowerCase() || p.tags.includes(color.family))
  ).slice(0, 2);

  const whiteRating = getContrastRating(color.contrastWithWhite);
  const blackRating = getContrastRating(color.contrastWithBlack);

  return (
    <div className="detail-container">
      {/* Navigation Breadcrumb */}
      <div>
        <button
          className="detail-back-btn"
          onClick={() => onNavigate({ path: 'colors' })}
        >
          <ArrowLeft size={16} />
          <span>Back to Colors Library</span>
        </button>
      </div>

      {/* Hero Color Specimen */}
      <section className="detail-hero-specimen">
        <div
          className="color-specimen-giant"
          style={{ backgroundColor: color.hex, color: color.bestTextColor }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.9 }}>
              SPECIMEN ID: {color.id.toUpperCase()} • {color.family.toUpperCase()} GAMUT
            </span>
            <button
              onClick={handleToggleSave}
              style={{
                background: 'rgba(0,0,0,0.35)',
                color: '#FFFFFF',
                padding: '8px 14px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              <Bookmark size={15} fill={saved ? '#E9C46A' : 'none'} color={saved ? '#E9C46A' : '#FFFFFF'} />
              <span>{saved ? 'Saved' : 'Save Specimen'}</span>
            </button>
          </div>

          <div>
            <h1 className="specimen-title-huge">{color.name}</h1>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', marginTop: '4px', opacity: 0.95 }}>
              {color.hex}
            </div>
          </div>
        </div>
      </section>

      {/* Color Values & Formats */}
      <section>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', letterSpacing: '-0.01em' }}>
          Calibrated Color Formats
        </h2>

        <div className="detail-specs-grid">
          <div className="detail-spec-card">
            <div className="detail-spec-card-header">
              <span>HEX CODE</span>
              <button onClick={() => handleCopyValue(color.hex, 'HEX')} aria-label="Copy HEX">
                <Copy size={13} />
              </button>
            </div>
            <div className="detail-spec-value">{color.hex}</div>
          </div>

          <div className="detail-spec-card">
            <div className="detail-spec-card-header">
              <span>sRGB SPACE</span>
              <button onClick={() => handleCopyValue(color.rgb, 'RGB')} aria-label="Copy RGB">
                <Copy size={13} />
              </button>
            </div>
            <div className="detail-spec-value">{color.rgb}</div>
          </div>

          <div className="detail-spec-card">
            <div className="detail-spec-card-header">
              <span>HSL CANONICAL</span>
              <button onClick={() => handleCopyValue(color.hsl, 'HSL')} aria-label="Copy HSL">
                <Copy size={13} />
              </button>
            </div>
            <div className="detail-spec-value">{color.hsl}</div>
          </div>

          <div className="detail-spec-card">
            <div className="detail-spec-card-header">
              <span>OKLCH PERCEPTUAL</span>
              <button onClick={() => handleCopyValue(color.oklch, 'OKLCH')} aria-label="Copy OKLCH">
                <Copy size={13} />
              </button>
            </div>
            <div className="detail-spec-value">{color.oklch}</div>
          </div>
        </div>
      </section>

      {/* Tonal Shade Matrix */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
            Tonal Step Matrix (100–950)
          </h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
            CLICK ANY STEP TO COPY
          </span>
        </div>

        <div className="shade-matrix-row">
          {color.shades.map((shade, idx) => (
            <div
              key={idx}
              className="shade-step"
              style={{
                backgroundColor: shade.hex,
                color: idx < 3 ? '#111111' : '#FFFFFF',
              }}
              onClick={() => handleCopyValue(shade.hex, `Shade ${shade.level}`)}
              title={`Click to copy Shade ${shade.level}: ${shade.hex}`}
            >
              <span>{shade.level}</span>
              <span style={{ fontWeight: 600 }}>{shade.hex}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Editorial Usage & Description */}
      <section className="contrast-assessment-box">
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
          Editorial Notes &amp; Architectural Application
        </h2>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          {color.description}
        </p>
        <div style={{ padding: '12px 16px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-gold)', display: 'block', marginBottom: '4px' }}>
            APPLICATION GUIDELINE:
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            {color.usageNotes}
          </span>
        </div>
      </section>

      {/* WCAG Contrast Assessment */}
      <section className="contrast-assessment-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
            WCAG Accessibility &amp; Contrast Matrix
          </h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
            ISO / WCAG 2.1 COMPLIANT
          </span>
        </div>

        <div className="contrast-test-tiles">
          <div
            className="contrast-test-tile"
            style={{ backgroundColor: color.hex, color: '#FFFFFF' }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>White Typography on Specimen</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>The quick brown fox jumps over the lazy dog.</div>
            </div>
            <div className="contrast-score-line">
              <span>CONTRAST: {color.contrastWithWhite}:1</span>
              <span>{whiteRating.label}</span>
            </div>
          </div>

          <div
            className="contrast-test-tile"
            style={{ backgroundColor: color.hex, color: '#111111' }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Dark Ink Typography on Specimen</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>The quick brown fox jumps over the lazy dog.</div>
            </div>
            <div className="contrast-score-line">
              <span>CONTRAST: {color.contrastWithBlack}:1</span>
              <span>{blackRating.label}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Relational Harmonies */}
      <section>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', letterSpacing: '-0.01em' }}>
          Harmonic Pairings
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* Complementary */}
          <div className="detail-spec-card">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
              COMPLEMENTARY COLOR
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
              <span
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 4,
                  backgroundColor: color.complementaryHex,
                  border: '1px solid var(--border-subtle)',
                }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  {compColorObj ? compColorObj.name : 'Complementary Tone'}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {color.complementaryHex}
                </div>
              </div>
            </div>
          </div>

          {/* Analogous */}
          <div className="detail-spec-card">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
              ANALOGOUS HARMONY
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              {color.analogousHexes.map((hex, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 4,
                    backgroundColor: hex,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    color: '#FFFFFF',
                    textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                  }}
                >
                  {hex}
                </div>
              ))}
            </div>
          </div>

          {/* Triadic */}
          <div className="detail-spec-card">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
              TRIADIC PAIRING
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              {color.triadicHexes.map((hex, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 4,
                    backgroundColor: hex,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    color: '#FFFFFF',
                    textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                  }}
                >
                  {hex}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related Colors */}
      {relatedColors.length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Related {color.family.toUpperCase()} Specimens
            </h2>
          </div>
          <div className="specimen-grid-colors">
            {relatedColors.map((c) => (
              <ColorCard key={c.id} color={c} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* Related Palettes */}
      {relatedPalettes.length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Featured In Palette Systems
            </h2>
          </div>
          <div className="specimen-grid-palettes">
            {relatedPalettes.map((p) => (
              <PaletteCard key={p.id} palette={p} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
