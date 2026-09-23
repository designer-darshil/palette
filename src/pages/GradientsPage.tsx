import React, { useState, useEffect, useRef, useMemo } from 'react';
import { RouteType } from '../types';
import { useLibraryData } from '../context/LibraryDataContext';
import { GradientCard } from '../components/GradientCard';
import { Search, Loader2 } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';
import { generateCollectionPageSchema } from '../utils/schemaGenerator';
import { PageHeader } from '../components/common/PageHeader';
import { ResultsCountBar } from '../components/common/ResultsCountBar';
import { EmptyState } from '../components/common/EmptyState';
import { KromaButton } from '../components/common/KromaButton';

interface GradientsPageProps {
  onNavigate: (route: RouteType) => void;
}

const BATCH_SIZE = 24;

export const GradientsPage: React.FC<GradientsPageProps> = ({ onNavigate }) => {
  const { gradients } = useLibraryData();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const observerRef = useRef<HTMLDivElement | null>(null);

  const categories = [
    'all',
    'atmospheric',
    'sunset',
    'holographic',
    'deep-space',
    'organic',
    'editorial-metal',
    'minimal',
  ];

  const filteredGradients = useMemo(() => {
    return gradients.filter((g) => {
      if (selectedCategory !== 'all' && g.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = g.title.toLowerCase().includes(q);
        const matchCategory = g.category.toLowerCase().includes(q);
        const matchTag = g.tags.some((t) => t.toLowerCase().includes(q));
        const matchStop = g.stops.some(
          (s) => s.color.toLowerCase().includes(q) || (s.name && s.name.toLowerCase().includes(q))
        );
        if (!matchTitle && !matchCategory && !matchTag && !matchStop) return false;
      }
      return true;
    });
  }, [gradients, selectedCategory, searchQuery]);

  // Reset pagination on filter or search change
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [selectedCategory, searchQuery]);

  // IntersectionObserver for seamless infinite scrolling
  useEffect(() => {
    const target = observerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && visibleCount < filteredGradients.length && !isLoadingMore) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredGradients.length));
            setIsLoadingMore(false);
          }, 80);
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [visibleCount, filteredGradients.length, isLoadingMore]);

  const displayedGradients = useMemo(() => {
    return filteredGradients.slice(0, visibleCount);
  }, [filteredGradients, visibleCount]);

  const collectionSchema = useMemo(() => {
    return generateCollectionPageSchema({
      name: 'Curated CSS Gradients Catalogue',
      description: `Continuous color transitions engineered for clean browser rendering, editorial atmosphere, and digital backdrops.`,
      url: '/gradients',
      items: gradients.slice(0, 30).map((g) => ({
        name: g.title,
        url: `/gradients/${g.slug}`,
        description: `CSS gradient with ${g.stops.length} color stops (${g.category}).`,
      })),
    });
  }, [gradients]);

  return (
    <div className="gradients-page">
      <SEOHead
        title="CSS Gradients & Multi-Stop Spectra | KROMA"
        description={`Explore ${gradients.length.toLocaleString()} smooth CSS gradients across sunset, atmospheric, holographic, and minimal spectrum categories with instant CSS copy.`}
        canonicalPath="/gradients"
        jsonLd={collectionSchema}
      />

      <PageHeader
        breadcrumbs={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Gradients', isCurrent: true },
        ]}
        onNavigate={onNavigate}
        sectionLabel="Digital library · Multi-stop spectra"
        title="Curated CSS Gradients"
        description={`A library of ${gradients.length.toLocaleString()} continuous color transitions engineered for clean browser rendering, editorial atmosphere, and digital backdrops.`}
      />

      {/* Responsive Filter Panel */}
      <div className="flex items-center justify-between gap-3 mb-8 flex-wrap bg-[var(--bg-surface-1)] p-3 px-4 rounded-md border border-[var(--border-subtle)] w-full min-w-0 max-w-full overflow-hidden max-md:flex-col max-md:items-stretch max-md:p-3 max-md:gap-2.5 max-md:mb-6">
        <div className="flex items-center gap-2 w-full min-w-0 max-w-full flex-wrap">
          <span className="text-[0.72rem] text-[var(--text-tertiary)] font-mono font-semibold uppercase tracking-[0.05em] shrink-0 mr-1">
            ATMOSPHERE:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 max-w-full min-w-0 flex-nowrap overscroll-x-contain flex-1">
            {categories.map((cat) => (
              <KromaButton
                key={cat}
                size="sm"
                variant={selectedCategory === cat ? 'filled' : 'ghost'}
                className={`py-1.5 px-3 text-[0.78rem] font-semibold uppercase tracking-[0.06em] rounded-sm whitespace-nowrap shrink-0 ${selectedCategory === cat ? 'bg-[var(--text-primary)] text-[var(--text-inverse)] font-bold' : 'text-[var(--text-secondary)] bg-[var(--bg-surface-2)] border border-transparent hover:text-[var(--text-primary)] hover:border-[var(--border-medium)]'}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </KromaButton>
            ))}
          </div>
        </div>

        <div className="relative flex items-center w-auto min-w-[200px] max-w-full max-md:w-full max-md:min-w-0 mt-1">
          <Search size={14} color="#9DA3AF" style={{ position: 'absolute', left: 10 }} />
          <input
            type="text"
            className="bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-sm py-1.5 px-3 text-[0.85rem] text-[var(--text-primary)] w-full min-w-0 focus:border-[var(--border-strong)] focus:outline-none"
            style={{ paddingLeft: '32px' }}
            placeholder="Filter gradients, hex..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ResultsCountBar
        displayedCount={displayedGradients.length}
        totalCount={filteredGradients.length}
        itemName="GRADIENT SPECIMENS"
      />

      {filteredGradients.length === 0 ? (
        <EmptyState
          title="No gradients found"
          description="No gradient transitions match the selected atmosphere filter."
          actionLabel="Reset Filters"
          onAction={() => {
            setSelectedCategory('all');
            setSearchQuery('');
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-4 sm:gap-6">
            {displayedGradients.map((gradient) => (
              <GradientCard key={gradient.id} gradient={gradient} onNavigate={onNavigate} />
            ))}
          </div>

          {/* Infinite Scroll Trigger Sentinel */}
          <div ref={observerRef} style={{ height: '20px', margin: '20px 0' }} />

          {isLoadingMore && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '24px', color: 'var(--text-secondary)', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
              <Loader2 size={16} className="animate-spin" />
              <span>Loading more gradients...</span>
            </div>
          )}

          {visibleCount >= filteredGradients.length && filteredGradients.length > BATCH_SIZE && (
            <div style={{ textAlign: 'center', padding: '32px 0 16px 0', fontSize: '0.78rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              END OF GRADIENT STREAM • ALL {filteredGradients.length.toLocaleString()} SPECIMENS LOADED
            </div>
          )}
        </>
      )}
    </div>
  );
};
