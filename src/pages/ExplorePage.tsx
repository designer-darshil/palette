import React, { useState, useMemo } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { RouteType } from '../types';
import { CURATED_PALETTES } from '../data/palettes';
import { PaletteCard } from '../components/PaletteCard';
import { SEOHead } from '../components/seo/SEOHead';
import { generateWebSiteSchema } from '../utils/schemaGenerator';

interface ExplorePageProps {
  onNavigate: (route: RouteType) => void;
  initialMood?: string;
  initialColor?: string;
  initialStyle?: string;
  initialIndustry?: string;
  initialQuery?: string;
  initialSort?: 'trending' | 'newest' | 'name';
}

const POPULAR_SEARCHES = [
  'blue',
  'minimal',
  'warm',
  'nature',
  'fashion',
  'retro',
  'editorial',
];

const COLOR_OPTIONS = ['all', 'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Pink', 'Neutral'];
const MOOD_OPTIONS = ['all', 'Calm', 'Energetic', 'Elegant', 'Dark', 'Playful', 'Minimal', 'Warm', 'Sophisticated'];
const STYLE_OPTIONS = ['all', 'Editorial', 'Retro', 'Modern', 'Luxury', 'Organic', 'Futuristic'];
const INDUSTRY_OPTIONS = ['all', 'Fashion', 'Branding', 'UI/UX', 'Architecture', 'Food', 'Beauty', 'Technology'];

