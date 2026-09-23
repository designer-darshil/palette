import React, { useState, useEffect, useRef, useMemo } from 'react';
import { RouteType, ColorItem } from '../types';
import { useLibraryData } from '../context/LibraryDataContext';
import { useSaved } from '../context/SavedContext';
import { useToast } from '../context/ToastContext';
import { copyToClipboard } from '../utils/colorUtils';
import { Search, Loader2, ArrowUpRight, Bookmark, Check, X, Copy } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';
import { generateCollectionPageSchema } from '../utils/schemaGenerator';
import { KromaButton } from '../components/common/KromaButton';

interface ColorsPageProps {
  onNavigate: (route: RouteType) => void;
}

const BATCH_SIZE = 40;

const FAMILY_TILES = [
  { name: 'RED', hex: '#FF3B30', textDark: false, familyKey: 'red' },
  { name: 'ORANGE', hex: '#FF9500', textDark: true, familyKey: 'orange' },
  { name: 'YELLOW', hex: '#FFD60A', textDark: true, familyKey: 'yellow' },
  { name: 'GREEN', hex: '#34C759', textDark: true, familyKey: 'green' },
  { name: 'BLUE', hex: '#00AEEF', textDark: true, familyKey: 'blue' },
  { name: 'PURPLE', hex: '#7B2CBF', textDark: false, familyKey: 'purple' },
  { name: 'PINK', hex: '#FF2D55', textDark: false, familyKey: 'pink' },
  { name: 'EARTH', hex: '#A2845E', textDark: false, familyKey: 'earth' },
  { name: 'NEUTRAL', hex: '#8E8E93', textDark: false, familyKey: 'neutral' },
  { name: 'DEEP', hex: '#171717', textDark: false, familyKey: 'deep' },
  { name: 'LIGHT', hex: '#F0F0F2', textDark: true, familyKey: 'light' },
];

