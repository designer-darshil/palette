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
import { PageHeader } from '../components/common/PageHeader';
import { ResultsCountBar } from '../components/common/ResultsCountBar';
import { KromaButton } from '../components/common/KromaButton';

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

      <PageHeader
        breadcrumbs={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Explore', to: { path: 'explore' } },
          { label: 'Trending', isCurrent: true },
        ]}
        onNavigate={onNavigate}
        sectionLabel="High velocity spectrum"
        title="Trending in PaletteParadise"
        description="Ranked by creator saves, active token exports, remixes, and community engagement."
        actions={
          <div className="filter-pills flex flex-wrap gap-1.5">
            <KromaButton
              size="sm"
              variant={activeTab === 'palettes' ? 'filled' : 'ghost'}
              className={`filter-pill text-xs px-3 py-1.5 ${activeTab === 'palettes' ? 'active' : ''}`}
              onClick={() => setActiveTab('palettes')}
            >
              Palettes ({trendingPalettes.length})
            </KromaButton>
            <KromaButton
              size="sm"
              variant={activeTab === 'colors' ? 'filled' : 'ghost'}
              className={`filter-pill text-xs px-3 py-1.5 ${activeTab === 'colors' ? 'active' : ''}`}
              onClick={() => setActiveTab('colors')}
            >
              Colors ({trendingColors.length})
            </KromaButton>
            <KromaButton
              size="sm"
              variant={activeTab === 'gradients' ? 'filled' : 'ghost'}
              className={`filter-pill text-xs px-3 py-1.5 ${activeTab === 'gradients' ? 'active' : ''}`}
              onClick={() => setActiveTab('gradients')}
            >
              Gradients ({gradients.length})
            </KromaButton>
            <KromaButton
              size="sm"
              variant={activeTab === 'collections' ? 'filled' : 'ghost'}
              className={`filter-pill text-xs px-3 py-1.5 ${activeTab === 'collections' ? 'active' : ''}`}
              onClick={() => setActiveTab('collections')}
            >
              Collections ({trendingCollections.length})
            </KromaButton>
            <KromaButton
              size="sm"
              variant={activeTab === 'creators' ? 'filled' : 'ghost'}
              className={`filter-pill text-xs px-3 py-1.5 ${activeTab === 'creators' ? 'active' : ''}`}
              onClick={() => setActiveTab('creators')}
            >
              Creators ({trendingCreators.length})
            </KromaButton>
          </div>
        }
      />

      <ResultsCountBar
        displayedCount={
          activeTab === 'palettes'
            ? trendingPalettes.length
            : activeTab === 'colors'
            ? trendingColors.length
            : activeTab === 'gradients'
            ? gradients.length
            : activeTab === 'collections'
            ? trendingCollections.length
            : trendingCreators.length
        }
        totalCount={
          activeTab === 'palettes'
            ? trendingPalettes.length
            : activeTab === 'colors'
            ? trendingColors.length
            : activeTab === 'gradients'
            ? gradients.length
            : activeTab === 'collections'
            ? trendingCollections.length
            : trendingCreators.length
        }
        itemName={activeTab}
      />

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
