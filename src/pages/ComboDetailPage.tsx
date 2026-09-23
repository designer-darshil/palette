import React, { useMemo } from 'react';
import { ArrowLeft, Copy, Bookmark, Share2, ShieldCheck, ExternalLink, Check, Sparkles } from 'lucide-react';
import { RouteType, ComboItem } from '../types';
import { useLibraryData } from '../context/LibraryDataContext';
import { copyToClipboard, getComboKeyColors } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { ComboCard } from '../components/ComboCard';
import { PaletteCard } from '../components/PaletteCard';
import { decodeComboFromSlugOrId } from '../utils/canonicalResourceUtils';
import { findClosestColorName } from '../utils/paletteGenerator';
import { NotFoundPage } from './NotFoundPage';
import { SEOHead } from '../components/seo/SEOHead';
import { generateComboSchema } from '../utils/schemaGenerator';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Link } from '../components/common/Link';
import { PageHeader } from '../components/common/PageHeader';
import { KromaButton } from '../components/common/KromaButton';
import { Analytics } from '../utils/analytics';

interface ComboDetailPageProps {
  slug: string;
  onNavigate: (route: RouteType) => void;
}

export const ComboDetailPage: React.FC<ComboDetailPageProps> = ({ slug, onNavigate }) => {
  const { showToast } = useToast();
  const { isSaved, saveItem, savedItems } = useSaved();
  const { combos, palettes, colors } = useLibraryData();

  const combo: ComboItem | null = useMemo(() => {
    if (!slug) return null;
    const cleanSlug = slug.toLowerCase();

    // 1. Check Library Data (Curated + Custom + Admin)
    const matchLib = combos.find(
      (c) => c.slug.toLowerCase() === cleanSlug || c.id.toLowerCase() === cleanSlug
    );
    if (matchLib) return matchLib;

    // 2. Check Saved Items
    const matchSaved = savedItems.find(
      (s) => s.type === 'combo' && (s.slug.toLowerCase() === cleanSlug || s.id.toLowerCase() === cleanSlug)
    );
    if (matchSaved && matchSaved.preview) {
      const hexList = matchSaved.preview.split(',').filter((h) => h.startsWith('#') || /^[0-9A-Fa-f]{6}$/.test(h));
      if (hexList.length >= 2) {
        return {
          id: matchSaved.id,
          slug: matchSaved.slug,
          title: matchSaved.title,
          harmonyType: 'Curator Workspace',
          description: matchSaved.metadata || `Saved harmony pairing ${matchSaved.title}.`,
          colors: hexList.map((hex, i) => {
            const cleanHex = hex.startsWith('#') ? hex.toUpperCase() : `#${hex.toUpperCase()}`;
            return {
              name: findClosestColorName(cleanHex),
              hex: cleanHex,
              role: i === 0 ? 'Foreground Dominant' : 'Background Canvas',
            };
          }),
          contrastScore: matchSaved.metadata?.match(/[0-9.]+:[0-9.]+/)?.[0] || 'Tested',
          usageContext: 'Typography & Interface Surface Pairing',
          tags: ['saved', 'combo', 'custom'],
        };
      }
    }

    // 3. Dynamic combo decoder
    const decoded = decodeComboFromSlugOrId(slug);
    if (decoded) return decoded;

    return null;
  }, [slug, combos, savedItems]);

  if (!combo) {
    return <NotFoundPage requestedUrl={`/combos/${slug}`} onNavigate={onNavigate} />;
  }
  const saved = isSaved(combo.id);

  const [focal1, focal2] = getComboKeyColors(combo.colors);

  const comboSchema = useMemo(() => {
    return generateComboSchema(combo);
  }, [combo]);

  const handleCopySingleHex = async (hex: string, name: string) => {
    const success = await copyToClipboard(hex);
    if (success) {
      Analytics.trackColorCopy(hex, 'HEX', name);
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
      Analytics.trackPaletteCopy(
        combo.title,
        combo.colors.map((c) => c.hex)
      );
      showToast(`Copied harmony tokens`, combo.title);
    }
  };

  const handleToggleSave = () => {
    saveItem({
      id: combo.id,
      type: 'combo',
      title: combo.title,
      slug: combo.slug,
      preview: `${focal1.hex},${focal2.hex}`,
      metadata: `${combo.harmonyType} • ${combo.contrastScore}`,
    });
    if (!saved) {
      Analytics.trackSpecimenSave('combo', combo.id, combo.title);
    }
    showToast(
      saved ? 'Removed harmony from saved' : 'Saved harmony to collection',
      combo.title
    );
  };

  const findMatchingColorSlug = (hex: string) => {
    const match = colors.find((c) => c.hex.toLowerCase() === hex.toLowerCase());
    return match ? match.slug : null;
  };

  // Find true related harmonies by matching harmonyType
  const relatedCombos = combos
    .filter((c) => c.harmonyType === combo.harmonyType && c.id !== combo.id)
    .slice(0, 2);

  // Find true related palettes sharing the exact color gamuts
  const relatedPalettes = palettes
    .filter((p) =>
      p.colors.some((pc) =>
        combo.colors.some((cc) => cc.hex.toLowerCase() === pc.hex.toLowerCase())
      )
    )
    .slice(0, 2);

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8">
      <SEOHead
        title={`${combo.title} — ${combo.harmonyType} Color Pairing`}
        description={`${combo.description} Chromatic pairing featuring ${combo.colors.map((c) => `${c.name} (${c.hex})`).join(' and ')} with ${combo.contrastScore} contrast ratio.`}
        canonicalPath={`/combos/${combo.slug}`}
        jsonLd={comboSchema}
        keywords={[combo.title, combo.harmonyType, ...combo.tags, ...combo.colors.map((c) => c.name)]}
      />

      <PageHeader
        breadcrumbs={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Combos', to: { path: 'combos' } },
          { label: combo.title, isCurrent: true },
        ]}
        onNavigate={onNavigate}
        sectionLabel={`${combo.harmonyType} · Contrast ratio ${combo.contrastScore}`}
        title={combo.title}
        description={combo.description}
        actions={
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <KromaButton
              variant="filled"
              size="sm"
              iconLeft={<Copy size={13} />}
              onClick={handleCopyAll}
            >
              Copy Tokens
            </KromaButton>
            <KromaButton
              variant="outline"
              size="sm"
              iconLeft={<ShieldCheck size={13} className="text-blue-400" />}
              onClick={() =>
                onNavigate({
                  path: 'contrast-checker',
                  fg: focal1.hex.replace('#', ''),
                  bg: focal2.hex.replace('#', ''),
                })
              }
            >
              Test Contrast
            </KromaButton>
            <KromaButton
              variant="outline"
              size="sm"
              iconLeft={<Share2 size={13} />}
              onClick={handleShare}
              title="Share Combo URL"
            >
              Share
            </KromaButton>
            <KromaButton
              variant="outline"
              size="sm"
              iconLeft={<Bookmark size={13} fill={saved ? '#E9C46A' : 'none'} color={saved ? '#E9C46A' : 'currentColor'} />}
              onClick={handleToggleSave}
            >
              {saved ? 'Saved' : 'Save'}
            </KromaButton>
          </div>
        }
      />

      {/* Hero Hierarchy Stage — High Impact 2-Color Specimen Showcase */}
      <section className="rounded-md overflow-hidden border border-[var(--border-subtle)] shadow-xl">
        <div className="min-h-[260px] flex flex-col sm:flex-row w-full">
          {/* Focal Color 1 */}
          <div
            className="flex-1 min-h-[150px] sm:min-h-[220px] flex flex-col justify-between p-5 sm:p-7 cursor-pointer"
            style={{ backgroundColor: focal1.hex }}
            onClick={() => handleCopySingleHex(focal1.hex, focal1.name)}
            title={`Click to copy ${focal1.name} (${focal1.hex})`}
          >
            <span className="font-mono text-xs font-bold text-white bg-black/45 px-2 py-0.5 rounded-xs w-fit uppercase tracking-wider shadow-sm">
              {focal1.role || 'Primary / Dominant'}
            </span>

            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                  letterSpacing: '0.02em',
                }}
              >
                {focal1.hex}
              </div>
              <div
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                  opacity: 0.95,
                }}
              >
                {focal1.name}
              </div>
            </div>
          </div>

          {/* Focal Color 2 */}
          <div
            style={{
              backgroundColor: focal2.hex,
              flex: '1 1 240px',
              minHeight: '160px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '24px',
              cursor: 'pointer',
            }}
            onClick={() => handleCopySingleHex(focal2.hex, focal2.name)}
            title={`Click to copy ${focal2.name} (${focal2.hex})`}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#FFFFFF',
                textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                background: 'rgba(0,0,0,0.45)',
                padding: '3px 8px',
                borderRadius: '3px',
                width: 'fit-content',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {focal2.role || 'Accent / Focus'}
            </span>

            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                  letterSpacing: '0.02em',
                }}
              >
                {focal2.hex}
              </div>
              <div
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                  opacity: 0.95,
                }}
              >
                {focal2.name}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Relational Balance Breakdown with Color Links */}
      <section className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-6 flex flex-col gap-5">
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
          Visual Balance &amp; Role Allocation
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {combo.colors.map((c, idx) => {
            const colorSlug = findMatchingColorSlug(c.hex);
            return (
              <div key={idx} className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-sm p-4 flex flex-col gap-1.5">
                <div
                  style={{
                    height: '56px',
                    backgroundColor: c.hex,
                    borderRadius: '3px',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '8px',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleCopySingleHex(c.hex, c.name)}
                  title={`Click to copy ${c.hex}`}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.name}
                  </span>
                  <KromaButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopySingleHex(c.hex, c.name)}
                    className="p-0 h-auto font-mono text-[0.78rem] text-[var(--text-secondary)] hover:text-white cursor-pointer whitespace-nowrap border-0"
                  >
                    {c.hex}
                  </KromaButton>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-gold)', marginTop: '2px' }}>
                  {c.role} {c.percentage ? `(${c.percentage}%)` : ''}
                </div>
                {colorSlug && (
                  <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                    <KromaButton
                      variant="ghost"
                      size="sm"
                      iconRight={<ExternalLink size={10} />}
                      onClick={() => onNavigate({ path: 'color-detail', slug: colorSlug })}
                      className="p-0 h-auto inline-flex items-center gap-1 text-[0.72rem] font-mono text-[var(--text-secondary)] hover:text-white cursor-pointer whitespace-nowrap border-0"
                    >
                      View Color Specimen
                    </KromaButton>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ padding: '16px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginTop: '12px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', display: 'block', marginBottom: '4px' }}>
            RECOMMENDED USE CONTEXT:
          </span>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
            {combo.usageContext}
          </span>
        </div>
      </section>

      {/* Related Harmonies */}
      {relatedCombos.length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Related {combo.harmonyType} Harmonies
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(380px,1fr))] gap-4 sm:gap-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-4 sm:gap-6">
            {relatedPalettes.map((p) => (
              <PaletteCard key={p.id} palette={p} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
