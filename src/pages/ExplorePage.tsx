import React, { useState, useMemo } from 'react';
import { Compass, Sparkles, TrendingUp, Clock, Shuffle, Layers, ArrowRight, Palette, Grid, Heart, Gamepad2, Search, Wand2 } from 'lucide-react';
import { RouteType } from '../types';
import { useLibraryData } from '../context/LibraryDataContext';
import { useCollections } from '../context/CollectionContext';
import { useCreators } from '../context/CreatorContext';
import { CURATED_PATTERNS } from '../data/patterns';
import { PaletteCard } from '../components/PaletteCard';
import { ColorCard } from '../components/ColorCard';
import { CollectionCard } from '../components/CollectionCard';
import { CreatorCard } from '../components/CreatorCard';
import { PatternCard } from '../components/PatternCard';
import { FilterBar, FilterState } from '../components/FilterBar';
import { getColorOfTheDay, getPaletteOfTheDay } from '../utils/dailyEngine';
import { sortTrendingPalettes, sortNewestPalettes } from '../utils/rankingEngine';
import { USE_CASES, MOODS, VISUAL_CHARACTERS, SEASONS } from '../utils/taxonomy';
import { SEOHead } from '../components/seo/SEOHead';
import { Link } from '../components/common/Link';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';

interface ExplorePageProps {
  onNavigate: (route: RouteType) => void;
  initialMood?: string;
  initialUseCase?: string;
  initialCharacter?: string;
  initialSeason?: string;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  onNavigate,
  initialMood,
  initialUseCase,
  initialCharacter,
  initialSeason,
}) => {
  const { palettes, colors } = useLibraryData();
  const { collections } = useCollections();
  const { creators } = useCreators();

  const [filters, setFilters] = useState<FilterState>({
    category: initialUseCase,
    mood: initialMood,
    character: initialCharacter,
    season: initialSeason,
    sortBy: 'trending',
  });

  const dailyColor = useMemo(() => getColorOfTheDay(new Date(), colors), [colors]);
  const dailyPalette = useMemo(() => getPaletteOfTheDay(new Date(), palettes), [palettes]);

  const allCategories = useMemo(() => {
    return Array.from(new Set(palettes.map((p) => p.category))).sort();
  }, [palettes]);

  // Filtered palettes
  const filteredPalettes = useMemo(() => {
    let list = [...palettes];

    if (filters.category) {
      list = list.filter((p) => p.category.toLowerCase() === filters.category!.toLowerCase());
    }

    if (filters.mood) {
      const moodTag = filters.mood.toLowerCase();
      list = list.filter((p) => (p.tags || []).some((t) => t.toLowerCase().includes(moodTag)));
    }

    if (filters.character) {
      const charTag = filters.character.toLowerCase();
      list = list.filter((p) => (p.tags || []).some((t) => t.toLowerCase().includes(charTag)));
    }

    if (filters.season) {
      const seasonTag = filters.season.toLowerCase();
      list = list.filter((p) => (p.tags || []).some((t) => t.toLowerCase().includes(seasonTag)));
    }

    if (filters.sortBy === 'newest') {
      return sortNewestPalettes(list);
    }
    return sortTrendingPalettes(list);
  }, [palettes, filters]);

  const trendingPalettes = useMemo(() => sortTrendingPalettes(palettes).slice(0, 4), [palettes]);
  const newPalettes = useMemo(() => sortNewestPalettes(palettes).slice(0, 4), [palettes]);

  return (
    <div className="kroma-page">
      <SEOHead
        title="Explore Color Systems, Palettes & Harmonies | KROMA"
        description="Discover curated digital color palettes, trending chromatic systems, daily color specimens, patterns, and design collections."
        canonicalPath="/explore"
      />

      {/* Editorial Studio Hero */}
      <header className="kroma-hero">
        <div className="kroma-label">SPECTRUM HUB</div>
        <h1 className="kroma-headline">EXPLORE & DISCOVER.</h1>
        <p className="kroma-lead">
          Calibrated palettes, living chromatic systems, daily specimens, and generative design tokens curated for modern interfaces.
        </p>
      </header>

      {/* Daily Specimen Highlights Banner */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {/* Color of the Day Card */}
        <div className="p-6 bg-white dark:bg-[#15171C] border border-neutral-200 dark:border-neutral-800 rounded-sm flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[11px] font-semibold tracking-wider uppercase text-neutral-400">
              COLOR OF THE DAY • {dailyColor.dateString}
            </span>
            <Link
              to={{ path: 'color-of-the-day' }}
              onNavigate={onNavigate}
              className="text-xs text-neutral-900 dark:text-neutral-100 font-semibold hover:underline flex items-center gap-1 font-sans uppercase tracking-wider"
            >
              <span>INSPECT ↗</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-sm border border-black/5 shadow-inner flex-shrink-0"
              style={{ backgroundColor: dailyColor.color.hex }}
            />
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight truncate">
                {dailyColor.color.name}
              </h3>
              <div className="font-mono text-xs text-neutral-500 font-bold">
                {dailyColor.color.hex} • {dailyColor.color.oklch}
              </div>
              <p className="text-xs text-neutral-500 line-clamp-1 mt-1 font-sans">
                {dailyColor.color.description}
              </p>
            </div>
          </div>
        </div>

        {/* Palette of the Day Card */}
        <div className="p-6 bg-white dark:bg-[#15171C] border border-neutral-200 dark:border-neutral-800 rounded-sm flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[11px] font-semibold tracking-wider uppercase text-neutral-400">
              PALETTE OF THE DAY • {dailyPalette.dateString}
            </span>
            <Link
              to={{ path: 'palette-of-the-day' }}
              onNavigate={onNavigate}
              className="text-xs text-neutral-900 dark:text-neutral-100 font-semibold hover:underline flex items-center gap-1 font-sans uppercase tracking-wider"
            >
              <span>FULL SYSTEM ↗</span>
            </Link>
          </div>

          <div>
            <div className="h-12 rounded-sm overflow-hidden flex mb-3 border border-black/5">
              {dailyPalette.palette.colors.map((c, i) => (
                <div key={i} className="flex-1" style={{ backgroundColor: c.hex }} title={c.name} />
              ))}
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                {dailyPalette.palette.title}
              </h3>
              <span className="text-[10px] font-mono text-neutral-400 uppercase">
                {dailyPalette.palette.category}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Discovery Channels */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to={{ path: 'combos' }}
          onNavigate={onNavigate}
          className="group p-3.5 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md hover:border-[var(--border-strong)] hover:shadow-sm transition-all flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Wand2 size={16} />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors truncate">
              Harmonies &amp; Combos
            </div>
            <div className="text-[10px] text-[var(--text-tertiary)] font-mono truncate">
              Curated Pairs &amp; Triads
            </div>
          </div>
        </Link>

        <Link
          to={{ path: 'gradients' }}
          onNavigate={onNavigate}
          className="group p-3.5 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md hover:border-[var(--border-strong)] hover:shadow-sm transition-all flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Sparkles size={16} />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors truncate">
              CSS Gradients
            </div>
            <div className="text-[10px] text-[var(--text-tertiary)] font-mono truncate">
              Multi-stop blends
            </div>
          </div>
        </Link>

        <Link
          to={{ path: 'color-name-finder' }}
          onNavigate={onNavigate}
          className="group p-3.5 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md hover:border-[var(--border-strong)] hover:shadow-sm transition-all flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded bg-teal-500/10 text-teal-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Search size={16} />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors truncate">
              Name Finder
            </div>
            <div className="text-[10px] text-[var(--text-tertiary)] font-mono truncate">
              44,000+ pigments
            </div>
          </div>
        </Link>

        <Link
          to={{ path: 'play' }}
          onNavigate={onNavigate}
          className="group p-3.5 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md hover:border-[var(--border-strong)] hover:shadow-sm transition-all flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Gamepad2 size={16} />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors truncate">
              Color Games
            </div>
            <div className="text-[10px] text-[var(--text-tertiary)] font-mono truncate">
              Hexle &amp; Acuity
            </div>
          </div>
        </Link>
      </section>

      {/* Filter and Explore Results Section */}
      <section className="flex flex-col gap-4">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          categoriesList={allCategories}
          totalResults={filteredPalettes.length}
        />

        <div className="specimen-grid-palettes">
          {filteredPalettes.slice(0, 8).map((palette) => (
            <PaletteCard key={palette.id} palette={palette} onNavigate={onNavigate} />
          ))}
        </div>

        {filteredPalettes.length === 0 && (
          <EmptyState
            title="No palettes match your criteria"
            description="Try changing your mood, character, or category filters to broaden the specimen selection."
            actionLabel="Reset Filters"
            onAction={() =>
              setFilters({
                category: undefined,
                mood: undefined,
                character: undefined,
                season: undefined,
                sortBy: 'trending',
              })
            }
          />
        )}
      </section>

      {/* Curated Collections Section */}
      <section className="flex flex-col gap-4 pt-4 border-t border-[var(--border-subtle)]">
        <div className="flex items-center justify-between">
          <div>
            <span className="page-category-label">Curator Workspaces</span>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Curated Collections
            </h2>
          </div>
          <Link
            to={{ path: 'collections' }}
            onNavigate={onNavigate}
            className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1 font-mono"
          >
            <span>All Collections ({collections.length})</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {collections.slice(0, 4).map((col) => (
            <CollectionCard key={col.id} collection={col} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* Generative Pattern Section Doorway */}
      <section className="flex flex-col gap-4 pt-4 border-t border-[var(--border-subtle)]">
        <div className="flex items-center justify-between">
          <div>
            <span className="page-category-label">Vector Surface Studio</span>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Palette Patterns &amp; Textures
            </h2>
          </div>
          <Link
            to={{ path: 'patterns' }}
            onNavigate={onNavigate}
            className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1 font-mono"
          >
            <span>Pattern Gallery ({CURATED_PATTERNS.length})</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CURATED_PATTERNS.slice(0, 3).map((pat) => (
            <PatternCard key={pat.id} pattern={pat} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* Featured Creators Section */}
      <section className="flex flex-col gap-4 pt-4 border-t border-[var(--border-subtle)]">
        <div className="flex items-center justify-between">
          <div>
            <span className="page-category-label">Community &amp; Portfolios</span>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Design Systems Architects &amp; Colorists
            </h2>
          </div>
          <Link
            to={{ path: 'creators' }}
            onNavigate={onNavigate}
            className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1 font-mono"
          >
            <span>All Creators ({creators.length})</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {creators.slice(0, 4).map((cr) => (
            <CreatorCard key={cr.id} creator={cr} onNavigate={onNavigate} />
          ))}
        </div>
      </section>
    </div>
  );
};