export const ExplorePage: React.FC<ExplorePageProps> = ({
  onNavigate,
  initialMood = 'all',
  initialColor = 'all',
  initialStyle = 'all',
  initialIndustry = 'all',
  initialQuery = '',
  initialSort = 'trending',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedSort, setSelectedSort] = useState<'trending' | 'newest' | 'name'>(initialSort);
  const [selectedColor, setSelectedColor] = useState<string>(initialColor);
  const [selectedMood, setSelectedMood] = useState<string>(initialMood);
  const [selectedStyle, setSelectedStyle] = useState<string>(initialStyle);
  const [selectedIndustry, setSelectedIndustry] = useState<string>(initialIndustry);

  React.useEffect(() => {
    setSearchQuery(initialQuery);
    setSelectedColor(initialColor);
    setSelectedMood(initialMood);
    setSelectedStyle(initialStyle);
    setSelectedIndustry(initialIndustry);
    if (initialSort) setSelectedSort(initialSort);
  }, [initialQuery, initialColor, initialMood, initialStyle, initialIndustry, initialSort]);

  const filteredPalettes = useMemo(() => {
    let list = [...CURATED_PALETTES];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
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

    if (selectedColor !== 'all') {
      const colQ = selectedColor.toLowerCase();
      list = list.filter((p) =>
        (p.tags || []).some((t) => t.toLowerCase().includes(colQ)) ||
        p.category.toLowerCase().includes(colQ)
      );
    }

    if (selectedMood !== 'all') {
      const moodQ = selectedMood.toLowerCase();
      list = list.filter((p) =>
        (p.tags || []).some((t) => t.toLowerCase().includes(moodQ)) ||
        ((p.mood as string[] | undefined) || []).some((m) => m.toLowerCase().includes(moodQ))
      );
    }

    if (selectedStyle !== 'all') {
      const styleQ = selectedStyle.toLowerCase();
      list = list.filter((p) =>
        (p.tags || []).some((t) => t.toLowerCase().includes(styleQ)) ||
        ((p.style as string[] | undefined) || []).some((s) => s.toLowerCase().includes(styleQ)) ||
        p.category.toLowerCase().includes(styleQ)
      );
    }

    if (selectedIndustry !== 'all') {
      const indQ = selectedIndustry.toLowerCase();
      list = list.filter((p) =>
        (p.tags || []).some((t) => t.toLowerCase().includes(indQ)) ||
        ((p.industry as string[] | undefined) || []).some((i) => i.toLowerCase().includes(indQ))
      );
    }

    if (selectedSort === 'name') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [searchQuery, selectedColor, selectedMood, selectedStyle, selectedIndustry, selectedSort]);

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedColor !== 'all' ||
    selectedMood !== 'all' ||
    selectedStyle !== 'all' ||
    selectedIndustry !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedColor('all');
    setSelectedMood('all');
    setSelectedStyle('all');
    setSelectedIndustry('all');
  };

  return (
    <div className="w-full min-h-screen bg-[var(--kroma-paper)] text-[var(--kroma-ink)] py-5 md:py-6">
      <SEOHead
        rawTitle
        title="Explore Color Palettes — KROMA"
        description="Browse the complete KROMA digital archive of curated color palettes, editorial systems, and architectural tones."
        canonicalPath="/explore"
        jsonLd={generateWebSiteSchema()}
      />

      <div className="max-w-[1360px] mx-auto px-4 md:px-8">
        
        {/* Page Header */}
        <div className="mb-3.5">
          <div className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-[var(--kroma-muted)] mb-1.5">
            EXPLORE
          </div>
          <h1 className="font-serif text-[34px] md:text-[44px] leading-[1.05] tracking-[-0.025em] text-[var(--kroma-ink)] font-normal">
            Find your palette.
          </h1>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mb-2.5">
          <div className="h-[40px] bg-[#F8F6EF] border border-[var(--kroma-border)] rounded-[20px] px-3.5 flex items-center gap-2.5">
            <Search size={14} className="text-[var(--kroma-muted)] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search palettes, colors, moods or styles..."
              className="w-full bg-transparent border-none outline-none font-sans text-[11px] text-[var(--kroma-ink)] placeholder:text-[var(--kroma-muted)]"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-[var(--kroma-muted)] hover:text-[var(--kroma-ink)]">
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Popular Searches */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--kroma-muted)] mr-1">
            TRENDING SEARCHES:
          </span>
          {POPULAR_SEARCHES.map((term) => (
            <button
              key={term}
              onClick={() => setSearchQuery(term)}
              className={`kroma-tag ${searchQuery.toLowerCase() === term ? 'bg-[var(--kroma-ink)] text-[var(--kroma-paper)]' : ''}`}
            >
              {term}
            </button>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 py-2.5 border-y border-[var(--kroma-border)] mb-4 text-xs">
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Sort */}
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-[var(--kroma-muted)]">
              <span>SORT:</span>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value as any)}
                className="bg-transparent text-[var(--kroma-ink)] font-sans text-xs outline-none cursor-pointer"
              >
                <option value="trending">Trending</option>
                <option value="newest">Curated</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>

            {/* Color Filter */}
            <div className="flex items-center gap-1 font-mono text-[10px] uppercase text-[var(--kroma-muted)]">
              <span>COLOR:</span>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="bg-transparent text-[var(--kroma-ink)] font-sans text-xs outline-none cursor-pointer"
              >
                {COLOR_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c === 'all' ? 'All Colors' : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Mood Filter */}
            <div className="flex items-center gap-1 font-mono text-[10px] uppercase text-[var(--kroma-muted)]">
              <span>MOOD:</span>
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                className="bg-transparent text-[var(--kroma-ink)] font-sans text-xs outline-none cursor-pointer"
              >
                {MOOD_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m === 'all' ? 'All Moods' : m}
                  </option>
                ))}
              </select>
            </div>

            {/* Style Filter */}
            <div className="flex items-center gap-1 font-mono text-[10px] uppercase text-[var(--kroma-muted)]">
              <span>STYLE:</span>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="bg-transparent text-[var(--kroma-ink)] font-sans text-xs outline-none cursor-pointer"
              >
                {STYLE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s === 'all' ? 'All Styles' : s}
                  </option>
                ))}
              </select>
            </div>

            {/* Industry Filter */}
            <div className="flex items-center gap-1 font-mono text-[10px] uppercase text-[var(--kroma-muted)]">
              <span>INDUSTRY:</span>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="bg-transparent text-[var(--kroma-ink)] font-sans text-xs outline-none cursor-pointer"
              >
                {INDUSTRY_OPTIONS.map((i) => (
                  <option key={i} value={i}>
                    {i === 'all' ? 'All Industries' : i}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-[10px] uppercase text-[var(--kroma-muted)]">
            <span>{filteredPalettes.length} SPECIMENS</span>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="underline hover:text-[var(--kroma-ink)] transition-colors"
              >
                Reset
              </button>
            )}
          </div>

        </div>

        {/* 4-Column Palette Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {filteredPalettes.map((palette) => (
            <PaletteCard
              key={palette.id}
              palette={palette}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        {filteredPalettes.length === 0 && (
          <div className="text-center py-24 border border-[var(--kroma-border)] rounded-[4px] bg-[var(--kroma-card)] my-6">
            <h3 className="font-sans text-xl md:text-2xl font-medium text-[var(--kroma-ink)] mb-2">
              No matching palettes found
            </h3>
            <p className="font-sans text-xs text-[var(--kroma-muted)] mb-6">
              Try adjusting your search criteria or reset filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="kroma-btn-primary"
            >
              Reset all filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