export const ColorsPage: React.FC<ColorsPageProps> = ({ onNavigate }) => {
  const { colors } = useLibraryData();
  const { showToast } = useToast();
  const { isSaved, saveItem } = useSaved();

  const [selectedFamily, setSelectedFamily] = useState<string>('all');
  const [selectedTone, setSelectedTone] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const observerRef = useRef<HTMLDivElement | null>(null);

  const toneFilters = ['all', 'light', 'medium', 'dark', 'muted', 'vibrant'];

  const filteredColors = useMemo(() => {
    return colors.filter((c) => {
      if (selectedFamily !== 'all') {
        const f = selectedFamily.toLowerCase();
        const matchFamily = c.family?.toLowerCase() === f;
        const matchHue = c.hueGroup?.toLowerCase() === f;
        const matchTag = (c.tags || []).some((t) => t.toLowerCase() === f);
        if (!matchFamily && !matchHue && !matchTag) return false;
      }
      if (selectedTone !== 'all' && c.tone !== selectedTone) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchHex = c.hex.toLowerCase().includes(q);
        const matchTag = (c.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchHex && !matchTag) return false;
      }
      return true;
    });
  }, [colors, selectedFamily, selectedTone, searchQuery]);

  // Reset pagination on filter or search change
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [selectedFamily, selectedTone, searchQuery]);

  // Infinite scroll
  useEffect(() => {
    const target = observerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && visibleCount < filteredColors.length && !isLoadingMore) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredColors.length));
            setIsLoadingMore(false);
          }, 80);
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [visibleCount, filteredColors.length, isLoadingMore]);

  const displayedColors = useMemo(() => {
    return filteredColors.slice(0, visibleCount);
  }, [filteredColors, visibleCount]);

  const handleCopy = async (hex: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await copyToClipboard(hex);
    if (ok) {
      setCopiedHex(hex);
      showToast(`Copied ${hex}`, name, hex);
      setTimeout(() => setCopiedHex((curr) => (curr === hex ? null : curr)), 1600);
    }
  };

  const handleToggleSave = (color: ColorItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const saved = isSaved(color.id);
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

  const collectionSchema = useMemo(() => {
    return generateCollectionPageSchema({
      name: 'Curated Color Specimens Exhibition',
      description: `Digital colour exhibition featuring ${colors.length} calibrated specimens with spectral, sRGB, HSL, and OKLCH color metrics.`,
      url: '/colors',
      items: colors.slice(0, 30).map((c) => ({
        name: `${c.name} (${c.hex})`,
        url: `/colors/${c.slug}`,
        description: c.description,
      })),
    });
  }, [colors]);

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 pb-20 box-border text-[#171717] dark:text-white">
      <SEOHead
        title="Colours Show — Digital Colour Exhibition | KROMA"
        description={`A curated exhibition of colour studies, combinations, specimens, and visual experiments across ${colors.length.toLocaleString()} calibrated pigments.`}
        canonicalPath="/colors"
        jsonLd={collectionSchema}
      />

      {/* ── 01: Compact Editorial Exhibition Opening ────────────────── */}
      <header className="mb-8 pb-6 border-b border-black/[0.08] dark:border-white/[0.08]">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="font-mono text-xs font-semibold tracking-wider uppercase text-[#707070] dark:text-[#909090] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-[1px] bg-[#FF3B30]" />
              <span>COLOUR SHOW</span>
            </div>
            <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight leading-[1.08] text-[#171717] dark:text-white m-0">
              COLOUR, IN ITS PUREST FORM.
            </h1>
            <p className="font-sans text-sm sm:text-base text-[#707070] dark:text-[#A0A0A0] max-w-xl m-0 mt-1 leading-[1.5]">
              A curated collection of colour studies, combinations, specimens, and visual experiments.
            </p>
          </div>

          {/* Gamut Counter & Quick Family Bar */}
          <div className="flex flex-col gap-2.5 lg:items-end">
            <span className="font-mono text-xs font-semibold tracking-wider uppercase text-[#707070] dark:text-[#909090]">
              {filteredColors.length} EXHIBITION SPECIMENS
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none" role="region" aria-label="Color Gamuts">
              {FAMILY_TILES.map((f) => {
                const isActive = selectedFamily === f.familyKey;
                return (
                  <KromaButton
                    key={f.name}
                    size="sm"
                    variant={isActive ? 'filled' : 'ghost'}
                    onClick={() => setSelectedFamily(isActive ? 'all' : f.familyKey)}
                    className="h-7 px-2.5 font-mono text-xs tracking-wider uppercase inline-flex items-center gap-1.5"
                    title={`Filter ${f.name} gamut`}
                    iconLeft={<span className="w-2 h-2 rounded-[1px] flex-shrink-0" style={{ backgroundColor: f.hex }} />}
                  >
                    <span>{f.name}</span>
                  </KromaButton>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* ── 02: Editorial Catalogue Controls ────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs font-semibold tracking-wider uppercase text-[#707070] dark:text-[#909090] mr-1">
            TONE:
          </span>
          {toneFilters.map((tone) => {
            const isActive = selectedTone === tone;
            return (
              <KromaButton
                key={tone}
                size="sm"
                variant={isActive ? 'filled' : 'ghost'}
                onClick={() => setSelectedTone(tone)}
                className="font-mono text-xs tracking-wider uppercase px-3 py-1.5"
              >
                {tone.toUpperCase()}
              </KromaButton>
            );
          })}

          {selectedFamily !== 'all' && (
            <KromaButton
              size="sm"
              variant="filled"
              onClick={() => setSelectedFamily('all')}
              className="font-mono text-xs tracking-wider uppercase px-3 py-1.5 ml-1"
              iconRight={<X size={11} />}
            >
              <span>GAMUT: {selectedFamily.toUpperCase()}</span>
            </KromaButton>
          )}
        </div>

        {/* Minimal Search Field */}
        <div className="relative min-w-[240px] sm:min-w-[280px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#707070]" />
          <input
            type="text"
            className="w-full bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-[2px] py-2 pl-9 pr-3 text-sm font-sans text-[#171717] dark:text-white placeholder-[#707070] focus:outline-none focus:border-black/30 dark:focus:border-white/30 transition-colors"
            placeholder="Search specimen or #HEX..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ── 03: The Exhibition Gallery — Asymmetric Editorial Rhythms ─ */}
      {filteredColors.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-black/[0.08] dark:border-white/[0.08] rounded-[2px]">
          <p className="font-mono text-xs font-semibold tracking-widest uppercase text-[#707070] mb-2">NO SPECIMENS IN THIS GAMUT</p>
          <p className="font-sans text-xs text-[#707070] mb-6">Reset your query or explore a different tone filter.</p>
          <KromaButton
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedFamily('all');
              setSelectedTone('all');
              setSearchQuery('');
            }}
            className="font-mono text-xs font-semibold tracking-wider uppercase px-4 py-2"
          >
            RESET EXHIBITION
          </KromaButton>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 auto-rows-auto">
            {displayedColors.map((color, index) => {
              const isCopied = copiedHex === color.hex;
              const saved = isSaved(color.id);
              const specimenNumber = String(index + 1).padStart(2, '0');

              // Asymmetric rhythmic layout pattern:
              // Index % 10 === 0: Featured wide exhibition anchor (spans 2 cols, 2 rows on lg)
              // Index % 10 === 5: Wide banner specimen (spans 2 cols on lg)
              // Others: Clean precision specimen tiles
              const isAnchorHero = index % 10 === 0;
              const isWideBanner = index % 10 === 5;

              const colSpanClass = isAnchorHero
                ? 'col-span-2 row-span-2 min-h-[300px] sm:min-h-[340px]'
                : isWideBanner
                ? 'col-span-2 min-h-[190px]'
                : 'col-span-1 min-h-[190px]';

              return (
                <div
                  key={color.id}
                  className={`group relative bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-[2px] overflow-hidden flex flex-col justify-between cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-black/20 dark:hover:border-white/20 hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.35)] select-none ${colSpanClass}`}
                  onClick={() => onNavigate({ path: 'color-detail', slug: color.slug })}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onNavigate({ path: 'color-detail', slug: color.slug });
                  }}
                  aria-label={`Inspect ${color.name} ${color.hex}`}
                >
                  {/* Dominant Color Field */}
                  <div
                    className="w-full flex-1 relative transition-transform duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.01]"
                    style={{ backgroundColor: color.hex }}
                  >
                    {/* Corner Specimen Index Tag */}
                    <div className="absolute top-2.5 left-2.5 z-10 font-mono text-xs font-bold px-1.5 py-0.5 rounded-[1px] bg-black/60 text-white backdrop-blur-xs">
                      {specimenNumber}
                    </div>

                    {/* Action Pill on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-20 p-2">
                      <KromaButton
                        size="sm"
                        variant="filled"
                        onClick={(e) => handleCopy(color.hex, color.name, e)}
                        className="bg-white text-[#171717] font-mono text-xs font-semibold py-1.5 px-3 rounded-[2px] inline-flex items-center gap-1.5 shadow-sm"
                        title="Click to copy HEX"
                        iconLeft={isCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={11} />}
                      >
                        <span>{isCopied ? 'COPIED' : color.hex}</span>
                      </KromaButton>

                      <KromaButton
                        size="icon"
                        variant="ghost"
                        onClick={(e) => handleToggleSave(color, e)}
                        className={`p-1.5 h-8 w-8 rounded-[2px] border ${
                          saved
                            ? 'bg-white text-black border-transparent'
                            : 'bg-black/60 text-white border-white/20 hover:bg-black/80'
                        }`}
                        title={saved ? 'Saved' : 'Save specimen'}
                        aria-label={saved ? 'Saved' : 'Save specimen'}
                        iconLeft={<Bookmark size={12} fill={saved ? 'currentColor' : 'none'} />}
                      />
                    </div>
                  </div>

                  {/* Technical Exhibition Annotation */}
                  <div className="p-3 bg-[#F8F8F8] dark:bg-[#141518] border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-sans text-sm font-bold text-[#171717] dark:text-white truncate uppercase tracking-tight">
                        {color.name}
                      </div>
                      <div className="font-mono text-xs text-[#707070] dark:text-[#909090] flex items-center gap-1.5 mt-0.5">
                        <span>{color.hex}</span>
                        {isAnchorHero && color.rgb && (
                          <span className="hidden sm:inline opacity-70">· {color.rgb}</span>
                        )}
                      </div>
                    </div>

                    <div className="text-[#707070] group-hover:text-[#171717] dark:group-hover:text-white transition-colors shrink-0">
                      <ArrowUpRight size={13} className="transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Infinite Scroll Sentinel */}
          <div ref={observerRef} style={{ height: '30px', margin: '24px 0' }} />

          {isLoadingMore && (
            <div className="flex items-center justify-center gap-2 py-8 text-[#707070] font-mono text-xs">
              <Loader2 size={16} className="animate-spin" />
              <span>STREAMING EXHIBITION SPECIMENS...</span>
            </div>
          )}

          {visibleCount >= filteredColors.length && filteredColors.length > BATCH_SIZE && (
            <div className="text-center py-10 font-mono text-xs tracking-widest text-[#707070] uppercase">
              ARCHIVE BOUNDARY REACHED • {filteredColors.length} CALIBRATED SPECIMENS EXHIBITED
            </div>
          )}
        </>
      )}
    </div>
  );
};
