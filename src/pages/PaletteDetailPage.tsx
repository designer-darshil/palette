import React, { useState, useMemo } from 'react';
import { ArrowLeft, Copy, Bookmark, Share2, Code, ArrowRight, Layers, ExternalLink, ShieldCheck, Sparkles, Wand2 } from 'lucide-react';
import { RouteType, PaletteItem } from '../types';
import { useLibraryData } from '../context/LibraryDataContext';
import { copyToClipboard } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { PaletteCard } from '../components/PaletteCard';
import { ComboCard } from '../components/ComboCard';
import { GradientCard } from '../components/GradientCard';
import { decodePaletteFromSlugOrId } from '../utils/canonicalResourceUtils';
import { findClosestColorName } from '../utils/paletteGenerator';
import { NotFoundPage } from './NotFoundPage';
import { SEOHead } from '../components/seo/SEOHead';
import { generatePaletteSchema } from '../utils/schemaGenerator';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Link } from '../components/common/Link';
import { Analytics } from '../utils/analytics';

interface PaletteDetailPageProps {
  slug: string;
  onNavigate: (route: RouteType) => void;
}

export const PaletteDetailPage: React.FC<PaletteDetailPageProps> = ({ slug, onNavigate }) => {
  const { showToast } = useToast();
  const { isSaved, saveItem, savedItems } = useSaved();
  const { palettes, colors: libraryColors, combos: libraryCombos, gradients: libraryGradients } = useLibraryData();
  const [exportMode, setExportMode] = useState<'hex' | 'css' | 'tailwind' | 'json'>('css');

  // Resolve palette comprehensively
  const palette: PaletteItem | null = useMemo(() => {
    if (!slug) return null;
    const cleanSlug = slug.toLowerCase();

    // 1. Check Library Data (Curated + Custom + Admin)
    const matchLib = palettes.find(
      (p) => p.slug.toLowerCase() === cleanSlug || p.id.toLowerCase() === cleanSlug
    );
    if (matchLib) return matchLib;

    // 2. Check Saved Items
    const matchSaved = savedItems.find(
      (s) => s.type === 'palette' && (s.slug.toLowerCase() === cleanSlug || s.id.toLowerCase() === cleanSlug)
    );
    if (matchSaved && matchSaved.preview) {
      const hexList = matchSaved.preview.split(',').filter((h) => h.startsWith('#') || /^[0-9A-Fa-f]{6}$/.test(h));
      if (hexList.length > 0) {
        return {
          id: matchSaved.id,
          slug: matchSaved.slug,
          title: matchSaved.title,
          category: 'Curator Workspace',
          description: matchSaved.metadata || `Saved palette system with ${hexList.length} tonal swatches.`,
          colors: hexList.map((hex, i) => {
            const cleanHex = hex.startsWith('#') ? hex.toUpperCase() : `#${hex.toUpperCase()}`;
            return {
              name: findClosestColorName(cleanHex),
              hex: cleanHex,
              role: i === 0 ? 'Background Anchor' : i === 1 ? 'Primary Dominant' : i === 2 ? 'Accent Focus' : 'Surface / Highlight',
            };
          }),
          tags: ['saved', 'workspace', 'custom'],
        };
      }
    }

    // 3. Check dynamic decoder from slug
    const decoded = decodePaletteFromSlugOrId(slug);
    if (decoded) return decoded;

    return null;
  }, [slug, palettes, savedItems]);

  if (!palette) {
    return <NotFoundPage requestedUrl={`/palettes/${slug}`} onNavigate={onNavigate} />;
  }
  const saved = isSaved(palette.id);

  const paletteSchema = useMemo(() => {
    return generatePaletteSchema(palette);
  }, [palette]);

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
    if (!saved) {
      Analytics.trackSpecimenSave('palette', palette.id, palette.title);
    }
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
      Analytics.trackPaletteCopy(
        palette.title,
        palette.colors.map((c) => c.hex)
      );
      showToast(`Copied ${exportMode.toUpperCase()} tokens`, palette.title);
    }
  };

  // Find color item in library if exists
  const findMatchingColorSlug = (hex: string) => {
    const match = libraryColors.find((c) => c.hex.toLowerCase() === hex.toLowerCase());
    return match ? match.slug : null;
  };

  // Cross resource discovery
  const relatedPalettes = palettes.filter(
    (p) => p.id !== palette.id && (p.category === palette.category || (p.tags && palette.tags && p.tags.some((t) => palette.tags.includes(t))))
  ).slice(0, 2);

  const relatedCombos = libraryCombos.filter(
    (cb) => (cb.tags && palette.tags && cb.tags.some((t) => palette.tags.includes(t))) || cb.colors.some((c) => palette.colors.some((pc) => pc.hex.toLowerCase() === c.hex.toLowerCase()))
  ).slice(0, 2);

  const relatedGradients = libraryGradients.filter(
    (g) => (g.tags && palette.tags && g.tags.some((t) => palette.tags.includes(t))) || g.category === palette.category
  ).slice(0, 2);

  const paletteHexParam = palette.colors.map((c) => c.hex.replace('#', '')).join('-');

  return (
    <div className="detail-container w-full max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8">
      <SEOHead
        title={`${palette.title} — ${palette.category.toUpperCase()} Color Palette System`}
        description={`${palette.description} Formulated with ${palette.colors.length} chromatic balance points: ${palette.colors.map((c) => `${c.name} (${c.hex})`).join(', ')}.`}
        canonicalPath={`/palettes/${palette.slug}`}
        jsonLd={paletteSchema}
        keywords={[palette.title, palette.category, ...palette.tags, ...palette.colors.map((c) => c.name)]}
      />

      <Breadcrumbs
        items={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Palettes', to: { path: 'palettes' } },
          { label: palette.category.toUpperCase(), to: `/palettes?category=${palette.category}` },
          { label: palette.title, isCurrent: true },
        ]}
        onNavigate={onNavigate}
      />

      {/* Navigation Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to={{ path: 'palettes' }}
          onNavigate={onNavigate}
          className="detail-back-btn w-fit inline-flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          <span>Back to Palettes Catalog</span>
        </Link>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Link
            to={{ path: 'brand-kit', paletteSlug: palette.slug }}
            onNavigate={onNavigate}
            className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
            title="Open Palette in Brand Kit Studio"
          >
            <Layers size={13} className="text-pink-400" />
            <span>Brand Kit Studio</span>
          </Link>
          <Link
            to={{ path: 'palette-generator', colors: paletteHexParam }}
            onNavigate={onNavigate}
            className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
            title="Customize in Generator"
          >
            <Sparkles size={13} className="text-amber-400" />
            <span>Customize</span>
          </Link>
          <button
            className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
            onClick={handleShare}
            title="Share Palette URL"
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

      {/* Palette Hero Swatch Banner */}
      <section className="detail-hero-specimen rounded-md overflow-hidden border border-[var(--border-subtle)] shadow-xl">
        <div className="h-44 sm:h-60 flex w-full">
          {palette.colors.map((c, idx) => (
            <div
              key={idx}
              style={{ backgroundColor: c.hex }}
              className="flex-1 flex flex-col justify-between p-2.5 sm:p-4 cursor-pointer transition-all duration-200 min-w-0"
              onClick={() => handleCopySingleHex(c.hex, c.name)}
              title={`Click to copy ${c.name} (${c.hex})`}
            >
              <span className="font-mono text-[9px] sm:text-[11px] font-semibold text-white bg-black/45 px-1.5 py-0.5 rounded-xs w-fit shadow-sm">
                0{idx + 1}
              </span>

              <div className="min-w-0 overflow-hidden">
                <div className="font-mono text-[11px] sm:text-sm font-bold text-white drop-shadow-md truncate">
                  {c.hex}
                </div>
                <div className="text-[10px] sm:text-xs text-white drop-shadow-md opacity-95 truncate hidden xs:block">
                  {c.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Palette Header & Meta */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <span className="page-category-label text-xs font-mono text-[var(--accent-gold)] uppercase tracking-wider font-semibold">
            {palette.category.toUpperCase()} SYSTEM • {palette.colors.length} TONAL SPECIMENS
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mt-1 text-[var(--text-primary)]">
            {palette.title}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 max-w-2xl leading-relaxed">
            {palette.description}
          </p>
        </div>

        <div className="flex gap-2.5 flex-shrink-0">
          <button
            className="btn-primary w-full sm:w-auto text-xs px-4 py-2.5 inline-flex items-center justify-center gap-2 whitespace-nowrap"
            onClick={handleCopyExportCode}
          >
            <Copy size={14} />
            <span>Copy Palette Tokens</span>
          </button>
        </div>
      </div>

      {/* Swatch Breakdown Cards with Direct Navigation to Color Specimen */}
      <section className="flex flex-col gap-3.5">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-primary)]">
            Swatches &amp; Architectural Roles
          </h2>
          <span className="font-mono text-[10px] sm:text-xs text-[var(--text-tertiary)] uppercase">
            CLICK COLOR TO EXPLORE OR COPY
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {palette.colors.map((c, idx) => {
            const slug = findMatchingColorSlug(c.hex);
            return (
              <div
                key={idx}
                className="detail-spec-card p-3.5 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] rounded-sm transition-all"
              >
                <div
                  className="h-20 rounded-xs border border-[var(--border-subtle)] mb-2.5 cursor-pointer shadow-inner"
                  style={{ backgroundColor: c.hex }}
                  onClick={() => handleCopySingleHex(c.hex, c.name)}
                  title="Click to copy HEX"
                />
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-bold text-xs sm:text-sm text-[var(--text-primary)] truncate">
                    {c.name}
                  </span>
                  <button
                    onClick={() => handleCopySingleHex(c.hex, c.name)}
                    className="font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold flex-shrink-0"
                  >
                    {c.hex}
                  </button>
                </div>
                {c.role && (
                  <div className="font-mono text-[10px] text-[var(--text-tertiary)] uppercase mt-0.5 truncate">
                    ROLE: {c.role}
                  </div>
                )}
                {slug && (
                  <div className="mt-2 pt-2 border-t border-[var(--border-subtle)]">
                    <Link
                      to={{ path: 'color-detail', slug }}
                      onNavigate={onNavigate}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--accent-gold)] hover:underline"
                    >
                      <span>View Color Specimen</span>
                      <ExternalLink size={10} />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Live Specimen UI Proof */}
      <section className="contrast-assessment-box p-4 sm:p-6 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-primary)]">
              Live Specimen UI Proof
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
              Demonstrating surface hierarchy, typographic contrast, and deliberate accent placement.
            </p>
          </div>
          <span className="font-mono text-[10px] sm:text-xs text-[var(--accent-gold)] uppercase tracking-wider font-semibold self-start sm:self-auto">
            SYSTEM APPLICATION
          </span>
        </div>

        {/* Mock UI Card using the palette's actual colors */}
        <div
          className="rounded-md p-5 sm:p-8 border flex flex-col gap-4 sm:gap-5 shadow-lg"
          style={{
            backgroundColor: palette.colors[0]?.hex || '#111215',
            color: '#FFFFFF',
            borderColor: 'var(--border-strong)',
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-xs uppercase tracking-wider shadow-sm"
              style={{
                backgroundColor: palette.colors[1]?.hex || '#E63946',
                color: '#FFFFFF',
              }}
            >
              ACTIVE GAMUT
            </span>
            <span className="font-mono text-[11px] font-bold opacity-80 truncate">
              {palette.title.toUpperCase()}
            </span>
          </div>

          <div>
            <h3
              className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight mb-2"
              style={{ color: palette.colors[3]?.hex || '#FFFFFF' }}
            >
              Architectural Clarity &amp; Chromatic Balance
            </h3>
            <p
              className="text-xs sm:text-sm leading-relaxed max-w-xl"
              style={{ color: palette.colors[2]?.hex || '#8D99AE' }}
            >
              Every tone serves an ergonomic purpose. Surfaces support scanning; accents command focus without friction.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mt-1">
            <button
              className="px-5 py-2.5 rounded-xs font-bold text-xs uppercase tracking-wider shadow-md w-full sm:w-auto text-center whitespace-nowrap"
              style={{
                backgroundColor: palette.colors[1]?.hex || '#E63946',
                color: '#FFFFFF',
              }}
            >
              Primary Action
            </button>
            <button
              className="px-5 py-2.5 rounded-xs font-semibold text-xs border w-full sm:w-auto text-center whitespace-nowrap"
              style={{
                backgroundColor: 'transparent',
                color: palette.colors[3]?.hex || '#FFFFFF',
                borderColor: palette.colors[2]?.hex || 'rgba(255,255,255,0.2)',
              }}
            >
              Secondary Outline
            </button>
          </div>
        </div>
      </section>

      {/* Code Export Tokens */}
      <section className="contrast-assessment-box p-4 sm:p-6 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-primary)]">
              Export Tokens for Design &amp; Code
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
              Formatted for instant drop-in into CSS, Tailwind, or design tokens.
            </p>
          </div>

          <div className="filter-pills flex flex-wrap gap-1.5 self-start sm:self-auto">
            <button
              className={`filter-pill text-xs px-2.5 py-1 ${exportMode === 'css' ? 'active' : ''}`}
              onClick={() => setExportMode('css')}
            >
              CSS Variables
            </button>
            <button
              className={`filter-pill text-xs px-2.5 py-1 ${exportMode === 'hex' ? 'active' : ''}`}
              onClick={() => setExportMode('hex')}
            >
              HEX List
            </button>
            <button
              className={`filter-pill text-xs px-2.5 py-1 ${exportMode === 'tailwind' ? 'active' : ''}`}
              onClick={() => setExportMode('tailwind')}
            >
              Tailwind
            </button>
            <button
              className={`filter-pill text-xs px-2.5 py-1 ${exportMode === 'json' ? 'active' : ''}`}
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
