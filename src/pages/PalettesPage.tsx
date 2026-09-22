import React, { useState, useEffect, useRef, useMemo } from 'react';
import { RouteType } from '../types';
import { useLibraryData } from '../context/LibraryDataContext';
import { useSaved } from '../context/SavedContext';
import { useToast } from '../context/ToastContext';
import { Search, Loader2 } from 'lucide-react';
import { PaletteCard } from '../components/PaletteCard';
import { SEOHead } from '../components/seo/SEOHead';
import { generateCollectionPageSchema } from '../utils/schemaGenerator';

interface PalettesPageProps {
  onNavigate: (route: RouteType) => void;
}

const BATCH_SIZE = 24;

const FILTER_TABS = [
  { id: 'all', label: 'ALL' },
  { id: 'warm', label: 'WARM' },
  { id: 'cool', label: 'COOL' },
  { id: 'neutral', label: 'NEUTRAL' },
  { id: 'bold', label: 'BOLD' },
  { id: 'pastel', label: 'PASTEL' },
  { id: 'dark', label: 'DARK' },
];

export const PalettesPage: React.FC<PalettesPageProps> = ({ onNavigate }) => {
  const { palettes } = useLibraryData();
  const { isSaved, saveItem } = useSaved();
  const { showToast } = useToast();

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const observerRef = useRef<HTMLDivElement | null>(null);

  const filteredPalettes = useMemo(() => {
    return palettes.filter((p) => {
      if (activeFilter !== 'all') {
        const filterLower = activeFilter.toLowerCase();
        const matchCategory = p.category?.toLowerCase() === filterLower;
        const matchTag = (p.tags || []).some((t) => t.toLowerCase().includes(filterLower));
        if (!matchCategory && !matchTag) {
          // Additional heuristic for bold/dark/warm/cool/neutral
          if (filterLower === 'bold' && !p.tags?.some(t => ['vibrant', 'bold', 'neon', 'high-contrast'].includes(t.toLowerCase()))) return false;
          if (filterLower === 'dark' && !p.tags?.some(t => ['dark-mode', 'dark', 'deep', 'night'].includes(t.toLowerCase())) && p.category !== 'dark-mode') return false;
          if (filterLower === 'neutral' && !p.tags?.some(t => ['neutral', 'minimal', 'monochrome', 'earth'].includes(t.toLowerCase())) && p.category !== 'minimal' && p.category !== 'monochrome') return false;
          if (filterLower === 'pastel' && !p.tags?.some(t => ['pastel', 'soft', 'light'].includes(t.toLowerCase()))) return false;
          if (filterLower === 'warm' && !p.tags?.some(t => ['warm', 'vintage', 'summer', 'autumn'].includes(t.toLowerCase())) && p.category !== 'vintage') return false;
          if (filterLower === 'cool' && !p.tags?.some(t => ['cool', 'architectural', 'winter'].includes(t.toLowerCase())) && p.category !== 'architectural') return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchCategory = p.category.toLowerCase().includes(q);
        const matchTag = (p.tags || []).some((t) => t.toLowerCase().includes(q));
        const matchColor = p.colors.some(
          (c) => c.name.toLowerCase().includes(q) || c.hex.toLowerCase().includes(q)
        );
        if (!matchTitle && !matchCategory && !matchTag && !matchColor) return false;
      }
      return true;
    });
  }, [palettes, activeFilter, searchQuery]);

  // Reset pagination on filter or search change
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [activeFilter, searchQuery]);

  // Infinite scroll
  useEffect(() => {
    const target = observerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && visibleCount < filteredPalettes.length && !isLoadingMore) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredPalettes.length));
            setIsLoadingMore(false);
          }, 80);
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [visibleCount, filteredPalettes, isLoadingMore]);

  const displayedPalettes = useMemo(() => {
    return filteredPalettes.slice(0, visibleCount);
  }, [filteredPalettes, visibleCount]);

  const handleToggleSave = (palette: typeof palettes[0], e: React.MouseEvent) => {
    e.stopPropagation();
    const saved = isSaved(palette.id);
    saveItem({
      id: palette.id,
      type: 'palette',
      title: palette.title,
      slug: palette.slug,
      preview: palette.colors.map((c) => c.hex).join(','),
      metadata: `${palette.category} • ${palette.colors.length} shades`,
    });
    showToast(
      saved ? 'Removed from saved' : 'Saved to studio collection',
      palette.title,
      palette.colors[0]?.hex
    );
  };

  const collectionSchema = useMemo(() => {
    return generateCollectionPageSchema({
      name: 'Curated Palette Systems Catalogue',
      description: `Modernist and architectural 5-tone color palette systems curated for UI/UX and identity systems.`,
      url: '/palettes',
      items: palettes.slice(0, 30).map((p) => ({
        name: p.title,
        url: `/palettes/${p.slug}`,
        description: p.description,
      })),
    });
  }, [palettes]);

  return (
    <div className="kroma-page">
      <SEOHead
        title="Palette Library — Colors That Belong Together | KROMA"
        description={`Explore ${palettes.length.toLocaleString()} modernist, architectural, and editorial color palettes curated with calibrated contrast and design token exports.`}
        canonicalPath="/palettes"
        jsonLd={collectionSchema}
      />

      {/* Editorial Hero */}
      <header className="kroma-hero">
        <div className="kroma-label">PALETTE LIBRARY</div>
        <h1 className="kroma-headline">COLORS THAT BELONG TOGETHER.</h1>
        <p className="kroma-lead">
          A curated exhibition of harmonic color systems. Living palettes engineered for digital interfaces, editorial prints, and spatial identities.
        </p>
      </header>

      {/* Filter Bar and Typographic Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="kroma-filter-bar mb-0">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`kroma-filter-btn ${activeFilter === tab.id ? 'kroma-filter-btn--active' : ''}`}
              onClick={() => setActiveFilter(tab.id)}
            >
              {tab.label} {tab.id === 'all' && `(${palettes.length})`}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            className="w-full bg-white dark:bg-[#15171C] border border-neutral-200 dark:border-neutral-800 rounded-sm py-2 pl-9 pr-4 text-xs font-sans text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors"
            placeholder="Search palettes or colors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Oversized Palette Strips Gallery */}
      {filteredPalettes.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-sm">
          <p className="font-sans text-sm font-semibold tracking-wider uppercase text-neutral-400 mb-2">NO PALETTES FOUND</p>
          <p className="font-sans text-xs text-neutral-500 mb-6">Try selecting a different filter or clearing your search.</p>
          <button
            onClick={() => {
              setActiveFilter('all');
              setSearchQuery('');
            }}
            className="font-sans text-xs font-semibold tracking-wider uppercase px-4 py-2 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-900 hover:text-white transition-colors"
          >
            RESET ALL FILTERS
          </button>
        </div>
      ) : (
        <>
          <div className="kroma-palettes-gallery">
            {displayedPalettes.map((palette) => (
              <PaletteCard
                key={palette.id}
                palette={palette}
                onNavigate={onNavigate}
              />
            ))}
          </div>

          {/* Infinite Scroll Sentinel */}
          <div ref={observerRef} style={{ height: '30px', margin: '30px 0' }} />

          {isLoadingMore && (
            <div className="flex items-center justify-center gap-2 py-8 text-neutral-500 font-mono text-xs">
              <Loader2 size={16} className="animate-spin" />
              <span>LOADING MORE PALETTES...</span>
            </div>
          )}

          {visibleCount >= filteredPalettes.length && filteredPalettes.length > BATCH_SIZE && (
            <div className="text-center py-12 text-[11px] font-mono tracking-widest text-neutral-400 uppercase">
              END OF PALETTE ARCHIVE • {filteredPalettes.length} SYSTEMS DISPLAYED
            </div>
          )}
        </>
      )}
    </div>
  );
};

