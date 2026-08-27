import React, { useState } from 'react';
import { RouteType, ColorItem } from '../types';
import { CURATED_COLORS } from '../data/colors';
import { ColorCard } from '../components/ColorCard';
import { Search } from 'lucide-react';

interface ColorsPageProps {
  onNavigate: (route: RouteType) => void;
}

export const ColorsPage: React.FC<ColorsPageProps> = ({ onNavigate }) => {
  const [selectedFamily, setSelectedFamily] = useState<string>('all');
  const [selectedTone, setSelectedTone] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const families = ['all', 'warm', 'cool', 'earth', 'neutral', 'pastel', 'vibrant', 'deep'];
  const tones = ['all', 'light', 'medium', 'dark'];

  const filteredColors = CURATED_COLORS.filter((c) => {
    if (selectedFamily !== 'all' && c.family !== selectedFamily) return false;
    if (selectedTone !== 'all' && c.tone !== selectedTone) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchHex = c.hex.toLowerCase().includes(q);
      const matchTag = c.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchHex && !matchTag) return false;
    }
    return true;
  });

  return (
    <div className="colors-page">
      <header className="page-header">
        <span className="page-category-label">Digital Library • Section 01</span>
        <h1 className="page-title">Curated Color Specimens</h1>
        <p className="page-description">
          A calibrated catalog of digital pigments. Each tone is documented with sRGB, HSL, OKLCH, contrast scores against dark and light grounds, and harmonious relationships.
        </p>
      </header>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <div className="filter-pills">
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', alignSelf: 'center', marginRight: '4px' }}>
              FAMILY:
            </span>
            {families.map((f) => (
              <button
                key={f}
                className={`filter-pill ${selectedFamily === f ? 'active' : ''}`}
                onClick={() => setSelectedFamily(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="filter-pills">
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', alignSelf: 'center', marginRight: '4px' }}>
              TONE:
            </span>
            {tones.map((t) => (
              <button
                key={t}
                className={`filter-pill ${selectedTone === t ? 'active' : ''}`}
                onClick={() => setSelectedTone(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
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
              setSearchQuery('');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="specimen-grid-colors">
          {filteredColors.map((color) => (
            <ColorCard key={color.id} color={color} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
};
