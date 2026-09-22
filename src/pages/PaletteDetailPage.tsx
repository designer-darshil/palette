import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Copy,
  Bookmark,
  Heart,
  Share2,
  Code,
  ArrowUpRight,
  FolderPlus,
  RefreshCw,
  Check,
} from 'lucide-react';
import { RouteType, PaletteItem } from '../types';
import { useLibraryData } from '../context/LibraryDataContext';
import {
  copyToClipboard,
  hexToRgb,
  hexToHsl,
  getContrastRatio,
  getContrastRating,
} from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { AddToCollectionModal } from '../components/AddToCollectionModal';
import { TokenExportModal } from '../components/TokenExportModal';
import { findSimilarPalettes } from '../utils/similarityEngine';
import { decodePaletteFromSlugOrId } from '../utils/canonicalResourceUtils';
import { findClosestColorName } from '../utils/paletteGenerator';
import { NotFoundPage } from './NotFoundPage';
import { SEOHead } from '../components/seo/SEOHead';
import { generatePaletteSchema } from '../utils/schemaGenerator';
import { PaletteCard } from '../components/PaletteCard';

interface PaletteDetailPageProps {
  slug: string;
  onNavigate: (route: RouteType) => void;
}

export const PaletteDetailPage: React.FC<PaletteDetailPageProps> = ({ slug, onNavigate }) => {
  const { showToast } = useToast();
  const { isSaved, saveItem, savedItems } = useSaved();
  const { palettes } = useLibraryData();
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Resolve palette
  const palette: PaletteItem | null = useMemo(() => {
    if (!slug) return null;
    const cleanSlug = slug.toLowerCase();

    // 1. Check Library Data
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
          category: 'Studio Collection',
          description: matchSaved.metadata || `Saved palette system with ${hexList.length} tonal swatches.`,
          colors: hexList.map((hex, i) => {
            const cleanHex = hex.startsWith('#') ? hex.toUpperCase() : `#${hex.toUpperCase()}`;
            return {
              name: findClosestColorName(cleanHex),
              hex: cleanHex,
              role: i === 0 ? 'Dominant Anchor' : i === 1 ? 'Primary Secondary' : i === 2 ? 'Secondary' : 'Accent',
            };
          }),
          tags: ['saved', 'workspace', 'custom'],
        };
      }
    }

    // 3. Dynamic decoder
    const decoded = decodePaletteFromSlugOrId(slug);
    if (decoded) return decoded;

    return null;
  }, [slug, palettes, savedItems]);

  // Active color selected in composition (default to first color)
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);

  if (!palette) {
    return <NotFoundPage requestedUrl={`/palettes/${slug}`} onNavigate={onNavigate} />;
  }

  const saved = isSaved(palette.id);
  const currentColor = palette.colors[selectedColorIndex] || palette.colors[0];

  // Calculate proportional widths
  // Standard 5-color: 40%, 20%, 20%, 10%, 10%
  const getProportionalWeight = (idx: number, total: number) => {
    if (total === 5) return [40, 20, 20, 10, 10][idx] || 10;
    if (total === 4) return [40, 25, 20, 15][idx] || 15;
    if (total === 3) return [50, 30, 20][idx] || 20;
    if (total === 6) return [35, 20, 15, 12, 10, 8][idx] || 8;
    return idx === 0 ? 40 : Math.round(60 / (total - 1));
  };

  const currentColorWeight = getProportionalWeight(selectedColorIndex, palette.colors.length);

  // Inspector metrics
  const rgb = hexToRgb(currentColor.hex);
  const hsl = hexToHsl(currentColor.hex);
  const contrastOnWhite = getContrastRatio(currentColor.hex, '#FFFFFF');
  const contrastOnDark = getContrastRatio(currentColor.hex, '#171717');
  const contrastRatingWhite = getContrastRating(contrastOnWhite);

  const handleCopySingleHex = async (hex: string, name: string) => {
    const success = await copyToClipboard(hex);
    if (success) {
      setCopiedHex(hex);
      showToast(`Copied ${hex}`, name, hex);
      setTimeout(() => setCopiedHex((curr) => (curr === hex ? null : curr)), 1800);
    }
  };

  const handleCopyAllColors = async () => {
    const allHexes = palette.colors.map((c) => c.hex).join(', ');
    const success = await copyToClipboard(allHexes);
    if (success) {
      setCopiedAll(true);
      showToast(`Copied ${palette.colors.length} palette colors`, palette.title);
      setTimeout(() => setCopiedAll(false), 2000);
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

  const handleShare = async () => {
    const success = await copyToClipboard(window.location.href);
    if (success) {
      showToast('Palette link copied to clipboard', palette.title);
    }
  };

  // Related / similar palettes for "MORE COLOR STUDIES"
  const relatedStudies = useMemo(() => {
    return findSimilarPalettes(palette, palettes, 4).map((item) => item.palette);
  }, [palette, palettes]);

  const paletteSchema = useMemo(() => {
    return generatePaletteSchema(palette);
  }, [palette]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 pb-16 md:pb-24 box-border">
      <SEOHead
        title={`${palette.title} — Physical Color Study | KROMA`}
        description={`${palette.description} A calibrated proportional study of ${palette.colors.length} chromatic balance points.`}
        canonicalPath={`/palettes/${palette.slug}`}
        jsonLd={paletteSchema}
      />

      {/* Top: Back Arrow & Palette Title in Large Sans Type */}
      <div className="pt-8 pb-6">
        <button
          onClick={() => onNavigate({ path: 'palettes' })}
          className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold tracking-wider text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors uppercase mb-6"
        >
          <ArrowLeft size={14} />
          <span>ALL PALETTES</span>
        </button>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="font-sans text-[11px] font-semibold tracking-wider uppercase text-neutral-400">
            {palette.category?.toUpperCase() || 'EDITORIAL STUDY'}
          </span>
          {palette.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-xs"
            >
              #{tag}
            </span>
          ))}
        </div>

        <h1 className="font-sans text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-neutral-900 dark:text-white uppercase leading-[0.95] mb-4">
          {palette.title}
        </h1>

        <p className="font-sans text-base leading-relaxed text-text-secondary max-w-2xl m-0">
          {palette.description || 'A physical color study exploring spatial weight, luminance hierarchy, and chromatic harmony.'}
        </p>
      </div>

      {/* Composition: Proportional Color Composition */}
      {/* One color 40% (dominant), two colors 20%, two colors 10% (accents) */}
      <section className="mt-4 mb-8" aria-label="Physical Color Composition">
        <div className="font-mono text-[11px] tracking-wider uppercase text-neutral-400 mb-2 flex justify-between items-center">
          <span>PROPORTIONAL COLOR STUDY (40% DOMINANT / 20% SECONDARY / 10% ACCENT)</span>
          <span>CLICK ANY FIELD TO INSPECT</span>
        </div>

        <div className="w-full h-56 sm:h-80 md:h-96 rounded-sm overflow-hidden flex shadow-lg border border-black/10 dark:border-white/10">
          {palette.colors.map((color, idx) => {
            const weight = getProportionalWeight(idx, palette.colors.length);
            const isSelected = selectedColorIndex === idx;

            return (
              <div
                key={idx}
                style={{
                  backgroundColor: color.hex,
                  flex: weight,
                  outline: isSelected ? '4px solid #171717' : 'none',
                  outlineOffset: '-4px',
                }}
                className="relative cursor-pointer transition-all duration-200 flex flex-col justify-between p-3 sm:p-5 group hover:brightness-105"
                onClick={() => setSelectedColorIndex(idx)}
                role="button"
                tabIndex={0}
                aria-label={`${color.name} ${color.hex}, ${weight}% proportion`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedColorIndex(idx);
                  }
                }}
              >
                <div className="flex justify-between items-start">
                  <span className="font-mono text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-xs bg-black/40 text-white backdrop-blur-sm">
                    {weight}%
                  </span>
                  {isSelected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-white shadow-md ring-2 ring-black" />
                  )}
                </div>

                <div className="opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
                  <div className="font-sans text-xs sm:text-sm font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] truncate">
                    {color.name}
                  </div>
                  <div className="font-mono text-[10px] sm:text-xs text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {color.hex}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Inspector Readout */}
      <section className="p-6 sm:p-8 bg-white dark:bg-[#15171C] border border-neutral-200 dark:border-neutral-800 rounded-sm mb-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-sm shadow-inner border border-black/10 flex-shrink-0"
              style={{ backgroundColor: currentColor.hex }}
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold">
                  {selectedColorIndex === 0 ? 'DOMINANT (40%)' : selectedColorIndex < 3 ? 'SECONDARY (20%)' : 'ACCENT (10%)'}
                </span>
                <span className="font-mono text-[11px] text-neutral-400">
                  SWATCH 0{selectedColorIndex + 1} OF 0{palette.colors.length}
                </span>
              </div>
              <h2 className="font-sans text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
                {currentColor.name}
              </h2>
              <div className="font-mono text-sm font-semibold text-neutral-500">
                {currentColor.hex}
              </div>
            </div>
          </div>

          {/* Technical Readout Data: RGB, HSL, Contrast */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 py-4 border-y lg:border-y-0 lg:border-l border-neutral-200 dark:border-neutral-800 lg:pl-8">
            <div>
              <div className="font-mono text-[10px] text-neutral-400 tracking-wider uppercase mb-1">HEX</div>
              <div className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                {currentColor.hex}
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] text-neutral-400 tracking-wider uppercase mb-1">RGB</div>
              <div className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                {rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : '—'}
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] text-neutral-400 tracking-wider uppercase mb-1">HSL</div>
              <div className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                {hsl ? `${Math.round(hsl.h * 360)}°, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%` : '—'}
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] text-neutral-400 tracking-wider uppercase mb-1">CONTRAST (LIGHT)</div>
              <div className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                {contrastOnWhite}:1 ({contrastRatingWhite.label.split(' ')[0]})
              </div>
            </div>
          </div>

          {/* Copy Current HEX */}
          <button
            onClick={() => handleCopySingleHex(currentColor.hex, currentColor.name)}
            className="self-start lg:self-center font-sans text-xs font-bold tracking-wider uppercase px-4 py-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-sm hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
          >
            {copiedHex === currentColor.hex ? (
              <>
                <Check size={14} className="text-emerald-400" />
                <span>COPIED!</span>
              </>
            ) : (
              <>
                <span>COPY HEX</span>
                <ArrowUpRight size={13} />
              </>
            )}
          </button>
        </div>
      </section>

      {/* Primary Actions: SAVE PALETTE, COPY COLORS, GENERATE SIMILAR */}
      <section className="flex flex-wrap items-center justify-between gap-4 pb-12 border-b border-neutral-200 dark:border-neutral-800 mb-16">
        <div className="flex flex-wrap items-center gap-3">
          {/* SAVE PALETTE */}
          <button
            onClick={handleToggleSave}
            className={`font-sans text-xs font-bold tracking-wider uppercase px-5 py-3 rounded-sm border transition-colors flex items-center gap-2 ${
              saved
                ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white'
                : 'bg-transparent text-neutral-900 dark:text-white border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-white'
            }`}
          >
            <Bookmark size={14} fill={saved ? 'currentColor' : 'none'} />
            <span>{saved ? 'SAVED TO STUDIO' : 'SAVE PALETTE'}</span>
          </button>

          {/* COPY COLORS (All hexes) */}
          <button
            onClick={handleCopyAllColors}
            className="font-sans text-xs font-bold tracking-wider uppercase px-5 py-3 rounded-sm border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white hover:border-neutral-900 dark:hover:border-white transition-colors flex items-center gap-2"
          >
            {copiedAll ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            <span>{copiedAll ? 'ALL COPIED!' : 'COPY COLORS'}</span>
          </button>

          {/* GENERATE SIMILAR */}
          <button
            onClick={() => onNavigate({ path: 'palette-generator', colors: currentColor.hex.replace('#', '') })}
            className="font-sans text-xs font-bold tracking-wider uppercase px-5 py-3 rounded-sm border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white hover:border-neutral-900 dark:hover:border-white transition-colors flex items-center gap-2"
          >
            <RefreshCw size={14} />
            <span>GENERATE SIMILAR ↗</span>
          </button>
        </div>

        {/* Utility actions: Tokens, Collection, Share */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTokenModalOpen(true)}
            className="p-2.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-neutral-800 rounded-sm transition-colors text-xs font-mono uppercase"
            title="Export CSS / Tailwind tokens"
          >
            <Code size={15} />
          </button>
          <button
            onClick={() => setCollectionModalOpen(true)}
            className="p-2.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-neutral-800 rounded-sm transition-colors text-xs font-mono uppercase"
            title="Add to Collection"
          >
            <FolderPlus size={15} />
          </button>
          <button
            onClick={handleShare}
            className="p-2.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-neutral-800 rounded-sm transition-colors text-xs font-mono uppercase"
            title="Share Palette"
          >
            <Share2 size={15} />
          </button>
        </div>
      </section>

      {/* Below: More Color Studies: 3-4 related palettes as strips */}
      {relatedStudies.length > 0 && (
        <section className="mb-16">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <div className="font-mono text-[11px] font-medium tracking-[0.12em] uppercase text-text-secondary mb-1">RELATED PALETTES</div>
              <h2 className="font-sans text-2xl font-bold tracking-tight text-neutral-900 dark:text-white uppercase">
                MORE COLOR STUDIES
              </h2>
            </div>
            <button
              onClick={() => onNavigate({ path: 'palettes' })}
              className="text-xs font-sans font-semibold tracking-wider text-neutral-500 hover:text-neutral-900 dark:hover:text-white uppercase"
            >
              VIEW ALL ↗
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedStudies.map((rel) => (
              <PaletteCard key={rel.id} palette={rel} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* Modals for collection and token export */}
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

