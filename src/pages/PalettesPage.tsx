import React, { useState } from 'react';
import { RouteType } from '../types';
import { CURATED_PALETTES } from '../data/palettes';
import { PaletteCard } from '../components/PaletteCard';
import { Search } from 'lucide-react';

interface PalettesPageProps {
  onNavigate: (route: RouteType) => void;
}

export const PalettesPage: React.FC<PalettesPageProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredPalettes = CURATED_PALETTES.filter((p) => {
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

  return (
    <div className="palettes-page">
      <header className="page-header">
        <span className="page-category-label">Digital Library • Section 02</span>
        <h1 className="page-title">Curated Palette Systems</h1>
        <p className="page-description">
          Modernist, architectural, and botanical harmonic palettes assembled for identity systems, design tokens, and editorial specimen documents.
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
        <div className="specimen-grid-palettes">
          {filteredPalettes.map((palette) => (
            <PaletteCard key={palette.id} palette={palette} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
};
