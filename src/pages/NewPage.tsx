import React, { useState, useMemo } from 'react';
import { Clock, Palette, Sparkles, Layers, Grid } from 'lucide-react';
import { RouteType } from '../types';
import { useLibraryData } from '../context/LibraryDataContext';
import { useCollections } from '../context/CollectionContext';
import { useCreators } from '../context/CreatorContext';
import { PaletteCard } from '../components/PaletteCard';
import { ColorCard } from '../components/ColorCard';
import { GradientCard } from '../components/GradientCard';
import { CollectionCard } from '../components/CollectionCard';
import { CreatorCard } from '../components/CreatorCard';
import { sortNewestPalettes } from '../utils/rankingEngine';
import { SEOHead } from '../components/seo/SEOHead';
import { PageHeader } from '../components/common/PageHeader';
import { ResultsCountBar } from '../components/common/ResultsCountBar';
import { KromaButton } from '../components/common/KromaButton';

interface NewPageProps {
  onNavigate: (route: RouteType) => void;
  initialTab?: 'palettes' | 'colors' | 'gradients' | 'collections' | 'creators';
}

export const NewPage: React.FC<NewPageProps> = ({ onNavigate, initialTab = 'palettes' }) => {
  const [activeTab, setActiveTab] = useState<'palettes' | 'colors' | 'gradients' | 'collections' | 'creators'>(initialTab);
  const { palettes, colors, gradients } = useLibraryData();
  const { collections } = useCollections();
  const { creators } = useCreators();

  const newestPalettes = useMemo(() => sortNewestPalettes(palettes), [palettes]);
  const newestColors = useMemo(() => [...colors].reverse(), [colors]);
  const newestGradients = useMemo(() => [...gradients].reverse(), [gradients]);
  const newestCollections = useMemo(
    () => [...collections].sort((a, b) => b.createdAt - a.createdAt),
    [collections]
  );

  return (
    <div className="catalog-container w-full max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8">
      <SEOHead
        title="Newly Added Color Palettes &amp; Specimens"
        description="Explore recently published palettes, newly catalogued pigment colors, gradient additions, and creator collections."
        canonicalPath="/new"
      />

      <PageHeader
        breadcrumbs={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Explore', to: { path: 'explore' } },
          { label: 'New Releases', isCurrent: true },
        ]}
        onNavigate={onNavigate}
        sectionLabel="Chronological index"
        title="New Releases"
        description="Recently formulated and published chromatic systems, design tokens, and collections."
        actions={
          <div className="flex flex-wrap gap-1.5">
            <KromaButton
              size="sm"
              variant={activeTab === 'palettes' ? 'filled' : 'ghost'}
              className={`text-xs px-3 py-1.5 ${activeTab === 'palettes' ? 'active' : ''}`}
              onClick={() => setActiveTab('palettes')}
            >
              Palettes ({newestPalettes.length})
            </KromaButton>
            <KromaButton
              size="sm"
              variant={activeTab === 'colors' ? 'filled' : 'ghost'}
              className={`text-xs px-3 py-1.5 ${activeTab === 'colors' ? 'active' : ''}`}
              onClick={() => setActiveTab('colors')}
            >
              Colors ({newestColors.length})
            </KromaButton>
            <KromaButton
              size="sm"
              variant={activeTab === 'gradients' ? 'filled' : 'ghost'}
              className={`text-xs px-3 py-1.5 ${activeTab === 'gradients' ? 'active' : ''}`}
              onClick={() => setActiveTab('gradients')}
            >
              Gradients ({newestGradients.length})
            </KromaButton>
            <KromaButton
              size="sm"
              variant={activeTab === 'collections' ? 'filled' : 'ghost'}
              className={`text-xs px-3 py-1.5 ${activeTab === 'collections' ? 'active' : ''}`}
              onClick={() => setActiveTab('collections')}
            >
              Collections ({newestCollections.length})
            </KromaButton>
          </div>
        }
      />

      <ResultsCountBar
        displayedCount={
          activeTab === 'palettes'
            ? newestPalettes.length
            : activeTab === 'colors'
            ? newestColors.length
            : activeTab === 'gradients'
            ? newestGradients.length
            : newestCollections.length
        }
        totalCount={
          activeTab === 'palettes'
            ? newestPalettes.length
            : activeTab === 'colors'
            ? newestColors.length
            : activeTab === 'gradients'
            ? newestGradients.length
            : newestCollections.length
        }
        itemName={activeTab}
      />

      {activeTab === 'palettes' && (
        <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-4 sm:gap-6">
          {newestPalettes.map((p) => (
            <PaletteCard key={p.id} palette={p} onNavigate={onNavigate} />
          ))}
        </div>
      )}

      {activeTab === 'colors' && (
        <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 sm:gap-5">
          {newestColors.slice(0, 48).map((c) => (
            <ColorCard key={c.id} color={c} onNavigate={onNavigate} />
          ))}
        </div>
      )}

      {activeTab === 'gradients' && (
        <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-4 sm:gap-6">
          {newestGradients.slice(0, 24).map((g) => (
            <GradientCard key={g.id} gradient={g} onNavigate={onNavigate} />
          ))}
        </div>
      )}

      {activeTab === 'collections' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {newestCollections.map((col) => (
            <CollectionCard key={col.id} collection={col} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
};
