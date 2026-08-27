import React, { useState, useEffect, useRef, useMemo } from 'react';
import { RouteType } from '../types';
import { useLibraryData } from '../context/LibraryDataContext';
import { ComboCard } from '../components/ComboCard';
import { Search, Loader2 } from 'lucide-react';

interface CombosPageProps {
  onNavigate: (route: RouteType) => void;
}

const BATCH_SIZE = 24;

export const CombosPage: React.FC<CombosPageProps> = ({ onNavigate }) => {
  const { combos } = useLibraryData();

  const [selectedHarmony, setSelectedHarmony] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const observerRef = useRef<HTMLDivElement | null>(null);

  const harmonyTypes = [
    'all',
    'Complementary',
    'Analogous',
    'Triadic',
    'Split Complementary',
    'Monochromatic',
    'Warm & Cool',
    'High Contrast',
    'Editorial Balance',
  ];

  const filteredCombos = useMemo(() => {
    return combos.filter((cb) => {
      if (selectedHarmony !== 'all' && cb.harmonyType !== selectedHarmony) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = cb.title.toLowerCase().includes(q);
        const matchHarmony = cb.harmonyType.toLowerCase().includes(q);
        const matchTag = cb.tags.some((t) => t.toLowerCase().includes(q));
        const matchColor = cb.colors.some(
          (c) => c.name.toLowerCase().includes(q) || c.hex.toLowerCase().includes(q)
        );
        if (!matchTitle && !matchHarmony && !matchTag && !matchColor) return false;
      }
      return true;
    });
  }, [combos, selectedHarmony, searchQuery]);

  // Reset pagination on filter or search change
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [selectedHarmony, searchQuery]);

  // IntersectionObserver for seamless infinite scrolling
  useEffect(() => {
    const target = observerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && visibleCount < filteredCombos.length && !isLoadingMore) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredCombos.length));
            setIsLoadingMore(false);
          }, 80);
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [visibleCount, filteredCombos.length, isLoadingMore]);

  const displayedCombos = useMemo(() => {
    return filteredCombos.slice(0, visibleCount);
  }, [filteredCombos, visibleCount]);

  return (
    <div className="combos-page">
      <header className="page-header">
        <span className="page-category-label">Digital Library • Section 03</span>
        <h1 className="page-title">Color Harmonies &amp; Combinations</h1>
        <p className="page-description">
          A library of {combos.length.toLocaleString()} relational color combinations with explicit surface proportions, WCAG AAA contrast scores, and architectural role definitions.
        </p>
      </header>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-pills">
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', alignSelf: 'center', marginRight: '4px' }}>
            HARMONY:
          </span>
          {harmonyTypes.map((type) => (
            <button
              key={type}
              className={`filter-pill ${selectedHarmony === type ? 'active' : ''}`}
              onClick={() => setSelectedHarmony(type)}
            >
              {type}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={14} color="#9DA3AF" style={{ position: 'absolute', left: 10 }} />
          <input
            type="text"
            className="filter-search-input"
            style={{ paddingLeft: '32px' }}
            placeholder="Filter combinations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
        <span>SHOWING {displayedCombos.length.toLocaleString()} OF {filteredCombos.length.toLocaleString()} COLOR HARMONIES</span>
      </div>

      {filteredCombos.length === 0 ? (
        <div style={{ padding: '64px 20px', textAlign: 'center', background: 'var(--bg-surface-1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
            No harmony combinations match the filter.
          </p>
          <button
            className="btn-secondary"
            onClick={() => {
              setSelectedHarmony('all');
              setSearchQuery('');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="specimen-grid-combos">
            {displayedCombos.map((combo) => (
              <ComboCard key={combo.id} combo={combo} onNavigate={onNavigate} />
            ))}
          </div>

          {/* Infinite Scroll Trigger Sentinel */}
          <div ref={observerRef} style={{ height: '20px', margin: '20px 0' }} />

          {isLoadingMore && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '24px', color: 'var(--text-secondary)', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
              <Loader2 size={16} className="animate-spin" />
              <span>Loading more color harmonies...</span>
            </div>
          )}

          {visibleCount >= filteredCombos.length && filteredCombos.length > BATCH_SIZE && (
            <div style={{ textAlign: 'center', padding: '32px 0 16px 0', fontSize: '0.78rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              END OF HARMONY STREAM • ALL {filteredCombos.length.toLocaleString()} COMBOS LOADED
            </div>
          )}
        </>
      )}
    </div>
  );
};
