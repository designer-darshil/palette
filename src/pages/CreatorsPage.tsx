import React from 'react';
import { Users, Palette, Layers, Grid } from 'lucide-react';
import { RouteType } from '../types';
import { useCreators } from '../context/CreatorContext';
import { CreatorCard } from '../components/CreatorCard';
import { SEOHead } from '../components/seo/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

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

      <Breadcrumbs
        items={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Explore', to: { path: 'explore' } },
          { label: 'Creators', isCurrent: true },
        ]}
        onNavigate={onNavigate}
      />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-[var(--color-primary)]" />
            <span className="page-category-label">Community Ecosystem</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Designers &amp; Colorists
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
            Explore portfolios of curated palette systems, token architectures, and harmonic specimens.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {creators.map((cr) => (
          <CreatorCard key={cr.id} creator={cr} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
};
