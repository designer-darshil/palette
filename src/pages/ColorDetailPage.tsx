import React, { useMemo } from 'react';
import { ArrowLeft, Copy, Bookmark, Share2, Check, ShieldCheck, ArrowRight, Sparkles, Layers, Wand2 } from 'lucide-react';
import { RouteType, ColorItem } from '../types';
import { useLibraryData } from '../context/LibraryDataContext';
import { copyToClipboard, calculateHarmonies, assessPracticalUi, getContrastRating } from '../utils/colorUtils';
import { findClosestColorName } from '../utils/paletteGenerator';
import { createColorItemFromHex } from '../utils/canonicalResourceUtils';
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
  const { isSaved, saveItem, savedItems } = useSaved();
  const { colors, palettes, combos, gradients } = useLibraryData();

  const color: ColorItem | null = useMemo(() => {
    if (!slug) return null;
    const cleanSlug = slug.toLowerCase();

    // 1. Check Library Data (Curated + Custom + Admin)
    const matchLib = colors.find(
      (c) => c.slug.toLowerCase() === cleanSlug || c.id.toLowerCase() === cleanSlug
    );
    if (matchLib) return matchLib;

    // 2. Check Saved Items
    const matchSaved = savedItems.find(
      (s) => s.type === 'color' && (s.slug.toLowerCase() === cleanSlug || s.id.toLowerCase() === cleanSlug)
    );
    if (matchSaved && matchSaved.preview) {
      const hex = matchSaved.preview.startsWith('#') ? matchSaved.preview.toUpperCase() : `#${matchSaved.preview.toUpperCase()}`;
      return createColorItemFromHex(hex, matchSaved.title);
    }

    // 3. Dynamic HEX Slug Support (e.g. /colors/E9C46A or /colors/10288C)
    if (/^[0-9A-Fa-f]{6}$/.test(cleanSlug)) {
      const hex = `#${cleanSlug.toUpperCase()}`;
      return createColorItemFromHex(hex);
    }

    return null;
  }, [slug, colors, savedItems]);

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
    return colors.find((c: ColorItem) => c.hex.toLowerCase() === hex.toLowerCase());
  };

  // Connected Resource Network
  const relatedColors = colors.filter(
    (c: ColorItem) => c.id !== color.id && (c.family === color.family || c.hueGroup === color.hueGroup)
  ).slice(0, 3);

  const relatedPalettes = palettes.filter(
    (p) =>
      p.colors.some((c) => c.hex.toLowerCase() === color.hex.toLowerCase()) ||
      (color.family && p.tags && p.tags.includes(color.family)) ||
      (color.hueGroup && p.tags && p.tags.includes(color.hueGroup))
  ).slice(0, 2);

  const relatedCombos = combos.filter(
    (cb) =>
      cb.colors.some((c) => c.hex.toLowerCase() === color.hex.toLowerCase()) ||
      (color.family && cb.tags && cb.tags.includes(color.family))
  ).slice(0, 2);

  const relatedGradients = gradients.filter(
    (g) =>
      g.stops.some((s) => s.color.toLowerCase() === color.hex.toLowerCase()) ||
      (color.family && g.tags && g.tags.includes(color.family)) ||
      (color.hueGroup && g.tags && g.tags.includes(color.hueGroup))
  ).slice(0, 2);

  return (
    <div className="detail-container w-full max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8">
      {/* Navigation Breadcrumbs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          className="detail-back-btn w-fit inline-flex items-center gap-2"
          onClick={() => onNavigate({ path: 'colors' })}
        >
          <ArrowLeft size={16} />
          <span>Back to Colors Library</span>
        </button>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
            onClick={handleShare}
            title="Share Specimen URL"
          >
            <Share2 size={13} />
            <span>Share</span>
          </button>
          <button
            className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
            onClick={handleToggleSave}
          >
            <Bookmark size={13} fill={saved ? '#E9C46A' : 'none'} color={saved ? '#E9C46A' : 'currentColor'} />
            <span>{saved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Hero Color Specimen */}
      <section className="detail-hero-specimen rounded-md overflow-hidden border border-[var(--border-subtle)] shadow-xl">
        <div
          className="color-specimen-giant p-5 sm:p-8 min-h-[220px] sm:min-h-[280px] flex flex-col justify-between"
          style={{ backgroundColor: color.hex, color: color.bestTextColor }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="font-mono text-[11px] sm:text-xs uppercase tracking-wider opacity-90 truncate max-w-md">
              SPECIMEN Nº {color.id.toUpperCase()} • {color.family.toUpperCase()} GAMUT
            </span>
            <button
              onClick={() => handleCopyValue(color.hex, 'HEX')}
              className="bg-black/35 hover:bg-black/50 text-white px-3 py-1.5 rounded-xs flex items-center gap-1.5 text-xs font-bold font-mono self-start sm:self-auto shadow-sm transition-colors whitespace-nowrap"
            >
              <Copy size={12} />
              <span>COPY HEX</span>
            </button>
          </div>

          <div className="mt-4 sm:mt-0">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-sm">
              {color.name}
            </h1>
            <div className="font-mono text-base sm:text-xl font-bold mt-1 opacity-95">
              {color.hex}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Color Formats */}
      <section className="flex flex-col gap-3.5">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-primary)]">
            Calibrated Color Values
          </h2>
          <span className="font-mono text-[10px] sm:text-xs text-[var(--text-tertiary)] uppercase">
            CLICK ANY SPEC TO COPY
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div
            className="detail-spec-card p-3.5 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] rounded-sm cursor-pointer transition-all"
            onClick={() => handleCopyValue(color.hex, 'HEX')}
          >
            <div className="detail-spec-card-header flex items-center justify-between text-xs font-mono text-[var(--text-tertiary)]">
              <span>HEX CODE</span>
              <Copy size={12} />
            </div>
            <div className="detail-spec-value font-mono text-sm sm:text-base font-bold text-[var(--text-primary)] mt-1">
              {color.hex}
            </div>
          </div>

          <div
            className="detail-spec-card p-3.5 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] rounded-sm cursor-pointer transition-all"
            onClick={() => handleCopyValue(color.rgb, 'RGB')}
          >
            <div className="detail-spec-card-header flex items-center justify-between text-xs font-mono text-[var(--text-tertiary)]">
              <span>sRGB SPACE</span>
              <Copy size={12} />
            </div>
            <div className="detail-spec-value font-mono text-sm sm:text-base font-bold text-[var(--text-primary)] mt-1">
              {color.rgb}
            </div>
          </div>

          <div
            className="detail-spec-card p-3.5 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] rounded-sm cursor-pointer transition-all"
            onClick={() => handleCopyValue(color.hsl, 'HSL')}
          >
            <div className="detail-spec-card-header flex items-center justify-between text-xs font-mono text-[var(--text-tertiary)]">
              <span>HSL CANONICAL</span>
              <Copy size={12} />
            </div>
            <div className="detail-spec-value font-mono text-sm sm:text-base font-bold text-[var(--text-primary)] mt-1">
              {color.hsl}
            </div>
          </div>

          <div
            className="detail-spec-card p-3.5 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] rounded-sm cursor-pointer transition-all"
            onClick={() => handleCopyValue(color.oklch, 'OKLCH')}
          >
            <div className="detail-spec-card-header flex items-center justify-between text-xs font-mono text-[var(--text-tertiary)]">
              <span>OKLCH PERCEPTUAL</span>
              <Copy size={12} />
            </div>
            <div className="detail-spec-value font-mono text-xs sm:text-sm font-bold text-[var(--text-primary)] mt-1 break-all">
              {color.oklch}
            </div>
          </div>
        </div>
      </section>

      {/* Practical UI Assessment Matrix */}
      <section className="contrast-assessment-box p-4 sm:p-6 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-primary)]">
              Practical UI &amp; Accessibility Assessment
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
              Calculated contrast compliance under WCAG 2.1 criteria and recommended interface roles.
            </p>
          </div>
          <span className="font-mono text-[10px] sm:text-xs text-[var(--accent-gold)] uppercase tracking-wider font-semibold self-start sm:self-auto">
            CALCULATED METRICS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          {/* Contrast on White */}
          <div
            className="contrast-test-tile p-4 rounded-sm flex flex-col justify-between gap-3 min-h-[120px]"
            style={{ backgroundColor: '#FFFFFF', color: color.hex, border: '1px solid var(--border-medium)' }}
          >
            <div>
              <span className="font-mono text-[10px] text-[#606675] uppercase block">
                ON WHITE SURFACE (#FFFFFF)
              </span>
              <div className="font-extrabold text-base sm:text-lg mt-1">
                Specimen Typography Sample
              </div>
              <div className="text-xs opacity-85">Body text contrast preview</div>
            </div>
            <div className="contrast-score-line flex items-center justify-between font-mono text-xs font-bold text-[#111111] pt-2 border-t border-black/10">
              <span>RATIO: {practicalUi.onWhiteRatio}:1</span>
              <span style={{ color: practicalUi.onWhiteRating.passAA ? '#15803D' : '#DC2626' }}>
                {practicalUi.onWhiteRating.label}
              </span>
            </div>
          </div>

          {/* Contrast on Black / Dark */}
          <div
            className="contrast-test-tile p-4 rounded-sm flex flex-col justify-between gap-3 min-h-[120px]"
            style={{ backgroundColor: '#111215', color: color.hex, border: '1px solid var(--border-medium)' }}
          >
            <div>
              <span className="font-mono text-[10px] text-[#9DA3AF] uppercase block">
                ON DARK CANVAS (#111215)
              </span>
              <div className="font-extrabold text-base sm:text-lg mt-1">
                Specimen Typography Sample
              </div>
              <div className="text-xs opacity-85">Dark mode contrast preview</div>
            </div>
            <div className="contrast-score-line flex items-center justify-between font-mono text-xs font-bold text-[#F8F9FA] pt-2 border-t border-white/10">
              <span>RATIO: {practicalUi.onBlackRatio}:1</span>
              <span style={{ color: practicalUi.onBlackRating.passAA ? '#4ADE80' : '#F87171' }}>
                {practicalUi.onBlackRating.label}
              </span>
            </div>
          </div>
        </div>

        {/* UI Role Suitability */}
        <div className="pt-2 border-t border-[var(--border-subtle)]">
          <span className="font-mono text-[10px] sm:text-xs uppercase text-[var(--text-tertiary)] block mb-2 font-semibold">
            RECOMMENDED UI ROLES:
          </span>
          <div className="flex flex-wrap gap-2">
            {practicalUi.recommendedRoles.primaryButton && (
              <span className="combo-harmony-badge text-xs px-2.5 py-1 rounded-xs" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#93C5FD', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                ✓ Primary Action Button
              </span>
            )}
            {practicalUi.recommendedRoles.accentBadge && (
              <span className="combo-harmony-badge text-xs px-2.5 py-1 rounded-xs" style={{ backgroundColor: 'rgba(233, 196, 106, 0.15)', color: '#FDE047', border: '1px solid rgba(233, 196, 106, 0.3)' }}>
                ✓ Accent / Focus Indicator
              </span>
            )}
            {practicalUi.recommendedRoles.editorialText && (
              <span className="combo-harmony-badge text-xs px-2.5 py-1 rounded-xs" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#86EFAC', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                ✓ Heading &amp; Editorial Text
              </span>
            )}
            {practicalUi.recommendedRoles.cardSurface && (
              <span className="combo-harmony-badge text-xs px-2.5 py-1 rounded-xs" style={{ backgroundColor: 'rgba(141, 153, 174, 0.15)', color: '#E2E8F0', border: '1px solid rgba(141, 153, 174, 0.3)' }}>
                ✓ Canvas / Card Background
              </span>
            )}
            {practicalUi.recommendedRoles.subtleBorder && (
              <span className="combo-harmony-badge text-xs px-2.5 py-1 rounded-xs" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#CBD5E1', border: '1px solid var(--border-subtle)' }}>
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
      <section className="flex flex-col gap-3.5">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-primary)]">
            Tonal Step Matrix (100–950)
          </h2>
          <span className="font-mono text-[10px] sm:text-xs text-[var(--text-tertiary)] uppercase">
            CLICK ANY STEP TO COPY • SWIPE FOR FULL SPECTRUM
          </span>
        </div>

        <div className="w-full overflow-x-auto pb-1.5 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="shade-matrix-row min-w-[620px] sm:min-w-0">
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
