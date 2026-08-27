import React, { useState } from 'react';
import { RouteType, ColorItem } from '../types';
import { CURATED_COLORS } from '../data/colors';
import { ColorCard } from '../components/ColorCard';
import { Search, ChevronDown } from 'lucide-react';

interface ColorsPageProps {
  onNavigate: (route: RouteType) => void;
}

export const ColorsPage: React.FC<ColorsPageProps> = ({ onNavigate }) => {
  const [selectedFamily, setSelectedFamily] = useState<string>('all');
  const [selectedTone, setSelectedTone] = useState<string>('all');
  const [selectedHueGroup, setSelectedHueGroup] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState<number>(48);

  const families = ['all', 'warm', 'cool', 'earth', 'neutral', 'pastel', 'vibrant', 'deep'];
  const tones = ['all', 'light', 'medium', 'dark', 'muted'];
  const hueGroups = ['all', 'red', 'orange', 'yellow', 'green', 'teal', 'cyan', 'blue', 'indigo', 'purple', 'pink', 'neutral'];

  const filteredColors = CURATED_COLORS.filter((c) => {
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

  const displayedColors = filteredColors.slice(0, visibleCount);

  return (
    <div className="colors-page">
      <header className="page-header">
        <span className="page-category-label">Digital Library • Section 01</span>
        <h1 className="page-title">Curated Color Specimens</h1>
        <p className="page-description">
          A calibrated catalog of {CURATED_COLORS.length.toLocaleString()} digital pigments across all 16 spectrum families. Each tone is documented with sRGB, HSL, OKLCH, contrast scores against dark and light grounds, and harmonious relationships.
        </p>
      </header>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <div className="filter-pills">
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', alignSelf: 'center', marginRight: '4px' }}>
              SPECTRUM:
            </span>
            {hueGroups.map((hg) => (
              <button
                key={hg}
                className={`filter-pill ${selectedHueGroup === hg ? 'active' : ''}`}
                onClick={() => {
                  setSelectedHueGroup(hg);
                  setVisibleCount(48);
                }}
              >
                {hg}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div className="filter-pills">
              <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', alignSelf: 'center', marginRight: '4px' }}>
                FAMILY:
              </span>
              {families.map((f) => (
                <button
                  key={f}
                  className={`filter-pill ${selectedFamily === f ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedFamily(f);
                    setVisibleCount(48);
                  }}
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
                  onClick={() => {
                    setSelectedTone(t);
                    setVisibleCount(48);
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
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
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(48);
            }}
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
              setVisibleCount(48);
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

          {visibleCount < filteredColors.length && (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <button
                className="btn-secondary"
                onClick={() => setVisibleCount((prev) => prev + 48)}
                style={{ padding: '12px 28px', fontSize: '0.88rem' }}
              >
                <span>Load More Colors ({filteredColors.length - visibleCount} remaining)</span>
                <ChevronDown size={15} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
