import React from 'react';
import { RouteType } from '../types';
import { useCreators } from '../context/CreatorContext';
import { CreatorCard } from '../components/CreatorCard';
import { SEOHead } from '../components/seo/SEOHead';
import { PageHeader } from '../components/common/PageHeader';
import { ResultsCountBar } from '../components/common/ResultsCountBar';
import { EmptyState } from '../components/common/EmptyState';

interface CreatorsPageProps {
  onNavigate: (route: RouteType) => void;
}

export const CreatorsPage: React.FC<CreatorsPageProps> = ({ onNavigate }) => {
  const { creators } = useCreators();

  return (
    <div className="catalog-container w-full max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8">
      <SEOHead
        title="Design Systems Architects &amp; Colorists"
        description="Discover leading digital designers, design system engineers, and color specialists creating calibrated palette systems and generative tokens."
        canonicalPath="/creators"
      />

      <PageHeader
        breadcrumbs={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Explore', to: { path: 'explore' } },
          { label: 'Creators', isCurrent: true },
        ]}
        onNavigate={onNavigate}
        sectionLabel="Community ecosystem"
        title="Designers & Colorists"
        description="Explore portfolios of curated palette systems, token architectures, and harmonic specimens."
      />

      <ResultsCountBar
        displayedCount={creators.length}
        totalCount={creators.length}
        itemName="creators"
      />

      {creators.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {creators.map((cr) => (
            <CreatorCard key={cr.id} creator={cr} onNavigate={onNavigate} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No creators found"
          description="Creator portfolios will appear here once registered."
        />
      )}
    </div>
  );
};
