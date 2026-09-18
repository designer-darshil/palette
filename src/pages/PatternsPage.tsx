import React, { useState } from 'react';
import { Grid, Sliders, Sparkles, Plus } from 'lucide-react';
import { RouteType } from '../types';
import { CURATED_PATTERNS } from '../data/patterns';
import { PatternCard } from '../components/PatternCard';
import { SEOHead } from '../components/seo/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Link } from '../components/common/Link';

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

      <Breadcrumbs
        items={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Explore', to: { path: 'explore' } },
          { label: 'Patterns', isCurrent: true },
        ]}
        onNavigate={onNavigate}
      />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Grid size={16} className="text-[var(--color-primary)]" />
            <span className="page-category-label">Vector Surface Library</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Generative Patterns &amp; Textures
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
            Mathematical surface textures, geometric tessellations, and dot arrays driven by palette coordinates.
          </p>
        </div>

        <Link
          to={{ path: 'pattern-studio' }}
          onNavigate={onNavigate}
          className="btn-primary text-xs px-4 py-2.5 flex items-center gap-2 self-start sm:self-auto"
        >
          <Sliders size={14} />
          <span>Launch Pattern Studio</span>
        </Link>
      </div>

      {/* Pattern Type Filter Pills */}
      <div className="filter-pills flex flex-wrap gap-1.5">
        {(['all', 'dots', 'grid', 'stripes', 'waves', 'geometry', 'lines', 'shapes'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`filter-pill text-xs px-3 py-1.5 ${activeType === t ? 'active' : ''}`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Grid of Patterns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatterns.map((pat) => (
          <PatternCard key={pat.id} pattern={pat} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
};
