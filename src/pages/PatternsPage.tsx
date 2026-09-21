import React, { useState } from 'react';
import { Sliders } from 'lucide-react';
import { RouteType } from '../types';
import { CURATED_PATTERNS } from '../data/patterns';
import { PatternCard } from '../components/PatternCard';
import { SEOHead } from '../components/seo/SEOHead';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { ResultsCountBar } from '../components/common/ResultsCountBar';
import { EmptyState } from '../components/common/EmptyState';

interface PatternsPageProps {
  onNavigate: (route: RouteType) => void;
}

export const PatternsPage: React.FC<PatternsPageProps> = ({ onNavigate }) => {
  const [activeType, setActiveType] = useState<string>('all');

  const filteredPatterns = activeType === 'all'
    ? CURATED_PATTERNS
    : CURATED_PATTERNS.filter((p) => p.type === activeType);

  return (
    <div className="catalog-container w-full max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8">
      <SEOHead
        title="Generative Pattern Library &amp; Vector Surfaces"
        description="Explore vector patterns and seamless background textures generated from calibrated color palettes. Export SVG, PNG, and CSS."
        canonicalPath="/patterns"
      />

      <PageHeader
        breadcrumbs={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Explore', to: { path: 'explore' } },
          { label: 'Patterns', isCurrent: true },
        ]}
        onNavigate={onNavigate}
        sectionLabel="Vector surface library"
        title="Generative Patterns & Textures"
        description="Mathematical surface textures, geometric tessellations, and dot arrays driven by palette coordinates."
        actions={
          <Button
            variant="primary"
            size="sm"
            iconLeft={<Sliders size={14} />}
            onClick={() => onNavigate({ path: 'pattern-studio' })}
          >
            Launch Pattern Studio
          </Button>
        }
      />

      {/* Pattern Type Filter Pills */}
      <div className="filter-pills flex flex-wrap gap-1.5">
        {(['all', 'dots', 'grid', 'stripes', 'waves', 'geometry', 'lines', 'shapes'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`filter-pill text-xs px-3 py-1.5 ${activeType === t ? 'active' : ''}`}
          >
            {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <ResultsCountBar
        displayedCount={filteredPatterns.length}
        totalCount={CURATED_PATTERNS.length}
        itemName="patterns"
      />

      {/* Grid of Patterns */}
      {filteredPatterns.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatterns.map((pat) => (
            <PatternCard key={pat.id} pattern={pat} onNavigate={onNavigate} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No patterns found"
          description="No pattern specimens match the selected filter category."
          actionLabel="Show All Patterns"
          onAction={() => setActiveType('all')}
        />
      )}
    </div>
  );
};
