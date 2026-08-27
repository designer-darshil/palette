import React, { useState, useEffect, useRef, useMemo } from 'react';
import { RouteType } from '../types';
import { useLibraryData } from '../context/LibraryDataContext';
import { PaletteCard } from '../components/PaletteCard';
import { Search, Loader2 } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';
import { generateCollectionPageSchema } from '../utils/schemaGenerator';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

interface PalettesPageProps {
  onNavigate: (route: RouteType) => void;
}

const BATCH_SIZE = 24;

export const PalettesPage: React.FC<PalettesPageProps> = ({ onNavigate }) => {
  const { palettes } = useLibraryData();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const observerRef = useRef<HTMLDivElement | null>(null);

  const categories = [
    'all',
    'editorial',
    'minimal',
    'nature',
    'architectural',
    'vintage',
    'vibrant',
    'monochrome',
    'dark-mode',
  ];

  const filteredPalettes = useMemo(() => {
    return palettes.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchCategory = p.category.toLowerCase().includes(q);
        const matchTag = p.tags.some((t) => t.toLowerCase().includes(q));
        const matchColor = p.colors.some(
          (c) => c.name.toLowerCase().includes(q) || c.hex.toLowerCase().includes(q)
        );
        if (!matchTitle && !matchCategory && !matchTag && !matchColor) return false;
      }
      return true;
    });
  }, [palettes, selectedCategory, searchQuery]);

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

    const filteredColors = filteredPalettes;
    observer.observe(target);
    return () => observer.disconnect();
  }, [visibleCount, filteredPalettes, isLoadingMore]);

  const displayedPalettes = useMemo(() => {
    return filteredPalettes.slice(0, visibleCount);
  }, [filteredPalettes, visibleCount]);

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
    <div className="palettes-page">
      <SEOHead
        title="Curated Palette Systems | 5-Tone Design Harmonies"
        description={`Explore ${palettes.length.toLocaleString()} modernist, architectural, and editorial color palettes curated with calibrated contrast and design token exports.`}
        canonicalPath="/palettes"
        jsonLd={collectionSchema}
      />

      <Breadcrumbs
        items={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Palettes', isCurrent: true },
        ]}
        onNavigate={onNavigate}
      />

      <header className="page-header">
        <span className="page-category-label">Digital Library • Section 02</span>
        <h1 className="page-title">Curated Palette Systems</h1>
        <p className="page-description">
          A catalogue of {palettes.length.toLocaleString()} modernist, architectural, and botanical harmonic palettes assembled for identity systems, design tokens, and editorial specimen documents.
        </p>
      </header>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-pills">
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', alignSelf: 'center', marginRight: '4px' }}>
            AESTHETIC:
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
            placeholder="Filter palettes, tags, hex..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
        <span>SHOWING {displayedPalettes.length.toLocaleString()} OF {filteredPalettes.length.toLocaleString()} PALETTE SYSTEMS</span>
      </div>

      {filteredPalettes.length === 0 ? (
        <div style={{ padding: '64px 20px', textAlign: 'center', background: 'var(--bg-surface-1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
            No palettes match the selected category.
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
          <div className="specimen-grid-palettes">
            {displayedPalettes.map((palette) => (
              <PaletteCard key={palette.id} palette={palette} onNavigate={onNavigate} />
            ))}
          </div>

          {/* Infinite Scroll Trigger Sentinel */}
          <div ref={observerRef} style={{ height: '20px', margin: '20px 0' }} />

          {isLoadingMore && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '24px', color: 'var(--text-secondary)', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
              <Loader2 size={16} className="animate-spin" />
              <span>Loading more palette systems...</span>
            </div>
          )}

          {visibleCount >= filteredPalettes.length && filteredPalettes.length > BATCH_SIZE && (
            <div style={{ textAlign: 'center', padding: '32px 0 16px 0', fontSize: '0.78rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              END OF PALETTE STREAM • ALL {filteredPalettes.length.toLocaleString()} SYSTEMS LOADED
            </div>
          )}
        </>
      )}
    </div>
  );
};
