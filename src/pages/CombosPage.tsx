import React, { useState } from 'react';
import { RouteType } from '../types';
import { CURATED_COMBOS } from '../data/combos';
import { ComboCard } from '../components/ComboCard';
import { Search } from 'lucide-react';

interface CombosPageProps {
  onNavigate: (route: RouteType) => void;
}

export const CombosPage: React.FC<CombosPageProps> = ({ onNavigate }) => {
  const [selectedHarmony, setSelectedHarmony] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const harmonyTypes = [
    'all',
    'Complementary',
    'Analogous',
    'Triadic',
    'Split Complementary',
    'Monochromatic',
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

  return (
    <div className="combos-page">
      <header className="page-header">
        <span className="page-category-label">Digital Library • Section 03</span>
        <h1 className="page-title">Color Harmonies &amp; Combinations</h1>
        <p className="page-description">
          Engineered relational color combinations with explicit surface proportions, WCAG contrast scores, and architectural role definitions.
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
        <div className="specimen-grid-combos">
          {filteredCombos.map((combo) => (
            <ComboCard key={combo.id} combo={combo} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
};
