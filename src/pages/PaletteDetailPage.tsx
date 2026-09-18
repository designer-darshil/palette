import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Copy,
  Bookmark,
  Heart,
  Share2,
  Code,
  ArrowRight,
  Layers,
  ExternalLink,
  Sparkles,
  Wand2,
  Sliders,
  FolderPlus,
} from 'lucide-react';
import { RouteType, PaletteItem } from '../types';
import { useLibraryData } from '../context/LibraryDataContext';
import { copyToClipboard, getColorAccessibility, getTextColorForBackground } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { PaletteCard } from '../components/PaletteCard';
import { ComboCard } from '../components/ComboCard';
import { GradientCard } from '../components/GradientCard';
import { PalettePreviewModes } from '../components/PalettePreviewModes';
import { AccessibilityMatrix } from '../components/AccessibilityMatrix';
import { AddToCollectionModal } from '../components/AddToCollectionModal';
import { TokenExportModal } from '../components/TokenExportModal';
import { findSimilarPalettes } from '../utils/similarityEngine';
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
  const { isSaved, saveItem, savedItems, isLiked, toggleLike } = useSaved();
  const { palettes, colors: libraryColors, combos: libraryCombos, gradients: libraryGradients } = useLibraryData();
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
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
  const liked = isLiked(palette.id);

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

  const handleToggleLike = () => {
    const nowLiked = toggleLike(palette.id);
    showToast(nowLiked ? 'Added to Liked' : 'Removed from Liked', palette.title);
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

  // Measurable Similarity Engine lookup
  const similarPalettes = useMemo(() => {
    return findSimilarPalettes(palette, palettes, 4);
  }, [palette, palettes]);

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
            to={{ path: 'palette-remix', slug: palette.slug }}
            onNavigate={onNavigate}
            className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5"
            title="Remix this palette"
          >
            <Wand2 size={13} />
            <span>Remix</span>
          </Link>
          <button
            className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
            onClick={() => setCollectionModalOpen(true)}
            title="Add to Collection"
          >
            <FolderPlus size={13} />
            <span>Add to Collection</span>
          </button>
          <button
            className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
            onClick={() => setTokenModalOpen(true)}
            title="Export tokens in CSS / SCSS / Tailwind / DTCG JSON"
          >
            <Code size={13} />
            <span>Export Tokens</span>
          </button>
          <button
            className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
            onClick={handleToggleLike}
            title={liked ? 'Unlike' : 'Like'}
          >
            <Heart size={13} fill={liked ? '#F87171' : 'none'} color={liked ? '#F87171' : 'currentColor'} />
            <span>{liked ? 'Liked' : 'Like'}</span>
          </button>
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
          {palette.colors.map((c, idx) => {
            const textColor = getTextColorForBackground(c.hex);
            return (
              <div
                key={idx}
                style={{ backgroundColor: c.hex }}
                className="flex-1 flex flex-col justify-between p-2.5 sm:p-4 cursor-pointer transition-all duration-200 min-w-0"
                onClick={() => handleCopySingleHex(c.hex, c.name)}
                title={`Click to copy ${c.name} (${c.hex})`}
              >
                <span
                  className="font-mono text-[9px] sm:text-[11px] font-semibold px-1.5 py-0.5 rounded-xs w-fit shadow-sm"
                  style={{
                    backgroundColor: textColor === '#000000' ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.45)',
                    color: textColor === '#000000' ? '#000000' : '#FFFFFF',
                  }}
                >
                  0{idx + 1}
                </span>

                <div className="min-w-0 overflow-hidden">
                  <div
                    className="font-mono text-[11px] sm:text-sm font-bold truncate"
                    style={{ color: textColor }}
                  >
                    {c.hex}
                  </div>
                  <div
                    className="text-[10px] sm:text-xs opacity-90 truncate hidden xs:block font-medium"
                    style={{ color: textColor }}
                  >
                    {c.name}
                  </div>
                </div>
              </div>
            );
          })}
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

          {palette.remixedFrom && (
            <div className="mt-2 text-xs font-mono text-[var(--text-secondary)]">
              Remixed from <strong>{palette.remixedFrom.title}</strong> by {palette.remixedFrom.creatorName || 'Creator'}
            </div>
          )}
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

      {/* Swatch Breakdown Cards with Direct Navigation to Color Specimen & Relationships */}
      <section className="flex flex-col gap-3.5">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-primary)]">
            Swatches &amp; Architectural Roles
          </h2>
          <span className="font-mono text-[10px] sm:text-xs text-[var(--text-tertiary)] uppercase">
            CLICK COLOR TO EXPLORE RELATIONSHIPS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {palette.colors.map((c, idx) => {
            const slug = findMatchingColorSlug(c.hex);
            const access = getColorAccessibility(c.hex);
            return (
              <div
                key={idx}
                className="detail-spec-card p-3.5 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] rounded-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div
                    className="h-20 rounded-xs border border-[var(--border-subtle)] mb-2.5 cursor-pointer shadow-inner relative flex items-end p-1.5"
                    style={{ backgroundColor: c.hex }}
                    onClick={() => handleCopySingleHex(c.hex, c.name)}
                    title="Click to copy HEX"
                  >
                    <span
                      className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-xs shadow-xs"
                      style={{
                        backgroundColor: access.bestTextColor === '#000000' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.65)',
                        color: access.bestTextColor === '#000000' ? '#000000' : '#FFFFFF',
                      }}
                    >
                      {access.passAAA ? 'AAA' : 'AA'} {access.bestContrast}:1
                    </span>
                  </div>
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
                </div>

                <div className="mt-2.5 pt-2 border-t border-[var(--border-subtle)] flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
                    <span>{access.bestTextColor === '#000000' ? 'Black text' : 'White text'}</span>
                    <span className="font-bold">{access.bestContrast}:1</span>
                  </div>
                  <Link
                    to={{ path: 'color-relationships', slug: slug || c.hex.replace('#', '') }}
                    onNavigate={onNavigate}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--accent-gold)] hover:underline"
                  >
                    <span>Theory &amp; Relationships</span>
                    <ExternalLink size={10} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Multi-Preview Proofs (SaaS, Editorial, Mobile, Branding) */}
      <PalettePreviewModes palette={palette} />

      {/* WCAG 2.1 Accessibility Matrix */}
      <AccessibilityMatrix colors={palette.colors} />

      {/* Code Export Tokens */}
      <section className="contrast-assessment-box p-4 sm:p-6 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-primary)]">
              Export Tokens for Design &amp; Code
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
              Formatted for instant drop-in into CSS, Tailwind, SCSS, or DTCG design tokens.
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

      {/* Similar Palettes via Measurable Similarity Engine */}
      {similarPalettes.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="page-category-label">Multidimensional Match</span>
              <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                Similar Palette Systems
              </h2>
            </div>
          </div>
          <div className="specimen-grid-palettes">
            {similarPalettes.map(({ palette: sp, score, metrics }) => (
              <div key={sp.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)] px-1">
                  <span>Match Similarity: <strong>{Math.round(score * 100)}%</strong></span>
                  <span>Hue: {Math.round(metrics.hueMatch * 100)}% • Lum: {Math.round(metrics.luminanceMatch * 100)}%</span>
                </div>
                <PaletteCard palette={sp} onNavigate={onNavigate} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Connected Network: Harmonies & Gradients */}
      {relatedCombos.length > 0 && (
        <section>
          <div className="flex justify-between items-baseline mb-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
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

      {/* Modals */}
      <AddToCollectionModal
        isOpen={collectionModalOpen}
        onClose={() => setCollectionModalOpen(false)}
        item={{
          type: 'palette',
          refId: palette.id,
          slug: palette.slug,
          title: palette.title,
          preview: palette.colors.map((c) => c.hex).join(','),
          metadata: `${palette.category} • ${palette.colors.length} swatches`,
        }}
      />

      <TokenExportModal
        isOpen={tokenModalOpen}
        onClose={() => setTokenModalOpen(false)}
        palette={palette}
      />
    </div>
  );
};
