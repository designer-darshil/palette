import React from 'react';
import { ArrowLeft, Copy, Bookmark, Share2, Check, ShieldCheck, ArrowRight, Sparkles, Layers, Wand2 } from 'lucide-react';
import { RouteType, ColorItem } from '../types';
import { CURATED_COLORS } from '../data/colors';
import { CURATED_PALETTES } from '../data/palettes';
import { CURATED_COMBOS } from '../data/combos';
import { CURATED_GRADIENTS } from '../data/gradients';
import { copyToClipboard, calculateHarmonies, assessPracticalUi, getContrastRating } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { ColorCard } from '../components/ColorCard';
import { PaletteCard } from '../components/PaletteCard';
import { ComboCard } from '../components/ComboCard';
import { GradientCard } from '../components/GradientCard';

import { NotFoundPage } from './NotFoundPage';

interface ColorDetailPageProps {
  slug: string;
  onNavigate: (route: RouteType) => void;
}

export const ColorDetailPage: React.FC<ColorDetailPageProps> = ({ slug, onNavigate }) => {
  const { showToast } = useToast();
  const { isSaved, saveItem } = useSaved();

  const color = CURATED_COLORS.find((c) => c.slug === slug);
  if (!color) {
    return <NotFoundPage requestedUrl={`/colors/${slug}`} onNavigate={onNavigate} />;
  }
  const saved = isSaved(color.id);

  const calculatedHarmonies = calculateHarmonies(color.hex);
  const practicalUi = assessPracticalUi(color.hex);

  const handleCopyValue = async (value: string, format: string) => {
    const success = await copyToClipboard(value);
    if (success) {
      showToast(`Copied ${format}`, color.name, value);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const success = await copyToClipboard(url);
    if (success) {
      showToast('Specimen link copied to clipboard', color.name);
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

  // Helper to find a library color matching a hex or finding nearest
  const findMatchingColor = (hex: string) => {
    return CURATED_COLORS.find((c) => c.hex.toLowerCase() === hex.toLowerCase());
  };

  // Connected Resource Network
  const relatedColors = CURATED_COLORS.filter(
    (c) => c.id !== color.id && (c.family === color.family || c.hueGroup === color.hueGroup)
  ).slice(0, 3);

  const relatedPalettes = CURATED_PALETTES.filter(
    (p) =>
      p.colors.some((c) => c.hex.toLowerCase() === color.hex.toLowerCase()) ||
      p.tags.includes(color.family) ||
      p.tags.includes(color.hueGroup)
  ).slice(0, 2);

  const relatedCombos = CURATED_COMBOS.filter(
    (cb) =>
      cb.colors.some((c) => c.hex.toLowerCase() === color.hex.toLowerCase()) ||
      cb.tags.includes(color.family)
  ).slice(0, 2);

  const relatedGradients = CURATED_GRADIENTS.filter(
    (g) =>
      g.stops.some((s) => s.color.toLowerCase() === color.hex.toLowerCase()) ||
      g.tags.includes(color.family) ||
      g.tags.includes(color.hueGroup)
  ).slice(0, 2);

  return (
    <div className="detail-container">
      {/* Navigation Breadcrumbs & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          className="detail-back-btn"
          onClick={() => onNavigate({ path: 'colors' })}
        >
          <ArrowLeft size={16} />
          <span>Back to Colors Library</span>
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn-secondary"
            onClick={handleShare}
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            title="Share Specimen URL"
          >
            <Share2 size={13} />
            <span>Share</span>
          </button>
          <button
            className="btn-secondary"
            onClick={handleToggleSave}
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          >
            <Bookmark size={13} fill={saved ? '#E9C46A' : 'none'} color={saved ? '#E9C46A' : 'currentColor'} />
            <span>{saved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Hero Color Specimen */}
      <section className="detail-hero-specimen">
        <div
          className="color-specimen-giant"
          style={{ backgroundColor: color.hex, color: color.bestTextColor }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.9 }}>
              SPECIMEN Nº {color.id.toUpperCase()} • {color.family.toUpperCase()} GAMUT • {color.hueGroup.toUpperCase()}
            </span>
            <button
              onClick={() => handleCopyValue(color.hex, 'HEX')}
              style={{
                background: 'rgba(0,0,0,0.35)',
                color: '#FFFFFF',
                padding: '6px 12px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
              }}
            >
              <Copy size={12} />
              <span>COPY HEX</span>
            </button>
          </div>

          <div>
            <h1 className="specimen-title-huge">{color.name}</h1>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', marginTop: '4px', opacity: 0.95 }}>
              {color.hex}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Color Formats */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
            Calibrated Color Values
          </h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
            CLICK ANY SPEC TO COPY
          </span>
        </div>

        <div className="detail-specs-grid">
          <div
            className="detail-spec-card"
            style={{ cursor: 'pointer' }}
            onClick={() => handleCopyValue(color.hex, 'HEX')}
          >
            <div className="detail-spec-card-header">
              <span>HEX CODE</span>
              <Copy size={12} />
            </div>
            <div className="detail-spec-value">{color.hex}</div>
          </div>

          <div
            className="detail-spec-card"
            style={{ cursor: 'pointer' }}
            onClick={() => handleCopyValue(color.rgb, 'RGB')}
          >
            <div className="detail-spec-card-header">
              <span>sRGB SPACE</span>
              <Copy size={12} />
            </div>
            <div className="detail-spec-value">{color.rgb}</div>
          </div>

          <div
            className="detail-spec-card"
            style={{ cursor: 'pointer' }}
            onClick={() => handleCopyValue(color.hsl, 'HSL')}
          >
            <div className="detail-spec-card-header">
              <span>HSL CANONICAL</span>
              <Copy size={12} />
            </div>
            <div className="detail-spec-value">{color.hsl}</div>
          </div>

          <div
            className="detail-spec-card"
            style={{ cursor: 'pointer' }}
            onClick={() => handleCopyValue(color.oklch, 'OKLCH')}
          >
            <div className="detail-spec-card-header">
              <span>OKLCH PERCEPTUAL</span>
              <Copy size={12} />
            </div>
            <div className="detail-spec-value">{color.oklch}</div>
          </div>
        </div>
      </section>

      {/* Practical UI Assessment Matrix */}
      <section className="contrast-assessment-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Practical UI &amp; Accessibility Assessment
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Calculated contrast compliance under WCAG 2.1 criteria and recommended interface roles.
            </p>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
            CALCULATED METRICS
          </span>
        </div>

        <div className="contrast-test-tiles">
          {/* Contrast on White */}
          <div
            className="contrast-test-tile"
            style={{ backgroundColor: '#FFFFFF', color: color.hex, border: '1px solid var(--border-medium)' }}
          >
            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#606675', textTransform: 'uppercase' }}>
                ON WHITE SURFACE (#FFFFFF)
              </span>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', marginTop: '4px' }}>
                Specimen Typography Sample
              </div>
              <div style={{ fontSize: '0.82rem', opacity: 0.85 }}>Body text contrast preview</div>
            </div>
            <div className="contrast-score-line" style={{ color: '#111111' }}>
              <span>RATIO: {practicalUi.onWhiteRatio}:1</span>
              <span style={{ color: practicalUi.onWhiteRating.passAA ? '#15803D' : '#DC2626' }}>
                {practicalUi.onWhiteRating.label}
              </span>
            </div>
          </div>

          {/* Contrast on Black / Dark */}
          <div
            className="contrast-test-tile"
            style={{ backgroundColor: '#111215', color: color.hex, border: '1px solid var(--border-medium)' }}
          >
            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#9DA3AF', textTransform: 'uppercase' }}>
                ON DARK CANVAS (#111215)
              </span>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', marginTop: '4px' }}>
                Specimen Typography Sample
              </div>
              <div style={{ fontSize: '0.82rem', opacity: 0.85 }}>Dark mode contrast preview</div>
            </div>
            <div className="contrast-score-line" style={{ color: '#F8F9FA' }}>
              <span>RATIO: {practicalUi.onBlackRatio}:1</span>
              <span style={{ color: practicalUi.onBlackRating.passAA ? '#4ADE80' : '#F87171' }}>
                {practicalUi.onBlackRating.label}
              </span>
            </div>
          </div>
        </div>

        {/* UI Role Suitability */}
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', display: 'block', marginBottom: '8px' }}>
            RECOMMENDED UI ROLES:
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {practicalUi.recommendedRoles.primaryButton && (
              <span className="combo-harmony-badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#93C5FD', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                ✓ Primary Action Button
              </span>
            )}
            {practicalUi.recommendedRoles.accentBadge && (
              <span className="combo-harmony-badge" style={{ backgroundColor: 'rgba(233, 196, 106, 0.15)', color: '#FDE047', border: '1px solid rgba(233, 196, 106, 0.3)' }}>
                ✓ Accent / Focus Indicator
              </span>
            )}
            {practicalUi.recommendedRoles.editorialText && (
              <span className="combo-harmony-badge" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#86EFAC', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                ✓ Heading &amp; Editorial Text
              </span>
            )}
            {practicalUi.recommendedRoles.cardSurface && (
              <span className="combo-harmony-badge" style={{ backgroundColor: 'rgba(141, 153, 174, 0.15)', color: '#E2E8F0', border: '1px solid rgba(141, 153, 174, 0.3)' }}>
                ✓ Canvas / Card Background
              </span>
            )}
            {practicalUi.recommendedRoles.subtleBorder && (
              <span className="combo-harmony-badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#CBD5E1', border: '1px solid var(--border-subtle)' }}>
                ✓ Border &amp; Grid Lines
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Relational Harmonies & Color Theory */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
            Calculated Relational Harmonies
          </h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
            MATHEMATICAL COLOR WHEEL
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {/* Complementary */}
          <div className="detail-spec-card">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
              COMPLEMENTARY (180°)
            </span>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', cursor: 'pointer' }}
              onClick={() => {
                const match = findMatchingColor(calculatedHarmonies.complementary);
                if (match) onNavigate({ path: 'color-detail', slug: match.slug });
                else handleCopyValue(calculatedHarmonies.complementary, 'Complementary HEX');
              }}
              title="Click to view or copy"
            >
              <span
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 4,
                  backgroundColor: calculatedHarmonies.complementary,
                  border: '1px solid var(--border-subtle)',
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                  {findMatchingColor(calculatedHarmonies.complementary)?.name || 'Direct Complement'}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {calculatedHarmonies.complementary}
                </div>
              </div>
            </div>
          </div>

          {/* Analogous */}
          <div className="detail-spec-card">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
              ANALOGOUS (±30°)
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              {calculatedHarmonies.analogous.map((hex, i) => (
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
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    const match = findMatchingColor(hex);
                    if (match) onNavigate({ path: 'color-detail', slug: match.slug });
                    else handleCopyValue(hex, 'Analogous HEX');
                  }}
                  title="Click to view or copy"
                >
                  {hex}
                </div>
              ))}
            </div>
          </div>

          {/* Triadic */}
          <div className="detail-spec-card">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
              TRIADIC (±120°)
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              {calculatedHarmonies.triadic.map((hex, i) => (
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
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    const match = findMatchingColor(hex);
                    if (match) onNavigate({ path: 'color-detail', slug: match.slug });
                    else handleCopyValue(hex, 'Triadic HEX');
                  }}
                  title="Click to view or copy"
                >
                  {hex}
                </div>
              ))}
            </div>
          </div>

          {/* Split Complementary */}
          <div className="detail-spec-card">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
              SPLIT COMPLEMENTARY (180° ±30°)
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              {calculatedHarmonies.splitComplementary.map((hex, i) => (
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
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    const match = findMatchingColor(hex);
                    if (match) onNavigate({ path: 'color-detail', slug: match.slug });
                    else handleCopyValue(hex, 'Split-Complementary HEX');
                  }}
                  title="Click to view or copy"
                >
                  {hex}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tonal Shade Step Matrix */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
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

      {/* Editorial Application Notes */}
      <section className="contrast-assessment-box">
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
          Design Philosophy &amp; Specimen Notes
        </h2>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          {color.description}
        </p>
        <div style={{ padding: '12px 16px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--accent-gold)', display: 'block', marginBottom: '4px' }}>
            APPLICATION GUIDELINE:
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            {color.usageNotes}
          </span>
        </div>
      </section>

      {/* Connected Resource Network: Palettes, Combos, Gradients */}
      {relatedPalettes.length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Palette Systems Featuring {color.name}
            </h2>
          </div>
          <div className="specimen-grid-palettes">
            {relatedPalettes.map((p) => (
              <PaletteCard key={p.id} palette={p} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {relatedCombos.length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Color Harmonies Featuring This Gamut
            </h2>
          </div>
          <div className="specimen-grid-combos">
            {relatedCombos.map((cb) => (
              <ComboCard key={cb.id} combo={cb} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {relatedGradients.length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Curated Gradients in this Colorway
            </h2>
          </div>
          <div className="specimen-grid-gradients">
            {relatedGradients.map((g) => (
              <GradientCard key={g.id} gradient={g} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

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
    </div>
  );
};
