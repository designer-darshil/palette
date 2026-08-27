import React, { useState } from 'react';
import { ArrowLeft, Copy, Bookmark, Share2, Code, ArrowRight, Layers, ExternalLink } from 'lucide-react';
import { RouteType } from '../types';
import { CURATED_PALETTES } from '../data/palettes';
import { CURATED_COLORS } from '../data/colors';
import { CURATED_COMBOS } from '../data/combos';
import { CURATED_GRADIENTS } from '../data/gradients';
import { copyToClipboard } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { PaletteCard } from '../components/PaletteCard';
import { ComboCard } from '../components/ComboCard';
import { GradientCard } from '../components/GradientCard';

import { NotFoundPage } from './NotFoundPage';

interface PaletteDetailPageProps {
  slug: string;
  onNavigate: (route: RouteType) => void;
}

export const PaletteDetailPage: React.FC<PaletteDetailPageProps> = ({ slug, onNavigate }) => {
  const { showToast } = useToast();
  const { isSaved, saveItem } = useSaved();
  const [exportMode, setExportMode] = useState<'hex' | 'css' | 'tailwind' | 'json'>('css');

  const palette = CURATED_PALETTES.find((p) => p.slug === slug);
  if (!palette) {
    return <NotFoundPage requestedUrl={`/palettes/${slug}`} onNavigate={onNavigate} />;
  }
  const saved = isSaved(palette.id);

  const handleCopySingleHex = async (hex: string, name: string) => {
    const success = await copyToClipboard(hex);
    if (success) {
      showToast(`Copied ${hex}`, name, hex);
    }
  };

  const handleShare = async () => {
    const success = await copyToClipboard(window.location.href);
    if (success) {
      showToast('Palette link copied to clipboard', palette.title);
    }
  };

  const handleToggleSave = () => {
    saveItem({
      id: palette.id,
      type: 'palette',
      title: palette.title,
      slug: palette.slug,
      preview: palette.colors.map((c) => c.hex).join(','),
      metadata: `${palette.category} • ${palette.colors.length} swatches`,
    });
    showToast(
      saved ? 'Removed palette from saved' : 'Saved palette to collection',
      palette.title
    );
  };

  const getCleanHexList = () => {
    return palette.colors.map((c) => `${c.hex}  /* ${c.name} */`).join('\n');
  };

  const getCssVariables = () => {
    const lines = palette.colors.map(
      (c) => `  --color-${c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}: ${c.hex};`
    );
    return `:root {\n${lines.join('\n')}\n}`;
  };

  const getTailwindConfig = () => {
    const obj: Record<string, string> = {};
    palette.colors.forEach((c) => {
      obj[c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')] = c.hex;
    });
    return JSON.stringify({ colors: obj }, null, 2);
  };

  const getJsonExport = () => {
    return JSON.stringify(
      {
        palette: palette.title,
        category: palette.category,
        swatches: palette.colors,
      },
      null,
      2
    );
  };

  const currentExportCode =
    exportMode === 'hex'
      ? getCleanHexList()
      : exportMode === 'css'
      ? getCssVariables()
      : exportMode === 'tailwind'
      ? getTailwindConfig()
      : getJsonExport();

  const handleCopyExportCode = async () => {
    const success = await copyToClipboard(currentExportCode);
    if (success) {
      showToast(`Copied ${exportMode.toUpperCase()} tokens`, palette.title);
    }
  };

  // Find color item in library if exists
  const findMatchingColorSlug = (hex: string) => {
    const match = CURATED_COLORS.find((c) => c.hex.toLowerCase() === hex.toLowerCase());
    return match ? match.slug : null;
  };

  // Cross resource discovery
  const relatedPalettes = CURATED_PALETTES.filter(
    (p) => p.id !== palette.id && (p.category === palette.category || p.tags.some((t) => palette.tags.includes(t)))
  ).slice(0, 2);

  const relatedCombos = CURATED_COMBOS.filter(
    (cb) => cb.tags.some((t) => palette.tags.includes(t)) || cb.colors.some((c) => palette.colors.some((pc) => pc.hex.toLowerCase() === c.hex.toLowerCase()))
  ).slice(0, 2);

  const relatedGradients = CURATED_GRADIENTS.filter(
    (g) => g.tags.some((t) => palette.tags.includes(t)) || g.category === palette.category
  ).slice(0, 2);

  return (
    <div className="detail-container">
      {/* Navigation Breadcrumb & Share */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          className="detail-back-btn"
          onClick={() => onNavigate({ path: 'palettes' })}
        >
          <ArrowLeft size={16} />
          <span>Back to Palettes Catalog</span>
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn-secondary"
            onClick={handleShare}
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            title="Share Palette URL"
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

      {/* Palette Hero Swatch Banner */}
      <section className="detail-hero-specimen">
        <div style={{ height: '240px', display: 'flex', width: '100%' }}>
          {palette.colors.map((c, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: c.hex,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '16px',
                cursor: 'pointer',
                transition: 'flex 200ms ease',
              }}
              onClick={() => handleCopySingleHex(c.hex, c.name)}
              title={`Click to copy ${c.name} (${c.hex})`}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                  background: 'rgba(0,0,0,0.45)',
                  padding: '2px 6px',
                  borderRadius: '2px',
                  width: 'fit-content',
                }}
              >
                0{idx + 1}
              </span>

              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                  }}
                >
                  {c.hex}
                </div>
                <div
                  style={{
                    fontSize: '0.78rem',
                    color: '#FFFFFF',
                    textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                    opacity: 0.9,
                  }}
                >
                  {c.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Palette Header & Meta */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="page-category-label">
            {palette.category.toUpperCase()} SYSTEM • {palette.colors.length} TONAL SPECIMENS
          </span>
          <h1 className="page-title">{palette.title}</h1>
          <p className="page-description">{palette.description}</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-primary" onClick={handleCopyExportCode}>
            <Copy size={15} />
            <span>Copy Palette Tokens</span>
          </button>
        </div>
      </div>

      {/* Swatch Breakdown Cards with Direct Navigation to Color Specimen */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
            Swatches &amp; Architectural Roles
          </h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
            CLICK COLOR TO EXPLORE OR COPY
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {palette.colors.map((c, idx) => {
            const slug = findMatchingColorSlug(c.hex);
            return (
              <div
                key={idx}
                className="detail-spec-card"
                style={{ position: 'relative' }}
              >
                <div
                  style={{
                    height: '80px',
                    backgroundColor: c.hex,
                    borderRadius: '3px',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '8px',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleCopySingleHex(c.hex, c.name)}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{c.name}</span>
                  <button
                    onClick={() => handleCopySingleHex(c.hex, c.name)}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}
                  >
                    {c.hex}
                  </button>
                </div>
                {c.role && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    ROLE: {c.role}
                  </div>
                )}
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

      {/* Live Specimen UI Proof */}
      <section className="contrast-assessment-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Live Specimen UI Proof
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Demonstrating surface hierarchy, typographic contrast, and deliberate accent placement.
            </p>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
            SYSTEM APPLICATION
          </span>
        </div>

        {/* Mock UI Card using the palette's actual colors */}
        <div
          style={{
            backgroundColor: palette.colors[0]?.hex || '#111215',
            color: '#FFFFFF',
            borderRadius: '6px',
            padding: '32px',
            border: '1px solid var(--border-strong)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                backgroundColor: palette.colors[1]?.hex || '#E63946',
                color: '#FFFFFF',
                padding: '3px 8px',
                borderRadius: '3px',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              ACTIVE GAMUT
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', opacity: 0.7 }}>
              {palette.title.toUpperCase()}
            </span>
          </div>

          <div>
            <h3
              style={{
                fontSize: '1.8rem',
                fontWeight: 800,
                color: palette.colors[3]?.hex || '#FFFFFF',
                letterSpacing: '-0.02em',
                marginBottom: '8px',
              }}
            >
              Architectural Clarity &amp; Chromatic Balance
            </h3>
            <p
              style={{
                fontSize: '0.95rem',
                color: palette.colors[2]?.hex || '#8D99AE',
                maxWidth: '560px',
                lineHeight: 1.6,
              }}
            >
              Every tone serves an ergonomic purpose. Surfaces support scanning; accents command focus without friction.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              style={{
                backgroundColor: palette.colors[1]?.hex || '#E63946',
                color: '#FFFFFF',
                padding: '10px 18px',
                borderRadius: '3px',
                fontWeight: 700,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
              }}
            >
              Primary Action
            </button>
            <button
              style={{
                backgroundColor: 'transparent',
                color: palette.colors[3]?.hex || '#FFFFFF',
                border: `1px solid ${palette.colors[2]?.hex || 'rgba(255,255,255,0.2)'}`,
                padding: '10px 18px',
                borderRadius: '3px',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              Secondary Outline
            </button>
          </div>
        </div>
      </section>

      {/* Code Export Tokens */}
      <section className="contrast-assessment-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Export Tokens for Design &amp; Code
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Formatted for instant drop-in into CSS, Tailwind, or design tokens.
            </p>
          </div>

          <div className="filter-pills">
            <button
              className={`filter-pill ${exportMode === 'css' ? 'active' : ''}`}
              onClick={() => setExportMode('css')}
            >
              CSS Variables
            </button>
            <button
              className={`filter-pill ${exportMode === 'hex' ? 'active' : ''}`}
              onClick={() => setExportMode('hex')}
            >
              HEX List
            </button>
            <button
              className={`filter-pill ${exportMode === 'tailwind' ? 'active' : ''}`}
              onClick={() => setExportMode('tailwind')}
            >
              Tailwind
            </button>
            <button
              className={`filter-pill ${exportMode === 'json' ? 'active' : ''}`}
              onClick={() => setExportMode('json')}
            >
              JSON
            </button>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <pre
            style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              color: 'var(--text-primary)',
              overflowX: 'auto',
            }}
          >
            <code>{currentExportCode}</code>
          </pre>

          <button
            className="btn-secondary"
            onClick={handleCopyExportCode}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              padding: '6px 10px',
              fontSize: '0.75rem',
            }}
          >
            <Copy size={12} />
            <span>Copy</span>
          </button>
        </div>
      </section>

      {/* Connected Network: Harmonies & Gradients */}
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

      {relatedGradients.length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Continuous Gradients in this Aesthetic
            </h2>
          </div>
          <div className="specimen-grid-gradients">
            {relatedGradients.map((g) => (
              <GradientCard key={g.id} gradient={g} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* Related Palettes */}
      {relatedPalettes.length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              More Palette Systems in {palette.category.toUpperCase()}
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
