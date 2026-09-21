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
      <div className="filter-panel">
        <div className="filter-group w-full min-w-0">
          <span className="filter-group-label">
            ATMOSPHERE:
          </span>
          <div className="filter-options filter-options--scroll flex-1">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-option ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-search mt-1">
          <Search size={14} color="#9DA3AF" style={{ position: 'absolute', left: 10 }} />
          <input
            type="text"
            className="filter-search-input"
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
          <div className="specimen-grid-gradients">
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
