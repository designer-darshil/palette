import React, { useState, useMemo } from 'react';
import { ArrowLeft, Copy, Bookmark, Sparkles, RefreshCw, Share2, ExternalLink } from 'lucide-react';
import { RouteType, GradientItem } from '../types';
import { useLibraryData } from '../context/LibraryDataContext';
import { copyToClipboard } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { GradientCard } from '../components/GradientCard';
import { PaletteCard } from '../components/PaletteCard';
import { ComboCard } from '../components/ComboCard';
import { NotFoundPage } from './NotFoundPage';

interface GradientDetailPageProps {
  slug: string;
  onNavigate: (route: RouteType) => void;
}

export const GradientDetailPage: React.FC<GradientDetailPageProps> = ({ slug, onNavigate }) => {
  const { showToast } = useToast();
  const { isSaved, saveItem, savedItems } = useSaved();
  const { gradients, colors, palettes, combos } = useLibraryData();

  const baseGradient: GradientItem | null = useMemo(() => {
    if (!slug) return null;
    const cleanSlug = slug.toLowerCase();

    // 1. Check Library Data (Curated + Custom + Admin)
    const matchLib = gradients.find(
      (g) => g.slug.toLowerCase() === cleanSlug || g.id.toLowerCase() === cleanSlug
    );
    if (matchLib) return matchLib;

    // 2. Check Saved Items
    const matchSaved = savedItems.find(
      (s) => s.type === 'gradient' && (s.slug.toLowerCase() === cleanSlug || s.id.toLowerCase() === cleanSlug)
    );
    if (matchSaved && matchSaved.preview) {
      return {
        id: matchSaved.id,
        slug: matchSaved.slug,
        title: matchSaved.title,
        type: 'linear',
        css: matchSaved.preview,
        category: 'Curator Workspace',
        description: matchSaved.metadata || `Saved gradient specimen ${matchSaved.title}.`,
        stops: [
          { color: '#1D4ED8', position: 0, name: 'Start' },
          { color: '#7E22CE', position: 100, name: 'End' },
        ],
        tags: ['saved', 'gradient', 'custom'],
      };
    }

    return null;
  }, [slug, gradients, savedItems]);

  if (!baseGradient) {
    return <NotFoundPage requestedUrl={`/gradients/${slug}`} onNavigate={onNavigate} />;
  }
  const [angle, setAngle] = useState<number>(baseGradient.angle || 135);

  const saved = isSaved(baseGradient.id);

  const computedCss =
    baseGradient.type === 'linear'
      ? `linear-gradient(${angle}deg, ${baseGradient.stops
          .map((s) => `${s.color} ${s.position}%`)
          .join(', ')})`
      : baseGradient.css;

  const handleCopyCss = async () => {
    const success = await copyToClipboard(`background: ${computedCss};`);
    if (success) {
      showToast('Copied CSS Gradient', baseGradient.title, computedCss);
    }
  };

  const handleCopyStopHex = async (hex: string, name: string) => {
    const success = await copyToClipboard(hex);
    if (success) {
      showToast(`Copied ${hex}`, name, hex);
    }
  };

  const handleShare = async () => {
    const success = await copyToClipboard(window.location.href);
    if (success) {
      showToast('Gradient link copied to clipboard', baseGradient.title);
    }
  };

  const handleToggleSave = () => {
    saveItem({
      id: baseGradient.id,
      type: 'gradient',
      title: baseGradient.title,
      slug: baseGradient.slug,
      preview: computedCss,
      metadata: `${baseGradient.type} • ${baseGradient.category}`,
    });
    showToast(
      saved ? 'Removed gradient from saved' : 'Saved gradient to collection',
      baseGradient.title
    );
  };

  const findMatchingColorSlug = (hex: string) => {
    const match = colors.find((c) => c.hex.toLowerCase() === hex.toLowerCase());
    return match ? match.slug : null;
  };

  const relatedGradients = gradients.filter(
    (g) => g.id !== baseGradient.id && (g.category === baseGradient.category || (g.tags && baseGradient.tags && g.tags.some((t) => baseGradient.tags.includes(t))))
  ).slice(0, 2);

  const relatedPalettes = palettes.filter(
    (p) => (p.tags && baseGradient.tags && p.tags.some((t) => baseGradient.tags.includes(t))) || p.category === baseGradient.category
  ).slice(0, 2);

  const relatedCombos = combos.filter(
    (cb) => cb.tags && baseGradient.tags && cb.tags.some((t) => baseGradient.tags.includes(t))
  ).slice(0, 2);

  return (
    <div className="detail-container">
      {/* Navigation Breadcrumb & Share */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          className="detail-back-btn"
          onClick={() => onNavigate({ path: 'gradients' })}
        >
          <ArrowLeft size={16} />
          <span>Back to Gradients Library</span>
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn-secondary"
            onClick={handleShare}
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            title="Share Gradient URL"
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

      {/* Hero Gradient Stage */}
      <section className="detail-hero-specimen">
        <div
          style={{
            height: '320px',
            background: computedCss,
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: '#FFFFFF',
                background: 'rgba(0,0,0,0.5)',
                padding: '3px 8px',
                borderRadius: '3px',
                textTransform: 'uppercase',
              }}
            >
              {baseGradient.type.toUpperCase()} • {angle}° ANGLE
            </span>
            <button
              onClick={handleCopyCss}
              style={{
                background: 'rgba(0,0,0,0.5)',
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
              <span>COPY CSS</span>
            </button>
          </div>

          <div>
            <h1
              className="specimen-title-huge"
              style={{
                color: '#FFFFFF',
                textShadow: '0 2px 8px rgba(0,0,0,0.6)',
              }}
            >
              {baseGradient.title}
            </h1>
            <p
              style={{
                color: '#FFFFFF',
                opacity: 0.9,
                fontSize: '0.95rem',
                textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                marginTop: '4px',
              }}
            >
              {baseGradient.stops.length} calibrated chromatic stops in continuum
            </p>
          </div>
        </div>
      </section>

      {/* Angle & Live Adjuster */}
      {baseGradient.type === 'linear' && (
        <section className="contrast-assessment-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
                Trajectory &amp; Vector Angle: {angle}°
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Slide to recalibrate gradient angle in real-time.
              </p>
            </div>
            <button
              className="btn-secondary"
              onClick={() => setAngle(baseGradient.angle || 135)}
              style={{ padding: '6px 10px', fontSize: '0.75rem' }}
            >
              <RefreshCw size={12} />
              <span>Reset Angle</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <input
              type="range"
              min="0"
              max="360"
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              style={{ flex: 1, accentColor: '#F8F9FA' }}
              aria-label="Gradient angle slider"
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', width: '40px', textAlign: 'right' }}>
              {angle}°
            </span>
          </div>
        </section>
      )}

      {/* Color Stop Breakdown with Direct Links to Color Specimens */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
            Gradient Stops &amp; Color Specimens
          </h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
            CLICK ANY STOP TO EXPLORE
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {baseGradient.stops.map((stop, idx) => {
            const slug = findMatchingColorSlug(stop.color);
            return (
              <div key={idx} className="detail-spec-card">
                <div
                  style={{
                    height: '40px',
                    backgroundColor: stop.color,
                    borderRadius: '3px',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '8px',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleCopyStopHex(stop.color, stop.name || `Stop 0${idx + 1}`)}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{stop.name || `Stop 0${idx + 1}`}</span>
                  <button
                    onClick={() => handleCopyStopHex(stop.color, stop.name || `Stop 0${idx + 1}`)}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}
                  >
                    {stop.color}
                  </button>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                  POSITION: {stop.position}%
                </div>
                {slug && (
                  <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                    <button
                      onClick={() => onNavigate({ path: 'color-detail', slug })}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.72rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <span>View Color Specimen</span>
                      <ExternalLink size={10} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CSS Code Specimen */}
      <section className="contrast-assessment-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Production CSS Snippet
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Standard modern cross-browser linear/radial declaration.
            </p>
          </div>
          <button className="btn-primary" onClick={handleCopyCss} style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
            <Copy size={13} />
            <span>Copy CSS</span>
          </button>
        </div>

        <div style={{ position: 'relative' }}>
          <pre
            style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              overflowX: 'auto',
            }}
          >
            <code>{`background: ${computedCss};`}</code>
          </pre>
        </div>
      </section>

      {/* Connected Network: Harmonies & Palettes */}
      {relatedPalettes.length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Palette Systems with Matching Vibrancy
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
              Color Harmonies in this Aesthetic
            </h2>
          </div>
          <div className="specimen-grid-combos">
            {relatedCombos.map((cb) => (
              <ComboCard key={cb.id} combo={cb} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* Related Gradients */}
      {relatedGradients.length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Related {baseGradient.category.toUpperCase()} Gradients
            </h2>
          </div>
          <div className="specimen-grid-gradients">
            {relatedGradients.map((g) => (
              <GradientCard key={g.id} gradient={g} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
