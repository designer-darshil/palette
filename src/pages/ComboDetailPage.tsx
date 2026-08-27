import React from 'react';
import { ArrowLeft, Copy, Bookmark, Share2, ShieldCheck, ExternalLink } from 'lucide-react';
import { RouteType } from '../types';
import { CURATED_COMBOS } from '../data/combos';
import { CURATED_PALETTES } from '../data/palettes';
import { CURATED_COLORS } from '../data/colors';
import { copyToClipboard } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { ComboCard } from '../components/ComboCard';
import { PaletteCard } from '../components/PaletteCard';

import { NotFoundPage } from './NotFoundPage';

interface ComboDetailPageProps {
  slug: string;
  onNavigate: (route: RouteType) => void;
}

export const ComboDetailPage: React.FC<ComboDetailPageProps> = ({ slug, onNavigate }) => {
  const { showToast } = useToast();
  const { isSaved, saveItem } = useSaved();

  const combo = CURATED_COMBOS.find((c) => c.slug === slug);
  if (!combo) {
    return <NotFoundPage requestedUrl={`/combos/${slug}`} onNavigate={onNavigate} />;
  }
  const saved = isSaved(combo.id);

  const handleCopySingleHex = async (hex: string, name: string) => {
    const success = await copyToClipboard(hex);
    if (success) {
      showToast(`Copied ${hex}`, name, hex);
    }
  };

  const handleShare = async () => {
    const success = await copyToClipboard(window.location.href);
    if (success) {
      showToast('Harmony link copied to clipboard', combo.title);
    }
  };

  const handleCopyAll = async () => {
    const all = combo.colors.map((c) => `${c.hex} /* ${c.name} - ${c.role} */`).join('\n');
    const success = await copyToClipboard(all);
    if (success) {
      showToast(`Copied harmony tokens`, combo.title);
    }
  };

  const handleToggleSave = () => {
    saveItem({
      id: combo.id,
      type: 'combo',
      title: combo.title,
      slug: combo.slug,
      preview: combo.colors.map((c) => c.hex).join(','),
      metadata: `${combo.harmonyType} • ${combo.contrastScore}`,
    });
    showToast(
      saved ? 'Removed harmony from saved' : 'Saved harmony to collection',
      combo.title
    );
  };

  const findMatchingColorSlug = (hex: string) => {
    const match = CURATED_COLORS.find((c) => c.hex.toLowerCase() === hex.toLowerCase());
    return match ? match.slug : null;
  };

  const relatedCombos = CURATED_COMBOS.filter((c) => c.id !== combo.id).slice(0, 2);
  const relatedPalettes = CURATED_PALETTES.filter((p) =>
    p.colors.some((pc) => combo.colors.some((cc) => cc.hex.toLowerCase() === pc.hex.toLowerCase())) ||
    p.tags.some((t) => combo.tags.includes(t))
  ).slice(0, 2);

  return (
    <div className="detail-container">
      {/* Navigation Breadcrumb & Share */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          className="detail-back-btn"
          onClick={() => onNavigate({ path: 'combos' })}
        >
          <ArrowLeft size={16} />
          <span>Back to Combos Library</span>
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn-secondary"
            onClick={handleShare}
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            title="Share Combo URL"
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

      {/* Hero Hierarchy Stage */}
      <section className="detail-hero-specimen">
        <div style={{ height: '280px', display: 'flex', width: '100%' }}>
          {combo.colors.map((c, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: c.hex,
                flex: c.percentage || 25,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '20px',
                cursor: 'pointer',
                transition: 'flex 200ms ease',
              }}
              onClick={() => handleCopySingleHex(c.hex, c.name)}
              title={`Click to copy ${c.name} (${c.hex})`}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                  background: 'rgba(0,0,0,0.45)',
                  padding: '2px 8px',
                  borderRadius: '2px',
                  width: 'fit-content',
                  textTransform: 'uppercase',
                }}
              >
                {c.role} ({c.percentage}%)
              </span>

              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                  }}
                >
                  {c.hex}
                </div>
                <div
                  style={{
                    fontSize: '0.82rem',
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

      {/* Combo Details & Meta */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <span className="combo-harmony-badge">{combo.harmonyType}</span>
            <span className="combo-contrast-badge">{combo.contrastScore}</span>
          </div>
          <h1 className="page-title">{combo.title}</h1>
          <p className="page-description">{combo.description}</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-primary" onClick={handleCopyAll}>
            <Copy size={15} />
            <span>Copy Harmony Tokens</span>
          </button>
        </div>
      </div>

      {/* Relational Balance Breakdown with Color Links */}
      <section className="contrast-assessment-box">
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
          Visual Balance &amp; Role Allocation
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {combo.colors.map((c, idx) => {
            const slug = findMatchingColorSlug(c.hex);
            return (
              <div
                key={idx}
                className="detail-spec-card"
              >
                <div
                  style={{
                    height: '60px',
                    backgroundColor: c.hex,
                    borderRadius: '3px',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '8px',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleCopySingleHex(c.hex, c.name)}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c.name}</span>
                  <button
                    onClick={() => handleCopySingleHex(c.hex, c.name)}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}
                  >
                    {c.hex}
                  </button>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-gold)' }}>
                  {c.role} ({c.percentage}%)
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

        <div style={{ padding: '16px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginTop: '8px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', display: 'block', marginBottom: '4px' }}>
            RECOMMENDED USE CONTEXT:
          </span>
          <span style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
            {combo.usageContext}
          </span>
        </div>
      </section>

      {/* Related Harmonies */}
      {relatedCombos.length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Related Harmonic Pairs
            </h2>
          </div>
          <div className="specimen-grid-combos">
            {relatedCombos.map((cb) => (
              <ComboCard key={cb.id} combo={cb} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* Related Palettes */}
      {relatedPalettes.length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Palette Systems Sharing this Gamut
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
