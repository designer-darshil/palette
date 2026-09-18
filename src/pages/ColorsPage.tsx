import React, { useState, useEffect, useRef, useMemo } from 'react';
import { RouteType } from '../types';
import { useLibraryData } from '../context/LibraryDataContext';
import { ColorCard } from '../components/ColorCard';
import { Search, Loader2 } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';
import { generateCollectionPageSchema } from '../utils/schemaGenerator';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

interface ColorsPageProps {
  onNavigate: (route: RouteType) => void;
}

const BATCH_SIZE = 36;

export const ColorsPage: React.FC<ColorsPageProps> = ({ onNavigate }) => {
  const { colors } = useLibraryData();

  const [selectedFamily, setSelectedFamily] = useState<string>('all');
  const [selectedTone, setSelectedTone] = useState<string>('all');
  const [selectedHueGroup, setSelectedHueGroup] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const observerRef = useRef<HTMLDivElement | null>(null);

  const families = ['all', 'warm', 'cool', 'earth', 'neutral', 'pastel', 'vibrant', 'deep'];
  const tones = ['all', 'light', 'medium', 'dark', 'muted'];
  const hueGroups = ['all', 'red', 'orange', 'yellow', 'green', 'teal', 'cyan', 'blue', 'indigo', 'purple', 'pink', 'neutral'];

  const filteredColors = useMemo(() => {
    return colors.filter((c) => {
      if (selectedFamily !== 'all' && c.family !== selectedFamily) return false;
      if (selectedTone !== 'all' && c.tone !== selectedTone) return false;
      if (selectedHueGroup !== 'all' && c.hueGroup !== selectedHueGroup) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchHex = c.hex.toLowerCase().includes(q);
        const matchTag = c.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchHex && !matchTag) return false;
      }
      return true;
    });
  }, [colors, selectedFamily, selectedTone, selectedHueGroup, searchQuery]);

  // Reset pagination on filter or search change
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [selectedFamily, selectedTone, selectedHueGroup, searchQuery]);

  // IntersectionObserver for seamless infinite scrolling
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
    <div className="colors-page">
      <SEOHead
        title="Color Specimens Library | 500+ Curated Gamuts"
        description={`Explore KROMA's catalog of ${colors.length.toLocaleString()} calibrated digital color specimens across 16 spectrum families with OKLCH, sRGB, and WCAG contrast ratings.`}
        canonicalPath="/colors"
        jsonLd={collectionSchema}
      />

      <Breadcrumbs
        items={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Colors', isCurrent: true },
        ]}
        onNavigate={onNavigate}
      />

      <header className="page-header">
        <span className="page-category-label">Digital Library • Section 01</span>
        <h1 className="page-title">Curated Color Specimens</h1>
        <p className="page-description">
          A calibrated catalog of {colors.length.toLocaleString()} digital pigments across all 16 spectrum families. Each tone is documented with sRGB, HSL, OKLCH, contrast scores against dark and light grounds, and harmonious relationships.
        </p>
      </header>

      {/* Responsive Filter Panel */}
      <div className="filter-panel">
        <div className="flex flex-col gap-2.5 w-full min-w-0">
          {/* Spectrum Filter */}
          <div className="filter-group">
            <span className="filter-group-label">
              SPECTRUM:
            </span>
            <div className="filter-options filter-options--scroll flex-1">
              {hueGroups.map((hg) => (
                <button
                  key={hg}
                  className={`filter-option ${selectedHueGroup === hg ? 'active' : ''}`}
                  onClick={() => setSelectedHueGroup(hg)}
                >
                  {hg}
                </button>
              ))}
            </div>
          </div>

          {/* Family & Tone Filters */}
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 flex-wrap w-full min-w-0">
            <div className="filter-group flex-1 min-w-0">
              <span className="filter-group-label">
                FAMILY:
              </span>
              <div className="filter-options filter-options--scroll flex-1">
                {families.map((f) => (
                  <button
                    key={f}
                    className={`filter-option ${selectedFamily === f ? 'active' : ''}`}
                    onClick={() => setSelectedFamily(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group flex-1 min-w-0">
              <span className="filter-group-label">
                TONE:
              </span>
              <div className="filter-options filter-options--scroll flex-1">
                {tones.map((t) => (
                  <button
                    key={t}
                    className={`filter-option ${selectedTone === t ? 'active' : ''}`}
                    onClick={() => setSelectedTone(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Search Input */}
        <div className="filter-search mt-1">
          <Search size={14} color="#9DA3AF" style={{ position: 'absolute', left: 10 }} />
          <input
            type="text"
            className="filter-search-input"
            style={{ paddingLeft: '32px' }}
            placeholder="Filter by name, hex, tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
        <span>SHOWING {displayedColors.length.toLocaleString()} OF {filteredColors.length.toLocaleString()} MATCHING SPECIMENS</span>
      </div>

      {filteredColors.length === 0 ? (
        <div style={{ padding: '64px 20px', textAlign: 'center', background: 'var(--bg-surface-1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
            No color specimens match the current filter criteria.
          </p>
          <button
            className="btn-secondary"
            onClick={() => {
              setSelectedFamily('all');
              setSelectedTone('all');
              setSelectedHueGroup('all');
              setSearchQuery('');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="specimen-grid-colors">
            {displayedColors.map((color) => (
              <ColorCard key={color.id} color={color} onNavigate={onNavigate} />
            ))}
          </div>

          {/* Infinite Scroll Trigger Sentinel */}
          <div ref={observerRef} style={{ height: '20px', margin: '20px 0' }} />

          {isLoadingMore && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '24px', color: 'var(--text-secondary)', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
              <Loader2 size={16} className="animate-spin" />
              <span>Loading more color specimens...</span>
            </div>
          )}

          {visibleCount >= filteredColors.length && filteredColors.length > BATCH_SIZE && (
            <div style={{ textAlign: 'center', padding: '32px 0 16px 0', fontSize: '0.78rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              END OF SPECIMEN STREAM • ALL {filteredColors.length.toLocaleString()} SPECIMENS LOADED
            </div>
          )}
        </>
      )}
    </div>
  );
};
