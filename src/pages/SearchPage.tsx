import React, { useState, useMemo } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { RouteType } from '../types';
import { CURATED_PALETTES } from '../data/palettes';
import { PaletteCard } from '../components/PaletteCard';
import { SEOHead } from '../components/seo/SEOHead';

interface SearchPageProps {
  initialQuery?: string;
  initialColor?: string;
  initialMood?: string;
  initialStyle?: string;
  initialIndustry?: string;
  onNavigate: (route: RouteType) => void;
}

const POPULAR_SEARCHES = [
  'blue',
  'minimal',
  'luxury',
  'warm',
  'nature',
  'fashion',
  'retro',
  'editorial',
];

const COLOR_RADIO = [
  { name: 'Red', hex: '#EF4444' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Yellow', hex: '#FACC15' },
  { name: 'Green', hex: '#22C55E' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Purple', hex: '#A855F7' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Neutral', hex: '#A8A29E' },
];

const MOOD_RADIO = [
  'Calm',
  'Energetic',
  'Elegant',
  'Dark',
  'Playful',
  'Warm',
  'Sophisticated',
];

const STYLE_RADIO = [
  'Editorial',
  'Modern',
  'Luxury',
  'Organic',
  'Futuristic',
];

const INDUSTRY_RADIO = [
  'Fashion',
  'Branding',
  'UI/UX',
  'Architecture',
  'Food',
  'Beauty',
  'Technology',
];

export const SearchPage: React.FC<SearchPageProps> = ({
  initialQuery = '',
  initialColor = null,
  initialMood = null,
  initialStyle = null,
  initialIndustry = null,
  onNavigate,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedColor, setSelectedColor] = useState<string | null>(initialColor);
  const [selectedMood, setSelectedMood] = useState<string | null>(initialMood);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(initialStyle);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(initialIndustry);
  const [selectedSort, setSelectedSort] = useState<'trending' | 'newest'>('trending');

  // Sync props when navigating externally (e.g. from homepage hero tags)
  React.useEffect(() => {
    setQuery(initialQuery);
    setSelectedColor(initialColor);
    setSelectedMood(initialMood);
    setSelectedStyle(initialStyle);
    setSelectedIndustry(initialIndustry);
  }, [initialQuery, initialColor, initialMood, initialStyle, initialIndustry]);

  const filteredResults = useMemo(() => {
    let list = [...CURATED_PALETTES];

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      const hexQ = q.startsWith('#') ? q : `#${q}`;
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q)) ||
          ((p.mood as string[] | undefined) || []).some((m) => m.toLowerCase().includes(q)) ||
          ((p.style as string[] | undefined) || []).some((s) => s.toLowerCase().includes(q)) ||
          p.colors.some(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              c.hex.toLowerCase() === hexQ ||
              c.hex.toLowerCase().includes(q)
          )
      );
    }

    if (selectedColor) {
      const colQ = selectedColor.toLowerCase();
      list = list.filter((p) =>
        (p.tags || []).some((t) => t.toLowerCase().includes(colQ)) ||
        p.category.toLowerCase().includes(colQ)
      );
    }

    if (selectedMood) {
      const moodQ = selectedMood.toLowerCase();
      list = list.filter((p) =>
        (p.tags || []).some((t) => t.toLowerCase().includes(moodQ)) ||
        ((p.mood as string[] | undefined) || []).some((m) => m.toLowerCase().includes(moodQ))
      );
    }

    if (selectedStyle) {
      const styleQ = selectedStyle.toLowerCase();
      list = list.filter((p) =>
        (p.tags || []).some((t) => t.toLowerCase().includes(styleQ)) ||
        ((p.style as string[] | undefined) || []).some((s) => s.toLowerCase().includes(styleQ))
      );
    }

    if (selectedIndustry) {
      const indQ = selectedIndustry.toLowerCase();
      list = list.filter((p) =>
        (p.tags || []).some((t) => t.toLowerCase().includes(indQ)) ||
        ((p.industry as string[] | undefined) || []).some((i) => i.toLowerCase().includes(indQ))
      );
    }

    return list;
  }, [query, selectedColor, selectedMood, selectedStyle, selectedIndustry]);

  const handleClearAll = () => {
    setQuery('');
    setSelectedColor(null);
    setSelectedMood(null);
    setSelectedStyle(null);
    setSelectedIndustry(null);
  };

  return (
    <div className="w-full min-h-screen bg-[var(--kroma-paper)] text-[var(--kroma-ink)] py-5 md:py-6">
      <SEOHead
        rawTitle
        title="Search Color Palettes — KROMA"
        description="Search across the complete KROMA digital archive by colors, moods, styles, or keywords."
        canonicalPath="/search"
      />

      <div className="max-w-[1360px] mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="mb-3.5">
          <div className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-[var(--kroma-muted)] mb-1.5">
            SEARCH KROMA
          </div>
          <h1 className="font-serif text-[34px] md:text-[44px] leading-[1.05] tracking-[-0.025em] text-[var(--kroma-ink)] font-normal">
            What are you looking for?
          </h1>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mb-2.5">
          <div className="h-[40px] bg-[#F8F6EF] border border-[var(--kroma-border)] rounded-[20px] px-3.5 flex items-center gap-2.5">
            <Search size={14} className="text-[var(--kroma-muted)] shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search palettes, colors, moods or styles..."
              className="w-full bg-transparent border-none outline-none font-sans text-[11px] text-[var(--kroma-ink)] placeholder:text-[var(--kroma-muted)]"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-[var(--kroma-muted)] hover:text-[var(--kroma-ink)]">
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Popular Searches */}
        <div className="flex flex-wrap items-center gap-1.5 mb-5">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--kroma-muted)] mr-1">
            POPULAR SEARCHES:
          </span>
          {POPULAR_SEARCHES.map((term) => (
            <button
              key={term}
              onClick={() => setQuery(term)}
              className={`kroma-tag ${query.toLowerCase() === term ? 'bg-[var(--kroma-ink)] text-[var(--kroma-paper)]' : ''}`}
            >
              {term}
            </button>
          ))}
        </div>

        {/* 2-Column Search Layout (Left Sidebar Filters + Right Results) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
          
          {/* Left: Filters Sidebar */}
          <aside className="lg:col-span-3 border-r border-[var(--kroma-border)] pr-5 hidden lg:block">
            <div className="h-[36px] flex items-center justify-between pb-2.5 border-b border-[var(--kroma-border)] mb-3.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--kroma-ink)] font-bold">
                FILTERS
              </span>
              <button
                onClick={handleClearAll}
                className="font-mono text-[9.5px] uppercase tracking-wider text-[var(--kroma-muted)] hover:text-[var(--kroma-ink)] underline"
              >
                Clear all
              </button>
            </div>

            {/* Color Filter */}
            <div className="mb-4">
              <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--kroma-muted)] mb-1.5">
                COLOR
              </div>
              <div className="flex flex-col gap-1.5 text-xs">
                {COLOR_RADIO.map((c) => (
                  <label
                    key={c.name}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <input
                      type="radio"
                      name="color-filter"
                      checked={selectedColor === c.name}
                      onChange={() => setSelectedColor(selectedColor === c.name ? null : c.name)}
                      className="accent-[var(--kroma-ink)] cursor-pointer"
                    />
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.hex }} />
                    <span className="font-sans text-[11px] text-[var(--kroma-ink)]">{c.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Mood Filter */}
            <div className="mb-6">
              <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--kroma-muted)] mb-2">
                MOOD
              </div>
              <div className="flex flex-col gap-1.5 text-xs">
                {MOOD_RADIO.map((m) => (
                  <label
                    key={m}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <input
                      type="radio"
                      name="mood-filter"
                      checked={selectedMood === m}
                      onChange={() => setSelectedMood(selectedMood === m ? null : m)}
                      className="accent-[var(--kroma-ink)] cursor-pointer"
                    />
                    <span className="font-sans text-[11px] text-[var(--kroma-ink)]">{m}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Style Filter */}
            <div className="mb-4">
              <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--kroma-muted)] mb-1.5">
                STYLE
              </div>
              <div className="flex flex-col gap-1.5 text-xs">
                {STYLE_RADIO.map((s) => (
                  <label
                    key={s}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <input
                      type="radio"
                      name="style-filter"
                      checked={selectedStyle === s}
                      onChange={() => setSelectedStyle(selectedStyle === s ? null : s)}
                      className="accent-[var(--kroma-ink)] cursor-pointer"
                    />
                    <span className="font-sans text-[11px] text-[var(--kroma-ink)]">{s}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Industry Filter */}
            <div className="mb-4">
              <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--kroma-muted)] mb-1.5">
                INDUSTRY
              </div>
              <div className="flex flex-col gap-1.5 text-xs">
                {INDUSTRY_RADIO.map((i) => (
                  <label
                    key={i}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <input
                      type="radio"
                      name="industry-filter"
                      checked={selectedIndustry === i}
                      onChange={() => setSelectedIndustry(selectedIndustry === i ? null : i)}
                      className="accent-[var(--kroma-ink)] cursor-pointer"
                    />
                    <span className="font-sans text-[11px] text-[var(--kroma-ink)]">{i}</span>
                  </label>
                ))}
              </div>
            </div>

          </aside>

          {/* Right: Results Grid */}
          <main className="lg:col-span-9">
            <div className="h-[36px] flex items-center justify-between pb-2.5 border-b border-[var(--kroma-border)] mb-3.5">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--kroma-muted)]">
                {filteredResults.length} RESULTS {query ? `FOR "${query}"` : ''}
              </span>
              <div className="flex items-center gap-1 font-mono text-[10px] uppercase text-[var(--kroma-muted)]">
                <span>SORT:</span>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value as any)}
                  className="bg-transparent text-[var(--kroma-ink)] font-sans text-xs outline-none cursor-pointer"
                >
                  <option value="trending">Trending</option>
                  <option value="newest">Curated</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
              {filteredResults.map((palette) => (
                <PaletteCard
                  key={palette.id}
                  palette={palette}
                  onNavigate={onNavigate}
                />
              ))}
            </div>

            {filteredResults.length === 0 && (
              <div className="text-center py-24 border border-[var(--kroma-border)] rounded-[4px] bg-[var(--kroma-card)]">
                <h3 className="font-sans text-xl md:text-2xl font-medium text-[var(--kroma-ink)] mb-2">
                  No matching palettes
                </h3>
                <p className="font-sans text-xs text-[var(--kroma-muted)] mb-6">
                  Try adjusting or clearing your filters.
                </p>
                <button
                  onClick={handleClearAll}
                  className="kroma-btn-primary"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </main>

        </div>

      </div>
    </div>
  );
};
