import React, { useState, useEffect, useRef, useMemo } from 'react';
import { RouteType } from '../types';
import { useLibraryData } from '../context/LibraryDataContext';
import { useSaved } from '../context/SavedContext';
import { useToast } from '../context/ToastContext';
import { copyToClipboard } from '../utils/colorUtils';
import { Search, Loader2, ArrowUpRight, Bookmark, Check } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';
import { generateCollectionPageSchema } from '../utils/schemaGenerator';

interface ColorsPageProps {
  onNavigate: (route: RouteType) => void;
}

const BATCH_SIZE = 48;

const FAMILY_TILES = [
  { name: 'RED', hex: '#FF3B30', textDark: false, familyKey: 'red' },
  { name: 'ORANGE', hex: '#FF9500', textDark: true, familyKey: 'orange' },
  { name: 'YELLOW', hex: '#FFD60A', textDark: true, familyKey: 'yellow' },
  { name: 'GREEN', hex: '#34C759', textDark: true, familyKey: 'green' },
  { name: 'BLUE', hex: '#00AEEF', textDark: true, familyKey: 'blue' },
  { name: 'PURPLE', hex: '#7B2CBF', textDark: false, familyKey: 'purple' },
  { name: 'PINK', hex: '#FF2D55', textDark: false, familyKey: 'pink' },
  { name: 'BROWN', hex: '#A2845E', textDark: false, familyKey: 'earth' },
  { name: 'NEUTRAL', hex: '#8E8E93', textDark: false, familyKey: 'neutral' },
  { name: 'BLACK', hex: '#171717', textDark: false, familyKey: 'deep' },
  { name: 'WHITE', hex: '#F0F0F2', textDark: true, familyKey: 'light' },
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
      setTimeout(() => setCopiedHex((curr) => (curr === hex ? null : curr)), 1800);
    }
  };

  const handleToggleSave = (color: typeof colors[0], e: React.MouseEvent) => {
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
      name: 'Curated Color Specimens Library',
      description: `Comprehensive digital color library featuring ${colors.length} calibrated pigments with sRGB, HSL, and OKLCH color metrics.`,
      url: '/colors',
      items: colors.slice(0, 30).map((c) => ({
        name: `${c.name} (${c.hex})`,
        url: `/colors/${c.slug}`,
        description: c.description,
      })),
    });
  }, [colors]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 pb-16 md:pb-24 box-border">
      <SEOHead
        title="Explore Colors — Digital Swatch Drawer | KROMA"
        description={`Explore KROMA's catalog of ${colors.length.toLocaleString()} calibrated digital color specimens across tactile spectrum families.`}
        canonicalPath="/colors"
        jsonLd={collectionSchema}
      />

      {/* Editorial Studio Hero */}
      <header className="border-b border-border-subtle pb-8 md:pb-12 mb-8 md:mb-12">
        <div className="font-mono text-[11px] font-medium tracking-[0.12em] uppercase text-text-secondary mb-4">EXPLORE COLORS</div>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-normal leading-[1.05] tracking-tight text-text-primary uppercase m-0 mb-5">FIND YOUR COLOR.</h1>
        <p className="font-sans text-base leading-relaxed text-text-secondary max-w-[680px] m-0">
          A tactile drawer full of calibrated swatches. Discover pigments, copy hex codes instantly, and inspect chromatic relationships.
        </p>
      </header>

      {/* Top: Tight Horizontal Row of Tactile Color Family Tiles */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-10 [scrollbar-width:thin]" role="region" aria-label="Color Family Selector">
        {FAMILY_TILES.map((f) => {
          const isActive = selectedFamily === f.familyKey;
          return (
            <div
              key={f.name}
              className="flex-none w-40 h-[90px] p-3.5 flex flex-col justify-between rounded cursor-pointer box-border transition-all duration-150 select-none hover:-translate-y-0.5 hover:shadow-md"
              style={{
                backgroundColor: f.hex,
                color: f.textDark ? '#171717' : '#FFFFFF',
                outline: isActive ? '3px solid #171717' : 'none',
                outlineOffset: '2px',
              }}
              onClick={() => setSelectedFamily(isActive ? 'all' : f.familyKey)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedFamily(isActive ? 'all' : f.familyKey);
                }
              }}
            >
              <div className="flex items-center justify-between font-sans text-xs font-semibold tracking-wider uppercase">
                <span>{f.name}</span>
                <span className="text-sm opacity-80">↗</span>
              </div>
              <div className="font-mono text-[11px] opacity-90">{f.hex}</div>
            </div>
          );
        })}
      </div>

      {/* Clean Typographic Search & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-2 mb-0">
          <button
            className={`font-mono text-[11px] tracking-[0.08em] uppercase px-4 py-2 bg-surface-1 border border-border-subtle text-text-secondary cursor-pointer transition-colors duration-150 select-none hover:border-text-primary hover:text-text-primary ${
              selectedFamily === 'all' && selectedTone === 'all' ? '!bg-text-primary !text-canvas !border-text-primary' : ''
            }`}
            onClick={() => {
              setSelectedFamily('all');
              setSelectedTone('all');
            }}
          >
            ALL ({colors.length})
          </button>
          {toneFilters.filter(t => t !== 'all').map((tone) => (
            <button
              key={tone}
              className={`font-mono text-[11px] tracking-[0.08em] uppercase px-4 py-2 bg-surface-1 border border-border-subtle text-text-secondary cursor-pointer transition-colors duration-150 select-none hover:border-text-primary hover:text-text-primary ${
                selectedTone === tone ? '!bg-text-primary !text-canvas !border-text-primary' : ''
              }`}
              onClick={() => setSelectedTone(selectedTone === tone ? 'all' : tone)}
            >
              {tone.toUpperCase()}
            </button>
          ))}
          {selectedFamily !== 'all' && (
            <button
              className="font-mono text-[11px] tracking-[0.08em] uppercase px-4 py-2 !bg-text-primary !text-canvas !border-text-primary cursor-pointer select-none"
              onClick={() => setSelectedFamily('all')}
            >
              FAMILY: {selectedFamily.toUpperCase()} ×
            </button>
          )}
        </div>

        {/* Typographic Search Input */}
        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            className="w-full bg-white dark:bg-[#15171C] border border-neutral-200 dark:border-neutral-800 rounded-sm py-2 pl-9 pr-4 text-xs font-sans text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors"
            placeholder="Search specimen or #HEX..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* The Color Grid: Square/Rectangular Fields with Instant Copy and Micro-Feedback */}
      {filteredColors.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-sm">
          <p className="font-sans text-sm font-semibold tracking-wider uppercase text-neutral-400 mb-2">NO SPECIMENS FOUND</p>
          <p className="font-sans text-xs text-neutral-500 mb-6">Try clearing your search query or selecting a different family.</p>
          <button
            onClick={() => {
              setSelectedFamily('all');
              setSelectedTone('all');
              setSearchQuery('');
            }}
            className="font-sans text-xs font-semibold tracking-wider uppercase px-4 py-2 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-900 hover:text-white transition-colors"
          >
            RESET FILTERS
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 min-[540px]:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
            {displayedColors.map((color) => {
              const isCopied = copiedHex === color.hex;
              const saved = isSaved(color.id);

              return (
                <div
                  key={color.id}
                  className="bg-surface-1 border border-border-subtle rounded overflow-hidden flex flex-col cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:border-text-primary hover:shadow-md group"
                  onClick={() => onNavigate({ path: 'color-detail', slug: color.slug })}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onNavigate({ path: 'color-detail', slug: color.slug });
                  }}
                >
                  <div
                    className="w-full aspect-square relative flex items-center justify-center"
                    style={{ backgroundColor: color.hex }}
                    onClick={(e) => handleCopy(color.hex, color.name, e)}
                    title="Click to copy HEX"
                  >
                    <span className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 backdrop-blur-xs text-white font-mono text-[10px] font-medium tracking-wider opacity-0 transition-opacity duration-150 pointer-events-none group-hover:opacity-100">
                      {isCopied ? (
                        <>
                          <Check size={12} className="text-emerald-400" />
                          <span>COPIED!</span>
                        </>
                      ) : (
                        <>
                          <span>COPY HEX</span>
                          <ArrowUpRight size={11} />
                        </>
                      )}
                    </span>
                  </div>

                  <div className="p-2.5 sm:px-3 flex flex-col gap-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-sans text-xs font-medium text-text-primary truncate">{color.name}</span>
                      <button
                        className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                        onClick={(e) => handleToggleSave(color, e)}
                        title={saved ? 'Saved' : 'Save color'}
                      >
                        <Bookmark size={13} fill={saved ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <span className="font-mono text-[11px] text-text-secondary">{color.hex}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Infinite Scroll Sentinel */}
          <div ref={observerRef} style={{ height: '30px', margin: '30px 0' }} />

          {isLoadingMore && (
            <div className="flex items-center justify-center gap-2 py-8 text-neutral-500 font-mono text-xs">
              <Loader2 size={16} className="animate-spin" />
              <span>STREAMING SPECIMENS...</span>
            </div>
          )}

          {visibleCount >= filteredColors.length && filteredColors.length > BATCH_SIZE && (
            <div className="text-center py-12 text-[11px] font-mono tracking-widest text-neutral-400 uppercase">
              END OF SPECIMEN DRAWER • {filteredColors.length} PIGMENTS LOADED
            </div>
          )}
        </>
      )}
    </div>
  );
};

