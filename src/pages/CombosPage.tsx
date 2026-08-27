import React, { useState } from 'react';
import { RouteType } from '../types';
import { CURATED_COMBOS } from '../data/combos';
import { ComboCard } from '../components/ComboCard';
import { Search, ChevronDown } from 'lucide-react';

interface CombosPageProps {
  onNavigate: (route: RouteType) => void;
}

export const CombosPage: React.FC<CombosPageProps> = ({ onNavigate }) => {
  const [selectedHarmony, setSelectedHarmony] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState<number>(36);

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

  const filteredCombos = CURATED_COMBOS.filter((cb) => {
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

  const displayedCombos = filteredCombos.slice(0, visibleCount);

  return (
    <div className="combos-page">
      <header className="page-header">
        <span className="page-category-label">Digital Library • Section 03</span>
        <h1 className="page-title">Color Harmonies &amp; Combinations</h1>
        <p className="page-description">
          A library of {CURATED_COMBOS.length.toLocaleString()} relational color combinations with explicit surface proportions, WCAG AAA contrast scores, and architectural role definitions.
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
              onClick={() => {
                setSelectedHarmony(type);
                setVisibleCount(36);
              }}
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
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(36);
            }}
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
              setVisibleCount(36);
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

          {visibleCount < filteredCombos.length && (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <button
                className="btn-secondary"
                onClick={() => setVisibleCount((prev) => prev + 36)}
                style={{ padding: '12px 28px', fontSize: '0.88rem' }}
              >
                <span>Load More Harmonies ({filteredCombos.length - visibleCount} remaining)</span>
                <ChevronDown size={15} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
