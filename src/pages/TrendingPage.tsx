import React, { useState, useMemo } from 'react';
import { TrendingUp, Palette, Flame, Layers, Sparkles, Grid } from 'lucide-react';
import { RouteType } from '../types';
import { useLibraryData } from '../context/LibraryDataContext';
import { useCollections } from '../context/CollectionContext';
import { useCreators } from '../context/CreatorContext';
import { CURATED_PATTERNS } from '../data/patterns';
import { PaletteCard } from '../components/PaletteCard';
import { ColorCard } from '../components/ColorCard';
import { GradientCard } from '../components/GradientCard';
import { CollectionCard } from '../components/CollectionCard';
import { CreatorCard } from '../components/CreatorCard';
import { sortTrendingPalettes, sortTrendingColors, sortTrendingCollections, sortTrendingCreators } from '../utils/rankingEngine';
import { SEOHead } from '../components/seo/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

interface TrendingPageProps {
  onNavigate: (route: RouteType) => void;
  initialTab?: 'palettes' | 'colors' | 'gradients' | 'collections' | 'creators';
}

export const TrendingPage: React.FC<TrendingPageProps> = ({ onNavigate, initialTab = 'palettes' }) => {
  const [activeTab, setActiveTab] = useState<'palettes' | 'colors' | 'gradients' | 'collections' | 'creators'>(initialTab);
  const { palettes, colors, gradients } = useLibraryData();
  const { collections } = useCollections();
  const { creators } = useCreators();

  const trendingPalettes = useMemo(() => sortTrendingPalettes(palettes), [palettes]);
  const trendingColors = useMemo(() => sortTrendingColors(colors), [colors]);
  const trendingCollections = useMemo(() => sortTrendingCollections(collections), [collections]);
  const trendingCreators = useMemo(() => sortTrendingCreators(creators), [creators]);

  return (
    <div className="catalog-container w-full max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8">
      <SEOHead
        title="Trending Color Palettes &amp; Specimens"
        description="Discover currently trending color palettes, popular design tokens, trending creator portfolios, and saved collections."
        canonicalPath="/trending"
      />

      <Breadcrumbs
        items={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Explore', to: { path: 'explore' } },
          { label: 'Trending', isCurrent: true },
        ]}
        onNavigate={onNavigate}
      />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-amber-400" />
            <span className="page-category-label">High Velocity Spectrum</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Trending in PaletteParadise
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
            Ranked by creator saves, active token exports, remixes, and community engagement.
          </p>
        </div>

        {/* Content Type Filter Pills */}
        <div className="filter-pills flex flex-wrap gap-1.5">
          <button
            className={`filter-pill text-xs px-3 py-1.5 ${activeTab === 'palettes' ? 'active' : ''}`}
            onClick={() => setActiveTab('palettes')}
          >
            Palettes ({trendingPalettes.length})
          </button>
          <button
            className={`filter-pill text-xs px-3 py-1.5 ${activeTab === 'colors' ? 'active' : ''}`}
            onClick={() => setActiveTab('colors')}
          >
            Colors ({trendingColors.length})
          </button>
          <button
            className={`filter-pill text-xs px-3 py-1.5 ${activeTab === 'gradients' ? 'active' : ''}`}
            onClick={() => setActiveTab('gradients')}
          >
            Gradients ({gradients.length})
          </button>
          <button
            className={`filter-pill text-xs px-3 py-1.5 ${activeTab === 'collections' ? 'active' : ''}`}
            onClick={() => setActiveTab('collections')}
          >
            Collections ({trendingCollections.length})
          </button>
          <button
            className={`filter-pill text-xs px-3 py-1.5 ${activeTab === 'creators' ? 'active' : ''}`}
            onClick={() => setActiveTab('creators')}
          >
            Creators ({trendingCreators.length})
          </button>
        </div>
      </div>

      {/* Render Active Tab Content */}
      {activeTab === 'palettes' && (
        <div className="specimen-grid-palettes">
          {trendingPalettes.map((p) => (
            <PaletteCard key={p.id} palette={p} onNavigate={onNavigate} />
          ))}
        </div>
      )}

      {activeTab === 'colors' && (
        <div className="specimen-grid-colors">
          {trendingColors.slice(0, 48).map((c) => (
            <ColorCard key={c.id} color={c} onNavigate={onNavigate} />
          ))}
        </div>
      )}

      {activeTab === 'gradients' && (
        <div className="specimen-grid-gradients">
          {gradients.slice(0, 24).map((g) => (
            <GradientCard key={g.id} gradient={g} onNavigate={onNavigate} />
          ))}
        </div>
      )}

      {activeTab === 'collections' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trendingCollections.map((col) => (
            <CollectionCard key={col.id} collection={col} onNavigate={onNavigate} />
          ))}
        </div>
      )}

      {activeTab === 'creators' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trendingCreators.map((cr) => (
            <CreatorCard key={cr.id} creator={cr} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
};
