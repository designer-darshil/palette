import React, { useState, useMemo } from 'react';
import { Compass, Sparkles, TrendingUp, Clock, Shuffle, Layers, ArrowRight, Palette, Grid, Heart, Gamepad2 } from 'lucide-react';
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
    <div className="catalog-container w-full max-w-7xl mx-auto flex flex-col gap-10">
      <SEOHead
        title="Explore Color Systems, Palettes &amp; Harmonies"
        description="Discover curated digital color palettes, trending chromatic systems, daily color specimens, patterns, and design collections."
        canonicalPath="/explore"
      />

      {/* Hero Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Explore', isCurrent: true },
        ]}
        onNavigate={onNavigate}
        sectionLabel="Curated spectrum hub"
        title="Explore & Discover Color"
        description="Discover calibrated palettes, color theories, daily specimens, and generative design tokens across curated taxonomies."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<Shuffle size={13} className="text-pink-400" />}
              onClick={() => onNavigate({ path: 'random' })}
              title="Surprise me with a random specimen"
            >
              Random Specimen
            </Button>
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<TrendingUp size={13} className="text-amber-400" />}
              onClick={() => onNavigate({ path: 'trending' })}
            >
              Trending
            </Button>
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<Clock size={13} className="text-emerald-400" />}
              onClick={() => onNavigate({ path: 'new' })}
            >
              New Releases
            </Button>
          </div>
        }
      />

      {/* Daily Specimen Highlights Banner */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Color of the Day Card */}
        <div className="p-4 sm:p-5 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[11px] font-semibold text-[var(--accent-gold)]">
              Color of the day • {dailyColor.dateString}
            </span>
            <Link
              to={{ path: 'color-of-the-day' }}
              onNavigate={onNavigate}
              className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1 font-mono"
            >
              <span>Inspect Specimen</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-sm border border-[var(--border-subtle)] shadow-inner flex-shrink-0"
              style={{ backgroundColor: dailyColor.color.hex }}
            />
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-[var(--text-primary)] truncate">
                {dailyColor.color.name}
              </h3>
              <div className="font-mono text-xs text-[var(--text-secondary)] font-bold">
                {dailyColor.color.hex} • {dailyColor.color.oklch}
              </div>
              <p className="text-xs text-[var(--text-secondary)] line-clamp-1 mt-1">
                {dailyColor.color.description}
              </p>
            </div>
          </div>
        </div>

        {/* Palette of the Day Card */}
        <div className="p-4 sm:p-5 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[11px] font-semibold text-[var(--accent-gold)]">
              Palette of the day • {dailyPalette.dateString}
            </span>
            <Link
              to={{ path: 'palette-of-the-day' }}
              onNavigate={onNavigate}
              className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1 font-mono"
            >
              <span>Full System</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div>
            <div className="h-10 rounded-sm overflow-hidden flex mb-2.5 border border-[var(--border-subtle)]">
              {dailyPalette.palette.colors.map((c, i) => (
                <div key={i} className="flex-1" style={{ backgroundColor: c.hex }} title={c.name} />
              ))}
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">
                {dailyPalette.palette.title}
              </h3>
              <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">
                {dailyPalette.palette.category}
              </span>
            </div>
          </div>
        </div>
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
