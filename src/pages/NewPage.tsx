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
import { Breadcrumbs } from '../components/common/Breadcrumbs';

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

      <Breadcrumbs
        items={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Explore', to: { path: 'explore' } },
          { label: 'New Releases', isCurrent: true },
        ]}
        onNavigate={onNavigate}
      />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-emerald-400" />
            <span className="page-category-label">Chronological Index</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            New Releases
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
            Recently formulated and published chromatic systems, design tokens, and collections.
          </p>
        </div>

        {/* Tabs */}
        <div className="filter-pills flex flex-wrap gap-1.5">
          <button
            className={`filter-pill text-xs px-3 py-1.5 ${activeTab === 'palettes' ? 'active' : ''}`}
            onClick={() => setActiveTab('palettes')}
          >
            Palettes ({newestPalettes.length})
          </button>
          <button
            className={`filter-pill text-xs px-3 py-1.5 ${activeTab === 'colors' ? 'active' : ''}`}
            onClick={() => setActiveTab('colors')}
          >
            Colors ({newestColors.length})
          </button>
          <button
            className={`filter-pill text-xs px-3 py-1.5 ${activeTab === 'gradients' ? 'active' : ''}`}
            onClick={() => setActiveTab('gradients')}
          >
            Gradients ({newestGradients.length})
          </button>
          <button
            className={`filter-pill text-xs px-3 py-1.5 ${activeTab === 'collections' ? 'active' : ''}`}
            onClick={() => setActiveTab('collections')}
          >
            Collections ({newestCollections.length})
          </button>
        </div>
      </div>

      {activeTab === 'palettes' && (
        <div className="specimen-grid-palettes">
          {newestPalettes.map((p) => (
            <PaletteCard key={p.id} palette={p} onNavigate={onNavigate} />
          ))}
        </div>
      )}

      {activeTab === 'colors' && (
        <div className="specimen-grid-colors">
          {newestColors.slice(0, 48).map((c) => (
            <ColorCard key={c.id} color={c} onNavigate={onNavigate} />
          ))}
        </div>
      )}

      {activeTab === 'gradients' && (
        <div className="specimen-grid-gradients">
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
