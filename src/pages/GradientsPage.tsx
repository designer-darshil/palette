import React, { useState, useEffect, useRef, useMemo } from 'react';
import { RouteType } from '../types';
import { useLibraryData } from '../context/LibraryDataContext';
import { GradientCard } from '../components/GradientCard';
import { Search, Loader2 } from 'lucide-react';

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

  return (
    <div className="gradients-page">
      <header className="page-header">
        <span className="page-category-label">Digital Library • Section 04</span>
        <h1 className="page-title">Curated CSS Gradients</h1>
        <p className="page-description">
          A library of {gradients.length.toLocaleString()} continuous color transitions engineered for clean browser rendering, editorial atmosphere, and digital backdrops.
        </p>
      </header>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-pills">
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', alignSelf: 'center', marginRight: '4px' }}>
            ATMOSPHERE:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
        <span>SHOWING {displayedGradients.length.toLocaleString()} OF {filteredGradients.length.toLocaleString()} GRADIENT SPECIMENS</span>
      </div>

      {filteredGradients.length === 0 ? (
        <div style={{ padding: '64px 20px', textAlign: 'center', background: 'var(--bg-surface-1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
            No gradients match the selected atmosphere filter.
          </p>
          <button
            className="btn-secondary"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
          >
            Reset Filters
          </button>
        </div>
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
