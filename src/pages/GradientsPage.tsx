import React, { useState } from 'react';
import { RouteType } from '../types';
import { CURATED_GRADIENTS } from '../data/gradients';
import { GradientCard } from '../components/GradientCard';
import { Search } from 'lucide-react';

interface GradientsPageProps {
  onNavigate: (route: RouteType) => void;
}

export const GradientsPage: React.FC<GradientsPageProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'all',
    'atmospheric',
    'sunset',
    'holographic',
    'deep-space',
    'editorial-metal',
  ];

  const filteredGradients = CURATED_GRADIENTS.filter((g) => {
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

  return (
    <div className="gradients-page">
      <header className="page-header">
        <span className="page-category-label">Digital Library • Section 04</span>
        <h1 className="page-title">Curated CSS Gradients</h1>
        <p className="page-description">
          Continuous color transitions engineered for clean browser rendering, editorial atmosphere, and digital backdrops.
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
        <div className="specimen-grid-gradients">
          {filteredGradients.map((gradient) => (
            <GradientCard key={gradient.id} gradient={gradient} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
};
